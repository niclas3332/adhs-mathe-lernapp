import type { ComponentType } from 'react'
import { PointsConcept } from './points/PointsConcept'
import { PetConcept } from './pet/PetConcept'
import { ChestConcept } from './chest/ChestConcept'
import { FeedbackConcept } from './feedback/FeedbackConcept'
import { MapConcept } from './map/MapConcept'
import { TimeConcept } from './time/TimeConcept'
import { StagesConcept } from './stages/StagesConcept'
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
  { id: 'points', name: 'Punkte & Abzeichen', emoji: '⭐', description: 'Punkte für richtige Antworten, Serien-Bonus und Abzeichen.', Component: PointsConcept },
  { id: 'pet', name: 'Virtuelles Haustier', emoji: '🐣', description: 'Richtige Antworten füttern ein Tier, das mit der Zeit wächst.', Component: PetConcept },
  { id: 'chest', name: 'Schlüssel & Schatztruhe', emoji: '🧰', description: 'Schlüssel sammeln, Truhe öffnen, zufällige Sammelkarte.', Component: ChestConcept },
  { id: 'feedback', name: 'Sofort-Feedback', emoji: '🎉', description: 'Konfetti, Sound und Lob bei jeder richtigen Antwort.', Component: FeedbackConcept },
  { id: 'map', name: 'Abenteuer-Karte', emoji: '🗺️', description: 'Jede richtige Antwort ist ein Schritt auf der Reise.', Component: MapConcept },
  { id: 'time', name: 'Zeit-Challenge', emoji: '⏱️', description: 'So viele Aufgaben wie möglich gegen die Uhr, Rekord schlagen.', Component: TimeConcept },
  { id: 'stages', name: 'Mini-Etappen', emoji: '🏁', description: '3 × 3 Aufgaben mit Bewegungs- und Atempausen.', Component: StagesConcept },
  { id: 'plain', name: 'Ohne Gamification', emoji: '📝', description: 'Nur Aufgaben mit Richtig/Falsch. Vergleichsversion.', Component: PlainConcept },
]

export function findConcept(id: string | undefined): ConceptDef | undefined {
  return concepts.find((c) => c.id === id)
}
