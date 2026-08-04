import { Schema, model } from "mongoose";

export interface IReliefRequest {
    disasterId?: string;
    createdBy: string;
    createdByName?: string;
    category: "food" | "water" | "medical" | "shelter" | "clothing" | "rescue" | "other";
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    location: string;
    contactNumber?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
    status: "pending_verification" | "verified" | "rejected" | "assigned" | "in_progress" | "resolved" | "closed";
    verificationNote?: string;
    assignedTo?: string;
    assignedToName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReliefRequestSchema = new Schema<IReliefRequest>(
    {
        disasterId: { type: String },
        createdBy: { type: String, required: [true, "Creator (User ID) is required"] },
        createdByName: { type: String },
        category: {
            type: String,
            enum: ["food", "water", "medical", "shelter", "clothing", "rescue", "other"],
            required: [true, "Category is required"],
        },
        description: { type: String, required: [true, "Description is required"] },
        urgency: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        location: { type: String, required: [true, "Location is required"] },
        contactNumber: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        imageUrl: { type: String },
        status: {
            type: String,
            enum: ["pending_verification", "verified", "rejected", "assigned", "in_progress", "resolved", "closed"],
            default: "pending_verification",
        },
        verificationNote: { type: String },
        assignedTo: { type: String },
        assignedToName: { type: String },
    },
    { timestamps: true }
);

// Index so citizens can quickly fetch their own requests
ReliefRequestSchema.index({ createdBy: 1, createdAt: -1 });
// Index so NGOs can filter by status efficiently
ReliefRequestSchema.index({ status: 1, createdAt: -1 });

export const ReliefRequest = model<IReliefRequest>("ReliefRequest", ReliefRequestSchema);
