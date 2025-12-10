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
    <div className="time-off-management">
      <div className="time-off-header">
        <h2>{userRole === 'admin' ? 'Time Off Management' : 'My Time Off Requests'}</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowRequestForm(!showRequestForm)}
        >
          {showRequestForm ? 'Cancel' : '+ Request Time Off'}
        </button>
      </div>

      {showRequestForm && (
        <div className="request-form-container">
          <h3>New Time Off Request</h3>
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
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

            <div className="form-group">
              <label>Reason (Optional)</label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Provide additional details..."
                rows="3"
              />
            </div>

            <button type="submit" className="btn-primary">
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="requests-list">
        <h3>{userRole === 'admin' ? 'All Time Off Requests' : 'My Requests'}</h3>
        
        {userRole === 'admin' && (
          <div className="filter-tabs">
            <button className="tab active">All Requests</button>
            <button className="tab">Pending</button>
            <button className="tab">Approved</button>
            <button className="tab">Denied</button>
          </div>
        )}

        <div className="requests-table">
          {displayRequests.length === 0 ? (
            <div className="empty-state">
              <p>No time off requests yet. Click "Request Time Off" to create one.</p>
            </div>
          ) : (
            displayRequests.map(request => {
              return (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div>
                      {userRole === 'admin' && <h4>{request.employee}</h4>}
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="request-type">{request.type}</span>
                  </div>
                  
                  <div className="request-details">
                    <div className="detail-item">
                      <strong>Dates:</strong> {request.startDate} to {request.endDate}
                    </div>
                    {request.reason && (
                      <div className="detail-item">
                        <strong>Reason:</strong> {request.reason}
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>Requested on:</strong> {request.requestedDate}
                    </div>
                  </div>

                  {request.status === 'pending' && userRole === 'admin' && (
                    <div className="request-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => onApproveRequest(request.id)}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        className="btn-deny"
                        onClick={() => onDenyRequest(request.id)}
                      >
                        ✗ Deny
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
        <div className="time-off-summary">
          <h3>Summary Dashboard</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-value">{timeOffRequests.filter(r => r.status === 'pending').length}</div>
              <div className="summary-label">Pending Requests</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{timeOffRequests.filter(r => r.status === 'approved').length}</div>
              <div className="summary-label">Approved</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">87%</div>
              <div className="summary-label">Coverage Rate</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">2</div>
              <div className="summary-label">Conflicts Detected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOffManagement;
