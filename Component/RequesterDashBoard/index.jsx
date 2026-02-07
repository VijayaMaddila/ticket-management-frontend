import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import TicketCard from "../tickets/TicketCard";
import CommentItem from "../comments/CommentItem";
import Modal from "../ui/Modal";
import { LoadingState, ErrorState } from "../ui/PageState";
import "./index.css";

const RequesterDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [requestType, setRequestType] = useState("");
  const [comments, setComments] = useState([]);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const drawerBodyRef = useRef(null);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketRequestType, setTicketRequestType] = useState("ACCESS");
  const [ticketPriority, setTicketPriority] = useState("LOW");
  const [requestedDataset, setRequestedDataset] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (!token) return navigate("/login", { replace: true });
    const fetchTickets = async () => {
      try {
        const data = await apiGet("/api/tickets", { token });
        const visibleTickets =
          role === "requester" ? data.filter((t) => t.requester?.id === user.id) : data;
        setTickets(visibleTickets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [token, navigate, role, user.id]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filteredTickets = useMemo(
    () =>
      tickets.filter((t) => {
        const matchSearch =
          !debouncedSearch ||
          t.id?.toString().includes(debouncedSearch) ||
          t.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchStatus = !status || t.status?.toLowerCase() === status.toLowerCase();
        const matchPriority = !priority || t.priority?.toLowerCase() === priority.toLowerCase();
        const matchRequestType =
          !requestType || (t.request_type || t.requestType)?.toLowerCase() === requestType.toLowerCase();
        return matchSearch && matchStatus && matchPriority && matchRequestType;
      }),
    [tickets, debouncedSearch, status, priority, requestType]
  );

  const statuses = [...new Set(tickets.map((t) => t.status).filter(Boolean))];
  const priorities = [...new Set(tickets.map((t) => t.priority).filter(Boolean))];
  const requestTypes = [...new Set(tickets.map((t) => t.requestType || t.request_type).filter(Boolean))];

  const handleViewComments = async (ticketId) => {
    try {
      const data = await apiGet(`/api/comments/ticket/${ticketId}`, { token });
      setComments(data);
      setCurrentTicketId(ticketId);
      setShowCommentsDrawer(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const added = await apiPost(
        `/api/comments/ticket/${currentTicketId}`,
        { comment: newComment, user: { id: user.id } },
        { token }
      );
      setComments((prev) => [...prev, added]);
      setNewComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!showCommentsDrawer) return;
    const el = drawerBodyRef.current;
    if (!el) return;
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
  }, [showCommentsDrawer, comments]);

  const handleCreateTicket = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Please provide title and description");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      const newTicket = await apiPost(
        "/api/tickets",
        {
          title,
          description,
          requestType: ticketRequestType || "ACCESS",
          priority: ticketPriority || "LOW",
          requestedDataset,
          dueDate,
          requester: { id: user.id, email: user.email },
        },
        { token }
      );
      setTickets((prev) => [newTicket, ...prev]);
      setSuccess("Ticket created successfully");
      setTitle("");
      setDescription("");
      setRequestedDataset("");
      setDueDate("");
      setTicketRequestType("ACCESS");
      setTicketPriority("LOW");
      setTimeout(() => {
        setSuccess("");
        setShowCreateTicketModal(false);
      }, 900);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleViewHistory = async (ticketId) => {
    try {
      const data = await apiGet(`/api/tickets/audit/${ticketId}`, { token });
      setHistory(data);
      setShowHistoryModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading tickets…" />;

  return (
    <div className="layout">
      <div className="main-content">
        <div className="dashboard-content">
          <header className="dashboard-header">
            <h2 className="dashboard-title">
              My Tickets <span className="result-count">({filteredTickets.length})</span>
            </h2>
            <button className="create-ticket-btn" onClick={() => setShowCreateTicketModal(true)}>
              Create Ticket
            </button>
          </header>
          {error && <ErrorState message={error} />}

          <FilterBar
            searchPlaceholder="Search"
            searchValue={search}
            onSearchChange={setSearch}
            clearSearchButton={true}
            onClearSearch={() => setSearch("")}
            statusOptions={statuses}
            statusValue={status}
            onStatusChange={setStatus}
            priorityOptions={priorities}
            priorityValue={priority}
            onPriorityChange={setPriority}
            requestTypeOptions={requestTypes}
            requestTypeValue={requestType}
            onRequestTypeChange={setRequestType}
            statusAllLabel="All Status"
            priorityAllLabel="All Priority"
            requestTypeAllLabel="All Types"
          />

          <div className="cards-grid">
            {filteredTickets.length === 0 ? (
              <p>No tickets found</p>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket}>
                  <div className="card-footer">
                    <button className="view-comments-btn" onClick={() => handleViewComments(ticket.id)}>
                      Comments
                    </button>
                    <button className="view-history-btn" onClick={() => handleViewHistory(ticket.id)}>
                      History
                    </button>
                  </div>
                </TicketCard>
              ))
            )}
          </div>
        </div>

        {showCommentsDrawer && (
          <div className={`comments-drawer ${showCommentsDrawer ? "open" : ""}`}>
            <div className="drawer-body" ref={drawerBodyRef}>
              <div className="drawer-header">
                <h3>Comments</h3>
                <button className="close-btn" onClick={() => setShowCommentsDrawer(false)}>✕</button>
              </div>
              {comments.length === 0 ? (
                <p>No comments yet</p>
              ) : (
                <div className="comments-list">
                  {comments.map((c) => (
                    <CommentItem key={c.id} comment={c} isOutgoing={c.user?.id === user.id} />
                  ))}
                </div>
              )}
              <div className="drawer-footer">
                <div className="chat-input">
                  <textarea
                    value={newComment}
                    placeholder="Write a comment..."
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                </div>
                <button
                  className="chat-send"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Ticket History"
          className="history-modal"
        >
          <div className="modal-body">
            {history.length === 0 ? (
              <p>No history</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Action</th>
                    <th>Old</th>
                    <th>New</th>
                    <th>By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id}>
                      <td>{i + 1}</td>
                      <td>{h.action}</td>
                      <td>{h.oldValue || "—"}</td>
                      <td>{h.newValue || "—"}</td>
                      <td>{h.updatedBy || "System"}</td>
                      <td>{new Date(h.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>

        {showCreateTicketModal && (
          <div className="create-ticket-drawer-overlay" onClick={() => setShowCreateTicketModal(false)}>
            <div className="create-ticket-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <h3>Create Ticket</h3>
                <button className="close-btn" onClick={() => setShowCreateTicketModal(false)}>✕</button>
              </div>
              <div className="drawer-body">
                {success && <div className="success">{success}</div>}
                {error && <div className="error">{error}</div>}
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Issue title" />
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" />
                <div style={{ display: "flex", gap: 10 }}>
                  <select value={ticketRequestType} onChange={(e) => setTicketRequestType(e.target.value)}>
                    <option value="ACCESS">ACCESS</option>
                    <option value="ISSUE">ISSUE</option>
                  </select>
                  <select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value)}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <label>Requested Dataset</label>
                <input value={requestedDataset} onChange={(e) => setRequestedDataset(e.target.value)} placeholder="Dataset name" />
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="drawer-footer">
                <div className="drawer-buttons">
                  <button className="btn-secondary" onClick={() => setShowCreateTicketModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleCreateTicket} disabled={!title.trim() || !description.trim()}>Create</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequesterDashboard;
