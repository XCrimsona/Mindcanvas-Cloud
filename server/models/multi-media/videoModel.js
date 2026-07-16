import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      min: 4,
      required: [true, "Src is required"],
    },
    type: {
      type: String,
      enum: ["Video"],
      required: true,
    },
    personalInfo: {
      type: Boolean,
      default: true,
    },
    frameSize: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    position: {
      x: {
        type: Number,
        required: [true, "X coordinate is required"],
        min: 0,
      },
      y: {
        type: Number,
        required: [true, "Y coordinate is required"],
        min: 0,
      },
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: [true, "owner is required"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: [true, "createdBy is required"],
    },
    workspaceId: {
      type: mongoose.Types.ObjectId,
      ref: "workspaces",
      required: [true, "workspaceId is required"],
    },
  },
  { timestamps: true }
);

const videoModel =
  mongoose.model("videos", videoSchema);
export default videoModel;

videoSchema.index({ owner: 1 });
videoSchema.index({ text: 1 });
videoSchema.index({ src: 1 });