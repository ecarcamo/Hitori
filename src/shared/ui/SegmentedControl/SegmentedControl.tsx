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
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
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
    <div className={styles.group} aria-label={label} {...groupProps}>
      {options.map((option, index) => (
        <button key={option.value} type="button" className={styles.option} {...getItemProps(index)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
