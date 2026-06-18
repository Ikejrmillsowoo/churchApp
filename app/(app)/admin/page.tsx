// app/(app)/admin/page.tsx — admin home placeholder (approvals/editors arrive in later
// phases). Guarded so only admins can view it; members are redirected home.
import { redirect } from "next/navigation";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { isAdmin } from "@/lib/auth";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/");

  return (
    <PlaceholderScreen
      title="Admin"
      description="Approve members, manage events, and compose messages. Tools arrive in upcoming phases."
    />
  );
}
