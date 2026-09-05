import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Referrals.css";

export default function Referrals() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/users/referrals")
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load referrals"))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(data.referralLink);
    toast.success("Referral link copied!");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(data.referralCode);
    toast.success("Referral code copied!");
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="referrals-page container">
      <div className="page-header">
        <h1 className="page-title">👥 Referral Center</h1>
      </div>

      <div className="referral-hero">
        <div className="referral-hero-text">
          <h2>Earn KES 50 Per Referral</h2>
          <p>Share your unique link. When a friend registers using it, you instantly earn KES 50 credited to your balance.</p>
        </div>
        <div className="referral-stats-row">
          <div className="ref-stat">
            <strong>{data?.referralCount || 0}</strong>
            <span>Total Referrals</span>
          </div>
          <div className="ref-stat">
            <strong>KES {(data?.referralEarnings || 0).toFixed(2)}</strong>
            <span>Referral Earnings</span>
          </div>
        </div>
      </div>

      <div className="referral-cards">
        <div className="card">
          <h3 className="section-title">Your Referral Code</h3>
          <div className="code-display">
            <span className="ref-code-big">{data?.referralCode}</span>
            <button className="btn btn-outline btn-sm" onClick={copyCode}>Copy Code</button>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Your Referral Link</h3>
          <div className="link-display">
            <span className="ref-link-text">{data?.referralLink}</span>
            <button className="btn btn-primary btn-sm" onClick={copyLink}>📋 Copy Link</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3 className="section-title">Your Referrals ({data?.referralCount || 0})</h3>
        {!data?.referrals?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Membership</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.map((r) => (
                  <tr key={r._id}>
                    <td><strong>{r.fullName}</strong></td>
                    <td>{r.email}</td>
                    <td>
                      <span className={`badge ${r.membershipStatus === "active" ? "badge-success" : "badge-warning"}`}>
                        {r.membershipStatus}
                      </span>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
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
