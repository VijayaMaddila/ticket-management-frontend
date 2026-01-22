import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = storedUser?.token;

  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
    fetchTickets();
  }, [token]);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(await res.json());
    } catch {
      setError("Failed to load users");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(await res.json());
    } catch {
      setError("Failed to load tickets");
    }
  };

  const updateRole = async (id, role) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${id}/role?role=${role}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setSuccess("Role updated successfully");
      fetchUsers();
    } catch {
      setError("Role update failed");
    }
  };

  const assignTicket = async () => {
    if (!selectedTicket || !selectedUser) {
      setError("Please select ticket and data member");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${selectedTicket}/assign/${selectedUser}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error();
      setSuccess("Ticket assigned successfully");
      setSelectedTicket("");
      setSelectedUser("");
      fetchTickets();
    } catch {
      setError("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header-bar">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Back
          </button>
          <div className="header-title-group">
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Manage users and assignments</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{users.length}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <span className="stat-label">Open Tickets</span>
              <span className="stat-value">{tickets.filter(t => t.status === "OPEN").length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-container">
        {error && (
          <div className="alert error">
            <span className="alert-icon">✕</span>
            <div className="alert-content">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="alert success">
            <span className="alert-icon">✓</span>
            <div className="alert-content">
              <strong>Success</strong>
              <p>{success}</p>
            </div>
          </div>
        )}
        {/* Users Management Section */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Users Management</h2>
              <p className="section-subtitle">Manage user roles and permissions</p>
            </div>
            <span className="user-count">{users.length} users</span>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    <span className="th-content">Name</span>
                  </th>
                  <th>
                    <span className="th-content">Email</span>
                  </th>
                  <th>
                    <span className="th-content">Current Role</span>
                  </th>
                  <th>
                    <span className="th-content">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-message">
                      <div className="empty-state">
                        <span className="empty-icon">-</span>
                        <p>No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="table-row">
                      <td className="user-name-cell">
                        <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                        <span className="user-name">{u.name}</span>
                      </td>
                      <td className="email-cell">
                        <span className="email-badge">{u.email}</span>
                      </td>
                      <td>
                        <span className={`role-badge ${u.role.toLowerCase()}`}>
                          {u.role.toLowerCase()}
                        </span>
                      </td>
                      <td>
                        <select
                          className="role-select"
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                        >
                          <option value="REQUESTER">Requester</option>
                          <option value="DATAMEMBER">Data Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Ticket Assignment Section */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Assign Ticket</h2>
              <p className="section-subtitle">Assign open tickets to data members</p>
            </div>
          </div>
          <div className="assign-container">
            <div className="assign-form">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">T</span>
                  Select Open Ticket
                </label>
                <div className="ticket-select-wrapper">
                  <select
                    className="form-select"
                    value={selectedTicket}
                    onChange={(e) => setSelectedTicket(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Choose a ticket...</option>
                    {tickets
                      .filter((t) => t.status === "OPEN")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          #{t.id} - {t.title} (by {t.requester?.name || "Unknown"})
                        </option>
                      ))}
                  </select>
                </div>
                <small style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                  {tickets.filter(t => t.status === "OPEN").length} open tickets available
                </small>
              </div>

              {selectedTicket && (
                <div className="ticket-preview-card">
                  {(() => {
                    const selectedTicketData = tickets.find(t => t.id === parseInt(selectedTicket));
                    if (!selectedTicketData) return null;
                    return (
                      <>
                        <div className="ticket-preview-header">
                          <div className="ticket-preview-id">#{selectedTicketData.id}</div>
                          <div className="ticket-preview-badges">
                            <span className={`badge-mini priority-${selectedTicketData.priority.toLowerCase()}`}>
                              {selectedTicketData.priority}
                            </span>
                            <span className={`badge-mini status-${selectedTicketData.status.toLowerCase()}`}>
                              {selectedTicketData.status}
                            </span>
                          </div>
                        </div>
                        <div className="ticket-preview-title">{selectedTicketData.title}</div>
                        <div className="ticket-preview-requester">
                          <span className="requester-avatar">{selectedTicketData.requester?.name?.charAt(0).toUpperCase() || "?"}</span>
                          <div className="requester-info">
                            <div className="requester-name">{selectedTicketData.requester?.name || "Unknown"}</div>
                            <div className="requester-email">{selectedTicketData.requester?.email || "-"}</div>
                          </div>
                        </div>
                        {selectedTicketData.requestedDataset && (
                          <div className="ticket-preview-dataset">
                            <span className="dataset-icon">D</span>
                            <span className="dataset-name">{selectedTicketData.requestedDataset}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">M</span>
                  Select Data Member
                </label>
                <select
                  className="form-select"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Choose a data member...</option>
                  {users
                    .filter((u) => u.role.toLowerCase() === "datamember")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                </select>
                <small style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                  {users.filter(u => u.role.toLowerCase() === "datamember").length} members ready
                </small>
              </div>

              <button
                className="btn-assign"
                onClick={assignTicket}
                disabled={loading || !selectedTicket || !selectedUser}
              >
                {loading ? "Assigning..." : "Assign Ticket"}
              </button>
            </div>

            <div className="assign-info">
              <div className="info-box">
                <span className="info-icon">i</span>
                <div className="info-text">
                  <p className="info-title">Assignment Process</p>
                  <ul className="info-list">
                    <li>Select an open ticket</li>
                    <li>Choose a data member</li>
                    <li>Click assign to process</li>
                  </ul>
                </div>
              </div>

              <div className="assignment-stats">
                <div className="stat-box">
                  <span className="stat-box-icon">✓</span>
                  <div>
                    <p className="stat-box-label">Available Members</p>
                    <p className="stat-box-value">{users.filter(u => u.role.toLowerCase() === "datamember").length}</p>
                  </div>
                </div>
                <div className="stat-box">
                  <span className="stat-box-icon">T</span>
                  <div>
                    <p className="stat-box-label">Ready to Assign</p>
                    <p className="stat-box-value">{tickets.filter(t => t.status === "OPEN").length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
