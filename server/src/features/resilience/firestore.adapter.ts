import { getFirestoreDb } from "../../config/firebase.config.js";

export interface IPendingOperation {
  operationId: string;
  idempotencyKey: string;
  collection: string;
  entityId: string;
  operationType: "CREATE" | "UPDATE" | "DELETE" | "BULK_WRITE" | "UPSERT";
  payload?: Record<string, any>;
  updateOps?: {
    $set?: Record<string, any>;
    $unset?: Record<string, any>;
    $inc?: Record<string, number>;
    $push?: Record<string, any>;
    $pull?: Record<string, any>;
  };
  filter?: Record<string, any>;
  status: "pending" | "processing" | "completed" | "failed" | "permanently_failed";
  retryCount: number;
  lastAttemptAt?: string;
  nextRetryAt?: string;
  lastError?: string;
  lockLease?: {
    workerId: string;
    expiresAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback outbox & document storage for environments without active Firebase credentials
const localPendingQueue: Map<string, IPendingOperation> = new Map();
const localDocumentStore: Map<string, Map<string, Record<string, any>>> = new Map();

export class FirestoreAdapter {
  private getDb() {
    return getFirestoreDb();
  }

  // ── Pending Operation Outbox Queue ──────────────────────────────────────────

  public async enqueuePendingOperation(op: IPendingOperation): Promise<void> {
    const db = this.getDb();
    if (db) {
      try {
        await db.collection("pending_operations").doc(op.operationId).set(op);
        console.log(`📥 [Firestore Queue] Enqueued operation ${op.operationId} (${op.operationType} on ${op.collection}/${op.entityId})`);
        return;
      } catch (err) {
        console.error("❌ Failed to write to Firestore outbox, using local durable queue:", err);
      }
    }
    localPendingQueue.set(op.operationId, op);
    console.log(`📥 [Local Queue] Enqueued operation ${op.operationId} (${op.operationType} on ${op.collection}/${op.entityId})`);
  }

  public async getPendingOperations(): Promise<IPendingOperation[]> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db
          .collection("pending_operations")
          .where("status", "in", ["pending", "failed"])
          .orderBy("createdAt", "asc")
          .get();

        const ops: IPendingOperation[] = [];
        snapshot.forEach((doc) => {
          ops.push(doc.data() as IPendingOperation);
        });
        return ops;
      } catch (err) {
        console.error("❌ Failed to read pending operations from Firestore:", err);
      }
    }
    return Array.from(localPendingQueue.values())
      .filter((op) => op.status === "pending" || op.status === "failed")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async getPendingOperationsForEntity(collection: string, entityId: string): Promise<IPendingOperation[]> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db
          .collection("pending_operations")
          .where("collection", "==", collection)
          .where("entityId", "==", entityId)
          .get();

