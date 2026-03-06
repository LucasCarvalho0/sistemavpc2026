import { useEffect } from 'react'
import { useAppStore } from './store/useAppStore'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { ToastContainer } from './components/ToastContainer'
import { CelebrationOverlay } from './components/CelebrationOverlay'
import { Dashboard } from './pages/Dashboard'
import { Register } from './pages/Register'
import { Ranking } from './pages/Ranking'
import { History } from './pages/History'
import { Employees } from './pages/Employees'
import { Settings } from './pages/Settings'
import { useSocket } from './hooks/useSocket'
import { employeesApi, productionApi } from './lib/api'

// Seed data for development / offline mode
const SEED_EMPLOYEES = [
  { id: 1, nome: 'Augusto Silva', ativo: true, createdAt: new Date().toISOString() },
  { id: 2, nome: 'Breno Costa', ativo: true, createdAt: new Date().toISOString() },
  { id: 3, nome: 'Carlos Mendes', ativo: true, createdAt: new Date().toISOString() },
  { id: 4, nome: 'Diego Rocha', ativo: true, createdAt: new Date().toISOString() },
  { id: 5, nome: 'Eduardo Lima', ativo: true, createdAt: new Date().toISOString() },
]

const now = new Date()
const SEED_PRODUCTIONS = [
  { id: 1, vin: '1HGCM82633A123456', funcionarioId: 1, versaoCarro: 'L3 (Exclusive)' as const, createdAt: new Date(now.getTime() - 3600000 * 3).toISOString() },
  { id: 2, vin: '2HGCM82633B234567', funcionarioId: 2, versaoCarro: 'L2 (Advanced)' as const, createdAt: new Date(now.getTime() - 3600000 * 2.5).toISOString() },
  { id: 3, vin: '3HGCM82633C345678', funcionarioId: 3, versaoCarro: 'L3 (Exclusive)' as const, createdAt: new Date(now.getTime() - 3600000 * 2).toISOString() },
  { id: 4, vin: '4HGCM82633D456789', funcionarioId: 1, versaoCarro: 'L2 (Advanced)' as const, createdAt: new Date(now.getTime() - 3600000 * 1.5).toISOString() },
  { id: 5, vin: '5HGCM82633E567890', funcionarioId: 4, versaoCarro: 'L3 (Exclusive)' as const, createdAt: new Date(now.getTime() - 3600000).toISOString() },
  { id: 6, vin: '6HGCM82633F678901', funcionarioId: 2, versaoCarro: 'L3 (Exclusive)' as const, createdAt: new Date(now.getTime() - 1800000).toISOString() },
  { id: 7, vin: '7HGCM82633G789012', funcionarioId: 5, versaoCarro: 'L2 (Advanced)' as const, createdAt: new Date(now.getTime() - 900000).toISOString() },
]

export default function App() {
  const { currentPage, setEmployees, setProductions, setQuarterRanking, setQuarterEvolution } = useAppStore()

  // Connect WebSocket
  useSocket()

  // Load data from API (falls back to seed data)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [empsRes, prodsRes, quarterRes, evolutionRes] = await Promise.all([
          employeesApi.getAll(),
          productionApi.getAll(),
          productionApi.getQuarterRanking(),
          productionApi.getQuarterEvolution(),
        ])
        setEmployees(empsRes.data)
        setQuarterRanking(quarterRes.data)
        setQuarterEvolution(evolutionRes.data)
        // Production API returns { data: [...], total: ... }
        const prods = prodsRes.data
        setProductions(Array.isArray(prods) ? prods : (prods?.data || []))
      } catch (error) {
        // Offline / no backend: use seed data
        setEmployees(SEED_EMPLOYEES)
        setProductions(SEED_PRODUCTIONS)
      }
    }
    loadData()
  }, [setEmployees, setProductions, setQuarterRanking, setQuarterEvolution])

  const pages: Record<string, React.ReactElement> = {
    dashboard: <Dashboard />,
    register: <Register />,
    ranking: <Ranking />,
    history: <History />,
    employees: <Employees />,
    settings: <Settings />,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CelebrationOverlay />
      <Sidebar />

      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        <Topbar />
        <main className="flex-1 p-5 md:p-6 max-w-[1200px] mx-auto w-full animate-[fadeIn_0.3s_ease]">
          {pages[currentPage]}
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
