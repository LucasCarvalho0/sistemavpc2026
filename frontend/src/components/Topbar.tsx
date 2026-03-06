import { Menu } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { getCurrentDate, getCurrentTime } from '../lib/utils'
import { useState, useEffect } from 'react'

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  register: 'Registrar Montagem',
  ranking: 'Ranking do Dia',
  history: 'Histórico de Produção',
  employees: 'Gestão de Funcionários',
  settings: 'Configurações',
}

export function Topbar() {
  const { currentPage, setSidebarOpen, isConnected } = useAppStore()
  const [time, setTime] = useState(getCurrentTime())

  useEffect(() => {
    const id = setInterval(() => setTime(getCurrentTime()), 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="h-15 bg-[#0d0f12] border-b border-border flex items-center px-5 gap-4 sticky top-0 z-20">
      <button
        className="lg:hidden text-muted hover:text-foreground p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={22} />
      </button>

      <div className="flex-1">
        <h1 className="font-display text-lg tracking-widest text-foreground">
          {PAGE_LABELS[currentPage] || ''}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400'
            }`}
          />
          <span className="text-xs text-muted font-sans hidden sm:block">
            {isConnected ? 'AO VIVO' : 'OFFLINE'}
          </span>
        </div>
        <div className="text-xs text-muted font-mono hidden sm:block">
          {time} · {getCurrentDate()}
        </div>
      </div>
    </header>
  )
}
