import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";

  
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchTickets = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/tickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tickets");
        const data = await res.json();
        setTickets(data);
        setFilteredTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, navigate]);


  useEffect(() => {
    let filtered = [...tickets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id?.toString().includes(term) ||
          t.title?.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (t) => t.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(
        (t) => t.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    if (requestTypeFilter) {
      filtered = filtered.filter(
        (t) => t.request_type?.toLowerCase() === requestTypeFilter.toLowerCase()
      );
    }

    if (assignedFilter) {
      filtered = filtered.filter(
        (t) =>
          (t.assignedTo?.name || "Unassigned").toLowerCase() ===
          assignedFilter.toLowerCase()
      );
    }

    setFilteredTickets(filtered);
  }, [
    tickets,
    searchTerm,
    statusFilter,
    priorityFilter,
    requestTypeFilter,
    assignedFilter,
  ]);


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "high":
        return "#f44336";
      case "critical":
        return "#d50000";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "#2196f3";
      case "in_progress":
        return "#ffc107";
      case "on_hold":
        return "#9c27b0";
      case "completed":
        return "#4caf50";
      case "rejected":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading tickets...
      </p>
    );
  if (error)
    return (
      <p style={{ textAlign: "center", color: "red", marginTop: "50px" }}>
        {error}
      </p>
    );

  const assignedUsers = [
    ...new Set(tickets.map((t) => t.assignedTo?.name || "Unassigned")),
  ];
  const priorities = [...new Set(tickets.map((t) => t.priority))];
  const requestTypes = [...new Set(tickets.map((t) => t.request_type))];
  const statuses = [...new Set(tickets.map((t) => t.status))];

  return (
    <div
      style={{
        padding: "20px 30px",
        fontFamily: "'Segoe UI', sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(to right, #ece9e6, #ffffff)",
      }}
    >
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ margin: 0, color: "#2c3e50" }}>Tickets Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "#e74c3c",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
          {role === "requester" && (
            <button 
              onClick={() => navigate("/create-ticket")}
              style={{ cursor: "pointer" }}
            >
              Create Ticket
            </button>
          )}
          {role === "admin" && (
            <button 
              onClick={() => navigate("/admin")}
              style={{ cursor: "pointer" }}
            >
              Admin Panel
            </button>
          )}
          {role === "datamember" && (
            <button 
              onClick={() => navigate("/assigned-tickets")}
              style={{ cursor: "pointer" }}
            >
              My Tickets
            </button>
          )}
        </div>
      </div>

      
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "25px",
        }}
      >
        <input
          type="text"
          placeholder="Search by ID or Title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1 1 200px",
            padding: "10px",
            borderRadius: "25px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "25px" }}
        >
          <option value="">All Status</option>
          {statuses.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "25px" }}
        >
          <option value="">All Priority</option>
          {priorities.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={requestTypeFilter}
          onChange={(e) => setRequestTypeFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "25px" }}
        >
          <option value="">All Request Types</option>
          {requestTypes.map((r, i) => (
            <option key={i} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "25px" }}
        >
          <option value="">All Assigned Users</option>
          {assignedUsers.map((u, i) => (
            <option key={i} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "#2c3e50",
                  fontWeight: "600",
                }}
              >
                {ticket.title}
              </h3>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: getPriorityColor(ticket.priority),
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                {ticket.priority}
              </span>
            </div>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#555" }}>
              ID: {ticket.id}
            </p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#555" }}>
              Type: {ticket.requestType}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "15px",
              }}
            >
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: getStatusColor(ticket.status),
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                {ticket.status}
              </span>
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  background: "#3498db",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {ticket.assignedTo?.name?.charAt(0).toUpperCase() || "—"}
              </div>
            </div>
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              {(role === "admin" || role === "requester") && (
                <button
                  style={{ flex: 1, padding: "6px", borderRadius: "8px", cursor: "pointer" }}
                  onClick={() => navigate(`/ticket/${ticket.id}`)}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
