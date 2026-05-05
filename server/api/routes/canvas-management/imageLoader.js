import getDB from "../../../lib/connnections/Connections.js";
// import audioModel from "../../../models/multi-media/audioModel.js";
// import imageModel from "../../../models/multi-media/imageModel.js";
import UserModel from "../../../models/userModel.js";
// import videoModel from "../../../models/multi-media/videoModel.js";
import canvaspaceModel from "../../../models/CanvaspaceModel.js";
import Router from "express";
import imageModel from "../../../models/multi-media/imageModel.js";
import fs from 'fs';
import path from "path";
import { exec } from "child_process";

//loads all canva data depending on id access
const imageLoader = Router();
// imageLoader.js - Optimized for High-Frequency Cluster Calls
imageLoader.get("/:userid/canvas-management/:canvaid/images/:imageid", async (req, res) => {
    try {
        await getDB();
        const { canvaid, imageid } = req.params;
        const userid = req.user?.sub;

        // Find the specific document where the imageid exists in the array
        const parentDoc = await imageModel.findOne({
            _id: imageid, // First match the imageid to ensure we find the correct document
            workspaceId: canvaid,
            createdBy: userid,
        });
        console.log(parentDoc);

        if (!parentDoc) {
            console.error("Parent Doc not found for image:", imageid);
            return res.status(404).json({ success: false, message: "Cluster not found" });
        }

        // Now extract the specific object from the array to get the imagepath
        const targetImage = parentDoc.imagecluster.find(img => img._id.toString() === imageid);

        if (!targetImage || !targetImage.imagepath) {
            return res.status(404).json({ success: false, message: "Image path entry missing" });
        }

        const absolutePath = targetImage.imagepath;

        if (!fs.existsSync(absolutePath)) {
            console.error("File not found on disk:", absolutePath);
            return res.status(404).json({ success: false, message: "File missing on C: drive" });
        }



        // Stream the binary file
        res.writeHead(200, {
            'Content-Type': targetImage.mime || 'image/png',
            'Content-Length': fs.statSync(absolutePath).size,
            'Cache-Control': 'public, max-age=86400'
        });
        const stream = fs.createReadStream(absolutePath);


        // IMPORTANT: If the browser cancels or the queue moves on, 
        // kill the stream to free up Server CPU/RAM
        req.on('close', () => {
            stream.destroy();
        });

        stream.pipe(res);

    } catch (err) {
        console.error("Stream Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"]);

// Opens File Explorer on the client machine with the specified file selected.
// Body: { imagename } — the name of the file inside the cluster's directory.
imageLoader.post("/:userid/canvas-management/:canvaid/images/:imageid/reveal", async (req, res) => {
    try {
        await getDB();
        const { canvaid, imageid } = req.params;
        const { name } = req.body;
        const userid = req.user?.sub;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ success: false, message: "name is required" });
        }

        const doc = await imageModel.findOne({
            _id: imageid,
            workspaceId: canvaid,
            createdBy: userid,
        }).select("pathtoimages");

        if (!doc) {
            return res.status(404).json({ success: false, message: "Cluster not found" });
        }

        const dir = doc.pathtoimages;
        const fullPath = path.resolve(dir, name);
        console.log(fullPath);


        // Path traversal guard — resolved path must stay inside the stored directory
        if (!fullPath.startsWith(path.resolve(dir))) {
            return res.status(400).json({ success: false, message: "Invalid image name" });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ success: false, message: "File not found on disk" });
        }

        // Reveal the file in the native file manager, highlighted/selected.
        // Each OS has a different command — exec sends the full string through a shell,
        // which is required for all three (spawn would split args incorrectly).
        const platform = process.platform;
        if (platform === "win32") {
            // path.win32.normalize converts forward slashes → backslashes for Explorer
            const winPath = path.win32.normalize(fullPath);
            exec(`explorer.exe /select,"${winPath}"`);
        } else if (platform === "darwin") {
            // -R reveals and selects the file in Finder
            exec(`open -R "${fullPath}"`);
        } else {
            // Linux has no universal file manager — try nautilus (GNOME) first,
            // fall back to xdg-open on the parent directory for all other DEs
            const parentDir = path.dirname(fullPath);
            exec(`nautilus --select "${fullPath}" 2>/dev/null || xdg-open "${parentDir}"`);
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Reveal error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default imageLoader;