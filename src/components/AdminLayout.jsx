import { Link, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const links = [
  { to: "/admin", label: "📊 Dashboard", exact: true },
  { to: "/admin/users", label: "👥 Users" },
  { to: "/admin/tasks", label: "📋 Tasks" },
  { to: "/admin/submissions", label: "📤 Submissions" },
  { to: "/admin/withdrawals", label: "💸 Withdrawals" },
  { to: "/admin/payments", label: "💳 Payments" },
];

export default function AdminLayout({ children, title }) {
  const location = useLocation();

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname.startsWith(link.to);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link ${isActive(link) ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/dashboard" className="sidebar-link">
            ← User View
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        {title && (
          <div className="page-header" style={{ marginBottom: "1.5rem" }}>
            <h1 className="page-title">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
