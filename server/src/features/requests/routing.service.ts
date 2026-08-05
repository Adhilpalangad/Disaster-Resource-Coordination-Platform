/**
 * Intelligent Request Routing Engine
 *
 * Workflow:
 *  1. Receive a newly created request with structured location
 *  2. Find all active NGOs whose service areas overlap the request location
 *  3. Score each NGO by: location specificity, capacity, current workload
 *  4. Assign to highest-ranked NGO — status becomes "ngo_assigned"
 *  5. If no eligible NGO found — escalate to admin ("escalated")
 *
 * Auto-escalation (timeout):
 *  The checkTimedOutAssignments() method can be called by a scheduled task
 *  (cron, etc.) to move timed-out assignments to the next eligible NGO.
 */

import { ReliefRequest, type IRequestLocation } from "./request.model.js";
import { NGOProfile } from "../ngos/ngo.model.js";
import { notificationService } from "../notifications/notification.service.js";

export class RoutingService {
  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Route a newly created request to the best eligible NGO.
   * Called immediately after the request document is created.
   */
  async routeRequest(requestId: string, location: IRequestLocation): Promise<void> {
    try {
      // Mark as routing in progress
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
              note:       "No eligible NGO found for this location. Escalated to admin.",
            },
          },
        }, { new: true });

        // Notify admin
        notificationService.send({
          userId:    "demo-admin-001",
          title:     "Request Escalated — Manual Assignment Needed",
          message:   `No NGO covers ${location.localBodyName}, ${location.districtName}. A ${escalated?.category ?? "relief"} request needs manual assignment.`,
          type:      "danger",
          category:  "system",
          requestId,
          link:      `/admin/dashboard`,
        }).catch(console.error);

        // Notify citizen
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

        console.log(`[Routing] Request ${requestId} escalated — no NGOs cover ${location.districtName}`);
        return;
      }

      const ranked  = this.scoreAndRank(eligible, location);
      const bestNGO = ranked[0];

      if (!bestNGO) {
        await ReliefRequest.findByIdAndUpdate(requestId, { status: "escalated" });
        return;
      }

      const bestId   = bestNGO._id?.toString() ?? bestNGO.userId;
      const bestName = bestNGO.orgName;
      const bestScore= bestNGO.score;

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

      // Increment NGO's current workload counter
      await NGOProfile.findByIdAndUpdate(bestNGO._id, { $inc: { currentWorkload: 1 } });

      // Notify the NGO that a new request has been routed to them
      notificationService.send({
        userId:    bestNGO.userId,
        title:     "New Relief Request Assigned to You",
        message:   `A new request has been routed to ${bestName}. Category: ${(await ReliefRequest.findById(requestId).lean())?.category ?? "relief"}. Location: ${location.localBodyName}, ${location.districtName}. Please review and accept or reject within 30 minutes.`,
        type:      "warning",
        category:  "request",
        requestId,
        link:      `/ngo/requests`,
      }).catch(console.error);

      console.log(
        `[Routing] Request ${requestId} → ${bestName} (score: ${bestScore}, ` +
        `location: ${location.localBodyName}, ${location.districtName})`
      );
    } catch (err) {
      console.error(`[Routing] Failed to route request ${requestId}:`, err);
      // Don't throw — routing failure shouldn't crash the create endpoint
    }
  }

  /**
   * Handle NGO declining a request or timeout expiry.
   * Forwards to the next ranked NGO, or escalates.
   */
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

    // Reduce that NGO's workload (declinedNGOId is the MongoDB _id string)
    await NGOProfile.findByIdAndUpdate(declinedNGOId, { $inc: { currentWorkload: -1 } });

    // Find already-tried NGOs
    const triedIds = request.routingHistory.map((h) => h.ngoId);

    const eligible = await this.findEligibleNGOs(request.location);
    const untried = eligible.filter((n) => !triedIds.includes(n._id?.toString() ?? n.userId));

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

    const ranked = this.scoreAndRank(untried, request.location);
    const next   = ranked[0];

    if (!next) {
      await ReliefRequest.findByIdAndUpdate(requestId, { status: "escalated" });
      return;
    }

    const nextId   = next._id?.toString() ?? next.userId;
    const nextName = next.orgName;

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

    await NGOProfile.findByIdAndUpdate(next._id, { $inc: { currentWorkload: 1 } });
  }

  /**
   * Scan for timed-out ngo_assigned requests and forward them.
   * Should be called by a cron / scheduled task every few minutes.
   */
  async checkTimedOutAssignments(): Promise<void> {
    const timeoutThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 min default

    const timedOut = await ReliefRequest.find({
      status:         "ngo_assigned",
      ngoAssignedAt:  { $lt: timeoutThreshold },
    });

    for (const req of timedOut) {
      if (req.assignedNGO) {
        console.log(`[Routing] Timeout — forwarding request ${req._id} from ${req.assignedNGOName}`);
        await this.forwardRequest(req._id.toString(), req.assignedNGO, "timeout");
      }
    }
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private async findEligibleNGOs(location: IRequestLocation) {
    return NGOProfile.find({
      isActive: true,
      $or: [
        { "serviceAreas.districtIds":  location.districtId  },
        { "serviceAreas.talukIds":     location.talukId     },
        { "serviceAreas.localBodyIds": location.localBodyId },
      ],
    }).lean();
  }

  private scoreAndRank<T extends { serviceAreas: { districtIds: string[]; talukIds: string[]; localBodyIds: string[] }; currentWorkload: number; resourceCapacity: number }>(
    ngos: T[],
    location: IRequestLocation
  ): (T & { score: number })[] {
    return ngos
      .map((ngo) => {
        let score = 100;

        // Location specificity bonus — more granular = higher priority
        if (ngo.serviceAreas.localBodyIds.includes(location.localBodyId)) {
          score += 40;
        } else if (ngo.serviceAreas.talukIds.includes(location.talukId)) {
          score += 25;
        } else {
          score += 10; // district-level coverage
        }

        // Workload penalty — busier NGOs rank lower
        const workloadRatio = ngo.currentWorkload / Math.max(ngo.resourceCapacity, 1);
        score -= Math.round(workloadRatio * 30);

        // Hard cap to avoid negative scores
        if (score < 0) score = 0;

        return { ...ngo, score };
      })
      .sort((a, b) => b.score - a.score);
  }
}

export const routingService = new RoutingService();
