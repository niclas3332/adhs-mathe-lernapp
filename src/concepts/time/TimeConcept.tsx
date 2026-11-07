import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { useAppState, useConceptState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { useSound } from '../../core/useSound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'
import { updateRecord } from './timeLogic'

export function TimeConcept() {
  const { state } = useAppState()
  const seconds = state.settings.timeChallengeSeconds
  const [time, setTime] = useConceptState('time')
  const play = useSound()
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [left, setLeft] = useState(seconds)
  const [result, setResult] = useState<{ score: number; isNewRecord: boolean; oldRecord: number } | null>(null)
  const lastTick = useRef(seconds)

  const round = useTaskRound({
    maxTasks: null,
    autoStart: false,
    autoAdvanceMs: 500,
    onCorrect: () => play('correct'),
    onWrong: () => play('wrong'),
  })

  const { finish } = round
  const done = round.phase === 'done'

  // Countdown
  useEffect(() => {
    if (startedAt === null || done) return
    const id = window.setInterval(() => {
      const remaining = Math.max(0, seconds - (Date.now() - startedAt) / 1000)
      setLeft(remaining)
      const whole = Math.ceil(remaining)
      if (whole !== lastTick.current) {
        lastTick.current = whole
        if (whole <= 10 && whole > 0) play('tick')
      }
      if (remaining <= 0) finish()
    }, 100)
    return () => window.clearInterval(id)
  }, [startedAt, done, finish, seconds, play])

  // Ergebnis einmalig speichern
  useEffect(() => {
    if (round.phase !== 'done' || result) return
    const res = updateRecord(time, round.correctCount)
    setResult({ score: round.correctCount, isNewRecord: res.isNewRecord, oldRecord: time.record })
    if (res.isNewRecord) {
      setTime(res.state)
      play('reward')
      void confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 }, disableForReducedMotion: true })
    }
  }, [round.phase, round.correctCount, result, time, setTime, play])

  if (startedAt === null) {
    return (
      <ConceptScreen>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: '6rem' }}>⏱️</div>
          <div className="end-title">Wie viele schaffst du in {seconds} Sekunden?</div>
          <p style={{ fontSize: '1.3rem' }}>Dein Rekord: <strong>{time.record}</strong></p>
          <button
            type="button"
            className="btn btn-primary btn-big"
            onClick={() => {
              setStartedAt(Date.now())
              round.start()
            }}
          >
            Los!
          </button>
        </div>
      </ConceptScreen>
    )
  }

  if (round.phase === 'done' && result) {
    return (
      <RoundEndScreen title={result.isNewRecord ? 'Neuer Rekord! 🏆' : 'Zeit ist um!'}>
        <div style={{ fontSize: '5rem', fontWeight: 800 }}>{result.score}</div>
        <p style={{ fontSize: '1.3rem' }}>Aufgaben richtig</p>
        <p style={{ fontSize: '1.1rem' }}>
          {result.isNewRecord ? `Vorher: ${result.oldRecord}` : `Dein Rekord: ${result.oldRecord}`}
        </p>
      </RoundEndScreen>
    )
  }

  const pct = (left / seconds) * 100
  const urgent = left <= 10

  return (
    <ConceptScreen
      top={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, minWidth: 48 }}>{Math.ceil(left)}s</span>
          <div className="progress" style={{ height: 18 }}>
            <div style={{ width: `${pct}%`, background: urgent ? '#F97316' : 'var(--accent)', transition: 'width 0.1s linear' }} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>✅ {round.correctCount}</span>
        </div>
      }
    >
      <TaskCard round={round} correctText="Richtig! ⚡" />
    </ConceptScreen>
  )
}
