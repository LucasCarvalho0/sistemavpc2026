import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { buildRanking, isToday, getCurrentDate } from '../lib/utils'

const MEDAL_EMOJI = ['🥇', '🥈', '🥉']
const MEDAL_COLORS = ['#f97316', '#94a3b8', '#b45309']
const PODIUM_HEIGHTS = [130, 170, 100]

export function Ranking() {
  const { productions, employees, isConnected } = useAppStore()

  const todayProductions = useMemo(
    () => productions.filter((p) => isToday(p.createdAt)),
    [productions]
  )

  const ranking = useMemo(
    () => buildRanking(todayProductions, employees),
    [todayProductions, employees]
  )

  const top3 = ranking.slice(0, 3)
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-display text-3xl tracking-widest text-foreground">RANKING DO DIA</h2>
          <p className="text-xs text-muted font-sans">{getCurrentDate()} · Atualização em tempo real</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400'
            }`}
            style={isConnected ? { animation: 'pulseOrange 1s ease infinite alternate' } : {}}
          />
          <span className="text-xs text-muted font-sans">{isConnected ? 'Ao vivo' : 'Offline'}</span>
        </div>
      </div>

      {/* Podium */}
      {top3.filter((r) => r.count > 0).length >= 1 && (
        <div className="flex items-end justify-center gap-3 mb-6">
          {podiumOrder.map((r, idx) => {
            const realPos = r.position - 1
            return (
              <div key={r.employee.id} className="flex flex-col items-center flex-1 max-w-[140px]">
                <div className="font-display text-3xl mb-1">{MEDAL_EMOJI[realPos]}</div>
                <div className="text-xs text-foreground font-sans font-semibold mb-2 text-center truncate w-full px-1">
                  {r.employee.nome.split(' ')[0]}
                </div>
                <div
                  className="w-full rounded-t-lg flex flex-col items-center justify-center gap-1 border-2"
                  style={{
                    height: PODIUM_HEIGHTS[realPos],
                    background: `rgba(${realPos === 0 ? '249,115,22' : realPos === 1 ? '148,163,184' : '180,83,9'},0.12)`,
                    borderColor: MEDAL_COLORS[realPos],
                  }}
                >
                  <span className="font-display text-4xl" style={{ color: MEDAL_COLORS[realPos] }}>
                    {r.count}
                  </span>
                  <span className="text-[10px] text-muted font-sans">carros</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full ranking table */}
      <div className="card rounded-xl overflow-hidden">
        {ranking.length === 0 ? (
          <div className="text-center py-16 text-muted font-sans text-sm">
            Nenhum registro hoje ainda
          </div>
        ) : (
          ranking.map((r, i) => (
            <div
              key={r.employee.id}
              className={`flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 ${
                i === 0 ? 'bg-primary/5' : ''
              }`}
            >
              <div
                className="font-display text-2xl w-10 text-center"
                style={{ color: i < 3 ? MEDAL_COLORS[i] : '#475569' }}
              >
                {i < 3 ? MEDAL_EMOJI[i] : `${i + 1}°`}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-sans font-semibold text-foreground">{r.employee.nome}</div>
                <div className="text-xs text-muted mt-0.5 font-sans">
                  {r.count > 0 ? `${r.count} montagem${r.count !== 1 ? 's' : ''}` : 'Sem registros hoje'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${ranking[0]?.count > 0 ? (r.count / ranking[0].count) * 100 : 0}%`,
                      background: i === 0 ? '#f97316' : '#475569',
                    }}
                  />
                </div>
                <div
                  className="font-display text-3xl min-w-[40px] text-right"
                  style={{ color: i === 0 ? '#f97316' : '#94a3b8' }}
                >
                  {r.count}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
