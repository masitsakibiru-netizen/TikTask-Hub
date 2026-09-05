import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎯</span>
          TikTask Hub
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard")}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/tasks" className={`nav-link ${isActive("/tasks")}`} onClick={() => setMenuOpen(false)}>Tasks</Link>
              <Link to="/referrals" className={`nav-link ${isActive("/referrals")}`} onClick={() => setMenuOpen(false)}>Referrals</Link>
              <Link to="/withdraw" className={`nav-link ${isActive("/withdraw")}`} onClick={() => setMenuOpen(false)}>Withdraw</Link>

              {user.role === "admin" && (
                <Link to="/admin" className={`nav-link nav-admin ${isActive("/admin")}`} onClick={() => setMenuOpen(false)}>⚙ Admin</Link>
              )}

              <div className="nav-user">
                <span className="user-name">👤 {user.fullName?.split(" ")[0]}</span>
                <span className={`user-badge ${user.membershipStatus === "active" ? "active" : "inactive"}`}>
                  {user.membershipStatus === "active" ? "✓ Member" : "Inactive"}
                </span>
              </div>

              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive("/login")}`} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
