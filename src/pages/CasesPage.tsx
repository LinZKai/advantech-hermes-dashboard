import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApiData } from '../api/useApiData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import { ConfidenceBadge, StatusBadge } from '../components/StatusBadge'
import styles from './CasesPage.module.css'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

const EMPTY_CASES: never[] = []

export function CasesPage() {
  const state = useApiData(() => api.listCases(), [])
  const navigate = useNavigate()
  const [productFilter, setProductFilter] = useState('all')
  const [diagnosisFilter, setDiagnosisFilter] = useState('all')

  const cases = state.status === 'success' ? state.data : EMPTY_CASES

  const products = useMemo(
    () => Array.from(new Set(cases.map((c) => c.product_model).filter((v): v is string => !!v))).sort(),
    [cases],
  )
  const diagnoses = useMemo(() => Array.from(new Set(cases.map((c) => c.diagnosis))).sort(), [cases])

  const filtered = cases.filter(
    (c) =>
      (productFilter === 'all' || c.product_model === productFilter) &&
      (diagnosisFilter === 'all' || c.diagnosis === diagnosisFilter),
  )

  return (
    <>
      <PageHeader title="Cases" description="使用者反饋所產生的案例與 case intelligence" />

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
        <EmptyState title="目前沒有任何 case" description="Fresh DB 尚無資料,等待 feedback 與 case enrichment 產生內容。" />
      )}

      {state.status === 'success' && cases.length > 0 && (
        <div className={`surface-card ${styles.card}`}>
          <div className={styles.filters}>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className={styles.select}>
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={diagnosisFilter}
              onChange={(e) => setDiagnosisFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Diagnoses</option>
              {diagnoses.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

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
        </div>
      )}
    </>
  )
}
