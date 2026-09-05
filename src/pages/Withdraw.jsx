import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Withdraw.css";

const MIN_WITHDRAWAL = 100;

const statusBadge = (status) => {
  const map = {
    pending: "badge-warning",
    approved: "badge-info",
    rejected: "badge-danger",
    paid: "badge-success",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
};

export default function Withdraw() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ amount: "", phoneNumber: user?.phone || "" });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshUser();
        const res = await API.get("/withdrawals/my");
        setWithdrawals(res.data);
      } catch {
        toast.error("Failed to load withdrawal history");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.phoneNumber) return toast.error("All fields are required");
    if (parseFloat(form.amount) < MIN_WITHDRAWAL) {
      return toast.error(`Minimum withdrawal is KES ${MIN_WITHDRAWAL}`);
    }
    if (parseFloat(form.amount) > (user?.balance || 0)) {
      return toast.error("Insufficient balance");
    }

    setSubmitting(true);
    try {
      await API.post("/withdrawals/request", form);
      toast.success("Withdrawal request submitted!");
      setForm({ amount: "", phoneNumber: user?.phone || "" });
      await refreshUser();
      const res = await API.get("/withdrawals/my");
      setWithdrawals(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;

  const canWithdraw = user?.membershipStatus === "active";

  return (
    <div className="withdraw-page container">
      <div className="page-header">
        <h1 className="page-title">💸 Withdrawals</h1>
      </div>

      <div className="withdraw-layout">
        {/* Form */}
        <div className="card">
          <h3 className="card-section-title">Request Withdrawal</h3>

          <div className="balance-display">
            <div>
              <span>Available Balance</span>
              <strong>KES {(user?.balance || 0).toFixed(2)}</strong>
            </div>
            <div>
              <span>Minimum</span>
              <strong>KES {MIN_WITHDRAWAL}</strong>
            </div>
          </div>

          {!canWithdraw && (
            <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>
              ⚠️ Active membership required to withdraw.
              <Link to="/membership" style={{ marginLeft: "0.4rem", fontWeight: 700 }}>Activate →</Link>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Amount (KES)</label>
              <input
                type="number"
                className="form-input"
                placeholder={`Min KES ${MIN_WITHDRAWAL}`}
                min={MIN_WITHDRAWAL}
                max={user?.balance || 0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">M-Pesa Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="07XXXXXXXX"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || !canWithdraw}
            >
              {submitting ? "Submitting..." : "Request Withdrawal"}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="card">
          <h3 className="card-section-title">📌 Withdrawal Info</h3>
          <ul className="info-list-items">
            <li>✅ Minimum withdrawal: <strong>KES {MIN_WITHDRAWAL}</strong></li>
            <li>✅ Paid via <strong>M-Pesa</strong></li>
            <li>✅ Processed within <strong>24 hours</strong></li>
            <li>⚠️ Active membership required</li>
            <li>⚠️ One pending request at a time</li>
          </ul>

          <div className="withdraw-summary">
            <div className="ws-row"><span>Total Earned</span><strong>KES {(user?.totalEarnings || 0).toFixed(2)}</strong></div>
            <div className="ws-row"><span>Total Withdrawn</span><strong>KES {(user?.totalWithdrawn || 0).toFixed(2)}</strong></div>
            <div className="ws-row"><span>Available</span><strong style={{ color: "#16a34a" }}>KES {(user?.balance || 0).toFixed(2)}</strong></div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3 className="card-section-title">Withdrawal History</h3>
        {withdrawals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
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
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td><strong>KES {w.amount}</strong></td>
                    <td>{w.phoneNumber}</td>
                    <td>{statusBadge(w.status)}</td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td>{w.note || "—"}</td>
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
