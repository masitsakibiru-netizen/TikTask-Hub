const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

const MINIMUM_WITHDRAWAL = 100;

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    if (!amount || !phoneNumber) {
      return res.status(400).json({ message: "Amount and phone number are required" });
    }

    const numAmount = parseFloat(amount);

    if (numAmount < MINIMUM_WITHDRAWAL) {
      return res.status(400).json({ message: `Minimum withdrawal is KES ${MINIMUM_WITHDRAWAL}` });
    }

    const user = await User.findById(req.user._id);

    if (user.membershipStatus !== "active") {
      return res.status(403).json({ message: "Active membership required to withdraw" });
    }

    if (numAmount > user.balance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Check for pending withdrawal
    const pendingWithdrawal = await Withdrawal.findOne({
      userId: req.user._id,
      status: "pending",
    });
    if (pendingWithdrawal) {
      return res.status(400).json({ message: "You have a pending withdrawal request" });
    }

    // Deduct balance immediately (hold funds)
    user.balance -= numAmount;
    await user.save();

    const withdrawal = await Withdrawal.create({
      userId: req.user._id,
      amount: numAmount,
      phoneNumber,
    });

    res.status(201).json({ message: "Withdrawal request submitted", withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const withdrawals = await Withdrawal.find(filter)
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }

    withdrawal.status = "approved";
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Update user total withdrawn
    await User.findByIdAndUpdate(withdrawal.userId, {
      $inc: { totalWithdrawn: withdrawal.amount },
    });

    res.json({ message: "Withdrawal approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Withdrawal already processed" });
    }

    withdrawal.status = "rejected";
    withdrawal.note = req.body.note || "";
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Refund balance
    await User.findByIdAndUpdate(withdrawal.userId, {
      $inc: { balance: withdrawal.amount },
    });

    res.json({ message: "Withdrawal rejected and balance refunded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

    withdrawal.status = "paid";
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({ message: "Withdrawal marked as paid" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
