import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting...");
  try {
    const count = await prisma.user.count();
    console.log("Connection successful! User count:", count);
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
