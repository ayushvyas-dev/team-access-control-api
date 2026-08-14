import { Redis } from "ioredis";
import { config } from "./env.config.js";

const bullmqRedis = new Redis(config.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: null,
});

export default bullmqRedis;
