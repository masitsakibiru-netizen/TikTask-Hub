const Payment = require("../models/Payment");
const User = require("../models/User");
const { stkPush } = require("../services/mpesaService");

const MEMBERSHIP_AMOUNT = 500; // KES 500 membership fee

exports.initiateMembershipPayment = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findById(req.user._id);

    if (user.membershipStatus === "active") {
      return res.status(400).json({ message: "Membership already active" });
    }

    // Create pending payment record
    const payment = await Payment.create({
      userId: req.user._id,
      amount: MEMBERSHIP_AMOUNT,
      phoneNumber,
      type: "membership",
    });

    try {
      const stkResponse = await stkPush({
        amount: MEMBERSHIP_AMOUNT,
        phoneNumber,
        accountReference: `TTKH-${user._id.toString().slice(-6).toUpperCase()}`,
        transactionDesc: "TikTask Hub Membership",
      });

      payment.checkoutRequestId = stkResponse.CheckoutRequestID;
      payment.merchantRequestId = stkResponse.MerchantRequestID;
      await payment.save();

      res.json({
        message: "STK Push sent. Enter M-Pesa PIN on your phone.",
        checkoutRequestId: stkResponse.CheckoutRequestID,
        paymentId: payment._id,
      });
    } catch (mpesaError) {
      payment.status = "failed";
      await payment.save();
      console.error("M-Pesa error:", mpesaError.response?.data || mpesaError.message);
      return res.status(500).json({
        message: "M-Pesa request failed. Please try again.",
        error: mpesaError.response?.data?.errorMessage || mpesaError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;

    if (!callbackData) {
      return res.status(400).json({ message: "Invalid callback" });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

    const payment = await Payment.findOne({ checkoutRequestId: CheckoutRequestID });

    if (!payment) {
      console.log("Payment not found for checkout:", CheckoutRequestID);
      return res.json({ message: "OK" });
    }

    payment.rawResponse = callbackData;

    if (ResultCode === 0) {
      // Success
      const metadata = CallbackMetadata?.Item || [];
      const receipt = metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value;

      payment.status = "completed";
      payment.mpesaReceiptNumber = receipt;
      await payment.save();

      // Activate membership
      const user = await User.findById(payment.userId);
      if (user) {
        user.membershipStatus = "active";
        user.membershipActivatedAt = new Date();
        await user.save();
      }
    } else {
      payment.status = "failed";
      await payment.save();
    }

    res.json({ message: "OK" });
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Security: only own payments
    if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateMembershipManually = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { membershipStatus: "active", membershipActivatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Create manual payment record
    await Payment.create({
      userId: req.params.userId,
      amount: 0,
      phoneNumber: user.phone,
      status: "completed",
      type: "membership",
      mpesaReceiptNumber: `MANUAL-${Date.now()}`,
    });

    res.json({ message: "Membership activated manually", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
