// Experiments Public API

// Types
export type { 
  Experiment, 
  ExperimentVariant,
  ExperimentTargeting,
  ExperimentContext,
  ExperimentResult,
  ExperimentAssignment,
  ExperimentStatus,
  ExperimentMetrics,
  ExperimentAnalysis
} from './types'

// Core
export { ExperimentEngine } from './experimentEngine'
export { getAllExperiments, getActiveExperiments, experiments, developmentExperiments } from './experimentConfig'

// React Hooks
export {
  useExperiment,
  useExperimentVariant,
  useExperimentConfig,
  useExperiments,
  useExperimentTracking,
  useConditionalExperiment,
  useExperimentWithFallback,
  useABTest,
  useExperimentAnalytics,
  useExperimentAdmin
} from './useExperiment'

// Components
export {
  Experiment,
  Variant,
  ExperimentSwitch,
  ABTest,
  ExperimentConfigConsumer,
  ConditionalExperiment,
  ExperimentDebug,
  ExperimentProvider,
  withExperiments
} from './components'