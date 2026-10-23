import { CATEGORY_TONES, type CategoryTone } from '@/shared/ui'
import {
  ALIAS_MAX_LENGTH,
  CATEGORY_NAME_MAX_LENGTH,
  isActive,
  MAX_ALIASES,
  type Category,
} from './category'

export const TONE_NAMES: Record<CategoryTone, string> = {
  1: 'azul',
  2: 'verde',
  3: 'naranja',
  4: 'rosa',
  5: 'amarillo',
  6: 'turquesa',
  7: 'rojo',
  8: 'lila',
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function validateName(value: string, takenNames: readonly string[]) {
  const name = normalizeName(value)
  if (name === '') {
    return 'Escribe un nombre.'
  }
  if (name.length > CATEGORY_NAME_MAX_LENGTH) {
    return `Usa ${String(CATEGORY_NAME_MAX_LENGTH)} caracteres o menos.`
  }
  const lowered = name.toLocaleLowerCase('es')
  if (takenNames.some((taken) => taken.toLocaleLowerCase('es') === lowered)) {
    return 'Ya existe con ese nombre.'
  }
  return null
}

export function normalizeAlias(value: string) {
  return value.trim().replace(/\s+/g, '').toLocaleLowerCase('es').slice(0, ALIAS_MAX_LENGTH)
}

export function addAlias(aliases: readonly string[], value: string) {
  const alias = normalizeAlias(value)
  if (alias === '' || aliases.includes(alias) || aliases.length >= MAX_ALIASES) {
    return null
  }
  return [...aliases, alias]
}

export function nextAvailableTone(categories: readonly Category[]): CategoryTone {
  const used = new Set(categories.filter(isActive).map((category) => category.tone))
  const free = CATEGORY_TONES.find((tone) => !used.has(tone))
  return free ?? CATEGORY_TONES[used.size % CATEGORY_TONES.length] ?? CATEGORY_TONES[0]
}

function pluralDays(days: number) {
  return days === 1 ? '1 día' : `${String(days)} días`
}

export function summarizeCategory(category: Category) {
  const parts = [
    category.importantByDefault ? 'Importante por defecto' : 'No importante por defecto',
    category.urgencyDays === null
      ? 'urgente según tu perfil'
      : `urgente a ${pluralDays(category.urgencyDays)}`,
  ]
  if (category.maxInProgress !== null) {
    parts.push(`máximo ${String(category.maxInProgress)} en curso`)
  }
  if (category.aliases.length > 0) {
    parts.push(`alias: ${category.aliases.join(', ')}`)
  }
  return parts.join(' · ')
}

export const STARTER_CATEGORIES = [
  { name: 'Estudios', tone: 1, importantByDefault: true, subcategories: ['Cursos', 'Tareas'] },
  {
    name: 'Trabajo',
    tone: 2,
    importantByDefault: true,
    subcategories: ['Administrativo', 'Proyectos'],
  },
  { name: 'Personal', tone: 4, importantByDefault: false, subcategories: [] },
] as const satisfies readonly {
  name: string
  tone: CategoryTone
  importantByDefault: boolean
  subcategories: readonly string[]
}[]
