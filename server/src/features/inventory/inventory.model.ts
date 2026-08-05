import mongoose, { Schema, type Document } from "mongoose";

export type InventoryCategory =
  | "food" | "water" | "medicine" | "clothing" | "rescue_equipment" | "other";

export interface IInventoryItem extends Document {
  ngoId:       string;           // auth userId of the NGO that owns this item
  name:        string;
  category:    InventoryCategory;
  quantity:    number;
  unit:        string;           // kg, litres, pcs, boxes, …
  location?:   string;           // warehouse / storage location label
  expiresAt?:  Date;
  notes?:      string;
  createdAt:   Date;
  updatedAt:   Date;
}

const inventorySchema = new Schema<IInventoryItem>(
  {
    ngoId:      { type: String, required: true, index: true },
    name:       { type: String, required: true, trim: true },
    category:   {
      type: String,
      required: true,
      enum: ["food", "water", "medicine", "clothing", "rescue_equipment", "other"],
      default: "other",
    },
    quantity:   { type: Number, required: true, min: 0, default: 0 },
    unit:       { type: String, required: true, trim: true, default: "pcs" },
    location:   { type: String, trim: true },
    expiresAt:  { type: Date },
    notes:      { type: String, trim: true },
  },
  { timestamps: true }
);

inventorySchema.index({ ngoId: 1, name: 1 });

export const InventoryItem = mongoose.model<IInventoryItem>("InventoryItem", inventorySchema);
