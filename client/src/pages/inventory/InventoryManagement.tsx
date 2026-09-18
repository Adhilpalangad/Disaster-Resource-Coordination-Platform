import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Download, Package, CheckCircle2, AlertCircle, Trash2,
  RefreshCw, Plus, X, Save, Edit2, FileSpreadsheet,
  Utensils, Droplets, HeartPulse, Shirt, AlertTriangle,
  ChevronDown, Info,
} from "lucide-react";
import { useAuth }       from "../../context/AuthContext.js";
import { inventoryApi, type InventoryItem, type ParsedRow } from "../../services/inventoryApi.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import EmptyState    from "../../components/EmptyState.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "food",             label: "Food",             color: "#D97706", Icon: Utensils      },
  { value: "water",            label: "Water",            color: "#0284C7", Icon: Droplets      },
  { value: "medicine",         label: "Medicine",         color: "#059669", Icon: HeartPulse    },
  { value: "clothing",         label: "Clothing",         color: "#7C3AED", Icon: Shirt         },
  { value: "rescue_equipment", label: "Rescue Equipment", color: "#DC2626", Icon: AlertTriangle },
  { value: "other",            label: "Other",            color: "#64748B", Icon: Package       },
] as const;
type CategoryValue = typeof CATEGORIES[number]["value"];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c])) as Record<CategoryValue, typeof CATEGORIES[number]>;

const COMMON_UNITS = ["pcs", "kg", "g", "litres", "ml", "boxes", "cans", "strips", "packets", "bags", "sets", "units"];

function getCatDisplay(cat: string) {
  return CAT_MAP[cat as CategoryValue] ?? { color: "#64748B", label: cat, Icon: Package };
}

function expiryStatus(iso?: string): "ok" | "soon" | "expired" | "none" {
  if (!iso) return "none";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0)                  return "expired";
  if (diff < 30 * 86400 * 1000) return "soon";
  return "ok";
}

// ── Compact upload button ──────────────────────────────────────────────────────
const UploadButton: React.FC<{ onFile: (f: File) => void; loading: boolean }> = ({ onFile, loading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} disabled={loading}
        onChange={e => { const f = e.target.files?.[0]; if (f) { onFile(f); e.target.value = ""; } }} />
      <button onClick={() => inputRef.current?.click()} disabled={loading}
        style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "9px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: loading ? "var(--secondary)" : "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: loading ? "not-allowed" : "pointer" }}>
        {loading
          ? <RefreshCw size={14} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
          : <FileSpreadsheet size={14} color="var(--primary)" />}
        {loading ? "Parsing…" : "Upload Excel / CSV"}
      </button>
    </>
  );
};

// ── Editable preview table ────────────────────────────────────────────────────
type EditableRow = ParsedRow & { _id: string };

