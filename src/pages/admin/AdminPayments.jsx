import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/payments/all");
      setPayments(res.data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const filtered = filter ? payments.filter((p) => p.status === filter) : payments;

  const activateUser = async (userId) => {
    try {
      await API.post(`/payments/activate/${userId}`);
      toast.success("Membership activated");
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminLayout title="💳 Payment Management">
      <div className="stats-grid" style={{ marginBottom: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#dcfce7" }}>💰</div>
          <div>
            <div className="stat-value">KES {totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe" }}>✅</div>
          <div>
            <div className="stat-value">{payments.filter((p) => p.status === "completed").length}</div>
            <div className="stat-label">Completed Payments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7" }}>⏳</div>
          <div>
            <div className="stat-value">{payments.filter((p) => p.status === "pending").length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fee2e2" }}>❌</div>
          <div>
            <div className="stat-value">{payments.filter((p) => p.status === "failed").length}</div>
            <div className="stat-label">Failed</div>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        {["", "pending", "completed", "failed"].map((s) => (
          <button
            key={s || "all"}
            className={`filter-tab ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>No payments</td></tr>
                )}
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div><strong>{p.userId?.fullName}</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{p.userId?.email}</div>
                    </td>
                    <td><strong>KES {p.amount}</strong></td>
                    <td>{p.phoneNumber}</td>
                    <td>
                      <span className={`badge ${p.status === "completed" ? "badge-success" : p.status === "failed" ? "badge-danger" : "badge-warning"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>{p.mpesaReceiptNumber || "—"}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      {p.status !== "completed" && p.userId?._id && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => activateUser(p.userId._id)}
                        >
                          Activate
                        </button>
                      )}
                    </td>
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
