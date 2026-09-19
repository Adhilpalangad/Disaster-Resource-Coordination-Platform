import type { Request, Response } from "express";
import { ReliefRequest } from "./request.model.js";
import { routingService } from "./routing.service.js";
import type { IRequestLocation } from "./request.model.js";
import { notificationService } from "../notifications/notification.service.js";
import {
  evaluateDuplicateSubmission,
  validateAndConsumeConfirmToken,
} from "./duplicate.service.js";

// ── Create ────────────────────────────────────────────────────────────────────
export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      createdBy, fullName, mobileNumber, peopleAffected,
      disasterId, disasterName,
      category, urgency, description,
      confirmToken: bodyConfirmToken,
    } = req.body;

    const confirmToken = (req.headers["x-confirm-duplicate-token"] as string) || bodyConfirmToken;

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

    // ── Duplicate Detection Check ──────────────────────────────────────────
    let isConfirmedOverride = false;
    if (confirmToken) {
      isConfirmedOverride = await validateAndConsumeConfirmToken(confirmToken, createdBy);
    }

    let duplicateOfId: string | undefined;

    if (!isConfirmedOverride) {
      const dupCheck = await evaluateDuplicateSubmission(
        {
          category,
          description,
          location,
          urgency,
          peopleAffected: parseInt(peopleAffected, 10),
        },
        createdBy,
        fullName,
        mobileNumber
      );

      if (dupCheck.isDuplicate) {
        if (dupCheck.action === "block") {
          res.status(409).json({
            success: false,
            isDuplicate: true,
            action: "block",
            message: "A similar active request was already submitted by you recently. Please check your existing request status before submitting again.",
            duplicate: dupCheck,
          });
          return;
        } else if (dupCheck.action === "warn") {
          res.status(409).json({
            success: false,
            isDuplicate: true,
            action: "warn",
            message: "A similar request was found in your active requests. If this is a distinct need, you can proceed.",
            duplicate: dupCheck,
          });
          return;
        }
      }
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

    // Notify citizen: submission confirmed
    notificationService.send({
      userId:    createdBy,
      title:     "Request Submitted Successfully",
      message:   `Your ${category} request for ${locationDoc.localBodyName}, ${locationDoc.districtName} has been submitted. We are routing it to the nearest NGO — you'll receive updates at each stage.`,
      type:      "info",
      category:  "request",
      requestId: newRequest._id.toString(),
      link:      `/requests/${newRequest._id}`,
    }).catch(console.error);

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
    const { status, urgency, category, districtId, assignedNGO, assignedVolunteer } = req.query;
    const filter: Record<string, unknown> = {};

    // ── Role-based scoping (server-enforced, client cannot bypass) ────────────
    if (req.user?.role === "citizen") {
      // Citizens always see only their own requests — ignore any client-supplied createdBy
      filter.createdBy = (req.user._id as { toString(): string }).toString();
    } else if (req.user?.role === "volunteer") {
      // Volunteers see only requests assigned to them
      if (assignedVolunteer) filter.assignedVolunteer = assignedVolunteer;
    } else {
      // NGO / admin / unauthenticated: honour all query filters
      const { createdBy } = req.query;
      if (createdBy)         filter.createdBy          = createdBy;
      if (assignedNGO)       filter.assignedNGO         = assignedNGO;
      if (assignedVolunteer) filter.assignedVolunteer   = assignedVolunteer;
    }

    if (status)     filter.status                  = status;
    if (urgency)    filter.urgency                 = urgency;
    if (category)   filter.category                = category;
    if (districtId) filter["location.districtId"]  = districtId;

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
    // Stamp respondedAt on the last routingHistory entry using arrayFilters
    const request = await ReliefRequest.findById(req.params.id).lean();
    const lastEntry = request?.routingHistory?.at(-1);

    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      {
        status:        "ngo_accepted",
        ngoAcceptedAt: new Date(),
        ...(lastEntry && {
          $set: {
            [`routingHistory.${(request!.routingHistory!.length - 1)}.respondedAt`]: new Date(),
            [`routingHistory.${(request!.routingHistory!.length - 1)}.response`]:    "accepted",
          },
        }),
      },
      { new: true }
    );
    if (!updated) { res.status(404).json({ success: false, message: "Request not found" }); return; }

    // Automatically consolidate & remove duplicate sibling requests from the NGO queue
    const duplicateFilter: Record<string, any> = {
      _id: { $ne: updated._id },
      category: updated.category,
      status: { $nin: ["completed", "delivered", "rejected", "closed", "duplicate_detected"] },
      $or: [
        { createdBy: updated.createdBy },
        ...(updated.mobileNumber ? [{ mobileNumber: updated.mobileNumber }] : []),
        ...(updated.fullName ? [{ fullName: new RegExp(`^${updated.fullName.trim()}$`, "i") }] : []),
      ],
    };

    await ReliefRequest.updateMany(duplicateFilter, {
      $set: {
        status: "duplicate_detected",
        duplicateOf: updated._id.toString(),
      },
    });

    notificationService.send({
      userId:    updated.createdBy,
      title:     "Your Request Has Been Accepted",
      message:   `Good news! ${updated.assignedNGOName ?? "An NGO"} has accepted your ${updated.category} request and is now processing it. They will verify the details and arrange resources shortly.`,
      type:      "success",
      category:  "request",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

    res.json({ success: true, message: "Request accepted and duplicate requests auto-consolidated", data: updated });
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

    notificationService.send({
      userId:    updated.createdBy,
      title:     "Request Verified ✓",
      message:   `Your ${updated.category} request has been verified by ${updated.assignedNGOName ?? "the NGO"}. They are now arranging resources for your location.`,
      type:      "success",
      category:  "request",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

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

    notificationService.send({
      userId:    updated.createdBy,
      title:     "Request Could Not Be Fulfilled",
      message:   `Unfortunately your ${updated.category} request was rejected${note ? `: "${note}"` : "."}. The system will automatically find another NGO in your area.`,
      type:      "warning",
      category:  "request",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

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

    notificationService.send({
      userId:    updated.createdBy,
      title:     "Resources Reserved for Your Request",
      message:   `${updated.assignedNGOName ?? "The NGO"} has reserved resources for your ${updated.category} request. A volunteer is being selected to deliver to ${updated.location?.localBodyName}, ${updated.location?.districtName}.`,
      type:      "info",
      category:  "request",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

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

    const etaText = estimatedArrival
      ? ` Expected arrival: ${new Date(estimatedArrival).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.`
      : "";

    // Notify citizen
    notificationService.send({
      userId:    updated.createdBy,
      title:     "A Volunteer Is Coming to You",
      message:   `${volunteerName} has been assigned to deliver your ${updated.category} request to ${updated.location?.localBodyName}.${etaText}`,
      type:      "success",
      category:  "assignment",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

    // Notify volunteer
    notificationService.send({
      userId:    volunteerId,
      title:     "New Delivery Task Assigned",
      message:   `You have a new ${updated.category} delivery task in ${updated.location?.localBodyName}, ${updated.location?.districtName} for ${updated.fullName} (${updated.peopleAffected} people).${etaText}`,
      type:      "info",
      category:  "assignment",
      requestId: updated._id.toString(),
      link:      `/volunteer/tasks`,
    }).catch(console.error);

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

    notificationService.send({
      userId:    updated.createdBy,
      title:     "Your Relief Is On the Way 🚚",
      message:   `${updated.assignedVolunteerName ?? "A volunteer"} is now heading to ${updated.location?.localBodyName}, ${updated.location?.districtName} with your ${updated.category} supplies. Please be available to receive them.`,
      type:      "info",
      category:  "request",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

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

    notificationService.send({
      userId:    updated.createdBy,
      title:     "Delivery Completed — Please Confirm",
      message:   `${updated.assignedVolunteerName ?? "The volunteer"} has marked your ${updated.category} request as delivered. Please open your request and tap "Confirm Delivery" to close the case.`,
      type:      "success",
      category:  "request",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

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

    // Notify NGO that citizen confirmed receipt
    if (updated.assignedNGO) {
      notificationService.send({
        userId:    updated.assignedNGO,
        title:     "Delivery Confirmed by Citizen ✓",
        message:   `${updated.fullName} has confirmed receipt of the ${updated.category} delivery in ${updated.location?.localBodyName}.${feedback ? ` Feedback: "${feedback}"` : ""} The case is now closed.`,
        type:      "success",
        category:  "request",
        requestId: updated._id.toString(),
        link:      `/ngo/requests`,
      }).catch(console.error);
    }

    // Also notify citizen that case is closed
    notificationService.send({
      userId:    updated.createdBy,
      title:     "Request Completed — Thank You",
      message:   `Your ${updated.category} request is now closed. Thank you for confirming delivery. Stay safe.`,
      type:      "success",
      category:  "request",
      requestId: updated._id.toString(),
      link:      `/requests/${updated._id}`,
    }).catch(console.error);

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
