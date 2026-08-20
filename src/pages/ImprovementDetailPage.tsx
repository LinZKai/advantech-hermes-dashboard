import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import { api, ApiError } from '../api/client'
import { useApiData } from '../api/useApiData'
import { PageHeader } from '../components/PageHeader'
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState'
import { ConfidenceBadge, StatusBadge } from '../components/StatusBadge'
import { curatorStatusTone, reviewStatusTone } from '../components/statusTone'
import type { CuratorChangeDetail, SupportingCase } from '../types/api'
import styles from './ImprovementDetailPage.module.css'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

interface ActionState {
  loading: boolean
  error: string | null
}

const IDLE: ActionState = { loading: false, error: null }

export function ImprovementDetailPage() {
  const { proposalId } = useParams<{ proposalId: string }>()
  const navigate = useNavigate()
  const state = useApiData(() => api.getImprovement(proposalId!), [proposalId])

  const [proposalAction, setProposalAction] = useState<ActionState>(IDLE)
  const [curatorReviewAction, setCuratorReviewAction] = useState<ActionState>(IDLE)
  const [curatorApplyAction, setCuratorApplyAction] = useState<ActionState>(IDLE)

  const backButton = (
    <button className="btn btn-outline" onClick={() => navigate('/improvements')}>
      <ArrowLeft size={15} /> Back to Improvements
    </button>
  )

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title="Improvement Detail" actions={backButton} />
        <LoadingState label="正在載入改進提案內容..." />
      </>
    )
  }

  if (state.status === 'error') {
    const isNotFound = state.error instanceof ApiError && state.error.status === 404
    return (
      <>
        <PageHeader title="Improvement Detail" actions={backButton} />
        <ErrorState
          title={isNotFound ? '找不到此 Improvement Proposal' : '發生錯誤'}
          description={isNotFound ? `Proposal ${proposalId} 不存在,或已被刪除。` : state.error.message}
        />
      </>
    )
  }

  const detail = state.data
  const { proposal, observation, supporting_cases, curator_changes } = detail

  const latestCuratorChange: CuratorChangeDetail | null =
    curator_changes.length === 0
      ? null
      : [...curator_changes].sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0]

  async function handleProposalReview(status: 'accepted' | 'rejected') {
    const verb = status === 'accepted' ? '接受 (Accept)' : '拒絕 (Reject)'
    if (!window.confirm(`確定要${verb}此 improvement proposal 嗎?`)) return
    setProposalAction({ loading: true, error: null })
    try {
      await api.reviewProposal(proposal.proposal_id, status)
      setProposalAction(IDLE)
      state.refetch()
    } catch (err) {
      setProposalAction({ loading: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  async function handleCuratorReview(status: 'approved' | 'rejected') {
    if (!latestCuratorChange) return
    const verb = status === 'approved' ? '核准 (Approve)' : '拒絕 (Reject)'
    if (!window.confirm(`確定要${verb}此 Curator change 嗎?`)) return
    setCuratorReviewAction({ loading: true, error: null })
    try {
      await api.reviewCuratorChange(latestCuratorChange.change_id, status)
      setCuratorReviewAction(IDLE)
      state.refetch()
    } catch (err) {
      setCuratorReviewAction({ loading: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  async function handleCuratorApply() {
    if (!latestCuratorChange) return
    if (!window.confirm('This will update the runtime AGENTS configuration. 確定要套用嗎?')) return
    setCuratorApplyAction({ loading: true, error: null })
    try {
      await api.applyCuratorChange(latestCuratorChange.change_id)
      setCuratorApplyAction(IDLE)
      state.refetch()
    } catch (err) {
      setCuratorApplyAction({ loading: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return (
    <>
      <PageHeader title={proposal.title} description={`Proposal ID: ${proposal.proposal_id}`} actions={backButton} />

      {/* Proposal */}
      <div className={`surface-card ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <p className="section-title">Proposal</p>
          <StatusBadge label={proposal.review_status} tone={reviewStatusTone(proposal.review_status)} />
        </div>
        <div className={styles.summaryGrid}>
          <div>
            <p className={styles.summaryLabel}>Target</p>
            <p className={styles.summaryValue}>{proposal.improvement_target}</p>
          </div>
          <div>
            <p className={styles.summaryLabel}>Confidence</p>
            {observation ? <ConfidenceBadge value={observation.confidence} /> : <span className={styles.muted}>—</span>}
          </div>
          <div>
            <p className={styles.summaryLabel}>Created At</p>
            <p className={styles.summaryValue}>{formatDate(proposal.created_at)}</p>
          </div>
        </div>

        {proposal.review_status === 'pending' && (
          <div className={styles.actionRow}>
            <button
              className="btn btn-danger-outline"
              disabled={proposalAction.loading}
              onClick={() => handleProposalReview('rejected')}
            >
              <X size={15} /> Reject
            </button>
            <button className="btn btn-primary" disabled={proposalAction.loading} onClick={() => handleProposalReview('accepted')}>
              <Check size={15} /> Accept
            </button>
          </div>
        )}
        {proposalAction.error && <p className={styles.actionError}>{proposalAction.error}</p>}
      </div>

      {/* Observation */}
      <div className={`surface-card ${styles.section}`}>
        <p className="section-title">Observation</p>
        {observation ? (
          <ObservationView observation={observation} />
        ) : (
          <EmptyState title="尚無 observation 資料" />
        )}
      </div>

      {/* Supporting Cases */}
      <div className={`surface-card ${styles.section}`}>
        <p className="section-title">Supporting Cases</p>
        {supporting_cases.length === 0 ? (
          <EmptyState title="尚無 supporting cases" />
        ) : (
          <div className={styles.caseGrid}>
            {supporting_cases.map((sc) => (
              <SupportingCaseCard key={sc.case_id} caseItem={sc} onOpen={() => navigate(`/cases/${sc.case_id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Curator */}
      <div className={`surface-card ${styles.section}`}>
        <p className="section-title">Curator Change</p>
        {!latestCuratorChange ? (
          <div className={styles.curatorEmpty}>
            <EmptyState title="No Curator change generated yet." />
            <p className={styles.curatorHint}>Curator can be triggered after this proposal is accepted.</p>
          </div>
        ) : (
          <>
            <div className={styles.curatorMetaGrid}>
              <div>
                <p className={styles.summaryLabel}>Change Type</p>
                <p className={styles.summaryValue}>{latestCuratorChange.change_type}</p>
              </div>
              <div>
                <p className={styles.summaryLabel}>Status</p>
                <StatusBadge label={latestCuratorChange.status} tone={curatorStatusTone(latestCuratorChange.status)} />
              </div>
              <div>
                <p className={styles.summaryLabel}>Confidence</p>
                <ConfidenceBadge value={latestCuratorChange.confidence} />
              </div>
            </div>

            <div className={styles.curatorTextBlock}>
              <p className={styles.summaryLabel}>Rationale</p>
              <p className={styles.bodyText}>{latestCuratorChange.rationale}</p>
            </div>
            {latestCuratorChange.expected_effect && (
              <div className={styles.curatorTextBlock}>
                <p className={styles.summaryLabel}>Expected Effect</p>
                <p className={styles.bodyText}>{latestCuratorChange.expected_effect}</p>
              </div>
            )}

            <div className={styles.compareGrid}>
              <div className={styles.compareCol}>
                <p className={styles.compareLabel}>Current AGENTS</p>
                <pre className={styles.codePanel}>{latestCuratorChange.before_content}</pre>
              </div>
              <div className={styles.compareCol}>
                <p className={styles.compareLabel}>Proposed AGENTS</p>
                <pre className={styles.codePanel}>
                  {latestCuratorChange.proposed_content ?? '(no change recommended)'}
                </pre>
              </div>
            </div>

            {latestCuratorChange.status === 'proposed' && (
              <div className={styles.actionRow}>
                <button
                  className="btn btn-danger-outline"
                  disabled={curatorReviewAction.loading}
                  onClick={() => handleCuratorReview('rejected')}
                >
                  <X size={15} /> Reject
                </button>
                <button
                  className="btn btn-primary"
                  disabled={curatorReviewAction.loading}
                  onClick={() => handleCuratorReview('approved')}
                >
                  <Check size={15} /> Approve
                </button>
              </div>
            )}
            {curatorReviewAction.error && <p className={styles.actionError}>{curatorReviewAction.error}</p>}

            {latestCuratorChange.status === 'approved' && (
              <div className={styles.actionRow}>
                <button className="btn btn-accent" disabled={curatorApplyAction.loading} onClick={handleCuratorApply}>
                  Apply to Runtime
                </button>
              </div>
            )}
            {curatorApplyAction.error && <p className={styles.actionError}>{curatorApplyAction.error}</p>}

            {latestCuratorChange.status === 'applied' && (
              <div className={styles.appliedRow}>
                <StatusBadge label="Applied" tone="positive" />
                <span className={styles.muted}>at {formatDate(latestCuratorChange.applied_at)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

function ObservationView({ observation }: { observation: NonNullable<import('../types/api').ImprovementDetailResponse['observation']> }) {
  return (
    <div className={styles.observationGrid}>
      <div className={styles.observationBlock}>
        <p className={styles.summaryLabel}>Recurring Pattern</p>
        <p className={styles.bodyText}>{observation.pattern_summary}</p>
      </div>
      {observation.possible_cause && (
        <div className={styles.observationBlock}>
          <p className={styles.summaryLabel}>Possible Cause</p>
          <p className={styles.bodyText}>{observation.possible_cause}</p>
        </div>
      )}
      <div className={styles.observationBlock}>
        <p className={styles.summaryLabel}>Recommended Improvement</p>
        <p className={styles.bodyText}>{observation.recommended_improvement}</p>
      </div>
      {observation.expected_benefit && (
        <div className={styles.observationBlock}>
          <p className={styles.summaryLabel}>Expected Benefit</p>
          <p className={styles.bodyText}>{observation.expected_benefit}</p>
        </div>
      )}
      {observation.limitations && (
        <div className={styles.observationBlock}>
          <p className={styles.summaryLabel}>Limitations</p>
          <p className={styles.bodyText}>{observation.limitations}</p>
        </div>
      )}
      <div className={styles.observationMetaRow}>
        <span className={styles.metaItem}>
          Confidence <ConfidenceBadge value={observation.confidence} />
        </span>
        <span className={styles.metaItem}>
          Supporting Case Count <strong>{observation.supporting_case_count}</strong>
        </span>
      </div>
    </div>
  )
}

function SupportingCaseCard({ caseItem, onOpen }: { caseItem: SupportingCase; onOpen: () => void }) {
  return (
    <div className={styles.caseCard} onClick={onOpen}>
      <p className={styles.caseCardProduct}>{caseItem.product_model ?? '—'}</p>
      <p className={styles.caseCardTitle}>{caseItem.title ?? caseItem.case_id}</p>
      <div className={styles.caseCardMeta}>
        {caseItem.diagnosis && <StatusBadge label={caseItem.diagnosis} tone="neutral" />}
        {caseItem.confidence != null && <ConfidenceBadge value={caseItem.confidence} />}
      </div>
    </div>
  )
}
