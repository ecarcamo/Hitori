export const CATEGORY_TONES = [1, 2, 3, 4, 5, 6, 7, 8] as const
export type CategoryTone = (typeof CATEGORY_TONES)[number]

export function categoryToneVar(tone: CategoryTone) {
  return `var(--cat-${String(tone)})`
}
