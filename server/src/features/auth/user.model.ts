import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  supabaseId: string;
  name: string;
  email: string;
  role: "citizen" | "ngo" | "volunteer" | "admin";
  phone?: string;
  organizationName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    supabaseId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { 
      type: String, 
      enum: ["citizen", "ngo", "volunteer", "admin"], 
      required: true 
    },
    phone: { type: String },
    organizationName: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
