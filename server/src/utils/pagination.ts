/**
 * Shared pagination helper for list endpoints.
 *
 * Backward-compatible by design: when a request supplies none of
 * `page` / `limit` / `skip`, `applied` comes back false and callers
 * should skip `.skip()`/`.limit()` entirely, preserving the exact
 * "return everything" behaviour the frontend already depends on.
 *
 * Supported query params:
 *   ?page=<n>     1-based page number
 *   ?limit=<n>    page size (clamped to [1, maxLimit])
 *   ?skip=<n>     explicit skip, takes precedence over page if both given
 */

export interface PaginationParams {
  applied: boolean;
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toPositiveInt(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

export function getPagination(
  query: Record<string, unknown>,
  defaultLimit: number = DEFAULT_LIMIT,
  maxLimit: number = MAX_LIMIT
): PaginationParams {
  const rawPage  = toPositiveInt(query["page"]);
  const rawLimit = toPositiveInt(query["limit"]);
  const rawSkip  = toPositiveInt(query["skip"]);

  const applied = rawPage !== undefined || rawLimit !== undefined || rawSkip !== undefined;
  if (!applied) {
    return { applied: false, page: 1, limit: 0, skip: 0 };
  }

  // Invalid/negative/zero limit gracefully falls back to the default instead of erroring.
  const limit = rawLimit !== undefined && rawLimit > 0
    ? Math.min(rawLimit, maxLimit)
    : defaultLimit;

  let page: number;
  let skip: number;

  if (rawSkip !== undefined && rawSkip >= 0) {
    skip = rawSkip;
    page = Math.floor(skip / limit) + 1;
  } else {
    page = rawPage !== undefined && rawPage > 0 ? rawPage : 1;
    skip = (page - 1) * limit;
  }

  return { applied: true, page, limit, skip };
}

/** Builds the response-side pagination metadata. When pagination wasn't
 *  requested, `limit` mirrors `total` so consumers always see a consistent
 *  shape without it implying a cap was applied. */
export function buildPaginationMeta(total: number, pagination: PaginationParams): PaginationMeta {
  if (!pagination.applied) {
    return { total, page: 1, limit: total, totalPages: total > 0 ? 1 : 0 };
  }
  return {
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.limit > 0 ? Math.ceil(total / pagination.limit) : 0,
  };
}
