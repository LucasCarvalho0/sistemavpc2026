import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useVinScanner } from '../hooks/useVinScanner'

interface VinScannerProps {
  onScan: (vin: string) => void
  onClose: () => void
}

export function VinScanner({ onScan, onClose }: VinScannerProps) {
  const { videoRef, error, startScan, stopScan } = useVinScanner({
    onScan: (vin) => {
      onScan(vin)
    },
    onError: () => {
      onClose()
    },
  })

  useEffect(() => {
    startScan()
    return () => {
      stopScan()
    }
  }, [startScan, stopScan])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm">
      <div className="card rounded-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl tracking-widest text-primary">ESCANEANDO VIN</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {error ? (
          <div className="bg-red-950 border border-red-700 rounded-xl p-4 text-sm text-red-200 font-sans">
            {error}. Por favor, digite o VIN manualmente.
          </div>
        ) : (
          <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Scan frame with pulse */}
            <div className="absolute inset-0 border-2 border-primary/30 rounded-xl animate-pulse" />

            {/* Corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />

            {/* Laser Line */}
            <div
              className="absolute left-6 right-6 h-[2px] bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),1)] z-10"
              style={{
                top: '20%',
                animation: 'scanLaser 2s linear infinite'
              }}
            />

            {/* Scanning Overlay */}
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          </div>
        )}

        <p className="text-sm text-muted font-sans text-center mt-4">
          Aponte a câmera para o código de barras do VIN
        </p>

        <button
          onClick={onClose}
          className="btn-secondary w-full py-3 rounded-xl mt-4 text-sm font-sans font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
