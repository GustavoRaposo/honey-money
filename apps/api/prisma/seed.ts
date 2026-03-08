import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

const statuses = [
  { code: 0, name: 'Backlog' },
  { code: 1, name: 'To Do' },
  { code: 2, name: 'Doing' },
  { code: 3, name: 'Test' },
  { code: 4, name: 'Done' },
  { code: 5, name: 'Canceled' },
];

async function main(): Promise<void> {
  for (const status of statuses) {
    await prisma.taskStatus.upsert({
      where: { code: status.code },
      update: { name: status.name },
      create: status,
    });
    console.log(`[seed] TaskStatus ${status.code} - ${status.name}: ok`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
