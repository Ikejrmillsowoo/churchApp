// lib/email.ts — server-only Resend client and HTML email builder for mass messages.
import "server-only";
import { Resend } from "resend";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Church App <onboarding@resend.dev>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Render plain-text body (paragraphs separated by blank lines) into simple, safe HTML
// with an unsubscribe footer.
export function buildEmailHtml(body: string, unsubscribeUrl: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;line-height:1.5;">${escapeHtml(block).replace(
          /\n/g,
          "<br />",
        )}</p>`,
    )
    .join("");

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;color:#18181b;">
${paragraphs}
<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
<p style="font-size:12px;color:#71717a;">
You're receiving this because you're a member of our church.
<a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a>.
</p>
</div>`;
}
