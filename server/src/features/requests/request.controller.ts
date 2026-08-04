import type { Request, Response } from "express";
import { ReliefRequest } from "./request.model.js";

export const createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            disasterId,
            createdBy,
            category,
            description,
            urgency,
            latitude,
            longitude,
            assignedTo,
        } = req.body;

        // Retrieve file path if uploaded
        let imageUrl = "";
        if (req.file) {
            // Store relative path so client can resolve static URL
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const requestData: any = {
            disasterId,
            createdBy: createdBy || "anonymous",
            category,
            description,
            urgency: urgency || "medium",
            verificationStatus: "unverified",
            status: "pending",
            assignedTo: assignedTo || "",
        };

        if (latitude) requestData.latitude = parseFloat(latitude);
        if (longitude) requestData.longitude = parseFloat(longitude);
        if (imageUrl) requestData.imageUrl = imageUrl;

        const newRequest = await ReliefRequest.create(requestData);

        res.status(201).json({
            success: true,
            message: "Relief request created successfully",
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
        const { disasterId, status, urgency } = req.query;
        const filter: any = {};

        if (disasterId) filter.disasterId = disasterId;
        if (status) filter.status = status;
        if (urgency) filter.urgency = urgency;

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
        const { id } = req.params;
        const request = await ReliefRequest.findById(id);

        if (!request) {
            res.status(404).json({
                success: false,
                message: "Relief request not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: request,
        });
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
        const { id } = req.params;
        const updates = req.body;

        const updatedRequest = await ReliefRequest.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedRequest) {
            res.status(404).json({
                success: false,
                message: "Relief request not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Relief request updated successfully",
            data: updatedRequest,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update relief request",
            error: error instanceof Error ? error.message : error,
        });
    }
};
