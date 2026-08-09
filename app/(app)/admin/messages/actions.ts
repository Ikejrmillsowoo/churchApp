// app/(app)/admin/messages/actions.ts — admin action to send a mass email via Resend to
// opted-in members of the chosen audience, with a per-recipient unsubscribe link, then log
// the send in the messages table. Reports how many recipients were found and surfaces the
// first send/query error so failures are visible instead of silently counting as 0.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { buildEmailHtml, EMAIL_FROM, getResend } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Recipient = { email: string | null; unsubscribe_token: string };

export async function sendMessage(formData: FormData) {
  if (!(await isAdmin())) redirect("/");

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const audience = String(formData.get("audience") ?? "");

  if (!subject || !body || (audience !== "approved" && audience !== "pending")) {
    redirect("/admin/messages?error=Subject%2C+body%2C+and+audience+are+required");
  }
  if (!process.env.RESEND_API_KEY) {
    redirect(
      "/admin/messages?error=" +
        encodeURIComponent("Email is not configured (RESEND_API_KEY missing)."),
    );
  }

  const admin = createAdminClient();
  const { data, error: queryError } = await admin
    .from("profiles")
    .select("email, unsubscribe_token")
    .eq("status", audience)
    .eq("email_opt_in", true)
    .not("email", "is", null);

  if (queryError) {
    redirect(
      "/admin/messages?error=" +
        encodeURIComponent(`Recipient lookup failed: ${queryError.message}`),
    );
  }
  const recipients = (data ?? []) as Recipient[];

  const resend = getResend();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const results = await Promise.all(
    recipients.map(async (recipient) => {
      if (!recipient.email) return { ok: false, error: "missing email" };
      const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${recipient.unsubscribe_token}`;
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: recipient.email,
        subject,
        html: buildEmailHtml(body, unsubscribeUrl),
        text: `${body}\n\nUnsubscribe: ${unsubscribeUrl}`,
      });
      return { ok: !error, error: error?.message ?? null };
    }),
  );
  const sent = results.filter((r) => r.ok).length;
  const firstError = results.find((r) => !r.ok && r.error)?.error ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await admin.from("messages").insert({
    subject,
    body,
    audience,
    sent_by: user?.id ?? null,
    recipient_count: sent,
  });

  revalidatePath("/admin/messages");
  const params = new URLSearchParams({
    sent: String(sent),
    found: String(recipients.length),
  });
  if (firstError) params.set("err", firstError);
  redirect(`/admin/messages?${params.toString()}`);
}
