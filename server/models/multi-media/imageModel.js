import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    pathtoimages: {
      type: String,
      required: [true, "path to images is required"],
    },
    shareInfo: {
      type: Boolean,
    },
    //NEW STRUCTURE
    imagecluster: [
      {
        name: {
          type: String,
          required: true,
        },

        mime: {
          type: String,
          enum: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/svg+xml",
            "image/webp",
            "image/avif",
          ],
          required: true,
        },

        imagepath: {
          type: String,
          required: true,
        },
      },
    ],

    type: {
      type: String,
      enum: ["Images"],
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

//indexes
imageSchema.index({ owner: 1 });
imageSchema.index({ workspaceId: 1 });
imageSchema.index({ "imagecluster.imagepath": 1 });

const imageModel = mongoose.model("images", imageSchema);
export default imageModel;