import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import styles from './AsyncState.module.css'

export function LoadingState({ label = '載入中...' }: { label?: string }) {
  return (
    <div className={styles.panel}>
      <Loader2 size={22} className={styles.spinner} />
      <p className={styles.text}>{label}</p>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className={styles.panel}>
      <Inbox size={22} className={styles.mutedIcon} />
      <p className={styles.text}>{title}</p>
      {description && <p className={styles.subText}>{description}</p>}
    </div>
  )
}

export function ErrorState({
  title = '發生錯誤',
  description,
  actions,
}: {
  title?: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className={`${styles.panel} ${styles.errorPanel}`}>
      <AlertTriangle size={22} className={styles.errorIcon} />
      <p className={styles.text}>{title}</p>
      {description && <p className={styles.subText}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
