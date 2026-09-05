import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./Tasks.css";

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [proofs, setProofs] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, subRes] = await Promise.all([
          API.get("/tasks"),
          user ? API.get("/submissions/my") : Promise.resolve({ data: [] }),
        ]);
        setTasks(taskRes.data);
        setMySubmissions(subRes.data);
      } catch (err) {
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSubmissionStatus = (taskId) => {
    return mySubmissions.find(
      (s) => s.taskId?._id === taskId && s.status !== "rejected"
    );
  };

  const submitProof = async (taskId) => {
    const proofLink = proofs[taskId];
    if (!proofLink?.trim()) return toast.error("Please paste your proof link");
    if (!user) return toast.error("Please login first");
    if (user.membershipStatus !== "active") {
      return toast.error("Active membership required. Please pay KES 500 to activate.");
    }

    setSubmitting({ ...submitting, [taskId]: true });
    try {
      await API.post("/submissions/submit", { taskId, proofLink });
      toast.success("Proof submitted! Pending review.");
      const subRes = await API.get("/submissions/my");
      setMySubmissions(subRes.data);
      setProofs({ ...proofs, [taskId]: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting({ ...submitting, [taskId]: false });
    }
  };

  if (loading) return <div className="spinner" />;

  const platformColors = {
    TikTok: "#000",
    YouTube: "#ff0000",
    Instagram: "#e1306c",
    Twitter: "#1da1f2",
    Facebook: "#1877f2",
  };

  return (
    <div className="tasks-page container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Available Tasks</h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{tasks.length} tasks available</p>
        </div>
        {user?.membershipStatus !== "active" && (
          <Link to="/membership" className="btn btn-primary">⚡ Activate to Earn</Link>
        )}
      </div>

      {user?.membershipStatus !== "active" && (
        <div className="alert alert-warning">
          ⚠️ <strong>Membership required</strong> — Activate your account for KES 500 to submit tasks.
          <Link to="/membership" style={{ marginLeft: "0.5rem", fontWeight: 700 }}>Activate Now →</Link>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>No tasks available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => {
            const submission = getSubmissionStatus(task._id);
            const platformColor = platformColors[task.platform] || "#6c63ff";

            return (
              <div key={task._id} className="task-card">
                {task.image && (
                  <div className="task-image">
                    <img src={task.image} alt={task.title} />
                  </div>
                )}
                <div className="task-body">
                  <div className="task-header">
                    <span className="task-platform" style={{ background: platformColor }}>
                      {task.platform}
                    </span>
                    <span className="task-reward">KES {task.reward}</span>
                  </div>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-desc">{task.description}</p>
                  <a href={task.link} target="_blank" rel="noreferrer" className="task-link">
                    🔗 Open Task Link
                  </a>

                  {submission ? (
                    <div className={`submission-status ${submission.status}`}>
                      {submission.status === "pending" && "⏳ Submission under review"}
                      {submission.status === "approved" && "✅ Approved — KES " + submission.reward + " credited"}
                    </div>
                  ) : (
                    <div className="proof-section">
                      <input
                        type="url"
                        className="form-input"
                        placeholder="Paste screenshot/proof link here..."
                        value={proofs[task._id] || ""}
                        onChange={(e) => setProofs({ ...proofs, [task._id]: e.target.value })}
                      />
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => submitProof(task._id)}
                        disabled={submitting[task._id] || user?.membershipStatus !== "active"}
                      >
                        {submitting[task._id] ? "Submitting..." : "Submit Proof"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
