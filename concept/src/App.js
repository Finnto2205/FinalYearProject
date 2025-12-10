import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import ScheduleView from './components/ScheduleView';
import TimeOffManagement from './components/TimeOffManagement';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    0: {
      'Monday': {
        'Morning (7AM-11AM)': ['Alice Johnson', 'Bob Smith'],
        'Afternoon (12PM-8PM)': ['Carol White', 'David Brown'],
        'Night (4PM-12AM)': ['Emma Davis']
      },
      'Tuesday': {
        'Morning (7AM-11AM)': ['Bob Smith', 'Carol White'],
        'Afternoon (12PM-8PM)': ['Alice Johnson', 'Emma Davis'],
        'Night (4PM-12AM)': ['David Brown']
      },
      'Wednesday': {
        'Morning (7AM-11AM)': ['Carol White', 'David Brown'],
        'Afternoon (12PM-8PM)': ['Bob Smith', 'Emma Davis'],
        'Night (4PM-12AM)': ['Alice Johnson']
      },
      'Thursday': {
        'Morning (7AM-11AM)': ['David Brown', 'Emma Davis'],
        'Afternoon (12PM-8PM)': ['Carol White', 'Alice Johnson'],
        'Night (4PM-12AM)': ['Bob Smith']
      },
      'Friday': {
        'Morning (7AM-11AM)': ['Emma Davis', 'Alice Johnson'],
        'Afternoon (12PM-8PM)': ['David Brown', 'Bob Smith'],
        'Night (4PM-12AM)': ['Carol White']
      },
      'Saturday': {
        'Morning (7AM-11AM)': ['Alice Johnson', 'Carol White'],
        'Afternoon (12PM-8PM)': ['Bob Smith', 'Emma Davis'],
        'Night (4PM-12AM)': ['David Brown']
      },
      'Sunday': {
        'Morning (7AM-11AM)': ['Bob Smith', 'David Brown'],
        'Afternoon (12PM-8PM)': ['Emma Davis', 'Carol White'],
        'Night (4PM-12AM)': ['Alice Johnson']
      }
    }
  });

  const [timeOffRequests, setTimeOffRequests] = useState([
    {
      id: 1,
      employee: 'Alice Johnson',
      startDate: '2025-12-15',
      endDate: '2025-12-17',
      type: 'vacation',
      reason: 'Family holiday',
      status: 'pending',
      requestedDate: '2025-12-05'
    },
    {
      id: 2,
      employee: 'Bob Smith',
      startDate: '2025-12-20',
      endDate: '2025-12-22',
      type: 'sick',
      reason: 'Medical appointment',
      status: 'approved',
      requestedDate: '2025-12-03'
    },
    {
      id: 3,
      employee: 'Carol White',
      startDate: '2025-12-18',
      endDate: '2025-12-18',
      type: 'personal',
      reason: '',
      status: 'pending',
      requestedDate: '2025-12-08'
    }
  ]);

  const handleLogin = (username, password) => {
    // Simple authentication check
    if (username === 'admin' && password === 'admin123') {
      setUser({ username: 'admin', role: 'admin', fullName: 'Administrator', employeeName: 'Administrator' });
      setIsAuthenticated(true);
      return true;
    } else if (username === 'user' && password === 'user123') {
      setUser({ username: 'user', role: 'user', fullName: 'Regular User', employeeName: 'Alice Johnson' });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleScheduleChange = (week, day, shift, employee, isAssigned) => {
    setScheduleData(prevData => {
      const newData = { ...prevData };
      
      // Initialize week if it doesn't exist
      if (!newData[week]) {
        newData[week] = {};
      }
      
      // Initialize day if it doesn't exist
      if (!newData[week][day]) {
        newData[week][day] = {};
      }
      
      // Initialize shift if it doesn't exist
      if (!newData[week][day][shift]) {
        newData[week][day][shift] = [];
      }
      
      // Toggle employee assignment
      if (isAssigned) {
        // Remove employee from shift
        newData[week][day][shift] = newData[week][day][shift].filter(emp => emp !== employee);
      } else {
        // Add employee to shift
        newData[week][day][shift] = [...newData[week][day][shift], employee];
      }
      
      return newData;
    });
  };

  const handleAutoSchedule = (week) => {
    alert(`Auto-generating schedule for Week ${week + 1}...\nThis would use automated logic to assign shifts based on availability, preferences, and fairness.`);
  };

  const handleRequestTimeOff = (formData) => {
    const newRequest = {
      id: timeOffRequests.length + 1,
      employee: user?.employeeName || 'Current User',
      startDate: formData.startDate,
      endDate: formData.endDate,
      type: formData.type,
      reason: formData.reason,
      status: 'pending',
      requestedDate: new Date().toISOString().split('T')[0]
    };
    setTimeOffRequests([newRequest, ...timeOffRequests]);
  };

  const handleApproveRequest = (id) => {
    setTimeOffRequests(timeOffRequests.map(req => 
      req.id === id ? { ...req, status: 'approved' } : req
    ));
  };

  const handleDenyRequest = (id) => {
    setTimeOffRequests(timeOffRequests.map(req => 
      req.id === id ? { ...req, status: 'denied' } : req
    ));
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Rota Management System</h1>
            <p>Employee Scheduling & Time Off Management - Proof of Concept</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.fullName}</span>
              <span className={`user-role ${user?.role}`}>{user?.role?.toUpperCase()}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
           {user?.role === 'admin' ? 'Schedule View' : 'My Schedule'}
        </button>
        <button 
          className={`nav-tab ${activeTab === 'timeoff' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeoff')}
        >
           {user?.role === 'admin' ? 'Time Off Management' : 'Request Time Off'}
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'schedule' && (
          <ScheduleView 
            scheduleData={scheduleData}
            onAutoSchedule={handleAutoSchedule}
            userRole={user?.role}
            currentEmployee={user?.employeeName}
            isEditing={isEditing}
            onToggleEdit={handleToggleEdit}
            onScheduleChange={handleScheduleChange}
          />
        )}
        {activeTab === 'timeoff' && (
          <TimeOffManagement 
            timeOffRequests={timeOffRequests}
            onRequestTimeOff={handleRequestTimeOff}
            onApproveRequest={handleApproveRequest}
            onDenyRequest={handleDenyRequest}
            userRole={user?.role}
            currentEmployee={user?.employeeName}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Rota Management System - Proof of Concept © 2025 | Mock Data Demo</p>
      </footer>
    </div>
  );
}

export default App;
