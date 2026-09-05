const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("referralCode referralEarnings");

    const referrals = await User.find({ referredBy: user.referralCode }).select(
      "fullName email createdAt membershipStatus"
    );

    res.json({
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      referrals,
      referralCount: referrals.length,
      referralLink: `${process.env.CLIENT_URL || "http://localhost:5173"}/register?ref=${user.referralCode}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
