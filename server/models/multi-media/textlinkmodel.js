import mongoose from "mongoose";


const textlinkSchema = new mongoose.Schema(
    {
        //component definitions
        link: {
            type: String,
            minlength: [1, "Text content cannot be empty"],
            maxlength: [6000, "Text content too long (max 6000 characters)"],
            required: [true, "Link desctination is required"],
        },
        shareInfo: {
            type: Boolean,
        },
        text: {
            type: String,
            minlength: [1, "Text content cannot be empty"],
            maxlength: [10000, "Text content too long (max 10 K characters)"],
            required: [true, "Component link description is required"],
        },
        type: {
            type: String,
            enum: ["TextLink"],
            required: [true, "component type is required"],
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
            required: [true, "owner is required"],
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: [true, "createdBy is required"],
        },
        // Workspace references
        workspaceId: {
            type: mongoose.Types.ObjectId,
            ref: "workspaces",
            required: [true, "workspaceId is required"],
        },
        name: {
            type: String,
            ref: "workspaces",
            required: [true, "workspace name is required"],
        },
        workspacename: {
            type: String,
            ref: "workspaces",
            required: [true, "workspacename is required"],
        },
    },
    { timestamps: true }
);

const textLinkModel = mongoose.model("links", textlinkSchema);
export default textLinkModel;
