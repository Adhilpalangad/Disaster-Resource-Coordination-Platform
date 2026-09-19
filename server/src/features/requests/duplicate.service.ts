import crypto from "crypto";
import { ReliefRequest, type IReliefRequest } from "./request.model.js";
import { DuplicateAttemptLog, type IDuplicateAttemptLog } from "./duplicate.model.js";
import { getDuplicateConfigFromDb } from "../config/systemConfig.model.js";
import type {
  DuplicateCheckResult,
  SimilarityBreakdown,
  RequestLocation,
} from "@disaster-platform/shared";

// ── Text Similarity Utilities ──────────────────────────────────────────────────

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBigrams(str: string): Set<string> {
  const normalized = normalizeText(str);
  const bigrams = new Set<string>();
  if (normalized.length < 2) {
    if (normalized.length === 1) bigrams.add(normalized);
    return bigrams;
  }
  for (let i = 0; i < normalized.length - 1; i++) {
    bigrams.add(normalized.substring(i, i + 2));
  }
  return bigrams;
}

export function calculateBigramJaccard(text1: string, text2: string): number {
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);
  if (!norm1 && !norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;
  if (norm1 === norm2) return 1.0;

  const set1 = getBigrams(norm1);
  const set2 = getBigrams(norm2);

  let intersectionSize = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      intersectionSize++;
    }
  }

  const unionSize = new Set([...set1, ...set2]).size;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

// ── Location Similarity ────────────────────────────────────────────────────────

export function calculateLocationSimilarity(
  loc1: Partial<RequestLocation>,
  loc2: Partial<RequestLocation>
): number {
  if (!loc1 || !loc2) return 0.0;

  if (loc1.wardId && loc2.wardId && loc1.wardId === loc2.wardId) {
    return 1.0;
  }
  if (loc1.localBodyId && loc2.localBodyId && loc1.localBodyId === loc2.localBodyId) {
    return 0.85;
  }
  if (loc1.talukId && loc2.talukId && loc1.talukId === loc2.talukId) {
    return 0.6;
  }
  if (loc1.districtId && loc2.districtId && loc1.districtId === loc2.districtId) {
    return 0.3;
  }
  return 0.0;
}

// ── Temporal Decay ─────────────────────────────────────────────────────────────

export function calculateTemporalMultiplier(
  createdAt: Date,
  now: Date = new Date(),
  temporalDecayDays: number = 7
): number {
  const ageInMs = now.getTime() - new Date(createdAt).getTime();
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

  if (ageInDays < 0) return 1.0;
  if (ageInDays <= temporalDecayDays) {
    // Linear decay from 1.0 down to 0.5 over `temporalDecayDays`
    return 1.0 - 0.5 * (ageInDays / temporalDecayDays);
  }
  // After temporalDecayDays, decay down to 0.2
  return 0.2;
}

// ── Main Duplicate Check Evaluator ──────────────────────────────────────────────

