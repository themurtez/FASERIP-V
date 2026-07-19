// Dice-rolling primitives shared by every generator. Kept tiny and pure so
// they're trivial to swap or unit-test independently of Pinia/Vue.

import type { RollRange } from '@/types/reference'

/** A d100 roll, 1-100 (100 stands in for the tabletop "00"). */
export function rollPercentile(): number {
  return Math.floor(Math.random() * 100) + 1
}

/** Look up which range a roll (or a fresh roll, if omitted) lands in. */
export function pickFromRanges<T extends RollRange>(ranges: T[], roll: number = rollPercentile()): T {
  const hit = ranges.find((r) => roll >= r.min && roll <= r.max)
  return hit ?? (ranges[ranges.length - 1] as T)
}

/** Uniform pick -- used everywhere a real weighted table isn't sourced yet (PLAN.md §6). */
export function pickUniform<T>(items: T[]): T {
  const idx = Math.floor(Math.random() * items.length)
  return items[idx] as T
}

/** Integer in [min, max], inclusive. */
export function rollRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
