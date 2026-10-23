export const PRIMARY_VIEWS = [
  { to: '/now', label: 'Ahora' },
  { to: '/board', label: 'Tablero' },
  { to: '/matrix', label: 'Matriz' },
  { to: '/week', label: 'Semana' },
  { to: '/inbox', label: 'Bandeja' },
] as const

export const SETTINGS_VIEWS = [
  { to: '/settings/account', label: 'Cuenta' },
  { to: '/settings/categories', label: 'Categorías' },
  { to: '/settings/appearance', label: 'Apariencia' },
] as const

export const MOBILE_LEADING_TABS = [
  { to: '/now', label: 'Ahora' },
  { to: '/board', label: 'Tablero' },
] as const

export const MOBILE_TRAILING_TABS = [
  { to: '/week', label: 'Semana' },
  { to: '/matrix', label: 'Matriz' },
] as const

export const HOME_PATH = '/now'
