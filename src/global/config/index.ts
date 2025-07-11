// 앱 전역 설정
export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  appTitle: import.meta.env.VITE_APP_TITLE || 'Modern Frontend App',
  environment: import.meta.env.MODE || 'development',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
} as const

export const isDevelopment = appConfig.environment === 'development'
export const isProduction = appConfig.environment === 'production'

export const features = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableFeatureFlags: import.meta.env.VITE_ENABLE_FEATURE_FLAGS === 'true',
  enableExperiments: import.meta.env.VITE_ENABLE_EXPERIMENTS === 'true',
} as const