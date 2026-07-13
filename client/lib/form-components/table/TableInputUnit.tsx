import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import Label from "../../components/form-elements/Label";
import { useFormComponentToggle } from "../FormComponentToggleContext";
import { useCanvasFragmentData } from "../../canvas-data/CanvasFragmentDataContext";
import useFormComponentDrag from "../useFormComponentDrag";
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
    if (!userid) {
      return null;
    } else {
      //normal path — continue rendering
    }

    const {
      tableToggle,
      setTableToggle,
      tableInputCompRef,
      tableInputCompPosRef,
    } = useFormComponentToggle();
    const { updateCanvasData } = useCanvasFragmentData();

    const { handlePointerDown, handlePointerMove, handlePointerUp } =
      useFormComponentDrag({
        elementRef: tableInputCompRef,
        positionRef: tableInputCompPosRef,
        isOpen: tableToggle,
      });

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
      } else {
        //continue
      }
      if (cleanColumns.length === 0) {
        toast.error("At least one named column is required");
        return;
      } else {
        //continue
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
        if (json?.message === "Not Authenticated") {
          redirectToSignIn();
        } else {
          //non-auth failure — surface toast below
        }
        toast.error(json?.message || "Table was not created");
      }
    };

    if (!tableToggle) {
      return null;
    } else {
      //normal path — continue rendering
    }

    return (
      <div
        className={"data-table-component"}
        ref={tableInputCompRef}
        style={{
          position: "absolute",
          left: `${tableInputCompPosRef.current.x}px`,
          top: `${tableInputCompPosRef.current.y}px`,
          cursor: "move",
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
