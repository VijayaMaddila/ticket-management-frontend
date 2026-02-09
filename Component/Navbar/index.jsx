import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiFileText,
  FiCheckSquare,
  FiClipboard,
  FiInbox,
  FiUserCheck,
  FiDatabase,
  FiLogOut,
  FiLogIn,
  FiMenu,
  FiX,
} from "react-icons/fi";
import ResolveIcon from "../../src/assets/resolve-icon.svg";
import "./index.css";

const Navbar = ({ role = "", setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [nameEdit, setNameEdit] = useState("");

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const userRole = role?.toLowerCase();

  const items = [
    { path: "/dashboard", label: "Ticket List", icon: <FiFileText />, roles: ["admin"] },
    { path: "/assigned-tickets", label: "Assigned Tickets", icon: <FiCheckSquare />, roles: ["datamember"] },
    { path: "/requesterDashboard", label: "My Tickets", icon: <FiClipboard />, roles: ["requester"] },
    { path: "/open-tickets", label: "Open Tickets", icon: <FiInbox />, roles: ["admin"] },
    { path: "/requester", label: "Users", icon: <FiUserCheck />, roles: ["admin"] },
    { path: "/manageDataMember", label: "Data Team", icon: <FiDatabase />, roles: ["admin"] },
  ];

  const isActive = (path) => location.pathname === path;

  const fetchProfile = () => {
    if (!isLoggedIn) return;
    fetch("http://localhost:8080/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        setNameEdit(data.name);
        // fetch profile photo
        fetch("http://localhost:8080/api/users/profile/photo", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.blob())
          .then((blob) => setPreview(URL.createObjectURL(blob)));
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => fetchProfile(), [isLoggedIn]);

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpdateProfile = () => {
    if (!nameEdit && !file) return;
    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("name", nameEdit);

    fetch("http://localhost:8080/api/users/profile/photo", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        return res.json();
      })
      .then(() => {
        alert("Profile updated!");
        setFile(null);
        fetchProfile();
      })
      .catch((err) => console.log(err));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const login = () => navigate("/login");

  const goHome = () => navigate(userRole === "requester" ? "/requesterDashboard" : "/dashboard");

  return (
    <>
      <nav className="navbar">
        {/* Left: Logo + Mobile Toggle */}
        <div className="navbar-left">
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="navbar-logo-wrap" onClick={goHome}>
            <img src={ResolveIcon} alt="Resolve" className="resolve-icon" />
            <span className="navbar-logo">Segmento Resolve</span>
          </div>
        </div>
        {/* Center: Menu */}
        <ul className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          {isLoggedIn &&
            items
              .filter((item) => item.roles.includes(userRole))
              .map((item) => (
                <li
                  key={item.path}
                  className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </li>
              ))}

          {isLoggedIn ? (
            <li className="mobile-item logout" onClick={logout}>
              <FiLogOut /> Logout
            </li>
          ) : (
            <li className="mobile-item login" onClick={login}>
              <FiLogIn /> Login
            </li>
          )}

        {isLoggedIn && userData && (
          <div className="user-profile" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="avatar">
              <img
                src={preview || "https://via.placeholder.com/36"}
                alt="avatar"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            </div>
            <div className="user-info">
              <span className="user-name">{userData.name}</span>
              <span className="user-role">{userData.role}</span>
            </div>
          </div>
        )}
        </ul>
        </nav>

      {/* Profile Dropdown */}
      {profileOpen && (
        <>
          <div className="navbar-backdrop" onClick={() => setProfileOpen(false)} />
          <div className="profile-side-panel">
            <button className="close-btn" onClick={() => setProfileOpen(false)}>
              <FiX />
            </button>
            <h2>{userRole} Profile</h2>
            <div className="profile-content">
              <img
                className="profile-photo"
                src={preview || "https://via.placeholder.com/100"}
                alt="Profile"
                onClick={() => document.getElementById("file-input").click()}
              />
              <input
                id="file-input"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <button className="profile-update-btn" onClick={handleUpdateProfile}>
                Update Profile
              </button>
              <div className="profile-details">
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> {userData.role}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
