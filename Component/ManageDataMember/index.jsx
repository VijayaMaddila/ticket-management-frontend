import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Requester/index.css"

const ManageDataMember = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "requester",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const role = loggedUser?.role;

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
    if (role !== "admin") navigate("/unauthorized", { replace: true });

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.filter((u) => u.role.toLowerCase() === "datamember"));
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [token, role, navigate]);

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setFormData({ name: user.name, email: user.email, role: user.role });
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Update failed");

      const updatedUser = await res.json();
      setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <div className="main-content">
        <main className="dashboard-content">
          <h2>DataMemeber Management</h2>

          {/* Search filter */}
          <div className="filters">
           <div className="search-wrapper">
             <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
           </div>
          </div>

          {/* User cards grid */}
          <div className="tickets-grid">
            {filteredUsers.length === 0 ? (
              <p className="center-text">No requesters found</p>
            ) : (
              filteredUsers.map((u) => (
                <div className="ticket-card" key={u.id}>
                  <div className="ticket-header">
                    <span className="ticket-id">#{u.id}</span>
                    <span className={`badge status requester`}>Requester</span>
                  </div>

                  {editingUser === u.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Email"
                      />
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                      >
                        <option value="requester">Requester</option>
                        <option value="datamember">Data Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="edit-actions">
                        <button
                          className="view-comments-btn"
                          onClick={() => handleUpdate(u.id)}
                        >
                          Save
                        </button>
                        <button
                          className="view-comments-btn"
                          onClick={() => setEditingUser(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ticket-info">
                      <p>
                        <strong>Name:</strong> {u.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {u.email}
                      </p>
                      <div className="edit-actions">
                        <button
                          className="view-comments-btn"
                          onClick={() => handleEditClick(u)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageDataMember;
