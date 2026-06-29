import UserModel from "../../../models/userModel.js";
import getDB from "../../../lib/connnections/Connections.js";
import Router from "express";
import { PasswordService } from "../../../lib/PasswordService.js";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import sessionModel from "../../../models/sessionModel.js";
import si from "systeminformation"
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  //15 minutes
  max: 10,                    //max 5 requests per IP
  message: "Too many login attempts, try again in 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(res.get("RateLimit-Reset"));  //seconds left
    res.status(429).json({
      message: "Too many login attempts. Try again later.",
      retryAfter: `${retryAfter} seconds`
    });
  }
});


const loginRouter = Router();
loginRouter
  .get("/", async (req, res) => {
    try {
      await getDB();
      return res.status(200).json({ status: 200 });
    } catch (err) {
      return res.status(500).json({
        error: err.message || "Unexpected connection error",
        status: 500,
      });
    }
  })
  .post("/", authLimiter, async (req, res) => {
    try {
      await getDB();
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });

      if (!email || !password) {
        return res.status(400).json({ message: "Please fill required fields!", status: 400 });
      }

      if (!user) {
        return res.status(404).json({ message: "Enter email doesn't exist!", status: 404 });
      }

      const passwordService = new PasswordService();
      const currentPassword = await passwordService.comparePasswords(
        password,
        user.password
      )
      if (
        !currentPassword
      ) {
        throw new Error("Incorrect Credentials");
      }
      const tokenId = crypto.randomUUID();
      const payload = {
        sub: user._id,
        sid: tokenId,
        role: user.role,
      };

      //device info
      const osData = si.osInfo()
      const system = si.system()
      const chassis = si.chassis()
      const deviceData = `${(await osData).platform} ${(await system).manufacturer} ${(await chassis).type}`
      const session = await sessionModel.find({ userId: user._id });

      if (session.length >= 1) {
        await sessionModel.deleteMany({ userId: user._id, device: deviceData })
      }
      //Save session in DB (optional, for multi-device control)
      await sessionModel.create({
        userId: user._id,
        tokenId,
        device: deviceData,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)  //1 hour
      });

      const token = jwt.sign(payload, process.env.JWT, {
        expiresIn: "1h",
      });

      //signedToken created and sent to front for including credentials
      res.cookie("mc_authtoken", token, {
        secure: process.env.SECURE === "true",//have an alternative or the if t he env doesnt see it directly it can fall back. if that is missing you may get kicked out
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1 * 60 * 60 * 1000,
      })
      return res.status(200).json({ code: "AUTHENTICATED", user: user._id, message: "User authenticated" });
    } catch (err) {
      return res.status(500).json({
        message: err.message || "Unexpected server error",
        status: 500,
      });
    }
  });
export default loginRouter