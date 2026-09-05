import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout title="Dashboard"><div className="spinner" /></AdminLayout>;

  const stats = data?.stats || {};

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#ede9fe", link: "/admin/users" },
    { label: "Active Members", value: stats.activeMembers, icon: "✅", color: "#dcfce7", link: "/admin/users?status=active" },
    { label: "Total Tasks", value: stats.totalTasks, icon: "📋", color: "#dbeafe", link: "/admin/tasks" },
    { label: "Active Tasks", value: stats.activeTasks, icon: "🟢", color: "#d1fae5", link: "/admin/tasks" },
    { label: "Pending Submissions", value: stats.pendingSubmissions, icon: "⏳", color: "#fef3c7", link: "/admin/submissions" },
    { label: "Approved Submissions", value: stats.totalSubmissions, icon: "✔️", color: "#dcfce7", link: "/admin/submissions" },
    { label: "Pending Withdrawals", value: stats.pendingWithdrawals, icon: "💸", color: "#fee2e2", link: "/admin/withdrawals" },
    { label: "Total Payments", value: stats.totalPayments, icon: "💳", color: "#ede9fe", link: "/admin/payments" },
    { label: "Membership Revenue", value: `KES ${(stats.totalMembershipRevenue || 0).toLocaleString()}`, icon: "💰", color: "#fef3c7", link: "/admin/payments" },
    { label: "Total Withdrawn", value: `KES ${(stats.totalWithdrawalAmount || 0).toLocaleString()}`, icon: "🏦", color: "#fee2e2", link: "/admin/withdrawals" },
  ];

  return (
    <AdminLayout title="📊 Admin Dashboard">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
        {cards.map((c) => (
          <Link to={c.link} key={c.label} style={{ textDecoration: "none" }}>
            <div className="stat-card admin-stat-card">
              <div className="stat-icon" style={{ background: c.color }}>{c.icon}</div>
              <div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="admin-quick-actions">
        <div className="card">
          <h3 className="card-section-title" style={{ marginBottom: "1rem" }}>⚡ Quick Actions</h3>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/admin/tasks" className="btn btn-primary btn-sm">+ Add Task</Link>
            <Link to="/admin/submissions?status=pending" className="btn btn-warning btn-sm">Review Submissions</Link>
            <Link to="/admin/withdrawals?status=pending" className="btn btn-danger btn-sm">Process Withdrawals</Link>
            <Link to="/admin/users" className="btn btn-outline btn-sm">Manage Users</Link>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      {data?.recentUsers?.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="page-header" style={{ marginBottom: "1rem" }}>
            <h3 className="card-section-title">👥 Recent Users</h3>
            <Link to="/admin/users" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Membership</th>
                  <th>Balance</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.fullName}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.membershipStatus === "active" ? "badge-success" : "badge-warning"}`}>
                        {u.membershipStatus}
                      </span>
                    </td>
                    <td>KES {(u.balance || 0).toFixed(2)}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
