import { execa } from "execa";

export default async function globalSetup() {
  await execa("npx", ["prisma", "db", "push"], {
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
    stdio: "inherit",
  });
}
