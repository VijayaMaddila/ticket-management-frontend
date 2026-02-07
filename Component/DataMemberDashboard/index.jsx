import { useState, useEffect } from "react";
import { apiGet, apiPut, apiPost } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import TicketCard from "../tickets/TicketCard";
import Modal from "../ui/Modal";
import { LoadingState, ErrorState, EmptyState } from "../ui/PageState";
import "./index.css";

const STATUS_OPTS = ["OPEN", "INPROGRESS", "ONHOLD", "COMPLETED", "REJECTED"];
const PRIORITY_OPTS = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

const AssignedTickets = () => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};
  const userId = user?.id;
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solveTicket, setSolveTicket] = useState(null);
  const [commentsTicket, setCommentsTicket] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    if (!userId || !token) {
      setError("User not logged in or token missing.");
      setLoading(false);
      return;
    }
    const fetchTickets = async () => {
      try {
        const data = await apiGet(`/api/tickets/assigned-to/${userId}`, { token });
        const list = Array.isArray(data) ? data : [];
        setTickets(list);
        setFilteredTickets(list);
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
    if (statusFilter !== "ALL") result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "ALL") result = result.filter((t) => t.priority === priorityFilter);
    setFilteredTickets(result);
  }, [statusFilter, priorityFilter, tickets]);

  const handleStatusChange = async (newStatus) => {
    if (!solveTicket) return;
    try {
      await apiPut(
        `/api/tickets/${solveTicket.id}/status?status=${newStatus}&userId=${userId}`,
        null,
        { token }
      );
      setTickets((prev) =>
        prev.map((t) => (t.id === solveTicket.id ? { ...t, status: newStatus } : t))
      );
      setSolveTicket(null);
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  const fetchComments = async (ticket) => {
    try {
      const data = await apiGet(`/api/comments/ticket/${ticket.id}`, { token });
      setCommentsTicket({ ...ticket, comments: data });
    } catch {
      setCommentsTicket({ ...ticket, comments: [] });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !commentsTicket) return;
    try {
      const newComment = await apiPost(
        `/api/comments/ticket/${commentsTicket.id}`,
        { comment: commentText, user: { id: userId } },
        { token }
      );
      setCommentsTicket((prev) => ({
        ...prev,
        comments: prev.comments ? [...prev.comments, newComment] : [newComment],
      }));
      setCommentText("");
    } catch (err) {
      alert(err.message || "Failed to add comment");
    }
  };

  if (loading) return <LoadingState message="Loading tickets..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <DashboardLayout title="Assigned Tickets">
      <FilterBar
        showSearch={false}
        statusOptions={STATUS_OPTS}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        priorityOptions={PRIORITY_OPTS}
        priorityValue={priorityFilter}
        onPriorityChange={setPriorityFilter}
        statusAllLabel="ALL"
        priorityAllLabel="ALL"
        requestTypeOptions={[]}
        requestTypeValue=""
        onRequestTypeChange={() => {}}
      />
      <div className="cards-grid">
        {filteredTickets.length === 0 ? (
          <EmptyState message="No assigned tickets" />
        ) : (
          filteredTickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              showDescription={true}
              descriptionMaxLength={120}
            >
              <div className="card-actions">
                <button className="view-btn" onClick={() => setSolveTicket(t)}>Solve</button>
                <button className="view-btn" onClick={() => fetchComments(t)}>Comments</button>
              </div>
            </TicketCard>
          ))
        )}
      </div>

      <Modal
        isOpen={!!solveTicket}
        onClose={() => setSolveTicket(null)}
        title={solveTicket?.title || "Solve Ticket"}
      >
        <p>{solveTicket?.description || "No description provided."}</p>
        <label>Change Status</label>
        <select
          defaultValue={solveTicket?.status || "OPEN"}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
          <button onClick={() => setSolveTicket(null)}>Cancel</button>
        </div>
      </Modal>

      {commentsTicket && (
        <Modal
          isOpen={!!commentsTicket}
          onClose={() => setCommentsTicket(null)}
          title={commentsTicket.title || "Comments"}
          className="chat-modal"
        >
          <div className="chat-description">
            {commentsTicket.description || "No description provided."}
          </div>
          <div className="chat-body">
            {commentsTicket.comments?.length > 0 ? (
              commentsTicket.comments.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className={`chat-message ${c.user?.id === userId ? "own" : "other"}`}
                >
                  <div className="chat-user">{c.user?.name} {c.user?.role}</div>
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
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AssignedTickets;
