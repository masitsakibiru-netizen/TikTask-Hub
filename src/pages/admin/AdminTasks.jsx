import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

const BLANK = { platform: "", title: "", description: "", link: "", reward: "", status: "active" };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditing(task._id);
    setForm({
      platform: task.platform,
      title: task.title,
      description: task.description,
      link: task.link,
      reward: task.reward,
      status: task.status,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.platform || !form.title || !form.description || !form.link || !form.reward) {
      return toast.error("All fields are required");
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await API.put(`/tasks/${editing}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Task updated");
      } else {
        await API.post("/tasks", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Task created");
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await API.patch(`/tasks/${id}/toggle`);
      toast.success(res.data.message);
      fetchTasks();
    } catch {
      toast.error("Toggle failed");
    }
  };

  return (
    <AdminLayout title="📋 Task Management">
      <div className="page-header">
        <div />
        <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Title</th>
                  <th>Reward</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>No tasks yet</td></tr>
                )}
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td><span className="badge badge-purple">{t.platform}</span></td>
                    <td><strong>{t.title}</strong></td>
                    <td><strong style={{ color: "#16a34a" }}>KES {t.reward}</strong></td>
                    <td>
                      <span className={`badge ${t.status === "active" ? "badge-success" : "badge-gray"}`}>{t.status}</span>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-cell">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                        <button
                          className={`btn btn-sm ${t.status === "active" ? "btn-warning" : "btn-success"}`}
                          onClick={() => handleToggle(t._id)}
                        >
                          {t.status === "active" ? "Disable" : "Enable"}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? "Edit Task" : "Create Task"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Platform</label>
                <select className="form-input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} required>
                  <option value="">Select platform</option>
                  {["TikTok", "YouTube", "Instagram", "Twitter", "Facebook", "Other"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ resize: "vertical" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Task Link (URL)</label>
                <input type="url" className="form-input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Reward (KES)</label>
                <input type="number" className="form-input" min={1} value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Task Image (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ width: "100%" }} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Task" : "Create Task"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
