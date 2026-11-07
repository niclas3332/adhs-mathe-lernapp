import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

export function RoundEndScreen({ title, children }: { title: string; children?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="screen end-screen">
      <div className="end-title">{title}</div>
      {children}
      <button type="button" className="btn btn-primary btn-big" onClick={() => navigate('/menu')}>Fertig</button>
    </div>
  )
}
