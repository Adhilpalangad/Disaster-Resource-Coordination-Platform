import mongoose from "mongoose";

export type DatabaseHealthState =
  | "HEALTHY"
  | "DEGRADED"
  | "MONGODB_UNAVAILABLE"
  | "RECOVERING"
  | "SYNCING";

export interface HealthStats {
  state: DatabaseHealthState;
  mongoConnected: boolean;
  lastStateChange: string;
  totalOutages: number;
  totalFailovers: number;
  lastError?: string;
}

class HealthService {
  private currentState: DatabaseHealthState = "HEALTHY";
  private lastStateChange: Date = new Date();
  private totalOutages: number = 0;
  private totalFailovers: number = 0;
  private lastError?: string;
  private isInitialized: boolean = false;

  public init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Listen to Mongoose connection lifecycle events
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected! Transitioning health state to MONGODB_UNAVAILABLE");
      this.transitionTo("MONGODB_UNAVAILABLE", "Mongoose connection disconnected event");
    });

    mongoose.connection.on("connected", () => {
      console.log("📡 MongoDB Connection Established.");
      if (this.currentState === "MONGODB_UNAVAILABLE") {
        this.transitionTo("RECOVERING", "Mongoose connection restored");
      }
    });

    mongoose.connection.on("reconnected", () => {
      console.log("📡 MongoDB Reconnected.");
      if (this.currentState === "MONGODB_UNAVAILABLE") {
        this.transitionTo("RECOVERING", "Mongoose connection reconnected");
      }
    });

    mongoose.connection.on("error", (err) => {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("❌ MongoDB Connection Event Error:", errMsg);
      if (this.isAvailabilityError(err)) {
        this.transitionTo("MONGODB_UNAVAILABLE", errMsg);
      }
    });
  }

  public getState(): DatabaseHealthState {
    // Also perform real-time verification of readyState
    if (mongoose.connection.readyState !== 1 && this.currentState === "HEALTHY") {
      this.transitionTo("MONGODB_UNAVAILABLE", "Mongoose readyState is not connected (1)");
    }
    return this.currentState;
  }

  public isMongoAvailable(): boolean {
    return mongoose.connection.readyState === 1 && this.currentState !== "MONGODB_UNAVAILABLE";
  }

  public transitionTo(newState: DatabaseHealthState, reason?: string): void {
    if (this.currentState === newState) return;

    const oldState = this.currentState;
    this.currentState = newState;
    this.lastStateChange = new Date();

    if (newState === "MONGODB_UNAVAILABLE") {
      this.totalOutages++;
      this.totalFailovers++;
      if (reason) this.lastError = reason;
    }

    console.log(`🔄 [Database Health] State transitioned: ${oldState} ➔ ${newState}${reason ? ` (${reason})` : ""}`);
  }

  /**
   * Reliable classification of MongoDB Infrastructure/Availability failure vs Application/Validation error
   */
  public isAvailabilityError(error: unknown): boolean {
    if (!error) return false;

    // Mongoose Validation, CastError, and Schema errors are NOT availability failures
    if (error instanceof mongoose.Error.ValidationError) return false;
    if (error instanceof mongoose.Error.CastError) return false;
    if (error instanceof mongoose.Error.DocumentNotFoundError) return false;

    const errObj = error as Record<string, any>;

    // Duplicate key error (Code 11000) is a business error
    if (errObj.code === 11000 || errObj.codeName === "DuplicateKey") {
      return false;
    }

    // Name or class checks for MongoDB Driver connection failures
    const errorName = errObj.name || "";
    const errorMessage = errObj.message || String(error);
    const errorCode = errObj.code || "";

    const isNetworkOrConnectionError =
      errorName.includes("MongoNetworkError") ||
      errorName.includes("MongoServerSelectionError") ||
      errorName.includes("MongoTimeoutError") ||
      errorName.includes("MongooseServerSelectionError") ||
      errorMessage.includes("buffering timed out") ||
      errorMessage.includes("Topology is closed") ||
      errorMessage.includes("Client must be connected") ||
      errorMessage.includes("pool is closed") ||
      errorCode === "ETIMEDOUT" ||
      errorCode === "ECONNREFUSED" ||
      errorCode === "ECONNRESET" ||
      errorCode === "ENOTFOUND";

    return isNetworkOrConnectionError;
  }

  public recordFailover(reason?: string): void {
    this.transitionTo("MONGODB_UNAVAILABLE", reason);
  }

  public getStats(): HealthStats {
    return {
      state: this.currentState,
      mongoConnected: mongoose.connection.readyState === 1,
      lastStateChange: this.lastStateChange.toISOString(),
      totalOutages: this.totalOutages,
      totalFailovers: this.totalFailovers,
      ...(this.lastError && { lastError: this.lastError }),
    };
  }
}

export const healthService = new HealthService();
