// Duplicate Detection Constants & Interfaces

// ── Weights & Breakdown ────────────────────────────────────────────────────────

export interface SimilarityWeights {
  category: number;
  location: number;
  description: number;
  temporal: number;
}

export interface SimilarityBreakdown {
  categoryScore: number;
  locationScore: number;
  descriptionScore: number;
  temporalMultiplier: number;
}

// ── Configuration ─────────────────────────────────────────────────────────────

export interface IDuplicateConfig {
  enabled: boolean;
  exactCategoryMatchOnly: boolean;
  weights: SimilarityWeights;
  thresholdActionMap: {
    warnMinScore: number;
    blockMinScore: number;
  };
  temporalDecayDays: number;
  confirmTokenTtlMinutes: number;
}

export const DEFAULT_DUPLICATE_CONFIG: IDuplicateConfig = {
  enabled: true,
  exactCategoryMatchOnly: false,
  weights: {
    category: 0.25,
    location: 0.25,
    description: 0.35,
    temporal: 0.15,
  },
  thresholdActionMap: {
    warnMinScore: 70,
    blockMinScore: 90,
  },
  temporalDecayDays: 7,
  confirmTokenTtlMinutes: 15,
};

// ── Check Result & Matched Request ────────────────────────────────────────────

export interface MatchedRequestSummary {
  _id: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  score: number;
  action: "allow" | "warn" | "block";
  confirmToken?: string;
  existingRequestId?: string;
  existingRequest?: MatchedRequestSummary;
  breakdown: SimilarityBreakdown;
}

export interface DuplicateAttemptRecord {
  _id: string;
  citizenId: string;
  citizenName: string;
  citizenMobile: string;
  existingRequestId: string;
  attemptedPayload: {
    category: string;
    description: string;
    urgency?: string;
    location: Record<string, any>;
    peopleAffected?: number;
  };
  similarityScore: number;
  breakdown: SimilarityBreakdown;
  action: "blocked" | "warning_ignored" | "overridden_by_admin";
  confirmToken?: string;
  confirmTokenExpiresAt?: string;
  overriddenBy?: string;
  overriddenAt?: string;
  overrideReason?: string;
  createdAt: string;
  updatedAt: string;
}
