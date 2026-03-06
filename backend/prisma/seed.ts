import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create employees
  const employees = await Promise.all([
    prisma.funcionario.upsert({
      where: { id: 1 },
      update: { nome: 'Augusto' },
      create: { id: 1, nome: 'Augusto', ativo: true },
    }),
    prisma.funcionario.upsert({
      where: { id: 2 },
      update: { nome: 'Jonathan' },
      create: { id: 2, nome: 'Jonathan', ativo: true },
    }),
    prisma.funcionario.upsert({
      where: { id: 3 },
      update: { nome: 'Breno' },
      create: { id: 3, nome: 'Breno', ativo: true },
    }),
    prisma.funcionario.upsert({
      where: { id: 4 },
      update: { nome: 'Valber' },
      create: { id: 4, nome: 'Valber', ativo: true },
    }),
    prisma.funcionario.upsert({
      where: { id: 5 },
      update: { nome: 'Fabiana' },
      create: { id: 5, nome: 'Fabiana', ativo: true },
    }),
  ])

  console.log(`✅ Created ${employees.length} employees`)

  /* 
  // Sample productions for today
  const sampleVins = [
    '1HGCM82633A123456', '2HGCM82633B234567', '3HGCM82633C345678',
    '4HGCM82633D456789', '5HGCM82633E567890',
  ]

  for (let i = 0; i < sampleVins.length; i++) {
    await prisma.producao.upsert({
      where: { vin_createdAt: { vin: sampleVins[i], createdAt: new Date() } },
      update: {},
      create: {
        vin: sampleVins[i],
        versaoCarro: i % 2 === 0 ? 'L3 (Exclusive)' : 'L2 (Advanced)',
        funcionarioId: employees[i % employees.length].id,
      },
    }).catch(() => { }) // ignore unique constraint errors
  }
  console.log('✅ Sample productions created')
  */
  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
