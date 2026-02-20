import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, API_BASE_URL, getAuthHeaders } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import TicketCard from "../tickets/TicketCard";
import Modal from "../ui/Modal";
import { LoadingState, ErrorState, EmptyState } from "../ui/PageState";
import "./index.css";

const OpenTickets = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";
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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const fetchTickets = async () => {
    try {
      const data = await apiGet("/api/tickets", { token });
      let openTickets = data.filter((t) => (t.status || "").toLowerCase() === "open");
      if (role === "requester") {
        openTickets = openTickets.filter((t) => t.requester?.id === user.id);
      }
      // remove duplicates by id
      if (Array.isArray(openTickets)) {
        openTickets = Array.from(new Map(openTickets.map((t) => [t.id, t])).values());
      } else {
        openTickets = [];
      }
      setTickets(openTickets);
      setFilteredTickets(openTickets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiGet("/api/users", { token });
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  useEffect(() => {
    const normalize = (v) => (v ?? "").toString().toLowerCase();
    let result = [...tickets];
    if (searchTerm) {
      const term = normalize(searchTerm);
      result = result.filter(
        (t) => normalize(t.id).includes(term) || normalize(t.title).includes(term)
      );
    }
    if (priorityFilter) result = result.filter((t) => normalize(t.priority) === normalize(priorityFilter));
    if (requestTypeFilter) result = result.filter((t) => normalize(t.request_type || t.requestType) === normalize(requestTypeFilter));
    setFilteredTickets(result);
  }, [tickets, searchTerm, priorityFilter, requestTypeFilter]);

  // reset to first page whenever the filtered list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets]);

  useEffect(() => {
    if (showAssignModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showAssignModal]);

  const assignTicket = async () => {
    if (!selectedTicket || !selectedUserId) return;
    setAssigning(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tickets/${selectedTicket.id}/assign/${selectedUserId}`,
        { method: "PUT", headers: getAuthHeaders(token) }
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

  const priorities = [...new Set(tickets.map((t) => t.priority).filter(Boolean))];
  const requestTypes = [...new Set(tickets.map((t) => t.request_type || t.requestType).filter(Boolean))];
  const dataMembers = users.filter((u) => (u.role || "").toLowerCase() === "datamember");
  const filteredUsers = userSearch
    ? dataMembers.filter((u) =>
        `${u.name || ""} ${u.email || ""}`.toLowerCase().includes(userSearch.toLowerCase())
      )
    : dataMembers;

  if (loading) return <LoadingState message="Loading tickets..." />;
  if (error) return <ErrorState message={error} />;

  const totalPages = Math.ceil(filteredTickets.length / PAGE_SIZE) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <DashboardLayout title="Open Tickets">
      <span className="ticket-count">{filteredTickets.length} Tickets</span>
      <FilterBar
        searchPlaceholder="Search by ID or Title"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        showStatus={false}
        statusOptions={[]}
        statusValue=""
        onStatusChange={() => {}}
        priorityOptions={priorities}
        priorityValue={priorityFilter}
        onPriorityChange={setPriorityFilter}
        requestTypeOptions={requestTypes}
        requestTypeValue={requestTypeFilter}
        onRequestTypeChange={setRequestTypeFilter}
        priorityAllLabel="All Priorities"
        requestTypeAllLabel="All Request Types"
      />
      <div className="tickets-grid">
        {filteredTickets.length === 0 ? (
          <EmptyState message="No open tickets found" />
        ) : (
          paginatedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              showDescription={true}
              descriptionMaxLength={120}
            >
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
            </TicketCard>
          ))
        )}
      </div>

      {/* Pagination controls - show 10 tickets per page */}
      {filteredTickets.length > PAGE_SIZE && (
        <div className="pagination-controls" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={!!showAssignModal && !!selectedTicket}
        onClose={() => setShowAssignModal(false)}
        title="Assign Ticket"
        className="assign-modal"
      >
        <div className="assign-modal__body">
          <section className="assign-ticket-summary">
            <div className="assign-ticket-summary__row">
              <span className="assign-ticket-summary__label">Ticket</span>
              <span className="assign-ticket-summary__value">#{selectedTicket?.id} · {selectedTicket?.title}</span>
            </div>
            <div className="assign-ticket-summary__chips">
              <span className="assign-ticket-summary__chip assign-ticket-summary__chip--type">
                {selectedTicket?.request_type || selectedTicket?.requestType}
              </span>
              <span className={`assign-ticket-summary__chip assign-ticket-summary__chip--priority assign-ticket-summary__chip--priority-${(selectedTicket?.priority || "").toLowerCase().replace(/\s+/g, "")}`}>
                {selectedTicket?.priority}
              </span>
              <span className="assign-ticket-summary__chip assign-ticket-summary__chip--muted">
                Current: {selectedTicket?.assignedTo?.name || "Unassigned"}
              </span>
            </div>
          </section>

          <section className="assign-picker">
            <label className="assign-picker__label">Assign to</label>
            <input
              type="text"
              className="assign-picker__search"
              placeholder="Search by name or email…"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              aria-label="Search assignees"
            />
            <div className="assign-picker__list" role="listbox" aria-label="Data members">
              {filteredUsers.length === 0 ? (
                <p className="assign-picker__empty">No eligible assignees</p>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    role="option"
                    aria-selected={selectedUserId === String(u.id)}
                    className={`assign-picker__option ${selectedUserId === String(u.id) ? "assign-picker__option--selected" : ""}`}
                    onClick={() => setSelectedUserId(String(u.id))}
                  >
                    <div className="assign-picker__avatar">{(u.name || "U").charAt(0).toUpperCase()}</div>
                    <div className="assign-picker__info">
                      <span className="assign-picker__name">{u.name}</span>
                      <span className="assign-picker__email">{u.email}</span>
                    </div>
                    <span className="assign-picker__role">{u.role}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          {assignSuccess && (
            <div className="assign-modal__success" role="status">{assignSuccess}</div>
          )}

          <footer className="assign-modal__actions">
            <button
              type="button"
              className="assign-modal__btn assign-modal__btn--secondary"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="assign-modal__btn assign-modal__btn--primary"
              onClick={assignTicket}
              disabled={!selectedUserId || assigning}
            >
              {assigning ? "Assigning…" : "Assign"}
            </button>
          </footer>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default OpenTickets;
