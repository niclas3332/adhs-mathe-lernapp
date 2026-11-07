import { useAppState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'

export function PlainConcept() {
  const { state } = useAppState()
  const round = useTaskRound({ maxTasks: state.settings.roundLength })

  if (round.phase === 'done') {
    return <RoundEndScreen title="Fertig">
      <p style={{ fontSize: '1.2rem' }}>{round.correctCount} von {round.total} richtig.</p>
    </RoundEndScreen>
  }

  return (
    <ConceptScreen top={<span className="muted" style={{ fontSize: '1.1rem' }}>Aufgabe {round.index + 1} von {round.total}</span>}>
      <TaskCard round={round} />
    </ConceptScreen>
  )
}
