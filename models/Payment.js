const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    checkoutRequestId: {
      type: String,
      unique: true,
      sparse: true,
    },
    merchantRequestId: String,
    mpesaReceiptNumber: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["membership"],
      default: "membership",
    },
    rawResponse: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
