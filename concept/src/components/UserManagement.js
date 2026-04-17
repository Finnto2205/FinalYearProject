import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = ({ users, onCreateUser, onUpdateUser, onDeleteUser, refreshUsers }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    employeeName: '',
    role: 'staff',
    availableShifts: ['Morning', 'Afternoon', 'Evening']
  });
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const resetForm = () => {
    setEditingUserId(null);
    setAvailabilityOpen(false);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      employeeName: '',
      role: 'staff',
      availableShifts: ['Morning', 'Afternoon', 'Evening']
    });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.username || !formData.fullName || !formData.employeeName || !formData.role) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!Array.isArray(formData.availableShifts) || formData.availableShifts.length === 0) {
      setError('Please choose at least one available shift.');
      return;
    }

    try {
      if (editingUserId) {
        await onUpdateUser(editingUserId, formData);
        setMessage('User updated successfully.');
      } else {
        if (!formData.password) {
          setError('Password is required when creating a new user.');
          return;
        }
        await onCreateUser(formData);
        setMessage('User created successfully.');
      }
      resetForm();
    } catch (err) {
      setError(err.message || 'Unable to save user.');
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setAvailabilityOpen(false);
    setFormData({
      username: user.username,
      password: '',
      fullName: user.fullName,
      employeeName: user.employeeName,
      role: user.role,
      availableShifts: Array.isArray(user.available_shifts) && user.available_shifts.length > 0
        ? user.available_shifts
        : ['Morning', 'Afternoon', 'Evening']
    });
    setError('');
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await onDeleteUser(id);
      setMessage('User deleted successfully.');
    } catch (err) {
      setError(err.message || 'Unable to delete user.');
    }
  };

  return (
    <div className="userManagement container py-3">
      <div className="userManagementHeader mb-4">
        <h2>Admin User Management</h2>
      </div>

      <div className="row gx-4 gy-4">
        <section className="userFormSection col-12 col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h3>{editingUserId ? 'Edit User' : 'Add New User'}</h3>

              {message && <div className="alert alert-success mt-3">{message}</div>}
              {error && <div className="alert alert-danger mt-3">{error}</div>}

              <form onSubmit={handleSubmit} className="userForm mt-3">
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    className="form-control"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password {editingUserId ? '(leave blank to keep current)' : ''}</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUserId ? 'New password (optional)' : 'password'}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Employee Name</label>
                  <input
                    className="form-control"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    placeholder="Employee display name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Available Times</label>
                  <div className="dropdown">
                    <button
                      type="button"
                      className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                      onClick={() => setAvailabilityOpen(!availabilityOpen)}
                      aria-expanded={availabilityOpen}
                    >
                      {formData.availableShifts.length === 3
                        ? 'All shifts'
                        : formData.availableShifts.join(', ')}
                    </button>
                    {availabilityOpen && (
                      <div className="dropdown-menu show w-100 p-3">
                        {['Morning', 'Afternoon', 'Evening'].map((shift) => (
                          <div className="form-check" key={shift}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`avail-${shift}`}
                              checked={formData.availableShifts.includes(shift)}
                              onChange={() => {
                                const nextShifts = formData.availableShifts.includes(shift)
                                  ? formData.availableShifts.filter((value) => value !== shift)
                                  : [...formData.availableShifts, shift];
                                setFormData({ ...formData, availableShifts: nextShifts });
                              }}
                            />
                            <label className="form-check-label" htmlFor={`avail-${shift}`}>
                              {shift}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    {editingUserId ? 'Save Changes' : 'Create User'}
                  </button>
                  {editingUserId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="userListSection col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3>Existing Users</h3>
              {users.length === 0 ? (
                <div className="alert alert-secondary mt-3">No users found.</div>
              ) : (
                <div className="table-responsive mt-3">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Username</th>
                        <th>Full Name</th>
                        <th>Employee Name</th>
                        <th>Role</th>
                        <th>Availability</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.fullName}</td>
                          <td>{user.employeeName}</td>
                          <td>{user.role}</td>
                          <td>{(user.available_shifts || []).join(', ')}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-success me-2" onClick={() => handleEdit(user)}>
                              Edit
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserManagement;
