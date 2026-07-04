import getDB from "../../../lib/connnections/Connections.js";
// import audioModel from "../../../models/multi-media/audioModel.js";
// import imageModel from "../../../models/multi-media/imageModel.js";
// import textModel from "../../../models/multi-media/textModel.js";
import UserModel from "../../../models/userModel.js";
// import videoModel from "../../../models/multi-media/videoModel.js";
import workspaceModel from "../../../models/CanvaspaceModel.js";
import Router, { response } from "express";

//loads all canvases 
const canvasManagementRouter = Router();
canvasManagementRouter
    .get("/:userid/canvas-management", async (request, response) => {
        try {
            await getDB();
            const sub = request.user?.sub;

            const user = await UserModel.findOne({ _id: sub });
            if (!user) {
                return response.status(404).json({
                    success: false,
                    code: "NO_USER_DATA",
                    status: 404,
                    message: "User not found",
                });
            } else {
                const [workspaces] = await Promise.all([
                    //may need slight updates???
                    await workspaceModel.find({ createdBy: user._id }),
                ]);

                if (!workspaces) {
                    return response.status(200).json({
                        success: false,
                        status: 200,
                        code: "NO_CANVA_DATA",
                        message: "Create a workspace to begin",
                    });
                }
                else {
                    return response.status(200).json({
                        success: true,
                        code: "RECEIVED_CANVA_DATA",
                        status: 200,
                        data: workspaces,
                        user: user.firstname,
                    }
                    );
                }
            }
        } catch (err) {
            return response.status(500).json({
                success: false,
                code: "SERVER_CANVA_ERROR",
                status: 500,
                message: "The server side workspace has issues",
            }
            );
        }
    })
    .post("/:userid/canvas-management", async (request, response) => {
        try {
            await getDB();
            const sub = request.user?.sub;

            const { workspacename, workspacedescription } = request.body;

            const user = await UserModel.findOne({ _id: String(sub) });
            if (!user) {
                return response.status(404).json({
                    success: false,
                    code: "NO_USER_DATA",
                    status: 404,
                    message: "User not found",
                });
            }

            //to track user signup and dates if needed later on
            const workspaceData = {};
            if (workspacename) workspaceData.workspacename = workspacename;
            if (workspacedescription)
                workspaceData.workspacedescription = workspacedescription;

            if (workspacename && workspacedescription) {
                const refactorWorkspaceName = workspacename
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-");
                const newWorkspace = await workspaceModel.create({
                    name: refactorWorkspaceName,
                    //above for urls
                    workspacename: workspacename,
                    description: workspacedescription,
                    type: "Canvaspace",
                    owner: user._id,
                    size: {
                        height: "800",
                        width: "1400"
                    },
                    collaborators: [],
                    createdBy: user._id,
                    dateCreated: new Date().getTime(),
                });

                if (newWorkspace) {
                    return response.status(201).json(
                        {
                            success: true,
                            code: "CREATED_CANVA",
                            status: 201,
                            message: "New workspace saved",
                        }
                    );
                }
                else {
                    return response.status(400).json(
                        {
                            success: false,
                            code: "MISSING_SUBMISSION_DATA",
                            status: 400,
                            message: "Fill in required fields",
                        }
                    );
                }
            }
        } catch (err) {
            console.log(err.message);

            return response.status(500).json({
                success: false,
                code: "SERVER_CANVA_ERROR",
                status: 500,
                message: err.message,
            }
            );
        }
    }).patch("/:userid/canvas-management",
        async (request, response) => {
            try {
                await getDB();
                const sub = request.user?.sub;
                const { workspaceid, workspacename, currentworkspacename, description, currentworkspacedescription } = request.body;
                const user = await UserModel.findOne({ _id: sub });
                if (!user) {
                    return response.status(404).json({
                        success: false,
                        code: "NO_USER_DATA",
                        status: 404,
                        message: "User not found",
                    });
                }

                const workspace = await workspaceModel.findOne({
                    _id: workspaceid,
                    createdBy: user._id,
                });

                if (!workspace) {
                    return response.status(404).json({
                        success: false,
                        code: "MISSING_CANVA_DATA",
                        status: 404,
                        message: "Workspace not found",
                    }
                    );
                }

                // ─── OLD (BROKEN) — kept for reference ────────────────
                // Problems, in order:
                //
                //  (a) Nested `if`s required BOTH `workspacename` AND
                //      `currentworkspacename` to be truthy. Frontend wasn't
                //      sending `currentworkspacename`, so nothing entered
                //      updatedPayload — ever.
                //
                //  (b) `updatedPayload.workspacename !== workspacename` (and
                //      the version with `===`) is nonsense. Either the field
                //      got assigned to `workspacename` above (so they're
                //      equal by construction) or it didn't (so both sides
                //      are `undefined` and === is true). The condition is
                //      never a real "should we write?" gate. The right
                //      question is: does updatedPayload have any keys?
                //
                //  (c) `if (updatedWorkspace)` and `matchedCount > 1` both
                //      check things that are always true / never true:
                //      updateOne always returns an object, and matching by
                //      `_id` gives you 0 or 1, never >1. `modifiedCount >= 1`
                //      is the real "a write happened" check.
                //
                //  (d) Status 201 is for created resources; PATCH should
                //      return 200.
                //
                //  (e) When line 190's `if` was false, the handler fell off
                //      the end with no `response.send(...)`, hanging the
                //      request until it timed out.
                //
                // const updatedPayload = {};
                // if (workspacename && currentworkspacename) {
                //     if (workspacename !== currentworkspacename) {
                //         updatedPayload.workspacename = workspacename;
                //
                //         //workspacename with dashes for routing
                //         const refactorWorkspaceName = workspacename
                //             .toLowerCase()
                //             .trim()
                //             .replace(/[^a-z0-9\s-]/g, "")
                //             .replace(/\s+/g, "-");
                //         updatedPayload.name = refactorWorkspaceName;
                //     }
                // }
                //
                // if (description && currentworkspacedescription) {
                //     if (description !== currentworkspacedescription) {
                //         updatedPayload.description = description;
                //     }
                // }
                //
                // if (updatedPayload.workspacename !== workspacename && updatedPayload.description !== description) {
                //     const updatedWorkspace = await workspaceModel.updateOne(
                //         { _id: workspace._id },
                //         { $set: updatedPayload }
                //     );
                //     if (updatedWorkspace.matchedCount > 1) {
                //         return response.status(201).json({
                //             success: true,
                //             code: "CANVA_MANAGEMENT_DATA_PATCHED",
                //             status: 201,
                //             message: "User data component updated",
                //         });
                //     } else {
                //         return response.status(400).json({
                //             message: "Fill in required fields",
                //         });
                //     }
                // }
                // // <-- and here the handler falls off the end silently
                // ─────────────────────────────────────────────────────────

                // Build a payload of ONLY the fields that actually changed.
                // For each field: client must have sent a value AND that value
                // must differ from what the client says was there before.
                const updatedPayload = {};

                if (workspacename && workspacename !== currentworkspacename) {
                    updatedPayload.workspacename = workspacename;

                    // slug used for routing — derived from the new name
                    updatedPayload.name = workspacename
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-");
                }

                if (description && description !== currentworkspacedescription) {
                    updatedPayload.description = description;
                }

                // Gate the DB write on "is there anything to update?" — the
                // real question the old line 190 was trying (and failing) to
                // ask.
                if (Object.keys(updatedPayload).length === 0) {
                    return response.status(200).json({
                        success: true,
                        code: "NO_CHANGES_DETECTED",
                        status: 200,
                        message: "Nothing to update",
                    });
                }

                const updatedWorkspace = await workspaceModel.updateOne(
                    { _id: workspace._id },
                    { $set: updatedPayload }
                );

                // updateOne returns { acknowledged, matchedCount, modifiedCount }.
                // modifiedCount >= 1 is what proves a write actually
                // happened (0 means the DB already had these exact values).
                if (updatedWorkspace.modifiedCount >= 1) {
                    return response.status(200).json({
                        success: true,
                        code: "CANVA_MANAGEMENT_DATA_PATCHED",
                        status: 200,
                        message: "Workspace updated",
                    });
                }

                return response.status(200).json({
                    success: true,
                    code: "NO_CHANGES_APPLIED",
                    status: 200,
                    message: "Workspace already had these values",
                });
            } catch (err) {
                console.warn("PATCH canvas-management error:", err.message);
                return response.status(500).json({
                    success: false,
                    code: "SERVER_CANVA_ERROR",
                    status: 500,
                    message: "The server side workspace has issues",
                });
            }
        });


export default canvasManagementRouter;
