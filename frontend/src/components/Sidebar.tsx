import { useAppStore } from '../store/useAppStore'
import type { Page } from '../types'
import {
  LayoutDashboard, PlusCircle, Trophy, History,
  Users, Settings, Car
} from 'lucide-react'
import { cn } from '../lib/utils'

const NAV_ITEMS: { id: Page; label: string; Icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'register', label: 'Registrar', Icon: PlusCircle },
  { id: 'ranking', label: 'Ranking', Icon: Trophy },
  { id: 'history', label: 'Histórico', Icon: History },
  { id: 'employees', label: 'Funcionários', Icon: Users },
  { id: 'settings', label: 'Configurações', Icon: Settings },
]

export function Sidebar() {
  const { currentPage, sidebarOpen, setPage, setSidebarOpen, productions, dailyGoal } = useAppStore()

  const todayCount = (productions || []).filter(
    (p) => p && p.createdAt && new Date(p.createdAt).toDateString() === new Date().toDateString()
  ).length

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-screen w-[260px] z-40 flex flex-col',
          'bg-[#0d0f12] border-r border-border transition-transform duration-250',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shrink-0">
              <Car size={20} />
            </div>
            <div>
              <div className="font-display text-xl tracking-widest text-primary">AUTOTRACK</div>
              <div className="text-[10px] text-muted tracking-widest font-sans uppercase">
                Produção Automotiva
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={cn('nav-item', currentPage === id && 'active')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Shift info */}
        <div className="px-4 pb-5 pt-3 border-t border-border">
          <div className="bg-surface-2 rounded-xl p-3 border border-border">
            <div className="text-[10px] text-muted tracking-widest mb-2 font-sans">TURNO ATUAL</div>
            <div className="text-sm text-foreground font-sans">16:48 → 02:00</div>
            <div className="mt-2 text-xs text-primary font-mono">
              {todayCount} / {dailyGoal} carros
            </div>
            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.min((todayCount / dailyGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
