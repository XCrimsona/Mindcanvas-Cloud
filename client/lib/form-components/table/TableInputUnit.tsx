import React, { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import Label from "../../components/form-elements/Label";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";
import "./table.css";

// Keep in sync with COLUMN_TYPES in server/models/multi-media/tableModel.js
const COLUMN_TYPES = ["Text", "Number", "Date", "Link", "Boolean"] as const;
type ColumnType = (typeof COLUMN_TYPES)[number];

interface ColumnDraft {
  name: string;
  columnType: ColumnType;
}

const TableInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) return null;

    const {
      dataScrollBoardRef,
      globalDraggingRef,
      tableInputOffSet,
      tableToggle,
      setTableToggle,
      tableInputCompRef,
      tableInputCompPosRef,
      hasInitializedPositionRef,
      updateCanvasData,
    } = useCanvasContext();

    // Center the creation form when it appears (mirrors TextInputUnit)
    useLayoutEffect(() => {
      if (
        !tableToggle ||
        hasInitializedPositionRef.current ||
        !dataScrollBoardRef.current ||
        !tableInputCompRef.current
      )
        return;

      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();
      const inputRect = tableInputCompRef.current.getBoundingClientRect();

      const canvasX =
        window.innerWidth / 2 - boardRect.left - inputRect.width / 2;
      const canvasY =
        window.innerHeight / 2 - boardRect.top - inputRect.height / 2;

      const boundedX = Math.max(
        0,
        Math.min(canvasX, boardRect.width - inputRect.width),
      );
      const boundedY = Math.max(
        0,
        Math.min(canvasY, boardRect.height - inputRect.height),
      );

      const el = tableInputCompRef.current as HTMLDivElement;
      el.style.left = `${boundedX}px`;
      el.style.top = `${boundedY}px`;
      tableInputCompPosRef.current = { x: boundedX, y: boundedY };

      hasInitializedPositionRef.current = true;
    }, [tableToggle]);

    const [tableName, setTableName] = useState<string>("");
    const [columns, setColumns] = useState<ColumnDraft[]>([
      { name: "", columnType: "Text" },
    ]);

    const updateColumn = (idx: number, patch: Partial<ColumnDraft>) => {
      setColumns((cols) =>
        cols.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
      );
    };
    const addColumn = () =>
      setColumns((cols) => [...cols, { name: "", columnType: "Text" }]);
    const removeColumn = (idx: number) =>
      setColumns((cols) =>
        cols.length <= 1 ? cols : cols.filter((_, i) => i !== idx),
      );

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const cleanName = tableName.trim();
      const cleanColumns = columns
        .map((c) => ({ name: c.name.trim(), columnType: c.columnType }))
        .filter((c) => c.name.length > 0);

      if (!cleanName) {
        toast.error("Table name is required");
        return;
      }
      if (cleanColumns.length === 0) {
        toast.error("At least one named column is required");
        return;
      }

      const payload = {
        tableName: cleanName,
        columns: cleanColumns,
        x: tableInputCompPosRef.current.x,
        y: tableInputCompPosRef.current.y,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/account/${userid}/table-management/${canvaid}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        toast.success("Table created");
        setTableName("");
        setColumns([{ name: "", columnType: "Text" }]);
        setTableToggle(false);
        updateCanvasData();
      } else {
        const json = await res.json().catch(() => ({}));
        if (json?.message === "Not Authenticated") redirectToSignIn();
        toast.error(json?.message || "Table was not created");
      }
    };

    // Drag plumbing — same pattern as TextInputUnit
    const onMouseMove = (event: MouseEvent) => {
      if (
        !globalDraggingRef.current ||
        !dataScrollBoardRef.current ||
        !tableInputCompRef.current
      )
        return;
      const el = tableInputCompRef.current as HTMLDivElement;
      const elRect = el.getBoundingClientRect();
      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();

      const mouseX = event.clientX - boardRect.left;
      const mouseY = event.clientY - boardRect.top;

      const newX = Math.max(
        0,
        Math.min(
          mouseX - tableInputOffSet.current.x,
          boardRect.width - elRect.width,
        ),
      );
      const newY = Math.max(
        0,
        Math.min(
          mouseY - tableInputOffSet.current.y,
          boardRect.height - elRect.height,
        ),
      );

      tableInputCompPosRef.current = { x: newX, y: newY };
      el.style.left = `${newX}px`;
      el.style.top = `${newY}px`;
    };
    const onMouseUp = () => {
      globalDraggingRef.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      tableInputOffSet.current = {
        x: tableInputCompPosRef.current.x,
        y: tableInputCompPosRef.current.y,
      };
    };
    const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      // don't start a drag when clicking inputs/buttons
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      )
        return;
      globalDraggingRef.current = true;
      const el = tableInputCompRef.current as HTMLDivElement;
      const elRect = el.getBoundingClientRect();
      tableInputOffSet.current = {
        x: event.clientX - elRect.left,
        y: event.clientY - elRect.top,
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    if (!tableToggle) return null;

    return (
      <div
        className={"data-table-component"}
        ref={tableInputCompRef}
        style={{
          position: "absolute",
          left: `${tableInputCompPosRef.current.x}px`,
          top: `${tableInputCompPosRef.current.y}px`,
        }}
        onMouseDown={onMouseDown}
      >
        <div className="absolute top-2 right-2 z-10">
          <span
            className="block cursor-pointer text-white"
            onClick={() => setTableToggle(false)}
          >
            ✕
          </span>
        </div>

        <form className={"table-input-form"} onSubmit={submit}>
          <Label
            htmlfor="table-name-input"
            className={"table-label"}
            text="Create Table"
          />
          <input
            id="table-name-input"
            className={"table-text-input"}
            type="text"
            placeholder="Table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />

          <DivClass className={"flex flex-col gap-1"}>
            <span className={"table-label"}>Columns</span>
            {columns.map((col, idx) => (
              <div className={"table-col-row"} key={idx}>
                <input
                  className={"table-col-name"}
                  type="text"
                  placeholder={`Column ${idx + 1} name`}
                  value={col.name}
                  onChange={(e) => updateColumn(idx, { name: e.target.value })}
                />
                <select
                  className={"table-col-type"}
                  value={col.columnType}
                  onChange={(e) =>
                    updateColumn(idx, {
                      columnType: e.target.value as ColumnType,
                    })
                  }
                >
                  {COLUMN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span
                  className={"table-col-remove"}
                  onClick={() => removeColumn(idx)}
                  title="Remove column"
                >
                  ✕
                </span>
              </div>
            ))}
            <Button
              id="table-add-col"
              className={"table-add-col-btn"}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                addColumn();
              }}
            >
              + Add column
            </Button>
          </DivClass>

          <div className={"table-btn-row"}>
            <Button
              id="table-btn-clear"
              className={"table-btn-clear"}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                setTableName("");
                setColumns([{ name: "", columnType: "Text" }]);
              }}
            >
              CLEAR
            </Button>
            <Button id="table-btn-submit" className={"table-btn-submit"}>
              SAVE
            </Button>
          </div>
        </form>
      </div>
    );
  } catch (error) {
    console.warn("Error in TableInputUnit: ", error);
    return (
      <DivClass className={"erro-message"}>
        An error occurred while loading the table input unit.
      </DivClass>
    );
  }
};

export default TableInputUnit;
