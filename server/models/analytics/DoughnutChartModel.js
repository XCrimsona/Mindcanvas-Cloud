import mongoose from "mongoose";

const DatasetsSchema = new mongoose.Schema({

    label: {
        type: String,
        required: [true, "Label is required"]
    },
    data: { type: [Number], required: [true, "Numeric data is required"] },
    backgroundColor: { type: [String], required: [true, "Background color is required"] },
    borderColor: { type: [String], required: [true, "Border color is required"] },
    borderWidth: { type: Number, required: [true, "Border width is required"] },
    hoverOffset: { type: Number, required: [true, "Hover offset is required"] },
    offset: { type: Number, required: [true, "Offset is required"] },
});


const LegendLabelsSchema = new mongoose.Schema({
    boxWidth: { type: Number, required: [true, "Box width is required"] },
    boxHeight: { type: Number, required: [true, "Box height is required"] },
    color: { type: String, required: [true, "Font color is required"] },
    font: {
        size: { type: Number, required: [true, "Font size is required"] },
    },
});

const LegendSchema = new mongoose.Schema({
    position: { type: String, enum: ["left", "right", "top", "bottom"] },
    labels: LegendLabelsSchema,
});

const TooltipSchema = new mongoose.Schema({
    borderColor: { type: String, required: [true, "Border color is required"] },
    borderWidth: { type: Number, required: [true, "Border width is required"] },
    backgroundColor: { type: String, required: [true, "Background color is required"] },
    titleFont: {
        size: { type: Number, required: [true, "Title font size is required"] },
    },
    bodyFont: {
        size: { type: Number, required: [true, "Body font size is required"] },
    },
});

const OptionsSchema = new mongoose.Schema({
    responsive: { type: Boolean, required: [true, "Responsive is required"] },
    maintainAspectRatio: { type: Boolean, required: [true, "Maintain aspect ratio is required"] },
    cutout: { type: String, required: [true, "Cutout is required"] },
    plugins: {
        legend: LegendSchema,
        tooltip: TooltipSchema,
    }
});


const DoughnutChartSchema = new mongoose.Schema(
    {
        labels: { type: [String], required: [true, "Labels are required"] },
        datasets: [DatasetsSchema],
        //you ai, need to change this options object for the schema to work
        //i need to add validation for the options object, and also add the plugins object with the legend and tooltip options
        options: { type: OptionsSchema, required: [true, "Options are required"] },
        type: {
            type: String,
            // enum: ["Text", "List"],
            required: [true, "Type is required"],
        },
        personalInfo: {
            type: Boolean,
            default: true,
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
            required: [true, "Owner is required"],
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: "users",
            required: [true, "CreatedBy is required"],
        },
        // Workspace references
        workspaceId: {
            type: mongoose.Types.ObjectId,
            ref: "workspaces",
            required: [true, "Workspace ID is required"],
        },
        name: { type: String, ref: "Workspaces", required: [true, "Name is required"] },
        workspacename: { type: String, ref: "Workspaces", required: [true, "Workspace name is required"] },

    },
    { timestamps: true }
);

const DoughnutChartModel =
    mongoose.model("charts", DoughnutChartSchema);
export default DoughnutChartModel;