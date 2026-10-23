import styles from './Icon.module.css'

const ICON_PATHS = {
  search: ['M16 11a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z', 'm20 20-4.5-4.5'],
  inbox: ['M4 13 6 5h12l2 8v6H4z', 'M4 13h5l1 2h4l1-2h5'],
  settings: ['M4 7h9', 'M17 7h3', 'M15 5v4', 'M4 17h3', 'M11 17h9', 'M9 15v4'],
  plus: ['M12 5v14', 'M5 12h14'],
  close: ['M7 7l10 10', 'M17 7 7 17'],
  grip: ['M9 6h.01', 'M15 6h.01', 'M9 12h.01', 'M15 12h.01', 'M9 18h.01', 'M15 18h.01'],
  chevronDown: ['m6 9 6 6 6-6'],
} as const

export type IconName = keyof typeof ICON_PATHS

interface IconProps {
  name: IconName
}

export function Icon({ name }: IconProps) {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
      {ICON_PATHS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  )
}
