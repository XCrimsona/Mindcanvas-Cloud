import getDB from "../../../lib/connnections/Connections.js";
import sessionModel from "../../../models/sessionModel.js";
import UserModel from "../../../models/userModel.js";
import Router from "express";


//loads all canva data depending on id access
const signOut = Router();
signOut
    .post("/:userid/logout", async (req, res) => {
        try {
            await getDB();
            const userid = req.user?.sub;
            if (!userid) {
                res.status(401).json({
                    success: false,
                    code: "NOT_AUTHORIZED",
                    status: 401,
                    message: "User not logged in",
                });
            } else {
                const user = await UserModel.findById(String(userid));
                if (!user) {
                    res.status(401).json({
                        success: false,
                        code: "USER_NOT_AUTHORIZED",
                        status: 401,
                        message: "User is not logged in",
                    });
                }
                else {
                    await sessionModel.deleteOne({ tokenId: req.user.tokenId });
                    if (sessionModel) {
                        console.log("cookie route works");

                        res.clearCookie("mc_authtoken", {
                            secure: process.env.SECURE === "true",
                            httpOnly: true,
                            sameSite: process.env.SECURE === "true" ? "none" : "lax",//must match the login cookie's sameSite or the browser will refuse to clear it
                            maxAge: 1 * 60 * 60 * 1000,
                        })

                        res.status(200).json({
                            success: true,
                            code: "USER_LOGOUT_SUCCESS",
                            status: 200,
                            message: "User logged out successfully",
                        });
                    }

                    else {
                        res.status(404).json({
                            success: false,
                            code: "REQUESTED_COOKIE_NOT_FOUND",
                            status: 404,
                            message: "Requested cookie not found!",
                        });
                    }
                }
            }
        } catch (err) {
            console.log("err: ", err.message);

            res.status(500).json({

                success: false,
                code: "SERVER_WORKSPACE_ERROR",
                status: 500,
                message: "The server side workspace has issues",
            });
        }
    });
export default signOut;