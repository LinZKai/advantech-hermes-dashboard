import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ThumbsDown, ThumbsUp } from 'lucide-react'
import { api, ApiError } from '../api/client'
import { useApiData } from '../api/useApiData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import { ConfidenceBadge, StatusBadge } from '../components/StatusBadge'
import { retrievalStatusTone } from '../components/statusTone'
import type { CaseFeedbackEntry, CaseTurn } from '../types/api'
import styles from './CaseDetailPage.module.css'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function retrievalLabel(turn: CaseTurn): string {
  const totalReferences = turn.retrieval_summary.reduce((sum, entry) => sum + (entry.reference_count ?? 0), 0)
  switch (turn.retrieval_observation_status) {
    case 'complete':
      return totalReferences > 0 ? `Retrieval Complete · ${totalReferences} references` : 'Retrieval Complete'
    case 'partial':
      return 'Partial'
    default:
      return 'Unavailable'
  }
}

function TurnFeedback({ feedback }: { feedback: CaseFeedbackEntry[] }) {
  if (feedback.length === 0) return null
  return (
    <div className={styles.feedbackList}>
      {feedback.map((fb, idx) => (
        <div key={idx} className={`${styles.feedbackItem} ${fb.helpful ? styles.feedbackHelpful : styles.feedbackNegative}`}>
          <div className={styles.feedbackHeader}>
            {fb.helpful ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
            <span>{fb.helpful ? 'Helpful' : 'Negative'}</span>
            <span className={styles.feedbackTime}>{formatDate(fb.submitted_at)}</span>
          </div>
          {fb.reason_code && <p className={styles.feedbackReason}>Reason: {fb.reason_code}</p>}
          {fb.suggestion_text && <p className={styles.feedbackSuggestion}>“{fb.suggestion_text}”</p>}
        </div>
      ))}
    </div>
  )
}

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const state = useApiData(() => api.getCase(caseId!), [caseId])

  const backButton = (
    <button className="btn btn-outline" onClick={() => navigate('/cases')}>
      <ArrowLeft size={15} /> Back to Cases
    </button>
  )

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title="Case Detail" actions={backButton} />
        <LoadingState label="正在載入 case 內容..." />
      </>
    )
  }

  if (state.status === 'error') {
    const isNotFound = state.error instanceof ApiError && state.error.status === 404
    return (
      <>
        <PageHeader title="Case Detail" actions={backButton} />
        <ErrorState
          title={isNotFound ? '找不到此 Case' : '發生錯誤'}
          description={isNotFound ? `Case ${caseId} 不存在,或已被刪除。` : state.error.message}
        />
      </>
    )
  }

  const detail = state.data
  const analysis = detail.analysis
  const feedbackByTurn = new Map<string, CaseFeedbackEntry[]>()
  for (const fb of detail.feedback) {
    const list = feedbackByTurn.get(fb.turn_id) ?? []
    list.push(fb)
    feedbackByTurn.set(fb.turn_id, list)
  }

  return (
    <>
      <PageHeader title={analysis?.case_title ?? detail.case_id} description={`Case ID: ${detail.case_id}`} actions={backButton} />

      <div className={`surface-card ${styles.summaryCard}`}>
        {analysis ? (
          <div className={styles.summaryGrid}>
            <div>
              <p className={styles.summaryLabel}>Product</p>
              <p className={styles.summaryValue}>{analysis.product_model ?? '—'}</p>
            </div>
            <div>
              <p className={styles.summaryLabel}>Issue Type</p>
              <p className={styles.summaryValue}>{analysis.issue_type}</p>
            </div>
            <div>
              <p className={styles.summaryLabel}>Diagnosis</p>
              <StatusBadge label={analysis.diagnosis} tone="neutral" />
            </div>
            <div>
              <p className={styles.summaryLabel}>Confidence</p>
              <ConfidenceBadge value={analysis.diagnosis_confidence} />
            </div>
          </div>
        ) : (
          <EmptyState title="尚未產生 Case Analysis" description="此 case 尚未經過 enrichment,暫無 diagnosis 與 confidence 資訊。" />
        )}
      </div>

      <div className={`surface-card ${styles.timelineCard}`}>
        <p className="section-title">Conversation Timeline</p>
        {detail.turns.length === 0 ? (
          <EmptyState title="尚無對話紀錄" />
        ) : (
          <div className={styles.timeline}>
            {detail.turns.map((turn) => (
              <div key={turn.turn_id} className={styles.turn}>
                <div className={styles.bubbleUser}>
                  <p className={styles.bubbleLabel}>User · Question</p>
                  <p className={styles.bubbleText}>{turn.question}</p>
                </div>
                <div className={styles.bubbleHermes}>
                  <p className={styles.bubbleLabel}>Hermes · Answer</p>
                  <p className={styles.bubbleText}>{turn.answer}</p>
                  <div className={styles.retrievalRow}>
                    <StatusBadge
                      label={retrievalLabel(turn)}
                      tone={retrievalStatusTone(turn.retrieval_observation_status)}
                    />
                    <span className={styles.turnTime}>{formatDate(turn.created_at)}</span>
                  </div>
                </div>
                <TurnFeedback feedback={feedbackByTurn.get(turn.turn_id) ?? []} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
