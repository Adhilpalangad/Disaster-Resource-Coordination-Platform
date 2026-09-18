import type { Request, Response } from "express";
import { User } from "../auth/user.model.js";
import { NGOProfile } from "../ngos/ngo.model.js";
import { Disaster } from "../disasters/disaster.model.js";
import { ReliefRequest } from "../requests/request.model.js";
import { Shelter } from "../shelters/shelter.model.js";
import { InventoryItem } from "../inventory/inventory.model.js";

/** GET /api/dashboard/stats */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      citizensCount,
      volunteersCount,
      ngosUserCount,
      adminsCount,
      totalNGOs,
      activeNGOs,
      totalDisasters,
      activeDisasters,
      criticalDisasters,
      totalRequests,
      pendingRequests,
      completedRequests,
      inTransitRequests,
      totalShelters,
      shelterCapacityAgg,
      totalInventoryItems,
      recentUsers,
      recentDisasters,
      recentRequests,
      recentNGOs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "citizen" }),
      User.countDocuments({ role: "volunteer" }),
      User.countDocuments({ role: "ngo" }),
      User.countDocuments({ role: "admin" }),
      NGOProfile.countDocuments(),
      NGOProfile.countDocuments({ isActive: true }),
      Disaster.countDocuments(),
      Disaster.countDocuments({ status: "active" }),
      Disaster.countDocuments({ severity: "critical" }),
      ReliefRequest.countDocuments(),
      ReliefRequest.countDocuments({ status: "pending" }),
      ReliefRequest.countDocuments({ status: "completed" }),
      ReliefRequest.countDocuments({ status: "in_transit" }),
      Shelter.countDocuments(),
      Shelter.aggregate([
        {
          $group: {
            _id: null,
            totalCapacity: { $sum: "$capacity" },
            totalOccupancy: { $sum: "$occupancy" },
          },
        },
      ]),
      InventoryItem.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(3),
      Disaster.find().sort({ createdAt: -1 }).limit(3),
      ReliefRequest.find().sort({ createdAt: -1 }).limit(3),
      NGOProfile.find().sort({ createdAt: -1 }).limit(3),
    ]);

    const capacityStats = shelterCapacityAgg[0] || { totalCapacity: 0, totalOccupancy: 0 };

    // Build dynamic recent activity feed
    const activityFeed: Array<{
      type: string;
      message: string;
      time: string;
      status: string;
      timestamp: Date;
    }> = [];

    recentUsers.forEach((u) => {
      activityFeed.push({
        type: "user",
        message: `New ${u.role} registered: ${u.name}${u.district ? ` (${u.district})` : ""}`,
        time: u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        status: "completed",
        timestamp: u.createdAt || new Date(),
      });
    });

    recentDisasters.forEach((d) => {
      activityFeed.push({
        type: "disaster",
        message: `Disaster updated: ${d.title} (${d.severity})`,
        time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        status: d.severity === "critical" ? "rejected" : "verified",
        timestamp: d.createdAt || new Date(),
      });
    });

    recentRequests.forEach((r) => {
      activityFeed.push({
        type: "request",
        message: `Relief request [${r.category}]: ${r.description ? r.description.substring(0, 45) : "New request"}`,
        time: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        status: r.status === "completed" ? "completed" : r.status === "pending" ? "pending" : "verified",
        timestamp: r.createdAt || new Date(),
      });
    });

    recentNGOs.forEach((n) => {
      activityFeed.push({
        type: "ngo",
        message: `NGO Profile: ${n.orgName}`,
        time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        status: n.isActive ? "verified" : "pending",
        timestamp: n.createdAt || new Date(),
      });
    });

    // Sort combined activity by timestamp descending
    activityFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          citizens: citizensCount,
          volunteers: volunteersCount,
          ngos: ngosUserCount,
          admins: adminsCount,
        },
        ngos: {
          total: totalNGOs,
          active: activeNGOs,
          pending: Math.max(0, totalNGOs - activeNGOs),
        },
        disasters: {
          total: totalDisasters,
          active: activeDisasters,
          critical: criticalDisasters,
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          completed: completedRequests,
          inTransit: inTransitRequests,
        },
        shelters: {
          total: totalShelters,
          capacity: capacityStats.totalCapacity,
          occupancy: capacityStats.totalOccupancy,
        },
        inventory: {
          totalItems: totalInventoryItems,
        },
        activity: activityFeed.slice(0, 6),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to compile dashboard aggregate statistics",
      error: String(error),
    });
  }
};
