import getDB from "../../../lib/connnections/Connections.js";
// import audioModel from "../../../models/multi-media/audioModel.js";
// import imageModel from "../../../models/multi-media/imageModel.js";
import textModel from "../../../models/multi-media/textModel.js";
import UserModel from "../../../models/userModel.js";
// import videoModel from "../../../models/multi-media/videoModel.js";
import canvaspaceModel from "../../../models/CanvaspaceModel.js";
import DoughnutChartModel from "../../../models/analytics/DoughnutChartModel.js";
import Router from "express";
import textLinkModel from "../../../models/multi-media/textLinkmodel.js";
import videoModel from "../../../models/multi-media/videoModel.js";
import imageModel from "../../../models/multi-media/imageModel.js";
import fs from 'fs';
import path from "path";
import { get } from "http";


//loads all canva data depending on id access
const singleDynamicCanvaDataGroupRouter = Router();
singleDynamicCanvaDataGroupRouter
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
                    const [texts, links, charts, images, videos
                        // , audios, images, videos
                    ] = await Promise.all([
                        textModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        textLinkModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        DoughnutChartModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        // audioModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        imageModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                        videoModel.find({ workspaceId: canvaspace._id, createdBy: user._id }),
                    ]);
                    // console.log("images from get req: ", images);

                    const workspaceData = {
                        texts,
                        links,
                        charts,
                        // audios,
                        images,
                        videos,
                    };

                    const empty =
                        texts.length === 0 &&
                        links.length === 0 &&
                        charts.length === 0 &&
                        images.length === 0 &&
                        videos.length === 0;
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
                        console.log("req.body: ", req.body);
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
                        else if (pathtoimages && type === "Images" && x >= 0 && y >= 0) {
                            // console.log("this Images line works");
                            // console.log(pathtoimages, type, x, y);
                            //Ensure directory exists
                            if (!fs.existsSync(pathtoimages)) {
                                // console.log("dir does not exist");
                                return res.status(404).json({ success: false, message: "Directory not found on disk" });
                            }
                            else {
                                //3. DIRECTORY PATH (THIS is what we scan)
                                //Example: "C:/uploads/user123/clusterA/"
                                const directoryPath = pathtoimages;
                                console.log("directoryPath: ", directoryPath);

                                // 4. READ DIRECTORY (SERVER-ONLY OPERATION)
                                // This returns ALL files inside the folder
                                const files = fs.readdirSync(pathtoimages);
                                // console.log("files: ", files);

                                // 5. FILTER ONLY IMAGE FILES
                                const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp"];

                                const imageFiles = files.filter(file => {
                                    const ext = path.extname(file).toLowerCase();
                                    console.log("ext: ", ext);

                                    return allowedExtensions.includes(ext);
                                });

                                // At this point:
                                // imageFiles.length === number of images found
                                // console.log("Images found:", imageFiles.length);

                                // 6. CREATE DYNAMIC ARRAY (based on directory contents)
                                const imagesPayload = [];

                                // 7. LOOP THROUGH EACH IMAGE FILE
                                for (const fileName of imageFiles) {
                                    // Build full path
                                    const fullPath = path.join(directoryPath, fileName);
                                    // console.log("fullPath: ", fullPath);

                                    // Read file into memory (BUFFER)
                                    // This loads the entire file as binary data
                                    // const fileBuffer = fs.readFileSync(fullPath);
                                    // console.log("fileBuffer: ", fileBuffer);

                                    // Detect MIME type
                                    const ext = path.extname(fileName).toLowerCase();
                                    const mimeTypes = {
                                        ".png": "image/png",
                                        ".jpg": "image/jpeg",
                                        ".jpeg": "image/jpeg",
                                        ".webp": "image/webp"
                                    };

                                    const mime = mimeTypes[ext] || "image/jpeg";

                                    // Convert buffer → base64 (transport format)
                                    // const base64Data = fileBuffer.toString("base64");

                                    // Push into array (DYNAMIC LENGTH)
                                    imagesPayload.push({
                                        name: fileName,
                                        mime,
                                        imagepath: fullPath
                                    });
                                }

                                // console.log("imagesPayload: ", imagesPayload);
                                const imagecluster = imagesPayload;
                                // console.log("imagecluster: ", imagecluster);

                                const createImageComponent = await imageModel.create({
                                    pathtoimages,
                                    type: type,
                                    imagecluster,
                                    position: { x: x, y: y },
                                    owner: user._id,
                                    createdBy: user._id,
                                    workspaceId: canvaid,
                                });
                                // console.log("createImageComponent: ", createImageComponent);

                                if (!createImageComponent) {
                                    // console.log(createImageComponent);
                                    return res.status(500).json({
                                        success: true,
                                        code: "COMPONENT_CREATION_FAILED",
                                        message: "Not Created!",
                                    });
                                } else {
                                    console.log(createImageComponent);
                                    return res.status(201).json({
                                        success: true,
                                        code: "COMPONENT_CREATED",
                                        message: "Video created!",
                                    });
                                }
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
                            console.log
                                ("req.body: ", req.body);
                            // const { label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset } = req.body;
                            // console.log(label, labels, listOfBackgroundColors, listOfNumericValues, borderColor, borderWidth, hoverOffset, offset, text, link, type, x, y, options);


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