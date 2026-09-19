/**
 * Shared backend search helper.
 *
 * Builds a case-insensitive, partial-match Mongo filter across a set of
 * string fields from a `?search=` query param. Returns `undefined` when
 * no search term was supplied, so callers can spread it into an existing
 * filter object without any conditional branching:
 *
 *   const filter = { ...baseFilter, ...buildSearchFilter(req.query["search"], [...]) };
 */

/** Escapes regex special characters so user input can't break or abuse the pattern. */
function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildSearchFilter(
  search: unknown,
  fields: string[]
): Record<string, unknown> | undefined {
  const term = typeof search === "string" ? search.trim() : "";
  if (!term || fields.length === 0) return undefined;

  const regex = new RegExp(escapeRegExp(term), "i");
  return { $or: fields.map((field) => ({ [field]: regex })) };
}
