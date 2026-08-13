import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../config/redis.config.js";

export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  prefix: "ratelimit:auth",
});
