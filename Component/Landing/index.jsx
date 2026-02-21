import { useNavigate } from "react-router-dom";
import { FiShield, FiClock, FiZap, FiUsers, FiBarChart2 } from "react-icons/fi";
import "./index.css";

const Feature = ({ icon, title, desc }) => (
  <div className="landing-feature">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page fresh">
      <header className="fresh-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">Manage data requests and tickets</div>
            <h1 className="hero-title">
              <span className="accent">Automate</span> 100% of your data requests
            </h1>
            <h3 className="hero-subtitle">Data requests, Issue &amp; task tracking</h3>

            <p className="lead">
              Segmento Resolve centralizes intake, automates routing, and tracks deliveries so
              your data team can move faster with confidence. Reduce manual handoffs and stay
              compliant with auditable request histories.
            </p>

            <div className="ctas">
              <button className="btn primary" onClick={() => navigate("/register")}>
                Start free trial
              </button>
              <button className="btn ghost" onClick={() => navigate("/register")}>
                Book a demo
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>1,248</strong>
                <span>Requests/month</span>
              </div>
              <div className="stat">
                <strong>72</strong>
                <span>Active tickets</span>
              </div>
              <div className="stat">
                <strong>99.9%</strong>
                <span>Uptime</span>
              </div>
            </div>
          </div>

          <div className="hero-media">
            <div className="card">
              {/* Inline SVG illustration (data network style) */}
              <svg viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Data network illustration">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#eef6ff" />
                    <stop offset="100%" stopColor="#f8fbff" />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="1">
                    <stop offset="0%" stopColor="#0b74ff" />
                    <stop offset="100%" stopColor="#6dd3ff" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" rx="12" fill="url(#g1)" />
                {/* grid of connected nodes */}
                <g stroke="rgba(11,116,255,0.12)" strokeWidth="2" fill="none">
                  <line x1="80" y1="120" x2="240" y2="60" />
                  <line x1="240" y1="60" x2="400" y2="120" />
                  <line x1="400" y1="120" x2="560" y2="80" />
                  <line x1="120" y1="220" x2="300" y2="260" />
                  <line x1="300" y1="260" x2="520" y2="220" />
                  <line x1="520" y1="220" x2="680" y2="280" />
                </g>
                {/* nodes */}
                <g>
                  <circle cx="80" cy="120" r="8" fill="url(#g2)" />
                  <circle cx="240" cy="60" r="10" fill="#0b74ff" opacity="0.95" />
                  <circle cx="400" cy="120" r="6" fill="#6dd3ff" />
                  <circle cx="560" cy="80" r="9" fill="#0b74ff" />
                  <circle cx="120" cy="220" r="7" fill="#0b74ff" />
                  <circle cx="300" cy="260" r="12" fill="#0b74ff" />
                  <circle cx="520" cy="220" r="8" fill="#6dd3ff" />
                  <circle cx="680" cy="280" r="6" fill="#0b74ff" />
                </g>
                {/* floating panels */}
                <g>
                  <rect x="460" y="30" width="200" height="56" rx="8" fill="#071132" opacity="0.9" />
                  <text x="480" y="66" fill="#fff" fontSize="12" fontFamily="sans-serif">Requests • 1,248</text>
                  <rect x="60" y="330" width="220" height="88" rx="10" fill="#ffffff" stroke="#e6eefb" />
                  <text x="80" y="360" fill="#071132" fontSize="14" fontFamily="sans-serif">Open tickets</text>
                  <text x="80" y="382" fill="#64748b" fontSize="12" fontFamily="sans-serif">Active: 72 • SLA breaches: 2</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </header>

      <section className="features container">
        <div className="features-header">
          <h2 className="section-title">Features</h2>
          <p className="section-desc">Key capabilities to automate requests, manage workflows and deliver results faster.</p>
        </div>
       <div className="features-grid">
  <Feature
  icon={<FiZap />}
  title="Centralized Request Intake"
  desc="Capture all data requests, issues, and tasks in one unified system with structured forms."
/>
<Feature
  icon={<FiUsers />}
  title="Intelligent Routing"
  desc="Automatically route requests to the right teams based on rules, categories, or workload."
/>
<Feature
  icon={<FiClock />}
  title="Workflow & SLA Automation"
  desc="Define workflows, set SLAs, trigger reminders, and prevent delays with smart automation."
/>
<Feature
  icon={<FiBarChart2 />}
  title="Operational Visibility"
  desc="Real-time dashboards provide insights into request volume, turnaround time, and team performance."
/>
<Feature
  icon={<FiShield />}
  title="Compliance & Audit Trails"
  desc="Maintain complete request history with secure access controls and audit logs."
/>
<Feature
  icon={<FiMail />}
  title="Email & Slack Notifications"
  desc="Automatically create tickets from emails, and get notifications on ticket creation and status updates via email and Slack for real-time tracking."
/>
</div>

      </section>

     <section className="how container">
  <h2>How It Works</h2>
  <div className="steps">

    <div className="step">
      <div className="num">1</div>
      <h4>Submit a Request</h4>
      <p>
        Users submit data requests, issues, or tasks through structured forms, email, or API.
      </p>
    </div>

    <div className="step">
      <div className="num">2</div>
      <h4>Auto-Route & Prioritize</h4>
      <p>
        The system automatically assigns the request to the right team, sets priority, and applies SLA rules.
      </p>
    </div>

    <div className="step">
      <div className="num">3</div>
      <h4>Track & Collaborate</h4>
      <p>
        Teams collaborate, update status, add comments, and track progress in real time.
      </p>
    </div>

    <div className="step">
      <div className="num">4</div>
      <h4>Deliver & Audit</h4>
      <p>
        Once resolved, stakeholders are notified and a complete audit trail is maintained for compliance.
      </p>
    </div>

  </div>
</section>


      <footer className="footer">
        <div className="container footer-inner">
          <div>© 2025 Segmento Resolve</div>
          <div>
            <button className="link" onClick={() => navigate("/register")}>Try free</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

