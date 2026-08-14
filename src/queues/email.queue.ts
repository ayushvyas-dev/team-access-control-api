import { Queue } from "bullmq";
import bullmqRedis from "../config/bullmqRedis.config.js";

export interface VerificationEmailJob {
  email: string;
  otp: string;
}

export const emailQueue = new Queue<VerificationEmailJob>("email", {
  connection: bullmqRedis,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      count: 100,
    },

    removeOnFail: {
      count: 500,
    },
  },
});
