import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore()

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl',
            'animate-[fadeIn_0.3s_ease]',
            toast.type === 'success' && 'bg-green-950 border-green-700 text-green-100',
            toast.type === 'error' && 'bg-red-950 border-red-700 text-red-100',
            toast.type === 'info' && 'bg-blue-950 border-blue-700 text-blue-100'
          )}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-green-400" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
          </div>
          <p className="flex-1 text-sm font-sans">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
