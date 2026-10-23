import type { CategoryTone } from '@/shared/ui'

export const CATEGORY_NAME_MAX_LENGTH = 60
export const ALIAS_MAX_LENGTH = 30
export const MAX_ALIASES = 20
export const URGENCY_DAY_CHOICES = [1, 3, 7] as const
export const IN_PROGRESS_LIMIT_CHOICES = [1, 2, 3] as const

export interface Subcategory {
  id: string
  categoryId: string
  name: string
  sortOrder: string
  archivedAt: string | null
}

export interface Category {
  id: string
  name: string
  tone: CategoryTone
  aliases: string[]
  sortOrder: string
  importantByDefault: boolean
  urgencyDays: number | null
  maxInProgress: number | null
  archivedAt: string | null
  subcategories: Subcategory[]
}

export interface NewCategory {
  name: string
  tone: CategoryTone
  sortOrder: string
}

export type CategoryChanges = Partial<
  Pick<
    Category,
    | 'name'
    | 'tone'
    | 'aliases'
    | 'sortOrder'
    | 'importantByDefault'
    | 'urgencyDays'
    | 'maxInProgress'
    | 'archivedAt'
  >
>

export interface NewSubcategory {
  categoryId: string
  name: string
  sortOrder: string
}

export type SubcategoryChanges = Partial<Pick<Subcategory, 'name' | 'sortOrder' | 'archivedAt'>>

export function isActive(item: { archivedAt: string | null }) {
  return item.archivedAt === null
}
