import type { Request, Response, NextFunction } from "express";
import * as XLSX from "xlsx";
import { InventoryItem, type InventoryCategory } from "./inventory.model.js";
import { AppError } from "../../utils/AppError.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";
import { buildSearchFilter } from "../../utils/search.js";
import type { AddInventoryItemInput, UpdateInventoryItemInput, BulkImportInput } from "./inventory.validation.js";

const SEARCH_FIELDS = ["name", "category", "location", "notes"];

// ── Allowed categories (normalisation map) ────────────────────────────────────
const CATEGORY_ALIASES: Record<string, InventoryCategory> = {
  food:             "food",
  foods:            "food",
  "food items":     "food",
  water:            "water",
  "drinking water": "water",
  medicine:         "medicine",
  medicines:        "medicine",
  medical:          "medicine",
  "medical supplies": "medicine",
  clothing:         "clothing",
  clothes:          "clothing",
  apparel:          "clothing",
  rescue:           "rescue_equipment",
  "rescue equipment": "rescue_equipment",
  equipment:        "rescue_equipment",
  tools:            "rescue_equipment",
  other:            "other",
};

function normaliseCategory(raw: unknown): InventoryCategory {
  const str = String(raw ?? "").toLowerCase().trim();
  return CATEGORY_ALIASES[str] ?? "other";
}

function normaliseDate(raw: unknown): Date | undefined {
  if (!raw) return undefined;
  // Excel stores dates as serial numbers; xlsx converts them if cellDates: true
  if (raw instanceof Date) return raw;
  const parsed = new Date(String(raw));
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

// ── Excel parse ────────────────────────────────────────────────────────────────

/** POST /api/inventory/parse-excel
 *  Accepts multipart file, returns parsed rows without touching the DB.
 */
export const parseExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw AppError.badRequest("No file uploaded. Please attach an Excel (.xlsx / .xls) or CSV file.");
    }

    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,   // auto-convert Excel date serials to JS Date objects
      raw: false,        // parse cell values as formatted strings
    });

    const firstSheetName = workbook.SheetNames[0];
    const sheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
    if (!sheet || !firstSheetName) {
      throw AppError.badRequest("The uploaded file has no sheets.");
    }

    // Convert to array-of-objects, first row is header
    const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    if (raw.length === 0) {
      throw AppError.badRequest("The sheet is empty or has no data rows.");
    }

    // Normalise: find columns case-insensitively
    const rows = raw.map((r, i) => {
      const get = (keys: string[]): string => {
        for (const k of keys) {
          const found = Object.keys(r).find(rk => rk.toLowerCase().trim() === k.toLowerCase());
          if (found && String(r[found]).trim()) return String(r[found]).trim();
        }
        return "";
      };

      return {
        _rowIndex: i + 2,   // Excel row number (1-based header + 1)
        name:      get(["item name", "name", "item", "product", "resource"]),
        category:  normaliseCategory(get(["category", "type", "cat"])),
        quantity:  Math.max(0, Number(get(["quantity", "qty", "amount", "stock"])) || 0),
        unit:      get(["unit", "uom", "unit of measure"]) || "pcs",
        location:  get(["location", "warehouse", "storage", "store", "hub"]),
        expiresAt: (() => {
          const raw = get(["expiry date", "expiry", "expires at", "best before", "expires", "exp date"]);
          return normaliseDate(raw)?.toISOString().split("T")[0] ?? "";
        })(),
        notes:     get(["notes", "remarks", "comment", "comments"]),
        _valid:    !!get(["item name", "name", "item", "product", "resource"]),
        _error:    !get(["item name", "name", "item", "product", "resource"]) ? "Missing item name" : "",
      };
    });

    const valid   = rows.filter(r => r._valid).length;
    const invalid = rows.filter(r => !r._valid).length;

    res.json({
      success: true,
      message: `Parsed ${rows.length} rows — ${valid} valid, ${invalid} skipped (missing name).`,
      data: rows,
      meta: { total: rows.length, valid, invalid, sheetName: firstSheetName },
    });
  } catch (error) {
    next(error);
  }
};

// ── Bulk import (after user verifies preview) ─────────────────────────────────

/** POST /api/inventory/bulk-import
 *  Body: { ngoId: string; items: ParsedRow[]; mode: "append" | "replace" }
 *  mode "replace" clears all existing items for this NGO first.
 */
