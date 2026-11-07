import { useEffect, useState } from 'react'
import { useAppState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { useSound } from '../../core/useSound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'
import { EXERCISES, isStageEnd, STAGE_COUNT, STAGE_TOTAL, TASKS_PER_STAGE, type Exercise } from './stagesLogic'

function StageBar({ completed }: { completed: number }) {
  return (
    <div style={{ display: 'flex', gap: 10, flex: 1 }}>
      {Array.from({ length: STAGE_COUNT }).map((_, s) => (
        <div key={s} style={{ flex: 1, display: 'flex', gap: 4, padding: 6, borderRadius: 12, background: '#fff', border: '2px solid var(--border)' }}>
          {Array.from({ length: TASKS_PER_STAGE }).map((_, t) => {
            const done = s * TASKS_PER_STAGE + t < completed
            return <div key={t} style={{ flex: 1, height: 14, borderRadius: 999, background: done ? 'var(--ok)' : 'var(--border)', transition: 'background 0.3s' }} />
          })}
        </div>
      ))}
    </div>
  )
}

function PauseScreen({ exercise, seconds, stageDone, onContinue }: { exercise: Exercise; seconds: number; stageDone: number; onContinue: () => void }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    const started = Date.now()
    const id = window.setInterval(() => {
      const l = Math.max(0, seconds - Math.floor((Date.now() - started) / 1000))
      setLeft(l)
      if (l <= 0) {
        window.clearInterval(id)
        onContinue()
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [seconds, onContinue])

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
      <div className="end-title">Etappe {stageDone} geschafft! 🎉</div>
      <p style={{ fontSize: '1.2rem', margin: 0 }}>Kurze Pause:</p>
      <div
        style={{
          width: 200, height: 200, borderRadius: '50%', background: 'var(--ok-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5.5rem',
          animation: exercise.breathing ? 'pulse 4s ease-in-out infinite' : 'bounce 1.2s ease infinite',
        }}
      >
        {exercise.emoji}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{exercise.text}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>{left}</div>
      <button type="button" className="btn btn-primary btn-big" onClick={onContinue}>Weiter</button>
    </div>
  )
}

export function StagesConcept() {
  const { state } = useAppState()
  const play = useSound()
  const [exercise, setExercise] = useState<Exercise>(EXERCISES[0])

  const round = useTaskRound({
    maxTasks: STAGE_TOTAL,
    pauseAfter: (completed) => {
      const end = isStageEnd(completed)
      if (end) {
        setExercise(EXERCISES[Math.floor(Math.random() * EXERCISES.length)])
        play('reward')
      }
      return end
    },
    onCorrect: () => play('correct'),
    onWrong: () => play('wrong'),
  })

  const completed = round.phase === 'correct' || round.phase === 'solution' || round.phase === 'break' || round.phase === 'done'
    ? round.index + 1
    : round.index

  if (round.phase === 'done') {
    return (
      <RoundEndScreen title="Alle 3 Etappen geschafft!">
        <div style={{ fontSize: '6rem' }}>🏁</div>
        <StageBar completed={STAGE_TOTAL} />
        <p style={{ fontSize: '1.2rem' }}>{round.correctCount} von {STAGE_TOTAL} richtig.</p>
      </RoundEndScreen>
    )
  }

  const stage = Math.min(STAGE_COUNT, Math.floor(round.index / TASKS_PER_STAGE) + 1)

  return (
    <ConceptScreen top={<StageBar completed={completed} />}>
      {round.phase === 'break' ? (
        <PauseScreen
          key={round.index}
          exercise={exercise}
          seconds={state.settings.pauseSeconds}
          stageDone={Math.round(completed / TASKS_PER_STAGE)}
          onContinue={round.resume}
        />
      ) : (
        <>
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
            Etappe {stage} · Aufgabe {(round.index % TASKS_PER_STAGE) + 1} von {TASKS_PER_STAGE}
          </div>
          <TaskCard round={round} />
        </>
      )}
    </ConceptScreen>
  )
}
