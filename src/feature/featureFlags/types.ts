export interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  rollout?: number // 0-100% 점진적 롤아웃
  conditions?: FeatureFlagCondition[]
  startDate?: Date
  endDate?: Date
}

export interface FeatureFlagCondition {
  type: 'user_role' | 'user_id' | 'environment' | 'date_range' | 'country'
  operator: 'equals' | 'in' | 'not_in' | 'greater_than' | 'less_than'
  value: any
}

export interface FeatureFlagContext {
  user?: {
    id: string
    role: string
    country?: string
    [key: string]: any
  }
  environment?: string
  currentDate?: Date
}

export interface FeatureFlagEvaluation {
  flagKey: string
  enabled: boolean
  reason: string
  metadata?: Record<string, any>
}