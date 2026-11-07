import { useEffect, useRef, useState } from 'react'

export function HoldToExitButton({ onExit, holdMs = 2000 }: { onExit: () => void; holdMs?: number }) {
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const stop = () => {
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setProgress(0)
  }

  const tick = () => {
    if (startRef.current === null) return
    const p = Math.min(1, (performance.now() - startRef.current) / holdMs)
    setProgress(p)
    if (p >= 1) {
      stop()
      onExit()
    } else {
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const r = 20
  const c = 2 * Math.PI * r
  return (
    <button
      type="button"
      className="hold-exit"
      aria-label="Gedrückt halten zum Beenden"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId)
        startRef.current = performance.now()
        rafRef.current = requestAnimationFrame(tick)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="#fff" stroke="#E5E7EB" strokeWidth="3" />
        <circle
          cx="24" cy="24" r={r} fill="none" stroke="#2563EB" strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          transform="rotate(-90 24 24)" strokeLinecap="round"
        />
        <text x="24" y="30" textAnchor="middle" className="x">✕</text>
      </svg>
    </button>
  )
}
