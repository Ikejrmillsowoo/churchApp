// lib/auth.ts — server-side helpers for reading the current user, their profile, and role.
// Use these in Server Components, Route Handlers, and Server Actions.
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// The authenticated Supabase user, or null when signed out.
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// The current user's profile row, or null when signed out / not yet created.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return data ?? null;
}

// Convenience role check for gating admin-only screens (Phase 4+).
export async function isAdmin(): Promise<boolean> {
  const profile = await getProfile();
  return profile?.role === "admin";
}
