import { useState } from 'react'
import { useAppState, useConceptState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { useSound } from '../../core/useSound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'
import { Overlay } from '../../components/Overlay'
import { displayPosition, lapOf, MAP_LENGTH, STATIONS, stepForward, type Station } from './mapLogic'

const COLS = 10

/** Schlangen-Layout: Feld 0 unten links, Reihen laufen abwechselnd nach rechts/links nach oben. */
function cellPosition(field: number): { row: number; col: number } {
  const rowFromBottom = Math.floor(field / COLS)
  const inRow = field % COLS
  const col = rowFromBottom % 2 === 0 ? inRow : COLS - 1 - inRow
  const rows = Math.ceil((MAP_LENGTH + 1) / COLS)
  return { row: rows - rowFromBottom, col: col + 1 }
}

function Board({ position }: { position: number }) {
  const here = displayPosition(position)
  const fields = Array.from({ length: MAP_LENGTH + 1 }, (_, i) => i)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gap: 3,
        background: 'linear-gradient(180deg, #DBEAFE 0%, #DCFCE7 100%)',
        borderRadius: 18,
        padding: 8,
      }}
    >
      {fields.map((f) => {
        const { row, col } = cellPosition(f)
        const station = STATIONS.find((s) => s.at === f)
        const passed = f < here
        return (
          <div
            key={f}
            style={{
              gridRow: row,
              gridColumn: col,
              aspectRatio: '1',
              borderRadius: 8,
              background: f === 0 ? '#FDE68A' : passed ? '#86EFAC' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: station || f === here ? '1.25rem' : '0.6rem',
              position: 'relative',
              border: station ? '2px solid #F59E0B' : '1px solid #E5E7EB',
              transition: 'background 0.4s',
            }}
          >
            {f === here ? <span className="anim-bounce" key={position} style={{ display: 'inline-block' }}>🧒</span> : station ? station.emoji : f === 0 ? '🏠' : ''}
          </div>
        )
      })}
    </div>
  )
}

export function MapConcept() {
  const { state } = useAppState()
  const [map, setMap] = useConceptState('map')
  const play = useSound()
  const [station, setStation] = useState<Station | null>(null)
  const [stepsThisRound, setStepsThisRound] = useState(0)

  const round = useTaskRound({
    maxTasks: state.settings.roundLength,
    paused: station !== null,
    onCorrect: () => {
      const res = stepForward(map)
      setMap(res.state)
      setStepsThisRound((n) => n + 1)
      if (res.reachedStation) {
        setStation(res.reachedStation)
        play('reward')
      } else {
        play('correct')
      }
    },
    onWrong: () => play('wrong'),
  })

  const nextStation = STATIONS.find((s) => s.at > displayPosition(map.position))

  if (round.phase === 'done' && !station) {
    return (
      <RoundEndScreen title="Tolle Reise!">
        <p style={{ fontSize: '1.2rem' }}>Du bist heute {stepsThisRound} Felder weit gegangen.</p>
        <Board position={map.position} />
        {nextStation && <p style={{ fontSize: '1.1rem' }}>Nächstes Ziel: {nextStation.emoji} in {nextStation.at - displayPosition(map.position)} Feldern</p>}
      </RoundEndScreen>
    )
  }

  return (
    <ConceptScreen
      top={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, fontWeight: 700 }}>
          <span>🗺️ Reise {lapOf(map.position)}</span>
          {nextStation && <span className="muted" style={{ fontWeight: 600 }}>Ziel {nextStation.emoji}: noch {nextStation.at - displayPosition(map.position)}</span>}
          <span className="muted" style={{ marginLeft: 'auto' }}>{round.index + 1}/{round.total}</span>
        </div>
      }
    >
      <Board position={map.position} />
      <TaskCard round={round} correctText="Richtig! Ein Schritt weiter 👣" />
      {station && (
        <Overlay>
          <div className="overlay-emoji anim-bounce">{station.emoji}</div>
          <div className="overlay-title">{station.text}</div>
          <button type="button" className="btn btn-primary btn-big" onClick={() => setStation(null)}>Weiter geht's!</button>
        </Overlay>
      )}
    </ConceptScreen>
  )
}
