// Status -> badge tone resolvers, kept out of StatusBadge.tsx so that file
// only exports components (keeps React Fast Refresh happy).

export type BadgeTone = 'positive' | 'warning' | 'negative' | 'neutral' | 'primary'

export function reviewStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'accepted':
      return 'positive'
    case 'rejected':
      return 'negative'
    default:
      return 'warning' // pending
  }
}

export function curatorStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'applied':
      return 'positive'
    case 'approved':
      return 'primary'
    case 'rejected':
    case 'failed':
      return 'negative'
    default:
      return 'warning' // proposed
  }
}

export function retrievalStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'complete':
      return 'positive'
    case 'partial':
      return 'warning'
    default:
      return 'negative' // unavailable
  }
}
