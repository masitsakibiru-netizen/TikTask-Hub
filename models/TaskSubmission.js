const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    proofLink: {
      type: String,
      required: true,
    },
    proofImage: {
      type: String,
      default: null,
    },
    reward: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: Date,
    reviewNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaskSubmission", submissionSchema);
