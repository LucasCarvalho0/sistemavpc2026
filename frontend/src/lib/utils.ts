import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Production, Employee, RankingEntry, HourlyData } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function getCurrentTime(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function getCurrentDate(): string {
  return new Date().toLocaleDateString('pt-BR')
}

export function isToday(date: string | Date): boolean {
  return new Date(date).toDateString() === new Date().toDateString()
}

export function buildRanking(
  productions: Production[],
  employees: Employee[]
): RankingEntry[] {
  const map: Record<number, number> = {}
  productions.forEach((p) => {
    map[p.funcionarioId] = (map[p.funcionarioId] || 0) + 1
  })

  return employees
    .filter((e) => e.ativo)
    .map((emp) => ({ employee: emp, count: map[emp.id] || 0, position: 0 }))
    .sort((a, b) => b.count - a.count)
    .map((entry, i) => ({ ...entry, position: i + 1 }))
}

export function buildHourlyData(productions: Production[]): HourlyData[] {
  const hours: Record<number, number> = {}
  productions.forEach((p) => {
    const h = new Date(p.createdAt).getHours()
    hours[h] = (hours[h] || 0) + 1
  })

  const now = new Date().getHours()
  const startH = 16
  const data: HourlyData[] = []
  let acc = 0

  const end = now < 4 ? now + 24 : now
  for (let h = startH; h <= end; h++) {
    const realH = h % 24
    const c = hours[realH] || 0
    acc += c
    data.push({ hora: `${String(realH).padStart(2, '0')}:00`, producao: c, acumulado: acc })
  }

  return data
}

export function buildDailyData(productions: Production[]): { date: string, count: number }[] {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toLocaleDateString('pt-BR').split('/').slice(0, 2).join('/')
  }).reverse()

  const counts: Record<string, number> = {}
  productions.forEach(p => {
    const d = new Date(p.createdAt).toLocaleDateString('pt-BR').split('/').slice(0, 2).join('/')
    counts[d] = (counts[d] || 0) + 1
  })

  return last7Days.map(date => ({ date, count: counts[date] || 0 }))
}

export function buildMonthlyData(productions: Production[]): { month: string, count: number }[] {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return months[d.getMonth()]
  }).reverse()

  const counts: Record<string, number> = {}
  productions.forEach(p => {
    const m = months[new Date(p.createdAt).getMonth()]
    counts[m] = (counts[m] || 0) + 1
  })

  return last6Months.map(month => ({ month, count: counts[month] || 0 }))
}

export function validateVin(vin: string): string | null {
  if (!vin) return 'VIN obrigatório'
  if (vin.length !== 17) return `VIN deve ter 17 caracteres (${vin.length}/17)`
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return 'VIN contém caracteres inválidos'
  return null
}

export function exportToCSV(productions: Production[], employees: Employee[]) {
  const rows = [['VIN', 'Funcionário', 'Versão', 'Data', 'Hora']]
  productions.forEach((p) => {
    const emp = employees.find((e) => e.id === p.funcionarioId)
    rows.push([
      p.vin,
      emp?.nome || '—',
      p.versaoCarro,
      formatDate(p.createdAt),
      formatTime(p.createdAt),
    ])
  })

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `producao_${getCurrentDate().replace(/\//g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