const PreviewTable: React.FC<{
  rows: EditableRow[];
  onChange: (rows: EditableRow[]) => void;
  onClose: () => void;
  onImport: (mode: "append" | "replace") => void;
  importing: boolean;
  meta: { total: number; valid: number; invalid: number; sheetName: string } | null;
}> = ({ rows, onChange, onClose, onImport, importing, meta }) => {
  const setCell = (id: string, field: keyof ParsedRow, value: string | number) => {
    onChange(rows.map(r => {
      if (r._id !== id) return r;
      const updated = { ...r, [field]: value };
      updated._valid = !!updated.name?.trim();
      updated._error = updated._valid ? "" : "Missing item name";
      return updated;
    }));
  };

  const removeRow = (id: string) => onChange(rows.filter(r => r._id !== id));

  const addRow = () => onChange([...rows, {
    _id: `new-${Date.now()}`, _rowIndex: rows.length + 2,
    name: "", category: "other", quantity: 0, unit: "pcs",
    location: "", expiresAt: "", notes: "", _valid: false, _error: "Missing item name",
  }]);

  const validCount   = rows.filter(r => r._valid).length;
  const invalidCount = rows.filter(r => !r._valid).length;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", flexDirection: "column", padding: "20px" }}>
      <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "16px", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <FileSpreadsheet size={20} color="var(--primary)" />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>
              Verify & Edit Before Importing
            </h2>
            {meta && (
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--secondary)" }}>
                Sheet: <strong>{meta.sheetName}</strong> · {rows.length} rows ·{" "}
                <span style={{ color: "var(--success)" }}>{validCount} valid</span>
                {invalidCount > 0 && <span style={{ color: "var(--danger)" }}> · {invalidCount} need names</span>}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: "4px", display: "flex" }}><X size={18} /></button>
        </div>

        {/* Info banner */}
        <div style={{ padding: "10px 24px", backgroundColor: "rgba(2,132,199,0.05)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--secondary)" }}>
          <Info size={13} color="var(--primary)" />
          Click any cell to edit. Rows with empty <strong>Item Name</strong> will be skipped. Add rows with <strong>+ Add Row</strong>.
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "900px" }}>
            <thead style={{ position: "sticky", top: 0, backgroundColor: "var(--card-bg)", zIndex: 1 }}>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                {["#", "Item Name *", "Category", "Qty", "Unit", "Location", "Expiry Date", "Notes", ""].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, _idx) => {
                const catDisplay = getCatDisplay(row.category);
                return (
                  <tr key={row._id} style={{ borderBottom: "1px solid var(--border)", backgroundColor: !row._valid ? "rgba(239,68,68,0.03)" : "transparent" }}>
                    {/* Row number */}
                    <td style={{ padding: "6px 12px", color: "var(--secondary)", fontSize: "11px", width: "36px" }}>
                      {row._valid
                        ? <span style={{ color: "var(--success)" }}>✓</span>
                        : <span title={row._error} style={{ color: "var(--danger)", cursor: "help" }}>!</span>}
                    </td>
                    {/* Name */}
                    <td style={{ padding: "4px 8px", minWidth: "180px" }}>
                      <input value={row.name} onChange={e => setCell(row._id, "name", e.target.value)}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: `1px solid ${!row._valid ? "var(--danger)" : "var(--border)"}`, fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)", boxSizing: "border-box" }} />
                    </td>
                    {/* Category */}
                    <td style={{ padding: "4px 8px", minWidth: "150px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: catDisplay.color, flexShrink: 0 }} />
                        <select value={row.category} onChange={e => setCell(row._id, "category", e.target.value)}
                          style={{ flex: 1, border: "none", background: "transparent", fontSize: "13px", color: "var(--text-h)", cursor: "pointer", outline: "none" }}>
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                    </td>
                    {/* Quantity */}
                    <td style={{ padding: "4px 8px", width: "80px" }}>
                      <input type="number" min="0" value={row.quantity} onChange={e => setCell(row._id, "quantity", Number(e.target.value))}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)", boxSizing: "border-box" }} />
                    </td>
                    {/* Unit */}
                    <td style={{ padding: "4px 8px", width: "100px" }}>
                      <input list={`units-${row._id}`} value={row.unit} onChange={e => setCell(row._id, "unit", e.target.value)}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)", boxSizing: "border-box" }} />
                      <datalist id={`units-${row._id}`}>
                        {COMMON_UNITS.map(u => <option key={u} value={u} />)}
                      </datalist>
                    </td>
                    {/* Location */}
                    <td style={{ padding: "4px 8px", minWidth: "130px" }}>
                      <input value={row.location} onChange={e => setCell(row._id, "location", e.target.value)}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)", boxSizing: "border-box" }} />
                    </td>
                    {/* Expiry */}
                    <td style={{ padding: "4px 8px", width: "130px" }}>
                      <input type="date" value={row.expiresAt} onChange={e => setCell(row._id, "expiresAt", e.target.value)}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)", boxSizing: "border-box" }} />
                    </td>
                    {/* Notes */}
                    <td style={{ padding: "4px 8px", minWidth: "130px" }}>
                      <input value={row.notes} onChange={e => setCell(row._id, "notes", e.target.value)}
                        style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)", boxSizing: "border-box" }} />
                    </td>
                    {/* Delete */}
                    <td style={{ padding: "4px 8px", width: "36px" }}>
                      <button onClick={() => removeRow(row._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: "4px", display: "flex", borderRadius: "4px" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--secondary)")}>
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={addRow}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px dashed var(--border)", backgroundColor: "transparent", color: "var(--secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            <Plus size={14} /> Add Row
          </button>
          <div style={{ flex: 1 }} />
          {invalidCount > 0 && (
            <span style={{ fontSize: "12px", color: "var(--warning)", display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={13} /> {invalidCount} row{invalidCount !== 1 ? "s" : ""} with missing names will be skipped
            </span>
          )}
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            Cancel
          </button>
          <div style={{ position: "relative" }}>
            <ImportButton importing={importing} validCount={validCount} onImport={onImport} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ImportButton: React.FC<{ importing: boolean; validCount: number; onImport: (mode: "append" | "replace") => void }> = ({ importing, validCount, onImport }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "flex", position: "relative" }}>
      <button onClick={() => { if (!importing && validCount > 0) onImport("append"); }}
        disabled={importing || validCount === 0}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "9px 0 0 9px", border: "none", backgroundColor: !validCount || importing ? "var(--secondary)" : "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: !validCount || importing ? "not-allowed" : "pointer" }}>
        <Save size={14} /> {importing ? "Importing…" : `Import ${validCount} Item${validCount !== 1 ? "s" : ""}`}
      </button>
      <button onClick={() => setOpen(o => !o)} disabled={importing || validCount === 0}
        style={{ padding: "9px 10px", borderRadius: "0 9px 9px 0", border: "none", borderLeft: "1px solid rgba(255,255,255,0.25)", backgroundColor: !validCount || importing ? "var(--secondary)" : "var(--primary)", color: "#fff", cursor: !validCount || importing ? "not-allowed" : "pointer" }}>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div style={{ position: "absolute", bottom: "calc(100% + 4px)", right: 0, backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "9px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: "220px", zIndex: 10 }}>
          <button onClick={() => { setOpen(false); onImport("append"); }}
            style={{ display: "block", width: "100%", padding: "11px 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>
            ➕ Append to existing inventory
          </button>
          <button onClick={() => { setOpen(false); if (window.confirm("This will DELETE all existing inventory and replace with these rows. Continue?")) onImport("replace"); }}
            style={{ display: "block", width: "100%", padding: "11px 16px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--danger)", borderTop: "1px solid var(--border)" }}>
            🔄 Replace all existing inventory
          </button>
        </div>
      )}
    </div>
  );
};

// ── Inventory list ─────────────────────────────────────────────────────────────
const InventoryList: React.FC<{
  items: InventoryItem[];
  onDelete: (id: string) => void;
  onEdit: (item: InventoryItem) => void;
}> = ({ items, onDelete, onEdit }) => {
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search,    setSearch]    = useState("");

  const filtered = items.filter(it =>
    (filterCat === "all" || it.category === filterCat) &&
    (!search || it.name.toLowerCase().includes(search.toLowerCase()) || it.location?.toLowerCase().includes(search.toLowerCase()))
  );

  if (items.length === 0) return null;

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items or location…"
          style={{ flex: 1, minWidth: "180px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)" }} />
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          <button onClick={() => setFilterCat("all")}
            style={{ padding: "6px 12px", borderRadius: "7px", border: `1px solid ${filterCat === "all" ? "var(--primary)" : "var(--border)"}`, backgroundColor: filterCat === "all" ? "var(--primary)" : "transparent", color: filterCat === "all" ? "#fff" : "var(--secondary)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setFilterCat(c.value)}
              style={{ padding: "6px 12px", borderRadius: "7px", border: `1px solid ${filterCat === c.value ? c.color : "var(--border)"}`, backgroundColor: filterCat === c.value ? c.color : "transparent", color: filterCat === c.value ? "#fff" : "var(--secondary)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "700px" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg)", borderBottom: "2px solid var(--border)" }}>
              {["Item Name", "Category", "Quantity", "Location", "Expires", "Notes", ""].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "var(--secondary)", fontSize: "13px" }}>No items match your filter.</td></tr>
            ) : filtered.map(item => {
              const cat = getCatDisplay(item.category);
              const exp = expiryStatus(item.expiresAt);
              const expColors = { ok: "var(--success)", soon: "var(--warning)", expired: "var(--danger)", none: "var(--secondary)" };
              const { Icon } = cat;
              return (
                <tr key={item._id} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: `${cat.color}18`, color: cat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={13} />
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--text-h)" }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "5px", backgroundColor: `${cat.color}18`, color: cat.color, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                      {cat.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--text-h)" }}>
                    {item.quantity.toLocaleString()} <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--secondary)" }}>{item.unit}</span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--secondary)", fontSize: "12px" }}>{item.location || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    {item.expiresAt ? (
                      <span style={{ fontSize: "12px", fontWeight: 600, color: expColors[exp] }}>
                        {exp === "expired" ? "⚠ Expired" : exp === "soon" ? "⚠ " : ""}
                        {new Date(item.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    ) : <span style={{ color: "var(--secondary)", fontSize: "12px" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--secondary)", fontSize: "12px" }}>{item.notes || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => onEdit(item)} title="Edit"
                        style={{ padding: "5px", borderRadius: "5px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--secondary)", cursor: "pointer", display: "flex" }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => { if (window.confirm(`Delete "${item.name}"?`)) onDelete(item._id); }} title="Delete"
                        style={{ padding: "5px", borderRadius: "5px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--secondary)", cursor: "pointer", display: "flex" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--secondary)")}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--secondary)" }}>Showing {filtered.length} of {items.length} items</p>
    </div>
  );
};

// ── Edit single item modal ────────────────────────────────────────────────────
const EditItemModal: React.FC<{
  item: InventoryItem;
  onSave: (updated: Partial<InventoryItem>) => Promise<void>;
  onClose: () => void;
}> = ({ item, onSave, onClose }) => {
  const [form, setForm] = useState({ ...item, expiresAt: item.expiresAt ? item.expiresAt.split("T")[0] : "" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Edit2 size={18} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>Edit Item</h3>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", display: "flex" }}><X size={16} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "Item Name *", key: "name", type: "text" },
            { label: "Quantity", key: "quantity", type: "number" },
            { label: "Unit", key: "unit", type: "text" },
            { label: "Location", key: "location", type: "text" },
            { label: "Expiry Date", key: "expiresAt", type: "date" },
            { label: "Notes", key: "notes", type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>{f.label}</label>
              <input type={f.type} value={(form as Record<string, unknown>)[f.key] as string ?? ""} onChange={e => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", boxSizing: "border-box", backgroundColor: "var(--bg)", color: "var(--text-h)" }} />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "4px" }}>Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", backgroundColor: "var(--bg)", color: "var(--text-h)" }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          <button onClick={async () => { setSaving(true); await onSave(form); setSaving(false); onClose(); }}
            disabled={!form.name?.trim() || saving}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: !form.name?.trim() || saving ? "var(--secondary)" : "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: !form.name?.trim() || saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const InventoryManagement: React.FC = () => {
  const { user } = useAuth();
  const ngoId    = user?.id ?? "demo-ngo-001";

  const [items,     setItems]     = useState<InventoryItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [parsing,   setParsing]   = useState(false);
  const [importing, setImporting] = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  // Preview modal state
  const [previewRows, setPreviewRows] = useState<EditableRow[]>([]);
  const [previewMeta, setPreviewMeta] = useState<{ total: number; valid: number; invalid: number; sheetName: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Edit modal state
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await inventoryApi.getAll(ngoId);
      setItems(data);
    } catch { setError("Failed to load inventory."); }
    finally { setLoading(false); }
  }, [ngoId]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const flash = (msg: string, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(""); setSuccess(""); }, 4000);
  };

  // ── Upload handler ───────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setParsing(true); setError("");
    try {
      const result = await inventoryApi.parseExcel(file);
      const rows: EditableRow[] = result.data.map((r, i) => ({ ...r, _id: `row-${i}-${Date.now()}` }));
      setPreviewRows(rows);
      setPreviewMeta(result.meta);
      setShowPreview(true);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to parse file.";
      flash(msg, true);
    } finally {
      setParsing(false);
    }
  };

  // ── Import handler (after preview) ──────────────────────────────────────────
  const handleImport = async (mode: "append" | "replace") => {
    const validRows = previewRows.filter(r => r._valid);
    if (!validRows.length) return;
    setImporting(true);
    try {
      const result = await inventoryApi.bulkImport(
        ngoId,
        validRows.map(({ name, category, quantity, unit, location, expiresAt, notes }) =>
          ({ name, category, quantity, unit, location, expiresAt, notes })
        ),
        mode
      );
      setShowPreview(false);
      await fetchInventory();
      flash(result.message);
    } catch {
      flash("Import failed. Please try again.", true);
    } finally {
      setImporting(false);
    }
  };

  // ── Delete single item ───────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await inventoryApi.deleteItem(id);
      setItems(prev => prev.filter(i => i._id !== id));
      flash("Item deleted.");
    } catch { flash("Delete failed.", true); }
  };

  // ── Edit single item ─────────────────────────────────────────────────────────
  const handleSaveEdit = async (updated: Partial<InventoryItem>) => {
    if (!editItem) return;
    const saved = await inventoryApi.updateItem(editItem._id, updated);
    setItems(prev => prev.map(i => i._id === editItem._id ? saved : i));
    flash("Item updated.");
  };

  // ── KPIs ──────────────────────────────────────────────────────────────────────
  const totalItems    = items.length;
  const expiringCount = items.filter(i => expiryStatus(i.expiresAt) === "soon").length;
  const expiredCount  = items.filter(i => expiryStatus(i.expiresAt) === "expired").length;
  const categoryCount = new Set(items.map(i => i.category)).size;

  return (
    <PageContainer>
      <PageHeader
        title="Inventory Management"
        description="Upload an Excel sheet to bulk-update your stockpile. Review and edit before saving."
        breadcrumbs={[{ label: "NGO Dashboard", path: "/ngo/dashboard" }, { label: "Inventory" }]}
        actions={undefined}
      />

      {/* Flash messages */}
      {(error || success) && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", backgroundColor: error ? "rgba(239,68,68,0.08)" : "rgba(5,150,105,0.08)", border: `1px solid ${error ? "var(--danger)" : "var(--success)"}`, color: error ? "var(--danger)" : "var(--success)", fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
          {error ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {error || success}
        </div>
      )}

      {/* KPI strip */}
      {!loading && items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total Items",     value: totalItems,    color: "var(--primary)", bg: "rgba(2,132,199,0.1)"   },
            { label: "Categories",      value: categoryCount, color: "#7c3aed",        bg: "rgba(124,58,237,0.1)"  },
            { label: "Expiring Soon",   value: expiringCount, color: "var(--warning)", bg: "rgba(245,158,11,0.1)"  },
            { label: "Expired",         value: expiredCount,  color: "var(--danger)",  bg: "rgba(239,68,68,0.1)"   },
          ].map(k => (
            <div key={k.label} style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", padding: "14px 16px" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase", marginTop: "3px" }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Compact upload row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", flexWrap: "wrap" }}>
        <Upload size={14} color="var(--primary)" />
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>Bulk import via spreadsheet</span>
        <UploadButton onFile={handleFile} loading={parsing} />
        <span style={{ fontSize: "12px", color: "var(--secondary)" }}>or</span>
        <button onClick={() => inventoryApi.downloadTemplate()}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 14px", borderRadius: "9px", border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--primary)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
          <Download size={13} /> Download Template
        </button>
        <span style={{ fontSize: "11px", color: "var(--secondary)", marginLeft: "auto" }}>.xlsx · .xls · .csv · max 5 MB</span>
      </div>

      {/* Current inventory */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <Package size={15} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-h)" }}>Current Inventory</h3>
          <button onClick={fetchInventory} disabled={loading} style={{ marginLeft: "4px", background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", display: "flex", padding: "2px" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--secondary)" }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1,2,3].map(i => <div key={i} style={{ height: "44px", backgroundColor: "var(--border)", borderRadius: "8px", opacity: 0.5 }} />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Package size={32} />}
            title="Inventory is empty"
            description="Upload an Excel sheet above to add your NGO's stockpile. Use the template for the correct column format." />
        ) : (
          <InventoryList items={items} onDelete={handleDelete} onEdit={setEditItem} />
        )}
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PreviewTable
          rows={previewRows}
          onChange={setPreviewRows}
          onClose={() => setShowPreview(false)}
          onImport={handleImport}
          importing={importing}
          meta={previewMeta}
        />
      )}

      {/* Edit modal */}
      {editItem && (
        <EditItemModal item={editItem} onSave={handleSaveEdit} onClose={() => setEditItem(null)} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default InventoryManagement;
