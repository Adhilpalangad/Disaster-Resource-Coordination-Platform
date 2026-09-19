import mongoose from "mongoose";
import { firestoreAdapter, type IPendingOperation } from "./firestore.adapter.js";
import { healthService } from "./health.service.js";

const MAX_RETRIES = 5;
const LEASE_DURATION_MS = 60000; // 60s worker lock lease

export interface SyncResult {
  processedCount: number;
  successCount: number;
  failureCount: number;
  permanentFailures: number;
  errors: Array<{ operationId: string; error: string }>;
}

class SyncManager {
  private isRunning: boolean = false;
  private workerId: string = `worker-${Math.random().toString(36).substring(2, 9)}`;

  /**
   * Triggers the synchronization loop
   */
  public async triggerSync(): Promise<SyncResult> {
    if (this.isRunning) {
      console.log("⏳ SyncManager: Replay loop already in progress. Skipping duplicate run.");
      return { processedCount: 0, successCount: 0, failureCount: 0, permanentFailures: 0, errors: [] };
    }

    if (!healthService.isMongoAvailable()) {
      console.warn("⚠️ SyncManager: MongoDB is not available. Cannot run sync replay.");
      return { processedCount: 0, successCount: 0, failureCount: 0, permanentFailures: 0, errors: [{ operationId: "N/A", error: "MongoDB unavailable" }] };
    }

    this.isRunning = true;
    healthService.transitionTo("SYNCING", "Replay engine started");

    const result: SyncResult = {
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      permanentFailures: 0,
      errors: [],
    };

    try {
      console.log(`🔄 [SyncManager] Worker ${this.workerId} initiating pending operations replay...`);
      const pendingOps = await firestoreAdapter.getPendingOperations();

      if (pendingOps.length === 0) {
        console.log("✅ [SyncManager] Outbox queue is empty. System in sync.");
        healthService.transitionTo("HEALTHY", "Outbox queue fully synchronized");
        return result;
      }

      // Filter out ops that are currently backoff-delayed
      const now = new Date().getTime();
      const readyOps = pendingOps.filter((op) => {
        if (!op.nextRetryAt) return true;
        return new Date(op.nextRetryAt).getTime() <= now;
      });

      console.log(`📋 [SyncManager] Total pending: ${pendingOps.length}, Ready for replay: ${readyOps.length}`);

      // Group operations per entityId to preserve document ordering
      const grouped = this.groupByEntity(readyOps);

      for (const [entityKey, ops] of Object.entries(grouped)) {
        for (const op of ops) {
          result.processedCount++;
          const acquired = await this.acquireLease(op);
          if (!acquired) {
            console.log(`🔒 [SyncManager] Operation ${op.operationId} locked by another worker. Skipping.`);
            continue;
          }

          const success = await this.replayOperation(op);
          if (success) {
            result.successCount++;
            await firestoreAdapter.updateOperationStatus(op.operationId, {
              status: "completed",
            });
          } else {
            result.failureCount++;
            const newRetryCount = op.retryCount + 1;
            const isPermanent = newRetryCount >= MAX_RETRIES;
            const backoffDelayMs = Math.pow(2, newRetryCount) * 1000;
            const nextRetryAt = new Date(now + backoffDelayMs).toISOString();

            if (isPermanent) result.permanentFailures++;

            const patch: Partial<IPendingOperation> = {
              status: isPermanent ? "permanently_failed" : "failed",
              retryCount: newRetryCount,
              lastAttemptAt: new Date().toISOString(),
            };
            if (!isPermanent) {
              patch.nextRetryAt = nextRetryAt;
            }
            if (op.lastError) {
              patch.lastError = op.lastError;
            }

            await firestoreAdapter.updateOperationStatus(op.operationId, patch);

            // If an operation on an entity fails, stop executing subsequent ops on the same entity
            console.warn(`⚠️ [SyncManager] Halting execution chain for entity ${entityKey} due to error`);
            break;
          }
        }
      }

      const remainingPending = await firestoreAdapter.getPendingOperations();
      if (remainingPending.length === 0) {
        healthService.transitionTo("HEALTHY", "All pending operations successfully replayed");
      } else {
        console.warn(`⚠️ [SyncManager] Sync completed with ${remainingPending.length} remaining operations pending retry.`);
        healthService.transitionTo("DEGRADED", "Partial sync complete, operations pending backoff retry");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("❌ [SyncManager] Unhandled error during sync replay:", errMsg);
      result.errors.push({ operationId: "GLOBAL", error: errMsg });
    } finally {
      this.isRunning = false;
    }

    return result;
  }

  private groupByEntity(ops: IPendingOperation[]): Record<string, IPendingOperation[]> {
    const map: Record<string, IPendingOperation[]> = {};
    for (const op of ops) {
      const key = `${op.collection}:${op.entityId}`;
      if (!map[key]) map[key] = [];
      map[key].push(op);
    }
    return map;
  }

  private async acquireLease(op: IPendingOperation): Promise<boolean> {
    const now = new Date().getTime();
    if (op.lockLease) {
      const expiresAt = new Date(op.lockLease.expiresAt).getTime();
      if (expiresAt > now && op.lockLease.workerId !== this.workerId) {
        return false; // Valid lock owned by another worker
      }
    }

    const newLease = {
      workerId: this.workerId,
      expiresAt: new Date(now + LEASE_DURATION_MS).toISOString(),
    };

    await firestoreAdapter.updateOperationStatus(op.operationId, {
      status: "processing",
      lockLease: newLease,
    });

    return true;
  }

  private async replayOperation(op: IPendingOperation): Promise<boolean> {
    try {
      console.log(`▶️ [SyncReplay] Replaying ${op.operationType} on ${op.collection} (ID: ${op.entityId})`);

      const modelNames = mongoose.modelNames();
      let targetModelName = modelNames.find(
        (m) => mongoose.model(m).collection.name.toLowerCase() === op.collection.toLowerCase()
      );

      if (!targetModelName) {
        // Fallback matching
        targetModelName = modelNames.find((m) => m.toLowerCase() === op.collection.toLowerCase());
      }

      if (!targetModelName) {
        op.lastError = `Target Mongoose model for collection '${op.collection}' not found in registry`;
        console.error(`❌ [SyncReplay] ${op.lastError}`);
        return false;
      }

      const Model = mongoose.model(targetModelName);

      if (op.operationType === "CREATE" || op.operationType === "UPSERT") {
        const payload = op.payload || {};
        // Idempotent upsert by _id
        await Model.updateOne(
          { _id: op.entityId },
          { $setOnInsert: payload },
          { upsert: true }
        );
      } else if (op.operationType === "UPDATE") {
        const updateOps = op.updateOps || {};
        const queryFilter = op.filter || { _id: op.entityId };
        await Model.updateOne(queryFilter, updateOps);
      } else if (op.operationType === "DELETE") {
        await Model.deleteOne({ _id: op.entityId });
      }

      console.log(`✅ [SyncReplay] Replay succeeded for operation ${op.operationId}`);
      return true;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      op.lastError = errMsg;
      console.error(`❌ [SyncReplay] Replay failed for operation ${op.operationId}:`, errMsg);
      return false;
    }
  }
}

export const syncManager = new SyncManager();
