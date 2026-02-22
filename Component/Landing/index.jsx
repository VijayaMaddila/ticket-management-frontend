import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiShield, FiClock, FiZap, FiUsers, FiBarChart2, FiMail, FiMessageCircle } from "react-icons/fi";
import "./index.css";


const Feature = ({ icon, title, desc }) => (
  <div className="landing-feature">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const DemoVideo = () => {
  const [open, setOpen] = useState(false);
  const poster = "/assets/demo-poster.png"; 

  return (
    <div className="demo-container">
      {!open ? (
        <div
          className="video-poster"
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          aria-label="Open demo"
        >
          <img src={poster} alt="Demo of creating a ticket" />
          <div className="play-btn" aria-hidden>
            <svg viewBox="0 0 100 100" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5"/>
              <polygon points="44,36 66,50 44,64" fill="#fff" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="demo-inline" role="region" aria-label="Demo player">
          <button className="demo-close" onClick={() => setOpen(false)} aria-label="Close demo">×</button>
          <DemoPlayer />
        </div>
      )}
    </div>
  );
};

const DemoPlayer = () => {
  const steps = [
    { who: "user", text: "Hi — I need to create a ticket for a bug in the login page." },
    { who: "bot", text: "Got it. What's the priority and a short description?" },
    { who: "user", text: "High. Users receive an 'invalid credentials' error even with correct password." },
    { who: "bot", text: "Creating ticket... ✅ Ticket #4231 created and assigned to Engineering." },
    { who: "bot", text: "Would you like to notify the requester by email?" },
  ];

  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (visible < steps.length) {
      const step = steps[visible];
      if (step.who === "bot") {
        setTyping(true);
        const t1 = setTimeout(() => {
          if (!mounted) return;
          setTyping(false);
          setVisible((v) => v + 1);
        }, 1200 + Math.min(visible * 400, 1000));
        return () => {
          mounted = false;
          clearTimeout(t1);
        };
      } else {
        const t2 = setTimeout(() => {
          if (!mounted) return;
          setVisible((v) => v + 1);
        }, 800);
        return () => {
          mounted = false;
          clearTimeout(t2);
        };
      }
    }
  }, [visible]);

  return (
    <div className="demo-player" aria-live="polite">
      <div className="demo-chat">
        {steps.slice(0, visible).map((s, i) => (
          <div key={i} className={`msg ${s.who}`}>
            <div className="bubble">{s.text}</div>
          </div>
        ))}

        {typing && (
          <div className="msg bot">
            <div className="bubble typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="demo-controls">
        <button className="btn ghost" onClick={() => { setTimeout(() => window.location.reload(), 50); }}>Replay</button>
      </div>
    </div>
  );
};

const GettingStartedModal = ({ type, onClose, onConnect }) => {
  const title = type === "slack" ? "Get started with Slack" : "Get started with Email";
  const desc =
    type === "slack"
      ? "Quick start: install the Slack app, grant workspace permissions, and choose a channel to post notifications."
      : "Quick start: connect a mailbox (Gmail/Outlook or IMAP) so incoming emails create tickets automatically.";

  const steps =
    type === "slack"
      ? [
          "Create a Slack app and configure OAuth scopes (chat:write, channels:read, users:read).",
          "Add Redirect URL: /auth/slack/callback on your backend.",
          "Click Connect to start the OAuth flow."
        ]
      : [
          "Decide provider (Gmail/Outlook) or IMAP mailbox.",
          "Provide mailbox credentials securely to the backend.",
          "Map email fields (subject/sender) to ticket fields."
        ];

  return (
    <div className="gs-modal" role="dialog" aria-modal="true" aria-labelledby="gs-title">
      <div className="gs-panel">
        <button className="gs-close" onClick={onClose} aria-label="Close">×</button>
        <div className="gs-body">
          <h2 id="gs-title">{title}</h2>
          <p className="lead">{desc}</p>
          <ol>
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div style={{ marginTop: 16 }}>
            <button className="btn primary" onClick={onConnect}>Connect</button>
            <button className="btn ghost" style={{ marginLeft: 8 }} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [gsOpen, setGsOpen] = useState(false);
  const [gsType, setGsType] = useState(null);

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
                <strong>100%</strong>
                <span>Uptime</span>
              </div>
            </div>
          </div>

          <div className="hero-media">
            <div className="card">
              <DemoVideo />
            </div>
          </div>
        </div>
      </header>

      <section className="features container">
        <div className="features-header">
          <h2 className="section-title">Features</h2>
          <p className="section-desc">
            Key capabilities to automate requests, manage workflows and deliver results faster.
          </p>
        </div>

        <div className="features-grid">
          <Feature icon={<FiZap />} title="Centralized Request Intake"
            desc="Capture all data requests, issues, and tasks in one unified system with structured forms."
          />

          <Feature icon={<FiUsers />} title="Intelligent Routing"
            desc="Automatically route requests to the right teams based on rules, categories, or workload."
          />

          <Feature icon={<FiClock />} title="Workflow & SLA Automation"
            desc="Define workflows, set SLAs, trigger reminders, and prevent delays with smart automation."
          />

          <Feature icon={<FiBarChart2 />} title="Operational Visibility"
            desc="Real-time dashboards provide insights into request volume, turnaround time, and team performance."
          />

          <Feature icon={<FiShield />} title="Compliance & Audit Trails"
            desc="Maintain complete request history with secure access controls and audit logs."
          />

          <Feature icon={<FiMail />} title="Email & Slack Notifications"
            desc="Automatically create tickets from emails, and get notifications on ticket creation and status updates via email and Slack for real-time tracking."
          />

         <Feature
  icon={<FiMessageCircle />}
  title="Chatbot & Slack Ticket Creation"
  desc="Create tickets instantly through a chatbot or directly from Slack channels using simple commands without leaving the conversation."
/>
        </div>
      </section>

      <section className="how container">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <h4>Submit a Request</h4>
            <p>Users submit data requests, issues, or tasks through structured forms, email, Slack, chatbot, or API.</p>
          </div>
          <div className="step">
            <div className="num">2</div>
            <h4>Auto-Route & Prioritize</h4>
            <p>The system automatically assigns the request to the right team, sets priority, and applies SLA rules.</p>
          </div>
          <div className="step">
            <div className="num">3</div>
            <h4>Track & Collaborate</h4>
            <p>Teams collaborate, update status, add comments, and track progress in real time.</p>
          </div>
          <div className="step">
            <div className="num">4</div>
            <h4>Deliver & Audit</h4>
            <p>Once resolved, stakeholders are notified and a complete audit trail is maintained for compliance.</p>
          </div>
        </div>
      </section>

    {/* Integration section */}
    <section className="integrations container">
      <div className="integrations-header">
        <h2 className="section-title">Integration</h2>
        <p className="section-desc">Connect with the tools your team already uses — notifications, ticket creation, and more.</p>
      </div>

      <div className="integrations-grid">
        <div className="integration-card">
          <div className="integration-top">
            <div className="integration-logo" aria-hidden>
              <img src="https://easyretro.io/_nuxt/img/slack.d3d87b8.svg" alt="Slack" />
            </div>
            <div className="integration-info">
              <h3>Slack</h3>
              <div className="integration-badge">Slack integration for ticketing</div>
            </div>
          </div>
          <p className="integration-desc">Create tickets from Slack and send notifications to channels or users when tickets are created or updated.</p>
          <div className="integration-actions">
            <button
              className="btn ghost"
              onClick={() => {
                setGsType("slack");
                setGsOpen(true);
              }}
            >
              Learn more
            </button>
          </div>
        </div>

        <div className="integration-card">
          <div className="integration-top">
            <div className="integration-logo" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Email">
                <path d="M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11z" stroke="#0b74ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 6.5l-9 7.25L3 6.5" stroke="#0b74ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="integration-info">
              <h3>Email</h3>
            </div>
          </div>
          <p className="integration-desc">Create tickets from incoming email and send email notifications for ticket updates and assignments.</p>
          <div className="integration-actions">
            <button
              className="btn ghost"
              onClick={() => {
                setGsType("email");
                setGsOpen(true);
              }}
            >
              Learn more
            </button>
          </div>
        </div>

      </div>
    </section>

    {gsOpen && (
      <GettingStartedModal
        type={gsType}
        onClose={() => setGsOpen(false)}
        onConnect={() => {
          setGsOpen(false);
          if (gsType === "slack") navigate("/integrations/slack");
          if (gsType === "email") navigate("/integrations/email");
        }}
      />
    )}

      <footer className="footer">
        <div className="container footer-inner">
          <div>© 2025 Segmento</div>
          <div>
            <button className="link" onClick={() => navigate("/register")}>Try free</button>
          </div>
        </div>
      </footer>
    </div>
  );
}