// lib/supabase/admin.ts — server-ONLY Supabase client using the service role key.
// Bypasses Row Level Security; never import this from client code. The `server-only`
// import makes the build fail if it is ever pulled into a Client Component bundle.
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
