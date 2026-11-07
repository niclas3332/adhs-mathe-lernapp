import type { MapState } from '../../core/types'

export const MAP_LENGTH = 50

export interface Station { at: number; emoji: string; text: string }

export const STATIONS: Station[] = [
  { at: 5, emoji: '🌳', text: 'Du hast den Zauberwald erreicht!' },
  { at: 10, emoji: '🌉', text: 'Du überquerst die Hängebrücke!' },
  { at: 15, emoji: '🍄', text: 'Du findest die Pilz-Lichtung!' },
  { at: 20, emoji: '🏔️', text: 'Du bist am Fuß des Bergs angekommen!' },
  { at: 25, emoji: '🕳️', text: 'Du entdeckst eine geheime Höhle!' },
  { at: 30, emoji: '🌋', text: 'Vorsicht, heißer Vulkan – du schaffst es vorbei!' },
  { at: 35, emoji: '🏝️', text: 'Du erreichst die Palmeninsel!' },
  { at: 40, emoji: '🐉', text: 'Ein freundlicher Drache winkt dir zu!' },
  { at: 45, emoji: '🏰', text: 'Das Schloss ist schon zu sehen!' },
  { at: 50, emoji: '👑', text: 'Du hast das Schloss erreicht! Die Reise beginnt von vorn.' },
]

export function displayPosition(position: number): number {
  return position % MAP_LENGTH
}

export function lapOf(position: number): number {
  return Math.floor(position / MAP_LENGTH) + 1
}

export function stepForward(s: MapState): { state: MapState; reachedStation: Station | null } {
  const position = s.position + 1
  const inLap = position % MAP_LENGTH === 0 ? MAP_LENGTH : position % MAP_LENGTH
  return { state: { position }, reachedStation: STATIONS.find((st) => st.at === inLap) ?? null }
}
