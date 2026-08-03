import { resend } from "../config/resend.config.js";

export async function sendVerificationEmail(
  email: string,
  otp: string,
): Promise<void> {
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  invitationLink: string,
): Promise<void> {
  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "You have been invited to join an organization",
    html: `
      <h2>You have been invited to join ${organizationName}</h2>
      <p>Click the link below to accept the invitation:</p>
      <a href="${invitationLink}" target="_blank">Accept Invitation</a>
    `,
  });

  if (error) {
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
}
