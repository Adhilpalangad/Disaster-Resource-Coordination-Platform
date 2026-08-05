import type { Request, Response } from "express";
import { ReliefRequest } from "./request.model.js";
import { routingService } from "./routing.service.js";
import type { IRequestLocation } from "./request.model.js";

// ── Create ────────────────────────────────────────────────────────────────────
export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      createdBy, fullName, mobileNumber, peopleAffected,
      disasterId, disasterName,
      category, urgency, description,
    } = req.body;

    // Deserialise JSON-stringified fields from multipart FormData
    const location: IRequestLocation =
      typeof req.body.location === "string"
        ? JSON.parse(req.body.location)
        : (req.body.location ?? {});

    const ageGroups: string[] =
      typeof req.body.ageGroups === "string"
        ? JSON.parse(req.body.ageGroups)
        : (Array.isArray(req.body.ageGroups) ? req.body.ageGroups : []);

    const specialNeeds: string[] =
      typeof req.body.specialNeeds === "string"
        ? JSON.parse(req.body.specialNeeds)
        : (Array.isArray(req.body.specialNeeds) ? req.body.specialNeeds : []);

    // Basic validation
    if (!createdBy || !fullName || !mobileNumber || !peopleAffected) {
      res.status(400).json({ success: false, message: "Missing required personal information fields" });
      return;
    }
    if (!category || !description) {
      res.status(400).json({ success: false, message: "Missing required request detail fields" });
      return;
    }
    if (!location?.districtId || !location?.talukId || !location?.localBodyId) {
      res.status(400).json({ success: false, message: "Incomplete location: district, taluk and local body are required" });
      return;
    }

    let imageUrl: string | undefined;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    const locationDoc: IRequestLocation = {
      stateId:       location.stateId       || "KL",
      stateName:     location.stateName     || "Kerala",
      districtId:    location.districtId,
      districtName:  location.districtName  || location.districtId,
      talukId:       location.talukId,
      talukName:     location.talukName     || location.talukId,
      localBodyId:   location.localBodyId,
      localBodyName: location.localBodyName || location.localBodyId,
      localBodyType: location.localBodyType || "panchayat",
      ...(location.wardId    && { wardId:    location.wardId    }),
      ...(location.wardName  && { wardName:  location.wardName  }),
      ...(location.landmark  && { landmark:  location.landmark  }),
      ...(location.gpsLat    && { gpsLat:    Number(location.gpsLat)  }),
      ...(location.gpsLng    && { gpsLng:    Number(location.gpsLng)  }),
    };

    // Build display address string
    const parts = [
      location.wardName,
      location.localBodyName,
      location.talukName,
      location.districtName,
      "Kerala",
    ].filter(Boolean);
    locationDoc.fullAddress = parts.join(", ");

    const newRequest = await ReliefRequest.create({
      createdBy,
      fullName,
      mobileNumber,
      peopleAffected: parseInt(peopleAffected, 10),
      ageGroups:   Array.isArray(ageGroups)   ? ageGroups   : [],
      specialNeeds: Array.isArray(specialNeeds) ? specialNeeds : [],
      ...(disasterId   && { disasterId }),
      ...(disasterName && { disasterName }),
      category,
      urgency: urgency || "medium",
      description,
      ...(imageUrl && { imageUrl }),
      location: locationDoc,
      status:   "pending",
    });

    // Fire-and-forget routing — does not block the response
    routingService.routeRequest(newRequest._id.toString(), locationDoc).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Relief request submitted. The system is routing it to the nearest NGO.",
      data:    newRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create relief request",
      error:   error instanceof Error ? error.message : String(error),
    });
  }
};

