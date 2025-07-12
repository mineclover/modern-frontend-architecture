import { FeatureFlag } from './types'

export const featureFlags: FeatureFlag[] = [
  {
    key: 'new-user-dashboard',
    name: 'New User Dashboard',
    description: 'Enable new dashboard design for users',
    enabled: true,
    rollout: 50, // 50% 사용자에게만 노출
    conditions: [
      {
        type: 'user_role',
        operator: 'in',
        value: ['admin', 'user']
      }
    ]
  },
  {
    key: 'advanced-search',
    name: 'Advanced Search Feature',
    description: 'Enable advanced search functionality',
    enabled: false
  },
  {
    key: 'new-product-details',
    name: 'New Product Details Page',
    description: 'Enable redesigned product details page',
    enabled: true,
    rollout: 30,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31')
  },
  {
    key: 'checkout-optimization',
    name: 'Optimized Checkout Flow',
    description: 'Enable streamlined checkout process',
    enabled: true,
    rollout: 75,
    conditions: [
      {
        type: 'environment',
        operator: 'in',
        value: ['production', 'staging']
      }
    ]
  },
  {
    key: 'mobile-app-banner',
    name: 'Mobile App Download Banner',
    description: 'Show mobile app download banner',
    enabled: true,
    conditions: [
      {
        type: 'user_role',
        operator: 'not_in',
        value: ['guest']
      }
    ]
  }
]

// 개발 환경용 플래그
export const developmentFlags: FeatureFlag[] = [
  {
    key: 'debug-mode',
    name: 'Debug Mode',
    description: 'Enable debug information display',
    enabled: true,
    conditions: [
      {
        type: 'environment',
        operator: 'equals',
        value: 'development'
      }
    ]
  },
  {
    key: 'feature-testing',
    name: 'Feature Testing Mode',
    description: 'Enable experimental features for testing',
    enabled: true,
    conditions: [
      {
        type: 'user_role',
        operator: 'equals',
        value: 'admin'
      }
    ]
  }
]

// 환경에 따른 플래그 병합
export function getAllFeatureFlags(): FeatureFlag[] {
  const flags = [...featureFlags]
  
  if (process.env.NODE_ENV === 'development') {
    flags.push(...developmentFlags)
  }
  
  return flags
}