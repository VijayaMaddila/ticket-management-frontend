import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../src/config/api";
import "./index.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("requester"); // default role
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid email or password");

      const userData = {
        id: data.id,
        name:data.name,
        email: data.email,
        role: data.role,
        token: data.token,

      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      setUser(userData);

      // Redirect based on role
      if (data.role.toLowerCase() === "admin") navigate("/dashboard");
      else if (data.role.toLowerCase() === "requester") navigate("/requesterDashboard");
      else if (data.role.toLowerCase() === "datamember") navigate("/assigned-tickets");
      else navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h1>Segmento Resolve</h1>
          <p>Welcome back! Please login to continue</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* Role Selection Dropdown */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="role-select"
          >
            <option value="admin">Login as Admin</option>
            <option value="requester">Login as Requester</option>
            <option value="datamember">Login as Data Member</option>
          </select>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="register-link">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      <div className="back-btn-container">
      <button className="back-btn" onClick={() => navigate("/")}>
          ← Back to main page
        </button>
      </div>
      </div>
    </div>
  );
};

export default Login;
