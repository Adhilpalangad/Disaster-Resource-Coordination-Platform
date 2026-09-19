import mongoose, { type Model, type Document } from "mongoose";
import { healthService } from "./health.service.js";
import { firestoreAdapter, type IPendingOperation } from "./firestore.adapter.js";
import { syncManager } from "./sync.manager.js";

export interface DatabaseServiceOptions {
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
  select?: string;
  lean?: boolean;
}

export class DatabaseService {
  /**
   * Helper to get collection name from a Mongoose Model
   */
  private getCollectionName<T>(model: Model<T>): string {
    return model.collection.name;
  }

  /**
   * Generates a unique 24-character hexadecimal MongoDB ObjectId string if needed
   */
  public generateId(): string {
    return new mongoose.Types.ObjectId().toString();
  }

  // ── READ OPERATIONS ─────────────────────────────────────────────────────────

  public async find<T>(
    model: Model<T>,
    filter: Record<string, any> = {},
    options: DatabaseServiceOptions = {}
  ): Promise<any[]> {
    if (healthService.isMongoAvailable()) {
      try {
        let query = model.find(filter);
        if (options.sort) query = query.sort(options.sort);
        if (options.skip) query = query.skip(options.skip);
        if (options.limit) query = query.limit(options.limit);
        if (options.select) query = query.select(options.select);
        if (options.lean) return await query.lean().exec();
        return await query.exec();
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    console.warn(`⚠️ [DatabaseService] Reading '${this.getCollectionName(model)}' from Fallback storage.`);
    const collectionName = this.getCollectionName(model);
    const rawDocs = await firestoreAdapter.queryDocuments(collectionName);
    const overlayDocs = await firestoreAdapter.applyOverlayToDocuments(collectionName, rawDocs);

    // Basic in-memory filter implementation
    let filtered = overlayDocs.filter((doc) => this.matchesFilter(doc, filter));

    if (options.sort) {
      const [sortKey, sortDir] = Object.entries(options.sort)[0] || [];
      if (sortKey) {
        filtered.sort((a, b) => {
          const valA = a[sortKey];
          const valB = b[sortKey];
          if (valA < valB) return sortDir === 1 ? -1 : 1;
          if (valA > valB) return sortDir === 1 ? 1 : -1;
          return 0;
        });
      }
    }

    if (options.skip) {
      filtered = filtered.slice(options.skip);
    }
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  public async findOne<T>(
    model: Model<T>,
    filter: Record<string, any> = {},
    options: DatabaseServiceOptions = {}
  ): Promise<any | null> {
    if (healthService.isMongoAvailable()) {
      try {
        let query = model.findOne(filter);
        if (options.select) query = query.select(options.select);
        if (options.lean) return await query.lean().exec();
        return await query.exec();
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    const docs = await this.find(model, filter, { ...options, limit: 1 });
    return docs[0] || null;
  }

  public async findById<T>(
    model: Model<T>,
    id: string,
    options: DatabaseServiceOptions = {}
  ): Promise<any | null> {
    if (healthService.isMongoAvailable()) {
      try {
        let query = model.findById(id);
        if (options.select) query = query.select(options.select);
        if (options.lean) return await query.lean().exec();
        return await query.exec();
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    return await this.findOne(model, { _id: id }, options);
  }

  public async countDocuments<T>(
    model: Model<T>,
    filter: Record<string, any> = {}
  ): Promise<number> {
    if (healthService.isMongoAvailable()) {
      try {
        return await model.countDocuments(filter).exec();
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    const docs = await this.find(model, filter);
    return docs.length;
  }

  public async aggregate<T>(
    model: Model<T>,
    pipeline: any[]
  ): Promise<any[]> {
    if (healthService.isMongoAvailable()) {
      try {
        return await model.aggregate(pipeline).exec();
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    console.warn(`⚠️ [DatabaseService] Performing fallback aggregation on '${this.getCollectionName(model)}'`);
    const docs = await this.find(model, {});

    // Basic group sum support for fallback dashboard stats (e.g. total capacity & occupancy)
    const groupStage = pipeline.find((stage) => stage.$group);
    if (groupStage) {
      const spec = groupStage.$group;
      const res: Record<string, any> = { _id: spec._id };
      for (const [key, expr] of Object.entries(spec)) {
        if (key === "_id") continue;
        if (typeof expr === "object" && expr !== null && "$sum" in expr) {
          const field = (expr as any).$sum.replace("$", "");
          res[key] = docs.reduce((acc, doc) => acc + (Number(doc[field]) || 0), 0);
        }
      }
      return [res];
    }

    return docs;
  }

  // ── WRITE MUTATIONS ─────────────────────────────────────────────────────────

  public async create<T>(
    model: Model<T>,
    payload: Record<string, any>
  ): Promise<any> {
    const collectionName = this.getCollectionName(model);
    const docId = payload._id ? String(payload._id) : this.generateId();
    const docPayload = {
      ...payload,
      _id: docId,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updatedAt || new Date().toISOString(),
    };

    if (healthService.isMongoAvailable()) {
      try {
        const createdDoc = await model.create(docPayload as any);
        // Async background sync to Firebase backup
        firestoreAdapter.writeDocument(collectionName, docId, docPayload).catch((e) =>
          console.warn(`⚠️ Firebase backup sync warning for ${collectionName}/${docId}:`, e)
        );
        return createdDoc;
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    console.warn(`📥 [DatabaseService] Queueing CREATE operation into Outbox for '${collectionName}'`);
    const opId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `${collectionName}:${docId}:CREATE:${Date.now()}`;

    const pendingOp: IPendingOperation = {
      operationId: opId,
      idempotencyKey,
      collection: collectionName,
      entityId: docId,
      operationType: "CREATE",
      payload: docPayload,
      status: "pending",
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestoreAdapter.enqueuePendingOperation(pendingOp);
    await firestoreAdapter.writeDocument(collectionName, docId, docPayload);

    return {
      ...docPayload,
      queuedOffline: true,
    };
  }

  public async findByIdAndUpdate<T>(
    model: Model<T>,
    id: string,
    update: Record<string, any>,
    options: { new?: boolean; runValidators?: boolean } = {}
  ): Promise<any | null> {
    const collectionName = this.getCollectionName(model);

    if (healthService.isMongoAvailable()) {
      try {
        const updatedDoc = await model.findByIdAndUpdate(id, update, options).exec();
        if (updatedDoc) {
          const docObj = (updatedDoc as any).toObject ? (updatedDoc as any).toObject() : updatedDoc;
          firestoreAdapter.writeDocument(collectionName, id, docObj).catch((e) =>
            console.warn(`⚠️ Firebase backup sync warning for ${collectionName}/${id}:`, e)
          );
        }
        return updatedDoc;
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    console.warn(`📥 [DatabaseService] Queueing UPDATE operation into Outbox for '${collectionName}/${id}'`);
    const opId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `${collectionName}:${id}:UPDATE:${Date.now()}`;

    const updateOps = this.extractUpdateOps(update);

    const pendingOp: IPendingOperation = {
      operationId: opId,
      idempotencyKey,
      collection: collectionName,
      entityId: String(id),
      operationType: "UPDATE",
      updateOps,
      status: "pending",
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestoreAdapter.enqueuePendingOperation(pendingOp);

    // Apply update to fallback storage snapshot
    const existing = await firestoreAdapter.getDocument(collectionName, String(id)) || { _id: String(id) };
    const updatedFallback = { ...existing };
    if (updateOps.$set) Object.assign(updatedFallback, updateOps.$set);
    if (updateOps.$inc) {
      for (const [k, val] of Object.entries(updateOps.$inc)) {
        updatedFallback[k] = (Number(updatedFallback[k]) || 0) + Number(val);
      }
    }
    updatedFallback.updatedAt = new Date().toISOString();

    await firestoreAdapter.writeDocument(collectionName, String(id), updatedFallback);

    return {
      ...updatedFallback,
      queuedOffline: true,
    };
  }

  public async findOneAndUpdate<T>(
    model: Model<T>,
    filter: Record<string, any>,
    update: Record<string, any>,
    options: { upsert?: boolean; new?: boolean; setDefaultsOnInsert?: boolean } = {}
  ): Promise<any | null> {
    if (healthService.isMongoAvailable()) {
      try {
        const doc = await model.findOneAndUpdate(filter, update, options).exec();
        if (doc) {
          const docObj = (doc as any).toObject ? (doc as any).toObject() : doc;
          firestoreAdapter.writeDocument(this.getCollectionName(model), String(docObj._id), docObj).catch((e) =>
            console.warn(`⚠️ Firebase backup sync warning:`, e)
          );
        }
        return doc;
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    const existing = await this.findOne(model, filter);
    if (existing) {
      return await this.findByIdAndUpdate(model, String(existing._id), update, options);
    } else if (options.upsert) {
      const payload = { ...filter, ...this.extractUpdateOps(update).$set };
      return await this.create(model, payload);
    }
    return null;
  }

  public async updateOne<T>(
    model: Model<T>,
    filter: Record<string, any>,
    update: Record<string, any>
  ): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    const existing = await this.findOne(model, filter);
    if (existing) {
      await this.findByIdAndUpdate(model, String(existing._id), update);
      return { acknowledged: true, modifiedCount: 1 };
    }
    return { acknowledged: true, modifiedCount: 0 };
  }

  public async updateMany<T>(
    model: Model<T>,
    filter: Record<string, any>,
    update: Record<string, any>
  ): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    const docs = await this.find(model, filter);
    for (const doc of docs) {
      await this.findByIdAndUpdate(model, String(doc._id), update);
    }
    return { acknowledged: true, modifiedCount: docs.length };
  }

  public async deleteOne<T>(
    model: Model<T>,
    filter: Record<string, any>
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const existing = await this.findOne(model, filter);
    if (existing) {
      await this.findByIdAndDelete(model, String(existing._id));
      return { acknowledged: true, deletedCount: 1 };
    }
    return { acknowledged: true, deletedCount: 0 };
  }

  public async deleteMany<T>(
    model: Model<T>,
    filter: Record<string, any>
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const docs = await this.find(model, filter);
    for (const doc of docs) {
      await this.findByIdAndDelete(model, String(doc._id));
    }
    return { acknowledged: true, deletedCount: docs.length };
  }

  public async findByIdAndDelete<T>(
    model: Model<T>,
    id: string
  ): Promise<any | null> {
    const collectionName = this.getCollectionName(model);

    if (healthService.isMongoAvailable()) {
      try {
        const deletedDoc = await model.findByIdAndDelete(id).exec();
        firestoreAdapter.deleteDocument(collectionName, String(id)).catch((e) =>
          console.warn(`⚠️ Firebase backup sync warning for delete ${collectionName}/${id}:`, e)
        );
        return deletedDoc;
      } catch (err) {
        if (!healthService.isAvailabilityError(err)) throw err;
        healthService.recordFailover(err instanceof Error ? err.message : String(err));
      }
    }

    console.warn(`📥 [DatabaseService] Queueing DELETE operation into Outbox for '${collectionName}/${id}'`);
    const opId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const idempotencyKey = `${collectionName}:${id}:DELETE:${Date.now()}`;

    const pendingOp: IPendingOperation = {
      operationId: opId,
      idempotencyKey,
      collection: collectionName,
      entityId: String(id),
      operationType: "DELETE",
      status: "pending",
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firestoreAdapter.enqueuePendingOperation(pendingOp);
    await firestoreAdapter.deleteDocument(collectionName, String(id));

    return { _id: id, queuedOffline: true };
  }

  // ── HELPER UTILITIES ────────────────────────────────────────────────────────

  private extractUpdateOps(update: Record<string, any>): {
    $set?: Record<string, any>;
    $unset?: Record<string, any>;
    $inc?: Record<string, number>;
    $push?: Record<string, any>;
    $pull?: Record<string, any>;
  } {
    const hasOperators = Object.keys(update).some((k) => k.startsWith("$"));
    if (hasOperators) {
      return {
        $set: update.$set,
        $unset: update.$unset,
        $inc: update.$inc,
        $push: update.$push,
        $pull: update.$pull,
      };
    }
    return { $set: update };
  }

  private matchesFilter(doc: Record<string, any>, filter: Record<string, any>): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const [key, targetVal] of Object.entries(filter)) {
      if (key === "$or" && Array.isArray(targetVal)) {
        const matchesAny = targetVal.some((cond) => this.matchesFilter(doc, cond));
        if (!matchesAny) return false;
        continue;
      }

      const docVal = doc[key];

      if (targetVal instanceof RegExp) {
        if (!targetVal.test(String(docVal || ""))) return false;
      } else if (typeof targetVal === "object" && targetVal !== null) {
        if ("$in" in targetVal && Array.isArray(targetVal.$in)) {
          if (!targetVal.$in.includes(docVal)) return false;
        } else if ("$ne" in targetVal) {
          if (docVal === targetVal.$ne) return false;
        }
      } else if (docVal !== targetVal) {
        return false;
      }
    }

    return true;
  }
}

export const databaseService = new DatabaseService();
