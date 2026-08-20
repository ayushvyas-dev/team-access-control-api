import { emailTransporter } from "../config/nodemailer.config.js";
import { config } from "../config/env.config.js";
import { AppError } from "./appError.js";

export async function sendVerificationEmail(
  email: string,
  otp: string,
): Promise<void> {
  try {
    await emailTransporter.sendMail({
      from: `"Team Access Control" <${config.SMTP_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Your verification OTP is ${otp}. It expires in 10 minutes.`,
      html: `
      <h2>Verify your email</h2>
      <p>Your verification OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,
    });
  } catch (error) {
    throw new AppError("Failed to send verification email", 500);
  }
}

export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  invitationLink: string,
): Promise<void> {
  try {
    await emailTransporter.sendMail({
      from: `"Team Access Control" <${config.SMTP_USER}>`,
      to: email,
      subject: "You have been invited to join an organization",
      html: `
      <h2>You have been invited to join ${organizationName}</h2>
      <p>Click the link below to accept the invitation:</p>
      <a href="${invitationLink}" target="_blank">Accept Invitation</a>
    `,
    });
  } catch (error) {
    throw new AppError("Failed to send invitation email", 500);
  }
}
