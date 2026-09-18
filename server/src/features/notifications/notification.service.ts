/**
 * Notification Service
 *
 * - Saves every notification to MongoDB (in-app feed)
 * - Concurrently sends an email via Nodemailer (Gmail + App Password)
 * - Email failures are logged but never thrown — the lifecycle action completes
 *   regardless of email delivery status.
 *
 * Demo mode: NOTIFY_TEST_EMAIL env var routes ALL emails to one inbox so the
 * developer can verify every notification type without multiple Gmail accounts.
 */

import nodemailer from "nodemailer";
import { Notification } from "./notification.model.js";

// ── Mailer setup ──────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Email template ────────────────────────────────────────────────────────────

function buildEmailHtml(title: string, message: string, link?: string, type: string = "info"): string {
  const accent: Record<string, string> = {
    success: "#059669",
    warning: "#D97706",
    danger:  "#DC2626",
    info:    "#0284C7",
  };
  const color = accent[type] ?? accent.info;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header bar -->
        <tr><td style="background:${color};padding:20px 32px;">
          <p style="margin:0;color:#fff;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">
            🚨 Kerala Disaster Resource Platform
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0F172A;line-height:1.3;">${title}</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">${message}</p>
          ${link ? `
          <a href="http://localhost:5173${link}" style="display:inline-block;padding:12px 24px;background:${color};color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
            View Details →
          </a>` : ""}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
          <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.5;">
            This is an automated message from the Kerala Disaster Resource Coordination Platform.<br>
            Do not reply to this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Email resolution ──────────────────────────────────────────────────────────
// getRealEmail: returns the recipient's real email for DB storage.
// In production pass userEmail directly; fallback is the demo map.
// getSendTarget: applies NOTIFY_TEST_EMAIL override so all emails in dev
// route to a single test inbox regardless of the real address.

const DEMO_MAP: Record<string, string> = {
  "demo-citizen-001":   "citizen@demo.local",
  "demo-ngo-001":       "ngo@demo.local",
  "demo-volunteer-001": "volunteer@demo.local",
  "demo-admin-001":     "admin@demo.local",
};

function getRealEmail(userId: string, override?: string): string {
  return override ?? DEMO_MAP[userId] ?? `${userId}@demo.local`;
}

function getSendTarget(realEmail: string): string {
  return process.env.NOTIFY_TEST_EMAIL ?? realEmail;
}

// ── Public send API ───────────────────────────────────────────────────────────

export interface SendParams {
  userId:      string;
  /** Real email for the recipient — stored in DB and used for actual sending
   *  (overridden by NOTIFY_TEST_EMAIL in dev/test mode). */
  userEmail?:  string;
  title:       string;
  message:     string;
  type?:       "info" | "success" | "warning" | "danger";
  category?:   "request" | "assignment" | "system";
  requestId?:  string;
  link?:       string;
}

export const notificationService = {
  async send(params: SendParams): Promise<void> {
    const {
      userId, title, message,
      type = "info", category = "request",
      requestId, link,
    } = params;

    const realEmail = getRealEmail(userId, params.userEmail);
    const sendTo    = getSendTarget(realEmail);

    // 1. Send email (failure is non-fatal)
    let emailSent = false;
    try {
      await sendEmail(sendTo, title, message, link, type);
      emailSent = true;
    } catch (err) {
      console.error(`[Notify] Email failed for ${userId}:`, err);
    }

    // 2. Persist in-app notification
    try {
      await Notification.create({
        userId, userEmail: realEmail, title, message,
        type, category,
        ...(requestId && { requestId }),
        ...(link      && { link }),
        emailSent,
      });
    } catch (err) {
      console.error("[Notify] DB save failed:", err);
    }
  },

  /** Send to multiple users in parallel — each gets their own DB record */
  async sendMany(recipients: SendParams[]): Promise<void> {
    await Promise.allSettled(recipients.map(p => this.send(p)));
  },
};

async function sendEmail(
  to: string, subject: string, text: string, link?: string, type?: string
): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[Notify] SMTP not configured — skipping email");
    return;
  }
  await transporter.sendMail({
    from:    process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: `[Disaster Platform] ${subject}`,
    text,
    html:    buildEmailHtml(subject, text, link, type),
  });
}
