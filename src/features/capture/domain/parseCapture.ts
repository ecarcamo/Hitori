import { CONTEXT_LABELS, formatDue, formatDuration, type TaskContext } from '@/features/tasks'
import { findDueDate, normalizePeriods } from './captureDate'
import { collapseSpaces, foldText } from './normalize'

export type CaptureTokenKind = 'category' | 'due' | 'important' | 'duration' | 'context'

export interface CaptureSubcategory {
  id: string
  name: string
  aliases: readonly string[]
}

export interface CaptureCategory {
  id: string
  name: string
  aliases: readonly string[]
  importantByDefault: boolean
  subcategories: readonly CaptureSubcategory[]
}

export interface UnderstoodToken {
  kind: CaptureTokenKind
  label: string
}

export interface CaptureResult {
  title: string
  categoryId: string | null
  subcategoryId: string | null
  dueAt: string | null
  isImportant: boolean
  durationMin: number | null
  context: TaskContext | null
  understood: UnderstoodToken[]
}

export interface CaptureOptions {
  categories: readonly CaptureCategory[]
  now: Date
  timezone: string
  ignore?: ReadonlySet<CaptureTokenKind>
}

const MINUTES_PER_HOUR = 60
const IMPORTANT_PATTERN = /(^|\s)!+(?=\s|$)/g
const HOURS_PATTERN =
  /(^|\s)(\d+(?:[.,]\d+)?)\s?(?:h|hr|hrs|hora|horas)(?:\s?(\d{1,2})\s?(?:m|min)?)?(?=\s|$)/iu
const MINUTES_PATTERN = /(^|\s)(\d+)\s?(?:m|min|mins|minutos)(?=\s|$)/iu
const CONTEXT_PATTERN = /(^|\s)@(\p{L}+)(?=\s|$)/u
const DANGLING_BEFORE_DATE =
  /\s*\b(?:para el|para la|antes del|antes de|hasta el|para|el|la|del|de|en|a las|a)\s*$/iu

const CONTEXT_ALIASES: Readonly<Record<string, TaskContext>> = {
  casa: 'home',
  home: 'home',
  compu: 'computer',
  laptop: 'computer',
  pc: 'computer',
  u: 'campus',
  uni: 'campus',
  universidad: 'campus',
  campus: 'campus',
  oficina: 'office',
  trabajo: 'office',
  calle: 'errands',
  fuera: 'errands',
}

interface Extraction<T> {
  value: T
  text: string
}

function extractImportant(text: string): Extraction<boolean> {
  IMPORTANT_PATTERN.lastIndex = 0
  const found = IMPORTANT_PATTERN.test(text)
  return { value: found, text: found ? text.replace(IMPORTANT_PATTERN, ' ') : text }
}

function extractDuration(text: string): Extraction<number | null> {
  const hours = HOURS_PATTERN.exec(text)
  if (hours) {
    const total =
      Math.round(Number(hours[2]?.replace(',', '.')) * MINUTES_PER_HOUR) + Number(hours[3] ?? 0)
    return { value: total, text: text.replace(HOURS_PATTERN, ' ') }
  }
  const minutes = MINUTES_PATTERN.exec(text)
  if (minutes) {
    return { value: Number(minutes[2]), text: text.replace(MINUTES_PATTERN, ' ') }
  }
  return { value: null, text }
}

function extractContext(text: string): Extraction<TaskContext | null> {
  const match = CONTEXT_PATTERN.exec(text)
  const context = match?.[2] ? CONTEXT_ALIASES[foldText(match[2])] : undefined
  return context
    ? { value: context, text: text.replace(CONTEXT_PATTERN, ' ') }
    : { value: null, text }
}

interface CategoryMatch {
  category: CaptureCategory
  subcategory: CaptureSubcategory | null
}

