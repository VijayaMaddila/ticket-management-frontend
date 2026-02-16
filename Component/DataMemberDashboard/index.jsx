import { useState, useEffect } from "react";
import { apiGet, apiPut, apiPost } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import TicketCard from "../tickets/TicketCard";
import Modal from "../ui/Modal";
import CommentsModal from "../comments/CommentsModal";
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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solveTicket, setSolveTicket] = useState(null);
  const [commentsTicket, setCommentsTicket] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

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
    const term = (searchTerm || "").toString().toLowerCase().trim();
    let result = [...tickets];
    if (term) {
      result = result.filter(
        (t) =>
          String(t.id || "").toLowerCase().includes(term) ||
          (t.title || "").toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "ALL") result = result.filter((t) => t.status === statusFilter);
    if (priorityFilter !== "ALL") result = result.filter((t) => t.priority === priorityFilter);
    setFilteredTickets(result);
  }, [searchTerm, statusFilter, priorityFilter, tickets]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets]);

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
        showSearch={true}
        searchPlaceholder="Search by ID or title"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        clearSearchButton={true}
        onClearSearch={() => setSearchTerm("")}
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
          (() => {
            const totalPages = Math.ceil(filteredTickets.length / PAGE_SIZE) || 1;
            const paginated = filteredTickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
            return (
              <>
                {paginated.map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    showDescription={true}
                    descriptionMaxLength={120}
                  >
                    <div className="card-actions">
                      <button
                        type="button"
                        className="card-action-btn card-action-btn--solve"
                        onClick={() => setSolveTicket(t)}
                      >
                        Solve
                      </button>
                      <button
                        type="button"
                        className="card-action-btn card-action-btn--comments"
                        onClick={() => fetchComments(t)}
                      >
                        Comments
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

      <Modal
        isOpen={!!solveTicket}
        onClose={() => setSolveTicket(null)}
        title={solveTicket?.title || "Solve Ticket"}
        className="solve-modal"
      >
        <div className="solve-modal__body">
          <section className="solve-modal__section">
            <h4 className="solve-modal__label">Description</h4>
            <p className="solve-modal__description">
              {solveTicket?.description || "No description provided."}
            </p>
          </section>
          <section className="solve-modal__section">
            <label className="solve-modal__label" htmlFor="solve-status">Change status</label>
            <select
              id="solve-status"
              className="solve-modal__select"
              defaultValue={solveTicket?.status || "OPEN"}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {STATUS_OPTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </section>
          <footer className="solve-modal__actions">
            <button
              type="button"
              className="solve-modal__btn solve-modal__btn--secondary"
              onClick={() => setSolveTicket(null)}
            >
              Cancel
            </button>
          </footer>
        </div>
      </Modal>

      <CommentsModal
        isOpen={!!commentsTicket}
        onClose={() => {
          setCommentsTicket(null);
          setCommentText("");
        }}
        comments={commentsTicket?.comments ?? []}
        currentUserId={userId}
        title={commentsTicket?.title || "Comments"}
        footer={
          <div className="comments-input-row">
            <textarea
              value={commentText}
              placeholder="Write a comment..."
              onChange={(e) => setCommentText(e.target.value)}
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
              disabled={!commentText.trim()}
            >
              Send
            </button>
          </div>
        }
      />
    </DashboardLayout>
  );
};

export default AssignedTickets;
