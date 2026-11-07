import type { TimeState } from '../../core/types'

export function updateRecord(s: TimeState, score: number): { state: TimeState; isNewRecord: boolean } {
  return score > s.record ? { state: { record: score }, isNewRecord: true } : { state: s, isNewRecord: false }
}
