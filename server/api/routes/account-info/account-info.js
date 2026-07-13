import UserModel from "../../../models/userModel.js";
import getDB from "../../../lib/connnections/Connections.js";
import { PasswordService } from "../../../lib/PasswordService.js";
import Router from "express";
import textModel from "../../../models/multi-media/textModel.js";
import workspaceModel from "../../../models/CanvaspaceModel.js";

const accountRouter = Router();

//finds and returns info about a user
accountRouter
  .get("/:userid/account-info", async (req, res) => {
    await getDB();
    const userid = req.user?.sub;
    const user = await UserModel.findOne({ _id: userid });

    if (!user) {
      return res.status(404).json({ error: "Failed to retrieve", status: 404 });
    }
    return res.status(200).json({ data: user, status: 200 });
  })
  .patch("/:userid/account-info", async (req, res) => {
    try {
      //finds and updates user data
      await getDB();
      const userid = req.user?.sub;
      console.log(userid);
      console.log(req);

      const { firstname,
        lastname,
        gender,
        dob,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword } = req.body;

      //check for incoming logs while doing maintnance
      console.log(firstname,
        lastname,
        gender,
        dob,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword);



      const user = await UserModel.findById(userid);
      if (!user) {
        return res.status(404).json({ error: "Account ID not found.", status: 404 });
      } else {
        if (!currentPassword) {
          return res.status(400).json({ message: "Enter the currently used password with your new credentials to continue" })
        }
        const passwordService = new PasswordService();

        if (passwordService.isLegacyHash(user.password)) {
          return res.status(409).json({
            code: "PASSWORD_RESET_REQUIRED",
            message: "For your security, please reset your password via account recovery to continue.",
            status: 409,
          });
        }

        const checkPassword = await passwordService.verifyPassword(
          currentPassword,
          user.password
        )
        if (
          !checkPassword
        ) {
          return res.status(403).json({ message: "Current password incorrect", status: 403 });
        }
        else {
          const newAccountInfo = {};
          if (firstname) newAccountInfo.firstname = firstname;
          if (lastname) newAccountInfo.lastname = lastname;
          if (gender) newAccountInfo.gender = gender;
          if (dob) newAccountInfo.dob = dob;
          if (email) newAccountInfo.email = email;
          //these three work together
          if (newPassword && confirmNewPassword) {
            newAccountInfo.password = await passwordService.hashPassword(newPassword);
          }
          if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: "New passwords don't match", status: 400 });
          }
          await UserModel.updateOne(
            { _id: user._id },
            {
              $set: newAccountInfo,
            },
            { new: true }
          );
          return res.status(200).json({
            message: "Your account info has been updated.",
            status: 200,
          });
        }
      }
    }
    catch (err) {
      return res.status(500).json({ message: err.message + " :and " + err.stack })
    };
  })
  .delete("/:userid/account-info", async (req, res) => {
    try {
      //finds and updates user data
      await getDB();
      const userid = req.user?.sub;
      const user = await UserModel.findOne({ _id: userid });
      if (!user) {
        return res.status(404).json({ error: "Account ID not found.", status: 404 });
      }
      else {
        const findusertextData = await textModel.find({ owner: userid });
        // console.log("findusertextData: ", findusertextData);
        if (findusertextData) {
          const reqToDeleteTextComponents =
            await textModel.deleteMany({
              owner: user._id,
            });

          if (reqToDeleteTextComponents) {
            const reqToDeleteCanvaspaces = await workspaceModel.deleteMany({
              owner: user._id,
            });

            if (reqToDeleteCanvaspaces) {
              const reqToDelete_OneUser = await UserModel.deleteOne({ _id: userid })

              if (reqToDelete_OneUser) {
                res.clearCookie(`authtoken${req.params.userid}`);
                return res.status(200).json({
                  success: true,
                  code: "SINGLE_USER_DATA_DELETED",
                  status: 200,
                  message: "User Data Wiped",
                });
              }
              else {
                return res.status(404).json({
                  success: false,
                  code: "USER_DATA_DELETION_FAILED",
                  status: 404,
                  message: "Failed to remove a user's data.",
                });
              }
            }
            else {
              return res.status(404).json({
                success: true,
                code: "SINGLE_USER_DATA_NOT_DELETED",
                status: 200,
                message: "User Data Not Wiped",
              });
            }
          } else {
            return res.status(404).json({
              success: false,
              code: "WORKSPACE_DATA_DELETION_FAILED",
              status: 404,
              message: "Failed to delete the requested workspace's data",
            });
          }

        }
      }

      return res.status(200).json({
        message: "No response",
        status: 200,
      });
    }
    catch (err) {
      return res.status(500).json({ message: err.message + " :and " + err.stack })
    };
  }
  )
export default accountRouter;
