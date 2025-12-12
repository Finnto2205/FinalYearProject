import React, { useState } from 'react';
import './TimeOffManagement.css';

const TimeOffManagement = ({ timeOffRequests, onRequestTimeOff, onApproveRequest, onDenyRequest, userRole, currentEmployee }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  // Filter requests based on role
  const displayRequests = userRole === 'admin' 
    ? timeOffRequests 
    : timeOffRequests.filter(req => req.employee === currentEmployee);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'vacation'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onRequestTimeOff(formData);
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      type: 'vacation'
    });
    setShowRequestForm(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'denied': return 'status-denied';
      case 'pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="timeOffManagement">
      <div className="timeOffHeader">
        <h2>{userRole === 'admin' ? 'Time Off Management' : 'My Time Off Requests'}</h2>
        <button 
          className="requestButton"
          onClick={() => setShowRequestForm(!showRequestForm)}
        >
          {showRequestForm ? 'Cancel' : '+ Request Time Off'}
        </button>
      </div>

      {showRequestForm && (
        <div className="requestFormContainer">
          <h3>New Time Off Request</h3>
          <form onSubmit={handleSubmit} className="requestForm">
            <div className="formRow">
              <div className="formGroup">
                <label>Start Date</label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>

              <div className="formGroup">
                <label>End Date</label>
                <input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="formGroup">
              <label>Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="formGroup">
              <label>Reason (Optional)</label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Provide additional details..."
                rows="3"
              />
            </div>

            <button type="submit" className="requestButton">
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="requestList">
        <h3>{userRole === 'admin' ? 'All Time Off Requests' : 'My Requests'}</h3>
        
        {userRole === 'admin' && (
          <div className="filterTabs">
            <button className="tab active">All Requests</button>
            <button className="tab">Pending</button>
            <button className="tab">Approved</button>
            <button className="tab">Denied</button>
          </div>
        )}

        <div className="requestTable">
          {displayRequests.length === 0 ? (
            <div className="emptyState">
              <p>No time off requests yet. Click "Request Time Off" to create one.</p>
            </div>
          ) : (
            displayRequests.map(request => {
              return (
                <div key={request.id} className="requestCard">
                  <div className="requestHeader">
                    <div>
                      {userRole === 'admin' && <h4>{request.employee}</h4>}
                      <span className={`statusBadge ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="requestType">{request.type}</span>
                  </div>
                  
                  <div className="requestDetails">
                    <div className="detailItem">
                      <strong>Dates:</strong> {request.startDate} to {request.endDate}
                    </div>
                    {request.reason && (
                      <div className="detailItem">
                        <strong>Reason:</strong> {request.reason}
                      </div>
                    )}
                    <div className="detailItem">
                      <strong>Requested on:</strong> {request.requestedDate}
                    </div>
                  </div>

                  {request.status === 'pending' && userRole === 'admin' && (
                    <div className="requestActions">
                      <button 
                        className="approveButton"
                        onClick={() => onApproveRequest(request.id)}
                      >
                       Approve
                      </button>
                      <button 
                        className="denyButton"
                        onClick={() => onDenyRequest(request.id)}
                      >
                         Deny
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="timeOffSummary">
          <h3>Summary Dashboard</h3>
          <div className="summaryCards">
            <div className="summaryCard">
              <div className="summaryValue">{timeOffRequests.filter(r => r.status === 'pending').length}</div>
              <div className="summaryLabel">Pending Requests</div>
            </div>
            <div className="summaryCard">
              <div className="summaryValue">{timeOffRequests.filter(r => r.status === 'approved').length}</div>
              <div className="summaryLabel">Approved</div>
            </div>
            <div className="summaryCard">
              <div className="summaryValue">87%</div>
              <div className="summaryLabel">Coverage Rate</div>
            </div>
            <div className="summaryCard">
              <div className="summaryValue">2</div>
              <div className="summaryLabel">Conflicts Detected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOffManagement;
