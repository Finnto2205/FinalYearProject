import json
import mysql.connector
from ortools.sat.python import cp_model
from datetime import date, datetime, timedelta

def get_week_dates(start_date):
    # start_date is a datetime.date object (e.g., Monday)
    return [start_date + timedelta(days=i) for i in range(7)]


def get_week_start_date(week_offset=0):
    today = date.today()
    current_monday = today - timedelta(days=today.weekday())
    return current_monday + timedelta(days=7 * week_offset)


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
    cursor.execute(
        "SELECT employee_name, available_shifts FROM users WHERE role <> 'admin'"
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

def generate_schedule(employees, time_off, week_offset=0):
    model = cp_model.CpModel()

    # full seven‑day week; weekdays will later be restricted
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    shifts = ["Morning", "Afternoon", "Evening"]

    num_employees = len(employees)
    start_date = get_week_start_date(week_offset)
    week_dates = get_week_dates(start_date)

    # Build a quick lookup so time off records can be mapped to employee index.
    name_to_employee_index = {
        emp.get("employee_name"): idx
        for idx, emp in enumerate(employees)
    }

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
    # (Mon–Thu Afternoon is a banned shift, so skip it.)
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
    # CONSTRAINT 2c:
    # Require exactly 2 staff on Morning and Night (Evening) every day.
    # -------------------------
    morning_index = shifts.index("Morning")
    evening_index = shifts.index("Evening")
    for d in range(len(days)):
        model.Add(
            sum(shifts_vars[(e, d, morning_index)] for e in range(num_employees)) == 2
        )
        model.Add(
            sum(shifts_vars[(e, d, evening_index)] for e in range(num_employees)) == 2
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
    # Minimum 2 days off per week per employee.
    # Since max one shift/day is enforced above, this is equivalent to
    # at most 5 worked days (shifts) in a 7-day week.
    # -------------------------
    for e in range(num_employees):
        model.Add(
            sum(shifts_vars[(e, d, s)]
                for d in range(len(days))
                for s in range(len(shifts))) <= 5
        )

    # -------------------------
    # CONSTRAINT 4:
    # Enforce approved booked time off (employee cannot be assigned on leave days)
    # -------------------------
    week_dates_set = set(week_dates)
    for request in time_off:
        employee_name = request.get("employee_name")
        employee_index = name_to_employee_index.get(employee_name)

        if employee_index is None:
            continue

        start = request.get("start_date")
        end = request.get("end_date")
        if isinstance(start, datetime):
            start = start.date()
        if isinstance(end, datetime):
            end = end.date()
        if start is None or end is None:
            continue

        # Block every shift on each day that overlaps this generated week.
        current_date = start
        while current_date <= end:
            if current_date in week_dates_set:
                day_index = (current_date - start_date).days
                for s in range(len(shifts)):
                    model.Add(shifts_vars[(employee_index, day_index, s)] == 0)
            current_date += timedelta(days=1)

    # -------------------------
    # CONSTRAINT 4b:
    # Respect employee availability for each shift.
    # -------------------------
    for e, emp in enumerate(employees):
        available = emp.get('available_shifts') or ['Morning', 'Afternoon', 'Evening']
        if isinstance(available, str):
            try:
                available = json.loads(available)
            except Exception:
                available = ['Morning', 'Afternoon', 'Evening']

        for d in range(len(days)):
            for s in range(len(shifts)):
                if shifts[s] not in available:
                    model.Add(shifts_vars[(e, d, s)] == 0)

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
                    shift_date = week_dates[d]
                    schedule_output.append({
                        "employee_name": employees[e].get("employee_name"),
                        "date": shift_date.strftime("%Y-%m-%d"),
                        "day": full_day_map.get(days[d], days[d]),
                        "shift": full_shift_map.get(shifts[s], shifts[s])
                    })

    return schedule_output


# -------------------------
# MAIN EXECUTION
# -------------------------

if __name__ == "__main__":
    import sys
    week_arg = 0
    if len(sys.argv) > 1:
        week_arg = int(sys.argv[1])
        print(f"Scheduler invoked for week {week_arg}", file=sys.stderr)

    employees, time_off = fetch_data()

    schedule = generate_schedule(employees, time_off, week_arg)
    print(json.dumps(schedule))