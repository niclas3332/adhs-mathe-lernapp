import { useNavigate } from 'react-router'
import { useActiveProfile } from '../core/AppStateContext'
import { concepts } from '../concepts/registry'

export function ConceptMenu() {
  const profile = useActiveProfile()
  const navigate = useNavigate()
  if (!profile) return null

  return (
    <div className="screen admin">
      <div className="admin-bar">
        <h1>Kind: {profile.kuerzel} <span className="muted" style={{ fontSize: '1rem' }}>Stufe {profile.level}</span></h1>
        <button type="button" className="btn" onClick={() => navigate('/')}>Kind wechseln</button>
      </div>
      <p className="muted">Konzept wählen und das Gerät dem Kind geben. Zum Beenden einer Runde das ✕ oben rechts 2 Sekunden gedrückt halten.</p>
      <div className="tiles">
        {concepts.map((c, i) => (
          <button key={c.id} type="button" className="tile" onClick={() => navigate(`/play/${c.id}`)}>
            <span className="emoji">{c.emoji}</span>
            <span className="name">{i + 1}. {c.name}</span>
            <span className="desc">{c.description}</span>
          </button>
        ))}
      </div>
      <button type="button" className="btn" onClick={() => navigate('/settings')}>⚙️ Einstellungen</button>
    </div>
  )
}
