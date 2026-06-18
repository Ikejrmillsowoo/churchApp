// lib/ics.ts — builds an iCalendar (.ics) document for a single event so members can add
// it to their own calendar app.
import type { Event } from "@/lib/types";

// Escape text per RFC 5545 (backslash, semicolon, comma, newlines).
function escapeICS(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// ISO timestamp -> "YYYYMMDDTHHMMSSZ" (UTC basic format).
function toICSStamp(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function buildEventICS(event: Event): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Church App//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@church-app`,
    `DTSTAMP:${toICSStamp(new Date().toISOString())}`,
    `DTSTART:${toICSStamp(event.starts_at)}`,
    event.ends_at ? `DTEND:${toICSStamp(event.ends_at)}` : null,
    `SUMMARY:${escapeICS(event.title)}`,
    event.location ? `LOCATION:${escapeICS(event.location)}` : null,
    event.description ? `DESCRIPTION:${escapeICS(event.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  return lines.join("\r\n");
}