export async function evaluateDuplicateSubmission(
  payload: {
    category: string;
    description: string;
    location: RequestLocation;
    urgency?: string;
    peopleAffected?: number;
  },
  citizenId: string,
  citizenName: string = "Citizen",
  citizenMobile: string = ""
): Promise<DuplicateCheckResult> {
  const config = await getDuplicateConfigFromDb();

  const emptyBreakdown: SimilarityBreakdown = {
    categoryScore: 0,
    locationScore: 0,
    descriptionScore: 0,
    temporalMultiplier: 1,
  };

  if (!config.enabled) {
    return {
      isDuplicate: false,
      score: 0,
      action: "allow",
      breakdown: emptyBreakdown,
    };
  }

  // Find candidate existing requests from the same citizen
  const orConditions: any[] = [];
  if (citizenId) orConditions.push({ createdBy: citizenId });
  if (citizenMobile && citizenMobile.trim()) {
    orConditions.push({ mobileNumber: citizenMobile.trim() });
  }
  if (citizenName && citizenName.trim() && citizenName !== "Citizen") {
    orConditions.push({ fullName: new RegExp(`^${citizenName.trim()}$`, "i") });
  }

  const query: Record<string, any> = {
    $or: orConditions.length > 0 ? orConditions : [{ createdBy: citizenId }],
    status: { $nin: ["rejected", "closed", "duplicate_detected"] },
  };

  if (config.exactCategoryMatchOnly) {
    query.category = payload.category;
  }

  const existingRequests = await ReliefRequest.find(query).sort({ createdAt: -1 }).lean();

  if (!existingRequests || existingRequests.length === 0) {
    return {
      isDuplicate: false,
      score: 0,
      action: "allow",
      breakdown: emptyBreakdown,
    };
  }

  const weights = config.weights;
  const totalWeight = weights.category + weights.location + weights.description;

  let highestScore = 0;
  let bestMatch: (typeof existingRequests)[0] | null = null;
  let bestBreakdown: SimilarityBreakdown = emptyBreakdown;

  const now = new Date();

  for (const existing of existingRequests) {
    const categoryScore = existing.category === payload.category ? 1.0 : 0.0;
    const locationScore = calculateLocationSimilarity(payload.location, existing.location);
    const descriptionScore = calculateBigramJaccard(payload.description, existing.description);
    const temporalMultiplier = calculateTemporalMultiplier(
      existing.createdAt,
      now,
      config.temporalDecayDays
    );

    const rawWeightedScore =
      (categoryScore * weights.category +
        locationScore * weights.location +
        descriptionScore * weights.description) /
      (totalWeight || 1);

    const finalScore = Math.min(100, Math.round(rawWeightedScore * temporalMultiplier * 100));

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestMatch = existing;
      bestBreakdown = {
        categoryScore: Math.round(categoryScore * 100),
        locationScore: Math.round(locationScore * 100),
        descriptionScore: Math.round(descriptionScore * 100),
        temporalMultiplier: Number(temporalMultiplier.toFixed(2)),
      };
    }
  }

  const warnThreshold = config.thresholdActionMap.warnMinScore;
  const blockThreshold = config.thresholdActionMap.blockMinScore;

  if (highestScore >= blockThreshold && bestMatch) {
    // Increment duplicate attempts on the original request
    await ReliefRequest.findByIdAndUpdate(bestMatch._id, {
      $inc: { duplicateAttempts: 1 },
    });

    // Log the blocked attempt
    await DuplicateAttemptLog.create({
      citizenId,
      citizenName,
      citizenMobile,
      existingRequestId: bestMatch._id.toString(),
      attemptedPayload: {
        category: payload.category,
        description: payload.description,
        ...(payload.urgency ? { urgency: payload.urgency } : {}),
        location: payload.location,
        ...(payload.peopleAffected ? { peopleAffected: payload.peopleAffected } : {}),
      },
      similarityScore: highestScore,
      breakdown: bestBreakdown,
      action: "blocked",
    });

    return {
      isDuplicate: true,
      score: highestScore,
      action: "block",
      existingRequestId: bestMatch._id.toString(),
      existingRequest: {
        _id: bestMatch._id.toString(),
        category: bestMatch.category,
        description: bestMatch.description,
        status: bestMatch.status,
        createdAt: bestMatch.createdAt.toISOString(),
      },
      breakdown: bestBreakdown,
    };
  }

  if (highestScore >= warnThreshold && bestMatch) {
    // Generate confirmation token for warning override
    const confirmToken = crypto.randomUUID();
    const ttlMs = config.confirmTokenTtlMinutes * 60 * 1000;
    const confirmTokenExpiresAt = new Date(Date.now() + ttlMs);

    await DuplicateAttemptLog.create({
      citizenId,
      citizenName,
      citizenMobile,
      existingRequestId: bestMatch._id.toString(),
      attemptedPayload: {
        category: payload.category,
        description: payload.description,
        ...(payload.urgency ? { urgency: payload.urgency } : {}),
        location: payload.location,
        ...(payload.peopleAffected ? { peopleAffected: payload.peopleAffected } : {}),
      },
      similarityScore: highestScore,
      breakdown: bestBreakdown,
      action: "warning_ignored", // Recorded as warning state
      confirmToken,
      confirmTokenExpiresAt,
    });

    return {
      isDuplicate: true,
      score: highestScore,
      action: "warn",
      confirmToken,
      existingRequestId: bestMatch._id.toString(),
      existingRequest: {
        _id: bestMatch._id.toString(),
        category: bestMatch.category,
        description: bestMatch.description,
        status: bestMatch.status,
        createdAt: bestMatch.createdAt.toISOString(),
      },
      breakdown: bestBreakdown,
    };
  }

  return {
    isDuplicate: false,
    score: highestScore,
    action: "allow",
    breakdown: bestBreakdown,
  };
}

export async function validateAndConsumeConfirmToken(
  token: string,
  citizenId: string
): Promise<boolean> {
  const attempt = await DuplicateAttemptLog.findOne({
    confirmToken: token,
    citizenId,
    confirmTokenExpiresAt: { $gt: new Date() },
  });

  if (!attempt) {
    return false;
  }

  // Consume token so it cannot be reused
  await DuplicateAttemptLog.updateOne(
    { _id: attempt._id },
    { $unset: { confirmToken: 1, confirmTokenExpiresAt: 1 } }
  );

  return true;
}
