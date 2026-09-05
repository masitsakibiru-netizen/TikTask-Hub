const TaskSubmission = require("../models/TaskSubmission");
const Task = require("../models/Task");
const User = require("../models/User");

exports.submitProof = async (req, res) => {
  try {
    const { taskId, proofLink } = req.body;

    if (!taskId || !proofLink) {
      return res.status(400).json({ message: "Task ID and proof link are required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.status !== "active") return res.status(400).json({ message: "Task is not active" });

    // Check membership
    const user = await User.findById(req.user._id);
    if (user.membershipStatus !== "active") {
      return res.status(403).json({ message: "Active membership required to complete tasks" });
    }

    // Prevent duplicate submission
    const existing = await TaskSubmission.findOne({
      userId: req.user._id,
      taskId,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted this task" });
    }

    const submissionData = {
      userId: req.user._id,
      taskId,
      proofLink,
      reward: task.reward,
    };

    if (req.file) {
      submissionData.proofImage = `/uploads/${req.file.filename}`;
    }

    const submission = await TaskSubmission.create(submissionData);
    await submission.populate("taskId", "title platform reward");

    res.status(201).json({ message: "Proof submitted successfully", submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await TaskSubmission.find({ userId: req.user._id })
      .populate("taskId", "title platform reward image")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const submissions = await TaskSubmission.find(filter)
      .populate("userId", "fullName email phone")
      .populate("taskId", "title platform reward")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSubmission = async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (submission.status === "approved") return res.status(400).json({ message: "Already approved" });

    submission.status = "approved";
    submission.reviewedAt = new Date();
    await submission.save();

    const user = await User.findById(submission.userId);
    if (user) {
      user.balance += submission.reward;
      user.totalEarnings += submission.reward;
      user.todayEarnings += submission.reward;
      user.completedTasks += 1;
      await user.save();
    }

    res.json({ message: "Submission approved and user credited" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSubmission = async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.status = "rejected";
    submission.reviewedAt = new Date();
    submission.reviewNote = req.body.note || "";
    await submission.save();

    res.json({ message: "Submission rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
