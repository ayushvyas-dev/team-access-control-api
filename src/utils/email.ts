import { brevo} from "../config/brevo.config.js";
import { config } from "../config/env.config.js";
import { AppError } from "./appError.js";
import  logger  from "../config/logger.config.js";

export async function sendVerificationEmail(
  email: string,
  otp: string,
): Promise<void> {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Team Access Control",
        email: config.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email,
        },
      ],
      subject: "Verify your email",
      textContent: `Your verification OTP is ${otp}. It expires in 10 minutes.`,
      htmlContent: `
        <h2>Verify your email</h2>
        <p>Your verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });
  } catch (error) {
    logger.error(
      { err: error },
      "Failed to send verification email",
    );

    throw new AppError("Failed to send verification email", 500);
  }
}

export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  invitationLink: string,
): Promise<void> {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
     sender: {
    name: "Team Access Control",
    email: config.BREVO_SENDER_EMAIL,
  },
  to: [
    {
      email,
    },
  ],
  subject: "You have been invited to join an organization",
  htmlContent: `
    <h2>You have been invited to join ${organizationName}</h2>
    <p>Click the link below to accept the invitation:</p>
    <a href="${invitationLink}" target="_blank">
      Accept Invitation
    </a>
  `,
    });
  } catch (error) {
    logger.error(
      { err: error },
      "Failed to send invitation email",
    );
    throw new AppError("Failed to send invitation email", 500);
  }
}
