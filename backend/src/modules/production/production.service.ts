import {
  Injectable, ConflictException, NotFoundException, BadRequestException
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProductionDto } from './dto/create-production.dto'
import { HistoryFiltersDto } from './dto/history-filters.dto'

const DAILY_GOAL = 100

@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) { }

  private getTodayRange() {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  async getAll(filters: HistoryFiltersDto) {
    const { vin, funcionarioId, page = 1, limit = 50 } = filters
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (vin) where.vin = { contains: vin.toUpperCase() }
    if (funcionarioId) where.funcionarioId = funcionarioId

    const [data, total] = await Promise.all([
      this.prisma.producao.findMany({
        where,
        include: { funcionario: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.producao.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async getToday() {
    const { start, end } = this.getTodayRange()
    return this.prisma.producao.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { funcionario: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getRanking(days = 1) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    if (days > 1) {
      start.setDate(start.getDate() - (days - 1))
    }
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const raw = await this.prisma.producao.groupBy({
      by: ['funcionarioId'],
      where: { createdAt: { gte: start, lte: end } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })

    const employees = await this.prisma.funcionario.findMany({
      where: { ativo: true },
    })

    return employees
      .map((emp) => ({
        employee: emp,
        count: raw.find((r) => r.funcionarioId === emp.id)?._count.id || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .map((entry, i) => ({ ...entry, position: i + 1 }))
  }

  async getStats() {
    const { start, end } = this.getTodayRange()

    const [todayTotal, activeEmployees] = await Promise.all([
      this.prisma.producao.count({ where: { createdAt: { gte: start, lte: end } } }),
      this.prisma.funcionario.count({ where: { ativo: true } }),
    ])

    const lastHourStart = new Date()
    lastHourStart.setMinutes(0, 0, 0)
    const lastHour = await this.prisma.producao.count({
      where: { createdAt: { gte: lastHourStart } },
    })

    return {
      totalToday: todayTotal,
      goal: DAILY_GOAL,
      percentage: Math.min((todayTotal / DAILY_GOAL) * 100, 100),
      lastHour,
      activeEmployees,
    }
  }

  async checkVin(vin: string) {
    if (vin.length !== 17) throw new BadRequestException('VIN deve ter 17 caracteres')

    const { start, end } = this.getTodayRange()
    const existing = await this.prisma.producao.findFirst({
      where: { vin: vin.toUpperCase(), createdAt: { gte: start, lte: end } },
    })

    return { available: !existing, vin: vin.toUpperCase() }
  }

  async create(dto: CreateProductionDto) {
    const vin = dto.vin.toUpperCase()

    // Validate employee exists and is active
    const employee = await this.prisma.funcionario.findFirst({
      where: { id: dto.funcionarioId, ativo: true },
    })
    if (!employee) throw new NotFoundException('Funcionário não encontrado ou inativo')

    // Check VIN duplicate today
    const { start, end } = this.getTodayRange()
    const existing = await this.prisma.producao.findFirst({
      where: { vin, createdAt: { gte: start, lte: end } },
    })
    if (existing) throw new ConflictException(`VIN ${vin} já registrado hoje`)

    const production = await this.prisma.producao.create({
      data: {
        vin,
        versaoCarro: dto.versaoCarro,
        funcionarioId: dto.funcionarioId,
      },
      include: { funcionario: true },
    })

    // Check if goal was reached
    const todayTotal = await this.prisma.producao.count({
      where: { createdAt: { gte: start, lte: end } },
    })

    return { production, goalReached: todayTotal === DAILY_GOAL }
  }

  async getHourlyData() {
    const { start, end } = this.getTodayRange()

    const productions = await this.prisma.producao.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    })

    const hours: Record<number, number> = {}
    productions.forEach((p) => {
      const h = p.createdAt.getHours()
      hours[h] = (hours[h] || 0) + 1
    })

    const data = []
    let acc = 0
    for (let h = 16; h <= 23; h++) {
      const c = hours[h] || 0
      acc += c
      data.push({ hora: `${String(h).padStart(2, '0')}:00`, producao: c, acumulado: acc })
    }
    for (let h = 0; h <= 4; h++) {
      const c = hours[h] || 0
      acc += c
      data.push({ hora: `${String(h).padStart(2, '0')}:00`, producao: c, acumulado: acc })
    }

    return data
  }

  async getQuarterEvolution() {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)
    startDate.setHours(0, 0, 0, 0)

    const raw = await this.prisma.producao.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    })

    const grouped = raw.reduce((acc, p) => {
      const date = p.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}
