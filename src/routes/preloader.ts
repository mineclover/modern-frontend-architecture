export class RoutePreloader {
  private preloadedRoutes = new Set<string>()
  private preloadPromises = new Map<string, Promise<any>>()

  preloadRoute(routePath: string): Promise<any> | null {
    if (this.preloadedRoutes.has(routePath)) return null
    
    // 이미 프리로딩 중인 경우 기존 Promise 반환
    if (this.preloadPromises.has(routePath)) {
      return this.preloadPromises.get(routePath)!
    }

    const preloadPromise = this.getPreloadPromise(routePath)
    if (!preloadPromise) return null

    // Promise 저장하고 완료 시 정리
    this.preloadPromises.set(routePath, preloadPromise)
    
    preloadPromise
      .then(() => {
        this.preloadedRoutes.add(routePath)
        this.preloadPromises.delete(routePath)
      })
      .catch((error) => {
        console.warn(`Failed to preload route ${routePath}:`, error)
        this.preloadPromises.delete(routePath)
      })

    return preloadPromise
  }

  private getPreloadPromise(routePath: string): Promise<any> | null {
    switch (routePath) {
      case '/users':
      case '/user':
        return import('./user')
      
      case '/products':
      case '/product':
        return import('./product')
      
      case '/orders':
      case '/order':
        return import('./order')
      
      case '/admin':
        return import('./admin')
      
      case '/dashboard':
        return import('./dashboard')
      
      case '/analytics':
        return import('./analytics')
      
      default:
        return null
    }
  }

  preloadOnHover(element: HTMLElement, routePath: string) {
    const handleMouseEnter = () => {
      this.preloadRoute(routePath)
    }
    
    element.addEventListener('mouseenter', handleMouseEnter, { once: true })
    
    // 정리 함수 반환
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
    }
  }

  preloadOnFocus(element: HTMLElement, routePath: string) {
    const handleFocus = () => {
      this.preloadRoute(routePath)
    }
    
    element.addEventListener('focus', handleFocus, { once: true })
    
    return () => {
      element.removeEventListener('focus', handleFocus)
    }
  }

  // 여러 라우트를 한 번에 프리로드
  preloadRoutes(routePaths: string[]): Promise<any[]> {
    const promises = routePaths
      .map(path => this.preloadRoute(path))
      .filter(Boolean) as Promise<any>[]
    
    return Promise.allSettled(promises)
  }

  // 우선순위가 높은 라우트들을 미리 로드
  preloadCriticalRoutes(): Promise<any[]> {
    const criticalRoutes = ['/dashboard', '/users', '/products']
    return this.preloadRoutes(criticalRoutes)
  }

  // 프리로드 상태 확인
  isPreloaded(routePath: string): boolean {
    return this.preloadedRoutes.has(routePath)
  }

  isPreloading(routePath: string): boolean {
    return this.preloadPromises.has(routePath)
  }

  // 프리로드된 라우트 목록
  getPreloadedRoutes(): string[] {
    return Array.from(this.preloadedRoutes)
  }

  // 메모리 정리
  clear(): void {
    this.preloadedRoutes.clear()
    this.preloadPromises.clear()
  }
}

// 싱글톤 인스턴스
export const routePreloader = new RoutePreloader()

// React Hook for Route Preloading
export function useRoutePreloader() {
  const preloadRoute = (routePath: string) => {
    return routePreloader.preloadRoute(routePath)
  }

  const preloadOnHover = (routePath: string) => {
    return (element: HTMLElement | null) => {
      if (element) {
        return routePreloader.preloadOnHover(element, routePath)
      }
    }
  }

  const preloadOnFocus = (routePath: string) => {
    return (element: HTMLElement | null) => {
      if (element) {
        return routePreloader.preloadOnFocus(element, routePath)
      }
    }
  }

  return {
    preloadRoute,
    preloadOnHover,
    preloadOnFocus,
    isPreloaded: routePreloader.isPreloaded.bind(routePreloader),
    isPreloading: routePreloader.isPreloading.bind(routePreloader)
  }
}