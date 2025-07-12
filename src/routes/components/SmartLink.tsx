import React, { useRef, useEffect } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { useRoutePreloader } from '../preloader'

interface SmartLinkProps extends LinkProps {
  to: string
  preload?: 'hover' | 'focus' | 'immediate' | 'none'
  preloadDelay?: number
  children: React.ReactNode
}

export function SmartLink({ 
  to, 
  preload = 'hover', 
  preloadDelay = 0,
  children,
  ...linkProps 
}: SmartLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const { preloadRoute, preloadOnHover, preloadOnFocus, isPreloaded } = useRoutePreloader()
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const element = linkRef.current
    if (!element || preload === 'none') return

    let cleanup: (() => void) | undefined

    if (preload === 'immediate') {
      if (preloadDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          preloadRoute(to)
        }, preloadDelay)
      } else {
        preloadRoute(to)
      }
    } else if (preload === 'hover') {
      cleanup = preloadOnHover(to)(element)
    } else if (preload === 'focus') {
      cleanup = preloadOnFocus(to)(element)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (cleanup) {
        cleanup()
      }
    }
  }, [to, preload, preloadDelay, preloadRoute, preloadOnHover, preloadOnFocus])

  return (
    <Link 
      ref={linkRef} 
      to={to} 
      {...linkProps}
      className={`${linkProps.className || ''} ${isPreloaded(to) ? 'preloaded' : ''}`.trim()}
    >
      {children}
    </Link>
  )
}

interface PreloadLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  onPreloadStart?: () => void
  onPreloadComplete?: () => void
  onPreloadError?: (error: Error) => void
}

export function PreloadLink({ 
  to, 
  children, 
  className,
  onPreloadStart,
  onPreloadComplete,
  onPreloadError
}: PreloadLinkProps) {
  const { preloadRoute, isPreloaded, isPreloading } = useRoutePreloader()
  const [localPreloading, setLocalPreloading] = React.useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    if (!isPreloaded(to) && !isPreloading(to)) {
      e.preventDefault()
      setLocalPreloading(true)
      onPreloadStart?.()

      try {
        await preloadRoute(to)
        onPreloadComplete?.()
        
        // 프리로드 완료 후 네비게이션 실행
        window.location.href = to
      } catch (error) {
        onPreloadError?.(error as Error)
        console.error('Preload failed:', error)
        // 에러 발생 시에도 네비게이션은 실행
        window.location.href = to
      } finally {
        setLocalPreloading(false)
      }
    }
  }

  const isLoading = localPreloading || isPreloading(to)

  return (
    <Link 
      to={to} 
      className={className}
      onClick={handleClick}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="mr-2">로딩 중...</span>
          <span className="animate-spin">⟳</span>
        </span>
      ) : (
        children
      )}
    </Link>
  )
}

interface RouteNavLinkProps {
  to: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  preload?: boolean
  className?: string
  activeClassName?: string
}

export function RouteNavLink({ 
  to, 
  label, 
  icon, 
  badge,
  preload = true,
  className = '',
  activeClassName = 'active'
}: RouteNavLinkProps) {
  const { preloadRoute, isPreloaded } = useRoutePreloader()
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (preload) {
      preloadRoute(to)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <Link
      to={to}
      className={`${className} ${isHovered ? 'hovered' : ''} ${isPreloaded(to) ? 'preloaded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center space-x-2">
        {icon && <span className="icon">{icon}</span>}
        <span className="label">{label}</span>
        {badge && (
          <span className="badge bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  )
}