import { useState } from 'react'
import { Save, Info } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export function Settings() {
  const { dailyGoal, shiftConfig, setDailyGoal, setShiftConfig, addToast } = useAppStore()

  const [goal, setGoal] = useState(dailyGoal)
  const [shift, setShift] = useState(shiftConfig)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setDailyGoal(goal)
    setShiftConfig(shift)
    setSaved(true)
    addToast('Configurações salvas!')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl tracking-widest text-foreground mb-6">CONFIGURAÇÕES</h2>

      <div className="flex flex-col gap-4">
        {/* Goal */}
        <div className="card rounded-xl p-5">
          <label className="block text-[11px] text-muted tracking-widest mb-3 font-sans">
            META DIÁRIA (carros por turno)
          </label>
          <input
            type="number"
            value={goal}
            min={1}
            max={500}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="input-field w-full px-4 py-3.5 rounded-xl text-lg font-mono"
          />
        </div>

        {/* Shift times */}
        <div className="card rounded-xl p-5">
          <div className="text-[11px] text-muted tracking-widest mb-4 font-sans">HORÁRIOS DO TURNO</div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Início', key: 'start' },
              { label: 'Fim', key: 'end' },
              { label: 'Hora Extra', key: 'overtime' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs text-subtle mb-2 font-sans">{label}</label>
                <input
                  type="time"
                  value={shift[key as keyof typeof shift]}
                  onChange={(e) => setShift({ ...shift, [key]: e.target.value })}
                  className="input-field w-full px-3 py-2.5 rounded-lg text-sm font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Car versions (read-only info) */}
        <div className="card rounded-xl p-5">
          <div className="text-[11px] text-muted tracking-widest mb-3 font-sans">VERSÕES DO CARRO</div>
          {['L3 (Exclusive)', 'L2 (Advanced)'].map((v) => (
            <div key={v} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-sans text-sm text-foreground">{v}</span>
            </div>
          ))}
          <p className="text-xs text-muted font-sans mt-3 flex items-center gap-1.5">
            <Info size={12} />
            Para editar as versões, contate o administrador do sistema.
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="btn-primary w-full py-4 rounded-xl font-display text-lg tracking-widest flex items-center justify-center gap-3"
        >
          {saved ? (
            '✅ SALVO!'
          ) : (
            <>
              <Save size={20} />
              SALVAR CONFIGURAÇÕES
            </>
          )}
        </button>

        {/* About */}
        <div className="card rounded-xl p-5">
          <div className="text-[11px] text-muted tracking-widest mb-3 font-sans">SOBRE O SISTEMA</div>
          <div className="font-sans text-sm text-subtle leading-relaxed space-y-1">
            <div>
              🏭 <strong className="text-foreground">AUTOTRACK v1.0</strong>
            </div>
            <div>Sistema de Controle de Produção Automotiva</div>
            <div className="text-muted pt-2">
              Stack: React · TypeScript · NestJS · PostgreSQL · WebSocket
            </div>
            <div className="text-muted">Março de 2026</div>
          </div>
        </div>
      </div>
    </div>
  )
}