export const bulkImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(bulkImportSchema) in inventory.routes.ts
    const { ngoId, items, mode } = req.body as BulkImportInput;

    if (mode === "replace") {
      await InventoryItem.deleteMany({ ngoId });
    }

    const docs = items
      .filter(it => it.name?.trim())
      .map(it => ({
        ngoId,
        name:      it.name.trim(),
        category:  normaliseCategory(it.category) as InventoryCategory,
        quantity:  Math.max(0, Number(it.quantity) || 0),
        unit:      (it.unit?.trim() || "pcs"),
        ...(it.location  && { location:  it.location.trim()  }),
        ...(it.expiresAt && { expiresAt: new Date(it.expiresAt) }),
        ...(it.notes     && { notes:     it.notes.trim()     }),
      }));

    const inserted = await InventoryItem.insertMany(docs);

    res.status(201).json({
      success: true,
      message: `${inserted.length} item${inserted.length !== 1 ? "s" : ""} imported successfully.`,
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};

// ── Download template ─────────────────────────────────────────────────────────

/** GET /api/inventory/template
 *  Returns a sample .xlsx file the NGO can fill in.
 */
export const downloadTemplate = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sample = [
      { "Item Name": "Rice Bags", Category: "food", Quantity: 500, Unit: "kg", Location: "Warehouse A", "Expiry Date": "2025-12-31", Notes: "" },
      { "Item Name": "Drinking Water Cans (20L)", Category: "water", Quantity: 200, Unit: "cans", Location: "Storage Block B", "Expiry Date": "2025-06-30", Notes: "Keep refrigerated" },
      { "Item Name": "Paracetamol Strips", Category: "medicine", Quantity: 1000, Unit: "strips", Location: "Medical Store", "Expiry Date": "2026-03-01", Notes: "" },
      { "Item Name": "Cotton Blankets", Category: "clothing", Quantity: 300, Unit: "pcs", Location: "Warehouse A", "Expiry Date": "", Notes: "" },
      { "Item Name": "Life Jackets", Category: "rescue_equipment", Quantity: 50, Unit: "pcs", Location: "Equipment Bay", "Expiry Date": "", Notes: "Inspect before use" },
    ];

    const ws = XLSX.utils.json_to_sheet(sample);

    // Column widths
    ws["!cols"] = [
      { wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", 'attachment; filename="inventory_template.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

/** GET /api/inventory?ngoId=xxx — supports ?category=, ?search=,
 *  ?page=, ?limit=, ?skip= (all optional, backward-compatible). */
export const getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ngoId = String(req.query["ngoId"] ?? "");
    const filter: Record<string, unknown> = {};
    if (ngoId) filter["ngoId"] = ngoId;

    const category = req.query["category"];
    if (category) filter["category"] = category;

    Object.assign(filter, buildSearchFilter(req.query["search"], SEARCH_FIELDS));

    const pagination = getPagination(req.query);

    const buildSummary = (items: { category: string }[]) => ({
      total: items.length,
      byCategory: items.reduce<Record<string, number>>((acc, it) => {
        acc[it.category] = (acc[it.category] ?? 0) + 1;
        return acc;
      }, {}),
    });

    if (!pagination.applied) {
      const items = await InventoryItem.find(filter).sort({ category: 1, name: 1 });
      res.json({ success: true, data: items, summary: buildSummary(items), ...buildPaginationMeta(items.length, pagination) });
      return;
    }

    const [items, total] = await Promise.all([
      InventoryItem.find(filter).sort({ category: 1, name: 1 }).skip(pagination.skip).limit(pagination.limit),
      InventoryItem.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, summary: buildSummary(items), ...buildPaginationMeta(total, pagination) });
  } catch (error) {
    next(error);
  }
};

/** POST /api/inventory (add single item) */
export const addItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(addInventoryItemSchema) in inventory.routes.ts
    const body = req.body as AddInventoryItemInput;
    // Built explicitly (rather than `{ ...body, ... }`) because exactOptionalPropertyTypes
    // rejects an optional field present-with-value-undefined — omitting the key entirely
    // is required, matching the codebase's existing `...(x && { x })` convention elsewhere.
    const item = await InventoryItem.create({
      ngoId:    body.ngoId,
      name:     body.name,
      category: normaliseCategory(body.category),
      quantity: body.quantity,
      unit:     body.unit,
      ...(body.location  !== undefined && { location:  body.location  }),
      ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt }),
      ...(body.notes     !== undefined && { notes:     body.notes     }),
    });
    res.status(201).json({ success: true, message: "Item added", data: item });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/inventory/:id */
export const updateItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(updateInventoryItemSchema) in inventory.routes.ts
    const body = req.body as UpdateInventoryItemInput;
    const updated = await InventoryItem.findByIdAndUpdate(
      req.params["id"],
      { ...body, ...(body.category && { category: normaliseCategory(body.category) }) },
      { new: true, runValidators: true }
    );
    if (!updated) throw AppError.notFound("Item not found");
    res.json({ success: true, message: "Item updated", data: updated });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/inventory/:id */
export const deleteItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await InventoryItem.findByIdAndDelete(req.params["id"]);
    if (!deleted) throw AppError.notFound("Item not found");
    res.json({ success: true, message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/inventory?ngoId=xxx — clear all items for an NGO */
export const clearInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ngoId = String(req.query["ngoId"] ?? "");
    if (!ngoId) throw AppError.badRequest("ngoId required");
    const result = await InventoryItem.deleteMany({ ngoId });
    res.json({ success: true, message: `Cleared ${result.deletedCount} items` });
  } catch (error) {
    next(error);
  }
};
