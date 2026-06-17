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
