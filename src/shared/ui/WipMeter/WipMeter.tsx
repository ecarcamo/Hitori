import styles from './WipMeter.module.css'

interface WipMeterProps {
  used: number
  limit: number
}

export function WipMeter({ used, limit }: WipMeterProps) {
  const slots = Math.max(limit, used)
  return (
    <span
      className={styles.meter}
      role="img"
      aria-label={`${String(used)} de ${String(limit)} en curso`}
    >
      {Array.from({ length: slots }, (_, index) => {
        const isOver = index >= limit
        const isUsed = index < used
        const className = isOver ? styles.over : isUsed ? styles.used : undefined
        return <i key={index} className={className} />
      })}
    </span>
  )
}
