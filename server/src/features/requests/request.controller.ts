import type { Request, Response, NextFunction } from "express";
import { ReliefRequest } from "./request.model.js";
import { routingService } from "./routing.service.js";
import type { IRequestLocation } from "./request.model.js";
import { notificationService } from "../notifications/notification.service.js";
import {
  evaluateDuplicateSubmission,
  validateAndConsumeConfirmToken,
} from "./duplicate.service.js";
import { AppError } from "../../utils/AppError.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";
import { buildSearchFilter } from "../../utils/search.js";
import { parseOrThrow } from "../../utils/validate.js";
import { createRequestSchema } from "./request.validation.js";
import type {
  UpdateRequestInput, RejectRequestInput, AssignVolunteerInput, ConfirmDeliveryInput,
} from "./request.validation.js";

const SEARCH_FIELDS = [
  "fullName", "description", "mobileNumber",
  "location.fullAddress", "location.districtName", "location.localBodyName",
];

// ── Create ────────────────────────────────────────────────────────────────────
export const createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      createdBy, fullName, mobileNumber, peopleAffected,
      disasterId, disasterName,
      category, urgency, description,
      confirmToken: bodyConfirmToken,
    } = req.body;

    const confirmToken = (req.headers["x-confirm-duplicate-token"] as string) || bodyConfirmToken;

    // Deserialise JSON-stringified fields from multipart FormData
    // Deserialise JSON-stringified fields from multipart FormData before validating —
    // they arrive as plain strings at this point, not the objects/arrays Zod expects.
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

    const parsed = parseOrThrow(createRequestSchema, {
      ...req.body,
      ageGroups,
      specialNeeds,
      location,
    });

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
    if (req.file) {
      imageUrl = req.file.filename.startsWith("http")
        ? req.file.filename
        : `/uploads/${req.file.filename}`;
    }

    const locationDoc: IRequestLocation = {
      stateId:       parsed.location.stateId       || "KL",
      stateName:     parsed.location.stateName     || "Kerala",
      districtId:    parsed.location.districtId,
      districtName:  parsed.location.districtName  || parsed.location.districtId,
      talukId:       parsed.location.talukId,
      talukName:     parsed.location.talukName     || parsed.location.talukId,
      localBodyId:   parsed.location.localBodyId,
      localBodyName: parsed.location.localBodyName || parsed.location.localBodyId,
      localBodyType: parsed.location.localBodyType || "panchayat",
      ...(parsed.location.wardId    && { wardId:    parsed.location.wardId    }),
      ...(parsed.location.wardName  && { wardName:  parsed.location.wardName  }),
      ...(parsed.location.landmark  && { landmark:  parsed.location.landmark  }),
      ...(parsed.location.gpsLat    !== undefined && { gpsLat: parsed.location.gpsLat }),
      ...(parsed.location.gpsLng    !== undefined && { gpsLng: parsed.location.gpsLng }),
    };

    // Build display address string
    const parts = [
      parsed.location.wardName,
      parsed.location.localBodyName,
      parsed.location.talukName,
      parsed.location.districtName,
      "Kerala",
    ].filter(Boolean);
    locationDoc.fullAddress = parts.join(", ");

    const newRequest = await ReliefRequest.create({
      createdBy:      parsed.createdBy,
      fullName:       parsed.fullName,
      mobileNumber:   parsed.mobileNumber,
      peopleAffected: parsed.peopleAffected,
      ageGroups:      parsed.ageGroups,
      specialNeeds:   parsed.specialNeeds,
      ...(parsed.disasterId   && { disasterId: parsed.disasterId }),
      ...(parsed.disasterName && { disasterName: parsed.disasterName }),
      category:    parsed.category,
      urgency:     parsed.urgency,
      description: parsed.description,
      ...(imageUrl && { imageUrl }),
      location: locationDoc,
      status:   "pending",
    });

    // Fire-and-forget routing — does not block the response
    routingService.routeRequest(newRequest._id.toString(), locationDoc).catch(console.error);

    // Notify citizen: submission confirmed
    notificationService.send({
      userId:    parsed.createdBy,
      title:     "Request Submitted Successfully",
      message:   `Your ${parsed.category} request for ${locationDoc.localBodyName}, ${locationDoc.districtName} has been submitted. We are routing it to the nearest NGO — you'll receive updates at each stage.`,
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
    next(error);
  }
};

