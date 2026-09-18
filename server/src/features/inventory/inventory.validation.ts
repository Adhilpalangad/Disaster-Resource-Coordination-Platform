import { z } from "zod";

/** `category` is intentionally a loose string here, not the strict enum —
 *  inventory.controller.ts's normaliseCategory() maps free-text aliases
 *  ("food items", "medical supplies", ...) onto the real enum afterwards,
 *  and duplicating that mapping in the schema would just be two sources
 *  of truth for the same thing. */
export const addInventoryItemSchema = z.object({
  ngoId:      z.string().min(1, "ngoId is required"),
  name:       z.string().trim().min(1, "name is required"),
  category:   z.string().trim().optional(),
  // Defaults mirror InventoryItem's mongoose schema defaults (quantity: 0, unit: "pcs") so the
  // parsed type is non-optional, matching IInventoryItem, while runtime behaviour is unchanged.
  quantity:   z.coerce.number().min(0).default(0),
  unit:       z.string().trim().default("pcs"),
  location:   z.string().trim().optional(),
  expiresAt:  z.string().optional(),
  notes:      z.string().trim().optional(),
});

export const updateInventoryItemSchema = addInventoryItemSchema.omit({ ngoId: true }).partial();

export const bulkImportSchema = z.object({
  ngoId: z.string().min(1, "ngoId is required"),
  items: z.array(
    z.object({
      name:      z.string(),
      category:  z.string().optional(),
      quantity:  z.coerce.number().optional(),
      unit:      z.string().optional(),
      location:  z.string().optional(),
      expiresAt: z.string().optional(),
      notes:     z.string().optional(),
    })
  ).min(1, "items array is required and must not be empty"),
  mode: z.enum(["append", "replace"]).default("append"),
});

export type AddInventoryItemInput = z.infer<typeof addInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
