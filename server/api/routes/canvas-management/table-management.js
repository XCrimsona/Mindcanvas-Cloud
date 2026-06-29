import Router from "express";
import mongoose from "mongoose";
import getDB from "../../../lib/connnections/Connections.js";
import UserModel from "../../../models/userModel.js";
import canvaspaceModel from "../../../models/CanvaspaceModel.js";
import tableModel, { COLUMN_TYPES } from "../../../models/multi-media/tableModel.js";

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;

const tableManagementRouter = Router();

/**
 * Resolve authenticated user + canvaspace ownership.
 * Returns { user, canvaspace } or sends a response and returns null.
 */
async function resolveContext(req, res) {
  await getDB();
  const userid = req.user?.sub;
  const canvaid = req.params.canvaid;

  if (!userid || !canvaid) {
    res.status(401).json({
      success: false,
      code: "NOT_AUTHORIZED",
      message: "User not logged in",
    });
    return null;
  }

  const user = await UserModel.findById(String(userid));
  if (!user) {
    res.status(401).json({
      success: false,
      code: "USER_NOT_AUTHORIZED",
      message: "User is not logged in",
    });
    return null;
  }

  const canvaspace = await canvaspaceModel.findOne({
    createdBy: user._id,
    _id: canvaid,
  });
  if (!canvaspace) {
    res.status(404).json({
      success: false,
      code: "WORKSPACE_DOES_NOT_EXIST",
      message: "Workspace not found",
    });
    return null;
  }

  return { user, canvaspace };
}

function sanitizeColumns(input) {
  if (!Array.isArray(input) || input.length === 0) return null;
  const columns = [];
  for (const col of input) {
    if (!col || typeof col !== "object") return null;
    const name = typeof col.name === "string" ? col.name.trim() : "";
    if (!name) return null;
    const columnType = COLUMN_TYPES.includes(col.columnType) ? col.columnType : "Text";
    columns.push({ name, columnType });
  }
  return columns;
}

function sanitizeCells(input, expectedLength) {
  if (!Array.isArray(input)) return null;
  // Pad or trim to match column count. Coerce non-strings to string,
  // preserve user whitespace exactly (no trim of cell content).
  const cells = input.slice(0, expectedLength).map((v) => (v == null ? "" : String(v)));
  while (cells.length < expectedLength) cells.push("");
  return cells;
}

