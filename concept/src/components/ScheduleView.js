import React, { useState, useEffect } from 'react';
import './ScheduleView.css';

const ScheduleView = ({ scheduleData, onAutoSchedule, userRole, currentEmployee, isEditing, onToggleEdit, onScheduleChange, onWeekChange, apiUrl, scheduling }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Fetch data when week changes
  useEffect(() => {
    if (onWeekChange) {
      onWeekChange(selectedWeek);
    }
  }, [selectedWeek, onWeekChange]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const getWeekStartDate = (weekOffset) => {
    const now = new Date();
    const mondayBasedDay = (now.getDay() + 6) % 7; // Monday=0 ... Sunday=6
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - mondayBasedDay + (weekOffset * 7));
    return monday;
  };

  const weekStartDate = getWeekStartDate(selectedWeek);
  const dayColumns = days.map((day, index) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + index);

    return {
      day,
      dateLabel: date.toLocaleDateString('en-IE', {
        day: '2-digit',
        month: 'short'
      })
    };
  });
  const shifts = ['Morning (7AM-11AM)', 'Afternoon (12PM-8PM)', 'Night (4PM-12AM)'];

  const currentWeekData = scheduleData[selectedWeek] || {};

  const getShiftStatus = (day, shift, employee) => {
    const dayData = currentWeekData[day] || {};
    const shiftData = dayData[shift] || [];
    return shiftData.includes(employee);
  };

  const handleShiftClick = (day, shift, employee) => {
    if (userRole === 'admin' && isEditing) {
      const isAssigned = getShiftStatus(day, shift, employee);
      onScheduleChange(selectedWeek, day, shift, employee, isAssigned);
    }
  };

  const hasConflict = (day, shift) => {
    const dayData = currentWeekData[day] || {};
    const shiftData = dayData[shift] || [];
    return shiftData.length === 0 || shiftData.length > 3;
  };

  const [employees, setEmployees] = useState([]);
  const [employeesError, setEmployeesError] = useState(null);

  // load employee list from server once
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${apiUrl}/schedule/employees`);
        if (res.ok) {
          const list = await res.json();
          const names = [...new Set(list.map(e => e.employee_name))];
          setEmployees(names);
          console.log('employees fetched', names);
        } else {
          const msg = `Failed to load employees: ${res.status} ${res.statusText}`;
          console.error(msg);
          setEmployeesError(msg);
        }
      } catch (err) {
        console.error('Error fetching employees', err);
        setEmployeesError(err.message);
      }
    };
    // fetch regardless of role so we have full roster available
    fetchEmployees();
  }, [apiUrl]);

  // show all employees for admin; non-admin still sees only their own row
  const displayEmployees = userRole === 'admin' ? employees : [currentEmployee];

  if (employeesError) {
    return <div>Error loading employees: {employeesError}</div>;
  }
  if (employees.length === 0) {
    return <div>Loading employees or no staff defined</div>;
  }

  const getShiftTime = (shift) => {
    const match = shift.match(/\(([^)]+)\)/);
    return match ? match[1] : shift;
  };

  return (
    <div className="scheduleView">
      <div className="scheduleHeader">
        <h2>{userRole === 'admin' ? 'Weekly Schedule' : 'My Schedule'}</h2>
        <div className="scheduleControls">
          <button
            className="weekButton"
            onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            disabled={selectedWeek === 0}
          >
            ← Previous Week
          </button>
          <span className="week">Week {selectedWeek + 1}</span>
          <button
            className="weekButton"
            onClick={() => setSelectedWeek(selectedWeek + 1)}
          >
            Next Week →
          </button>
          {userRole === 'admin' && (
            <>
              <button
                className={`btn-${isEditing ? 'warning' : 'secondary'}`}
                onClick={onToggleEdit}
              >
                {isEditing ? 'Save Changes' : 'Edit Schedule'}
              </button>
              <button
                className="generateButton"
                onClick={() => onAutoSchedule(selectedWeek)}
                disabled={scheduling}
              >
                {scheduling ? 'Generating...' : 'Auto-Generate Schedule'}
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing && userRole === 'admin' && (
        <div className="editMode">
          <span>Edit Mode: Click on any shift to assign/unassign employees</span>
        </div>
      )}

      <div className="scheduleGrid">
        <div className="scheduleTable">
          <div className="scheduleHeaderRow">
            {userRole === 'admin' && <div className="employeeHeader">Employee</div>}
            {dayColumns.map(({ day, dateLabel }) => (
              <div key={day} className="dayHeader" title={day}>{dateLabel}</div>
            ))}
          </div>

          {displayEmployees.map(employee => (
            <div key={employee} className="scheduleRow">
              {userRole === 'admin' && <div className="employeeCell">{employee}</div>}
              {dayColumns.map(({ day }) => (
                <div key={day} className="shiftCell">
                  {shifts.map((shift) => {
                    const isAssigned = getShiftStatus(day, shift, employee);
                    return (
                      <div
                        key={shift}
                        className={`shiftBadge ${isAssigned ? 'assigned' : 'unassigned'} ${isEditing && userRole === 'admin' ? 'editable' : ''}`}
                        onClick={() => handleShiftClick(day, shift, employee)}
                        title={isEditing && userRole === 'admin' ? 'Click to toggle' : ''}
                      >
                        {isAssigned ? getShiftTime(shift) : '-'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="scheduleLegend">
          <h3>Schedule Status</h3>
          <div className="insights">
            <div className="insight">
              <span className="indicator success"></span>
              <span>Optimal Coverage: All shifts adequately staffed</span>
            </div>
            <div className="insight">
              <span className="indicator warning"></span>
              <span>Warning: Potential understaffing detected</span>
            </div>
            <div className="insight">
              <span className="indicator info"></span>
              <span>System considers: Time off requests, employee preferences, labor regulations</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
