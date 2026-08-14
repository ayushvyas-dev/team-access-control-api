import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../config/rateLimitRedis.config.js";

export const organizationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "15 m"),
  prefix: "ratelimit:organization",
});
