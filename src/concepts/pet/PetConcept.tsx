import { useState } from 'react'
import { useAppState, useConceptState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { useSound } from '../../core/useSound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'
import { Overlay } from '../../components/Overlay'
import { DEFAULT_PET_NAME, feed, nextStageAt, PET_EMOJI, petName, petStage, type Stage } from './petLogic'

const FOOD = ['🍎', '🍓', '🍌', '🥕', '🍪', '🍇']
const GROW_TEXT: Record<Stage, string> = {
  egg: '',
  baby: 'ist geschlüpft!',
  big: 'ist groß geworden!',
}

function NameScreen({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: '7rem' }} className="anim-pulse">🥚</div>
      <div className="end-title">Du hast ein Ei gefunden!</div>
      <p style={{ fontSize: '1.2rem' }}>Wie soll dein Tier heißen?</p>
      <div className="field">
        <input value={name} maxLength={12} onChange={(e) => setName(e.target.value)} placeholder={DEFAULT_PET_NAME} style={{ textAlign: 'center', fontSize: '1.5rem' }} />
      </div>
      <button type="button" className="btn btn-primary btn-big" onClick={() => onDone(name.trim() || DEFAULT_PET_NAME)}>Los geht's!</button>
    </div>
  )
}

export function PetConcept() {
  const { state } = useAppState()
  const [pet, setPet] = useConceptState('pet')
  const play = useSound()
  const [feedKey, setFeedKey] = useState(0)
  const [food, setFood] = useState(FOOD[0])
  const [grew, setGrew] = useState<Stage | null>(null)
  const [fedThisRound, setFedThisRound] = useState(0)
  const named = pet.name !== null

  const round = useTaskRound({
    maxTasks: state.settings.roundLength,
    autoStart: named,
    paused: grew !== null,
    autoAdvanceMs: 1500,
    onCorrect: () => {
      const res = feed(pet)
      setPet(res.state)
      setFood(FOOD[Math.floor(Math.random() * FOOD.length)])
      setFeedKey((k) => k + 1)
      setFedThisRound((n) => n + 1)
      if (res.grewTo) {
        setGrew(res.grewTo)
        play('reward')
      } else {
        play('correct')
      }
    },
    onWrong: () => play('wrong'),
  })

  if (!named) {
    return (
      <ConceptScreen>
        <NameScreen onDone={(name) => { setPet({ ...pet, name }); round.start() }} />
      </ConceptScreen>
    )
  }

  const stage = petStage(pet.fed)
  const name = petName(pet)

  if (round.phase === 'done' && !grew) {
    return (
      <RoundEndScreen title={`${name} ist satt und glücklich!`}>
        <div className="anim-bounce" style={{ fontSize: '8rem' }}>{PET_EMOJI[stage]}</div>
        <p style={{ fontSize: '1.3rem' }}>{name} hat heute {fedThisRound}× gefuttert. 💚</p>
      </RoundEndScreen>
    )
  }

  const target = nextStageAt(pet.fed)
  const cheering = round.phase === 'retry' || round.phase === 'solution'
  const happy = round.phase === 'correct'

  return (
    <ConceptScreen
      top={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <strong style={{ fontSize: '1.2rem' }}>{name}</strong>
          {target !== null && (
            <div className="progress" title="Bis zum Wachsen">
              <div style={{ width: `${Math.min(100, (pet.fed / target) * 100)}%`, background: 'var(--ok)' }} />
            </div>
          )}
          <span className="muted">{round.index + 1}/{round.total}</span>
        </div>
      }
    >
      <div style={{ textAlign: 'center', position: 'relative', height: 130 }}>
        {feedKey > 0 && (
          <span key={`f${feedKey}`} style={{ position: 'absolute', left: '50%', top: 0, fontSize: '2.5rem', animation: 'float-up 0.9s ease-in reverse forwards' }}>{food}</span>
        )}
        <div key={feedKey} className={happy ? 'anim-bounce' : ''} style={{ fontSize: '6.5rem', lineHeight: 1.2, display: 'inline-block' }}>
          {PET_EMOJI[stage]}
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, minHeight: 28 }}>
          {happy && `Mjam! ${name} freut sich 💚`}
          {cheering && `${name} glaubt an dich! 💪`}
        </div>
      </div>
      <TaskCard round={round} correctText={`Richtig! Du fütterst ${name}.`} />
      {grew && (
        <Overlay>
          <div className="overlay-emoji anim-bounce" style={{ fontSize: '7rem' }}>{PET_EMOJI[grew]}</div>
          <div className="overlay-title">{name} {GROW_TEXT[grew]}</div>
          <button type="button" className="btn btn-primary btn-big" onClick={() => setGrew(null)}>Toll!</button>
        </Overlay>
      )}
    </ConceptScreen>
  )
}
