import { useAppStore } from '../store/useAppStore'

const COLORS = ['#f97316', '#fbbf24', '#22c55e', '#60a5fa', '#e879f9', '#f43f5e']

export function CelebrationOverlay() {
  const { celebrateAnim, dailyGoal } = useAppStore()

  if (!celebrateAnim) return null

  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 12,
    isCircle: Math.random() > 0.5,
  }))

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Confetti */}
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isCircle ? '50%' : 2,
            animationName: 'confettiFall',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationFillMode: 'forwards',
            animationTimingFunction: 'linear',
          }}
        />
      ))}

      {/* Banner */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div
          className="font-display text-6xl md:text-8xl text-primary tracking-widest"
          style={{ textShadow: '0 0 40px rgba(249,115,22,0.8)', animation: 'pulseOrange 0.5s ease infinite alternate' }}
        >
          🎉 META BATIDA!
        </div>
        <div className="font-sans text-xl text-yellow-400 mt-3">
          {dailyGoal} carros montados no turno!
        </div>
      </div>
    </div>
  )
}
