import { cx } from '@/shared/lib/cx'
import { useRovingRadioGroup } from '../RadioGroup/useRovingRadioGroup'
import styles from './SegmentedControl.module.css'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  options: readonly SegmentedOption<T>[]
  value: T | undefined
  onChange: (value: T) => void
  fullWidth?: boolean
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  fullWidth = false,
}: SegmentedControlProps<T>) {
  const { groupProps, getItemProps } = useRovingRadioGroup({
    count: options.length,
    selectedIndex: options.findIndex((option) => option.value === value),
    onSelect: (index) => {
      const option = options[index]
      if (option) {
        onChange(option.value)
      }
    },
  })

  return (
    <div
      className={cx(styles.group, fullWidth && styles.fullWidth)}
      aria-label={label}
      {...groupProps}
    >
      {options.map((option, index) => (
        <button key={option.value} type="button" className={styles.option} {...getItemProps(index)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
