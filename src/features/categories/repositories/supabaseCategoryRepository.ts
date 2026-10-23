import type { PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/shared/lib/database.types'
import type { AppSupabaseClient } from '@/shared/lib/supabase'
import { CATEGORY_TONES, type CategoryTone } from '@/shared/ui'
import type { Category, CategoryChanges, Subcategory, SubcategoryChanges } from '../domain/category'
import { bySortOrder } from '../domain/sortOrder'
import type { CategoryRepository } from './categoryRepository'

type CategoryRow = Database['public']['Tables']['categories']['Row']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']
type SubcategoryRow = Database['public']['Tables']['subcategories']['Row']

const UNIQUE_VIOLATION = '23505'
const SUBCATEGORY_COLUMNS = 'id, category_id, name, sort_order, archived_at'
const CATEGORY_COLUMNS = `id, name, color_slot, aliases, sort_order, important_by_default, urgency_days, max_in_progress, archived_at, subcategories(${SUBCATEGORY_COLUMNS})`

type SubcategorySelection = Pick<
  SubcategoryRow,
  'id' | 'category_id' | 'name' | 'sort_order' | 'archived_at'
>
type CategorySelection = Pick<
  CategoryRow,
  | 'id'
  | 'name'
  | 'color_slot'
  | 'aliases'
  | 'sort_order'
  | 'important_by_default'
  | 'urgency_days'
  | 'max_in_progress'
  | 'archived_at'
> & { subcategories: SubcategorySelection[] }

function toTone(value: number): CategoryTone {
  return CATEGORY_TONES.find((tone) => tone === value) ?? CATEGORY_TONES[0]
}

function toSubcategory(row: SubcategorySelection): Subcategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    sortOrder: row.sort_order,
    archivedAt: row.archived_at,
  }
}

function toCategory(row: CategorySelection): Category {
  return {
    id: row.id,
    name: row.name,
    tone: toTone(row.color_slot),
    aliases: row.aliases,
    sortOrder: row.sort_order,
    importantByDefault: row.important_by_default,
    urgencyDays: row.urgency_days,
    maxInProgress: row.max_in_progress,
    archivedAt: row.archived_at,
    subcategories: row.subcategories.map(toSubcategory).sort(bySortOrder),
  }
}

function toCategoryUpdate(changes: CategoryChanges): CategoryUpdate {
  return {
    ...(changes.name !== undefined ? { name: changes.name } : {}),
    ...(changes.tone !== undefined ? { color_slot: changes.tone } : {}),
    ...(changes.aliases !== undefined ? { aliases: changes.aliases } : {}),
    ...(changes.sortOrder !== undefined ? { sort_order: changes.sortOrder } : {}),
    ...(changes.importantByDefault !== undefined
      ? { important_by_default: changes.importantByDefault }
      : {}),
    ...(changes.urgencyDays !== undefined ? { urgency_days: changes.urgencyDays } : {}),
    ...(changes.maxInProgress !== undefined ? { max_in_progress: changes.maxInProgress } : {}),
    ...(changes.archivedAt !== undefined ? { archived_at: changes.archivedAt } : {}),
  }
}

function toSubcategoryUpdate(changes: SubcategoryChanges) {
  return {
    ...(changes.name !== undefined ? { name: changes.name } : {}),
    ...(changes.sortOrder !== undefined ? { sort_order: changes.sortOrder } : {}),
    ...(changes.archivedAt !== undefined ? { archived_at: changes.archivedAt } : {}),
  }
}

function failure(error: PostgrestError, duplicateMessage: string, fallbackMessage: string) {
  const message = error.code === UNIQUE_VIOLATION ? duplicateMessage : fallbackMessage
  return new Error(message, { cause: error })
}

const DUPLICATE_CATEGORY = 'Ya tienes una categoría activa con ese nombre.'
const DUPLICATE_SUBCATEGORY = 'Esa subcategoría ya existe en esta categoría.'
const SAVE_FAILED = 'No se pudieron guardar los cambios.'

export function createSupabaseCategoryRepository(client: AppSupabaseClient): CategoryRepository {
  return {
    async listCategories() {
      const { data, error } = await client
        .from('categories')
        .select(CATEGORY_COLUMNS)
        .order('sort_order')
      if (error) {
        throw new Error('No se pudieron cargar tus categorías.', { cause: error })
      }
      return data.map(toCategory)
    },
    async createCategory(input) {
      const { data, error } = await client
        .from('categories')
        .insert({ name: input.name, color_slot: input.tone, sort_order: input.sortOrder })
        .select(CATEGORY_COLUMNS)
        .single()
      if (error) {
        throw failure(error, DUPLICATE_CATEGORY, SAVE_FAILED)
      }
      return toCategory(data)
    },
    async updateCategory(id, changes) {
      const { error } = await client
        .from('categories')
        .update(toCategoryUpdate(changes))
        .eq('id', id)
      if (error) {
        throw failure(error, DUPLICATE_CATEGORY, SAVE_FAILED)
      }
    },
    async createSubcategory(input) {
      const { data, error } = await client
        .from('subcategories')
        .insert({ category_id: input.categoryId, name: input.name, sort_order: input.sortOrder })
        .select(SUBCATEGORY_COLUMNS)
        .single()
      if (error) {
        throw failure(error, DUPLICATE_SUBCATEGORY, SAVE_FAILED)
      }
      return toSubcategory(data)
    },
    async updateSubcategory(id, changes) {
      const { error } = await client
        .from('subcategories')
        .update(toSubcategoryUpdate(changes))
        .eq('id', id)
      if (error) {
        throw failure(error, DUPLICATE_SUBCATEGORY, SAVE_FAILED)
      }
    },
  }
}
