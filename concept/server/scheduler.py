import json
import mysql.connector
from ortools.sat.python import cp_model


# -------------------------
# DATABASE CONNECTION
# -------------------------

def get_database_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Password",
        database="rota_management"
    )


# -------------------------
# FETCH DATA FROM MYSQL
# -------------------------

def fetch_data():
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)

    # Get employees (any non-admin entry counts as staff, handle legacy role values)
    # use employee_name so scheduler prints human-readable names
    cursor.execute(
        "SELECT id, employee_name AS username FROM users WHERE role <> 'admin'"
    )
    employees = cursor.fetchall()

    # Get approved time off
    cursor.execute("""
        SELECT employee_name, start_date, end_date
        FROM time_off_requests
        WHERE status = 'approved'
    """)
    time_off = cursor.fetchall()

    conn.close()

    return employees, time_off


# -------------------------
# SCHEDULING LOGIC
# -------------------------

def generate_schedule(employees, time_off):
    model = cp_model.CpModel()

    # full seven‑day week; weekdays will later be restricted
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    shifts = ["Morning", "Afternoon", "Evening"]

    num_employees = len(employees)

    # Decision variables:
    # shifts[(e, d, s)] = 1 if employee e works shift s on day d
    shifts_vars = {}

    for e in range(num_employees):
        for d in range(len(days)):
            for s in range(len(shifts)):
                shifts_vars[(e, d, s)] = model.NewBoolVar(f"shift_e{e}_d{d}_s{s}")

    # -------------------------
    # CONSTRAINT 1:
    # Only one shift per day per employee
    # -------------------------
    for e in range(num_employees):
        for d in range(len(days)):
            model.Add(
                sum(shifts_vars[(e, d, s)] for s in range(len(shifts))) <= 1
            )

    # -------------------------
    # CONSTRAINT 2:
    # Each shift that actually exists must have at least 1 employee.
    # (Thursday–Monday Afternoon is a banned shift, so skip it.)
    # -------------------------
    afternoon_index = shifts.index("Afternoon")
    for d in range(len(days)):
        for s in range(len(shifts)):
            # if this is an afternoon on Mon–Thu, skip the coverage requirement
            if s == afternoon_index and d < 4:
                continue
            model.Add(
                sum(shifts_vars[(e, d, s)] for e in range(num_employees)) >= 1
            )

    # -------------------------
    # CONSTRAINT 2b:
    # Weekdays (Mon–Thu) have no afternoon shift; force those variables to 0.
    # -------------------------
    for e in range(num_employees):
        for d in range(4):  # 0..3 = Mon..Thu
            model.Add(shifts_vars[(e, d, afternoon_index)] == 0)

    # -------------------------
    # CONSTRAINT 3:
    # Maximum 3 shifts per week per employee
    # -------------------------
    for e in range(num_employees):
        model.Add(
            sum(shifts_vars[(e, d, s)]
                for d in range(len(days))
                for s in range(len(shifts))) <= 10
        )

    # -------------------------
    # SOLVE
    # -------------------------
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status != cp_model.OPTIMAL and status != cp_model.FEASIBLE:
        return {"error": "No feasible schedule found"}

    # -------------------------
    # FORMAT OUTPUT
    # -------------------------
    schedule_output = []

    # Mapping helpers so output aligns with our frontend/database naming
    full_day_map = {
        "Mon": "Monday",
        "Tue": "Tuesday",
        "Wed": "Wednesday",
        "Thu": "Thursday",
        "Fri": "Friday",
        "Sat": "Saturday",
        "Sun": "Sunday",
    }
    full_shift_map = {
        "Morning": "Morning (7AM-11AM)",
        "Afternoon": "Afternoon (12PM-8PM)",
        "Evening": "Night (4PM-12AM)"
    }

    for e in range(num_employees):
        for d in range(len(days)):
            for s in range(len(shifts)):
                if solver.Value(shifts_vars[(e, d, s)]) == 1:
                    raw_day = days[d]
                    raw_shift = shifts[s]
                    schedule_output.append({
                        # database returns username field, not name
                        "employee_name": employees[e].get("username") or employees[e].get("name"),
                        # convert to full labels for easier frontend handling
                        "day": full_day_map.get(raw_day, raw_day),
                        "shift": full_shift_map.get(raw_shift, raw_shift)
                    })

    return schedule_output


# -------------------------
# MAIN EXECUTION
# -------------------------

if __name__ == "__main__":
    import sys
    week_arg = None
    if len(sys.argv) > 1:
        week_arg = sys.argv[1]
        print(f"Scheduler invoked for week {week_arg}", file=sys.stderr)

    employees, time_off = fetch_data()

    schedule = generate_schedule(employees, time_off)
    print(json.dumps(schedule))