import getDB from "../../../lib/connnections/Connections.js";
// import audioModel from "../../../models/multi-media/audioModel.js";
// import imageModel from "../../../models/multi-media/imageModel.js";
import textModel from "../../../models/multi-media/textModel.js";
import UserModel from "../../../models/userModel.js";
// import videoModel from "../../../models/multi-media/videoModel.js";
import canvaspaceModel from "../../../models/CanvaspaceModel.js";
import DoughnutChartModel from "../../../models/analytics/DoughnutChartModel.js";
import Router from "express";
import textLinkModel from "../../../models/multi-media/textlinkmodel.js";
import videoModel from "../../../models/multi-media/videoModel.js";
import imageModel from "../../../models/multi-media/imageModel.js";
import tableModel from "../../../models/multi-media/tableModel.js";
import fs from 'fs';
import path from "path";
import { get } from "http";


//loads all canva data depending on id access
const singleDynamicCanvaDataGroupRouter = Router();
singleDynamicCanvaDataGroupRouter
    // NEW — GET#2: fetch only the current `target` (_self | _blank) for a single TextLink fragment.
    // Used by the ModificationWindow to hydrate the radio toggle without refetching the whole canvas.
    .get("/:userid/canvas-management/:canvaid/textlink/:fragmentid/viewmode", async (req, res) => {
        try {
            await getDB();
            const userid = req.user?.sub;
            const { canvaid, fragmentid } = req.params;
            if (!userid) {
                return res.status(401).json({ success: false, code: "NOT_AUTHENTICATED", message: "Not Authenticated" });
            }
            const link = await textLinkModel.findOne({ _id: fragmentid, workspaceId: canvaid, createdBy: userid })
                .select("target");
            if (!link) {
                return res.status(404).json({ success: false, code: "TEXTLINK_NOT_FOUND", message: "Link fragment not found" });
            }
            return res.status(200).json({ success: true, code: "TEXTLINK_VIEWMODE_FETCHED", target: link.target || "_self" });
        } catch (err) {
            return res.status(500).json({ success: false, code: "SERVER_WORKSPACE_ERROR", message: err.message });
        }
    })
    //below code runs when data inside a canva is made after its creation
    .get("/:userid/canvas-management/:canvaid", async (req, res) => {

        try {
            await getDB();
            const userid = req.user?.sub;
            const canvaid = req.params.canvaid;
            const user = await UserModel.findOne({ _id: userid });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    code: "MISSING_USER_DATA",
                    message: "User data not found",
                });
            } else {
                const canvaspace = await canvaspaceModel.findOne({
                    createdBy: user._id,
                    _id: canvaid,
                });
                if (canvaspace) {
                    const [texts, links, charts, images, videos, tables
                        // , audios, images, videos
                    ] = await Promise.all([
                        textModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        textLinkModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        DoughnutChartModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        // audioModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        imageModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        videoModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        // tables: metadata + rowCount only. Rows are loaded on demand via
                        // /table-management/:canvaid/:tableid/rows?skip=&limit= so big tables
                        // don't bloat the initial canvas payload.
                        tableModel.aggregate([
                            { $match: { workspaceId: canvaspace._id, createdBy: user._id } },
                            {
                                $project: {
                                    tableName: 1,
                                    columns: 1,
                                    position: 1,
                                    type: 1,
                                    personalInfo: 1,
                                    rowCount: { $size: { $ifNull: ["$rows", []] } },
                                },
                            },
                        ]),
                    ]);
                    // console.log("images from get req: ", images);

                    const workspaceData = {
                        texts,
                        links,
                        charts,
                        // audios,
                        images,
                        videos,
                        tables,
                    };

                    const empty =
                        texts.length === 0 &&
                        links.length === 0 &&
                        charts.length === 0 &&
                        images.length === 0 &&
                        videos.length === 0 &&
                        tables.length === 0;
                    // &&
                    // audios.length === 0 &&
                    // images.length === 0 &&

                    //update to canvaInfo
                    const workspaceNameData = {
                        workspaceName: canvaspace.name,
                        workspaceTextName: canvaspace.workspacename,
                        canvaspace,
                        workspaceData,
                    };
                    if (empty) {
                        return res.status(200).json({
                            success: true,
                            code: "NO_EXISTING_DATA",
                            message:
                                "Your canva doesn't have data yet. Create some data using the Component Hub. ",
                            workspaceNameData
                        });
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: "Data retrieval complete.",
                            //this area need to change naming convesion. it makes the ui retrieval confusing
                            workspaceNameData,
                        });
                    }
                } else {
                    return res.status(404).json({
                        success: false,
                        code: "WORKSPACE_DOES_NOT_EXIST",
                        message: "Workspace not found",
                    });
                }
            }
        } catch (err) {
            console.log(err.message);

            return res.status(500).json({
                success: false,
                code: "SERVER_WORKSPACE_ERROR",
                message: "The server side canvaspace has issues",
            });
        }
    })
    .post("/:userid/canvas-management/:canvaid", async (req, res) => {
        // { params }
        try {
            await getDB();
            const userid = req.user?.sub;;
            const canvaid = req.params.canvaid;
            if (!userid || !canvaid) {
                return res.status(401).json({
                    success: false,
                    code: "NOT_AUTHORIZED",
                    message: "User not logged in",
                });
            } else {
                const user = await UserModel.findById(String(userid));
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        code: "USER_NOT_AUTHORIZED",
                        message: "User is not logged in",
                    });
                } else {
                    const canvaspace = await canvaspaceModel.findOne({
                        createdBy: user._id,
                        _id: canvaid,
                    });

                    if (canvaspace) {
                        const { label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset, text, link, video, pathtoimages, type, x, y, options
                        } = req.body;
                        // console.log("req.body: ", req.body);
                        // const { label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset } = req.body;
                        // console.log(label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset, text, type, x, y, options);

                        if (type === "DoughnutChart" && x >= 0 && y >= 0 && label && labels && listOfBackgroundColors && listOfNumericValues && borderColor && borderWidth >= 0 && hoverOffset && offset && options) {
                            // console.log("type, x, y, label, labels, listOfBackgroundColors,listOfNumericValues,borderColor,borderWidth,hoverOffset,offset: ", type, x, y, label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset);
                            // console.log("this chart line works");

                            const createDoughnutChartComponent = await DoughnutChartModel.create({
                                labels: Array.from(labels),
                                datasets: [{
                                    label: label,
                                    data: Array.from(listOfNumericValues),
                                    backgroundColor: Array.from(listOfBackgroundColors),
                                    borderColor: Array.from(borderColor),
                                    borderWidth: borderWidth,
                                    hoverOffset: hoverOffset,
                                    offset: offset,
                                }],
                                // listOfColors: listOfColors,
                                options: options,
                                type: type,
                                position: { x: x, y: y },
                                owner: user._id,
                                createdBy: user._id,
                                //workspace input
                                workspaceId: canvaid,
                                //the url name of the canva canvaspace
                                name: canvaspace.name,
                                workspacename: canvaspace.workspacename,
                            });
                            // createDoughnutChartComponent.save();

                            if (!createDoughnutChartComponent) {
                                return res.status(500).json({
                                    success: true,
                                    code: "COMPONENT_CREATION_FAILED",
                                    message: "Not Created",
                                });
                            } else {
                                // console.log("createDoughnutChartComponent: ", createDoughnutChartComponent);
                                return res.status(201).json({
                                    success: true,
                                    code: "COMPONENT_CREATED",
                                    message: "DoughnutChartComponent created!",
                                });
                            }
                        }
                        else if (text && link && type === "TextLink" && x >= 0 && y >= 0) {

                            const createLinkComponent = await textLinkModel.create({
                                link,
                                text,
                                type,
                                position: { x: x, y: y },
                                owner: user._id,
                                createdBy: user._id,
                                //workspace input
                                workspaceId: canvaid,
                                //the url name of the canva canvaspace
                                name: canvaspace.name,
                                workspacename: canvaspace.workspacename,
                            });
                            if (!createLinkComponent) {
                                return res.status(500).json({
                                    success: false,
                                    code: "LINK_COMPONENT_NOT_CREATED",
                                    message: "Link fragment not created!",
                                })
                            } else {
                                return res.status(200).json({
                                    success: true,
                                    code: "LINK_COMPONENT_CREATED",
                                    message: "Link fragment created!",
                                })
                            }
                        }
                        else if (text && type === "Text" && x >= 0 && y >= 0) {
                            // console.log("this text line works");

                            const createTextComponent = await textModel.create({
                                text: text,
                                type: type,
                                position: { x: x, y: y },
                                owner: user._id,
                                createdBy: user._id,
                                workspaceId: canvaid,
                                //the url name of the canva canvaspace
                                name: canvaspace.name,
                                workspacename: canvaspace.workspacename,
                            });
                            // console.log("createTextComponent: ", createTextComponent);

                            if (!createTextComponent) {
                                return res.status(500).json({
                                    success: true,
                                    code: "COMPONENT_CREATION_FAILED",
                                    message: "Not Created",
                                });
                            } else {
                                return res.status(201).json({
                                    success: true,
                                    code: "COMPONENT_CREATED",
                                    message: "TextComponent created!",
                                });
                            }
                        }
                        else if (video && type === "Video" && x >= 0 && y >= 0) {
                            // console.log("this video line works");

                            const createVideoComponent = await videoModel.create({
                                path: video,
                                type: type,
                                position: { x: x, y: y },
                                owner: user._id,
                                createdBy: user._id,
                                workspaceId: canvaid,
                            });
                            // console.log("createTextComponent: ", createTextComponent);

                            if (!createVideoComponent) {
                                return res.status(500).json({
                                    success: true,
                                    code: "COMPONENT_CREATION_FAILED",
                                    message: "Not Created!",
                                });
                            } else {
                                return res.status(201).json({
                                    success: true,
                                    code: "COMPONENT_CREATED",
                                    message: "Video created!",
                                });
                            }
                        }
                        // ===============================
                        // OLD CODE — Image cluster creation. Supported only 4 extensions and used
                        // a manual for-loop + push pattern. mimeTypes map was incomplete (no gif,
                        // avif, svg). Error response incorrectly said "Video created!".
                        //
                        // else if (pathtoimages && type === "Images" && x >= 0 && y >= 0) {
                        //     if (!fs.existsSync(pathtoimages)) {
                        //         return res.status(404).json({ success: false, message: "Directory not found on disk" });
                        //     } else {
                        //         const directoryPath = pathtoimages;
                        //         const files = fs.readdirSync(pathtoimages);
                        //         const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];
                        //         const imageFiles = files.filter(file => {
                        //             const ext = path.extname(file).toLowerCase();
                        //             return allowedExtensions.includes(ext);
                        //         });
                        //         const imagesPayload = [];
                        //         for (const fileName of imageFiles) {
                        //             const fullPath = path.join(directoryPath, fileName);
                        //             const ext = path.extname(fileName).toLowerCase();
                        //             const mimeTypes = {
                        //                 ".png": "image/png",
                        //                 ".jpg": "image/jpeg",
                        //                 ".jpeg": "image/jpeg",
                        //                 ".webp": "image/webp"
                        //             };
                        //             const mime = mimeTypes[ext] || "image/jpeg";
                        //             imagesPayload.push({ name: fileName, mime, imagepath: fullPath });
                        //         }
                        //         const imagecluster = imagesPayload;
                        //         const createImageComponent = await imageModel.create({
                        //             pathtoimages, type, imagecluster,
                        //             position: { x, y }, owner: user._id,
                        //             createdBy: user._id, workspaceId: canvaid,
                        //         });
                        //         if (!createImageComponent) {
                        //             return res.status(500).json({ success: true, code: "COMPONENT_CREATION_FAILED", message: "Not Created!" });
                        //         } else {
                        //             return res.status(201).json({ success: true, code: "COMPONENT_CREATED", message: "Video created!" });
                        //         }
                        //     }
                        // }
                        // ===============================

                        // NEW CODE — Expanded mime support to match imageModel schema (gif, avif, svg added).
                        // Uses readdirSync with withFileTypes to skip subdirectories cleanly.
                        // Guards against an empty directory (no supported files) before hitting the DB.
                        else if (pathtoimages && type === "Images" && x >= 0 && y >= 0) {
                            if (!fs.existsSync(pathtoimages)) {
                                return res.status(404).json({ success: false, message: "Directory not found on disk" });
                            }

                            const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"]);
                            const MIME_MAP = {
                                ".png": "image/png",
                                ".jpg": "image/jpeg",
                                ".jpeg": "image/jpeg",
                                ".webp": "image/webp",
                                ".gif": "image/gif",
                                ".avif": "image/avif",
                                ".svg": "image/svg+xml",
                            };

                            const entries = fs.readdirSync(pathtoimages, { withFileTypes: true });

                            const imagecluster = entries
                                .filter(e => e.isFile() && ALLOWED_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
                                .map(e => {
                                    const ext = path.extname(e.name).toLowerCase();
                                    return {
                                        name: e.name,
                                        mime: MIME_MAP[ext],
                                        imagepath: path.join(pathtoimages, e.name),
                                    };
                                });
                            // console.log("typeof imagecluster: ", Array.isArray(imagecluster));

                            if (imagecluster.length === 0) {
                                return res.status(400).json({
                                    success: false,
                                    code: "NO_SUPPORTED_IMAGES",
                                    message: "No supported image files found in the specified directory",
                                });
                            }

                            const createImageComponent = await imageModel.create({
                                pathtoimages,
                                type,
                                imagecluster,
                                position: { x, y },
                                owner: user._id,
                                createdBy: user._id,
                                workspaceId: canvaid,
                            });

                            if (!createImageComponent) {
                                return res.status(500).json({
                                    success: false,
                                    code: "COMPONENT_CREATION_FAILED",
                                    message: "Image cluster not created",
                                });
                            } else {
                                return res.status(201).json({
                                    success: true,
                                    code: "COMPONENT_CREATED",
                                    message: "Image cluster created",
                                });
                            }
                        }
                        else {
                            return res.status(400).json({
                                success: false,
                                code: "MISSING_ESSENTIAL_COMPONENT_DATA",
                                message: "Request requires more data: ",
                            });
                        }
                    } else {
                        return res.status(404).json({
                            success: false,
                            code: "REQUESTED_WORKSPACE_NOT_FOUND",
                            message: "Requested canvaspace not found!",
                        });
                    }
                }
            }
        } catch (err) {
            console.log(err.message);

            return res.status(500).json({
                success: false,
                code: "SERVER_WORKSPACE_ERROR",
                message: err.message,
            });
        }
    })
    .patch("/:userid/canvas-management/:canvaid", async (req, res) => {
        try {
            await getDB();
            const sub = req.user?.sub;
            const canvaid = req.params.canvaid;

            //id can be passed as the layout/fragment id store in the db 
            //communication at each invocation must be explained or future updates could regress development
            const { _id, type, updateType, text, x, y, newHeight, newWidth } = req.body;
            if (sub && canvaid) {
                const user = await UserModel.findById(String(sub));
                if (user) {
                    const canvaspace = await canvaspaceModel.findOne({
                        createdBy: user._id,
                        _id: canvaid,
                    });
                    // console.log("canvaspace: ", canvaspace);
                    if (canvaspace) {
                        // console.log("_id and type: ", _id, type, updateType);

                        if (!type || !updateType) {
                            return res.status(400).json({
                                success: false,
                                code: "INSUFFICIENT_DATA",
                                message: "type or updateType argument is missing a value",
                            });
                        } else {

                            const { label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset, personalInfo, text, link, type, x, y, options
                            } = req.body;
                            // console.log
                            //     ("req.body: ", req.body);


                            if (type === "Text") {
                                if (updateType === "Text") {

                                    if (!_id) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "Component id is missing",
                                        });
                                    }

                                    //create checkpoint to ensure field
                                    const newData = {};
                                    if (text) newData.text = text;

                                    if (newData) {
                                        const reqToEditTextComponent = await textModel.updateOne(
                                            {
                                                _id,
                                                type,
                                                createdBy: user._id,
                                            },
                                            { $set: newData },
                                            { new: true }
                                        );

                                        if (reqToEditTextComponent) {
                                            return res.status(200).json({
                                                success: true,
                                                code: "TEXT_UPDATE_REQUEST_COMPLETE",
                                                message: "Requested text component has been updated",
                                            });

                                        } else {
                                            return res.status(400).json({
                                                success: false,
                                                code: "TEXT_UPDATE_FAILED",
                                                message: "Could not update text component data",
                                            });
                                        }
                                    } else {
                                        return res.status(400).json({
                                            success: false,
                                            code: "TEXT_FIELD_NULL",
                                            message: "Requested text component data is not available",
                                        });
                                    }
                                }
                                else if (updateType === "XY_POSITIONS") {
                                    const positions = {
                                        position: {
                                            x: x,
                                            y: y
                                        }
                                    };

                                    const reqToUpdateMediaFragmentXYCordinates = await textModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: positions },
                                        { new: true }
                                    );

                                    if (reqToUpdateMediaFragmentXYCordinates) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "MEDIA_XY_COORDINATES_REQUEST_UPDATED",
                                            message: "Text XY coordinates have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "TEXT_UPDATE_REQUESTED_FAILED",
                                            message: "Requested text component data is not available",
                                        });
                                    }
                                }
                                else if (updateType === "SharingSettings") {
                                    if (personalInfo === undefined) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "personalInfo field is missing",
                                        });
                                    }
                                    const getCurrentSharingSettings = await textModel.findOne({ _id: _id });
                                    if (getCurrentSharingSettings.personalInfo === false && personalInfo === "No") {
                                        res.status(200).json({
                                            success: true,
                                            code: "TEXT_SHARING_SETTINGS_UNCHANGED",
                                            message: "Text sharing settings is already disabled",

                                        });
                                    }
                                    if (getCurrentSharingSettings.personalInfo === true && personalInfo === "Yes") {
                                        res.status(200).json({
                                            success: true,
                                            code: "TEXT_SHARING_SETTINGS_UNCHANGED",
                                            message: "Text sharing settings is already enabled",
                                        });
                                    }
                                    const isSharing = {};
                                    if (personalInfo === "No") {
                                        isSharing.shareData = false;
                                    }
                                    if (personalInfo === "Yes") {
                                        isSharing.shareData = true;
                                    }

                                    const reqToUpdateTextPrivacy = await textModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: { personalInfo: isSharing.shareData } },
                                        { new: true }
                                    );

                                    if (reqToUpdateTextPrivacy.modifiedCount === 1) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "TEXT_PRIVACY_SETTINGS_UPDATED",
                                            message: "Text privacy settings have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "TEXT_PRIVACY_SETTINGS_UPDATE_FAILED",
                                            message: "Text privacy settings not updated",
                                        });
                                    }
                                }
                            }

                            //Table fragment uses the same dispatcher for XY repositioning and sharing
                            //settings so RepositionLiveData and updateFragmentPrivacy work unchanged.
                            //Row/column edits live on the dedicated /table-management router.
                            else if (type === "Table") {
                                if (updateType === "XY_POSITIONS") {
                                    const positions = {
                                        position: {
                                            x: x,
                                            y: y
                                        }
                                    };

                                    const reqToUpdateMediaFragmentXYCordinates = await tableModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: positions },
                                        { new: true }
                                    );

                                    if (reqToUpdateMediaFragmentXYCordinates) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "MEDIA_XY_COORDINATES_REQUEST_UPDATED",
                                            message: "Table XY coordinates have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "TABLE_UPDATE_REQUESTED_FAILED",
                                            message: "Requested table component data is not available",
                                        });
                                    }
                                }
                                else if (updateType === "SharingSettings") {
                                    if (personalInfo === undefined) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "personalInfo field is missing",
                                        });
                                    }
                                    const getCurrentSharingSettings = await tableModel.findOne({ _id: _id });
                                    if (getCurrentSharingSettings.personalInfo === false && personalInfo === "No") {
                                        res.status(200).json({
                                            success: true,
                                            code: "TABLE_SHARING_SETTINGS_UNCHANGED",
                                            message: "Table sharing settings is already disabled",
                                        });
                                    }
                                    if (getCurrentSharingSettings.personalInfo === true && personalInfo === "Yes") {
                                        res.status(200).json({
                                            success: true,
                                            code: "TABLE_SHARING_SETTINGS_UNCHANGED",
                                            message: "Table sharing settings is already enabled",
                                        });
                                    }
                                    const isSharing = {};
                                    if (personalInfo === "No") {
                                        isSharing.shareData = false;
                                    }
                                    if (personalInfo === "Yes") {
                                        isSharing.shareData = true;
                                    }

                                    const reqToUpdateTablePrivacy = await tableModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: { personalInfo: isSharing.shareData } },
                                        { new: true }
                                    );

                                    if (reqToUpdateTablePrivacy.modifiedCount === 1) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "TABLE_PRIVACY_SETTINGS_UPDATED",
                                            message: "Table privacy settings have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "TABLE_PRIVACY_SETTINGS_UPDATE_FAILED",
                                            message: "Table privacy settings not updated",
                                        });
                                    }
                                }
                            }

                            else if (type === "TextLink") {
                                if (updateType === "TextLink") {
                                    if (!_id) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "Component id is missing",
                                        });
                                    }

                                    //create checkpoint to ensure field
                                    const newData = {};
                                    if (text) newData.text = text;
                                    if (link) newData.link = link;

                                    if (newData) {
                                        const reqToEditTextComponent = await textLinkModel.updateOne(
                                            {
                                                _id,
                                                type,
                                                createdBy: user._id,
                                            },
                                            { $set: newData },
                                            { new: true }
                                        );

                                        if (reqToEditTextComponent) {
                                            return res.status(200).json({
                                                success: true,
                                                code: "TEXTLINK_UPDATE_REQUEST_COMPLETE",
                                                message: "Requested link fragment has been updated",
                                            });

                                        } else {
                                            return res.status(400).json({
                                                success: false,
                                                code: "TEXTLINK_UPDATE_FAILED",
                                                message: "Could not update link fragment data",
                                            });
                                        }
                                    } else {
                                        return res.status(400).json({
                                            success: false,
                                            code: "TEXTLINK_FIELD_NULL",
                                            message: "Requested link fragment data is not available",
                                        });
                                    }
                                }
                                else if (updateType === "XY_POSITIONS") {
                                    const positions = {
                                        position: {
                                            x: x,
                                            y: y
                                        }
                                    };

                                    const createLinkComponent = await textLinkModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: positions },
                                        { new: true }
                                    );
                                    if (!createLinkComponent) {
                                        return res.status(500).json({
                                            success: false,
                                            code: "LINK_COMPONENT_NOT_CREATED",
                                            message: "Link fragment not created!",
                                        })
                                    } else {
                                        return res.status(200).json({
                                            success: true,
                                            code: "LINK_COMPONENT_CREATED",
                                            message: "Link fragment created!",
                                        })
                                    }
                                }
                                // NEW — PUT#3 (PATCH): toggle TextLink viewMode between "_self" and "_blank".
                                // Accepts req.body.target ("_self" | "_blank"). No-ops gracefully if the
                                // value matches what's already stored.
                                else if (updateType === "ViewMode") {
                                    const newTarget = req.body.target;
                                    if (newTarget !== "_self" && newTarget !== "_blank") {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INVALID_VIEWMODE_TARGET",
                                            message: "target must be _self or _blank",
                                        });
                                    }
                                    if (!_id) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "Component id is missing",
                                        });
                                    }
                                    const current = await textLinkModel.findOne({ _id, createdBy: user._id }).select("target");
                                    if (!current) {
                                        return res.status(404).json({
                                            success: false,
                                            code: "TEXTLINK_NOT_FOUND",
                                            message: "Link fragment not found",
                                        });
                                    }
                                    if (current.target === newTarget) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "TEXTLINK_VIEWMODE_UNCHANGED",
                                            message: `TextLink viewMode already ${newTarget}`,
                                            target: newTarget,
                                        });
                                    }
                                    const reqToUpdateViewMode = await textLinkModel.updateOne(
                                        { _id, createdBy: user._id },
                                        { $set: { target: newTarget } },
                                        { new: true }
                                    );
                                    if (reqToUpdateViewMode.modifiedCount === 1) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "TEXTLINK_VIEWMODE_UPDATED",
                                            message: `TextLink viewMode set to ${newTarget}`,
                                            target: newTarget,
                                        });
                                    }
                                    return res.status(400).json({
                                        success: false,
                                        code: "TEXTLINK_VIEWMODE_UPDATE_FAILED",
                                        message: "Could not update TextLink viewMode",
                                    });
                                }
                                else if (updateType === "SharingSettings") {
                                    if (personalInfo === undefined) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "personalInfo field is missing",
                                        });
                                    }
                                    const getCurrentSharingSettings = await textLinkModel.findOne({ _id: _id });
                                    if (getCurrentSharingSettings.personalInfo === false && personalInfo === "No") {
                                        res.status(200).json({
                                            success: true,
                                            code: "TEXTLINK_FRAGMENT_SHARING_UNCHANGED",
                                            message: "TextLink fragment sharing settings is already disabled",

                                        });
                                    }
                                    if (getCurrentSharingSettings.personalInfo === true && personalInfo === "Yes") {
                                        res.status(200).json({
                                            success: true,
                                            code: "TEXTLINK_FRAGMENT_SHARING_UNCHANGED",
                                            message: "TextLink fragment sharing settings is already enabled",
                                        });
                                    }
                                    const isSharing = {};
                                    if (personalInfo === "No") {
                                        isSharing.shareData = false;
                                    }
                                    if (personalInfo === "Yes") {
                                        isSharing.shareData = true;
                                    }

                                    const reqToUpdateTextLinkComponentSharing = await textLinkModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: { personalInfo: isSharing.shareData } },
                                        { new: true }
                                    );

                                    if (reqToUpdateTextLinkComponentSharing.modifiedCount === 1) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "TEXTLINK_FRAGMENT_SHARING_UPDATED",
                                            message: "TextLink fragment sharing settings have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "TEXTLINK_FRAGMENT_SHARING_UPDATE_FAILED",
                                            message: "TextLink fragment sharing settings not updated",
                                        });
                                    }
                                }
                            }
                            else if (type === "DoughnutChart") {

                                //requires if to update chart content
                                //else if...
                                if (updateType === "XY_POSITIONS"
                                ) {
                                    if (!_id) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "Component id is missing",
                                        });
                                    }

                                    // console.log("type, x, y, label, labels, listOfBackgroundColors,listOfNumericValues,borderColor,borderWidth,hoverOffset,offset: ", type, x, y, label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset);
                                    // console.log("this update chart line works");

                                    const positions = {
                                        position: {
                                            x: x,
                                            y: y
                                        }
                                    };
                                    //Doughnut Chart XY
                                    const reqToUpdateMediaFragmentXYCordinates = await DoughnutChartModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: positions },
                                        { new: true }
                                    );

                                    if (!reqToUpdateMediaFragmentXYCordinates) {
                                        return res.status(404).json({
                                            success: false,
                                            code: "DOUGHNUT_CHART_UPDATE_REQUESTED_FAILED",
                                            message: "Requested Doughnut Chart component data is not available",
                                        });
                                    } else {
                                        return res.status(200).json({
                                            success: true,
                                            code: "MEDIA_XY_COORDINATES_REQUEST_UPDATED",
                                            message: "Doughnut Chart XY coordinates have been updated",
                                        });
                                    }
                                }
                                else if (updateType === "SharingSettings") {
                                    if (personalInfo === undefined) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "personalInfo field is missing",
                                        });
                                    }
                                    const getCurrentSharingSettings = await DoughnutChartModel.findOne({ _id: _id });
                                    if (getCurrentSharingSettings.personalInfo === false && personalInfo === "No") {
                                        res.status(200).json({
                                            success: true,
                                            code: "DOUGHNUT_CHART_FRAGMENT_SHARING_UNCHANGED",
                                            message: "DoughnutChart fragment sharing settings is already disabled",

                                        });
                                    }
                                    if (getCurrentSharingSettings.personalInfo === true && personalInfo === "Yes") {
                                        res.status(200).json({
                                            success: true,
                                            code: "DOUGHNUT_CHART_FRAGMENT_SHARING_UNCHANGED",
                                            message: "DoughnutChart fragment sharing settings is already enabled",
                                        });
                                    }
                                    const isSharing = {};
                                    if (personalInfo === "No") {
                                        isSharing.shareData = false;
                                    }
                                    if (personalInfo === "Yes") {
                                        isSharing.shareData = true;
                                    }

                                    const reqToUpdateDoughnutChartComponentSharing = await DoughnutChartModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: { personalInfo: isSharing.shareData } },
                                        { new: true }
                                    );

                                    if (reqToUpdateDoughnutChartComponentSharing.modifiedCount === 1) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "DOUGHNUT_CHART_FRAGMENT_SHARING_UPDATED",
                                            message: "DoughnutChart fragment sharing settings have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "DOUGHNUT_CHART_FRAGMENT_SHARING_UPDATE_FAILED",
                                            message: "DoughnutChart fragment sharing settings not updated",
                                        });
                                    }
                                }
                            }
                            else if (type === "Video") {
                                //requires if to update video content
                                if (updateType === "XY_POSITIONS") {
                                    if (!_id) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "Component id is missing",
                                        });
                                    }
                                    const positions = {
                                        position: {
                                            x: x,
                                            y: y
                                        }
                                    };

                                    //Video XY
                                    const reqToUpdateVideoFragmentXYCordinates = await videoModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: positions },
                                        { new: true }
                                    );
                                    if (!reqToUpdateVideoFragmentXYCordinates) {
                                        return res.status(404).json({
                                            success: false,
                                            code: "VIDEO_XY_COORDINATE_UPDATE_REQUEST_FAILED",
                                            message: "Requested video data is not available",
                                        });
                                    } else {
                                        return res.status(200).json({
                                            success: true,
                                            code: "MEDIA_XY_COORDINATES_REQUEST_UPDATED",
                                            message: "Video XY coordinates have been updated",
                                        });
                                    }
                                }
                                else if (updateType === "SharingSettings") {
                                    if (personalInfo === undefined) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "personalInfo field is missing",
                                        });
                                    }
                                    const getCurrentSharingSettings = await videoModel.findOne({ _id: _id });
                                    if (getCurrentSharingSettings.personalInfo === false && personalInfo === "No") {
                                        res.status(200).json({
                                            success: true,
                                            code: "VIDEO_FRAGMENT_SHARING_UNCHANGED",
                                            message: "Video fragment sharing settings is already disabled",

                                        });
                                    }
                                    if (getCurrentSharingSettings.personalInfo === true && personalInfo === "Yes") {
                                        res.status(200).json({
                                            success: true,
                                            code: "VIDEO_FRAGMENT_SHARING_UNCHANGED",
                                            message: "Video fragment sharing settings is already enabled",
                                        });
                                    }
                                    const isSharing = {};
                                    if (personalInfo === "No") {
                                        isSharing.shareData = false;
                                    }
                                    if (personalInfo === "Yes") {
                                        isSharing.shareData = true;
                                    }

                                    const reqToUpdateVideoComponentSharing = await videoModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: { personalInfo: isSharing.shareData } },
                                        { new: true }
                                    );

                                    if (reqToUpdateVideoComponentSharing.modifiedCount === 1) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "VIDEO_FRAGMENT_SHARING_UPDATED",
                                            message: "Video fragment sharing settings have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "VIDEO_FRAGMENT_SHARING_UPDATE_FAILED",
                                            message: "Video fragment sharing settings not updated",
                                        });
                                    }
                                }
                            }
                            else if (type === "Images") {
                                //requires if to update image cluster content
                                if (updateType === "XY_POSITIONS") {
                                    if (!_id) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "Component id is missing",
                                        });
                                    }
                                    const positions = {
                                        position: {
                                            x: x,
                                            y: y
                                        }
                                    };

                                    //Image XY
                                    const reqToUpdateVideoFragmentXYCordinates = await imageModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: positions },
                                        { new: true }
                                    );
                                    if (!reqToUpdateVideoFragmentXYCordinates) {
                                        return res.status(404).json({
                                            success: false,
                                            code: "IMAGE_CLUSTER_XY_COORDINATE_UPDATE_REQUEST_FAILED",
                                            message: "Requested Image Cluster data is not available",
                                        });
                                    } else {
                                        return res.status(200).json({
                                            success: true,
                                            code: "IMAGE_CLUSTER_XY_COORDINATES_REQUEST_UPDATED",
                                            message: "Image Cluster XY coordinates have been updated",
                                        });
                                    }
                                }
                                else if (updateType === "SharingSettings") {
                                    if (personalInfo === undefined) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_DATA",
                                            message: "personalInfo field is missing",
                                        });
                                    }
                                    const getCurrentSharingSettings = await imageModel.findOne({ _id: _id });
                                    if (getCurrentSharingSettings.personalInfo === false && personalInfo === "No") {
                                        res.status(200).json({
                                            success: true,
                                            code: "IMAGE_CLUSTER_SHARING_UNCHANGED",
                                            message: "Image Cluster sharing settings is already disabled",

                                        });
                                    }
                                    if (getCurrentSharingSettings.personalInfo === true && personalInfo === "Yes") {
                                        res.status(200).json({
                                            success: true,
                                            code: "IMAGE_CLUSTER_SHARING_UPDATED",
                                            message: "Image Cluster sharing settings have been updated",
                                        });
                                    }
                                    const isSharing = {};
                                    if (personalInfo === "No") {
                                        isSharing.shareData = false;
                                    }
                                    if (personalInfo === "Yes") {
                                        isSharing.shareData = true;
                                    }

                                    const reqToUpdateDoughnutChartComponentSharing = await imageModel.updateOne(
                                        {
                                            _id: _id,
                                            createdBy: user._id,
                                        },
                                        { $set: { personalInfo: isSharing.shareData } },
                                        { new: true }
                                    );

                                    if (reqToUpdateDoughnutChartComponentSharing.modifiedCount === 1) {
                                        return res.status(200).json({
                                            success: true,
                                            code: "IMAGE_CLUSTER_SHARING_UPDATED",
                                            message: "Image Cluster sharing settings have been updated",
                                        });

                                    } else {
                                        return res.status(404).json({
                                            success: false,
                                            code: "IMAGE_CLUSTER_SHARING_UPDATE_FAILED",
                                            message: "Image Cluster sharing settings not updated",
                                        });
                                    }
                                }
                            }
                            else if (type === "Canvaspace") {
                                if (updateType === "size") {
                                    //create checkpoint to ensure field
                                    if (!newHeight && !newWidth) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_CANVAS_SIZE_DATA",
                                            message: "Not enough update canvas size",
                                        });
                                    }

                                    let size;
                                    if (newHeight) {
                                        size = {
                                            size: {
                                                height: newHeight,
                                            }
                                        }
                                    }
                                    if (newWidth) {
                                        size = {
                                            size: {
                                                width: newWidth
                                            }
                                        }
                                    }
                                    if (newHeight && newWidth) {
                                        size = {
                                            size: {
                                                height: newHeight,
                                                width: newWidth
                                            }
                                        }
                                    }


                                    if (Object.keys(size).length === 0) {
                                        return res.status(400).json({
                                            success: false,
                                            code: "INSUFFICIENT_CANVAS_DATA",
                                            message: "Updating canvas argument is blank",
                                        });
                                    }

                                    if (size) {
                                        const reqToResizeCanvas = await canvaspaceModel.updateOne(
                                            {
                                                _id: canvaspace._id,
                                                createdBy: user._id,
                                                type: type,
                                            },
                                            { $set: size },
                                            {
                                                new: true,
                                            }
                                        );

                                        if (reqToResizeCanvas.modifiedCount === 1) {
                                            return res.status(200).json({
                                                success: true,
                                                code: "CANVASPACE_UPDATED",
                                                message: "Canvaspace size changed",
                                            });

                                        } else {
                                            return res.status(400).json({
                                                success: false,
                                                code: "CANVASPACE_NOT_UPDATED",
                                                message: `Canvaspace size NOT changed`,
                                            });
                                        }
                                    } else {
                                        return res.status(400).json({
                                            success: false,
                                            code: "SIZE_FIELD_NULL",
                                            message: "Requested Size data is not available",
                                        });
                                    }
                                }
                            }
                            else {
                                return res.status(400).json({
                                    success: false,
                                    code: "VOID_TYPE_PATCH_REQUEST",
                                    message: "Request is void",
                                });
                            }
                        }
                    }
                } else {
                    return res.status(404).json({
                        success: false,
                        code: "USER_NOT_FOUND",
                        message: "User not found",
                    });
                }

            } else {
                return res.status(401).json({
                    success: false,
                    code: "NOT_AUTHORIZED",
                    message: "User not logged in",
                });

            }
        } catch (err) {
            console.log("main patch endpoint single dynamic canva data group has an issue: ", err.message);

            return res.status(500).json({
                success: false,
                code: "SERVER_WORKSPACE_ERROR",
                message: "The server side canvaspace has issues",
            });
        }
    })

    .delete("/:userid/canvas-management/:canvaid", async (req, res) => {
        try {
            await getDB();
            const sub = req.user?.sub;
            const canvaid = req.params.canvaid;
            const { type, _id } = req.body;
            // console.log(type, _id);

            if (sub && canvaid) {
                const user = await UserModel.findById(String(sub));
                if (!user) {
                    return res.status(404).json({

                        success: false,
                        code: "USER_NOT_FOUND",
                        message: "User is not authorized",
                    });
                }

                const canvaspace = await canvaspaceModel.findOne({
                    createdBy: user._id,
                    _id: canvaid,
                });
                if (!canvaspace) {
                    return res.status(404).json({
                        success: false,
                        code: "REQUESTED_WORKSPACE_NOT_FOUND",
                        message: "Requested canvaspace not found",
                    });
                }
                else {
                    // console.log("type: ", type);

                    if (!type) {
                        return res.status(400).json({
                            success: false,
                            code: "INSUFFICIENT_DATA",
                            message: "Insufficient data",
                        });
                    }
                    else {
                        if (type === "Text") {
                            if (!_id) {
                                return res.status(400).json({
                                    success: false,
                                    code: "INSUFFICIENT_COMPONENT_DATA",
                                    message: "Insufficient component data",
                                });
                            } else {
                                const reqToDeleteTextComponent = await textModel.deleteOne({
                                    //component's id
                                    _id,
                                    createdBy: user._id,
                                });

                                if (!reqToDeleteTextComponent) {
                                    return res.status(404).json({
                                        success: false,
                                        code: "TEXT_UPDATE_REQUESTED_FAILED",
                                        message: "Requested text component data not available",
                                    });
                                } else {
                                    return res.status(200).json({

                                        success: true,
                                        code: "TEXT_UPDATE_REQUEST_COMPLETE",
                                        message: "Requested text has been updated",
                                    })
                                }
                            }
                        }
                        else if (type === "TextLink" && _id) {
                            // console.log("_id for delete comp op: ", req.body._id);

                            const deleteDoughnutChartComponent = await textLinkModel.findOneAndDelete({
                                _id: _id,
                                type: type,
                                owner: sub,
                                workspaceId: canvaid,
                            });

                            if (!deleteDoughnutChartComponent) {
                                return res.status(500).json({
                                    success: true,
                                    code: "COMPONENT_DELETION_FAILED",
                                    message: "Link fragment not deleted",
                                });
                            } else {
                                // console.log("createDoughnutChartComponent: ", createDoughnutChartComponent);
                                return res.status(201).json({
                                    success: true,
                                    code: "COMPONENT_DELETED",
                                    message: "Link Fragment deleted!",
                                });
                            }
                        }
                        else if (type === "DoughnutChart" && _id) {
                            // console.log("this chart line works");
                            // console.log("_id for delete comp op: ", req.body._id);

                            const deleteDoughnutChartComponent = await DoughnutChartModel.findOneAndDelete({
                                _id: _id,
                                type: type,
                                owner: sub,
                                workspaceId: canvaid,
                            });

                            if (!deleteDoughnutChartComponent) {
                                return res.status(500).json({
                                    success: true,
                                    code: "COMPONENT_DELETION_FAILED",
                                    message: "Not deleted",
                                });
                            } else {
                                // console.log("createDoughnutChartComponent: ", createDoughnutChartComponent);
                                return res.status(201).json({
                                    success: true,
                                    code: "COMPONENT_DELETED",
                                    message: "DoughnutChartComponent deleted!",
                                });
                            }
                        }
                        else if (type === "Video" && _id) {
                            // console.log("_id for delete comp op: ", req.body._id);

                            const deleteVideoComponent = await videoModel.findOneAndDelete({
                                _id: _id,
                                type: type,
                                owner: sub,
                                workspaceId: canvaid,
                            });

                            if (!deleteVideoComponent) {
                                return res.status(500).json({
                                    success: true,
                                    code: "COMPONENT_DELETION_FAILED",
                                    message: "Video not deleted",
                                });
                            } else {
                                return res.status(201).json({
                                    success: true,
                                    code: "COMPONENT_DELETED",
                                    message: "Video deleted!",
                                });
                            }
                        }
                        else if (type === "Images" && _id) {
                            // console.log("_id for delete comp op: ", req.body._id);

                            const deleteImageClusterComponent = await imageModel.findOneAndDelete({
                                _id: _id,
                                type: type,
                                owner: sub,
                                workspaceId: canvaid,
                            });

                            if (!deleteImageClusterComponent) {
                                return res.status(500).json({
                                    success: true,
                                    code: "IMAGE_CLUSTER_COMPONENT_DELETION_FAILED",
                                    message: "Image Cluster not deleted",
                                });
                            } else {
                                return res.status(201).json({
                                    success: true,
                                    code: "IMAGE_CLUSTER_COMPONENT_DELETED",
                                    message: "Image Cluster deleted!",
                                });
                            }
                        }
                        else if (type === "Canvaspace") {
                            const reqToDeleteTextComponents =
                                await textModel.deleteMany({
                                    //component's id
                                    // owner: user._id,
                                    workspaceId: canvaspace._id,
                                    createdBy: user._id,
                                });

                            if (reqToDeleteTextComponents.acknowledged) {
                                const reqToDeleteTextComponent = await canvaspaceModel.deleteOne({
                                    //component's id
                                    _id: canvaid,
                                    //user data
                                    owner: user._id,
                                    createdBy: user._id,
                                });
                                if (reqToDeleteTextComponent) {

                                    return res.status(200).json({
                                        success: true,
                                        code: "WORKSPACE_DELETED",
                                        message: "Workspace has been deleted",
                                    });
                                } else {
                                    return res.status(404).json({
                                        success: false,
                                        code: "WORKSPACE_DELETION_FAILED",
                                        message: "Failed to delete the requested canvaspace",
                                    });
                                }
                            } else {
                                return res.status(404).json({
                                    success: false,
                                    code: "WORKSPACE_DATA_DELETION_FAILED",
                                    message: "Failed to delete the requested canvaspace's data",
                                });
                            }
                        }
                    }
                }
            } else {
                return res.status(401).json({
                    success: false,
                    code: "NOT_AUTHORIZED",
                    message: "User not logged in",
                })
            }
        } catch (err) {
            console.log("main delete endpoint single dynamic canva data group has an issue: ", err.message);

            return res.status(500).json({
                success: false,
                code: "SERVER_WORKSPACE_ERROR",
                message: "The server side canvaspace has issues: " + err.message,
            })
        }
    });
export default singleDynamicCanvaDataGroupRouter;