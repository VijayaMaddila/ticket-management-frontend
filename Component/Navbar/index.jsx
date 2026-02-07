import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiFolder,
  FiUsers,
  FiTag,
  FiLogOut,
  FiMenu,
  FiX,
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
    { path: "/dashboard", label: "Ticket List", icon: <FiFolder />, roles: ["admin"] },
    { path: "/assigned-tickets", label: "Assigned Tickets", icon: <FiFolder />, roles: ["datamember"] },
    { path: "/requesterDashboard", label: "My Tickets", icon: <FiFolder />, roles: ["requester"] },
    { path: "/open-tickets", label: "Open Tickets", icon: <FiFolder />, roles: ["admin"] },
    { path: "/requester", label: "Users", icon: <FiUsers />, roles: ["admin"] },
    { path: "/manageDataMember", label: "Data Members", icon: <FiTag />, roles: ["admin"] },
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

  return (
    <header className="navbar">
    
      <div
        className="navbar-left"
        onClick={() =>
          navigate(userRole === "requester" ? "/requesterDashboard" : "/dashboard")
        }
      >
        <div className="mobile-toggle" onClick={() => setOpen(!open)}>
        {open ? <FiX /> : <FiMenu />}
      </div>
        <img src={ResolveIcon} alt="Resolve" className="resolve-icon" />
        <span className="navbar-logo">Segmento Resolve</span>
      </div>

      
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
