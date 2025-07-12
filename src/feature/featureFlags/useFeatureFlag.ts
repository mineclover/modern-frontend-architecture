import { useCallback, useMemo, useContext } from 'react'
import { FeatureFlagEvaluator } from './flagEvaluator'
import { getAllFeatureFlags } from './flagConfig'
import { FeatureFlagContext } from './types'
import { FeatureFlagProvider } from './FeatureFlagProvider'

// Context Hook
export function useFeatureFlagContext() {
  const context = useContext(FeatureFlagProvider)
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within FeatureFlagProvider')
  }
  return context
}

// Main Feature Flag Hook
export function useFeatureFlag(flagKey: string): boolean {
  const { evaluator, context } = useFeatureFlagContext()
  
  return useMemo(() => {
    const evaluation = evaluator.evaluate(flagKey, context)
    return evaluation.enabled
  }, [evaluator, flagKey, context])
}

// Advanced Feature Flag Hook with evaluation details
export function useFeatureFlagEvaluation(flagKey: string) {
  const { evaluator, context } = useFeatureFlagContext()
  
  return useMemo(() => {
    return evaluator.evaluate(flagKey, context)
  }, [evaluator, flagKey, context])
}

// Multiple Feature Flags Hook
export function useFeatureFlags(flagKeys: string[]): Record<string, boolean> {
  const { evaluator, context } = useFeatureFlagContext()
  
  return useMemo(() => {
    const results: Record<string, boolean> = {}
    flagKeys.forEach(key => {
      const evaluation = evaluator.evaluate(key, context)
      results[key] = evaluation.enabled
    })
    return results
  }, [evaluator, flagKeys, context])
}

// Feature Flag with Fallback Hook
export function useFeatureFlagWithFallback(flagKey: string, fallback: boolean = false): boolean {
  const { evaluator, context } = useFeatureFlagContext()
  
  return useMemo(() => {
    try {
      const evaluation = evaluator.evaluate(flagKey, context)
      return evaluation.enabled
    } catch (error) {
      console.warn(`Feature flag evaluation failed for ${flagKey}:`, error)
      return fallback
    }
  }, [evaluator, flagKey, context, fallback])
}

// Admin Hook for Flag Management
export function useFeatureFlagAdmin() {
  const { evaluator, updateContext } = useFeatureFlagContext()
  
  const getAllFlags = useCallback(() => {
    return evaluator.getAllFlags()
  }, [evaluator])
  
  const updateFlag = useCallback((flagKey: string, updates: any) => {
    evaluator.updateFlag(flagKey, updates)
  }, [evaluator])
  
  const addFlag = useCallback((flag: any) => {
    evaluator.addFlag(flag)
  }, [evaluator])
  
  const removeFlag = useCallback((flagKey: string) => {
    evaluator.removeFlag(flagKey)
  }, [evaluator])
  
  const refreshContext = useCallback((newContext: Partial<FeatureFlagContext>) => {
    updateContext(newContext)
  }, [updateContext])
  
  return {
    getAllFlags,
    updateFlag,
    addFlag,
    removeFlag,
    refreshContext
  }
}

// Conditional Component Hook
export function useConditionalComponent(flagKey: string) {
  const isEnabled = useFeatureFlag(flagKey)
  
  const ConditionalComponent = useCallback(({ 
    children, 
    fallback = null 
  }: { 
    children: React.ReactNode
    fallback?: React.ReactNode 
  }) => {
    return isEnabled ? children : fallback
  }, [isEnabled])
  
  return { isEnabled, ConditionalComponent }
}

// Performance optimized hook for static flags
export function useStaticFeatureFlag(flagKey: string): boolean {
  const flags = useMemo(() => getAllFeatureFlags(), [])
  const flag = flags.find(f => f.key === flagKey)
  
  // For static flags that don't depend on user context
  return useMemo(() => {
    if (!flag || !flag.enabled) return false
    
    // Only evaluate date-based and environment conditions for static flags
    if (flag.startDate && new Date() < flag.startDate) return false
    if (flag.endDate && new Date() > flag.endDate) return false
    
    // Environment check
    const envCondition = flag.conditions?.find(c => c.type === 'environment')
    if (envCondition) {
      const currentEnv = process.env.NODE_ENV
      if (envCondition.operator === 'equals' && currentEnv !== envCondition.value) return false
      if (envCondition.operator === 'in' && !envCondition.value.includes(currentEnv)) return false
    }
    
    return true
  }, [flag])
}