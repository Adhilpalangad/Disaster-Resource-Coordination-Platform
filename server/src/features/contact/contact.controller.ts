import type { Request, Response } from "express";
import nodemailer from "nodemailer";

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    // Validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
      return;
    }

    if (message.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long.",
      });
      return;
    }

    // Deliver email via Nodemailer if SMTP is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const targetEmail = process.env.NOTIFY_TEST_EMAIL ?? process.env.SMTP_USER;
        const msgSubject = subject?.trim() || "New Support Inquiry";

        await transporter.sendMail({
          from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
          to: targetEmail,
          subject: `[Contact Form] ${msgSubject}`,
          replyTo: email,
          text: `Contact Inquiry from: ${name} <${email}>\nSubject: ${msgSubject}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
              <h2 style="color: #0F172A;">📩 New Support Inquiry</h2>
              <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
              <p><strong>Subject:</strong> ${msgSubject}</p>
              <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 16px 0;" />
              <h3 style="color: #475569;">Message:</h3>
              <p style="white-space: pre-wrap; background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0;">${message}</p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("[Contact] Email delivery failed:", mailErr);
      }
    } else {
      console.log(`[Contact] SMTP unconfigured. Message from ${name} (${email}): ${message}`);
    }

    res.status(200).json({
      success: true,
      message: "Thank you for reaching out! Our coordination team has received your message and will respond promptly.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process contact submission",
      error: String(error),
    });
  }
};
