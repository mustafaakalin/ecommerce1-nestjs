import { PrismaClient } from '@prisma/client'
import { withAccelerate } from "@prisma/extension-accelerate"

const prisma = new PrismaClient().$extends(withAccelerate())


async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'developer' },
      { name: 'shopkeeper' },
      { name: 'staff' },
      { name: 'customer' },
    ],
  });
}


main().then(() => prisma.$disconnect());

