import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = "/admin/users";
      const params = [];
      if (search) params.push(`search=${search}`);
      if (membershipFilter) params.push(`status=${membershipFilter}`);
      if (params.length) url += "?" + params.join("&");
      const res = await API.get(url);
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [membershipFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const updateUser = async (id, updates, msg) => {
    setProcessing({ ...processing, [id]: true });
    try {
      await API.put(`/admin/users/${id}`, updates);
      toast.success(msg);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProcessing({ ...processing, [id]: false });
    }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const resetBalance = async (id) => {
    if (!confirm("Reset this user's balance to 0?")) return;
    try {
      await API.put(`/admin/users/${id}/reset-balance`);
      toast.success("Balance reset");
      fetchUsers();
    } catch {
      toast.error("Reset failed");
    }
  };

  const activateManually = async (userId) => {
    try {
      await API.post(`/payments/activate/${userId}`);
      toast.success("Membership activated");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Activation failed");
    }
  };

  return (
    <AdminLayout title="👥 User Management">
      <div className="search-bar">
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.75rem", flex: 1 }}>
          <input
            className="form-input"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <select className="form-input" style={{ maxWidth: 180 }} value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)}>
          <option value="">All Members</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <div style={{ marginBottom: "0.75rem", color: "#6b7280", fontSize: "0.875rem" }}>
            {users.length} users found
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Membership</th>
                  <th>Balance</th>
                  <th>Earnings</th>
                  <th>Tasks</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>No users found</td></tr>
                )}
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div><strong>{u.fullName}</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{u.email}</div>
                      {u.isSuspended && <span className="badge badge-danger" style={{ marginTop: "0.2rem" }}>Suspended</span>}
                    </td>
                    <td>{u.phone}</td>
                    <td>
                      <span className={`badge ${u.membershipStatus === "active" ? "badge-success" : "badge-warning"}`}>
                        {u.membershipStatus}
                      </span>
                    </td>
                    <td>KES {(u.balance || 0).toFixed(2)}</td>
                    <td>KES {(u.totalEarnings || 0).toFixed(2)}</td>
                    <td>{u.completedTasks || 0}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-cell">
                        {u.membershipStatus !== "active" && (
                          <button className="btn btn-success btn-sm" onClick={() => activateManually(u._id)} disabled={processing[u._id]}>
                            Activate
                          </button>
                        )}
                        {u.membershipStatus === "active" && (
                          <button className="btn btn-warning btn-sm" onClick={() => updateUser(u._id, { membershipStatus: "inactive" }, "Membership deactivated")} disabled={processing[u._id]}>
                            Deactivate
                          </button>
                        )}
                        <button
                          className={`btn btn-sm ${u.isSuspended ? "btn-success" : "btn-warning"}`}
                          onClick={() => updateUser(u._id, { isSuspended: !u.isSuspended }, u.isSuspended ? "User unsuspended" : "User suspended")}
                          disabled={processing[u._id]}
                        >
                          {u.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => resetBalance(u._id)}>Reset Bal</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id, u.fullName)}>Delete</button>
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
