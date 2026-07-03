import dotenv from "dotenv"
dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

import express from "express";
import registerRouter from "./api/routes/register/registerGroup.js";
import loginRouter from "./api/routes/login/loginGroup.js";
import accountRouter from "./api/routes/account-info/account-info.js";
import canvasManagementRouter from "./api/routes/canvas-management/canvas-management.js";
import singleDynamiCanvaDataGroupRouter from "./api/routes/canvas-management/single-dynamic-canva-data-group.js";
import cors from "cors"
import helmet from "helmet";
import { isAuthenticated } from "./lib/Auth.js";
import cookieParser from "cookie-parser";
import signOut from "./api/routes/signout-route/signout-group.js";
import AccountRecoveryRouter from "./api/routes/account-recovery/AccountRecoveryGroup.js";
import morgan from "morgan";
import searchRouter from "./api/routes/canvas-management/canvas-search.js";
import videoLoader from "./api/routes/canvas-management/videoLoader.js";
import imageLoader from "./api/routes/canvas-management/imageLoader.js";
import tableManagementRouter from "./api/routes/canvas-management/table-management.js";
const port = process.env.PORT;
const app = express();

try {
    const allowedOrigins = Object.freeze({
        origin: process.env.FRONTEND_URL
    });
    console.log(allowedOrigins.origin);

    app.set("trust proxy", 1);
    app.use(cookieParser())
    app.use(morgan('dev'))
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }))
    app.use(cors({
        origin: allowedOrigins.origin,
        credentials: true//allow cookies to be sent
    }))

    //enable submissions
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    //routes no auth
    app.use("/api/signup-portal", registerRouter)
    app.use("/api/signin-portal", loginRouter)
    app.use("/api/signin-portal", AccountRecoveryRouter);

    //routes auth required
    app.get("/api/auth-check", isAuthenticated, (req, res) => {
        res.status(200).json({
            code: "AUTHENTICATED",
            userid: req.user.sub,
            role: req.user.role,
        });
    });

    app.use("/api/account", isAuthenticated, accountRouter);
    app.use("/api/account", isAuthenticated, canvasManagementRouter);
    app.use("/api/account", isAuthenticated, searchRouter);
    app.use("/api/account", isAuthenticated, singleDynamiCanvaDataGroupRouter);
    //router endpoint called loader for simplicity
    app.use("/api/account", isAuthenticated, videoLoader);//router endpoint called loader for simplicity
    app.use("/api/account", isAuthenticated, imageLoader);//router endpoint called loader for simplicity
    app.use("/api/account", isAuthenticated, tableManagementRouter);
    app.use("/api/account", isAuthenticated, signOut);

    //Railway is a container platform — it always needs an active listener bound to process.env.PORT.
    //Locally, process.env.PORT comes from .env and the dev server listens on that port.
    app.listen(port, () => console.log(`listening on ${port}`));
}
catch (err) {
    console.warn("server anomaly message: ", err.message);
    console.warn("server anomaly stack: ", err.stack);
}