import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const OpenTickets = ({ setUser }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tickets");

      let data = await res.json();
      let openTickets = data.filter((t) => t.status?.toLowerCase() === "open");

      if (role === "requester") {
        openTickets = openTickets.filter((t) => t.requester?.id === user.id);
      }

      setTickets(openTickets);
      setFilteredTickets(openTickets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for assignment
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showAssignModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAssignModal]);

  // Assign ticket
  const assignTicket = async () => {
    if (!selectedTicket || !selectedUserId) return;
    setAssigning(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${selectedTicket.id}/assign/${selectedUserId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Assignment failed");

      await fetchTickets();
      setAssignSuccess("Assigned successfully");
      setTimeout(() => setAssignSuccess(""), 2000);
      setShowAssignModal(false);
      setSelectedUserId("");
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  // Filters
  useEffect(() => {
    const normalize = (v) => v?.toString().toLowerCase() || "";
    let result = [...tickets];

    if (searchTerm) {
      const term = normalize(searchTerm);
      result = result.filter(
        (t) =>
          normalize(t.id).includes(term) || normalize(t.title).includes(term)
      );
    }

    if (priorityFilter)
      result = result.filter(
        (t) => normalize(t.priority) === normalize(priorityFilter)
      );

    if (requestTypeFilter)
      result = result.filter(
        (t) => normalize(t.request_type) === normalize(requestTypeFilter)
      );

    setFilteredTickets(result);
  }, [tickets, searchTerm, priorityFilter, requestTypeFilter]);

  // Handle status update
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${ticketId}/status?status=${newStatus}&userId=${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      const updatedTicket = await res.json();
      setTickets((prev) =>
        prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
      );
      alert("Ticket status updated and emails sent!");
    } catch (err) {
      console.error(err);
      alert("Error updating ticket status");
    }
  };

  if (loading) return <p className="center-text">Loading tickets...</p>;
  if (error) return <p className="center-text error">{error}</p>;

  return (
    <div className="dashboard-wrapper">
      <div className="main-content">
        <main className="dashboard-content">
          <h2>Open Tickets</h2>
          <span className="ticket-count">{filteredTickets.length} Tickets</span>

          {/* Filters */}
          <div className="filter-bar">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search by ID or Title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              {[...new Set(tickets.map((t) => t.priority))].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              value={requestTypeFilter}
              onChange={(e) => setRequestTypeFilter(e.target.value)}
            >
              <option value="">All Request Types</option>
              {[...new Set(tickets.map((t) => t.request_type))].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Tickets Grid */}
          <div className="tickets-grid">
            {filteredTickets.length === 0 ? (
              <p className="center-text">No open tickets found</p>
            ) : (
              filteredTickets.map((ticket) => (
                <div className="ticket-card" key={ticket.id}>
                  <div className="ticket-header">
                    <span className="ticket-id">#{ticket.id}</span>
                    <span
                      className={`badge status ${ticket.status?.toLowerCase()}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-info">
                    <strong>Type:</strong> {ticket.request_type} <br />
                    <strong>Priority:</strong>{" "}
                    <span
                      className={`badge priority ${ticket.priority?.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                    <br />
                    <strong>Assigned To:</strong>{" "}
                    {ticket.assignedTo?.name || "Unassigned"}
                  </p>

                  {/* Status Update Dropdown */}
                  {role !== "requester" && (
                    <div className="status-update">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(ticket.id, e.target.value)
                        }
                      >
                        {["Open", "In Progress", "Resolved", "Closed"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  {/* Assign Button */}
                  {role !== "requester" && (
                    <button
                      className="assign-btn"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setSelectedUserId("");
                        setUserSearch("");
                        setShowAssignModal(true);
                      }}
                    >
                      Assign
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedTicket && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Ticket</h3>
              <button
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="assign-details">
                <div>
                  <p>
                    <strong>ID:</strong> #{selectedTicket.id}
                  </p>
                  <p>
                    <strong>Title:</strong> {selectedTicket.title}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedTicket.request_type}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Priority:</strong> {selectedTicket.priority}
                  </p>
                  <p>
                    <strong>Current:</strong>{" "}
                    {selectedTicket.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="assign-select">
                <input
                  type="text"
                  placeholder="Search user by name or email"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />

                <div className="user-list">
                  {users
                    .filter((u) => u.role?.toLowerCase() === "datamember")
                    .filter((u) =>
                      `${u.name} ${u.email}`
                        .toLowerCase()
                        .includes(userSearch.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u.id}
                        className={`user-row ${
                          selectedUserId === String(u.id) ? "selected" : ""
                        }`}
                        onClick={() => setSelectedUserId(String(u.id))}
                      >
                        <div className="avatar">{(u.name || "U").charAt(0)}</div>
                        <div className="user-meta">
                          <div className="user-name">{u.name}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                        <div className="user-role">{u.role}</div>
                      </div>
                    ))}
                  {users.filter((u) => u.role?.toLowerCase() === "datamember")
                    .length === 0 && (
                    <p className="center-text">No eligible assignees</p>
                  )}
                </div>
              </div>

              <div className="assign-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={assignTicket}
                  disabled={!selectedUserId || assigning}
                >
                  {assigning ? "Assigning…" : "Confirm Assignment"}
                </button>
              </div>

              {assignSuccess && <div className="success">{assignSuccess}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenTickets;
