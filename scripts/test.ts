import { config } from "../src/config/env.config";
import { execa } from "execa";

async function main() {
  const testDbUrl = config.TEST_DATABASE_URL;

  if (!testDbUrl) {
    throw new Error("TEST_DATABASE_URL is not defined");
  }

  const testEnv = {
    ...process.env,
    DATABASE_URL: testDbUrl,
    NODE_ENV: "test",
  };

  console.log("Resetting test database...");

  await execa("npx", ["prisma", "migrate", "reset", "--force"], {
    env: testEnv,
    stdio: "inherit",
  });

  console.log("Running tests...");

  await execa("npx", ["vitest", "run"], {
    env: testEnv,
    stdio: "inherit",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
