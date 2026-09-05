import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./PayMembership.css";

export default function PayMembership() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [checkoutId, setCheckoutId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [polling, setPolling] = useState(false);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    API.get("/payments/my")
      .then((r) => setPayments(r.data))
      .catch(() => {});
  }, []);

  // Poll payment status
  useEffect(() => {
    if (!paymentId || !polling) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/payments/status/${paymentId}`);
        if (res.data.status === "completed") {
          clearInterval(interval);
          setPolling(false);
          toast.success("🎉 Payment successful! Membership activated.");
          await refreshUser();
          navigate("/dashboard");
        } else if (res.data.status === "failed") {
          clearInterval(interval);
          setPolling(false);
          toast.error("Payment failed or was cancelled. Please try again.");
        }
      } catch {
        clearInterval(interval);
        setPolling(false);
      }
    }, 5000);

    // Stop polling after 3 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
      toast.warning("Payment timeout. If you paid, it will reflect shortly.");
    }, 180000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentId, polling]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!phone) return toast.error("Phone number required");
    setLoading(true);
    try {
      const res = await API.post("/payments/membership", { phoneNumber: phone });
      setCheckoutId(res.data.checkoutRequestId);
      setPaymentId(res.data.paymentId);
      setPolling(true);
      toast.info("📱 Check your phone! Enter M-Pesa PIN to complete payment.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  if (user?.membershipStatus === "active") {
    return (
      <div className="membership-page container">
        <div className="card membership-active">
          <div className="active-icon">✅</div>
          <h2>Membership Active</h2>
          <p>Your membership is currently active. Enjoy all premium features!</p>
          <button className="btn btn-primary" onClick={() => navigate("/tasks")}>
            View Tasks →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="membership-page container">
      <div className="page-header">
        <h1 className="page-title">⚡ Activate Membership</h1>
      </div>

      <div className="membership-layout">
        <div className="card">
          <div className="membership-plan">
            <div className="plan-icon">🎯</div>
            <h2>TikTask Hub Member</h2>
            <div className="plan-price">
              <span className="price-amount">KES 500</span>
              <span className="price-period">One-time</span>
            </div>
            <ul className="plan-features">
              <li>✅ Access all paid tasks</li>
              <li>✅ Earn real money daily</li>
              <li>✅ M-Pesa withdrawals</li>
              <li>✅ Referral bonuses</li>
              <li>✅ Priority support</li>
              <li>✅ Unlimited submissions</li>
            </ul>
          </div>

          {polling ? (
            <div className="payment-waiting">
              <div className="spinner" />
              <p>Waiting for M-Pesa payment confirmation...</p>
              <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                Enter your M-Pesa PIN on your phone to complete payment.
              </p>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => { setPolling(false); setPaymentId(null); }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label className="form-label">M-Pesa Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.4rem" }}>
                  An M-Pesa STK push will be sent to this number.
                </p>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? "Sending STK Push..." : "Pay KES 500 via M-Pesa"}
              </button>
            </form>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>💳 Payment History</h3>
            {payments.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>No payments yet.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td>KES {p.amount}</td>
                        <td>
                          <span className={`badge ${p.status === "completed" ? "badge-success" : p.status === "failed" ? "badge-danger" : "badge-warning"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>❓ How it works</h3>
            <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
              <li>Enter your M-Pesa number</li>
              <li>Click "Pay via M-Pesa"</li>
              <li>Enter PIN on your phone</li>
              <li>Membership activates instantly</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
