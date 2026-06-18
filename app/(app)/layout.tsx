// app/(app)/layout.tsx — shell for signed-in screens: renders page content above a fixed
// bottom navigation. The admin tab is shown only to admins. Route protection is enforced
// by middleware; this also guarantees a profile exists before rendering.
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col pb-20">{children}</div>
      <BottomNav isAdmin={profile.role === "admin"} />
    </div>
  );
}
