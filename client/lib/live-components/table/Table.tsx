import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCanvasContext } from "../../form-components/canva-data-provider/CanvasDataContextProvider";
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import { ModificationWindow } from "../../modify-data/ModificationWindow";
import { EditWindow } from "../../modify-data/EditWindow";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";
import "../../form-components/table/table.css";
import "../i-menu-selector.css";
import { SpanFragment } from "../../ui/spanElement";

interface Column {
  name: string;
  columnType: "Text" | "Number" | "Date" | "Link" | "Boolean";
}

interface Row {
  _id: string;
  cells: string[];
}

interface TableMeta {
  _id: string;
  tableName: string;
  columns: Column[];
  position: { x: number; y: number };
  rowCount: number;
}

const PAGE_SIZE = 30;

const apiBase = (userid: string, canvaid: string) =>
  `${import.meta.env.VITE_API_URL}/api/account/${userid}/table-management/${canvaid}`;

// Map column type → input type for the editor
function inputTypeFor(t: Column["columnType"]): string {
  switch (t) {
    case "Number":
      return "number";
    case "Date":
      return "date";
    case "Link":
      return "url";
    default:
      return "text";
  }
}

export const Table = ({ data }: { data: TableMeta | any }) => {
  const { userid, canvaid } = useParams();
  const { type } = data;

  const { setRepositionWindow } = useCanvasContext();
  const {
    modificationWindow,
    setModificationWindow,
    editState,
    selectedComp,
    setSelectedComp,
    moveFragment,
  } = useModificationContext();

  const selectFragmentId = (e: React.MouseEvent<HTMLButtonElement>) => {
    const dataFragmentId = String((e.target as HTMLElement).id);

    setSelectedComp({
      dataFragmentId: dataFragmentId,
      type: type,
      info: "",
    });

    moveFragment(e);
  };
  const [meta, setMeta] = useState<TableMeta>(data);
  const [rows, setRows] = useState<Row[]>([]);
  const [rowCount, setRowCount] = useState<number>(data.rowCount || 0);
  const [skip, setSkip] = useState<number>(0);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[]>([]);
  const [adding, setAdding] = useState<boolean>(false);
  const [newRowDraft, setNewRowDraft] = useState<string[]>(() =>
    data.columns.map(() => ""),
  );
  const fragmentRef = useRef<HTMLDivElement | null>(null);

  // ---- data fetching ----
  const loadRows = async (nextSkip: number) => {
    if (!userid || !canvaid) return;
    const res = await fetch(
      `${apiBase(userid, canvaid)}/${meta._id}/rows?skip=${nextSkip}&limit=${PAGE_SIZE}`,
      { method: "GET", credentials: "include" },
    );
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      if (json?.message === "Not Authenticated") redirectToSignIn();
      toast.error(json?.message || "Could not load rows");
      return;
    }
    const json = await res.json();
    setRows(json.rows || []);
    setRowCount(json.page?.rowCount ?? json.table?.rowCount ?? 0);
    if (json.table) setMeta((m) => ({ ...m, ...json.table }));
  };

  useEffect(() => {
    loadRows(skip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  // ---- row CRUD ----
  const onEditClick = (row: Row) => {
    setEditingRowId(row._id);
    setDraft([...row.cells]);
  };
  const onCancelEdit = () => {
    setEditingRowId(null);
    setDraft([]);
  };
  const onSaveEdit = async (row: Row) => {
    if (!userid || !canvaid) return;
    const res = await fetch(
      `${apiBase(userid, canvaid)}/${meta._id}/rows/${row._id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cells: draft }),
      },
    );
    if (res.ok) {
      toast.success("Row updated");
      setEditingRowId(null);
      setDraft([]);
      loadRows(skip);
    } else {
      const json = await res.json().catch(() => ({}));
      if (json?.message === "Not Authenticated") redirectToSignIn();
      toast.error(json?.message || "Could not update row");
    }
  };
  const onDeleteRow = async (row: Row) => {
    if (!userid || !canvaid) return;
    const res = await fetch(
      `${apiBase(userid, canvaid)}/${meta._id}/rows/${row._id}`,
      { method: "DELETE", credentials: "include" },
    );
    if (res.ok) {
      toast.success("Row deleted");
      // If the page becomes empty and we're not on page 1, step back
      const remaining = rowCount - 1;
      const lastValidSkip = Math.max(
        0,
        (Math.ceil(remaining / PAGE_SIZE) - 1) * PAGE_SIZE,
      );
      const nextSkip = skip > remaining - 1 ? lastValidSkip : skip;
      if (nextSkip !== skip) setSkip(nextSkip);
      else loadRows(skip);
    } else {
      toast.error("Could not delete row");
    }
  };
  const onAddRow = async () => {
    if (!userid || !canvaid) return;
    const res = await fetch(`${apiBase(userid, canvaid)}/${meta._id}/rows`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cells: newRowDraft }),
    });
    if (res.ok) {
      const json = await res.json();
      toast.success("Row added");
      setNewRowDraft(meta.columns.map(() => ""));
      setAdding(false);
      // jump to the page containing the new row (always the last page)
      const newCount = json.rowCount ?? rowCount + 1;
      const lastPageSkip = Math.max(
        0,
        (Math.ceil(newCount / PAGE_SIZE) - 1) * PAGE_SIZE,
      );
      if (lastPageSkip !== skip) setSkip(lastPageSkip);
      else loadRows(skip);
    } else {
      const json = await res.json().catch(() => ({}));
      if (json?.message === "Not Authenticated") redirectToSignIn();
      toast.error(json?.message || "Could not add row");
    }
  };
  // ---- paginator ----
  const pageCount = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const rangeLabel = (page: number) => {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, rowCount);
    return `${start}-${end}`;
  };

  return (
    <>
      {modificationWindow && selectedComp.dataFragmentId === meta._id && (
        <ModificationWindow componentData={{ ...meta, type: "Table" }} />
      )}
      {editState && selectedComp.dataFragmentId === meta._id && (
        <EditWindow componentData={{ ...meta, type: "Table" }} />
      )}
      <div ref={fragmentRef} className={"live-table-fragment"}>
        <SpanFragment
          id={`${data._id}`}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            selectFragmentId(e);
            setRepositionWindow(false);
            setModificationWindow(true);
          }}
          className="i-note-drop-down"
          // title="Open menu"
        >
          i
        </SpanFragment>
        <div className={"live-table-header"}>
          <span className={"live-table-name"}>{meta.tableName}</span>
          <div className={"live-table-header-actions"}>
            <button
              className={"live-table-icon-btn"}
              onClick={() => setAdding((v) => !v)}
              title="Add row"
              type="button"
            >
              + Row
            </button>
          </div>
        </div>

        <div className={"live-table-scroll"}>
          <table className={"live-table-grid"}>
            <thead>
              <tr>
                {meta.columns.map((c, i) => (
                  <th key={i} title={c.columnType}>
                    {c.name}
                  </th>
                ))}
                <th style={{ width: "1%" }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isEditing = editingRowId === row._id;
                return (
                  <tr key={row._id}>
                    {meta.columns.map((col, ci) => (
                      <td key={ci}>
                        {isEditing ? (
                          col.columnType === "Boolean" ? (
                            <select
                              className={"live-table-cell-input"}
                              value={draft[ci] ?? ""}
                              onChange={(e) => {
                                const next = [...draft];
                                next[ci] = e.target.value;
                                setDraft(next);
                              }}
                            >
                              <option value="">—</option>
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          ) : (
                            <input
                              className={"live-table-cell-input"}
                              type={inputTypeFor(col.columnType)}
                              value={draft[ci] ?? ""}
                              onChange={(e) => {
                                const next = [...draft];
                                next[ci] = e.target.value;
                                setDraft(next);
                              }}
                            />
                          )
                        ) : col.columnType === "Link" && row.cells[ci] ? (
                          <a
                            href={row.cells[ci]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#FBAA00] underline"
                          >
                            {row.cells[ci]}
                          </a>
                        ) : (
                          (row.cells[ci] ?? "")
                        )}
                      </td>
                    ))}
                    <td>
                      <div className={"live-table-row-actions"}>
                        {isEditing ? (
                          <>
                            <button
                              className={"live-table-icon-btn"}
                              onClick={() => onSaveEdit(row)}
                              type="button"
                            >
                              ✓
                            </button>
                            <button
                              className={"live-table-icon-btn"}
                              onClick={onCancelEdit}
                              type="button"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className={"live-table-icon-btn"}
                              onClick={() => onEditClick(row)}
                              type="button"
                            >
                              ✎
                            </button>
                            <button
                              className={"live-table-icon-btn-danger"}
                              onClick={() => onDeleteRow(row)}
                              type="button"
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {adding && (
                <tr>
                  {meta.columns.map((col, ci) => (
                    <td key={ci}>
                      {col.columnType === "Boolean" ? (
                        <select
                          className={"live-table-cell-input"}
                          value={newRowDraft[ci] ?? ""}
                          onChange={(e) => {
                            const next = [...newRowDraft];
                            next[ci] = e.target.value;
                            setNewRowDraft(next);
                          }}
                        >
                          <option value="">—</option>
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          className={"live-table-cell-input"}
                          type={inputTypeFor(col.columnType)}
                          placeholder={col.name}
                          value={newRowDraft[ci] ?? ""}
                          onChange={(e) => {
                            const next = [...newRowDraft];
                            next[ci] = e.target.value;
                            setNewRowDraft(next);
                          }}
                        />
                      )}
                    </td>
                  ))}
                  <td>
                    <div className={"live-table-row-actions"}>
                      <button
                        className={"live-table-icon-btn"}
                        onClick={onAddRow}
                        type="button"
                      >
                        ✓
                      </button>
                      <button
                        className={"live-table-icon-btn"}
                        onClick={() => {
                          setAdding(false);
                          setNewRowDraft(meta.columns.map(() => ""));
                        }}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {rows.length === 0 && !adding && (
                <tr>
                  <td
                    colSpan={meta.columns.length + 1}
                    className="text-center text-[#888] py-3"
                  >
                    No rows yet. Click "+ Row" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={"live-table-footer"}>
          <span>
            {rowCount} row{rowCount === 1 ? "" : "s"}
          </span>
          {pageCount > 1 && (
            <div className={"live-table-paginator"}>
              {Array.from({ length: pageCount }, (_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <span
                    key={page}
                    className={
                      isActive
                        ? "live-table-page-chip-active"
                        : "live-table-page-chip"
                    }
                    onClick={() => !isActive && setSkip((page - 1) * PAGE_SIZE)}
                    title={rangeLabel(page)}
                  >
                    {page}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Table;
