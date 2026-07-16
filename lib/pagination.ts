/** Parses a raw page search-param into a safe, positive integer. Invalid input defaults to 1. */
export function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? '1', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}
