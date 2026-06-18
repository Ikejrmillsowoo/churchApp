// app/(app)/admin/layout.tsx — gate for all /admin routes: only admins may enter; everyone
// else is redirected home. Backs up the hidden admin nav tab with a server-side check.
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/");
  return <>{children}</>;
}
