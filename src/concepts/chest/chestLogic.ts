import type { ChestState } from '../../core/types'

export type Rarity = 'normal' | 'selten' | 'super-selten'

export interface Card {
  id: string
  name: string
  emoji: string
  rarity: Rarity
}

export const KEYS_PER_CHEST = 3

export const CARDS: Card[] = [
  { id: 'katze', name: 'Katze', emoji: '🐱', rarity: 'normal' },
  { id: 'hund', name: 'Hund', emoji: '🐶', rarity: 'normal' },
  { id: 'hase', name: 'Hase', emoji: '🐰', rarity: 'normal' },
  { id: 'frosch', name: 'Frosch', emoji: '🐸', rarity: 'normal' },
  { id: 'kueken', name: 'Küken', emoji: '🐤', rarity: 'normal' },
  { id: 'schwein', name: 'Schwein', emoji: '🐷', rarity: 'normal' },
  { id: 'koala', name: 'Koala', emoji: '🐨', rarity: 'normal' },
  { id: 'pinguin', name: 'Pinguin', emoji: '🐧', rarity: 'normal' },
  { id: 'schildkroete', name: 'Schildkröte', emoji: '🐢', rarity: 'normal' },
  { id: 'igel', name: 'Igel', emoji: '🦔', rarity: 'normal' },
  { id: 'eule', name: 'Eule', emoji: '🦉', rarity: 'normal' },
  { id: 'fisch', name: 'Fisch', emoji: '🐠', rarity: 'normal' },
  { id: 'loewe', name: 'Löwe', emoji: '🦁', rarity: 'selten' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', rarity: 'selten' },
  { id: 'panda', name: 'Panda', emoji: '🐼', rarity: 'selten' },
  { id: 'oktopus', name: 'Oktopus', emoji: '🐙', rarity: 'selten' },
  { id: 'flamingo', name: 'Flamingo', emoji: '🦩', rarity: 'selten' },
  { id: 'wal', name: 'Wal', emoji: '🐳', rarity: 'selten' },
  { id: 'einhorn', name: 'Einhorn', emoji: '🦄', rarity: 'super-selten' },
  { id: 'drache', name: 'Drache', emoji: '🐉', rarity: 'super-selten' },
]

const WEIGHTS: [Rarity, number][] = [
  ['normal', 0.7],
  ['selten', 0.25],
  ['super-selten', 0.05],
]

export const RARITY_COLOR: Record<Rarity, string> = {
  normal: '#9CA3AF',
  selten: '#2563EB',
  'super-selten': '#F59E0B',
}

export function addKey(s: ChestState): { state: ChestState; chestReady: boolean } {
  const state = { ...s, keys: s.keys + 1 }
  return { state, chestReady: state.keys >= KEYS_PER_CHEST }
}

export function drawCard(rng: () => number = Math.random): Card {
  let r = rng()
  let rarity: Rarity = 'normal'
  for (const [name, w] of WEIGHTS) {
    if (r < w) { rarity = name; break }
    r -= w
    rarity = name
  }
  const pool = CARDS.filter((c) => c.rarity === rarity)
  return pool[Math.floor(rng() * pool.length)]
}

export function openChest(s: ChestState, card: Card): ChestState {
  if (s.keys < KEYS_PER_CHEST) throw new Error('Nicht genug Schlüssel')
  return { keys: s.keys - KEYS_PER_CHEST, cards: [...s.cards, card.id] }
}
