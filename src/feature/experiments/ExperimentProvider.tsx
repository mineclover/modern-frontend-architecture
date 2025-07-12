import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { ExperimentEngine } from './experimentEngine'
import { getAllExperiments } from './experimentConfig'
import { ExperimentContext as ExperimentContextType, ExperimentResult } from './types'

interface ExperimentProviderContextValue {
  engine: ExperimentEngine
  context: ExperimentContextType
  updateContext: (updates: Partial<ExperimentContextType>) => void
  trackEvent: (eventName: string, properties?: Record<string, any>) => void
}

const ExperimentProviderContext = createContext<ExperimentProviderContextValue | null>(null)

interface ExperimentProviderProps {
  children: React.ReactNode
  initialContext?: Partial<ExperimentContextType>
  user?: any
  onTrackEvent?: (eventName: string, properties?: Record<string, any>) => void
}

export function ExperimentProvider({ 
  children, 
  initialContext = {},
  user,
  onTrackEvent 
}: ExperimentProviderProps) {
  const [context, setContext] = useState<ExperimentContextType>(() => ({
    user: user ? {
      id: user.id,
      role: user.role,
      segment: user.segment,
      country: user.country,
      ...user
    } : undefined,
    session: {
      id: generateSessionId(),
      deviceType: detectDeviceType(),
      browser: detectBrowser(),
      ...initialContext.session
    },
    customProperties: initialContext.customProperties,
    ...initialContext
  }))

  // Experiment Engine 생성
  const engine = useMemo(() => {
    const experiments = getAllExperiments()
    return new ExperimentEngine(experiments)
  }, [])

  // Context 업데이트 함수
  const updateContext = useCallback((updates: Partial<ExperimentContextType>) => {
    setContext(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  // 이벤트 추적 함수
  const trackEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    // 내부 이벤트 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('Experiment Event:', { eventName, properties, context })
    }
    
    // 외부 추적 함수 호출
    if (onTrackEvent) {
      onTrackEvent(eventName, { ...properties, experimentContext: context })
    }
  }, [context, onTrackEvent])

  // User 변경 시 context 업데이트
  useEffect(() => {
    if (user) {
      updateContext({
        user: {
          id: user.id,
          role: user.role,
          segment: user.segment,
          country: user.country,
          ...user
        }
      })
    }
  }, [user, updateContext])

  // Context value 메모이제이션
  const contextValue = useMemo(() => ({
    engine,
    context,
    updateContext,
    trackEvent
  }), [engine, context, updateContext, trackEvent])

  return (
    <ExperimentProviderContext.Provider value={contextValue}>
      {children}
    </ExperimentProviderContext.Provider>
  )
}

// Context Hook Export
export { ExperimentProviderContext }

// 유틸리티 함수들
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  
  const userAgent = window.navigator.userAgent
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function detectBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent
  if (userAgent.includes('Chrome')) return 'chrome'
  if (userAgent.includes('Firefox')) return 'firefox'
  if (userAgent.includes('Safari')) return 'safari'
  if (userAgent.includes('Edge')) return 'edge'
  return 'unknown'
}

// HOC for Experiment Provider
export function withExperiments<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    initialContext?: Partial<ExperimentContextType>
    onTrackEvent?: (eventName: string, properties?: Record<string, any>) => void
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <ExperimentProvider 
        initialContext={options?.initialContext}
        onTrackEvent={options?.onTrackEvent}
      >
        <Component {...props} />
      </ExperimentProvider>
    )
  }
}