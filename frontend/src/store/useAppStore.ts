import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Employee, Production, Page, ToastMessage, ShiftConfig, RankingEntry } from '../types'

interface AppState {
  // Navigation
  currentPage: Page
  sidebarOpen: boolean

  // Data
  employees: Employee[]
  productions: Production[]
  quarterRanking: RankingEntry[]
  quarterEvolution: { date: string; count: number }[]

  // UI
  toasts: ToastMessage[]
  goalReached: boolean
  celebrateAnim: boolean
  isConnected: boolean

  // Config
  shiftConfig: ShiftConfig
  dailyGoal: number

  // Actions
  setPage: (page: Page) => void
  setSidebarOpen: (open: boolean) => void
  setEmployees: (employees: Employee[]) => void
  setProductions: (productions: Production[]) => void
  addProduction: (production: Production) => void
  updateEmployee: (employee: Employee) => void
  addEmployee: (employee: Employee) => void
  removeEmployee: (id: number) => void
  setQuarterRanking: (ranking: RankingEntry[]) => void
  setQuarterEvolution: (data: { date: string; count: number }[]) => void
  addToast: (message: string, type?: ToastMessage['type']) => void
  removeToast: (id: string) => void
  setGoalReached: (reached: boolean) => void
  setCelebrateAnim: (animate: boolean) => void
  setConnected: (connected: boolean) => void
  setDailyGoal: (goal: number) => void
  setShiftConfig: (config: ShiftConfig) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        currentPage: 'dashboard',
        sidebarOpen: false,
        employees: [],
        productions: [],
        quarterRanking: [],
        quarterEvolution: [],
        toasts: [],
        goalReached: false,
        celebrateAnim: false,
        isConnected: false,
        dailyGoal: 100,
        shiftConfig: { start: '16:48', end: '02:00', overtime: '04:00' },

        setPage: (page) => set({ currentPage: page, sidebarOpen: false }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setEmployees: (employees) => set({ employees }),
        setProductions: (productions) => set({ productions }),

        addProduction: (production) => {
          const state = get()
          const updated = [production, ...state.productions]
          const todayCount = updated.filter(
            (p) => new Date(p.createdAt).toDateString() === new Date().toDateString()
          ).length

          set({ productions: updated })

          if (todayCount >= state.dailyGoal && !state.goalReached) {
            set({ goalReached: true, celebrateAnim: true })
            setTimeout(() => set({ celebrateAnim: false }), 5000)
          }
        },

        updateEmployee: (employee) =>
          set((state) => ({
            employees: state.employees.map((e) => (e.id === employee.id ? employee : e)),
          })),

        addEmployee: (employee) =>
          set((state) => ({ employees: [...state.employees, employee] })),

        removeEmployee: (id) =>
          set((state) => ({ employees: state.employees.filter((e) => e.id !== id) })),

        setQuarterRanking: (quarterRanking) => set({ quarterRanking }),

        setQuarterEvolution: (quarterEvolution) => set({ quarterEvolution }),

        addToast: (message, type = 'success') => {
          const id = Math.random().toString(36).slice(2)
          set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
          setTimeout(() => get().removeToast(id), 3500)
        },

        removeToast: (id) =>
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

        setGoalReached: (goalReached) => set({ goalReached }),
        setCelebrateAnim: (celebrateAnim) => set({ celebrateAnim }),
        setConnected: (isConnected) => set({ isConnected }),
        setDailyGoal: (dailyGoal) => set({ dailyGoal }),
        setShiftConfig: (shiftConfig) => set({ shiftConfig }),
      }),
      {
        name: 'autotrack-storage',
        partialize: (state) => ({
          dailyGoal: state.dailyGoal,
          shiftConfig: state.shiftConfig,
        }),
      }
    )
  )
)
