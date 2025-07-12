import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react'
import { FeatureFlagEvaluator } from './flagEvaluator'
import { getAllFeatureFlags } from './flagConfig'
import { FeatureFlagContext as FeatureFlagContextType } from './types'

interface FeatureFlagProviderContextValue {
  evaluator: FeatureFlagEvaluator
  context: FeatureFlagContextType
  updateContext: (updates: Partial<FeatureFlagContextType>) => void
}

const FeatureFlagProviderContext = createContext<FeatureFlagProviderContextValue | null>(null)

interface FeatureFlagProviderProps {
  children: React.ReactNode
  initialContext?: Partial<FeatureFlagContextType>
  user?: any // User from auth context
}

export function FeatureFlagProvider({ 
  children, 
  initialContext = {},
  user 
}: FeatureFlagProviderProps) {
  const [context, setContext] = useState<FeatureFlagContextType>(() => ({
    environment: process.env.NODE_ENV || 'development',
    currentDate: new Date(),
    user: user ? {
      id: user.id,
      role: user.role,
      country: user.country,
      ...user
    } : undefined,
    ...initialContext
  }))

  // Feature Flag Evaluator 생성
  const evaluator = useMemo(() => {
    const flags = getAllFeatureFlags()
    return new FeatureFlagEvaluator(flags)
  }, [])

  // Context 업데이트 함수
  const updateContext = useCallback((updates: Partial<FeatureFlagContextType>) => {
    setContext(prev => ({
      ...prev,
      ...updates,
      currentDate: new Date() // 항상 현재 날짜로 업데이트
    }))
  }, [])

  // User 변경 시 context 업데이트
  useEffect(() => {
    if (user) {
      updateContext({
        user: {
          id: user.id,
          role: user.role,
          country: user.country,
          ...user
        }
      })
    }
  }, [user, updateContext])

  // Context value 메모이제이션
  const contextValue = useMemo(() => ({
    evaluator,
    context,
    updateContext
  }), [evaluator, context, updateContext])

  return (
    <FeatureFlagProviderContext.Provider value={contextValue}>
      {children}
    </FeatureFlagProviderContext.Provider>
  )
}

// Context Hook Export
export { FeatureFlagProviderContext }

// HOC for Feature Flag Provider
export function withFeatureFlags<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    initialContext?: Partial<FeatureFlagContextType>
  }
) {
  return function WrappedComponent(props: P) {
    return (
      <FeatureFlagProvider initialContext={options?.initialContext}>
        <Component {...props} />
      </FeatureFlagProvider>
    )
  }
}