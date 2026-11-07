import { useMemo, type ReactNode } from 'react'
import type { RoundApi } from '../core/useTaskRound'
import { shuffle } from '../core/tasks'
import { ChoiceButtons } from './ChoiceButtons'
import { NumberPad } from './NumberPad'

export function TaskCard({ round, correctText = 'Richtig!' }: { round: RoundApi; correctText?: ReactNode }) {
  const { task, phase } = round
  const choices = useMemo(() => (task?.choices ? shuffle(task.choices) : []), [task])
  if (!task) return null
  const canAnswer = phase === 'answering' || phase === 'retry'

  return (
    <div className="task-card">
      <div className={`task-question${task.topic === 'text' ? ' text' : ''}`}>
        {task.question}
        {task.topic !== 'text' && ' = ?'}
      </div>

      <div className={`task-feedback ${phase}`}>
        {phase === 'correct' && correctText}
        {phase === 'retry' && 'Noch nicht ganz – versuch es nochmal.'}
        {phase === 'solution' && (
          <>
            <span>Leider falsch, richtig ist {task.answer}.</span>
            <button type="button" className="btn btn-primary" onClick={round.next}>Weiter</button>
          </>
        )}
      </div>

      {task.type === 'input' ? (
        <NumberPad key={task.id} onSubmit={round.submit} disabled={!canAnswer} />
      ) : (
        <ChoiceButtons
          choices={choices}
          onSelect={round.submit}
          disabled={!canAnswer}
          disabledValues={round.wrongAnswers}
        />
      )}
    </div>
  )
}