// ── List (with filters) ────────────────────────────────────────────────────────
export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { createdBy, status, urgency, category, districtId, assignedNGO, assignedVolunteer } = req.query;
    const filter: Record<string, unknown> = {};

    if (createdBy)         filter.createdBy          = createdBy;
    if (status)            filter.status              = status;
    if (urgency)           filter.urgency             = urgency;
    if (category)          filter.category            = category;
    if (districtId)        filter["location.districtId"] = districtId;
    if (assignedNGO)       filter.assignedNGO         = assignedNGO;
    if (assignedVolunteer) filter.assignedVolunteer   = assignedVolunteer;

    const requests = await ReliefRequest.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch relief requests",
      error:   error instanceof Error ? error.message : String(error),
    });
  }
};

// ── Get by ID ─────────────────────────────────────────────────────────────────
export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await ReliefRequest.findById(req.params.id);
    if (!request) { res.status(404).json({ success: false, message: "Relief request not found" }); return; }
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch relief request", error: String(error) });
  }
};

// ── NGO Actions ───────────────────────────────────────────────────────────────

export const ngoAcceptRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: "ngo_accepted", ngoAcceptedAt: new Date(),
        $set: { "routingHistory.$[last].respondedAt": new Date(), "routingHistory.$[last].response": "accepted" },
      },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Request accepted", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Accept failed", error: String(error) });
  }
};

export const verifyRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: "verified", verifiedAt: new Date() },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Request verified", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verify failed", error: String(error) });
  }
};

export const rejectRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { note } = req.body;
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", verificationNote: note, verifiedAt: new Date() },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }

    // Forward to next NGO when an NGO explicitly declines
    const ngoId    = updated.assignedNGO as string | undefined;
    const reqDocId = String(req.params["id"] ?? "");
    if (ngoId && reqDocId) {
      routingService.forwardRequest(reqDocId, ngoId, "declined").catch(console.error);
    }

    res.json({ success: true, message: "Request rejected and forwarded to next NGO", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Reject failed", error: String(error) });
  }
};

export const reserveResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: "resources_reserved", resourcesReservedAt: new Date() },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Resources reserved", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Resource reservation failed", error: String(error) });
  }
};

export const assignVolunteer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { volunteerId, volunteerName, estimatedArrival } = req.body;
    const update: Record<string, unknown> = {
      status:               "volunteer_assigned",
      assignedVolunteer:    volunteerId,
      assignedVolunteerName: volunteerName,
      volunteerAssignedAt:  new Date(),
    };
    if (estimatedArrival) update.estimatedArrival = new Date(estimatedArrival);

    const updated = await ReliefRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Volunteer assigned", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Volunteer assignment failed", error: String(error) });
  }
};

// ── Volunteer Actions ─────────────────────────────────────────────────────────

export const markInTransit = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: "in_transit", inTransitAt: new Date() },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Marked in transit", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: String(error) });
  }
};

export const markDelivered = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: "delivered", deliveredAt: new Date() },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Marked as delivered", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: String(error) });
  }
};

// ── Citizen Confirmation ──────────────────────────────────────────────────────

export const confirmDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedback } = req.body;
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      {
        status:              "completed",
        citizenConfirmedAt:  new Date(),
        completedAt:         new Date(),
        ...(feedback && { citizenFeedback: feedback }),
      },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }

    // Reduce NGO workload
    if (updated.assignedNGO) {
      const { NGOProfile } = await import("../ngos/ngo.model.js");
      await NGOProfile.findOneAndUpdate(
        { $or: [{ _id: updated.assignedNGO }, { userId: updated.assignedNGO }] },
        { $inc: { currentWorkload: -1 } }
      );
    }

    res.json({ success: true, message: "Delivery confirmed — request completed", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Confirmation failed", error: String(error) });
  }
};

// ── Generic update & delete ────────────────────────────────────────────────────
export const updateRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Request updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: String(error) });
  }
};

export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await ReliefRequest.findByIdAndDelete(req.params.id);
    if (!deleted) { res.status(404).json({ success: false, message: "Request not found" }); return; }
    res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed", error: String(error) });
  }
};
