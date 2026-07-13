import { PasswordService } from "./PasswordService.js";
import UserModel from "../models/userModel.js";
import { TokenService } from "./JwtTokenService.js";
import jwt from "jsonwebtoken"
import getDB from "./connnections/Connections.js"
import sessionModel from "../models/sessionModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.mc_authtoken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authenticated",
        code: "UNAUTHENTICATED",
      })
    }
    else {
      await getDB()
      const decoded = jwt.verify(token, process.env.JWT);
      const session = await sessionModel.find({ tokenId: decoded.sid, userId: decoded.sub });

      if (!session) {
        return res.status(401).json({ success: false, code: "UNAUTHORIZED", message: 'Session not valid' });
      }
      else {
        req.user = { sub: decoded.sub, tokenId: decoded.sid, device: session.device };
        next();
      }
    }
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      code: "UNAUTHORIZED",
    })
  }
}

