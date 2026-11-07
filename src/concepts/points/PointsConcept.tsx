import { useState } from 'react'
import { useAppState, useConceptState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { useSound } from '../../core/useSound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'
import { Overlay } from '../../components/Overlay'
import { applyCorrect, BADGES, type Badge } from './pointsLogic'

function BadgeWall({ earned }: { earned: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
      {BADGES.map((b) => {
        const has = earned.includes(b.id)
        return (
          <div key={b.id} style={{ textAlign: 'center', opacity: has ? 1 : 0.3, filter: has ? 'none' : 'grayscale(1)' }}>
            <div style={{ fontSize: '2.4rem' }}>{b.emoji}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{b.name}</div>
          </div>
        )
      })}
    </div>
  )
}

export function PointsConcept() {
  const { state } = useAppState()
  const [points, setPoints] = useConceptState('points')
  const play = useSound()
  const [gainKey, setGainKey] = useState(0)
  const [lastGain, setLastGain] = useState(0)
  const [roundPoints, setRoundPoints] = useState(0)
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([])

  const round = useTaskRound({
    maxTasks: state.settings.roundLength,
    paused: badgeQueue.length > 0,
    onCorrect: ({ streak }) => {
      const res = applyCorrect(points, streak)
      setPoints(res.state)
      if (res.newBadges.length) {
        setBadgeQueue((q) => [...q, ...res.newBadges])
        play('reward')
      } else {
        play('correct')
      }
      setLastGain(res.gained)
      setRoundPoints((p) => p + res.gained)
      setGainKey((k) => k + 1)
    },
    onWrong: () => play('wrong'),
  })

  if (round.phase === 'done') {
    return (
      <RoundEndScreen title="Runde geschafft!">
        <p style={{ fontSize: '1.4rem' }}>Diese Runde: <strong>+{roundPoints}</strong> Punkte</p>
        <p style={{ fontSize: '1.2rem' }}>Gesamt: <strong>{points.total}</strong> ⭐</p>
        <BadgeWall earned={points.badges} />
      </RoundEndScreen>
    )
  }

  const badge = badgeQueue[0]

  return (
    <ConceptScreen
      top={
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '1.4rem', fontWeight: 800, position: 'relative' }}>
          <span>⭐ {points.total}</span>
          {gainKey > 0 && (
            <span key={gainKey} style={{ color: 'var(--ok)', animation: 'float-up 1s ease-out forwards', position: 'absolute', left: 30, top: -4 }}>
              +{lastGain}
            </span>
          )}
          {round.streak >= 3 && <span className="anim-pulse" style={{ display: 'inline-block' }}>🔥 {round.streak}</span>}
          <span className="muted" style={{ fontSize: '1rem', fontWeight: 600 }}>{round.index + 1}/{round.total}</span>
        </div>
      }
    >
      <TaskCard round={round} correctText={`Richtig! +${lastGain} Punkte`} />
      {badge && (
        <Overlay>
          <div className="overlay-emoji anim-bounce">{badge.emoji}</div>
          <div className="overlay-title">Neues Abzeichen!</div>
          <div style={{ fontSize: '1.3rem' }}>{badge.name}</div>
          <button type="button" className="btn btn-primary btn-big" onClick={() => setBadgeQueue((q) => q.slice(1))}>Juhu!</button>
        </Overlay>
      )}
    </ConceptScreen>
  )
}
