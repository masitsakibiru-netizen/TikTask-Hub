const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  try {
    const { platform, title, description, link, reward } = req.body;

    if (!platform || !title || !description || !link || !reward) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const taskData = {
      platform,
      title,
      description,
      link,
      reward: parseFloat(reward),
      createdBy: req.user._id,
    };

    if (req.file) {
      taskData.image = `/uploads/${req.file.filename}`;
    }

    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const filter = req.user?.role === "admin" ? {} : { status: "active" };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    if (updates.reward) updates.reward = parseFloat(updates.reward);

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.status = task.status === "active" ? "inactive" : "active";
    await task.save();
    res.json({ message: `Task ${task.status}`, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
