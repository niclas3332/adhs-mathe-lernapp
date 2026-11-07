import type { PointsState } from '../../core/types'

export interface Badge {
  id: string
  name: string
  emoji: string
  earned: (s: PointsState) => boolean
}

export const BADGES: Badge[] = [
  { id: 'first', name: 'Erster Treffer', emoji: '🎯', earned: (s) => s.total >= 10 },
  { id: 'p50', name: '50 Punkte', emoji: '⭐', earned: (s) => s.total >= 50 },
  { id: 'p100', name: '100 Punkte', emoji: '🌟', earned: (s) => s.total >= 100 },
  { id: 'p250', name: '250 Punkte', emoji: '🏅', earned: (s) => s.total >= 250 },
  { id: 'p500', name: '500 Punkte', emoji: '🏆', earned: (s) => s.total >= 500 },
  { id: 's3', name: '3 in Folge', emoji: '🔥', earned: (s) => s.bestStreak >= 3 },
  { id: 's5', name: '5 in Folge', emoji: '⚡', earned: (s) => s.bestStreak >= 5 },
  { id: 's10', name: '10 in Folge', emoji: '🚀', earned: (s) => s.bestStreak >= 10 },
]

export function pointsFor(streak: number): number {
  return 10 + (streak >= 3 ? 5 : 0)
}

export function applyCorrect(state: PointsState, streak: number): { state: PointsState; gained: number; newBadges: Badge[] } {
  const gained = pointsFor(streak)
  const next: PointsState = { ...state, total: state.total + gained, bestStreak: Math.max(state.bestStreak, streak) }
  const newBadges = BADGES.filter((b) => !state.badges.includes(b.id) && b.earned(next))
  next.badges = [...state.badges, ...newBadges.map((b) => b.id)]
  return { state: next, gained, newBadges }
}
