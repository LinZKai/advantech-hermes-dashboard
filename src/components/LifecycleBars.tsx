import styles from './LifecycleBars.module.css'

interface LifecycleStage {
  label: string
  value: number
  group: 'proposal' | 'curator'
}

const TONE_CLASS: Record<LifecycleStage['group'], string> = {
  proposal: styles.barProposal,
  curator: styles.barCurator,
}

export function LifecycleBars({ stages }: { stages: LifecycleStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.value))

  return (
    <div className={styles.list}>
      {stages.map((stage) => (
        <div key={`${stage.group}-${stage.label}`} className={styles.row}>
          <span className={styles.label}>{stage.label}</span>
          <div className={styles.track}>
            <div
              className={`${styles.fill} ${TONE_CLASS[stage.group]}`}
              style={{ width: `${(stage.value / max) * 100}%` }}
            />
          </div>
          <span className={styles.value}>{stage.value}</span>
        </div>
      ))}
    </div>
  )
}

export type { LifecycleStage }
