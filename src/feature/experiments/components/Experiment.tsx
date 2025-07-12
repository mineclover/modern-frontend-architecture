import React, { useEffect } from 'react'
import { useExperiment, useExperimentTracking, useExperimentConfig } from '../useExperiment'

interface ExperimentProps {
  experimentId: string
  children: React.ReactNode
  fallback?: React.ReactNode
  trackViews?: boolean
}

/**
 * Experiment 컴포넌트
 * 실험에 참여한 경우에만 children을 렌더링
 */
export function Experiment({ 
  experimentId, 
  children, 
  fallback = null,
  trackViews = true
}: ExperimentProps) {
  const result = useExperiment(experimentId)
  const { trackExperimentEvent } = useExperimentTracking()

  // 뷰 추적
  useEffect(() => {
    if (trackViews && result.isParticipant) {
      trackExperimentEvent(experimentId, 'view', {
        variantId: result.variantId
      })
    }
  }, [experimentId, result.isParticipant, result.variantId, trackExperimentEvent, trackViews])

  return result.isParticipant ? <>{children}</> : <>{fallback}</>
}

interface VariantProps {
  variantId: string
  children: React.ReactNode
}

/**
 * Variant 컴포넌트
 * 특정 변형에 할당된 경우에만 렌더링
 */
export function Variant({ variantId, children }: VariantProps) {
  // 부모 Experiment 컨텍스트에서 현재 변형 정보를 가져와야 함
  // 여기서는 간단한 구현으로 children을 직접 렌더링
  return <>{children}</>
}

interface ExperimentSwitchProps {
  experimentId: string
  variants: Record<string, React.ReactNode>
  fallback?: React.ReactNode
}

/**
 * ExperimentSwitch 컴포넌트
 * 할당된 변형에 따라 다른 컴포넌트를 렌더링
 */
export function ExperimentSwitch({ 
  experimentId, 
  variants, 
  fallback = null 
}: ExperimentSwitchProps) {
  const result = useExperiment(experimentId)
  
  if (!result.isParticipant || !result.variantId) {
    return <>{fallback}</>
  }
  
  const variantComponent = variants[result.variantId]
  return variantComponent ? <>{variantComponent}</> : <>{fallback}</>
}

interface ABTestProps {
  experimentId: string
  controlComponent: React.ReactNode
  treatmentComponent: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ABTest 컴포넌트
 * A/B 테스트를 위한 간소화된 인터페이스
 */
export function ABTest({ 
  experimentId, 
  controlComponent, 
  treatmentComponent, 
  fallback = null 
}: ABTestProps) {
  const variants = {
    control: controlComponent,
    a: controlComponent,
    treatment: treatmentComponent,
    b: treatmentComponent
  }
  
  return (
    <ExperimentSwitch 
      experimentId={experimentId}
      variants={variants}
      fallback={fallback}
    />
  )
}

interface ExperimentConfigConsumerProps<T = Record<string, any>> {
  experimentId: string
  children: (config: T | null, isParticipant: boolean) => React.ReactNode
}

/**
 * ExperimentConfigConsumer 컴포넌트
 * 실험 설정을 자식 컴포넌트에 전달
 */
export function ExperimentConfigConsumer<T = Record<string, any>>({ 
  experimentId, 
  children 
}: ExperimentConfigConsumerProps<T>) {
  const config = useExperimentConfig<T>(experimentId)
  const result = useExperiment(experimentId)
  
  return <>{children(config, result.isParticipant)}</>
}

interface ConditionalExperimentProps {
  experimentId: string
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ConditionalExperiment 컴포넌트
 * 조건이 참인 경우에만 실험을 실행
 */
export function ConditionalExperiment({ 
  experimentId, 
  condition, 
  children, 
  fallback = null 
}: ConditionalExperimentProps) {
  if (!condition) {
    return <>{fallback}</>
  }
  
  return (
    <Experiment experimentId={experimentId} fallback={fallback}>
      {children}
    </Experiment>
  )
}

interface ExperimentDebugProps {
  experimentId: string
  children: React.ReactNode
}

/**
 * ExperimentDebug 컴포넌트
 * 개발 환경에서 실험 정보를 표시
 */
export function ExperimentDebug({ experimentId, children }: ExperimentDebugProps) {
  const result = useExperiment(experimentId)
  const config = useExperimentConfig(experimentId)
  
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>
  }
  
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: result.isParticipant ? 'blue' : 'gray',
          color: 'white',
          padding: '2px 6px',
          fontSize: '10px',
          borderRadius: '2px',
          zIndex: 9999,
          maxWidth: '200px',
          wordBreak: 'break-word'
        }}
        title={JSON.stringify({ result, config }, null, 2)}
      >
        {experimentId}: {result.variantId || 'not-assigned'}
      </div>
    </div>
  )
}