import { useCallback } from 'react'
import { useAppState } from './AppStateContext'

export type SoundKind = 'correct' | 'wrong' | 'reward' | 'tick'

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(ac: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = ac.currentTime + start
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

export function playSound(kind: SoundKind) {
  const ac = audio()
  if (!ac) return
  switch (kind) {
    case 'correct':
      tone(ac, 660, 0, 0.15)
      tone(ac, 880, 0.12, 0.22)
      break
    case 'wrong':
      tone(ac, 220, 0, 0.25, 'triangle', 0.12)
      break
    case 'reward':
      tone(ac, 523, 0, 0.15)
      tone(ac, 659, 0.12, 0.15)
      tone(ac, 784, 0.24, 0.15)
      tone(ac, 1047, 0.36, 0.35)
      break
    case 'tick':
      tone(ac, 1200, 0, 0.05, 'square', 0.05)
      break
  }
}

export function useSound(): (kind: SoundKind) => void {
  const { state } = useAppState()
  const on = state.settings.soundOn
  return useCallback((kind: SoundKind) => { if (on) playSound(kind) }, [on])
}
