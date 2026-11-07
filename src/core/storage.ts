import type { AppState, ConceptStates, Level, Profile, Settings } from './types'

export const STORAGE_KEY = 'adhs-mathe:v1'

export const DEFAULT_SETTINGS: Settings = {
  soundOn: true,
  roundLength: 10,
  timeChallengeSeconds: 60,
  pauseSeconds: 20,
}

export function emptyConcepts(): ConceptStates {
  return {
    points: { total: 0, bestStreak: 0, badges: [] },
    pet: { name: null, fed: 0 },
    chest: { keys: 0, cards: [] },
    map: { position: 0 },
    time: { record: 0 },
  }
}

function defaultState(): AppState {
  return { settings: { ...DEFAULT_SETTINGS }, activeProfileId: null, profiles: [] }
}

const clamp = (v: unknown, min: number, max: number, fallback: number) => {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback
  return Math.min(max, Math.max(min, n))
}

export function clampSettings(s: Partial<Settings>): Settings {
  return {
    soundOn: typeof s.soundOn === 'boolean' ? s.soundOn : DEFAULT_SETTINGS.soundOn,
    roundLength: clamp(s.roundLength, 5, 20, DEFAULT_SETTINGS.roundLength),
    timeChallengeSeconds: clamp(s.timeChallengeSeconds, 30, 180, DEFAULT_SETTINGS.timeChallengeSeconds),
    pauseSeconds: clamp(s.pauseSeconds, 10, 60, DEFAULT_SETTINGS.pauseSeconds),
  }
}

function normalizeProfile(p: Partial<Profile>): Profile {
  const empty = emptyConcepts()
  const c = (p.concepts ?? {}) as Partial<ConceptStates>
  return {
    id: String(p.id),
    kuerzel: String(p.kuerzel ?? '?'),
    level: ([1, 2, 3].includes(p.level as number) ? p.level : 1) as Level,
    createdAt: p.createdAt ?? new Date().toISOString(),
    usedTaskIds: { 1: [], 2: [], 3: [], ...(p.usedTaskIds ?? {}) },
    concepts: {
      points: { ...empty.points, ...c.points },
      pet: { ...empty.pet, ...c.pet },
      chest: { ...empty.chest, ...c.chest },
      map: { ...empty.map, ...c.map },
      time: { ...empty.time, ...c.time },
    },
  }
}

export function loadState(storage?: Storage): AppState {
  try {
    const raw = (storage ?? window.localStorage).getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const profiles = Array.isArray(parsed.profiles) ? parsed.profiles.map(normalizeProfile) : []
    const activeProfileId = profiles.some((p) => p.id === parsed.activeProfileId)
      ? (parsed.activeProfileId as string)
      : null
    return { settings: clampSettings(parsed.settings ?? {}), activeProfileId, profiles }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState, storage?: Storage): void {
  try {
    ;(storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Speichern fehlgeschlagen', e)
  }
}

export function validateKuerzel(kuerzel: string, profiles: Profile[]): string | null {
  const k = kuerzel.trim()
  if (!k) return 'Bitte ein Kürzel eingeben.'
  if (k.length > 12) return 'Maximal 12 Zeichen.'
  if (profiles.some((p) => p.kuerzel.toLowerCase() === k.toLowerCase())) return 'Dieses Kürzel gibt es schon.'
  return null
}

export type AppAction =
  | { type: 'addProfile'; kuerzel: string; level: Level; id: string; createdAt: string }
  | { type: 'deleteProfile'; id: string }
  | { type: 'setActive'; id: string | null }
  | { type: 'setLevel'; id: string; level: Level }
  | { type: 'updateProfile'; id: string; update: (p: Profile) => Profile }
  | { type: 'updateSettings'; patch: Partial<Settings> }

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'addProfile':
      return {
        ...state,
        profiles: [
          ...state.profiles,
          {
            id: action.id,
            kuerzel: action.kuerzel.trim(),
            level: action.level,
            createdAt: action.createdAt,
            usedTaskIds: { 1: [], 2: [], 3: [] },
            concepts: emptyConcepts(),
          },
        ],
      }
    case 'deleteProfile':
      return {
        ...state,
        profiles: state.profiles.filter((p) => p.id !== action.id),
        activeProfileId: state.activeProfileId === action.id ? null : state.activeProfileId,
      }
    case 'setActive':
      return { ...state, activeProfileId: action.id }
    case 'setLevel':
      return {
        ...state,
        profiles: state.profiles.map((p) => (p.id === action.id ? { ...p, level: action.level } : p)),
      }
    case 'updateProfile':
      return { ...state, profiles: state.profiles.map((p) => (p.id === action.id ? action.update(p) : p)) }
    case 'updateSettings':
      return { ...state, settings: clampSettings({ ...state.settings, ...action.patch }) }
  }
}
