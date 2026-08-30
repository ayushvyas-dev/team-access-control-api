import { BrevoClient } from "@getbrevo/brevo";
import { config } from "./env.config.js";

export const brevo = new BrevoClient({
  apiKey: config.BREVO_API_KEY,
});

