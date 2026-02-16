import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import TicketCard from "../tickets/TicketCard";
import CommentsModal from "../comments/CommentsModal";
import Modal from "../ui/Modal";
import { LoadingState, ErrorState } from "../ui/PageState";
import "./index.css";

const RequesterDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [requestType, setRequestType] = useState("");
  const [comments, setComments] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState(null);
  const [newComment, setNewComment] = useState("");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets]);

  const handleViewComments = async (ticketId) => {
    try {
      const data = await apiGet(`/api/comments/ticket/${ticketId}`, { token });
      setComments(data);
      setCurrentTicketId(ticketId);
      setShowCommentsModal(true);
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
              (() => {
                const totalPages = Math.ceil(filteredTickets.length / PAGE_SIZE) || 1;
                const paginated = filteredTickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
                return (
                  <>
                    {paginated.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} showDescription={true} descriptionMaxLength={120}>
                        <div className="card-footer">
                          <button className="view-comments-btn" onClick={() => handleViewComments(ticket.id)}>
                            Comments
                          </button>
                          <button className="view-history-btn" onClick={() => handleViewHistory(ticket.id)}>
                            History
                          </button>
                        </div>
                      </TicketCard>
                    ))}

                    {filteredTickets.length > PAGE_SIZE && (
                      <div className="pagination-controls" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
                          Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                          Next
                        </button>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </div>
        </div>

        <CommentsModal
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          comments={comments}
          currentUserId={user.id}
          title="Comments"
          footer={
            <div className="comments-input-row">
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
              <button
                type="button"
                className="comments-send-btn"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Send
              </button>
            </div>
          }
        />

        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title="Ticket History"
          className="history-modal"
        >
          <div className="history-modal-body">
            {history.length === 0 ? (
              <p className="history-empty">No activity yet</p>
            ) : (
              <ul className="history-timeline">
                {[...history].reverse().map((h) => {
                  const actionLabel = (h.action || "")
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const hasChange = h.oldValue != null || h.newValue != null;
                  const timeStr = h.timestamp
                    ? new Date(h.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "";
                  const byLabel = h.updatedBy != null ? `User #${h.updatedBy}` : "System";
                  const statusSlug = (v) =>
                    (v || "").toString().toLowerCase().replace(/\s+/g, "");
                  const statusSlugs = [
                    "open",
                    "inprogress",
                    "onhold",
                    "completed",
                    "rejected",
                    "closed",
                  ];
                  const isStatus = (v) => statusSlugs.includes(statusSlug(v));
                  const statusClass = (v) => {
                    const s = statusSlug(v);
                    if (!s) return "";
                    if (s === "inprogress") return "history-timeline-chip--inprogress";
                    if (s === "onhold") return "history-timeline-chip--onhold";
                    return `history-timeline-chip--${s}`;
                  };
                  const renderValue = (value, isOld) => {
                    if (value == null) return null;
                    const slug = statusSlug(value);
                    if (statusSlugs.includes(slug)) {
                      const label =
                        slug === "inprogress"
                          ? "In progress"
                          : slug === "onhold"
                            ? "On hold"
                            : (value || "").charAt(0).toUpperCase() + (value || "").slice(1).toLowerCase();
                      return (
                        <span
                          className={`history-timeline-chip ${statusClass(value)} ${isOld ? "history-timeline-chip--old" : ""}`}
                        >
                          {label}
                        </span>
                      );
                    }
                    return (
                      <span className={isOld ? "history-timeline-old" : "history-timeline-new"}>
                        {value}
                      </span>
                    );
                  };
                  return (
                    <li key={h.id} className="history-timeline-item">
                      <div className="history-timeline-dot" aria-hidden />
                      <div className="history-timeline-card">
                        <div className="history-timeline-action">{actionLabel}</div>
                        {hasChange && (
                          <div className="history-timeline-change">
                            {h.oldValue != null && h.newValue != null ? (
                              <>
                                {renderValue(h.oldValue, true)}
                                <span className="history-timeline-arrow"> → </span>
                                {renderValue(h.newValue, false)}
                              </>
                            ) : h.newValue != null ? (
                              renderValue(h.newValue, false)
                            ) : (
                              renderValue(h.oldValue, true)
                            )}
                          </div>
                        )}
                        <div className="history-timeline-meta">
                          {byLabel}
                          {timeStr && <span className="history-timeline-time">{timeStr}</span>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={showCreateTicketModal}
          onClose={() => setShowCreateTicketModal(false)}
          title="Create Ticket"
          className="create-ticket-modal"
        >
          <div className="create-ticket-modal-content">
            <div className="create-ticket-modal-body">
              {success && <div className="create-ticket-success">{success}</div>}
              {error && <div className="create-ticket-error">{error}</div>}
              <label className="create-ticket-label">Title</label>
              <input
                className="create-ticket-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
              />
              <label className="create-ticket-label">Description</label>
              <textarea
                className="create-ticket-input create-ticket-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue"
              />
              <div className="create-ticket-row">
                <div className="create-ticket-field">
                  <label className="create-ticket-label">Type</label>
                  <select
                    className="create-ticket-input"
                    value={ticketRequestType}
                    onChange={(e) => setTicketRequestType(e.target.value)}
                  >
                    <option value="ACCESS">ACCESS</option>
                    <option value="ISSUE">ISSUE</option>
                  </select>
                </div>
                <div className="create-ticket-field">
                  <label className="create-ticket-label">Priority</label>
                  <select
                    className="create-ticket-input"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>
              <label className="create-ticket-label">Requested Dataset</label>
              <input
                className="create-ticket-input"
                value={requestedDataset}
                onChange={(e) => setRequestedDataset(e.target.value)}
                placeholder="Dataset name"
              />
              <label className="create-ticket-label">Due Date</label>
              <input
                type="date"
                className="create-ticket-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="create-ticket-modal-footer">
              <button
                type="button"
                className="create-ticket-btn create-ticket-btn-secondary"
                onClick={() => setShowCreateTicketModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="create-ticket-btn create-ticket-btn-primary"
                onClick={handleCreateTicket}
                disabled={!title.trim() || !description.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default RequesterDashboard;
