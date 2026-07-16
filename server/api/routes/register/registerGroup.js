import UserModel from "../../../models/userModel.js";
import getDB from "../../../lib/connnections/Connections.js";
import { Router } from "express";
import { PasswordService } from "../../../lib/PasswordService.js";
const registrationRouter = Router();

registrationRouter.get("/", async (req, res) => {

  try {
    await getDB();
    return res.json({ status: 200 });
  } catch (err) {
    return res.json(
      { message: err.message || "Unexpected connection error" },
      { status: 500 }
    );
  }
})
  .post("/", async (req, res) => {
    try {
      await getDB();
      console.log("post register route");
      const { firstname, lastname, gender, dob, email, password } = req.body;
      // console.log(req.body.email);

      const user = await UserModel.findOne({ email: email });
      if (!firstname || !lastname || !email || !password) {
        return res.status(400).json(
          { message: "Please fill required fields!", status: 400 }
        );
      }
      if (user) {
        return res.status(409).json({ message: "Account Name Already Exists", status: 409 })
      }
      else {
        const data = {};
        const passwordService = new PasswordService();
        const hashpassword = await passwordService.hashPassword(password);
        if (firstname) data.firstname = firstname;
        if (lastname) data.lastname = lastname;
        if (gender) data.gender = gender;
        if (dob) data.dob = dob;
        if (email) data.email = email;
        if (password) {
          data.password = hashpassword;
        }
        data.role = "user"
        const newUserData = await UserModel.create(data);
        if (newUserData._id) {
          return res.status(200).json({ message: "Account created" });
        }
        else {
          return res.status(500).json({ message: "Something went wrong, please try again" });
        }
      }
    } catch (err) {
      console.log("Register issue: ", err.message);
      return res.status(500).json(
        { message: err.message || "Unexpected server error" });
    }
  })

export default registrationRouter