tableManagementRouter
  // List tables for a canvaspace — metadata only (no row payloads)
  .get("/:userid/table-management/:canvaid", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;

      const tables = await tableModel
        .find(
          { workspaceId: canvaspace._id, createdBy: user._id },
          { rows: 0 } // exclude row payloads from list response
        )
        .lean();

      // Attach rowCount so the frontend can build the paginator without loading rows
      const tablesWithCounts = await Promise.all(
        tables.map(async (t) => {
          const counted = await tableModel.findOne(
            { _id: t._id, createdBy: user._id },
            { rows: 1 }
          );
          return { ...t, rowCount: counted?.rows?.length || 0 };
        })
      );

      return res.status(200).json({
        success: true,
        code: tablesWithCounts.length === 0 ? "NO_EXISTING_TABLES" : "TABLES_RETRIEVED",
        message:
          tablesWithCounts.length === 0
            ? "No tables yet on this canvas."
            : "Tables retrieved.",
        tables: tablesWithCounts,
      });
    } catch (err) {
      console.warn("table-management GET list error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  })

  // Create a new table (name + columns + position). Rows added later via /rows endpoint.
  .post("/:userid/table-management/:canvaid", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;

      const { tableName, columns, x, y } = req.body;

      if (
        typeof tableName !== "string" ||
        !tableName.trim() ||
        !(x >= 0) ||
        !(y >= 0)
      ) {
        return res.status(400).json({
          success: false,
          code: "INSUFFICIENT_DATA",
          message: "tableName, x and y are required",
        });
      }

      const cleanColumns = sanitizeColumns(columns);
      if (!cleanColumns) {
        return res.status(400).json({
          success: false,
          code: "INVALID_COLUMNS",
          message:
            "At least one column with a name is required. Allowed types: " +
            COLUMN_TYPES.join(", "),
        });
      }

      const created = await tableModel.create({
        tableName: tableName.trim(),
        columns: cleanColumns,
        rows: [],
        type: "Table",
        position: { x, y },
        owner: user._id,
        createdBy: user._id,
        workspaceId: canvaspace._id,
        name: canvaspace.name,
        workspacename: canvaspace.workspacename,
      });

      if (!created) {
        return res.status(500).json({
          success: false,
          code: "TABLE_COMPONENT_NOT_CREATED",
          message: "Table fragment not created!",
        });
      }

      return res.status(201).json({
        success: true,
        code: "TABLE_COMPONENT_CREATED",
        message: "Table fragment created!",
        table: {
          _id: created._id,
          tableName: created.tableName,
          columns: created.columns,
          position: created.position,
          rowCount: 0,
        },
      });
    } catch (err) {
      console.warn("table-management POST create error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  })

  // Paginated row fetch — Google-style skip+limit. Backend slices the array
  // so we never ship 1000 rows to the client just to render 30.
  .get("/:userid/table-management/:canvaid/:tableid/rows", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;
      const { tableid } = req.params;

      let skip = parseInt(req.query.skip, 10);
      let limit = parseInt(req.query.limit, 10);
      if (!Number.isFinite(skip) || skip < 0) skip = 0;
      if (!Number.isFinite(limit) || limit <= 0) limit = DEFAULT_PAGE_SIZE;
      if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

      // Use aggregation to slice rows server-side and return total in one round trip
      const agg = await tableModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(tableid),
            workspaceId: canvaspace._id,
            createdBy: user._id,
          },
        },
        {
          $project: {
            tableName: 1,
            columns: 1,
            position: 1,
            rowCount: { $size: { $ifNull: ["$rows", []] } },
            rows: { $slice: ["$rows", skip, limit] },
          },
        },
      ]);

      if (!agg || agg.length === 0) {
        return res.status(404).json({
          success: false,
          code: "TABLE_NOT_FOUND",
          message: "Table not found",
        });
      }

      const doc = agg[0];
      return res.status(200).json({
        success: true,
        code: "TABLE_ROWS_RETRIEVED",
        message: "Rows retrieved.",
        table: {
          _id: doc._id,
          tableName: doc.tableName,
          columns: doc.columns,
          position: doc.position,
          rowCount: doc.rowCount,
        },
        page: { skip, limit, rowCount: doc.rowCount },
        rows: doc.rows || [],
      });
    } catch (err) {
      console.warn("table-management GET rows error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  })

  // Add a single row (PostgreSQL migration will later replace this with bulk import)
  .post("/:userid/table-management/:canvaid/:tableid/rows", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;
      const { tableid } = req.params;

      const table = await tableModel.findOne({
        _id: tableid,
        workspaceId: canvaspace._id,
        createdBy: user._id,
      });
      if (!table) {
        return res.status(404).json({
          success: false,
          code: "TABLE_NOT_FOUND",
          message: "Table not found",
        });
      }

      const cells = sanitizeCells(req.body?.cells, table.columns.length);
      if (!cells) {
        return res.status(400).json({
          success: false,
          code: "INVALID_ROW_DATA",
          message: "cells must be an array",
        });
      }

      table.rows.push({ cells });
      await table.save();
      const newRow = table.rows[table.rows.length - 1];

      return res.status(201).json({
        success: true,
        code: "ROW_CREATED",
        message: "Row added.",
        row: newRow,
        rowCount: table.rows.length,
      });
    } catch (err) {
      console.warn("table-management POST row error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  })

  // Edit a row
  .patch("/:userid/table-management/:canvaid/:tableid/rows/:rowid", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;
      const { tableid, rowid } = req.params;

      const table = await tableModel.findOne({
        _id: tableid,
        workspaceId: canvaspace._id,
        createdBy: user._id,
      });
      if (!table) {
        return res.status(404).json({
          success: false,
          code: "TABLE_NOT_FOUND",
          message: "Table not found",
        });
      }

      const row = table.rows.id(rowid);
      if (!row) {
        return res.status(404).json({
          success: false,
          code: "ROW_NOT_FOUND",
          message: "Row not found",
        });
      }

      const cells = sanitizeCells(req.body?.cells, table.columns.length);
      if (!cells) {
        return res.status(400).json({
          success: false,
          code: "INVALID_ROW_DATA",
          message: "cells must be an array",
        });
      }

      row.cells = cells;
      await table.save();

      return res.status(200).json({
        success: true,
        code: "ROW_UPDATED",
        message: "Row updated.",
        row,
      });
    } catch (err) {
      console.warn("table-management PATCH row error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  })

  // Delete a row
  .delete("/:userid/table-management/:canvaid/:tableid/rows/:rowid", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;
      const { tableid, rowid } = req.params;

      const result = await tableModel.updateOne(
        {
          _id: tableid,
          workspaceId: canvaspace._id,
          createdBy: user._id,
        },
        { $pull: { rows: { _id: rowid } } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          code: "ROW_NOT_FOUND",
          message: "Row not found",
        });
      }

      return res.status(200).json({
        success: true,
        code: "ROW_DELETED",
        message: "Row deleted.",
      });
    } catch (err) {
      console.warn("table-management DELETE row error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  })

  // Update table XY position (drag persistence)
  .patch("/:userid/table-management/:canvaid/:tableid", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;
      const { tableid } = req.params;
      const { x, y, tableName } = req.body;

      const update = {};
      if (x >= 0 && y >= 0) update.position = { x, y };
      if (typeof tableName === "string" && tableName.trim()) {
        update.tableName = tableName.trim();
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({
          success: false,
          code: "INSUFFICIENT_DATA",
          message: "Nothing to update",
        });
      }

      const result = await tableModel.updateOne(
        {
          _id: tableid,
          workspaceId: canvaspace._id,
          createdBy: user._id,
        },
        { $set: update }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          code: "TABLE_NOT_FOUND",
          message: "Table not found",
        });
      }

      return res.status(200).json({
        success: true,
        code: "TABLE_UPDATED",
        message: "Table updated.",
      });
    } catch (err) {
      console.warn("table-management PATCH table error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  })

  // Delete entire table
  .delete("/:userid/table-management/:canvaid/:tableid", async (req, res) => {
    try {
      const ctx = await resolveContext(req, res);
      if (!ctx) return;
      const { user, canvaspace } = ctx;
      const { tableid } = req.params;

      const result = await tableModel.deleteOne({
        _id: tableid,
        workspaceId: canvaspace._id,
        createdBy: user._id,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          code: "TABLE_NOT_FOUND",
          message: "Table not found",
        });
      }

      return res.status(200).json({
        success: true,
        code: "TABLE_DELETED",
        message: "Table deleted.",
      });
    } catch (err) {
      console.warn("table-management DELETE table error:", err.message);
      return res.status(500).json({
        success: false,
        code: "SERVER_TABLE_ERROR",
        message: err.message,
      });
    }
  });

export default tableManagementRouter;
