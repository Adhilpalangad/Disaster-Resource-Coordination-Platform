import mongoose, { Schema, type Document } from "mongoose";

export type NotificationType = "info" | "success" | "warning" | "danger";
export type NotificationCategory = "request" | "assignment" | "system";

export interface INotification extends Document {
  userId:     string;   // auth user ID who receives this
  userEmail:  string;   // email used for sending
  title:      string;
  message:    string;
  type:       NotificationType;
  category:   NotificationCategory;
  requestId?: string;   // linked request
  link?:      string;   // frontend route
  isRead:     boolean;
  emailSent:  boolean;
  createdAt:  Date;
  updatedAt:  Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId:     { type: String, required: true, index: true },
    userEmail:  { type: String, required: true },
    title:      { type: String, required: true },
    message:    { type: String, required: true },
    type:       { type: String, enum: ["info", "success", "warning", "danger"], default: "info" },
    category:   { type: String, enum: ["request", "assignment", "system"], default: "request" },
    requestId:  { type: String },
    link:       { type: String },
    isRead:     { type: Boolean, default: false },
    emailSent:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Keep only last 200 notifications per user (TTL-ish cleanup handled in controller)
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
