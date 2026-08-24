import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApiData } from '../api/useApiData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import { ConfidenceBadge, StatusBadge } from '../components/StatusBadge'
import type { CaseListItem } from '../types/api'
import styles from './CasesPage.module.css'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

const EMPTY_CASES: never[] = []

// The event time this row is filtered/sorted by for "Time Range": the most
// recent feedback submission when this Case has feedback (the actual user
// action a demo is usually looking for), falling back to the Case's last
// turn activity when it has none yet -- a Case with case_analysis always
// has at least one turn, so this is never null in practice.
function effectiveEventTime(c: CaseListItem): string | null {
  return c.latest_feedback_submitted_at ?? c.latest_activity
}

type TimeRangeFilter = 'all' | '7d' | '30d'
type FeedbackFilter = 'all' | 'with' | 'positive' | 'negative' | 'none'

const TIME_RANGE_DAYS: Record<Exclude<TimeRangeFilter, 'all'>, number> = { '7d': 7, '30d': 30 }

function matchesTimeRange(c: CaseListItem, filter: TimeRangeFilter, now: number): boolean {
  if (filter === 'all') return true
  const eventTime = effectiveEventTime(c)
  if (!eventTime) return false
  const days = TIME_RANGE_DAYS[filter]
  return now - new Date(eventTime).getTime() <= days * 24 * 60 * 60 * 1000
}

function matchesFeedback(c: CaseListItem, filter: FeedbackFilter): boolean {
  switch (filter) {
    case 'with':
      return c.feedback_summary.total > 0
    case 'positive':
      return c.feedback_summary.helpful_count > 0
    case 'negative':
      return c.feedback_summary.negative_count > 0
    case 'none':
      return c.feedback_summary.total === 0
    default:
      return true
  }
}

export function CasesPage() {
  const state = useApiData(() => api.listCases(), [])
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all')
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all')
  const [issueTypeFilter, setIssueTypeFilter] = useState('all')
  // Snapshot "now" once on mount rather than calling Date.now() during
  // render: the Time Range filter only needs a stable reference point, not
  // a live-ticking clock.
  const [now] = useState(() => Date.now())

  const cases = state.status === 'success' ? state.data : EMPTY_CASES

  const issueTypes = useMemo(() => Array.from(new Set(cases.map((c) => c.issue_type))).sort(), [cases])

  const filtered = useMemo(() => {
    return cases.filter(
      (c) =>
        matchesTimeRange(c, timeRange, now) &&
        matchesFeedback(c, feedbackFilter) &&
        (issueTypeFilter === 'all' || c.issue_type === issueTypeFilter),
    )
  }, [cases, timeRange, feedbackFilter, issueTypeFilter, now])

  const hasActiveFilters = timeRange !== 'all' || feedbackFilter !== 'all' || issueTypeFilter !== 'all'

  function clearFilters() {
    setTimeRange('all')
    setFeedbackFilter('all')
    setIssueTypeFilter('all')
  }

  return (
    <>
      <PageHeader title="Cases & Feedback" description="使用者反饋所產生的案例與 case intelligence" />

      {state.status === 'loading' && <LoadingState label="正在載入案例列表..." />}

      {state.status === 'error' && (
        <ErrorState
          description={state.error.message}
          actions={
            <button className="btn btn-outline" onClick={state.refetch}>
              重試
            </button>
          }
        />
      )}

      {state.status === 'success' && cases.length === 0 && (
        <EmptyState title="目前沒有任何 case" description="Fresh DB 尚無資料,等待 case enrichment 產生內容。" />
      )}

      {state.status === 'success' && cases.length > 0 && (
        <div className={`surface-card ${styles.card}`}>
          <div className={styles.filterBar}>
            <div className={styles.filters}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRangeFilter)}
                className={styles.select}
              >
                <option value="all">All time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <select
                value={feedbackFilter}
                onChange={(e) => setFeedbackFilter(e.target.value as FeedbackFilter)}
                className={styles.select}
              >
                <option value="all">All Feedback</option>
                <option value="with">With Feedback</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="none">No Feedback</option>
              </select>
              <select
                value={issueTypeFilter}
                onChange={(e) => setIssueTypeFilter(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Issue Types</option>
                {issueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button className="btn btn-outline" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
            <p className={styles.count}>
              {filtered.length} case{filtered.length === 1 ? '' : 's'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.filteredEmptyWrap}>
              <EmptyState
                title="No cases match the selected filters."
                description="調整或清除篩選條件以查看其他 case。"
              />
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Product</th>
                    <th>Issue Type</th>
                    <th>Diagnosis</th>
                    <th>Confidence</th>
                    <th>Turns</th>
                    <th>Feedback</th>
                    <th>Latest Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.case_id} className={styles.row} onClick={() => navigate(`/cases/${c.case_id}`)}>
                      <td className={styles.titleCell}>{c.case_title ?? c.case_id}</td>
                      <td>{c.product_model ?? '—'}</td>
                      <td>{c.issue_type}</td>
                      <td>
                        <StatusBadge label={c.diagnosis} tone="neutral" />
                      </td>
                      <td>
                        <ConfidenceBadge value={c.confidence} />
                      </td>
                      <td>{c.turn_count}</td>
                      <td>
                        <span className={styles.feedbackSummary}>
                          <span className={styles.helpfulCount}>+{c.feedback_summary.helpful_count}</span>
                          <span className={styles.negativeCount}>-{c.feedback_summary.negative_count}</span>
                          <span className={styles.totalCount}>({c.feedback_summary.total})</span>
                        </span>
                      </td>
                      <td className={styles.muted}>{formatDate(c.latest_activity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  )
}
