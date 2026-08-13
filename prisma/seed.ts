import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: { email: "demo@example.com", name: "Demo User" },
  });

  const trip = await prisma.trip.create({
    data: {
      name: "Japan Trip",
      destination: "Tokyo, Japan",
      startDate: new Date("2026-10-10"),
      endDate: new Date("2026-10-20"),
      homeCurrency: "USD",
      budgetAmount: 3000,
      createdById: user.id,
      members: {
        create: { userId: user.id, role: "OWNER", status: "ACCEPTED", joinedAt: new Date() },
      },
      itineraryItems: {
        create: [
          {
            date: new Date("2026-10-10"),
            title: "Flight to Tokyo",
            category: "FLIGHT",
            createdById: user.id,
          },
          {
            date: new Date("2026-10-11"),
            title: "Check in to hotel",
            category: "LODGING",
            createdById: user.id,
          },
        ],
      },
      expenses: {
        create: [
          {
            paidById: user.id,
            amount: 850,
            currency: "USD",
            amountInHomeCurrency: 850,
            exchangeRate: 1,
            category: "FLIGHTS",
            description: "Round-trip flight",
            date: new Date("2026-10-10"),
          },
        ],
      },
    },
  });

  console.log({ user, trip });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
