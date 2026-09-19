import type { Request, Response } from "express";
import { DuplicateAttemptLog } from "./duplicate.model.js";
import { ReliefRequest, type IRequestLocation } from "./request.model.js";
import { routingService } from "./routing.service.js";

// ── Admin: List all duplicate attempt logs ──────────────────────────────────────
export const getDuplicateLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, citizenId, page = "1", limit = "20" } = req.query;
    const filter: Record<string, unknown> = {};

    if (action) filter.action = action;
    if (citizenId) filter.citizenId = citizenId;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      DuplicateAttemptLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DuplicateAttemptLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch duplicate attempt logs",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// ── Admin: Override & Submit Blocked Duplicate Request ────────────────────────
export const overrideDuplicateAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { logId } = req.params;
    const { reason } = req.body;
    const adminId = (req.user as any)?._id?.toString() || "admin";

    const log = await DuplicateAttemptLog.findById(logId);
    if (!log) {
      res.status(404).json({ success: false, message: "Duplicate attempt log not found" });
      return;
    }

    if (log.action === "overridden_by_admin") {
      res.status(400).json({ success: false, message: "This duplicate attempt has already been overridden" });
      return;
    }

    // Create the relief request from the saved attemptedPayload
    const payload = log.attemptedPayload;
    const locationDoc: IRequestLocation = {
      stateId: payload.location.stateId || "KL",
      stateName: payload.location.stateName || "Kerala",
      districtId: payload.location.districtId || "",
      districtName: payload.location.districtName || "",
      talukId: payload.location.talukId || "",
      talukName: payload.location.talukName || "",
      localBodyId: payload.location.localBodyId || "",
      localBodyName: payload.location.localBodyName || "",
      localBodyType: payload.location.localBodyType || "panchayat",
      wardId: payload.location.wardId,
      wardName: payload.location.wardName,
      landmark: payload.location.landmark,
      gpsLat: payload.location.gpsLat,
      gpsLng: payload.location.gpsLng,
      fullAddress: payload.location.fullAddress,
    };

    const parts = [
      locationDoc.wardName,
      locationDoc.localBodyName,
      locationDoc.talukName,
      locationDoc.districtName,
      "Kerala",
    ].filter(Boolean);
    locationDoc.fullAddress = parts.join(", ");

    const newRequest = await ReliefRequest.create({
      createdBy: log.citizenId,
      fullName: log.citizenName,
      mobileNumber: log.citizenMobile,
      peopleAffected: payload.peopleAffected || 1,
      category: payload.category as any,
      urgency: (payload.urgency as any) || "medium",
      description: `[ADMIN OVERRIDE: ${reason || "Verified distinct need"}] ${payload.description}`,
      location: locationDoc,
      status: "pending",
      duplicateOf: log.existingRequestId,
    });

    // Trigger routing
    routingService.routeRequest(newRequest._id.toString(), locationDoc).catch(console.error);

    // Update log
    log.action = "overridden_by_admin";
    log.overriddenBy = adminId;
    log.overriddenAt = new Date();
    log.overrideReason = reason || "Approved by Administrator";
    await log.save();

    res.json({
      success: true,
      message: "Duplicate request successfully overridden and created.",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to override duplicate attempt",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// ── Get Duplicate Logs for Specific Request ────────────────────────────────────
export const getDuplicateLogsForRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const logs = await DuplicateAttemptLog.find({ existingRequestId: requestId } as any)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch request duplicate logs",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
