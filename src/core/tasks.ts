import tasksJson from '../data/tasks.json'
import type { Level, Task } from './types'

export function validateTasks(raw: unknown): Task[] {
  if (!Array.isArray(raw)) throw new Error('tasks.json muss ein Array sein')
  const ids = new Set<string>()
  for (const t of raw as Task[]) {
    if (ids.has(t.id)) throw new Error(`Doppelte Aufgaben-ID: ${t.id}`)
    ids.add(t.id)
    if (![1, 2, 3].includes(t.level)) throw new Error(`Ungültiges Level bei ${t.id}`)
    if (!Number.isInteger(t.answer) || t.answer < 0) throw new Error(`Ungültige Antwort bei ${t.id}`)
    if (t.type === 'choice') {
      if (!t.choices || !t.choices.includes(t.answer)) throw new Error(`Antwort fehlt in choices bei ${t.id}`)
      if (new Set(t.choices).size !== t.choices.length) throw new Error(`Doppelte choices bei ${t.id}`)
    }
  }
  return raw as Task[]
}

export const allTasks: Task[] = validateTasks(tasksJson)

export function tasksForLevel(level: Level): Task[] {
  return allTasks.filter((t) => t.level === level)
}

/** Zieht eine Aufgabe, die das Profil noch nicht hatte. Ist die Stufe aufgebraucht,
 *  wird der Verlauf zurückgesetzt, aber Aufgaben der laufenden Runde bleiben ausgeschlossen. */
export function pickNextTask(
  levelTasks: Task[],
  used: string[],
  roundIds: string[],
  rng: () => number = Math.random,
): { task: Task; used: string[] } {
  let usedNow = used
  let candidates = levelTasks.filter((t) => !usedNow.includes(t.id))
  if (candidates.length === 0) {
    usedNow = []
    candidates = levelTasks.filter((t) => !roundIds.includes(t.id))
    if (candidates.length === 0) candidates = levelTasks
  }
  const task = candidates[Math.floor(rng() * candidates.length)]
  return { task, used: [...usedNow, task.id] }
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
