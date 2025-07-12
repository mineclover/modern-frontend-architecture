import { 
  Experiment, 
  ExperimentVariant, 
  ExperimentContext, 
  ExperimentResult, 
  ExperimentAssignment,
  ExperimentTargeting,
  ExperimentCondition
} from './types'

export class ExperimentEngine {
  private experiments: Map<string, Experiment> = new Map()
  private assignments: Map<string, ExperimentAssignment> = new Map()

  constructor(experiments: Experiment[]) {
    experiments.forEach(exp => {
      this.experiments.set(exp.id, exp)
    })
    this.loadAssignments()
  }

  // 실험 참여 및 변형 할당
  assignVariant(experimentId: string, context: ExperimentContext): ExperimentResult {
    const experiment = this.experiments.get(experimentId)
    
    if (!experiment) {
      return {
        experimentId,
        variantId: null,
        isParticipant: false,
        reason: 'Experiment not found'
      }
    }

    // 실험 상태 확인
    if (!this.isExperimentActive(experiment)) {
      return {
        experimentId,
        variantId: null,
        isParticipant: false,
        reason: 'Experiment not active'
      }
    }

    // 기존 할당 확인
    const existingAssignment = this.getExistingAssignment(experimentId, context)
    if (existingAssignment) {
      return {
        experimentId,
        variantId: existingAssignment.variantId,
        isParticipant: true,
        reason: 'Previously assigned',
        assignment: existingAssignment
      }
    }

    // 타겟팅 조건 확인
    if (!this.meetsTargeting(experiment.targeting, context)) {
      return {
        experimentId,
        variantId: null,
        isParticipant: false,
        reason: 'Does not meet targeting criteria'
      }
    }

    // 트래픽 할당 확인
    if (!this.isInTrafficAllocation(experiment, context)) {
      return {
        experimentId,
        variantId: null,
        isParticipant: false,
        reason: 'Not in traffic allocation'
      }
    }

    // 변형 할당
    const variant = this.selectVariant(experiment.variants, context)
    if (!variant) {
      return {
        experimentId,
        variantId: null,
        isParticipant: false,
        reason: 'No variant available'
      }
    }

    // 할당 저장
    const assignment: ExperimentAssignment = {
      experimentId,
      variantId: variant.id,
      assignedAt: new Date(),
      userId: context.user?.id,
      sessionId: context.session?.id || this.generateSessionId()
    }

    this.saveAssignment(assignment)

    return {
      experimentId,
      variantId: variant.id,
      isParticipant: true,
      reason: 'Successfully assigned',
      assignment
    }
  }

  // 실험 활성 상태 확인
  private isExperimentActive(experiment: Experiment): boolean {
    if (experiment.status !== 'running') return false
    
    const now = new Date()
    if (experiment.startDate > now) return false
    if (experiment.endDate && experiment.endDate < now) return false
    
    return true
  }

  // 기존 할당 확인
  private getExistingAssignment(experimentId: string, context: ExperimentContext): ExperimentAssignment | null {
    const userId = context.user?.id
    const sessionId = context.session?.id
    
    for (const assignment of this.assignments.values()) {
      if (assignment.experimentId === experimentId) {
        if (userId && assignment.userId === userId) return assignment
        if (sessionId && assignment.sessionId === sessionId) return assignment
      }
    }
    
    return null
  }

  // 타겟팅 조건 확인
  private meetsTargeting(targeting: ExperimentTargeting, context: ExperimentContext): boolean {
    // 사용자 역할 확인
    if (targeting.userRoles && context.user?.role) {
      if (!targeting.userRoles.includes(context.user.role)) return false
    }

    // 사용자 세그먼트 확인
    if (targeting.userSegments && context.user?.segment) {
      if (!targeting.userSegments.includes(context.user.segment)) return false
    }

    // 지역 확인
    if (targeting.geoLocation && context.user?.country) {
      if (!targeting.geoLocation.includes(context.user.country)) return false
    }

    // 디바이스 타입 확인
    if (targeting.deviceTypes && context.session?.deviceType) {
      if (!targeting.deviceTypes.includes(context.session.deviceType)) return false
    }

    // 브라우저 확인
    if (targeting.browsers && context.session?.browser) {
      if (!targeting.browsers.includes(context.session.browser)) return false
    }

    // 커스텀 조건 확인
    if (targeting.customConditions) {
      for (const condition of targeting.customConditions) {
        if (!this.evaluateCondition(condition, context)) return false
      }
    }

    return true
  }

