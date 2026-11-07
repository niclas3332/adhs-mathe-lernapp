import type { PetState } from '../../core/types'

export type Stage = 'egg' | 'baby' | 'big'

export const PET_EMOJI: Record<Stage, string> = { egg: '🥚', baby: '🐣', big: '🐲' }
export const DEFAULT_PET_NAME = 'Flocke'

export function petStage(fed: number): Stage {
  if (fed < 5) return 'egg'
  if (fed < 30) return 'baby'
  return 'big'
}

export function nextStageAt(fed: number): number | null {
  if (fed < 5) return 5
  if (fed < 30) return 30
  return null
}

export function feed(s: PetState): { state: PetState; grewTo: Stage | null } {
  const before = petStage(s.fed)
  const state = { ...s, fed: s.fed + 1 }
  const after = petStage(state.fed)
  return { state, grewTo: after !== before ? after : null }
}

export function petName(s: PetState): string {
  return s.name ?? DEFAULT_PET_NAME
}
