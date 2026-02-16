import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../src/config/api";
import "./index.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [teamId, setTeamId] = useState(""); // <-- new state for selected team
  const [teams, setTeams] = useState([]);   // <-- list of teams
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch teams if role = datamember
  useEffect(() => {
    if (role === "datamember") {
      fetch(`${API_BASE_URL}/api/teams`)
        .then((res) => res.json())
        .then((data) => setTeams(data))
        .catch((err) => console.error(err));
    } else {
      setTeams([]);
      setTeamId("");
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, teamId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful. Please login.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setTeamId("");
    } catch (err) {
      setError(err.message || "Network error");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h2>Create Account</h2>
        <p className="subtitle">Join SegmentoResolve</p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
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
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="requester">Requester</option>
            <option value="datamember">Data Member</option>
            <option value="admin">Admin</option>
          </select>

          {/* Team dropdown shows only for Data Members */}
          {role === "datamember" && (
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              required
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
