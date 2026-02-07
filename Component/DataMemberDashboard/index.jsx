import  { useState, useEffect } from "react";
import "./index.css";

const AssignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solveTicket, setSolveTicket] = useState(null);
  const [commentsTicket, setCommentsTicket] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const userId = user?.id;
  const role = user.role?.toLowerCase() || "";

  const statusOptions = ["OPEN", "INPROGRESS", "ONHOLD", "COMPLETED", "REJECTED"];
  const priorityOptions = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];


  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId || !token) {
        setError("User not logged in or token missing.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:8080/api/tickets/assigned-to/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error(`Failed to load tickets: ${res.status}`);

        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
        setFilteredTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId, token]);

  
  useEffect(() => {
    let result = [...tickets];

    if (statusFilter !== "ALL") {
      result = result.filter(t => t.status === statusFilter);
    }

    if (priorityFilter !== "ALL") {
      result = result.filter(t => t.priority === priorityFilter);
    }

    setFilteredTickets(result);
  }, [statusFilter, priorityFilter, tickets]);

  
  const handleStatusChange = async (newStatus) => {
    const ticket = solveTicket;
    if (!ticket) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${ticket.id}/status?status=${newStatus}&userId=${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      setTickets(prev => prev.map(t => (t.id === ticket.id ? { ...t, status: newStatus } : t)));
      setSolveTicket(null);
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  
  const fetchComments = async (ticket) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/ticket/${ticket.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch comments");

      const data = await res.json();
      setCommentsTicket({ ...ticket, comments: data });
    } catch (err) {
      setCommentsTicket({ ...ticket, comments: [] });
    }
  };

  
  const handleAddComment = async () => {
    if (!commentText.trim() || !commentsTicket) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/ticket/${commentsTicket.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment: commentText,
            user: { id: userId },
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to add comment");

      const newComment = await res.json();

      setCommentsTicket(prev => ({
        ...prev,
        comments: prev.comments ? [...prev.comments, newComment] : [newComment],
      }));

      setCommentText("");
    } catch (err) {
      alert(err.message || "Failed to add comment");
    }
  };

  if (loading) return <div className="loading">Loading tickets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="main-content">
        <div className="dashboard-content">
          <h2 className="dashboard-title">Assigned Tickets</h2>
          {/* Filters */}
          <div className="filters">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="ALL">ALL</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              {priorityOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Tickets as Cards */}
          {filteredTickets.length === 0 ? (
            <div className="center-text">No assigned tickets</div>
          ) : (
            <div className="cards-grid">
              {filteredTickets.map(t => (
                <div className="ticket-card" key={t.id}>
                  <div className="card-header">
                    <div className="card-id">#{t.id}</div>
                    <div className={`badge status ${t.status?.toLowerCase() || ""}`}>{t.status || "N/A"}</div>
                  </div>

                  <h4 className="card-title"><strong>Problem: </strong>{t.title || "Untitled"}</h4>
                  <div className={`badge priority ${t.priority?.toLowerCase() || ""}`}>{t.priority || "N/A"}</div>

                  <p className="card-desc"><strong>Description: </strong>{t.description ? (t.description.length > 120 ? t.description.slice(0, 120) + '...' : t.description) : 'No description'}</p>

                  <div className="card-actions">
                    <button className="view-btn" onClick={() => setSolveTicket(t)}>Solve</button>
                    <button className="view-btn" onClick={() => fetchComments(t)}>Comments</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          
          {/* Solve Modal */}
          {solveTicket && (
            <div className="modal-overlay" onClick={() => setSolveTicket(null)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{solveTicket.title || "Solve Ticket"}</h3>
                  <button onClick={() => setSolveTicket(null)}>×</button>
                </div>

                <p>{solveTicket.description || "No description provided."}</p>

                <label>Change Status</label>
                <select
                  defaultValue={solveTicket.status || "OPEN"}
                  onChange={e => handleStatusChange(e.target.value)}
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10}}>
                  <button onClick={() => setSolveTicket(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Comments Modal */}
          {commentsTicket && (
  <div className="modal-overlay" onClick={() => setCommentsTicket(null)}>
    <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
      
      <div className="chat-header">
        <h3>{commentsTicket.title || "Comments"}</h3>
        <button className="close-btn" onClick={() => setCommentsTicket(null)}>
          ×
        </button>
      </div>
      <div className="chat-description">
        {commentsTicket.description || "No description provided."}
      </div>
      <div className="chat-body">
        {commentsTicket.comments?.length > 0 ? (
          commentsTicket.comments.map((c, idx) => (
            <div
              key={idx}
              className={`chat-message ${
                c.userName === "You" ? "own" : "other"
              }`}
            >
              <div className="chat-user">{c.user?.name+" "+(c.user?.role)}</div>
              
              <div className="chat-text">{c.comment}</div>
            </div>
          ))
        ) : (
          <div className="no-messages">No comments yet</div>
        )}
      </div>
      <div className="chat-input">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Type a message..."
          rows={2}
        />
        <button onClick={handleAddComment}>Send</button>
      </div>

    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default AssignedTickets;