import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// React Testing Library cleanup
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {}
  observe(target: Element): void {}
  disconnect(): void {}
  unobserve(target: Element): void {}
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = []
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}