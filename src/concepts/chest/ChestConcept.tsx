import { useState } from 'react'
import confetti from 'canvas-confetti'
import { useAppState, useConceptState } from '../../core/AppStateContext'
import { useTaskRound } from '../../core/useTaskRound'
import { useSound } from '../../core/useSound'
import { ConceptScreen } from '../../components/ConceptScreen'
import { RoundEndScreen } from '../../components/RoundEndScreen'
import { TaskCard } from '../../components/TaskCard'
import { Overlay } from '../../components/Overlay'
import { addKey, CARDS, drawCard, KEYS_PER_CHEST, openChest, RARITY_COLOR, type Card } from './chestLogic'

function CardView({ card, big }: { card: Card; big?: boolean }) {
  return (
    <div
      style={{
        border: `4px solid ${RARITY_COLOR[card.rarity]}`,
        borderRadius: 18,
        padding: big ? '18px 28px' : 6,
        background: '#fff',
        textAlign: 'center',
        boxShadow: card.rarity === 'super-selten' ? '0 0 24px #FCD34D' : undefined,
      }}
    >
      <div style={{ fontSize: big ? '5rem' : '2rem' }}>{card.emoji}</div>
      <div style={{ fontWeight: 700, fontSize: big ? '1.3rem' : '0.7rem' }}>{card.name}</div>
      {big && <div style={{ color: RARITY_COLOR[card.rarity], fontWeight: 700 }}>{card.rarity}</div>}
    </div>
  )
}

function Album({ cards }: { cards: string[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
      {CARDS.map((c) => {
        const n = cards.filter((id) => id === c.id).length
        return n > 0 ? (
          <div key={c.id} style={{ position: 'relative' }}>
            <CardView card={c} />
            {n > 1 && <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: 12, padding: '1px 6px', fontWeight: 700 }}>×{n}</span>}
          </div>
        ) : (
          <div key={c.id} style={{ border: '3px dashed var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: 'var(--muted)', minHeight: 64 }}>?</div>
        )
      })}
    </div>
  )
}

type ChestStep = 'closed' | 'opening' | 'revealed'

export function ChestConcept() {
  const { state } = useAppState()
  const [chest, setChest] = useConceptState('chest')
  const play = useSound()
  const [chestStep, setChestStep] = useState<ChestStep | null>(null)
  const [card, setCard] = useState<Card | null>(null)
  const [keyAnim, setKeyAnim] = useState(0)
  const [roundCards, setRoundCards] = useState<string[]>([])

  const round = useTaskRound({
    maxTasks: state.settings.roundLength,
    paused: chestStep !== null,
    onCorrect: () => {
      const res = addKey(chest)
      setChest(res.state)
      setKeyAnim((k) => k + 1)
      play('correct')
      if (res.chestReady) setChestStep('closed')
    },
    onWrong: () => play('wrong'),
  })

  const open = () => {
    setChestStep('opening')
    window.setTimeout(() => {
      const c = drawCard()
      setChest((prev) => openChest(prev, c))
      setCard(c)
      setRoundCards((r) => [...r, c.id])
      setChestStep('revealed')
      play('reward')
      void confetti({ particleCount: c.rarity === 'normal' ? 60 : 150, spread: 90, origin: { y: 0.4 }, disableForReducedMotion: true })
    }, 1200)
  }

  const close = () => {
    setCard(null)
    // Falls noch genug Schlüssel für eine weitere Truhe da sind
    setChestStep(chest.keys >= KEYS_PER_CHEST ? 'closed' : null)
  }

  if (round.phase === 'done' && chestStep === null) {
    return (
      <RoundEndScreen title="Deine Sammlung">
        <p style={{ fontSize: '1.2rem' }}>
          Neu in dieser Runde: {roundCards.length} {roundCards.length === 1 ? 'Karte' : 'Karten'} · 🔑 übrig: {chest.keys}
        </p>
        <Album cards={chest.cards} />
      </RoundEndScreen>
    )
  }

  return (
    <ConceptScreen
      top={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.8rem' }}>
          {Array.from({ length: KEYS_PER_CHEST }).map((_, i) => (
            <span key={i === chest.keys - 1 ? `k${keyAnim}` : i} className={i === chest.keys - 1 && keyAnim ? 'anim-bounce' : ''} style={{ opacity: i < chest.keys ? 1 : 0.2, display: 'inline-block' }}>🔑</span>
          ))}
          <span style={{ fontSize: '2rem', marginLeft: 6 }}>🧰</span>
          <span className="muted" style={{ fontSize: '1rem', marginLeft: 'auto' }}>{round.index + 1}/{round.total}</span>
        </div>
      }
    >
      <TaskCard round={round} correctText="Richtig! +1 🔑" />
      {chestStep && (
        <Overlay>
          {chestStep !== 'revealed' && (
            <>
              <div className={`overlay-emoji ${chestStep === 'opening' ? 'anim-wiggle' : 'anim-pulse'}`} style={{ fontSize: '7rem' }}>🧰</div>
              <div className="overlay-title">{chestStep === 'opening' ? 'Die Truhe geht auf …' : 'Du hast 3 Schlüssel!'}</div>
              {chestStep === 'closed' && <button type="button" className="btn btn-primary btn-big" onClick={open}>Truhe öffnen</button>}
            </>
          )}
          {chestStep === 'revealed' && card && (
            <>
              <div className="overlay-title">{card.rarity === 'normal' ? 'Neue Karte!' : card.rarity === 'selten' ? 'Eine seltene Karte!' : 'WOW! Super-selten!'}</div>
              <CardView card={card} big />
              <button type="button" className="btn btn-primary btn-big" onClick={close}>Weiter</button>
            </>
          )}
        </Overlay>
      )}
    </ConceptScreen>
  )
}
