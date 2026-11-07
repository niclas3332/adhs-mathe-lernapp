import { useNavigate } from 'react-router'
import { useAppState } from '../core/AppStateContext'
import type { Settings } from '../core/types'

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="field">
      <label>{label} <span className="muted">({min}–{max})</span></label>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        defaultValue={value}
        onBlur={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export function SettingsScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const s = state.settings
  const update = (patch: Partial<Settings>) => dispatch({ type: 'updateSettings', patch })

  return (
    <div className="screen admin">
      <div className="admin-bar">
        <h1>Einstellungen</h1>
        <button type="button" className="btn" onClick={() => navigate(-1)}>Zurück</button>
      </div>
      <label className="row">
        <span className="grow">🔊 Sound</span>
        <input type="checkbox" checked={s.soundOn} onChange={(e) => update({ soundOn: e.target.checked })} style={{ width: 28, height: 28 }} />
      </label>
      <NumberField key={`rl-${s.roundLength}`} label="Aufgaben pro Runde" value={s.roundLength} min={5} max={20} onChange={(n) => update({ roundLength: n })} />
      <NumberField key={`tc-${s.timeChallengeSeconds}`} label="Zeit-Challenge in Sekunden" value={s.timeChallengeSeconds} min={30} max={180} onChange={(n) => update({ timeChallengeSeconds: n })} />
      <NumberField key={`ps-${s.pauseSeconds}`} label="Pause bei Mini-Etappen in Sekunden" value={s.pauseSeconds} min={10} max={60} onChange={(n) => update({ pauseSeconds: n })} />
      <p className="muted">Mini-Etappen haben immer 3 × 3 Aufgaben. Die Zeit-Challenge hat keine feste Aufgabenzahl.</p>
    </div>
  )
}
