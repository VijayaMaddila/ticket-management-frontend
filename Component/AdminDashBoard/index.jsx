import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [requestType, setRequestType] = useState("");

  const [comments, setComments] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const commentsRef = useRef(null);

  
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

        if (!res.ok) throw new Error("Unable to load tickets");

        const data = await res.json();

        const visibleTickets =
          role === "requester"
            ? data.filter((t) => t.requester?.id === user.id)
            : data;

        setTickets(visibleTickets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token, navigate, role, user.id]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !search ||
        t.id?.toString().includes(search) ||
        t.title?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        !status || t.status?.toLowerCase() === status.toLowerCase();

      const matchPriority =
        !priority || t.priority?.toLowerCase() === priority.toLowerCase();

      const matchRequestType =
        !requestType ||
        t.request_type?.toLowerCase() === requestType.toLowerCase();

      return matchSearch && matchStatus && matchPriority && matchRequestType;
    });
  }, [tickets, search, status, priority, requestType]);

  const statuses = [...new Set(tickets.map((t) => t.status))];
  const priorities = [...new Set(tickets.map((t) => t.priority))];
  const requestTypes = [...new Set(tickets.map((t) => t.requestType))];

  
  const handleViewComments = async (ticketId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/ticket/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "user-id": user.id,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to load comments");

      const data = await res.json();
      setComments(data);
      setShowCommentsModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (!showCommentsModal) return;
    const el = commentsRef.current;
    if (!el) return;
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }, [showCommentsModal, comments]);

  if (loading) return <p className="center-text">Loading tickets…</p>;
  if (error) return <p className="center-text error">{error}</p>;


  return (
    <div className="dashboard-wrapper">
      <div className="main-content">
        <main className="dashboard-content">
          <h2>Tickets Dashboard</h2>

          {/* Filters */}
          <div className="filters">
           <div className="search-wrapper">
             <input
              type="text"
              placeholder="Search by ID or title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
           </div>

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All Priority</option>
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
            >
              <option value="">All Request Types</option>
              {requestTypes.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Tickets */}
          <div className="tickets-grid">
            {filteredTickets.length === 0 ? (
              <p className="center-text">No tickets found</p>
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

                  <h3 className="ticket-title"><strong>Problem:</strong> {ticket.title}</h3>

                  <p className="ticket-info">
                    <strong>Type:</strong> {ticket.requestType}
                    <br />
                    <strong>Priority:</strong>{" "}
                    <span
                      className={`badge priority ${ticket.priority?.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                    <br />
                    <strong>Assigned To:</strong>{" "}
                    {ticket.assignedTo?.name || "—"}
                  </p>

                  <p className="ticket-date">
                    <strong>Created: </strong>{" "}
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                   <p className="ticket-date">
                    <strong>Due Date: </strong>{" "}
                    {new Date(ticket.dueDate).toLocaleString()}
                  </p>

                  {role === "admin" && (
                    <button
                      className="view-comments-btn"
                      onClick={() => handleViewComments(ticket.id)}
                    >
                      View Comments
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Comments  */}
      {showCommentsModal && (
        <div className="comments-modal">
          <div className="comments-content">
            <h3>Comments</h3>
            <button
              className="close-btn"
              onClick={() => setShowCommentsModal(false)}
            >
              ✕
            </button>

            {comments.length === 0 ? (
              <p>No comments for this ticket.</p>
            ) : (
              <ul className="comments-ul" ref={commentsRef}>
                {comments.map((c) => {
                  const outgoing = c.user?.id === user.id;
                  const initials = (c.user?.name || "U").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
                  return (
                    <li key={c.id} className="comment-li">
                      <div className={`comment-row ${outgoing ? 'outgoing' : 'incoming'}`}>
                        <div className="avatar">{initials}</div>
                        <div style={{display:'flex',flexDirection:'column',alignItems: outgoing ? 'flex-end' : 'flex-start'}}>
                          <div className="meta-left">
                            <div className="meta-name">{c.user?.name || 'User'}</div>
                            <div className="meta-role">{c.user?.role}</div>
                          </div>
                          <div className={`bubble ${outgoing ? 'requester' : 'datamember'}`}>
                            <div style={{fontSize:14, color:'#0f172a'}}>{c.comment}</div>
                            <div className="meta-time" style={{marginTop:8, textAlign: outgoing ? 'right' : 'left', fontSize:11, color:'#94a3b8'}}>{new Date(c.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;