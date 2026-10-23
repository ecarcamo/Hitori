import {
  SegmentedControl,
  SelectField,
  TextField,
  type SegmentedOption,
  type SelectOption,
} from '@/shared/ui'
import { fromDateTimeInput, toDateTimeInput } from '../domain/dueDate'
import {
  CONTEXT_LABELS,
  DURATION_CHOICES,
  ENERGY_LABELS,
  ENERGY_LEVELS,
  TASK_CONTEXTS,
  type EnergyLevel,
  type TaskContext,
  type TaskFields,
} from '../domain/task'
import { formatDuration } from '../domain/formatDuration'
import styles from './TaskForm.module.css'

const ANY = ''
const ANY_ENERGY = 'any'

const ENERGY_OPTIONS: readonly SegmentedOption<string>[] = [
  { value: ANY_ENERGY, label: 'Cualquiera' },
  ...ENERGY_LEVELS.map((level) => ({ value: level, label: ENERGY_LABELS[level] })),
]

const DURATION_OPTIONS: readonly SelectOption[] = [
  { value: ANY, label: 'Sin estimar' },
  ...DURATION_CHOICES.map((minutes) => ({
    value: String(minutes),
    label: formatDuration(minutes),
  })),
]

const CONTEXT_OPTIONS: readonly SelectOption[] = [
  { value: ANY, label: 'Cualquier lugar' },
  ...TASK_CONTEXTS.map((context) => ({ value: context, label: CONTEXT_LABELS[context] })),
]

function isTaskContext(value: string): value is TaskContext {
  return TASK_CONTEXTS.some((context) => context === value)
}

function isEnergyLevel(value: string): value is EnergyLevel {
  return ENERGY_LEVELS.some((level) => level === value)
}

interface TaskPlanningFieldsProps {
  draft: TaskFields
  timezone: string
  onChange: (changes: Partial<TaskFields>) => void
}

export function TaskPlanningFields({ draft, timezone, onChange }: TaskPlanningFieldsProps) {
  return (
    <>
      <TextField
        label="Fecha límite"
        type="datetime-local"
        value={toDateTimeInput(draft.dueAt, timezone)}
        onChange={(event) => {
          onChange({ dueAt: fromDateTimeInput(event.target.value, timezone) })
        }}
      />
      <div className={styles.row}>
        <SelectField
          label="Duración"
          options={DURATION_OPTIONS}
          value={draft.durationMin === null ? ANY : String(draft.durationMin)}
          onChange={(event) => {
            onChange({
              durationMin: event.target.value === ANY ? null : Number(event.target.value),
            })
          }}
        />
        <SelectField
          label="Dónde"
          options={CONTEXT_OPTIONS}
          value={draft.context ?? ANY}
          onChange={(event) => {
            const { value } = event.target
            onChange({ context: isTaskContext(value) ? value : null })
          }}
        />
      </div>
      <div className={styles.group}>
        <span className={styles.groupLabel}>Energía</span>
        <SegmentedControl
          label="Energía"
          options={ENERGY_OPTIONS}
          value={draft.energy ?? ANY_ENERGY}
          fullWidth
          onChange={(value) => {
            onChange({ energy: isEnergyLevel(value) ? value : null })
          }}
        />
      </div>
    </>
  )
}
