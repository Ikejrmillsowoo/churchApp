// lib/datetime.ts — helpers for displaying and editing event times.
// NOTE: times are handled in UTC for consistency across server-rendered pages. Per-user
// timezone support can be added later; for now what an admin enters is what everyone sees.

// Format a stored ISO timestamp for display, e.g. "Jul 1, 2026, 6:30 PM".
export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

// Convert a stored ISO timestamp to the value expected by <input type="datetime-local">
// ("YYYY-MM-DDTHH:MM"). Stored times are UTC, so we slice the UTC ISO string directly.
export function toDatetimeLocalValue(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16);
}

// Convert a datetime-local form value to an ISO timestamp for storage (treated as UTC).
export function datetimeLocalToISO(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