        const ops: IPendingOperation[] = [];
        snapshot.forEach((doc) => {
          ops.push(doc.data() as IPendingOperation);
        });
        return ops.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } catch (err) {
        console.error(`❌ Failed to read pending ops for entity ${collection}/${entityId}:`, err);
      }
    }

    return Array.from(localPendingQueue.values())
      .filter((op) => op.collection === collection && op.entityId === entityId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async updateOperationStatus(
    operationId: string,
    updates: Partial<IPendingOperation>
  ): Promise<void> {
    const db = this.getDb();
    const patch = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await db.collection("pending_operations").doc(operationId).update(patch);
        return;
      } catch (err) {
        console.error(`❌ Failed to update operation ${operationId} in Firestore:`, err);
      }
    }

    const existing = localPendingQueue.get(operationId);
    if (existing) {
      localPendingQueue.set(operationId, {
        ...existing,
        ...patch,
      });
    }
  }

  // ── Document Backup & Fallback Storage ──────────────────────────────────────

  public async writeDocument(collectionName: string, docId: string, payload: Record<string, any>): Promise<void> {
    const db = this.getDb();
    const docData = {
      ...payload,
      _id: docId,
      updatedAt: payload.updatedAt || new Date().toISOString(),
    };

    if (db) {
      try {
        await db.collection(collectionName).doc(docId).set(docData, { merge: true });
        return;
      } catch (err) {
        console.error(`❌ Firestore write failed for ${collectionName}/${docId}:`, err);
      }
    }

    if (!localDocumentStore.has(collectionName)) {
      localDocumentStore.set(collectionName, new Map());
    }
    localDocumentStore.get(collectionName)!.set(docId, docData);
  }

  public async getDocument(collectionName: string, docId: string): Promise<Record<string, any> | null> {
    const db = this.getDb();
    if (db) {
      try {
        const doc = await db.collection(collectionName).doc(docId).get();
        if (doc.exists) {
          return doc.data() as Record<string, any>;
        }
      } catch (err) {
        console.error(`❌ Firestore read failed for ${collectionName}/${docId}:`, err);
      }
    }

    const col = localDocumentStore.get(collectionName);
    return col?.get(docId) || null;
  }

  public async queryDocuments(
    collectionName: string,
    filterFn?: (doc: Record<string, any>) => boolean
  ): Promise<Array<Record<string, any>>> {
    const db = this.getDb();
    let results: Array<Record<string, any>> = [];

    if (db) {
      try {
        const snapshot = await db.collection(collectionName).get();
        snapshot.forEach((doc) => {
          results.push(doc.data() as Record<string, any>);
        });
      } catch (err) {
        console.error(`❌ Firestore query failed for ${collectionName}:`, err);
      }
    }

    if (results.length === 0 && localDocumentStore.has(collectionName)) {
      const colMap = localDocumentStore.get(collectionName)!;
      results = Array.from(colMap.values());
    }

    if (filterFn) {
      results = results.filter(filterFn);
    }

    return results;
  }

  public async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const db = this.getDb();
    if (db) {
      try {
        await db.collection(collectionName).doc(docId).delete();
      } catch (err) {
        console.error(`❌ Firestore delete failed for ${collectionName}/${docId}:`, err);
      }
    }

    localDocumentStore.get(collectionName)?.delete(docId);
  }

  // ── Snapshot Read Overlay (Read-Your-Own-Writes) ────────────────────────────

  public async applyOverlayToDocuments(
    collectionName: string,
    baseDocs: Array<Record<string, any>>
  ): Promise<Array<Record<string, any>>> {
    const activeOps = await this.getPendingOperations();
    const collectionOps = activeOps.filter((op) => op.collection === collectionName);

    if (collectionOps.length === 0) return baseDocs;

    const docMap = new Map<string, Record<string, any>>();
    baseDocs.forEach((doc) => {
      const id = doc._id || doc.id;
      if (id) docMap.set(String(id), { ...doc });
    });

    for (const op of collectionOps) {
      const id = op.entityId;

      if (op.operationType === "CREATE" || op.operationType === "UPSERT") {
        if (op.payload) {
          docMap.set(id, { ...op.payload, _id: id });
        }
      } else if (op.operationType === "DELETE") {
        docMap.delete(id);
      } else if (op.operationType === "UPDATE") {
        const existing = docMap.get(id);
        if (existing && op.updateOps) {
          const updated = { ...existing };

          if (op.updateOps.$set) {
            Object.assign(updated, op.updateOps.$set);
          }
          if (op.updateOps.$unset) {
            for (const k of Object.keys(op.updateOps.$unset)) {
              delete updated[k];
            }
          }
          if (op.updateOps.$inc) {
            for (const [k, val] of Object.entries(op.updateOps.$inc)) {
              updated[k] = (Number(updated[k]) || 0) + Number(val);
            }
          }

          docMap.set(id, updated);
        }
      }
    }

    return Array.from(docMap.values());
  }
}

export const firestoreAdapter = new FirestoreAdapter();
