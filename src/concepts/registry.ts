import type { ComponentType } from 'react'
import { PlainConcept } from './plain/PlainConcept'

export type ConceptId = 'points' | 'pet' | 'chest' | 'feedback' | 'map' | 'time' | 'stages' | 'plain'

export interface ConceptDef {
  id: ConceptId
  name: string
  emoji: string
  description: string
  Component: ComponentType
}

export const concepts: ConceptDef[] = [
  { id: 'plain', name: 'Ohne Gamification', emoji: '📝', description: 'Nur Aufgaben mit Richtig/Falsch. Vergleichsversion.', Component: PlainConcept },
]

export function findConcept(id: string | undefined): ConceptDef | undefined {
  return concepts.find((c) => c.id === id)
}
