import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Erro de conexão com o servidor'
    return Promise.reject(new Error(msg))
  }
)

// ─── Employees ───────────────────────────────────────────────────────────────
export const employeesApi = {
  getAll: () => api.get('/employees'),
  create: (data: { nome: string }) => api.post('/employees', data),
  update: (id: number, data: { nome?: string; ativo?: boolean }) =>
    api.patch(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
}

// ─── Production ──────────────────────────────────────────────────────────────
export const productionApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/production', { params }),
  getToday: () => api.get('/production/today'),
  getRanking: () => api.get('/production/ranking'),
  getQuarterRanking: () => api.get('/production/ranking/quarter'),
  getQuarterEvolution: () => api.get('/production/evolution/quarter'),
  getStats: () => api.get('/production/stats'),
  create: (data: { vin: string; versaoCarro: string; funcionarioId: number }) =>
    api.post('/production', data),
  checkVin: (vin: string) => api.get(`/production/check-vin/${vin}`),
}
