import { CheckCircle2, FolderKanban, Lightbulb, MessageSquareText, ThumbsDown, ThumbsUp } from 'lucide-react'
import { api } from '../api/client'
import { useApiData } from '../api/useApiData'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { DistributionChart } from '../components/DistributionChart'
import { LifecycleBars } from '../components/LifecycleBars'
import { LoadingState, ErrorState } from '../components/AsyncState'
import styles from './OverviewPage.module.css'

export function OverviewPage() {
  const state = useApiData(() => api.getOverview(), [])

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title="Overview" description="Hermes Feedback Intelligence 總覽" />
        <LoadingState label="正在載入總覽資料..." />
      </>
    )
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title="Overview" description="Hermes Feedback Intelligence 總覽" />
        <ErrorState
          description={state.error.message}
          actions={
            <button className="btn btn-outline" onClick={state.refetch}>
              重試
            </button>
          }
        />
      </>
    )
  }

  const overview = state.data
  const helpfulPct = Math.round(overview.helpful_ratio * 100)
  const appliedChanges = overview.curator_changes.status_distribution['applied'] ?? 0

  return (
    <>
      <PageHeader title="Overview" description="Hermes Feedback Intelligence 總覽" />

      <div className="stat-grid">
        <StatCard label="Total Cases" value={overview.total_cases} icon={FolderKanban} />
        <StatCard label="Total Feedback" value={overview.total_feedback} icon={MessageSquareText} />
        <StatCard label="Helpful Rate" value={`${helpfulPct}%`} icon={ThumbsUp} tone="positive" />
        <StatCard label="Negative Feedback" value={overview.negative_count} icon={ThumbsDown} tone="negative" />
        <StatCard label="Improvements" value={overview.improvement_proposals.total} icon={Lightbulb} tone="warning" />
        <StatCard label="Applied Changes" value={appliedChanges} icon={CheckCircle2} tone="positive" />
      </div>

      <div className={styles.chartGrid}>
        <DistributionChart title="Feedback Reason Distribution" data={overview.negative_reason_distribution} />
        <DistributionChart
          title="Case Diagnosis Distribution"
          data={overview.case_diagnosis_distribution}
          color="var(--color-primary)"
        />
        <DistributionChart
          title="Product Distribution"
          data={overview.product_model_distribution}
          color="var(--color-accent)"
        />
      </div>

      <div className={`surface-card ${styles.lifecycleCard}`}>
        <p className="section-title">Improvement Lifecycle</p>
        <LifecycleBars
          stages={[
            { label: 'Pending', value: overview.improvement_proposals.review_status_distribution['pending'] ?? 0, group: 'proposal' },
            { label: 'Accepted', value: overview.improvement_proposals.review_status_distribution['accepted'] ?? 0, group: 'proposal' },
            { label: 'Rejected', value: overview.improvement_proposals.review_status_distribution['rejected'] ?? 0, group: 'proposal' },
            { label: 'Proposed', value: overview.curator_changes.status_distribution['proposed'] ?? 0, group: 'curator' },
            { label: 'Approved', value: overview.curator_changes.status_distribution['approved'] ?? 0, group: 'curator' },
            { label: 'Applied', value: overview.curator_changes.status_distribution['applied'] ?? 0, group: 'curator' },
          ]}
        />
      </div>
    </>
  )
}
