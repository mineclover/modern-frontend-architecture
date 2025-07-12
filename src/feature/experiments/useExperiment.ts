import { useCallback, useContext, useMemo, useEffect, useState } from 'react'
import { ExperimentProviderContext } from './ExperimentProvider'
import { ExperimentResult } from './types'

// Context Hook
export function useExperimentContext() {
  const context = useContext(ExperimentProviderContext)
  if (!context) {
    throw new Error('useExperimentContext must be used within ExperimentProvider')
  }
  return context
}

// Main Experiment Hook
export function useExperiment(experimentId: string): ExperimentResult {
  const { engine, context } = useExperimentContext()
  
  return useMemo(() => {
    return engine.assignVariant(experimentId, context)
  }, [engine, experimentId, context])
}

// Experiment Variant Hook
export function useExperimentVariant(experimentId: string): string | null {
  const result = useExperiment(experimentId)
  return result.variantId
}

// Experiment Config Hook
export function useExperimentConfig<T = Record<string, any>>(experimentId: string): T | null {
  const { engine, context } = useExperimentContext()
  
  return useMemo(() => {
    const result = engine.assignVariant(experimentId, context)
    if (!result.isParticipant || !result.variantId) return null
    
    const experiment = engine.getAllExperiments().find(exp => exp.id === experimentId)
    const variant = experiment?.variants.find(v => v.id === result.variantId)
    
    return variant?.config as T || null
  }, [engine, experimentId, context])
}

// Multiple Experiments Hook
export function useExperiments(experimentIds: string[]): Record<string, ExperimentResult> {
  const { engine, context } = useExperimentContext()
  
  return useMemo(() => {
    const results: Record<string, ExperimentResult> = {}
    experimentIds.forEach(id => {
      results[id] = engine.assignVariant(id, context)
    })
    return results
  }, [engine, experimentIds, context])
}

// Experiment Tracking Hook
export function useExperimentTracking() {
  const { trackEvent } = useExperimentContext()
  
  const trackExperimentEvent = useCallback((
    experimentId: string,
    eventName: string,
    properties: Record<string, any> = {}
  ) => {
    trackEvent(`experiment.${eventName}`, {
      experimentId,
      ...properties
    })
  }, [trackEvent])
  
  const trackConversion = useCallback((
    experimentId: string,
    conversionType: string,
    value?: number
  ) => {
    trackExperimentEvent(experimentId, 'conversion', {
      conversionType,
      value
    })
  }, [trackExperimentEvent])
  
  const trackGoal = useCallback((
    experimentId: string,
    goalName: string,
    goalValue?: any
  ) => {
    trackExperimentEvent(experimentId, 'goal', {
      goalName,
      goalValue
    })
  }, [trackExperimentEvent])
  
  return {
    trackExperimentEvent,
    trackConversion,
    trackGoal
  }
}

// Conditional Experiment Hook
export function useConditionalExperiment(
  experimentId: string,
  condition: boolean
): ExperimentResult {
  const { engine, context } = useExperimentContext()
  
  return useMemo(() => {
    if (!condition) {
      return {
        experimentId,
        variantId: null,
        isParticipant: false,
        reason: 'Condition not met'
      }
    }
    
    return engine.assignVariant(experimentId, context)
  }, [engine, experimentId, context, condition])
}

// Experiment with Fallback Hook
export function useExperimentWithFallback<T>(
  experimentId: string,
  fallbackConfig: T
): T {
  const config = useExperimentConfig<T>(experimentId)
  return config || fallbackConfig
}

// A/B Test Hook (simplified interface)
export function useABTest(experimentId: string): {
  variant: string | null
  isA: boolean
  isB: boolean
  config: any
} {
  const result = useExperiment(experimentId)
  const config = useExperimentConfig(experimentId)
  
  return useMemo(() => ({
    variant: result.variantId,
    isA: result.variantId === 'a' || result.variantId === 'control',
    isB: result.variantId === 'b' || result.variantId === 'treatment',
    config
  }), [result.variantId, config])
}

// Experiment Analytics Hook
export function useExperimentAnalytics() {
  const { engine } = useExperimentContext()
  const [analytics, setAnalytics] = useState<any[]>([])
  
  const getExperimentStats = useCallback((experimentId: string) => {
    const experiment = engine.getAllExperiments().find(exp => exp.id === experimentId)
    if (!experiment) return null
    
    // 실제 구현에서는 서버에서 통계 데이터를 가져와야 함
    return {
      experimentId,
      totalParticipants: 0,
      variants: experiment.variants.map(variant => ({
        variantId: variant.id,
        participants: 0,
        conversionRate: 0,
        metrics: {}
      }))
    }
  }, [engine])
  
  const refreshAnalytics = useCallback(() => {
    const experiments = engine.getAllExperiments()
    const analyticsData = experiments.map(exp => getExperimentStats(exp.id))
    setAnalytics(analyticsData.filter(Boolean))
  }, [engine, getExperimentStats])
  
  useEffect(() => {
    refreshAnalytics()
  }, [refreshAnalytics])
  
  return {
    analytics,
    getExperimentStats,
    refreshAnalytics
  }
}

// Admin Hook for Experiment Management
export function useExperimentAdmin() {
  const { engine, updateContext } = useExperimentContext()
  
  const getAllExperiments = useCallback(() => {
    return engine.getAllExperiments()
  }, [engine])
  
  const updateExperiment = useCallback((experimentId: string, updates: any) => {
    engine.updateExperiment(experimentId, updates)
  }, [engine])
  
  const refreshContext = useCallback((newContext: any) => {
    updateContext(newContext)
  }, [updateContext])
  
  const getUserAssignments = useCallback((userId: string) => {
    return engine.getUserAssignments(userId)
  }, [engine])
  
  return {
    getAllExperiments,
    updateExperiment,
    refreshContext,
    getUserAssignments
  }
}