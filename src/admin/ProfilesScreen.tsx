import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAppState } from '../core/AppStateContext'
import { validateKuerzel } from '../core/storage'
import type { Level } from '../core/types'

function LevelPick({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <div className="level-pick">
      {([1, 2, 3] as Level[]).map((l) => (
        <button key={l} type="button" className={`btn ${l === value ? 'sel' : ''}`} onClick={() => onChange(l)}>
          Stufe {l}
        </button>
      ))}
    </div>
  )
}

export function ProfilesScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [kuerzel, setKuerzel] = useState('')
  const [level, setLevel] = useState<Level>(1)
  const [error, setError] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  const add = () => {
    const err = validateKuerzel(kuerzel, state.profiles)
    setError(err)
    if (err) return
    const id = crypto.randomUUID()
    dispatch({ type: 'addProfile', id, kuerzel, level, createdAt: new Date().toISOString() })
    dispatch({ type: 'setActive', id })
    setKuerzel('')
    navigate('/menu')
  }

  return (
    <div className="screen admin">
      <div className="admin-bar">
        <h1>Kinder-Profile</h1>
        <button type="button" className="btn" onClick={() => navigate('/settings')}>⚙️ Einstellungen</button>
      </div>
      <p className="muted">Bereich für die Testleitung. Profil antippen, um es zu starten.</p>

      <div className="list">
        {state.profiles.length === 0 && <p className="muted">Noch keine Profile.</p>}
        {state.profiles.map((p) => (
          <div key={p.id} className={`row ${p.id === state.activeProfileId ? 'active' : ''}`}>
            <button
              type="button"
              className="grow"
              onClick={() => {
                dispatch({ type: 'setActive', id: p.id })
                navigate('/menu')
              }}
            >
              <strong style={{ fontSize: '1.2rem' }}>{p.kuerzel}</strong>
              <span className="muted"> · Stufe {p.level}</span>
            </button>
            <button type="button" className="btn" onClick={() => setEditId(editId === p.id ? null : p.id)}>Stufe</button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm(`Profil „${p.kuerzel}“ mit allem Fortschritt löschen?`)) dispatch({ type: 'deleteProfile', id: p.id })
              }}
            >
              🗑
            </button>
            {editId === p.id && (
              <div style={{ flexBasis: '100%' }}>
                <LevelPick value={p.level} onChange={(l) => dispatch({ type: 'setLevel', id: p.id, level: l })} />
              </div>
            )}
          </div>
        ))}
      </div>

      <h2>Neues Kind</h2>
      <div className="field">
        <label htmlFor="kuerzel">Kürzel</label>
        <input
          id="kuerzel"
          value={kuerzel}
          maxLength={12}
          autoComplete="off"
          onChange={(e) => setKuerzel(e.target.value)}
          placeholder="z. B. K07"
        />
      </div>
      <div className="field">
        <span>Schwierigkeit</span>
        <LevelPick value={level} onChange={setLevel} />
        <span className="muted" style={{ fontSize: '0.9rem' }}>
          1: Einmaleins 2/5/10, ± bis 100 ohne Übertrag · 2: ganzes Einmaleins, ± bis 100 mit Übertrag · 3: ± bis 1000, Geteilt, Text mit 2 Schritten
        </span>
      </div>
      {error && <div className="error">{error}</div>}
      <button type="button" className="btn btn-primary" onClick={add}>Profil anlegen und starten</button>

      <button type="button" className="btn" onClick={() => navigate('/install')}>📲 App installieren – Anleitung</button>
    </div>
  )
}
