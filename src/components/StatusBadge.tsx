import styles from './StatusBadge.module.css'
import type { BadgeTone } from './statusTone'

export type { BadgeTone }

interface StatusBadgeProps {
  label: string
  tone?: BadgeTone
}

const TONE_CLASS: Record<BadgeTone, string> = {
  positive: styles.positive,
  warning: styles.warning,
  negative: styles.negative,
  neutral: styles.neutral,
  primary: styles.primary,
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return <span className={`${styles.badge} ${TONE_CLASS[tone]}`}>{label}</span>
}

interface ConfidenceBadgeProps {
  value: number
}

export function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  const pct = Math.round(value * 100)
  const tone: BadgeTone = pct >= 75 ? 'positive' : pct >= 45 ? 'warning' : 'negative'
  return (
    <span className={styles.confidenceWrap}>
      <span className={styles.confidenceTrack}>
        <span
          className={`${styles.confidenceFill} ${TONE_CLASS[tone]}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </span>
      <span className={styles.confidenceValue}>{pct}%</span>
    </span>
  )
}
