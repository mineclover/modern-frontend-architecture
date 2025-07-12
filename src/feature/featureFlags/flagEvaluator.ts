import { FeatureFlag, FeatureFlagCondition, FeatureFlagContext, FeatureFlagEvaluation } from './types'

export class FeatureFlagEvaluator {
  private flags: Map<string, FeatureFlag> = new Map()

  constructor(flags: FeatureFlag[]) {
    flags.forEach(flag => {
      this.flags.set(flag.key, flag)
    })
  }

  evaluate(flagKey: string, context: FeatureFlagContext): FeatureFlagEvaluation {
    const flag = this.flags.get(flagKey)
    
    if (!flag) {
      return {
        flagKey,
        enabled: false,
        reason: 'Flag not found'
      }
    }

    // 플래그가 비활성화된 경우
    if (!flag.enabled) {
      return {
        flagKey,
        enabled: false,
        reason: 'Flag is disabled'
      }
    }

    // 날짜 범위 검사
    if (!this.isWithinDateRange(flag, context.currentDate)) {
      return {
        flagKey,
        enabled: false,
        reason: 'Outside date range'
      }
    }

    // 조건 검사
    if (flag.conditions && !this.evaluateConditions(flag.conditions, context)) {
      return {
        flagKey,
        enabled: false,
        reason: 'Conditions not met'
      }
    }

    // 점진적 롤아웃 검사
    if (flag.rollout !== undefined && flag.rollout < 100) {
      const userHash = this.hashUserId(context.user?.id || 'anonymous')
      if (userHash >= flag.rollout) {
        return {
          flagKey,
          enabled: false,
          reason: 'Outside rollout percentage',
          metadata: { rollout: flag.rollout, userHash }
        }
      }
    }

    return {
      flagKey,
      enabled: true,
      reason: 'All conditions met',
      metadata: {
        rollout: flag.rollout,
        conditions: flag.conditions?.length || 0
      }
    }
  }

  private isWithinDateRange(flag: FeatureFlag, currentDate = new Date()): boolean {
    if (flag.startDate && currentDate < flag.startDate) {
      return false
    }
    
    if (flag.endDate && currentDate > flag.endDate) {
      return false
    }
    
    return true
  }

  private evaluateConditions(conditions: FeatureFlagCondition[], context: FeatureFlagContext): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, context))
  }

  private evaluateCondition(condition: FeatureFlagCondition, context: FeatureFlagContext): boolean {
    switch (condition.type) {
      case 'user_role':
        return this.evaluateOperator(
          condition.operator,
          context.user?.role,
          condition.value
        )
      
      case 'user_id':
        return this.evaluateOperator(
          condition.operator,
          context.user?.id,
          condition.value
        )
      
      case 'environment':
        return this.evaluateOperator(
          condition.operator,
          context.environment || process.env.NODE_ENV,
          condition.value
        )
      
      case 'country':
        return this.evaluateOperator(
          condition.operator,
          context.user?.country,
          condition.value
        )
      
      case 'date_range':
        const currentDate = context.currentDate || new Date()
        return this.evaluateDateCondition(condition, currentDate)
      
      default:
        return false
    }
  }

  private evaluateOperator(operator: string, actualValue: any, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue
      
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue)
      
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue)
      
      case 'greater_than':
        return actualValue > expectedValue
      
      case 'less_than':
        return actualValue < expectedValue
      
      default:
        return false
    }
  }

  private evaluateDateCondition(condition: FeatureFlagCondition, currentDate: Date): boolean {
    const { operator, value } = condition
    const targetDate = new Date(value)
    
    switch (operator) {
      case 'greater_than':
        return currentDate > targetDate
      case 'less_than':
        return currentDate < targetDate
      default:
        return false
    }
  }

  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(hash) % 100
  }

  // 플래그 상태 업데이트
  updateFlag(flagKey: string, updates: Partial<FeatureFlag>): void {
    const existingFlag = this.flags.get(flagKey)
    if (existingFlag) {
      this.flags.set(flagKey, { ...existingFlag, ...updates })
    }
  }

  // 모든 플래그 가져오기
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  // 플래그 추가
  addFlag(flag: FeatureFlag): void {
    this.flags.set(flag.key, flag)
  }

  // 플래그 제거
  removeFlag(flagKey: string): void {
    this.flags.delete(flagKey)
  }
}