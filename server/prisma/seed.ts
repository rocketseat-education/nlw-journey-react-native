import { prisma } from '@/lib/prisma'

async function seed() {}

seed().then(() => {
  prisma.$disconnect()
  console.log('Database seeded!')
})
