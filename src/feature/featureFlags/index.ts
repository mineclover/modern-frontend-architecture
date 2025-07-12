// Feature Flags Public API

// Types
export type { 
  FeatureFlag, 
  FeatureFlagCondition, 
  FeatureFlagContext,
  FeatureFlagEvaluation 
} from './types'

// Core
export { FeatureFlagEvaluator } from './flagEvaluator'
export { getAllFeatureFlags, featureFlags, developmentFlags } from './flagConfig'

// React Hooks
export {
  useFeatureFlag,
  useFeatureFlagEvaluation,
  useFeatureFlags,
  useFeatureFlagWithFallback,
  useFeatureFlagAdmin,
  useConditionalComponent,
  useStaticFeatureFlag
} from './useFeatureFlag'

// Components
export {
  FeatureFlag,
  ConditionalFeature,
  FeatureSwitch,
  MultiFeatureFlag,
  FeatureFlagDebug,
  FeatureFlagProvider,
  withFeatureFlags
} from './components'