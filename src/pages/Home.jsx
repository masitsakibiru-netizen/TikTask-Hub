import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const features = [
  { icon: "📱", title: "Social Media Tasks", desc: "Complete TikTok, YouTube, Instagram tasks and earn real money." },
  { icon: "💰", title: "Get Paid Fast", desc: "Withdraw your earnings via M-Pesa instantly." },
  { icon: "👥", title: "Refer & Earn", desc: "Invite friends and earn KES 50 for every successful referral." },
  { icon: "🔒", title: "100% Secure", desc: "Your data and payments are fully secured." },
];

const steps = [
  { num: "1", title: "Register", desc: "Create your free account in minutes" },
  { num: "2", title: "Pay Membership", desc: "Activate your account with a one-time payment" },
  { num: "3", title: "Complete Tasks", desc: "Do social media tasks and earn rewards" },
  { num: "4", title: "Withdraw", desc: "Send earnings directly to M-Pesa" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">🚀 Earn from Social Media</div>
            <h1 className="hero-title">
              Get Paid to Complete
              <span className="gradient-text"> Social Tasks</span>
            </h1>
            <p className="hero-subtitle">
              Join thousands of Kenyans earning daily by completing simple social media tasks.
              No experience needed — just your phone and internet.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Start Earning Today</Link>
                  <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>5,000+</strong><span>Active Users</span></div>
              <div className="hero-stat"><strong>KES 500K+</strong><span>Paid Out</span></div>
              <div className="hero-stat"><strong>KES 50</strong><span>Per Referral</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Start earning in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header">
            <h2>Why TikTask Hub?</h2>
            <p>Everything you need to start earning online</p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Earning?</h2>
          <p>Join TikTask Hub today and start making money from your phone.</p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2024 TikTask Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
