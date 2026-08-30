import nodemailer from "nodemailer";
import { config } from "./env.config.js";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

export const emailTransporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port:587,
  secure: false,
  family: 4,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD,
  },
} as nodemailer.TransportOptions);
