export const STAGE_COUNT = 3
export const TASKS_PER_STAGE = 3
export const STAGE_TOTAL = STAGE_COUNT * TASKS_PER_STAGE

export function isStageEnd(completed: number): boolean {
  return completed % TASKS_PER_STAGE === 0 && completed < STAGE_TOTAL
}

export interface Exercise { emoji: string; text: string; breathing?: boolean }

export const EXERCISES: Exercise[] = [
  { emoji: '🐸', text: 'Hüpfe 5× auf der Stelle wie ein Frosch!' },
  { emoji: '🌬️', text: 'Atme tief ein … und langsam aus. Dreimal.', breathing: true },
  { emoji: '🙆', text: 'Strecke dich ganz hoch zur Decke!' },
  { emoji: '🤸', text: 'Mache 5 Hampelmänner!' },
  { emoji: '🙌', text: 'Klatsche 10× in die Hände!' },
  { emoji: '🦩', text: 'Stehe auf einem Bein wie ein Flamingo und zähle bis 5!' },
  { emoji: '🌀', text: 'Kreise 5× mit den Armen!' },
  { emoji: '🎈', text: 'Puste wie in einen Luftballon – ganz langsam.', breathing: true },
]
