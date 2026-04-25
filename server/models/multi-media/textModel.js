import mongoose from "mongoose";


const textSchema = new mongoose.Schema(
  {
    //component definitions
    text: {
      type: String,
      minlength: [1, "Text content cannot be empty"],
      maxlength: [8000, "Text content too long (max 8000 characters)"],
      required: true,
    },
    personalInfo: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["Text", "List"],
      required: true,
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
    //user references
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // Workspace references
    workspaceId: {
      type: mongoose.Types.ObjectId,
      ref: "workspaces",
      required: true,
    },
    name: {
      type: String,
      ref: "workspaces",
      required: [true, "name is required"],
    },
    workspacename: {
      type: String,
      ref: "workspaces",
      required: [true, "workspacename is required"],
    },
  },
  { timestamps: true }
);

const textModel = mongoose.model("texts", textSchema);
export default textModel;

textSchema.index({ text: "text", name: "text", workspacename: "text" });