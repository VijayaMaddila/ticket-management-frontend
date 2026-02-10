import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, API_BASE_URL, getAuthHeaders } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import TicketCard from "../tickets/TicketCard";
import CommentsModal from "../comments/CommentsModal";
import { LoadingState, ErrorState, EmptyState } from "../ui/PageState";
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

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
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

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !search ||
        t.id?.toString().includes(search) ||
        t.title?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !status || t.status?.toLowerCase() === status.toLowerCase();
      const matchPriority = !priority || t.priority?.toLowerCase() === priority.toLowerCase();
      const matchRequestType =
        !requestType || (t.request_type || t.requestType)?.toLowerCase() === requestType.toLowerCase();
      return matchSearch && matchStatus && matchPriority && matchRequestType;
    });
  }, [tickets, search, status, priority, requestType]);

  const statuses = [...new Set(tickets.map((t) => t.status).filter(Boolean))];
  const priorities = [...new Set(tickets.map((t) => t.priority).filter(Boolean))];
  const requestTypes = [...new Set(tickets.map((t) => t.requestType || t.request_type).filter(Boolean))];

  const handleViewComments = async (ticketId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/ticket/${ticketId}`, {
        headers: { ...getAuthHeaders(token), "user-id": user.id },
      });
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data);
      setShowCommentsModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading tickets…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <DashboardLayout title="Tickets Dashboard">
      <FilterBar
        searchPlaceholder="Search by ID or title"
        searchValue={search}
        onSearchChange={setSearch}
        statusOptions={statuses}
        statusValue={status}
        onStatusChange={setStatus}
        priorityOptions={priorities}
        priorityValue={priority}
        onPriorityChange={setPriority}
        requestTypeOptions={requestTypes}
        requestTypeValue={requestType}
        onRequestTypeChange={setRequestType}
      />
      <div className="tickets-grid">
        {filteredTickets.length === 0 ? (
          <EmptyState message="No tickets found" />
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showDescription={true}>
              {role === "admin" && (
                <button
                  className="view-comments-btn"
                  onClick={() => handleViewComments(ticket.id)}
                >
                  View Comments
                </button>
              )}
            </TicketCard>
          ))
        )}
      </div>
      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        comments={comments}
        currentUserId={user.id}
        title="Comments"
      />
    </DashboardLayout>
  );
};

export default Dashboard;
