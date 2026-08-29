import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { LGB_EMAIL_REQUEST_TO } from "@/lib/validations/lgb-email";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bcc?: string;
}

export interface EmailAdapter {
  send(options: EmailOptions): Promise<void>;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? "Listings@letsgobuffalo.com";
}

class ConsoleEmailAdapter implements EmailAdapter {
  async send(options: EmailOptions): Promise<void> {
    console.log("\n========== EMAIL ==========");
    console.log(`From: ${getFromAddress()}`);
    console.log(`To: ${options.to}`);
    if (options.bcc) console.log(`Bcc: ${options.bcc}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text ?? options.html}`);
    console.log("============================\n");
  }
}

let smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return smtpTransporter;
}

class SmtpEmailAdapter implements EmailAdapter {
  async send(options: EmailOptions): Promise<void> {
    const transporter = getSmtpTransporter();
    await transporter.sendMail({
      from: getFromAddress(),
      to: options.to,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}

export function getEmailAdapter(): EmailAdapter {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return new SmtpEmailAdapter();
  }
  return new ConsoleEmailAdapter();
}

export async function sendLgbEmailNotification(request: {
  name: string;
  email: string;
  requestedAddress: string;
  backupAddress: string;
  forwardTo: string;
  businessName?: string;
}): Promise<void> {
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
    to: process.env.LEADS_EMAIL_TO ?? getFromAddress(),
    subject: businessName ? `New enquiry for ${businessName}` : "New contact form submission",
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
    text: `Your listing "${businessName}" status is now ${status}.${message ? ` ${message}` : ""}`,
  });
}

export async function sendPaymentConfirmationEmail(options: {
  to: string;
  customerName?: string | null;
  title: string;
  description: string;
  amount: number;
  reference?: string;
}): Promise<void> {
  const email = getEmailAdapter();
  const formattedAmount = `$${options.amount.toFixed(2)}`;
  const listingsInbox = process.env.PAYMENTS_EMAIL_TO ?? getFromAddress();

  await email.send({
    to: options.to,
    bcc: listingsInbox !== options.to ? listingsInbox : undefined,
    subject: `Payment confirmation — ${options.title}`,
    html: `
      <h2>Thank you for your payment</h2>
      <p>Hi ${options.customerName ?? "there"},</p>
      <p>${options.description}</p>
      <p><strong>Amount:</strong> ${formattedAmount}</p>
      ${options.reference ? `<p><strong>Reference:</strong> ${options.reference}</p>` : ""}
      <p>— Let's Go Buffalo</p>
    `,
    text: `Payment confirmation: ${options.title}. Amount: ${formattedAmount}. ${options.description}`,
  });
}

export async function sendSubscriptionConfirmationEmail(options: {
  to: string;
  customerName?: string | null;
  planName: string;
  amount: number;
  interval: string;
  businessName?: string | null;
}): Promise<void> {
  const intervalLabel = options.interval === "YEARLY" ? "year" : "month";
  await sendPaymentConfirmationEmail({
    to: options.to,
    customerName: options.customerName,
    title: `${options.planName} subscription`,
    description: `Your ${options.planName} subscription is active${options.businessName ? ` for ${options.businessName}` : ""}. You will be billed $${options.amount.toFixed(2)} per ${intervalLabel}.`,
    amount: options.amount,
  });
}

export async function sendWalletTopUpConfirmationEmail(options: {
  to: string;
  customerName?: string | null;
  amount: number;
}): Promise<void> {
  await sendPaymentConfirmationEmail({
    to: options.to,
    customerName: options.customerName,
    title: "Advertising wallet top-up",
    description: "Your advertising wallet has been credited and is ready to use for sponsored campaigns.",
    amount: options.amount,
  });
}