function tokenKey(token: string) {
  return foldText(token.replace(/^#/, '').replace(/[^\p{L}\p{N}]/gu, ''))
}

function matchesName(name: string, key: string) {
  return foldText(name).replace(/\s+/g, '') === key
}

function findTarget(categories: readonly CaptureCategory[], token: string): CategoryMatch | null {
  const key = tokenKey(token)
  if (key === '') {
    return null
  }
  const explicit = token.startsWith('#')
  for (const category of categories) {
    if (category.aliases.some((alias) => foldText(alias) === key)) {
      return { category, subcategory: null }
    }
    if (explicit && matchesName(category.name, key)) {
      return { category, subcategory: null }
    }
    const subcategory = category.subcategories.find(
      (item) =>
        item.aliases.some((alias) => foldText(alias) === key) ||
        (explicit && matchesName(item.name, key)),
    )
    if (subcategory) {
      return { category, subcategory }
    }
  }
  return null
}

function refine(match: CategoryMatch | null, found: CategoryMatch | null): CategoryMatch | null {
  if (!found) {
    return null
  }
  if (match === null) {
    return found
  }
  const addsSubcategory =
    match.subcategory === null &&
    found.subcategory !== null &&
    found.category.id === match.category.id
  return addsSubcategory ? { category: match.category, subcategory: found.subcategory } : null
}

function extractCategory(
  text: string,
  categories: readonly CaptureCategory[],
): Extraction<CategoryMatch | null> {
  let match: CategoryMatch | null = null
  const kept: string[] = []
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const refined = refine(match, findTarget(categories, token))
    if (refined) {
      match = refined
    } else {
      kept.push(token)
    }
  }
  return { value: match, text: kept.join(' ') }
}

function extractDue(text: string, now: Date, timezone: string): Extraction<string | null> {
  const normalized = normalizePeriods(text)
  const found = findDueDate(normalized, now, timezone)
  if (!found) {
    return { value: null, text }
  }
  const before = normalized.slice(0, found.index).replace(DANGLING_BEFORE_DATE, ' ')
  const after = normalized.slice(found.index + found.text.length)
  return { value: found.dueAt, text: `${before} ${after}` }
}

function categoryLabel(match: CategoryMatch) {
  return match.subcategory
    ? `${match.category.name} · ${match.subcategory.name}`
    : match.category.name
}

export function parseCapture(input: string, options: CaptureOptions): CaptureResult {
  const ignore = options.ignore ?? new Set<CaptureTokenKind>()
  let text = input
  const understood: UnderstoodToken[] = []

  const important = ignore.has('important') ? { value: false, text } : extractImportant(text)
  text = important.text

  const duration = ignore.has('duration') ? { value: null, text } : extractDuration(text)
  text = duration.text

  const context = ignore.has('context') ? { value: null, text } : extractContext(text)
  text = context.text

  const category = ignore.has('category')
    ? { value: null, text }
    : extractCategory(text, options.categories)
  text = category.text

  const due = ignore.has('due')
    ? { value: null, text }
    : extractDue(text, options.now, options.timezone)
  text = due.text

  const isImportant =
    !ignore.has('important') &&
    (important.value || (category.value?.category.importantByDefault ?? false))

  if (category.value) {
    understood.push({ kind: 'category', label: categoryLabel(category.value) })
  }
  if (due.value) {
    understood.push({ kind: 'due', label: formatDue(due.value, options.now, options.timezone) })
  }
  if (isImportant) {
    understood.push({ kind: 'important', label: 'Importante' })
  }
  if (duration.value !== null) {
    understood.push({ kind: 'duration', label: formatDuration(duration.value) })
  }
  if (context.value) {
    understood.push({ kind: 'context', label: CONTEXT_LABELS[context.value] })
  }

  return {
    title: collapseSpaces(text),
    categoryId: category.value?.category.id ?? null,
    subcategoryId: category.value?.subcategory?.id ?? null,
    dueAt: due.value,
    isImportant,
    durationMin: duration.value,
    context: context.value,
    understood,
  }
}
