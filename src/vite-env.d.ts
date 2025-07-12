/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_FEATURE_FLAGS_ENABLED: string
  readonly VITE_ANALYTICS_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}