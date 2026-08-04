import type { Request, Response } from "express";
import { ReliefRequest } from "./request.model.js";

export const createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            disasterId,
            createdBy,
            createdByName,
            category,
            description,
            urgency,
            location,
            contactNumber,
            latitude,
            longitude,
        } = req.body;

        if (!createdBy || !category || !description || !location) {
            res.status(400).json({
                success: false,
                message: "Missing required fields: createdBy, category, description, location",
            });
            return;
        }

        let imageUrl: string | undefined;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const payload: Parameters<typeof ReliefRequest.create>[0] = {
            createdBy,
            category,
            description,
            urgency: urgency || "medium",
            location,
            status: "pending_verification",
        };

        if (disasterId) payload.disasterId = disasterId;
        if (createdByName) payload.createdByName = createdByName;
        if (contactNumber) payload.contactNumber = contactNumber;
        if (latitude) payload.latitude = parseFloat(latitude);
        if (longitude) payload.longitude = parseFloat(longitude);
        if (imageUrl) payload.imageUrl = imageUrl;

        const newRequest = await ReliefRequest.create(payload);

        res.status(201).json({
            success: true,
            message: "Relief request submitted successfully",
            data: newRequest,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create relief request",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { createdBy, status, urgency, category } = req.query;
        const filter: Record<string, unknown> = {};

        if (createdBy) filter.createdBy = createdBy;
        if (status) filter.status = status;
        if (urgency) filter.urgency = urgency;
        if (category) filter.category = category;

        const requests = await ReliefRequest.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requests,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch relief requests",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
        const request = await ReliefRequest.findById(req.params.id);

        if (!request) {
            res.status(404).json({ success: false, message: "Relief request not found" });
            return;
        }

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch relief request",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const updateRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const updated = await ReliefRequest.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updated) {
            res.status(404).json({ success: false, message: "Relief request not found" });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Relief request updated",
            data: updated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update relief request",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const deleted = await ReliefRequest.findByIdAndDelete(req.params.id);

        if (!deleted) {
            res.status(404).json({ success: false, message: "Relief request not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Relief request deleted" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete relief request",
            error: error instanceof Error ? error.message : error,
        });
    }
};
