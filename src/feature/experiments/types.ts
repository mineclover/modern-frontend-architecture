export interface Experiment {
  id: string
  name: string
  description: string
  status: ExperimentStatus
  variants: ExperimentVariant[]
  targeting: ExperimentTargeting
  metrics: string[]
  startDate: Date
  endDate?: Date
  trafficAllocation: number // 0-100% 트래픽 참여율
  hypothesis?: string
  successCriteria?: string
}

export interface ExperimentVariant {
  id: string
  name: string
  weight: number // 0-100% 트래픽 배분
  config: Record<string, any>
  description?: string
}

export interface ExperimentTargeting {
  userRoles?: string[]
  userSegments?: string[]
  geoLocation?: string[]
  deviceTypes?: ('desktop' | 'mobile' | 'tablet')[]
  browsers?: string[]
  customConditions?: ExperimentCondition[]
}

export interface ExperimentCondition {
  key: string
  operator: 'equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

export type ExperimentStatus = 
  | 'draft'         // 초안
  | 'ready'         // 실행 준비
  | 'running'       // 실행 중
  | 'paused'        // 일시 정지
  | 'completed'     // 완료
  | 'cancelled'     // 취소

export interface ExperimentAssignment {
  experimentId: string
  variantId: string
  assignedAt: Date
  userId?: string
  sessionId: string
}

export interface ExperimentContext {
  user?: {
    id: string
    role: string
    segment?: string
    country?: string
    [key: string]: any
  }
  session?: {
    id: string
    deviceType?: 'desktop' | 'mobile' | 'tablet'
    browser?: string
    [key: string]: any
  }
  customProperties?: Record<string, any>
}

export interface ExperimentResult {
  experimentId: string
  variantId: string | null
  isParticipant: boolean
  reason: string
  assignment?: ExperimentAssignment
}

export interface ExperimentMetrics {
  experimentId: string
  variantId: string
  metrics: Record<string, number>
  sampleSize: number
  conversionRate?: number
  confidenceLevel?: number
  timestamp: Date
}

export interface ExperimentAnalysis {
  experimentId: string
  status: 'analyzing' | 'significant' | 'no_effect' | 'inconclusive'
  winningVariant?: string
  confidence: number
  variants: {
    variantId: string
    sampleSize: number
    conversionRate: number
    metrics: Record<string, number>
  }[]
  recommendations?: string[]
}