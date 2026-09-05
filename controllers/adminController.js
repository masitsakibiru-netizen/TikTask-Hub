const User = require("../models/User");
const Task = require("../models/Task");
const TaskSubmission = require("../models/TaskSubmission");
const Withdrawal = require("../models/Withdrawal");
const Payment = require("../models/Payment");
const bcrypt = require("bcryptjs");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeMembers,
      totalTasks,
      activeTasks,
      pendingSubmissions,
      totalSubmissions,
      pendingWithdrawals,
      totalWithdrawals,
      totalPayments,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ membershipStatus: "active" }),
      Task.countDocuments(),
      Task.countDocuments({ status: "active" }),
      TaskSubmission.countDocuments({ status: "pending" }),
      TaskSubmission.countDocuments({ status: "approved" }),
      Withdrawal.countDocuments({ status: "pending" }),
      Withdrawal.countDocuments(),
      Payment.countDocuments({ status: "completed" }),
    ]);

    const earningsAgg = await Withdrawal.aggregate([
      { $match: { status: { $in: ["approved", "paid"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const paymentsAgg = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentUsers = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        activeMembers,
        totalTasks,
        activeTasks,
        pendingSubmissions,
        totalSubmissions,
        pendingWithdrawals,
        totalWithdrawals,
        totalPayments,
        totalWithdrawalAmount: earningsAgg[0]?.total || 0,
        totalMembershipRevenue: paymentsAgg[0]?.total || 0,
      },
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = { role: "user" };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.membershipStatus = status;

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { membershipStatus, role, isSuspended, balance } = req.body;
    const updates = {};

    if (membershipStatus !== undefined) {
      updates.membershipStatus = membershipStatus;
      if (membershipStatus === "active") {
        updates.membershipActivatedAt = new Date();
      }
    }
    if (role !== undefined) updates.role = role;
    if (isSuspended !== undefined) updates.isSuspended = isSuspended;
    if (balance !== undefined) updates.balance = parseFloat(balance);

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetUserBalance = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balance: 0, totalEarnings: 0, todayEarnings: 0 },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Balance reset", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("referralCode");
    if (!user) return res.status(404).json({ message: "User not found" });

    const referrals = await User.find({ referredBy: user.referralCode }).select(
      "fullName email createdAt membershipStatus"
    );
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
