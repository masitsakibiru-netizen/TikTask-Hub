import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/submissions/all${filter ? `?status=${filter}` : ""}`);
      setSubmissions(res.data);
    } catch {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, [filter]);

  const approve = async (id) => {
    setProcessing({ ...processing, [id]: true });
    try {
      await API.put(`/submissions/approve/${id}`);
      toast.success("Submission approved & user credited!");
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setProcessing({ ...processing, [id]: false });
    }
  };

  const reject = async (id) => {
    const note = prompt("Reason for rejection (optional):");
    setProcessing({ ...processing, [id]: true });
    try {
      await API.put(`/submissions/reject/${id}`, { note: note || "" });
      toast.success("Submission rejected");
      fetchSubmissions();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setProcessing({ ...processing, [id]: false });
    }
  };

  const statusBadge = (status) => {
    const map = { pending: "badge-warning", approved: "badge-success", rejected: "badge-danger" };
    return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
  };

  return (
    <AdminLayout title="📤 Task Submissions">
      <div className="filter-tabs">
        {["", "pending", "approved", "rejected"].map((s) => (
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
                  <th>Task</th>
                  <th>Reward</th>
                  <th>Proof</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>No submissions</td></tr>
                )}
                {submissions.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div><strong>{s.userId?.fullName}</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.userId?.email}</div>
                    </td>
                    <td>
                      <div><strong>{s.taskId?.title}</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.taskId?.platform}</div>
                    </td>
                    <td><strong style={{ color: "#16a34a" }}>KES {s.reward}</strong></td>
                    <td>
                      <a href={s.proofLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        🔗 View
                      </a>
                      {s.proofImage && (
                        <a href={s.proofImage} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginLeft: "0.25rem" }}>
                          📷 Image
                        </a>
                      )}
                    </td>
                    <td>{statusBadge(s.status)}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      {s.status === "pending" && (
                        <div className="action-cell">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => approve(s._id)}
                            disabled={processing[s._id]}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => reject(s._id)}
                            disabled={processing[s._id]}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                      {s.status !== "pending" && <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Processed</span>}
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
