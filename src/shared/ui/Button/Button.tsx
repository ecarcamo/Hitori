import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from './Button.module.css'

type ButtonVariant = 'default' | 'accent' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'default',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], className)}
      {...rest}
    />
  )
}
