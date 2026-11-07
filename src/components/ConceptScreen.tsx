import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { HoldToExitButton } from './HoldToExitButton'

export function ConceptScreen({ top, children, className = '' }: { top?: ReactNode; children: ReactNode; className?: string }) {
  const navigate = useNavigate()
  return (
    <div className={`screen concept-screen ${className}`}>
      <HoldToExitButton onExit={() => navigate('/menu')} />
      <div className="concept-top">{top}</div>
      <div className="concept-body">{children}</div>
    </div>
  )
}
