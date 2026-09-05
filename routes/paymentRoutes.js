const express = require("express");
const router = express.Router();
const {
  initiateMembershipPayment,
  mpesaCallback,
  checkPaymentStatus,
  getMyPayments,
  getAllPayments,
  activateMembershipManually,
} = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/membership", authMiddleware, initiateMembershipPayment);
router.post("/callback", mpesaCallback); // No auth - called by Safaricom
router.get("/status/:id", authMiddleware, checkPaymentStatus);
router.get("/my", authMiddleware, getMyPayments);

// Admin
router.get("/all", authMiddleware, adminMiddleware, getAllPayments);
router.post("/activate/:userId", authMiddleware, adminMiddleware, activateMembershipManually);

module.exports = router;
