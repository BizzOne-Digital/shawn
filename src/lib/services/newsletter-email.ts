import { getEmailAdapter } from "@/lib/services/email";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function plainTextToHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

export async function sendNewsletterEmail(options: {
  to: string;
  subject: string;
  body: string;
  siteUrl: string;
}): Promise<void> {
  const email = getEmailAdapter();
  const htmlBody = plainTextToHtml(options.body);

  await email.send({
    to: options.to,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a2744;">
        <div style="border-bottom: 3px solid #c8102e; padding-bottom: 12px; margin-bottom: 20px;">
          <strong style="font-size: 18px;">Let's Go Buffalo</strong>
        </div>
        <div style="line-height: 1.6; font-size: 15px;">${htmlBody}</div>
        <hr style="margin: 28px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #666;">
          You received this because you subscribed to updates from Let's Go Buffalo.
          <a href="${options.siteUrl}/dashboard/settings" style="color: #c8102e;">Manage preferences</a>
        </p>
      </div>
    `,
    text: `${options.body}\n\n—\nLet's Go Buffalo\nManage preferences: ${options.siteUrl}/dashboard/settings`,
  });
}
