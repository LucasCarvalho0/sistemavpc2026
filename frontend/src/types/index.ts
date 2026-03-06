export interface Employee {
  id: number
  nome: string
  ativo: boolean
  createdAt: string
}

export interface Production {
  id: number
  vin: string
  versaoCarro: CarVersion
  funcionarioId: number
  funcionario?: Employee
  createdAt: string
}

export type CarVersion = 'L3 (Exclusive)' | 'L2 (Advanced)'

export type Page =
  | 'dashboard'
  | 'register'
  | 'ranking'
  | 'history'
  | 'employees'
  | 'settings'

export interface RankingEntry {
  employee: Employee
  count: number
  position: number
}

export interface DashboardStats {
  totalToday: number
  goal: number
  percentage: number
  lastHour: number
  activeEmployees: number
}

export interface HourlyData {
  hora: string
  producao: number
  acumulado: number
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export interface ShiftConfig {
  start: string
  end: string
  overtime: string
}

export interface RegisterFormData {
  funcionarioId: number
  versaoCarro: CarVersion
  vin: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface HistoryFilters {
  vin?: string
  funcionarioId?: number
  startDate?: string
  endDate?: string
  page: number
  limit: number
}
