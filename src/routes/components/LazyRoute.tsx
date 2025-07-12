import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { LoadingSpinner } from '@/shared/components'

interface LazyRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<any>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

function DefaultErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 p-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">
        페이지 로딩 중 오류가 발생했습니다
      </h2>
      <p className="text-gray-600 mb-4 text-center">
        잠시 후 다시 시도해주세요
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        다시 시도
      </button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-4 bg-gray-100 rounded max-w-2xl">
          <summary className="cursor-pointer font-medium">
            개발자 정보
          </summary>
          <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

export function LazyRoute({ 
  children, 
  fallback = <LoadingSpinner />, 
  errorFallback = DefaultErrorFallback,
  onError
}: LazyRouteProps) {
  return (
    <ErrorBoundary
      FallbackComponent={errorFallback}
      onError={onError}
      onReset={() => window.location.reload()}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

interface ProgressiveLoadingProps {
  children: React.ReactNode
  skeleton?: React.ReactNode
  timeout?: number
}

export function ProgressiveLoading({ 
  children, 
  skeleton, 
  timeout = 200 
}: ProgressiveLoadingProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout])

  return (
    <Suspense fallback={showSkeleton ? skeleton || <LoadingSpinner /> : null}>
      {children}
    </Suspense>
  )
}

interface PreloadableLazyRouteProps extends LazyRouteProps {
  routePath: string
  preloadOnMount?: boolean
}

export function PreloadableLazyRoute({ 
  routePath,
  preloadOnMount = false,
  ...props 
}: PreloadableLazyRouteProps) {
  const [isPreloading, setIsPreloading] = React.useState(false)

  React.useEffect(() => {
    if (preloadOnMount) {
      setIsPreloading(true)
      import(`../${routePath}`)
        .then(() => setIsPreloading(false))
        .catch(() => setIsPreloading(false))
    }
  }, [routePath, preloadOnMount])

  const fallback = React.useMemo(() => {
    if (isPreloading) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-2 text-sm text-gray-600">페이지를 준비 중입니다...</p>
          </div>
        </div>
      )
    }
    return props.fallback || <LoadingSpinner />
  }, [isPreloading, props.fallback])

  return <LazyRoute {...props} fallback={fallback} />
}