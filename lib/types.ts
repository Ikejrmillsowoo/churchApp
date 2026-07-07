// lib/types.ts — shared application types that mirror the database schema.
// Replace with Supabase-generated types if/when we add type generation.

export type Role = "member" | "admin";
export type MemberStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  status: MemberStatus;
  share_email: boolean;
  share_phone: boolean;
  email_opt_in: boolean;
  created_at: string;
  updated_at: string;
};

// A row from the public.member_directory view: contact fields are null unless shared.
export type DirectoryMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

// The subset of a pending profile shown on the admin approvals screen.
export type PendingMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

// A church event (events table, Phase 5).
export type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// A cached scripture-of-the-day entry (daily_verse table, Phase 6).
export type DailyVerse = {
  id: string;
  verse_date: string;
  reference: string;
  text: string;
  created_at: string;
};

// A logged mass-email send (messages table, Phase 7).
export type Message = {
  id: string;
  subject: string;
  body: string;
  audience: "approved" | "pending";
  sent_by: string | null;
  recipient_count: number;
  created_at: string;
};
