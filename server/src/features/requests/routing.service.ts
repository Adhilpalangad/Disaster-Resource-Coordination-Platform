/**
 * Intelligent Request Routing Engine
 *
 * Workflow:
 *  1. Receive a newly created request with structured location
 *  2. Find all active NGO users whose district matches the request's district
 *  3. Score each NGO by current workload (active requests assigned to them)
 *  4. Assign to the least-loaded NGO — status becomes "ngo_assigned"
 *  5. If no eligible NGO found — escalate to admin ("escalated")
 */

import { ReliefRequest, type IRequestLocation } from "./request.model.js";
import { User } from "../auth/user.model.js";
import { notificationService } from "../notifications/notification.service.js";

export class RoutingService {
  // ── Public API ─────────────────────────────────────────────────────────────

  async routeRequest(requestId: string, location: IRequestLocation): Promise<void> {
    try {
      await ReliefRequest.findByIdAndUpdate(requestId, { status: "location_routed" });

      const eligible = await this.findEligibleNGOs(location);

      if (eligible.length === 0) {
        const escalated = await ReliefRequest.findByIdAndUpdate(requestId, {
          status: "escalated",
          $push: {
            routingHistory: {
              ngoId:      "admin",
              ngoName:    "System Admin",
              assignedAt: new Date(),
              response:   "timeout",
              note:       "No NGO registered for this district. Escalated to admin.",
            },
          },
        }, { new: true });

        notificationService.send({
          userId:    "demo-admin-001",
          title:     "Request Escalated — Manual Assignment Needed",
          message:   `No NGO covers ${location.districtName}. A ${escalated?.category ?? "relief"} request needs manual assignment.`,
          type:      "danger",
          category:  "system",
          requestId,
          link:      `/admin/dashboard`,
        }).catch(console.error);

        if (escalated) {
          notificationService.send({
            userId:    escalated.createdBy,
            title:     "Request Escalated to Administrator",
            message:   `No NGO was immediately available in ${location.districtName}. Your request has been escalated to the system administrator who will assign it manually. You will receive an update shortly.`,
            type:      "warning",
            category:  "request",
            requestId,
            link:      `/requests/${requestId}`,
          }).catch(console.error);
        }

        console.log(`[Routing] Request ${requestId} escalated — no NGOs in ${location.districtName}`);
        return;
      }

      const ranked  = await this.scoreAndRank(eligible);
      const bestNGO = ranked[0];
      if (!bestNGO) {
        await ReliefRequest.findByIdAndUpdate(requestId, { status: "escalated" });
        return;
      }

      const bestId   = (bestNGO._id as { toString(): string }).toString();
      const bestName = bestNGO.organizationName?.trim() || bestNGO.name;

      await ReliefRequest.findByIdAndUpdate(requestId, {
        status:          "ngo_assigned",
        assignedNGO:     bestId,
        assignedNGOName: bestName,
        ngoAssignedAt:   new Date(),
        $push: {
          routingHistory: {
            ngoId:      bestId,
            ngoName:    bestName,
            assignedAt: new Date(),
          },
        },
      });

      // Notify the NGO
      const reqDoc = await ReliefRequest.findById(requestId).lean();
      notificationService.send({
        userId:    bestId,
        title:     "New Relief Request Assigned to You",
        message:   `A new ${reqDoc?.category ?? "relief"} request has been routed to ${bestName}. Location: ${location.localBodyName}, ${location.districtName}. Please review and accept or reject within 30 minutes.`,
        type:      "warning",
        category:  "request",
        requestId,
        link:      `/ngo/requests`,
      }).catch(console.error);

      console.log(`[Routing] Request ${requestId} → ${bestName} (district: ${location.districtName})`);
    } catch (err) {
      console.error(`[Routing] Failed to route request ${requestId}:`, err);
    }
  }

  async forwardRequest(requestId: string, declinedNGOId: string, reason: "declined" | "timeout"): Promise<void> {
    const request = await ReliefRequest.findById(requestId);
    if (!request) return;

    // Mark the current NGO's routing history entry
    await ReliefRequest.findOneAndUpdate(
      { _id: requestId, "routingHistory.ngoId": declinedNGOId },
      {
        $set: {
          "routingHistory.$.respondedAt": new Date(),
          "routingHistory.$.response":    reason,
        },
      }
    );

    const triedIds = request.routingHistory.map((h) => h.ngoId);
    const eligible = await this.findEligibleNGOs(request.location);
    const untried  = eligible.filter(
      (n) => !triedIds.includes((n._id as { toString(): string }).toString())
    );

    if (untried.length === 0) {
      await ReliefRequest.findByIdAndUpdate(requestId, {
        status:          "escalated",
        assignedNGO:     undefined,
        assignedNGOName: undefined,
        $push: {
          routingHistory: {
            ngoId:      "admin",
            ngoName:    "System Admin",
            assignedAt: new Date(),
            note:       "All eligible NGOs declined or timed out. Escalated to admin.",
          },
        },
      });
      return;
    }

    const ranked = await this.scoreAndRank(untried);
    const next   = ranked[0];
    if (!next) {
      await ReliefRequest.findByIdAndUpdate(requestId, { status: "escalated" });
      return;
    }

    const nextId   = (next._id as { toString(): string }).toString();
    const nextName = next.organizationName?.trim() || next.name;

    await ReliefRequest.findByIdAndUpdate(requestId, {
      status:          "ngo_assigned",
      assignedNGO:     nextId,
      assignedNGOName: nextName,
      ngoAssignedAt:   new Date(),
      $push: {
        routingHistory: {
          ngoId:      nextId,
          ngoName:    nextName,
          assignedAt: new Date(),
        },
      },
    });
  }

  async checkTimedOutAssignments(): Promise<void> {
    const timeoutThreshold = new Date(Date.now() - 30 * 60 * 1000);
    const timedOut = await ReliefRequest.find({
      status:        "ngo_assigned",
      ngoAssignedAt: { $lt: timeoutThreshold },
    });

    for (const req of timedOut) {
      if (req.assignedNGO) {
        console.log(`[Routing] Timeout — forwarding request ${req._id} from ${req.assignedNGOName}`);
        await this.forwardRequest(req._id.toString(), req.assignedNGO, "timeout");
      }
    }
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  /** Find NGO users whose district matches the request district */
  private async findEligibleNGOs(location: IRequestLocation) {
    return User.find({ role: "ngo", district: location.districtName }).lean();
  }

  /** Rank NGOs by fewest active requests (least loaded first) */
  private async scoreAndRank(ngos: Awaited<ReturnType<typeof this.findEligibleNGOs>>) {
    const scored = await Promise.all(
      ngos.map(async (ngo) => {
        const userId = (ngo._id as { toString(): string }).toString();
        const activeRequests = await ReliefRequest.countDocuments({
          assignedNGO: userId,
          status: { $nin: ["completed", "rejected", "escalated", "resolved"] },
        });
        return { ...ngo, score: 100 - activeRequests * 10 };
      })
    );
    return scored.sort((a, b) => b.score - a.score);
  }
}

export const routingService = new RoutingService();
