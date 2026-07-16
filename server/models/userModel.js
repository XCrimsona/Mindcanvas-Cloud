import mongoose from "mongoose";
const userschema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "Please use Alphanumeric characters"],
    },
    lastname: {
      type: String,
      required: [true, "Please use Alphanumeric characters"],
    },
    gender: {
      type: String,
      required: [false, "User's gender optional"],
      enum: [
        "Agender",
        "Female",
        "Genderfluid",
        "Male",
        "Non-binary",
        "Other",
        "Transgender Woman",
        "Transgender Man"
      ]
    },
    dob: {
      type: String,
      maxlength: [12, "Dob too long"],
    },
    email: {
      type: String,
      unique: true,
      maxlength: [50, "Email too long (max 50 characters)"],
      required: [true, "Please use a valid email address"],
    },
    workspaces: {
      type: [{ type: mongoose.Types.ObjectId, ref: "workspaces" }],
      default: [],
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 140,
      required: [
        true,
        "Use special, and alphanumeric characters for a strong password.",
      ],
    },
    role: {
      type: String,
      default: "user",
      enum: ["user"],
      required: [true, "Role is required"],
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", userschema);
export default UserModel;