// ── List (with filters, search & pagination) ───────────────────────────────────
export const getAllRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, urgency, category, districtId, assignedNGO, assignedVolunteer } = req.query;
    const filter: Record<string, unknown> = {};

    // ── Role-based scoping (server-enforced, client cannot bypass) ────────────
    if (req.user?.role === "citizen") {
      // Citizens always see only their own requests — ignore any client-supplied createdBy
      filter["createdBy"] = (req.user._id as { toString(): string }).toString();
    } else if (req.user?.role === "volunteer") {
      // Volunteers see only requests assigned to them
      if (assignedVolunteer) filter["assignedVolunteer"] = assignedVolunteer;
    } else {
      // NGO / admin / unauthenticated: honour all query filters
      const { createdBy } = req.query;
      if (createdBy)         filter["createdBy"]          = createdBy;
      if (assignedNGO)       filter["assignedNGO"]         = assignedNGO;
      if (assignedVolunteer) filter["assignedVolunteer"]   = assignedVolunteer;
    }

    if (status)     filter["status"]                  = status;
    if (urgency)    filter["urgency"]                 = urgency;
    if (category)   filter["category"]                = category;
    if (districtId) filter["location.districtId"]     = districtId;

    Object.assign(filter, buildSearchFilter(req.query["search"], SEARCH_FIELDS));

    const pagination = getPagination(req.query);

    if (!pagination.applied) {
      const requests = await ReliefRequest.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, data: requests, ...buildPaginationMeta(requests.length, pagination) });
      return;
    }

    const [requests, total] = await Promise.all([
      ReliefRequest.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      ReliefRequest.countDocuments(filter),
    ]);
    res.json({ success: true, data: requests, ...buildPaginationMeta(total, pagination) });
  } catch (error) {
    next(error);
  }
};

// ── Get by ID ─────────────────────────────────────────────────────────────────
export const getRequestById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const request = await ReliefRequest.findById(req.params["id"]);
    if (!request) throw AppError.notFound("Relief request not found");
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// ── NGO Actions ───────────────────────────────────────────────────────────────

export const ngoAcceptRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Stamp respondedAt on the last routingHistory entry using arrayFilters
    const request = await ReliefRequest.findById(req.params["id"]).lean();
    const lastEntry = request?.routingHistory?.at(-1);

    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
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
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

export const verifyRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
      { status: "verified", verifiedAt: new Date() },
      { new: true }
    );
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

export const rejectRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated by validateBody(rejectRequestSchema) in request.routes.ts
    const { note } = req.body as RejectRequestInput;
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
      { status: "rejected", verificationNote: note, verifiedAt: new Date() },
      { new: true }
    );
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

export const reserveResources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
      { status: "resources_reserved", resourcesReservedAt: new Date() },
      { new: true }
    );
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

export const assignVolunteer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated by validateBody(assignVolunteerSchema) in request.routes.ts
    const { volunteerId, volunteerName, estimatedArrival } = req.body as AssignVolunteerInput;
    const update: Record<string, unknown> = {
      status:                "volunteer_assigned",
      assignedVolunteer:     volunteerId,
      assignedVolunteerName: volunteerName,
      volunteerAssignedAt:   new Date(),
    };
    if (estimatedArrival) update["estimatedArrival"] = new Date(estimatedArrival);

    const updated = await ReliefRequest.findByIdAndUpdate(req.params["id"], update, { new: true });
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

// ── Volunteer Actions ─────────────────────────────────────────────────────────

export const markInTransit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
      { status: "in_transit", inTransitAt: new Date() },
      { new: true }
    );
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

export const markDelivered = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
      { status: "delivered", deliveredAt: new Date() },
      { new: true }
    );
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

// ── Citizen Confirmation ──────────────────────────────────────────────────────

export const confirmDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated by validateBody(confirmDeliverySchema) in request.routes.ts
    const { feedback } = req.body as ConfirmDeliveryInput;
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
      {
        status:              "completed",
        citizenConfirmedAt:  new Date(),
        completedAt:         new Date(),
        ...(feedback && { citizenFeedback: feedback }),
      },
      { new: true }
    );
    if (!updated) throw AppError.notFound("Request not found");

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
    next(error);
  }
};

// ── Generic update & delete ────────────────────────────────────────────────────
export const updateRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(updateRequestSchema) in request.routes.ts
    const body = req.body as UpdateRequestInput;
    const updated = await ReliefRequest.findByIdAndUpdate(
      req.params["id"],
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!updated) throw AppError.notFound("Request not found");
    res.json({ success: true, message: "Request updated", data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ReliefRequest.findByIdAndDelete(req.params["id"]);
    if (!deleted) throw AppError.notFound("Request not found");
    res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    next(error);
  }
};
