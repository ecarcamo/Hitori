import { parseCapture, type CaptureCategory, type CaptureTokenKind } from './parseCapture'

const NOW = new Date('2026-10-22T20:00:00Z')
const TIMEZONE = 'America/Guatemala'

const CATEGORIES: CaptureCategory[] = [
  {
    id: 'u',
    name: 'U',
    aliases: ['uvg'],
    importantByDefault: true,
    subcategories: [
      { id: 'u-cursos', name: 'Cursos', aliases: ['ingsoft', 'so'] },
      { id: 'u-aux', name: 'Auxiliaturas', aliases: ['iot'] },
    ],
  },
  {
    id: 'w',
    name: 'Trabajo',
    aliases: ['sento'],
    importantByDefault: false,
    subcategories: [{ id: 'w-codigo', name: 'Código', aliases: [] }],
  },
  { id: 'p', name: 'Mi casa', aliases: [], importantByDefault: false, subcategories: [] },
]

function parse(input: string, ignore: CaptureTokenKind[] = []) {
  return parseCapture(input, {
    categories: CATEGORIES,
    now: NOW,
    timezone: TIMEZONE,
    ignore: new Set(ignore),
  })
}

describe('parseCapture', () => {
  it('understands the example from the plan', () => {
    expect(parse('Entregar Tarea 6 IngSoft vie 8pm !')).toEqual({
      title: 'Entregar Tarea 6',
      categoryId: 'u',
      subcategoryId: 'u-cursos',
      dueAt: '2026-10-24T02:00:00.000Z',
      isImportant: true,
      durationMin: null,
      context: null,
      understood: [
        { kind: 'category', label: 'U · Cursos' },
        { kind: 'due', label: 'mañana 20:00' },
        { kind: 'important', label: 'Importante' },
      ],
    })
  })

  it('keeps a plain title untouched', () => {
    const result = parse('Comprar pan')
    expect(result.title).toBe('Comprar pan')
    expect(result.understood).toEqual([])
    expect(result.categoryId).toBeNull()
  })

  it('reads durations and places', () => {
    const result = parse('Llenar hoja de horas sento 10min @compu')
    expect(result).toMatchObject({
      title: 'Llenar hoja de horas',
      categoryId: 'w',
      durationMin: 10,
      context: 'computer',
      isImportant: false,
    })
  })

  it.each([
    ['Estudiar 1h30', 90],
    ['Estudiar 2 h', 120],
    ['Estudiar 1,5 horas', 90],
    ['Estudiar 45 min', 45],
  ])('reads %s as %i minutes', (input, minutes) => {
    expect(parse(input)).toMatchObject({ title: 'Estudiar', durationMin: minutes })
  })

  it('matches categories and subcategories by name only with #', () => {
    expect(parse('Revisar #trabajo #codigo')).toMatchObject({
      title: 'Revisar',
      categoryId: 'w',
      subcategoryId: 'w-codigo',
    })
    expect(parse('Pasar por la casa del trabajo').categoryId).toBeNull()
  })

  it('matches names with spaces and accents when written with #', () => {
    expect(parse('Barrer #micasa').categoryId).toBe('p')
    expect(parse('Arreglar #Codigo').subcategoryId).toBe('w-codigo')
  })

  it('uses the end of the day when the date has no hour', () => {
    expect(parse('Parcial el viernes')).toMatchObject({
      title: 'Parcial',
      dueAt: '2026-10-24T05:59:00.000Z',
    })
  })

  it('understands «de la noche» and removes the words around the date', () => {
    expect(parse('Lab 5 para el lunes a las 8 de la noche')).toMatchObject({
      title: 'Lab 5',
      dueAt: '2026-10-27T02:00:00.000Z',
    })
  })

  it('understands relative days', () => {
    expect(parse('Llamar a Ana mañana a las 10')).toMatchObject({
      title: 'Llamar a Ana',
      dueAt: '2026-10-23T16:00:00.000Z',
    })
  })

  it('marks importance with ! or by the category default', () => {
    expect(parse('Algo !').isImportant).toBe(true)
    expect(parse('Algo uvg').isImportant).toBe(true)
    expect(parse('Algo sento').isImportant).toBe(false)
  })

  it('can ignore what the person removed from the preview', () => {
    const result = parse('Entregar Tarea 6 IngSoft vie 8pm !', ['due', 'category'])
    expect(result.title).toBe('Entregar Tarea 6 IngSoft vie 8pm')
    expect(result.dueAt).toBeNull()
    expect(result.categoryId).toBeNull()
    expect(result.isImportant).toBe(true)
  })

  it('leaves the title empty when only metadata was written', () => {
    expect(parse('mañana !').title).toBe('')
  })
})
