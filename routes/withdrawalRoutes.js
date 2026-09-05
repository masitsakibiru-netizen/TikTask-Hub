const express = require("express");
const router = express.Router();
const {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markPaid,
} = require("../controllers/withdrawalController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/request", authMiddleware, requestWithdrawal);
router.get("/my", authMiddleware, getMyWithdrawals);

// Admin
router.get("/all", authMiddleware, adminMiddleware, getAllWithdrawals);
router.put("/approve/:id", authMiddleware, adminMiddleware, approveWithdrawal);
router.put("/reject/:id", authMiddleware, adminMiddleware, rejectWithdrawal);
router.put("/paid/:id", authMiddleware, adminMiddleware, markPaid);

module.exports = router;
