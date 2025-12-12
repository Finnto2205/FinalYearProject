import React, { useState } from 'react';
import './ScheduleView.css';

const ScheduleView = ({ scheduleData, onAutoSchedule, userRole, currentEmployee, isEditing, onToggleEdit, onScheduleChange }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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

  const employees = ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Brown', 'Emma Davis'];
  
  // Filter employees based on role
  const displayEmployees = userRole === 'admin' ? employees : [currentEmployee];

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
              >
                Auto-Generate Schedule
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
            {days.map(day => (
              <div key={day} className="dayHeader">{day}</div>
            ))}
          </div>

          {displayEmployees.map(employee => (
            <div key={employee} className="scheduleRow">
              {userRole === 'admin' && <div className="employeeCell">{employee}</div>}
              {days.map(day => (
                <div key={day} className="shiftCell">
                  {shifts.map((shift, idx) => {
                    const isAssigned = getShiftStatus(day, shift, employee);
                    return (
                      <div 
                        key={shift}
                        className={`shiftBadge ${isAssigned ? 'assigned' : 'unassigned'} ${isEditing && userRole === 'admin' ? 'editable' : ''}`}
                        onClick={() => handleShiftClick(day, shift, employee)}
                        title={isEditing && userRole === 'admin' ? 'Click to toggle' : ''}
                      >
                        {isAssigned ? shift.split(' ')[0] : '-'}
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
