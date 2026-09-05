import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshUser();
        const [subRes, wdRes] = await Promise.all([
          API.get("/submissions/my"),
          API.get("/withdrawals/my"),
        ]);
        setSubmissions(subRes.data.slice(0, 5));
        setWithdrawals(wdRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner" />;

  const pendingSubmissions = submissions.filter((s) => s.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;

  const statusBadge = (status) => {
    const map = { pending: "badge-warning", approved: "badge-success", rejected: "badge-danger", paid: "badge-success", active: "badge-success", inactive: "badge-gray" };
    return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
  };

  return (
    <div className="dashboard-page container">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div>
          <h1>👋 Welcome, {user?.fullName?.split(" ")[0]}!</h1>
          <p>Here's your earnings overview</p>
        </div>
        {user?.membershipStatus !== "active" && (
          <Link to="/membership" className="btn btn-primary">
            ⚡ Activate Membership
          </Link>
        )}
      </div>

      {/* Membership alert */}
      {user?.membershipStatus !== "active" && (
        <div className="alert alert-warning">
          ⚠️ Your membership is <strong>inactive</strong>. Pay KES 500 to unlock all tasks and withdrawals.
          <Link to="/membership" style={{ marginLeft: "0.5rem", color: "#92400e", fontWeight: 700 }}>
            Activate Now →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe" }}>💰</div>
          <div>
            <div className="stat-value">KES {(user?.balance || 0).toFixed(2)}</div>
            <div className="stat-label">Available Balance</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>📈</div>
          <div>
            <div className="stat-value">KES {(user?.totalEarnings || 0).toFixed(2)}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7" }}>⭐</div>
          <div>
            <div className="stat-value">KES {(user?.todayEarnings || 0).toFixed(2)}</div>
            <div className="stat-label">Today's Earnings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dbeafe" }}>✅</div>
          <div>
            <div className="stat-value">{user?.completedTasks || 0}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2" }}>⏳</div>
          <div>
            <div className="stat-value">{pendingSubmissions}</div>
            <div className="stat-label">Pending Submissions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f3f4f6" }}>💸</div>
          <div>
            <div className="stat-value">KES {(user?.totalWithdrawn || 0).toFixed(2)}</div>
            <div className="stat-label">Total Withdrawn</div>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="info-grid">
        <div className="card">
          <h3 className="card-title">👤 Account Info</h3>
          <div className="info-list">
            <div className="info-row"><span>Name</span><strong>{user?.fullName}</strong></div>
            <div className="info-row"><span>Email</span><strong>{user?.email}</strong></div>
            <div className="info-row"><span>Phone</span><strong>{user?.phone}</strong></div>
            <div className="info-row">
              <span>Membership</span>
              {statusBadge(user?.membershipStatus)}
            </div>
            <div className="info-row"><span>Referral Code</span>
              <strong className="ref-code">{user?.referralCode}</strong>
            </div>
            <div className="info-row"><span>Referral Earnings</span>
              <strong>KES {(user?.referralEarnings || 0).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">⚡ Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/tasks" className="quick-action-btn">
              <span>📋</span> View Tasks
            </Link>
            <Link to="/withdraw" className="quick-action-btn">
              <span>💸</span> Withdraw
            </Link>
            <Link to="/referrals" className="quick-action-btn">
              <span>👥</span> Referrals
            </Link>
            {user?.membershipStatus !== "active" && (
              <Link to="/membership" className="quick-action-btn highlight">
                <span>⚡</span> Pay Membership
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="page-header">
          <h3 className="card-title">📤 Recent Submissions</h3>
          <Link to="/tasks" className="btn btn-outline btn-sm">View Tasks</Link>
        </div>
        {submissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No submissions yet. <Link to="/tasks">Start a task!</Link></p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Reward</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s._id}>
                    <td>{s.taskId?.title || "—"}</td>
                    <td>KES {s.reward}</td>
                    <td>{statusBadge(s.status)}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Withdrawals */}
      <div className="card">
        <div className="page-header">
          <h3 className="card-title">💸 Recent Withdrawals</h3>
          <Link to="/withdraw" className="btn btn-outline btn-sm">Withdraw</Link>
        </div>
        {withdrawals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>No withdrawals yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td>KES {w.amount}</td>
                    <td>{w.phoneNumber}</td>
                    <td>{statusBadge(w.status)}</td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
