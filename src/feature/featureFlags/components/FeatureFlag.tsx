import React from 'react'
import { useFeatureFlag, useFeatureFlagEvaluation } from '../useFeatureFlag'

interface FeatureFlagProps {
  flag: string
  children: React.ReactNode
  fallback?: React.ReactNode
  debug?: boolean
}

/**
 * Feature Flag 컴포넌트
 * 플래그가 활성화된 경우에만 children을 렌더링
 */
export function FeatureFlag({ 
  flag, 
  children, 
  fallback = null, 
  debug = false 
}: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag)
  const evaluation = useFeatureFlagEvaluation(flag)

  // 디버그 모드에서 평가 정보 로깅
  if (debug && process.env.NODE_ENV === 'development') {
    console.log(`FeatureFlag [${flag}]:`, evaluation)
  }

  return isEnabled ? <>{children}</> : <>{fallback}</>
}

interface ConditionalFeatureProps {
  flag: string
  when: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * 조건부 Feature Flag 컴포넌트
 * 플래그가 활성화되고 추가 조건이 true인 경우에만 렌더링
 */
export function ConditionalFeature({ 
  flag, 
  when, 
  children, 
  fallback = null 
}: ConditionalFeatureProps) {
  const isEnabled = useFeatureFlag(flag)
  
  return (isEnabled && when) ? <>{children}</> : <>{fallback}</>
}

interface FeatureSwitchProps {
  flag: string
  enabled: React.ReactNode
  disabled: React.ReactNode
}

/**
 * Feature Switch 컴포넌트
 * 플래그 상태에 따라 다른 컴포넌트를 렌더링
 */
export function FeatureSwitch({ flag, enabled, disabled }: FeatureSwitchProps) {
  const isEnabled = useFeatureFlag(flag)
  
  return isEnabled ? <>{enabled}</> : <>{disabled}</>
}

interface MultiFeatureFlagProps {
  flags: string[]
  mode?: 'all' | 'any' // all: 모든 플래그가 활성화, any: 하나라도 활성화
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * 다중 Feature Flag 컴포넌트
 * 여러 플래그의 조합 조건에 따라 렌더링
 */
export function MultiFeatureFlag({ 
  flags, 
  mode = 'all', 
  children, 
  fallback = null 
}: MultiFeatureFlagProps) {
  const flagStates = flags.map(flag => useFeatureFlag(flag))
  
  const shouldRender = mode === 'all' 
    ? flagStates.every(state => state)
    : flagStates.some(state => state)
  
  return shouldRender ? <>{children}</> : <>{fallback}</>
}

interface FeatureFlagDebugProps {
  flag: string
  children: React.ReactNode
}

/**
 * Feature Flag 디버그 컴포넌트
 * 개발 환경에서 플래그 평가 정보를 표시
 */
export function FeatureFlagDebug({ flag, children }: FeatureFlagDebugProps) {
  const evaluation = useFeatureFlagEvaluation(flag)
  
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
          right: 0,
          background: evaluation.enabled ? 'green' : 'red',
          color: 'white',
          padding: '2px 6px',
          fontSize: '10px',
          borderRadius: '2px',
          zIndex: 9999
        }}
        title={`Flag: ${flag}\nEnabled: ${evaluation.enabled}\nReason: ${evaluation.reason}`}
      >
        {flag}: {evaluation.enabled ? 'ON' : 'OFF'}
      </div>
    </div>
  )
}