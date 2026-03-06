import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ScanLine, CheckCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { VinScanner } from '../components/VinScanner'
import { productionApi } from '../lib/api'
import type { CarVersion } from '../types'

const schema = z.object({
  funcionarioId: z.string().min(1, 'Selecione um funcionário'),
  versaoCarro: z.enum(['L3 (Exclusive)', 'L2 (Advanced)'], { required_error: 'Selecione a versão' }),
  vin: z
    .string()
    .min(1, 'VIN obrigatório')
    .length(17, 'VIN deve ter exatamente 17 caracteres')
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'VIN contém caracteres inválidos'),
})

type FormData = z.infer<typeof schema>
const CAR_VERSIONS: CarVersion[] = ['L3 (Exclusive)', 'L2 (Advanced)']

export function Register() {
  const { employees, productions, addProduction, addToast } = useAppStore()
  const [scanning, setScanning] = useState(false)
  const [saving, setSaving] = useState(false)

  const activeEmployees = employees.filter((e) => e.ativo)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const vin = watch('vin') || ''
  const selectedVersion = watch('versaoCarro')

  const handleVinScan = useCallback(
    (scannedVin: string) => {
      setValue('vin', scannedVin, { shouldValidate: true })
      setScanning(false)
      addToast('VIN Escaneado!')
    },
    [setValue, addToast]
  )

  const onSubmit = async (data: FormData) => {
    // Check duplicate VIN today
    const today = new Date().toDateString()
    const dup = productions.find(
      (p) =>
        p.vin === data.vin.toUpperCase() &&
        new Date(p.createdAt).toDateString() === today
    )
    if (dup) {
      addToast('VIN já registrado hoje!', 'error')
      return
    }

    setSaving(true)
    try {
      // Try API first
      try {
        const res = await productionApi.create({
          vin: data.vin.toUpperCase(),
          versaoCarro: data.versaoCarro,
          funcionarioId: Number(data.funcionarioId),
        })
        addProduction(res.data)
      } catch {
        // Fallback: local state (offline mode)
        addProduction({
          id: Date.now(),
          vin: data.vin.toUpperCase(),
          versaoCarro: data.versaoCarro,
          funcionarioId: Number(data.funcionarioId),
          createdAt: new Date().toISOString(),
        })
      }
      addToast(`VIN ${data.vin.slice(0, 8)}... registrado!`)
      reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {scanning && (
        <VinScanner onScan={handleVinScan} onClose={() => setScanning(false)} />
      )}

      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="card rounded-2xl p-7">
            {/* Header */}
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                <CheckCircle size={22} />
              </div>
              <div>
                <h2 className="font-display text-2xl tracking-widest text-foreground">
                  NOVA MONTAGEM
                </h2>
                <p className="text-xs text-muted font-sans">Registre a montagem de mídia no veículo</p>
              </div>
            </div>

            {/* Employee */}
            <div className="mb-5">
              <label className="block text-[11px] text-subtle tracking-widest mb-2 font-sans">
                FUNCIONÁRIO
              </label>
              <select
                {...register('funcionarioId')}
                className="input-field w-full px-4 py-3.5 rounded-xl text-sm font-sans"
              >
                <option value="">Selecionar funcionário...</option>
                {activeEmployees.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
              {errors.funcionarioId && (
                <p className="text-red-400 text-xs mt-1.5 font-sans">{errors.funcionarioId.message}</p>
              )}
            </div>

            {/* Version */}
            <div className="mb-5">
              <label className="block text-[11px] text-subtle tracking-widest mb-2 font-sans">
                VERSÃO DO CARRO
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CAR_VERSIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('versaoCarro', v, { shouldValidate: true })}
                    className={`py-3.5 rounded-xl border-2 font-sans font-semibold text-sm transition-all ${selectedVersion === v
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-2 bg-surface-2 text-subtle hover:border-primary/50'
                      }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {errors.versaoCarro && (
                <p className="text-red-400 text-xs mt-1.5 font-sans">{errors.versaoCarro.message}</p>
              )}
            </div>

            {/* VIN */}
            <div className="mb-6">
              <label className="block text-[11px] text-subtle tracking-widest mb-2 font-sans">
                VIN — NÚMERO DE IDENTIFICAÇÃO DO VEÍCULO
              </label>
              <div className="flex gap-2.5">
                <div className="flex-1 relative">
                  <input
                    {...register('vin')}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/gi, '')
                      setValue('vin', val, { shouldValidate: val.length === 17 })
                    }}
                    maxLength={17}
                    placeholder="Ex: 1HGCM82633A123456"
                    className="input-field w-full px-4 py-3.5 rounded-xl text-sm font-mono tracking-wider"
                  />
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono ${vin.length === 17 ? 'text-green-400' : 'text-muted'
                      }`}
                  >
                    {vin.length}/17
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setScanning(true)}
                  className="btn-primary px-4 rounded-xl flex items-center gap-2 text-sm font-sans font-semibold whitespace-nowrap"
                >
                  <ScanLine size={18} />
                  SCAN
                </button>
              </div>

              {/* Progress dots */}
              {vin.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {Array.from({ length: 17 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-150 ${i < vin.length ? 'bg-primary' : 'bg-border'
                        }`}
                    />
                  ))}
                </div>
              )}

              {errors.vin && (
                <p className="text-red-400 text-xs mt-1.5 font-sans">{errors.vin.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-5 rounded-xl font-display text-lg tracking-widest flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  SALVANDO...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  SALVAR PRODUÇÃO
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
