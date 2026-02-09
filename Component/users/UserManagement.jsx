import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import Badge from "../ui/Badge";
import { LoadingState, ErrorState, EmptyState } from "../ui/PageState";
import "../Requester/index.css";

/**
 * Shared user management: list users by role, search, edit inline.
 * Used by Requester (role=requester) and ManageDataMember (role=datamember).
 */
const UserManagement = ({
  roleFilter,
  title,
  emptyMessage = "No users found",
  badgeLabel,
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = loggedUser?.role?.toLowerCase() || "";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: roleFilter || "requester",createdAt:""});

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (role !== "admin") {
      navigate("/unauthorized", { replace: true });
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await apiGet("/api/users", { token });
        const filtered = data.filter(
          (u) => (u.role || "").toLowerCase() === (roleFilter || "requester").toLowerCase()
        );
        setUsers(filtered);
      } catch (err) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, role, roleFilter, navigate]);

  const handleEditClick = (user) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email, role: user.role,createdAt:user.createdAt });
  };

  const handleUpdate = async (id) => {
    try {
      const updated = await apiPut(`/api/users/${id}`, formData, { token });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingState message="Loading users…" />;

  return (
    <DashboardLayout title={title}>
      {error && <ErrorState message={error} />}
      <FilterBar
        showSearch={true}
        showStatus={false}
        showPriority={false}
        showRequestType={false}
        searchPlaceholder="Search by name or email"
        searchValue={search}
        onSearchChange={setSearch}
      />
      <div className="tickets-grid">
        {filteredUsers.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          filteredUsers.map((u) => (
            <div className="ticket-card" key={u.id}>
              <div className="ticket-header">
                <span className="ticket-id">#{u.id}</span>
                <Badge variant="role" value={u.role}>{badgeLabel || u.role}</Badge>
              </div>

              {editingId === u.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                  <input
                   type="date"
                    value={formData.createdAt ? formData.createdAt.split("T")[0] : ""}
                     onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                     />
                 
                  
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="requester">Requester</option>
                    <option value="datamember">Data Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="edit-actions">
                    <button className="view-comments-btn" onClick={() => handleUpdate(u.id)}>
                      Save
                    </button>
                    <button className="view-comments-btn" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ticket-info">
                  <p><strong>Name:</strong> {u.name}</p>
                  <p><strong>Email:</strong> {u.email}</p>
                  <p><strong>Account CreatedAt:</strong>{new Date(u.createdAt).toLocaleDateString()}</p>
                  <div className="edit-actions">
                    <button className="view-comments-btn" onClick={() => handleEditClick(u)}>
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
