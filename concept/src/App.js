import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import ScheduleView from './components/ScheduleView';
import TimeOffManagement from './components/TimeOffManagement';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleData, setScheduleData] = useState({});
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  // Fetch schedule data from backend
  const fetchScheduleData = async (week = 0) => {
    try {
      const response = await fetch(`${API_URL}/schedule/week/${week}`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      setScheduleData(prevData => ({
        ...prevData,
        [week]: data
      }));
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  // Fetch time off requests from backend
  const fetchTimeOffRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/timeoff/requests`);
      if (!response.ok) throw new Error('Failed to fetch time off requests');
      const data = await response.json();
      setTimeOffRequests(data);
    } catch (error) {
      console.error('Error fetching time off requests:', error);
    }
  };

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchScheduleData(0);
      fetchTimeOffRequests();
    }
  }, [isAuthenticated]);

  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login failed:', error);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleWeekChange = (week) => {
    // Fetch data for the selected week if not already loaded
    if (!scheduleData[week]) {
      fetchScheduleData(week);
    }
  };

  const handleScheduleChange = async (week, day, shift, employee, isAssigned) => {
    try {
      const response = await fetch(`${API_URL}/schedule/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          week,
          day,
          shift,
          employeeName: employee,
          isAssigned
        })
      });

      if (!response.ok) throw new Error('Failed to update schedule');

      // Update local state
      setScheduleData(prevData => {
        const newData = { ...prevData };
        if (!newData[week]) newData[week] = {};
        if (!newData[week][day]) newData[week][day] = {};
        if (!newData[week][day][shift]) newData[week][day][shift] = [];

        if (isAssigned) {
          newData[week][day][shift] = newData[week][day][shift].filter(emp => emp !== employee);
        } else {
          newData[week][day][shift] = [...newData[week][day][shift], employee];
        }

        return newData;
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      // Refresh schedule if update fails
      fetchScheduleData(week);
    }
  };

  const handleAutoSchedule = async (week) => {
    setScheduling(true);
    try {
      const response = await fetch(`${API_URL}/schedule/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate schedule');
      }
      const generated = await response.json();

      // helper maps to convert scheduler output (short codes) to the labels used by our UI/DB
      const dayMap = {
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday',
        Sun: 'Sunday'
      };
      const shiftMap = {
        Morning: 'Morning (7AM-11AM)',
        Afternoon: 'Afternoon (12PM-8PM)',
        Evening: 'Night (4PM-12AM)'
      };

      // transform array of assignments into nested object shape
      setScheduleData(prevData => {
        const newData = { ...prevData };
        newData[week] = {};
        generated.forEach(item => {
          const rawDay = item.day;
          const rawShift = item.shift;
          const employee = item.employee_name;
          const dayFull = dayMap[rawDay] || rawDay;
          const shiftFull = shiftMap[rawShift] || rawShift;

          if (!newData[week][dayFull]) newData[week][dayFull] = {};
          if (!newData[week][dayFull][shiftFull]) newData[week][dayFull][shiftFull] = [];
          newData[week][dayFull][shiftFull].push(employee);
        });
        return newData;
      });

      // also persist to backend schedules table (use mapped values)
      generated.forEach(item => {
        const rawDay = item.day;
        const rawShift = item.shift;
        const employee = item.employee_name;
        const dayFull = dayMap[rawDay] || rawDay;
        const shiftFull = shiftMap[rawShift] || rawShift;

        fetch(`${API_URL}/schedule/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            week,
            day: dayFull,
            shift: shiftFull,
            employeeName: employee,
            isAssigned: false // false because we are assigning
          })
        }).catch(err => console.error('Error saving generated shift', err));
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to auto-generate schedule. See console for details.');
    } finally {
      setScheduling(false);
    }
  };

  const handleRequestTimeOff = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/timeoff/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName: user?.employeeName || 'Current User',
          startDate: formData.startDate,
          endDate: formData.endDate,
          type: formData.type,
          reason: formData.reason
        })
      });

      if (!response.ok) throw new Error('Failed to create time off request');

      // Refresh time off requests
      fetchTimeOffRequests();
    } catch (error) {
      console.error('Error creating time off request:', error);
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      const response = await fetch(`${API_URL}/timeoff/approve/${id}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to approve request');

      // Update local state
      setTimeOffRequests(timeOffRequests.map(req =>
        req.id === id ? { ...req, status: 'approved' } : req
      ));
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleDenyRequest = async (id) => {
    try {
      const response = await fetch(`${API_URL}/timeoff/deny/${id}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to deny request');

      // Update local state
      setTimeOffRequests(timeOffRequests.map(req =>
        req.id === id ? { ...req, status: 'denied' } : req
      ));
    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="App">
      <header className="appHeader">
        <div className="headerContent">
          <div className="headerLeft">
            <h1>Rota Management System</h1>
            <p>Employee Scheduling & Time Off Management - Proof of Concept</p>
          </div>
          <div className="headerRight">
            <div className="userInfo">
              <span className="userName">{user?.fullName}</span>
              <span className={`userRole ${user?.role}`}>{user?.role?.toUpperCase()}</span>
            </div>
            <button className="logoutButton" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="appNavbar">
        <button
          className={`navTab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          {user?.role === 'admin' ? 'Schedule View' : 'My Schedule'}
        </button>
        <button
          className={`navTab ${activeTab === 'timeoff' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeoff')}
        >
          {user?.role === 'admin' ? 'Time Off Management' : 'Request Time Off'}
        </button>
      </nav>

      <main className="contents">
        {activeTab === 'schedule' && (
          <ScheduleView
            scheduleData={scheduleData}
            onAutoSchedule={handleAutoSchedule}
            userRole={user?.role}
            currentEmployee={user?.employeeName}
            isEditing={isEditing}
            onToggleEdit={handleToggleEdit}
            onScheduleChange={handleScheduleChange}
            onWeekChange={handleWeekChange}
            apiUrl={API_URL}
            scheduling={scheduling}
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

      <footer className="appFooter">
        <p>Rota Management System - Proof of Concept © 2026 | Mock Data Demo</p>
      </footer>
    </div>
  );
}

export default App;
