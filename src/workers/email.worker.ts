import { Worker } from "bullmq";
import bullmqRedis from "../config/bullmqRedis.config.js";
import { VerificationEmailJob } from "../queues/email.queue.js";
import { sendVerificationEmail } from "../utils/email.js";

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
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error);
});

emailWorker.on("error", (error) => {
  console.error("Email worker error:", error);
});
