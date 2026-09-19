import { Router, type Request, type Response } from "express";
import { healthService } from "./health.service.js";
import { firestoreAdapter } from "./firestore.adapter.js";
import { syncManager } from "./sync.manager.js";

const router = Router();

/** GET /api/resilience/status */
router.get("/status", async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = healthService.getStats();
    const pendingOps = await firestoreAdapter.getPendingOperations();

    res.json({
      success: true,
      data: {
        health: stats,
        outbox: {
          pendingCount: pendingOps.length,
          operations: pendingOps,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch resilience status", error: String(error) });
  }
});

/** GET /api/resilience/pending */
router.get("/pending", async (_req: Request, res: Response): Promise<void> => {
  try {
    const pendingOps = await firestoreAdapter.getPendingOperations();
    res.json({
      success: true,
      count: pendingOps.length,
      data: pendingOps,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch pending operations", error: String(error) });
  }
});

/** POST /api/resilience/trigger-sync */
router.post("/trigger-sync", async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await syncManager.triggerSync();
    res.json({
      success: true,
      message: "Sync replay process completed",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Sync trigger failed", error: String(error) });
  }
});

/** POST /api/resilience/simulate-outage */
router.post("/simulate-outage", (req: Request, res: Response): void => {
  const { action } = req.body;
  if (action === "down") {
    healthService.transitionTo("MONGODB_UNAVAILABLE", "Simulated database outage for testing");
    res.json({ success: true, message: "Simulated outage enabled: System state set to MONGODB_UNAVAILABLE" });
  } else if (action === "up") {
    healthService.transitionTo("RECOVERING", "Simulated database recovery for testing");
    syncManager.triggerSync().catch((e) => console.error("Simulated sync error:", e));
    res.json({ success: true, message: "Simulated recovery enabled: Replay worker triggered" });
  } else {
    res.status(400).json({ success: false, message: "Invalid action. Use 'down' or 'up'" });
  }
});

export default router;
