export type Level = 1 | 2 | 3
export type Topic = 'einmaleins' | 'plus' | 'minus' | 'geteilt' | 'text'

export interface Task {
  id: string
  level: Level
  topic: Topic
  type: 'input' | 'choice'
  question: string
  answer: number
  choices?: number[]
}

export interface Settings {
  soundOn: boolean
  roundLength: number
  timeChallengeSeconds: number
  pauseSeconds: number
}

export interface PointsState { total: number; bestStreak: number; badges: string[] }
export interface PetState { name: string | null; fed: number }
export interface ChestState { keys: number; cards: string[] }
export interface MapState { position: number }
export interface TimeState { record: number }

export interface ConceptStates {
  points: PointsState
  pet: PetState
  chest: ChestState
  map: MapState
  time: TimeState
}

export interface Profile {
  id: string
  kuerzel: string
  level: Level
  createdAt: string
  usedTaskIds: Record<Level, string[]>
  concepts: ConceptStates
}

export interface AppState {
  settings: Settings
  activeProfileId: string | null
  profiles: Profile[]
}
