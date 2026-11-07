import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { appReducer, loadState, saveState, type AppAction } from './storage'
import type { AppState, ConceptStates, Profile } from './types'

interface Ctx {
  state: AppState
  dispatch: (a: AppAction) => void
}

const AppStateContext = createContext<Ctx | null>(null)

export function AppStateProvider({ children, storage }: { children: ReactNode; storage?: Storage }) {
  const [state, dispatch] = useReducer(appReducer, undefined, () => loadState(storage))
  useEffect(() => saveState(state, storage), [state, storage])
  return <AppStateContext.Provider value={{ state, dispatch }}>{children}</AppStateContext.Provider>
}

export function useAppState(): Ctx {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState außerhalb von AppStateProvider')
  return ctx
}

export function useActiveProfile(): Profile | null {
  const { state } = useAppState()
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? null
}

export function useConceptState<K extends keyof ConceptStates>(
  key: K,
): [ConceptStates[K], (next: ConceptStates[K] | ((prev: ConceptStates[K]) => ConceptStates[K])) => void] {
  const { dispatch } = useAppState()
  const profile = useActiveProfile()
  if (!profile) throw new Error('Kein aktives Profil')
  const id = profile.id
  const set = useCallback(
    (next: ConceptStates[K] | ((prev: ConceptStates[K]) => ConceptStates[K])) =>
      dispatch({
        type: 'updateProfile',
        id,
        update: (p) => ({
          ...p,
          concepts: {
            ...p.concepts,
            [key]: typeof next === 'function' ? (next as (prev: ConceptStates[K]) => ConceptStates[K])(p.concepts[key]) : next,
          },
        }),
      }),
    [dispatch, id, key],
  )
  return [profile.concepts[key], set]
}
