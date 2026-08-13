import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../config/redis.config.js";

export const genericLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "15 m"),
  prefix: "ratelimit:generic",
});
