import { Schema, model } from "mongoose";

export interface IReliefRequest {
    disasterId: string;
    createdBy: string;
    category: string;
    description: string;
    urgency: "low" | "medium" | "high";
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
    verificationStatus: "unverified" | "verified" | "flagged";
    status: "pending" | "assigned" | "resolved";
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReliefRequestSchema = new Schema<IReliefRequest>(
    {
        disasterId: {
            type: String,
            required: [true, "Disaster ID is required"],
        },
        createdBy: {
            type: String,
            required: [true, "Creator (User ID) is required"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        urgency: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        imageUrl: {
            type: String,
        },
        verificationStatus: {
            type: String,
            enum: ["unverified", "verified", "flagged"],
            default: "unverified",
        },
        status: {
            type: String,
            enum: ["pending", "assigned", "resolved"],
            default: "pending",
        },
        assignedTo: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export const ReliefRequest = model<IReliefRequest>("ReliefRequest", ReliefRequestSchema);
