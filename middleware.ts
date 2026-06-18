// middleware.ts — runs on every matched request to keep the Supabase session fresh and
// enforce that only signed-in users can reach protected routes.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except Next.js internals, API routes (which guard themselves),
    // PWA assets, and static images.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
