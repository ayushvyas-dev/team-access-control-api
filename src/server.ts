import app from "./app.js";
import { config } from "./config/env.config.js";
import { emailWorker } from "./workers/email.worker.js";
import bullmqRedis from "./config/bullmqRedis.config.js";
import prisma from "./db/prisma.js";

const server = app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}/api/v1`);
});

// graceful shutdown logic
let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    console.log("Shutdown already in progress...");
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Starting graceful shutdown...`);

  // Force shutdown if graceful shutdown takes too long
  const shutdownTimeout = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing process exit.");
    process.exit(1);
  }, 30_000);

  try {
    // 1. Stop accepting new HTTP connections
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    console.log("HTTP server closed");

    // 2. Stop BullMQ worker
    // Waits for currently running jobs to finish
    await emailWorker.close();

    console.log("BullMQ worker closed");

    // 3. Close Redis connection
    await bullmqRedis.quit();

    console.log("BullMQ Redis connection closed");

    // 4. Disconnect Prisma
    await prisma.$disconnect();

    console.log("Prisma disconnected");

    clearTimeout(shutdownTimeout);

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    clearTimeout(shutdownTimeout);

    console.error("Error during graceful shutdown:", error);

    process.exit(1);
  }
};

// Handle Ctrl+C during local development
process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

// Handle termination signal from hosting platforms / Docker / Kubernetes
process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

// Handle unexpected synchronous errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);

  void gracefulShutdown("uncaughtException");
});

// Handle rejected promises that were not caught
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);

  void gracefulShutdown("unhandledRejection");
});
