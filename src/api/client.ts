// Centralized API client. All backend calls go through here so no
// component ever hard-codes a URL or repeats fetch/error-handling logic.
//
// In dev, Vite proxies "/api/*" -> http://127.0.0.1:8800/* (see vite.config.ts).
// In production this assumes the dashboard is served behind the same proxy setup.

import type {
  OverviewResponse,
  CaseListItem,
  CaseDetailResponse,
  ImprovementListItem,
  ImprovementDetailResponse,
  CuratorChangeResponse,
  ProposalReviewResponse,
  CuratorReviewResponse,
  CuratorApplyResponse,
  ApiErrorDetail,
} from '../types/api'

const API_BASE = '/api'

export class ApiError extends Error {
  status: number
  detail: ApiErrorDetail | null

  constructor(status: number, detail: ApiErrorDetail | null, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(0, null, '無法連線到後端服務,請確認 backend 是否已啟動於 127.0.0.1:8800。')
  }

  if (!response.ok) {
    let detail: ApiErrorDetail | null = null
    try {
      const body = await response.json()
      detail = body?.detail ?? body ?? null
    } catch {
      // response body was not JSON; leave detail as null
    }
    const message = detail?.message ?? detail?.status ?? `API 請求失敗 (HTTP ${response.status})`
    throw new ApiError(response.status, detail, message)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export const api = {
  getOverview: () => request<OverviewResponse>('/overview'),

  listCases: () => request<CaseListItem[]>('/cases'),

  getCase: (caseId: string) => request<CaseDetailResponse>(`/cases/${encodeURIComponent(caseId)}`),

  listImprovements: () => request<ImprovementListItem[]>('/improvements'),

  getImprovement: (proposalId: string) =>
    request<ImprovementDetailResponse>(`/improvements/${encodeURIComponent(proposalId)}`),

  getCuratorChange: (changeId: string) =>
    request<CuratorChangeResponse>(`/curator-changes/${encodeURIComponent(changeId)}`),

  reviewProposal: (proposalId: string, status: 'accepted' | 'rejected') =>
    request<ProposalReviewResponse>(`/improvements/${encodeURIComponent(proposalId)}/review`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  reviewCuratorChange: (changeId: string, status: 'approved' | 'rejected') =>
    request<CuratorReviewResponse>(`/curator-changes/${encodeURIComponent(changeId)}/review`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  applyCuratorChange: (changeId: string) =>
    request<CuratorApplyResponse>(`/curator-changes/${encodeURIComponent(changeId)}/apply`, {
      method: 'POST',
    }),
}
