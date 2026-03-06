import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Limpando histórico de produção...')
    const result = await prisma.producao.deleteMany()
    console.log(`✅ Foram removidos ${result.count} registros.`)
    console.log('✨ Banco de dados pronto para nova produção.')
}

main()
    .catch((e) => {
        console.error('❌ Erro ao limpar banco:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
