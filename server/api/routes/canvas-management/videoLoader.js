import getDB from "../../../lib/connnections/Connections.js";
import Router from "express";
import videoModel from "../../../models/multi-media/videoModel.js";
import fs from 'fs';

// ===============================
// OLD IMPORTS — What these were and why they are no longer needed:
//
// import UserModel from "../../../models/userModel.js";
// import canvaspaceModel from "../../../models/CanvaspaceModel.js";
//
// The old route used a three-step lookup chain:
//   1. Find the User document by userid
//   2. Find the Canvaspace document by user._id + canvaid
//   3. Find the Video document by canvaspace._id + user._id + videoid
//
// This was three sequential database round-trips per video request.
// The new approach (matching imageLoader.js) goes directly to the video document
// in one query using req.user?.sub (the JWT-verified userid), canvaid, and videoid.
// Security is identical — req.user?.sub comes from the verified JWT, not the URL.
// ===============================

// import path from "path";
// path was imported but unused in the final version. Removed for cleanliness.

const videoLoader = Router();

// ===============================
// OLD CODE — The original route handler and why it was replaced:
//
// videoLoader.get("/:userid/canvas-management/:canvaid/video/:videoid", async (req, res) => {
//   try {
//     await getDB();
//     const userid = req.user?.sub;
//     const canvaid = req.params.canvaid;
//     const videoid = req.params.videoid;
//
//     // STEP 1 — Find the user (unnecessary round-trip)
//     const user = await UserModel.findOne({ _id: userid });
//     if (!user) {
//       return res.status(404).json({ success: false, code: "MISSING_USER_DATA", message: "User data not found" });
//     } else {
//
//       // STEP 2 — Find the canvaspace (unnecessary round-trip)
//       const canvaspace = await canvaspaceModel.findOne({ createdBy: user._id, _id: canvaid });
//       if (canvaspace) {
//
//         // STEP 3 — Find the video
//         const video = await videoModel.findOne({ workspaceId: canvaspace._id, createdBy: user._id, _id: videoid });
//         if (video) {
//           const videoPath = video.path;
//           const stat = fs.statSync(videoPath);
//           const fileSize = stat.size;
//           const range = req.headers.range;
//
//           // RANGE-REQUEST BRANCH — This handled browser scrubbing for native <video> elements.
//           // When a user clicked mid-video, the browser sent a Range header (e.g. "bytes=5000000-")
//           // and this branch responded with HTTP 206 Partial Content, streaming only that chunk.
//           // This kept the HTTP connection OPEN and persistent — the browser held a connection
//           // slot for the entire session the video player was alive on the page.
//           // With the browser's 6-connection-per-origin limit, this silently starved the
//           // ImageQueueContextProvider workers, preventing large ImageClusters from loading.
//           //
//           // if (range) {
//           //   const parts = range.replace(/bytes=/, "").split("-");
//           //   const start = parseInt(parts[0], 10);
//           //   const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//           //   const chunksize = (end - start) + 1;
//           //   const file = fs.createReadStream(videoPath, { start, end });
//           //   const head = {
//           //     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//           //     'Accept-Ranges': 'bytes',
//           //     'Content-Length': chunksize,
//           //     'Content-Type': 'video/mp4',
//           //   };
//           //   res.writeHead(206, head);
//           //   file.pipe(res);
//           // } else {
//           //   const head = { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' };
//           //   res.writeHead(200, head);
//           //   fs.createReadStream(videoPath).pipe(res);
//           // }
//         }
//       }
//     }
//   } catch (err) { ... }
// });
//
// WHY THE RANGE-REQUEST BRANCH IS NO LONGER NEEDED:
// The frontend Video.tsx now fetches the full video as a Blob before the player renders.
// Once the Blob object URL is assigned to <video src>, the browser handles scrubbing
// entirely from local memory — no further HTTP requests are made to the server at all.
// The connection closes after the initial full-file transfer, freeing the slot immediately.
// ===============================

// NEW CODE — Simplified route matching imageLoader.js architecture.
// One database query. Full file stream. Connection closes on completion.
// Scrubbing is handled client-side via the Blob URL — no range requests needed.
videoLoader.get("/:userid/canvas-management/:canvaid/video/:videoid", async (req, res) => {
    try {
        await getDB();

        const { canvaid, videoid } = req.params;
        // userid comes from the verified JWT (set by auth middleware), not the URL param.
        // This is the same pattern imageLoader.js uses — one source of truth for identity.
        const userid = req.user?.sub;

        // Single direct query — matches imageLoader.js approach.
        // workspaceId + createdBy + _id together verify ownership in one round-trip.
        const videoDoc = await videoModel.findOne({
            workspaceId: canvaid,
            createdBy: userid,
            _id: videoid,
        });

        if (!videoDoc) {
            console.error("Video document not found:", videoid);
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        const videoPath = videoDoc.path;

        if (!fs.existsSync(videoPath)) {
            console.error("File not found on disk:", videoPath);
            return res.status(404).json({ success: false, message: "File missing on disk" });
        }

        // Full file stream — HTTP 200, no range handling.
        // The frontend fetch() sends no Range header, so this path is always hit.
        // After the stream ends, the connection closes and the browser slot is freed.
        const stream = fs.createReadStream(videoPath);

        res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': fs.statSync(videoPath).size,
            'Cache-Control': 'public, max-age=86400',
        });

        // IMPORTANT: If the browser cancels the fetch mid-download (tab closed, component
        // unmounted before load completes), destroy the stream immediately to free
        // server CPU and file handle resources rather than streaming into nothing.
        req.on('close', () => {
            stream.destroy();
        });

        stream.pipe(res);

    } catch (err) {
        console.error("Video Stream Error:", err.message);
        return res.status(500).json({
            success: false,
            code: "SERVER_VIDEO_STREAM_ERROR",
            message: err.message,
        });
    }
});

export default videoLoader;