  // 커스텀 조건 평가
  private evaluateCondition(condition: ExperimentCondition, context: ExperimentContext): boolean {
    const actualValue = this.getContextValue(condition.key, context)
    
    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(actualValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(actualValue)
      case 'greater_than':
        return Number(actualValue) > Number(condition.value)
      case 'less_than':
        return Number(actualValue) < Number(condition.value)
      case 'contains':
        return String(actualValue).includes(String(condition.value))
      default:
        return false
    }
  }

  // 컨텍스트에서 값 추출
  private getContextValue(key: string, context: ExperimentContext): any {
    // 점 표기법 지원 (예: 'user.age', 'session.cartValue')
    const keys = key.split('.')
    let value: any = context
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return undefined
      }
    }
    
    return value
  }

  // 트래픽 할당 확인
  private isInTrafficAllocation(experiment: Experiment, context: ExperimentContext): boolean {
    if (experiment.trafficAllocation >= 100) return true
    
    const userId = context.user?.id || context.session?.id || 'anonymous'
    const hash = this.hashString(`${experiment.id}-${userId}`)
    return hash < experiment.trafficAllocation
  }

  // 변형 선택
  private selectVariant(variants: ExperimentVariant[], context: ExperimentContext): ExperimentVariant | null {
    if (variants.length === 0) return null
    
    const userId = context.user?.id || context.session?.id || 'anonymous'
    const hash = this.hashString(userId)
    
    let cumulativeWeight = 0
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
    const target = (hash % 100) * (totalWeight / 100)
    
    for (const variant of variants) {
      cumulativeWeight += variant.weight
      if (target <= cumulativeWeight) {
        return variant
      }
    }
    
    return variants[variants.length - 1] // 폴백
  }

  // 문자열 해시 (0-99)
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff
    }
    return Math.abs(hash) % 100
  }

  // 할당 저장
  private saveAssignment(assignment: ExperimentAssignment): void {
    const key = this.getAssignmentKey(assignment)
    this.assignments.set(key, assignment)
    
    // 로컬 스토리지에도 저장 (브라우저 환경에서)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = JSON.parse(localStorage.getItem('experiment_assignments') || '[]')
        stored.push(assignment)
        localStorage.setItem('experiment_assignments', JSON.stringify(stored))
      } catch (error) {
        console.warn('Failed to save experiment assignment to localStorage:', error)
      }
    }
  }

  // 할당 로드
  private loadAssignments(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = JSON.parse(localStorage.getItem('experiment_assignments') || '[]')
        stored.forEach((assignment: ExperimentAssignment) => {
          const key = this.getAssignmentKey(assignment)
          this.assignments.set(key, {
            ...assignment,
            assignedAt: new Date(assignment.assignedAt)
          })
        })
      } catch (error) {
        console.warn('Failed to load experiment assignments from localStorage:', error)
      }
    }
  }

  // 할당 키 생성
  private getAssignmentKey(assignment: ExperimentAssignment): string {
    return `${assignment.experimentId}-${assignment.userId || assignment.sessionId}`
  }

  // 세션 ID 생성
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // 실험 업데이트
  updateExperiment(experimentId: string, updates: Partial<Experiment>): void {
    const existing = this.experiments.get(experimentId)
    if (existing) {
      this.experiments.set(experimentId, { ...existing, ...updates })
    }
  }

  // 모든 실험 가져오기
  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values())
  }

  // 사용자의 모든 할당 가져오기
  getUserAssignments(userId: string): ExperimentAssignment[] {
    return Array.from(this.assignments.values())
      .filter(assignment => assignment.userId === userId)
  }

  // 할당 제거 (실험 종료 시)
  removeAssignment(experimentId: string, userId?: string, sessionId?: string): void {
    const keysToRemove: string[] = []
    
    for (const [key, assignment] of this.assignments.entries()) {
      if (assignment.experimentId === experimentId) {
        if ((userId && assignment.userId === userId) || 
            (sessionId && assignment.sessionId === sessionId)) {
          keysToRemove.push(key)
        }
      }
    }
    
    keysToRemove.forEach(key => this.assignments.delete(key))
  }
}