import { Worker } from "bullmq";
import bullmqRedis from "../config/bullmqRedis.config.js";
import { VerificationEmailJob } from "../queues/email.queue.js";
import { sendVerificationEmail } from "../utils/email.js";
import logger from "../config/logger.config.js";

export const emailWorker = new Worker<VerificationEmailJob>(
  "email",
  async (job) => {
    switch (job.name) {
      case "send-verification-email":
        await sendVerificationEmail(job.data.email, job.data.otp);
        break;

      default:
        throw new Error(`Unknown email job: ${job.name}`);
    }
  },
  {
    connection: bullmqRedis,
  },
);

emailWorker.on("completed", (job) => {
   logger.info(
    { jobId: job.id },
    "Email job completed",
  );
});

emailWorker.on("failed", (job, error) => {
  logger.error(
    { jobId: job?.id, err: error },
    "Email job failed",
  );
});

emailWorker.on("error", (error) => {
  logger.error(
    { err: error },
    "Email worker error",
  );
});
