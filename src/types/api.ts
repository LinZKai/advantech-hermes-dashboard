// TypeScript types mirroring the Hermes Feedback backend dashboard API contract.
// Source of truth: advantech-hermes-feedback repo
//   custom/universal-feedback/overlay/dashboard_api/{app.py,views.py}

export type IssueType =
  | 'product_usage_or_application'
  | 'product_capability_or_compatibility'
  | 'product_issue'
  | 'other_or_unclear'

export type Diagnosis =
  | 'knowledge_gap'
  | 'retrieval_issue'
  | 'answer_quality_issue'
  | 'other_or_unclear'
  | 'no_issue_detected'

export type ReasonCode = 'incorrect' | 'incomplete' | 'not_relevant' | 'unclear' | 'other'

export type ImprovementTarget = 'knowledge' | 'agent_behavior' | 'retrieval' | 'workflow' | 'other'

export type ReviewStatus = 'pending' | 'accepted' | 'rejected'

export type CuratorChangeType = 'add_rule' | 'modify_rule' | 'remove_rule' | 'no_change_recommended'

export type CuratorStatus = 'proposed' | 'approved' | 'rejected' | 'applied' | 'failed'

export type ObservationTrend = 'new' | 'growing' | 'stable' | 'declining' | 'no_longer_observed'

export type RetrievalObservationStatus = 'complete' | 'partial' | 'unavailable'

export type RetrievalExecutionStatus =
  | 'completed'
  | 'failed'
  | 'timed_out'
  | 'http_error'
  | 'network_error'
  | 'invalid_response'
  | 'no_documents'
  | 'unknown'
  | 'blocked'
  | 'unparseable'

// ---------- GET /overview ----------

export interface OverviewResponse {
  total_cases: number
  total_turns: number
  total_feedback: number
  helpful_count: number
  helpful_ratio: number
  negative_count: number
  negative_ratio: number
  negative_reason_distribution: Record<string, number>
  case_diagnosis_distribution: Record<string, number>
  product_model_distribution: Record<string, number>
  improvement_proposals: {
    total: number
    review_status_distribution: Record<string, number>
  }
  curator_changes: {
    total: number
    status_distribution: Record<string, number>
  }
}

// ---------- GET /cases ----------

export interface CaseListItem {
  case_id: string
  case_title: string | null
  product_model: string | null
  issue_type: IssueType
  diagnosis: Diagnosis
  confidence: number
  turn_count: number
  feedback_summary: {
    total: number
    helpful_count: number
    negative_count: number
  }
  latest_activity: string | null
  latest_feedback_submitted_at: string | null
}

// ---------- GET /cases/{case_id} ----------

export interface RetrievalSummaryEntry {
  execution_status: RetrievalExecutionStatus
  foundry_iq_ok: boolean | null
  observation_status: RetrievalObservationStatus
  result_count: number | null
  reference_count: number | null
  error_code: string | null
}

export interface CaseTurn {
  turn_id: string
  question: string
  answer: string
  created_at: string
  retrieval_observation_status: RetrievalObservationStatus
  retrieval_summary: RetrievalSummaryEntry[]
}

export interface CaseFeedbackEntry {
  turn_id: string
  helpful: boolean
  reason_code: ReasonCode | null
  suggestion_text: string | null
  submitted_at: string
}

export interface CaseDetailResponse {
  case_id: string
  session_id: string
  latest_activity: string
  analysis: null | {
    case_title: string | null
    issue_summary: string | null
    issue_type: IssueType
    issue_type_confidence: number
    diagnosis: Diagnosis
    diagnosis_confidence: number
    product_model: string | null
    product_confidence: number | null
  }
  turns: CaseTurn[]
  feedback: CaseFeedbackEntry[]
}

// ---------- GET /improvements ----------

export interface ImprovementListItem {
  proposal_id: string
  title: string
  improvement_target: ImprovementTarget
  review_status: ReviewStatus
  created_at: string
  latest_observation: null | {
    trend: ObservationTrend
    pattern_summary: string
    confidence: number
    supporting_case_count: number
  }
  curator_change: null | {
    change_id: string
    change_type: CuratorChangeType
    status: CuratorStatus
    confidence: number
  }
}

// ---------- GET /improvements/{proposal_id} ----------

export interface SupportingCase {
  case_id: string
  title: string | null
  product_model: string | null
  issue_type: string | null
  diagnosis: string | null
  confidence: number | null
}

export interface CuratorChangeDetail {
  change_id: string
  change_type: CuratorChangeType
  rationale: string
  expected_effect: string | null
  confidence: number
  status: CuratorStatus
  created_at: string
  reviewed_at: string | null
  applied_at: string | null
  before_content: string
  proposed_content: string | null
}

export interface ImprovementDetailResponse {
  proposal: {
    proposal_id: string
    title: string
    improvement_target: ImprovementTarget
    review_status: ReviewStatus
    created_at: string
  }
  observation: null | {
    trend: ObservationTrend
    pattern_summary: string
    possible_cause: string | null
    recommended_improvement: string
    expected_benefit: string | null
    limitations: string | null
    confidence: number
    supporting_case_ids: string[]
    supporting_case_count: number
    observed_at: string
  }
  supporting_cases: SupportingCase[]
  curator_changes: CuratorChangeDetail[]
}

// ---------- GET /curator-changes/{change_id} ----------

export interface CuratorChangeResponse {
  change_id: string
  proposal_id: string
  target_file: string
  change_type: CuratorChangeType
  rationale: string
  before_content: string
  proposed_content: string | null
  expected_effect: string | null
  confidence: number
  status: CuratorStatus
  created_at: string
  reviewed_at: string | null
  applied_at: string | null
}

// ---------- POST bodies / responses ----------

export interface ProposalReviewRequest {
  status: 'accepted' | 'rejected'
}

export interface ProposalReviewResponse {
  status: 'reviewed'
  proposal_id: string
}

export interface CuratorReviewRequest {
  status: 'approved' | 'rejected'
}

export interface CuratorReviewResponse {
  status: 'reviewed'
  change_id: string
}

export interface CuratorApplyResponse {
  status: 'applied'
  change_id: string
  applied_at: string
}

// ---------- Error envelope ----------

export interface ApiErrorDetail {
  status: string
  message?: string
  [key: string]: unknown
}
