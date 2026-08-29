export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailAdapter {
  send(options: EmailOptions): Promise<void>;
}

class ConsoleEmailAdapter implements EmailAdapter {
  async send(options: EmailOptions): Promise<void> {
    console.log("\n========== EMAIL ==========");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text ?? options.html}`);
    console.log("============================\n");
  }
}

class SmtpEmailAdapter implements EmailAdapter {
  async send(options: EmailOptions): Promise<void> {
    // SMTP implementation placeholder - uses nodemailer when configured
    console.log(`[SMTP] Sending to ${options.to}: ${options.subject}`);
  }
}

export function getEmailAdapter(): EmailAdapter {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return new SmtpEmailAdapter();
  }
  return new ConsoleEmailAdapter();
}

import { LGB_EMAIL_REQUEST_TO } from "@/lib/validations/lgb-email";

export async function sendLgbEmailNotification(
  request: {
    name: string;
    email: string;
    requestedAddress: string;
    backupAddress: string;
    forwardTo: string;
    businessName?: string;
  }
): Promise<void> {
  const email = getEmailAdapter();
  const destination = process.env.LGB_EMAIL_REQUEST_TO ?? LGB_EMAIL_REQUEST_TO;

  await email.send({
    to: destination,
    subject: `New LGB email request: ${request.requestedAddress}`,
    html: `
      <h2>New @LetsGoBuffalo.com Email Request</h2>
      <p><strong>Name:</strong> ${request.name}</p>
      <p><strong>Contact Email:</strong> ${request.email}</p>
      ${request.businessName ? `<p><strong>Business:</strong> ${request.businessName}</p>` : ""}
      <p><strong>Preferred Address:</strong> ${request.requestedAddress}</p>
      <p><strong>Backup Address:</strong> ${request.backupAddress}</p>
      <p><strong>Forward To:</strong> ${request.forwardTo}</p>
    `,
    text: `LGB email request from ${request.name} (${request.email}). Preferred: ${request.requestedAddress}. Backup: ${request.backupAddress}. Forward to: ${request.forwardTo}`,
  });
}

export async function sendLeadNotification(
  lead: { name: string; email: string; message: string },
  businessName?: string
): Promise<void> {
  const email = getEmailAdapter();
  await email.send({
    to: process.env.EMAIL_FROM ?? "admin@letsgobuffalo.com",
    subject: businessName
      ? `New enquiry for ${businessName}`
      : "New contact form submission",
    html: `
      <h2>New Lead</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      ${businessName ? `<p><strong>Business:</strong> ${businessName}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${lead.message}</p>
    `,
    text: `New lead from ${lead.name} (${lead.email}): ${lead.message}`,
  });
}

export async function sendListingStatusEmail(
  to: string,
  businessName: string,
  status: string,
  message?: string
): Promise<void> {
  const email = getEmailAdapter();
  await email.send({
    to,
    subject: `Listing Update: ${businessName}`,
    html: `
      <h2>Your listing "${businessName}" has been updated</h2>
      <p><strong>Status:</strong> ${status}</p>
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
      <p>Visit your dashboard for more details.</p>
    `,
  });
}
