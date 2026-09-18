import api from "./api.js";

export interface InventoryItem {
  _id:        string;
  ngoId:      string;
  name:       string;
  category:   "food" | "water" | "medicine" | "clothing" | "rescue_equipment" | "other";
  quantity:   number;
  unit:       string;
  location?:  string;
  expiresAt?: string;
  notes?:     string;
  createdAt:  string;
  updatedAt:  string;
}

export interface ParsedRow {
  _rowIndex: number;
  name:      string;
  category:  string;
  quantity:  number;
  unit:      string;
  location:  string;
  expiresAt: string;
  notes:     string;
  _valid:    boolean;
  _error:    string;
}

function extract<T>(res: { data: { data: T } }): T { return res.data.data; }

export const inventoryApi = {
  /** Fetch items (all items globally if ngoId omitted) */
  getAll: (ngoId?: string) =>
    api.get<{ data: InventoryItem[]; summary: { total: number; byCategory: Record<string, number> } }>(
      ngoId ? `/inventory?ngoId=${ngoId}` : "/inventory"
    ).then(r => r.data),

  /** Upload Excel → returns parsed rows (no DB write yet) */
  parseExcel: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ data: ParsedRow[]; meta: { total: number; valid: number; invalid: number; sheetName: string }; message: string }>(
      "/inventory/parse-excel",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    ).then(r => r.data);
  },

  /** Import verified rows into DB */
  bulkImport: (ngoId: string, items: Omit<ParsedRow, "_rowIndex" | "_valid" | "_error">[], mode: "append" | "replace" = "append") =>
    api.post<{ data: InventoryItem[]; message: string }>("/inventory/bulk-import", { ngoId, items, mode }).then(r => r.data),

  /** Download the Excel template file */
  downloadTemplate: () => {
    window.open("/api/inventory/template", "_blank");
  },

  /** Add single item */
  addItem: (payload: Omit<InventoryItem, "_id" | "createdAt" | "updatedAt">) =>
    api.post<{ data: InventoryItem }>("/inventory", payload).then(extract),

  /** Update single item */
  updateItem: (id: string, payload: Partial<InventoryItem>) =>
    api.put<{ data: InventoryItem }>(`/inventory/${id}`, payload).then(extract),

  /** Delete single item */
  deleteItem: (id: string) =>
    api.delete(`/inventory/${id}`),

  /** Clear all items for an NGO */
  clearAll: (ngoId: string) =>
    api.delete(`/inventory/clear?ngoId=${ngoId}`),
};
