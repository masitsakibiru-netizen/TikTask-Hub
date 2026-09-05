import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/withdrawals/all${filter ? `?status=${filter}` : ""}`);
      setWithdrawals(res.data);
    } catch {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, [filter]);

  const action = async (id, endpoint, successMsg) => {
    setProcessing({ ...processing, [id]: true });
    try {
      let body = {};
      if (endpoint.includes("reject")) {
        const note = prompt("Rejection reason (optional):");
        body = { note: note || "" };
      }
      await API.put(`/withdrawals/${endpoint}/${id}`, body);
      toast.success(successMsg);
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessing({ ...processing, [id]: false });
    }
  };

  const statusBadge = (status) => {
    const map = { pending: "badge-warning", approved: "badge-info", rejected: "badge-danger", paid: "badge-success" };
    return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
  };

  return (
    <AdminLayout title="💸 Withdrawal Management">
      <div className="filter-tabs">
        {["", "pending", "approved", "paid", "rejected"].map((s) => (
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
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>No withdrawals</td></tr>
                )}
                {withdrawals.map((w) => (
                  <tr key={w._id}>
                    <td>
                      <div><strong>{w.userId?.fullName}</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{w.userId?.phone}</div>
                    </td>
                    <td><strong>KES {w.amount}</strong></td>
                    <td>{w.phoneNumber}</td>
                    <td>{statusBadge(w.status)}</td>
                    <td>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-cell">
                        {w.status === "pending" && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => action(w._id, "approve", "Withdrawal approved")} disabled={processing[w._id]}>Approve</button>
                            <button className="btn btn-danger btn-sm" onClick={() => action(w._id, "reject", "Withdrawal rejected & balance refunded")} disabled={processing[w._id]}>Reject</button>
                          </>
                        )}
                        {w.status === "approved" && (
                          <button className="btn btn-primary btn-sm" onClick={() => action(w._id, "paid", "Marked as paid")} disabled={processing[w._id]}>Mark Paid</button>
                        )}
                        {(w.status === "paid" || w.status === "rejected") && (
                          <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>—</span>
                        )}
                      </div>
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
