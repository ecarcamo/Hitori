import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import styles from './IconButton.module.css'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName
  label: string
  badge?: number
}

export function IconButton({ icon, label, badge, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} className={styles.button} aria-label={label} {...rest}>
      <Icon name={icon} />
      {badge ? (
        <span className={styles.badge} aria-hidden="true">
          {badge}
        </span>
      ) : null}
    </button>
  )
}
