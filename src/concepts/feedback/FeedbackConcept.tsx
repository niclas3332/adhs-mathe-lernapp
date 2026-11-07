import { useState } from 'react'
import confetti from 'canvas-confetti'
import { useAppState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { useSound } from '../../core/useSound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'

const PRAISE = [
  'Stark!',
  'Wow, super gerechnet!',
  'Genau richtig!',
  'Du bist ein Rechen-Profi!',
  'Klasse!',
  'Mega!',
  'Jawoll!',
  'Spitze!',
  'Das war richtig gut!',
  'Weiter so!',
  'Bombe!',
  'Volltreffer!',
]

const MASCOT = '🦊'

export function FeedbackConcept() {
  const { state } = useAppState()
  const play = useSound()
  const [praise, setPraise] = useState(PRAISE[0])
  const [bounceKey, setBounceKey] = useState(0)

  const round = useTaskRound({
    maxTasks: state.settings.roundLength,
    onCorrect: () => {
      play('correct')
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)])
      setBounceKey((k) => k + 1)
      void confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, disableForReducedMotion: true })
    },
    onWrong: () => play('wrong'),
  })

  if (round.phase === 'done') {
    return (
      <RoundEndScreen title="Super gemacht!">
        <div className="anim-bounce" style={{ fontSize: '7rem' }}>{MASCOT}</div>
        <p style={{ fontSize: '1.3rem' }}>Du hast {round.correctCount} Aufgaben gelöst!</p>
      </RoundEndScreen>
    )
  }

  const mood = round.phase === 'retry' || round.phase === 'solution' ? '🤔' : null

  return (
    <ConceptScreen>
      <div style={{ textAlign: 'center' }}>
        <div key={bounceKey} className={bounceKey ? 'anim-bounce' : ''} style={{ fontSize: '5rem', lineHeight: 1, display: 'inline-block' }}>
          {MASCOT}
        </div>
        {mood && <span style={{ fontSize: '2rem' }}>{mood}</span>}
      </div>
      <TaskCard round={round} correctText={<span style={{ fontSize: '1.5rem' }}>🎉 {praise}</span>} />
    </ConceptScreen>
  )
}
