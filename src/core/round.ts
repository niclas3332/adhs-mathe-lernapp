import type { Task } from './types'

export type Phase = 'answering' | 'retry' | 'correct' | 'solution' | 'break' | 'done'

export interface RoundState {
  task: Task | null
  phase: Phase
  attempts: number
  wrongAnswers: number[]
  correctCount: number
  streak: number
  roundIds: string[]
}

export type RoundAction =
  | { type: 'load'; task: Task }
  | { type: 'submit'; answer: number }
  | { type: 'break' }
  | { type: 'finish' }

export function initialRound(): RoundState {
  return { task: null, phase: 'answering', attempts: 0, wrongAnswers: [], correctCount: 0, streak: 0, roundIds: [] }
}

export function roundReducer(s: RoundState, a: RoundAction): RoundState {
  switch (a.type) {
    case 'load':
      return { ...s, task: a.task, phase: 'answering', attempts: 0, wrongAnswers: [], roundIds: [...s.roundIds, a.task.id] }
    case 'submit': {
      if (!s.task || (s.phase !== 'answering' && s.phase !== 'retry')) return s
      if (a.answer === s.task.answer) {
        return {
          ...s,
          phase: 'correct',
          correctCount: s.correctCount + 1,
          streak: s.attempts === 0 ? s.streak + 1 : s.streak,
        }
      }
      if (s.attempts === 0) {
        return { ...s, phase: 'retry', attempts: 1, streak: 0, wrongAnswers: [...s.wrongAnswers, a.answer] }
      }
      return { ...s, phase: 'solution', attempts: 2, wrongAnswers: [...s.wrongAnswers, a.answer] }
    }
    case 'break':
      return { ...s, phase: 'break' }
    case 'finish':
      return { ...s, phase: 'done' }
  }
}
