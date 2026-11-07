import type { ReactNode } from 'react'

export function Overlay({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-box" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
