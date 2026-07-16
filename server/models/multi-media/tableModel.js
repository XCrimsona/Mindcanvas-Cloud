import mongoose from "mongoose";

const COLUMN_TYPES = ["Text", "Number", "Date", "Link", "Boolean"];

const columnSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Column name is required"],
      minlength: [1, "Column name cannot be empty"],
      maxlength: [120, "Column name too long (max 120 characters)"],
    },
    columnType: {
      type: String,
      enum: COLUMN_TYPES,
      default: "Text",
      required: true,
    },
  },
  { _id: false }
);

const rowSchema = new mongoose.Schema(
  {
    cells: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const tableSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: [true, "Table name is required"],
      minlength: [1, "Table name cannot be empty"],
      maxlength: [200, "Table name too long (max 200 characters)"],
    },
    columns: {
      type: [columnSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "A table must have at least one column",
      },
    },
    rows: {
      type: [rowSchema],
      default: [],
    },
    type: {
      type: String,
      enum: ["Table"],
      default: "Table",
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
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
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

tableSchema.index({ tableName: "text", name: "text", workspacename: "text" });

const tableModel = mongoose.model("tables", tableSchema);
export default tableModel;
export { COLUMN_TYPES };
