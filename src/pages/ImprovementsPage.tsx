import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useApiData } from '../api/useApiData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import { ConfidenceBadge, StatusBadge } from '../components/StatusBadge'
import { reviewStatusTone } from '../components/statusTone'
import styles from './ImprovementsPage.module.css'

export function ImprovementsPage() {
  const state = useApiData(() => api.listImprovements(), [])
  const navigate = useNavigate()

  return (
    <>
      <PageHeader title="Improvements" description="Reflector 產生的改進提案,經人員審核後可交由 Curator 產生 runtime 變更" />

      {state.status === 'loading' && <LoadingState label="正在載入改進提案..." />}

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

      {state.status === 'success' && state.data.length === 0 && (
        <EmptyState title="目前沒有任何 Improvement Proposal" description="Reflector 尚未針對現有 case 產生改進提案。" />
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <div className={styles.list}>
          {state.data.map((item) => (
            <div key={item.proposal_id} className={`surface-card ${styles.card}`} onClick={() => navigate(`/improvements/${item.proposal_id}`)}>
              <div className={styles.cardHeader}>
                <div className={styles.titleGroup}>
                  <p className={styles.title}>{item.title}</p>
                  <span className={styles.target}>{item.improvement_target}</span>
                </div>
                <StatusBadge label={item.review_status} tone={reviewStatusTone(item.review_status)} />
              </div>

              {item.latest_observation ? (
                <>
                  <p className={styles.patternSummary}>{item.latest_observation.pattern_summary}</p>
                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                      Confidence <ConfidenceBadge value={item.latest_observation.confidence} />
                    </span>
                    <span className={styles.metaItem}>
                      Supporting Cases <strong>{item.latest_observation.supporting_case_count}</strong>
                    </span>
                    {item.curator_change && (
                      <span className={styles.metaItem}>
                        Curator <StatusBadge label={item.curator_change.status} tone="neutral" />
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className={styles.noObservation}>尚無 observation 資料</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
