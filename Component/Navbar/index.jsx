import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiFolder,
  FiUsers,
  FiTag,
  FiLogOut,
  FiMenu,
  FiX,
  FiFileText,
  FiCheckSquare,
  FiClipboard,
  FiInbox,
  FiUserCheck,
  FiDatabase,
  FiLogIn,
} from "react-icons/fi";
import ResolveIcon from "../../src/assets/resolve-icon.svg";
import "./index.css";

const Navbar = ({ role = "", setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const userRole = role?.toLowerCase();

  const items = [
    { path: "/dashboard", label: "Ticket List", icon: <FiFileText />, roles: ["admin"] },
    { path: "/assigned-tickets", label: "Assigned Tickets", icon: <FiCheckSquare />, roles: ["datamember"] },
    { path: "/requesterDashboard", label: "My Tickets", icon: <FiClipboard />, roles: ["requester"] },
    { path: "/open-tickets", label: "Open Tickets", icon: <FiInbox />, roles: ["admin"] },
    { path: "/requester", label: "Users", icon: <FiUserCheck />, roles: ["admin"] },
    { path: "/manageDataMember", label: "Data Members", icon: <FiDatabase />, roles: ["admin"] },
  ];

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const login = () => {
    navigate("/login");
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  const goHome = () =>
    navigate(userRole === "requester" ? "/requesterDashboard" : "/dashboard");

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
        <div className="navbar-logo-wrap" onClick={goHome}>
          <img src={ResolveIcon} alt="Resolve" className="resolve-icon" />
          <span className="navbar-logo">Segmento Resolve</span>
        </div>
      </div>

      {open && (
        <div
          className="navbar-backdrop"
          onClick={() => setOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
      <div className={`navbar-menu ${open ? "open" : ""}`}>
        {isLoggedIn &&
          items
            .filter((item) => item.roles.includes(userRole))
            .map((item) => (
              <div
                key={item.path}
                className={`nav-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </div>
            ))}

    
        {isLoggedIn ? (
          <div
            className="mobile-item logout"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <FiLogOut />
            <span>Logout</span>
          </div>
        ) : (
          <div
            className="mobile-item login"
            onClick={() => {
              login();
              setOpen(false);
            }}
          >
            <FiLogIn />
            <span>Login</span>
          </div>
        )}
      </div>

     
      
    </header>
  );
};

export default Navbar;
