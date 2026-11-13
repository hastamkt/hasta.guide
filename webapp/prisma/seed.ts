import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.coupon.upsert({
    where: { code: "BLACK2026" },
    update: {},
    create: { code: "BLACK2026", percentOff: 70, commissionPercent: 0 },
  });
  await prisma.coupon.upsert({
    where: { code: "CLIENTEVIP" },
    update: {},
    create: { code: "CLIENTEVIP", percentOff: 100, commissionPercent: 0, freeNoCard: true },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
