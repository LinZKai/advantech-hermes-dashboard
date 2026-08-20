import type { LucideIcon } from 'lucide-react'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: 'default' | 'positive' | 'warning' | 'negative'
  hint?: string
}

const TONE_CLASS: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: styles.iconDefault,
  positive: styles.iconPositive,
  warning: styles.iconWarning,
  negative: styles.iconNegative,
}

export function StatCard({ label, value, icon: Icon, tone = 'default', hint }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.textCol}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>
      {Icon && (
        <div className={`${styles.iconWrap} ${TONE_CLASS[tone]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  )
}
