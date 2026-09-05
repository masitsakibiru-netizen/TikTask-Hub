const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

// Public - get active tasks (with optional auth for admin to see all)
router.get("/", (req, res, next) => {
  const auth = require("../middleware/authMiddleware");
  const token = req.header("Authorization");
  if (token) return auth(req, res, next);
  next();
}, getTasks);

router.get("/:id", getTask);

// Admin only
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createTask);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateTask);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTask);
router.patch("/:id/toggle", authMiddleware, adminMiddleware, toggleTaskStatus);

module.exports = router;
