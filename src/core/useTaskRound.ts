import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useActiveProfile, useAppState } from './AppStateContext'
import { initialRound, roundReducer, type Phase } from './round'
import { pickNextTask, tasksForLevel } from './tasks'
import type { Task } from './types'

export interface UseTaskRoundOptions {
  /** null = unbegrenzt (Zeit-Challenge) */
  maxTasks: number | null
  /** hält Auto-Weiter an (z. B. während ein Belohnungs-Overlay offen ist) */
  paused?: boolean
  /** Default 1200 */
  autoAdvanceMs?: number
  /** true → Phase 'break' statt nächster Aufgabe */
  pauseAfter?: (completed: number) => boolean
  /** false → Runde startet erst nach start() */
  autoStart?: boolean
  onCorrect?: (e: { firstTry: boolean; streak: number; correctCount: number }) => void
  onWrong?: (e: { final: boolean }) => void
}

export interface RoundApi {
  task: Task | null
  phase: Phase
  index: number
  total: number | null
  correctCount: number
  streak: number
  wrongAnswers: number[]
  started: boolean
  submit(answer: number): void
  next(): void
  resume(): void
  finish(): void
  start(): void
}

export function useTaskRound(opts: UseTaskRoundOptions): RoundApi {
  const { dispatch: appDispatch } = useAppState()
  const profile = useActiveProfile()
  const [s, dispatch] = useReducer(roundReducer, undefined, initialRound)
  const stateRef = useRef(s)
  stateRef.current = s
  const optsRef = useRef(opts)
  optsRef.current = opts
  const profileRef = useRef(profile)
  profileRef.current = profile

  const loadNext = useCallback(() => {
    const p = profileRef.current
    if (!p) return
    const { task, used } = pickNextTask(tasksForLevel(p.level), p.usedTaskIds[p.level], stateRef.current.roundIds)
    // sofort im Ref vermerken, damit ein zweiter Aufruf im selben Tick nicht dieselbe Aufgabe zieht
    stateRef.current = { ...stateRef.current, roundIds: [...stateRef.current.roundIds, task.id] }
    profileRef.current = { ...p, usedTaskIds: { ...p.usedTaskIds, [p.level]: used } }
    appDispatch({
      type: 'updateProfile',
      id: p.id,
      update: (pp) => ({ ...pp, usedTaskIds: { ...pp.usedTaskIds, [p.level]: used } }),
    })
    dispatch({ type: 'load', task })
  }, [appDispatch])

  const startedRef = useRef(false)
  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    loadNext()
  }, [loadNext])

  useEffect(() => {
    if (opts.autoStart !== false) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = useCallback((answer: number) => {
    const cur = stateRef.current
    if (!cur.task || (cur.phase !== 'answering' && cur.phase !== 'retry')) return
    const correct = answer === cur.task.answer
    const firstTry = cur.attempts === 0
    // Phase sofort sperren (Doppel-Tippen)
    stateRef.current = { ...cur, phase: correct ? 'correct' : firstTry ? 'retry' : 'solution', attempts: cur.attempts + 1 }
    dispatch({ type: 'submit', answer })
    if (correct) {
      optsRef.current.onCorrect?.({
        firstTry,
        streak: firstTry ? cur.streak + 1 : cur.streak,
        correctCount: cur.correctCount + 1,
      })
    } else {
      optsRef.current.onWrong?.({ final: !firstTry })
    }
  }, [])

  const next = useCallback(() => {
    const cur = stateRef.current
    if (cur.phase !== 'correct' && cur.phase !== 'solution') return
    const completed = cur.roundIds.length
    const max = optsRef.current.maxTasks
    if (max !== null && completed >= max) {
      stateRef.current = { ...cur, phase: 'done' }
      dispatch({ type: 'finish' })
    } else if (optsRef.current.pauseAfter?.(completed)) {
      stateRef.current = { ...cur, phase: 'break' }
      dispatch({ type: 'break' })
    } else {
      loadNext()
    }
  }, [loadNext])

  const resume = useCallback(() => {
    if (stateRef.current.phase === 'break') loadNext()
  }, [loadNext])

  const finish = useCallback(() => {
    stateRef.current = { ...stateRef.current, phase: 'done' }
    dispatch({ type: 'finish' })
  }, [])

  const autoAdvanceMs = opts.autoAdvanceMs ?? 1200
  useEffect(() => {
    if (s.phase !== 'correct' || opts.paused) return
    const t = window.setTimeout(next, autoAdvanceMs)
    return () => window.clearTimeout(t)
  }, [s.phase, s.roundIds.length, opts.paused, autoAdvanceMs, next])

  return {
    task: s.task,
    phase: s.phase,
    index: Math.max(0, s.roundIds.length - 1),
    total: opts.maxTasks,
    correctCount: s.correctCount,
    streak: s.streak,
    wrongAnswers: s.wrongAnswers,
    started: s.task !== null,
    submit,
    next,
    resume,
    finish,
    start,
  }
}
