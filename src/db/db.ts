import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaNeon({ connectionString });

const prisma = new PrismaClient({
  adapter,
  // just to see queri
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});
// to see query time remove this later
prisma.$on("query", (e) => {
  console.log("━━━━━━━━━━━━━━━━━━━━");
  console.log("Query:", e.query);
  console.log("Duration:", e.duration, "ms");
  console.log("━━━━━━━━━━━━━━━━━━━━");
});

export default prisma;
