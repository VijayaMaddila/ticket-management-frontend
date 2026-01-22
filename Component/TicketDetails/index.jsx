import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./index.css";

const timeAgo = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const intervals = [
    { label: "yr", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];
  for (const iv of intervals) {
    const val = Math.floor(seconds / iv.seconds);
    if (val >= 1) return `${val} ${iv.label}${val > 1 ? "" : ""} ago`;
  }
  return "just now";
};

const normalizeClass = (s) =>
  (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "_");

const humanize = (s) => {
  if (!s) return "-";
  const map = {
    inprogress: "In Progress",
    on_hold: "On Hold",
    onhold: "On Hold",
    completed: "Completed",
    rejected: "Rejected",
    open: "Open",
    access: "Access",
  };
  const key = normalizeClass(s);
  if (map[key]) return map[key];
  // fallback: Title Case
  return key
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const initials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [ticketRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/tickets/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!ticketRes.ok) {
          const txt = await ticketRes.text();
          throw new Error(`Failed to fetch ticket: ${ticketRes.status} ${txt}`);
        }
        const ticketJson = await ticketRes.json();
        setTicket(ticketJson);

        if (commentsRes.ok) {
          setComments(await commentsRes.json());
        } else {
          setComments([]);
        }
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTicket(await res.json());
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to post comment: ${res.status} ${t}`);
      }
      const created = await res.json();
      // If API doesn't return the full comment object, create a minimal optimistic one
      const commentObj = created.id
        ? created
        : {
            id: Date.now(),
            text: newComment,
            createdAt: new Date().toISOString(),
            author: { name: "You", email: "you@example.com" },
          };
      setComments((c) => [commentObj, ...c]);
      setNewComment("");
    } catch (err) {
      alert(err.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="ticket-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-details-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Ticket</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-details-page">
        <div className="not-found-container">
          <div className="not-found-icon">🎫</div>
          <h3>Ticket Not Found</h3>
          <p>The ticket you're looking for doesn't exist or has been deleted.</p>
          <button className="btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-details-page">
      <div className="ticket-header-bar">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="breadcrumb">
            <span className="ticket-id">Ticket #{ticket.id}</span>
          </div>
        </div>
        <div className="header-right">
          <button 
            className={`btn-icon ${refreshing ? 'rotating' : ''}`}
            onClick={handleRefresh}
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ticket-container">
        <div className="main-column">
          <div className="card ticket-title-card">
            <div className="title-header">
              <h1 className="ticket-title">{ticket.title}</h1>
              <div className="title-badges">
                <span className={`badge priority-badge ${normalizeClass(ticket.priority)}`}>
                  {humanize(ticket.priority)}
                </span>
                <span className={`badge status-badge ${normalizeClass(ticket.status)}`}>
                  {humanize(ticket.status)}
                </span>
              </div>
            </div>
            <p className="description-text">{ticket.description || "No description provided."}</p>
          </div>

          <div className="card">
            <h3 className="section-title">Ticket Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">Request Type</div>
                <div className="detail-value">{humanize(ticket.requestType)}</div>
              </div>

              {ticket.requestedDataset && (
                <div className="detail-item">
                  <div className="detail-label">Dataset</div>
                  <div className="detail-value code-badge">{ticket.requestedDataset}</div>
                </div>
              )}

              <div className="detail-item">
                <div className="detail-label">Due Date</div>
                <div className="detail-value">
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : "No due date"}
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Created</div>
                <div className="detail-value">{timeAgo(ticket.createdAt)}</div>
              </div>

              <div className="detail-item">
                <div className="detail-label">Last Updated</div>
                <div className="detail-value">{timeAgo(ticket.updatedAt)}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Team</h3>
            <div className="team-grid">
              <div className="team-member">
                <div className="team-label">Requester</div>
                <div className="member-card">
                  <div className="avatar-large">{initials(ticket.requester?.name || ticket.requester?.email)}</div>
                  <div className="member-info">
                    <div className="member-name">{ticket.requester?.name || ticket.requester?.email}</div>
                    <div className="member-email">{ticket.requester?.email}</div>
                  </div>
                </div>
              </div>

              <div className="team-member">
                <div className="team-label">Assigned To</div>
                <div className="member-card">
                  <div className="avatar-large">
                    {ticket.assignedTo ? initials(ticket.assignedTo?.name || ticket.assignedTo?.email) : "—"}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{ticket.assignedTo?.name || "Unassigned"}</div>
                    <div className="member-email">{ticket.assignedTo?.email || "No assignment yet"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {user.role?.toLowerCase() !== "admin" && (
            <div className="card">
              <h3 className="section-title">Comments</h3>

              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <p>No comments yet.</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-avatar">
                          {initials(comment.author?.name || comment.author?.email || "?")}
                        </div>
                        <div className="comment-meta">
                          <div className="comment-author">
                            {comment.author?.name || comment.author?.email || "Unknown"}
                          </div>
                          <div className="comment-time">{timeAgo(comment.createdAt)}</div>
                        </div>
                      </div>
                      <div className="comment-content">{comment.text}</div>
                    </div>
                  ))
                )}
              </div>

              {user.role?.toLowerCase() === "datamember" && (
                <div className="comment-form">
                  <div className="form-group">
                    <textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-input"
                      rows="3"
                    />
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleAddComment}
                    disabled={posting || !newComment.trim()}
                    style={{ cursor: posting ? "not-allowed" : "pointer" }}
                  >
                    {posting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="card stat-card">
            <div className="stat-header">
              <h4 className="stat-title">Status</h4>
            </div>
            <div className={`status-pill ${normalizeClass(ticket.status)}`}>
              {humanize(ticket.status)}
            </div>
          </div>

          <div className="card stat-card">
            <div className="stat-header">
              <h4 className="stat-title">Priority</h4>
            </div>
            <div className={`priority-pill ${normalizeClass(ticket.priority)}`}>
              {humanize(ticket.priority)}
            </div>
          </div>

          <div className="card info-card">
            <h4 className="stat-title">Quick Info</h4>
            <div className="info-item">
              <span className="info-label">Type</span>
              <span className="info-value">{humanize(ticket.requestType)}</span>
            </div>
            {ticket.requestedDataset && (
              <div className="info-item">
                <span className="info-label">Dataset</span>
                <span className="info-value dataset-tag">{ticket.requestedDataset}</span>
              </div>
            )}
            {ticket.dueDate && (
              <div className="info-item">
                <span className="info-label">Due</span>
                <span className="info-value">{timeAgo(ticket.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


