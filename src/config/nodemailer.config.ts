import nodemailer from "nodemailer";
import { config } from "./env.config.js";

export const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
});
