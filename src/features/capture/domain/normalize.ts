export function foldText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
}

export function collapseSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}
