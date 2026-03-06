import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { Trophy } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import {
  buildRanking, buildHourlyData, formatTime, formatDate, isToday,
  buildDailyData, buildMonthlyData
} from '../lib/utils'

const MEDAL_COLORS = ['#f97316', '#94a3b8', '#b45309']
const MEDAL_LABELS = ['1°', '2°', '3°']

export function Dashboard() {
  const { productions, employees, dailyGoal, quarterRanking, quarterEvolution } = useAppStore()

  const quarterChampion = useMemo(() => {
    return quarterRanking?.[0] || null
  }, [quarterRanking])

  console.log('Dashboard render:', {
    productions: Array.isArray(productions) ? `Array(${productions.length})` : typeof productions,
    employees: Array.isArray(employees) ? `Array(${employees.length})` : typeof employees,
    dailyGoal,
    quarterChampion: quarterChampion?.employee?.nome
  })
  // ... (rest of the code update below)

  const todayProductions = useMemo(
    () => (productions || []).filter((p) => p && p.createdAt && isToday(p.createdAt)),
    [productions]
  )

  const total = todayProductions.length
  const safeDailyGoal = dailyGoal || 100
  const pct = Math.min((total / safeDailyGoal) * 100, 100)

  const hourlyData = useMemo(() => buildHourlyData(todayProductions), [todayProductions])
  const ranking = useMemo(() => buildRanking(todayProductions, employees || []), [todayProductions, employees])
  const recent = todayProductions.slice(0, 6)

  const lastHour = useMemo(() => {
    const h = new Date().getHours()
    return todayProductions.filter((p) => p && p.createdAt && new Date(p.createdAt).getHours() === h).length
  }, [todayProductions])

  return (
    <div className="flex flex-col gap-5">
      {/* Featured Champion */}
      {quarterChampion && quarterChampion.count > 0 && (
        <div className="card rounded-2xl p-6 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-primary/30 relative overflow-hidden group">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] group-hover:scale-110 transition-transform duration-500">
              <Trophy size={32} />
            </div>
            <div>
              <div className="text-[10px] text-primary tracking-[0.2em] font-display mb-1">CAMPEÃO DO TRIMESTRE</div>
              <div className="text-3xl font-display text-foreground">{quarterChampion.employee.nome}</div>
              <div className="text-sm text-subtle font-sans mt-1">
                Líder absoluto com <span className="text-primary font-bold">{quarterChampion.count}</span> carros nos últimos 90 dias
              </div>
            </div>
          </div>
          {/* Decorative background trophy */}
          <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
            <Trophy size={200} />
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'PRODUÇÃO HOJE', value: total, sub: `Meta: ${dailyGoal} carros`, color: '#f97316' },
          {
            label: 'META DIÁRIA',
            value: `${Math.round(pct || 0)}%`,
            sub: pct >= 100 ? 'Meta atingida! 🎉' : `${safeDailyGoal - total} restantes`,
            color: pct >= 100 ? '#22c55e' : '#f97316',
          },
          {
            label: 'FUNCIONÁRIOS',
            value: (employees || []).filter((e) => e && e.ativo).length,
            sub: `de ${(employees || []).length} cadastrados`,
            color: '#60a5fa',
          },
          { label: 'ÚLTIMA HORA', value: lastHour, sub: 'carros montados', color: '#a78bfa' },
        ].map((card, i) => (
          <div key={i} className="card rounded-xl p-5">
            <div className="text-[10px] text-muted tracking-widest mb-2 font-sans">{card.label}</div>
            <div className="font-display text-4xl leading-none" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="text-xs text-subtle mt-2 font-sans">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-sans font-semibold text-foreground">Progresso da Meta do Turno</span>
          <span className="font-display text-xl text-primary">{total} / {safeDailyGoal}</span>
        </div>
        <div className="h-5 bg-border rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
            style={{
              width: `${pct}%`,
              background: pct >= 100
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : 'linear-gradient(90deg, #f97316, #ea580c)',
              boxShadow: pct >= 100
                ? '0 0 20px rgba(34,197,94,0.5)'
                : '0 0 20px rgba(249,115,22,0.4)',
              minWidth: pct > 8 ? undefined : 0,
            }}
          >
            {pct > 8 && (
              <span className="text-xs font-bold text-white font-sans">{Math.round(pct)}%</span>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-2">
          {[25, 50, 75, 100].map((m) => (
            <span
              key={m}
              className="text-[10px] font-mono"
              style={{ color: pct >= m ? '#f97316' : '#475569' }}
            >
              {m}%
            </span>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quarterly Evolution chart */}
        <div className="card rounded-xl p-5 lg:col-span-2">
          <h3 className="font-sans font-semibold text-foreground mb-4">Evolução Trimestral (Últimos 90 Dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={quarterEvolution}>
              <defs>
                <linearGradient id="gQuarter" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'DM Mono' }}
                tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#111318', border: '1px solid #1e2128',
                  borderRadius: 8, fontFamily: 'Space Grotesk', fontSize: 12,
                }}
                labelFormatter={(label) => `Data: ${label.split('-').reverse().join('/')}`}
              />
              <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#gQuarter)" strokeWidth={2} name="Carros" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly chart */}
        <div className="card rounded-xl p-5">
          <h3 className="font-sans font-semibold text-foreground mb-4">Produção por Hora</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" />
              <XAxis dataKey="hora" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'DM Mono' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#111318', border: '1px solid #1e2128',
                  borderRadius: 8, fontFamily: 'Space Grotesk', fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="producao" stroke="#f97316" fill="url(#g1)" strokeWidth={2} name="Por Hora" />
              <Area type="monotone" dataKey="acumulado" stroke="#60a5fa" fill="url(#g2)" strokeWidth={2} name="Acumulado" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Progress chart */}
        <div className="card rounded-xl p-5">
          <h3 className="font-sans font-semibold text-foreground mb-4">Produção Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={buildDailyData(productions)}>
              <defs>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'DM Mono' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#111318', border: '1px solid #1e2128',
                  borderRadius: 8, fontFamily: 'Space Grotesk', fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#g3)" strokeWidth={2} name="Carros" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Progress Chart */}
        <div className="card rounded-xl p-5">
          <h3 className="font-sans font-semibold text-foreground mb-4">Produção Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={buildMonthlyData(productions)}>
              <defs>
                <linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2128" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'DM Mono' }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#111318', border: '1px solid #1e2128',
                  borderRadius: 8, fontFamily: 'Space Grotesk', fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#a78bfa" fill="url(#g4)" strokeWidth={2} name="Carros" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top operators */}
        <div className="card rounded-xl p-5">
          <h3 className="font-sans font-semibold text-foreground mb-4">🏆 Top Operadores Hoje</h3>
          {ranking.filter((r) => r.count > 0).length === 0 ? (
            <div className="text-muted text-center py-12 font-sans text-sm">
              Nenhum registro hoje ainda
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {ranking.slice(0, 5).map((r, i) => (
                <div
                  key={r.employee.id}
                  className="flex items-center gap-3 bg-surface-2 rounded-lg px-4 py-3"
                >
                  <div
                    className="font-display text-2xl w-8 text-center"
                    style={{ color: i < 3 ? MEDAL_COLORS[i] : '#475569' }}
                  >
                    {MEDAL_LABELS[i] || `${i + 1}°`}
                  </div>
                  <div className="flex-1 font-sans text-sm text-foreground font-medium">
                    {r.employee.nome}
                  </div>
                  <div className="font-display text-2xl text-primary">{r.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card rounded-xl p-5">
        <h3 className="font-sans font-semibold text-foreground mb-4">Atividades Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans border-collapse">
            <thead>
              <tr className="border-b border-border">
                {['VIN', 'Funcionário', 'Versão', 'Data', 'Hora'].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-muted text-xs tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => {
                const emp = (employees || []).find((e) => e && e.id === p.funcionarioId)
                return (
                  <tr key={p.id} className="border-b border-[#0d0f12]">
                    <td className="px-3 py-2.5 text-primary font-mono text-xs">{p.vin}</td>
                    <td className="px-3 py-2.5 text-foreground">{emp?.nome || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={p.versaoCarro === 'L3 (Exclusive)' ? 'badge-orange' : 'badge-blue'}>
                        {p.versaoCarro}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-subtle font-mono text-xs">{formatDate(p.createdAt)}</td>
                    <td className="px-3 py-2.5 text-muted font-mono text-xs">{formatTime(p.createdAt)}</td>
                  </tr>
                )
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted">
                    Nenhum registro hoje
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
