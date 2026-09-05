const express = require("express");
const router = express.Router();
const {
  submitProof,
  getMySubmissions,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
} = require("../controllers/submissionController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

router.post("/submit", authMiddleware, upload.single("proofImage"), submitProof);
router.get("/my", authMiddleware, getMySubmissions);

// Admin
router.get("/all", authMiddleware, adminMiddleware, getAllSubmissions);
router.put("/approve/:id", authMiddleware, adminMiddleware, approveSubmission);
router.put("/reject/:id", authMiddleware, adminMiddleware, rejectSubmission);

module.exports = router;
