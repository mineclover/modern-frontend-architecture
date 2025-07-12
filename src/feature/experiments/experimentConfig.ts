import { Experiment } from './types'

export const experiments: Experiment[] = [
  {
    id: 'checkout-optimization-v1',
    name: 'Checkout Flow Optimization',
    description: 'Test simplified vs detailed checkout process',
    status: 'running',
    variants: [
      {
        id: 'control',
        name: 'Original Checkout',
        weight: 50,
        config: {
          checkoutType: 'original',
          showProgressBar: true,
          showGuestCheckout: false
        },
        description: 'Current checkout flow'
      },
      {
        id: 'simplified',
        name: 'Simplified Checkout',
        weight: 50,
        config: {
          checkoutType: 'simplified',
          showProgressBar: false,
          showGuestCheckout: true,
          onePageCheckout: true
        },
        description: 'Streamlined one-page checkout'
      }
    ],
    targeting: {
      userRoles: ['user', 'premium'],
      deviceTypes: ['desktop', 'mobile'],
      customConditions: [
        {
          key: 'cartValue',
          operator: 'greater_than',
          value: 50000 // 5만원 이상 장바구니
        }
      ]
    },
    metrics: ['conversion_rate', 'cart_abandonment', 'time_to_purchase'],
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-03-01'),
    trafficAllocation: 80,
    hypothesis: 'Simplified checkout will reduce cart abandonment by 15%',
    successCriteria: 'Increase conversion rate by at least 10%'
  },
  {
    id: 'product-recommendation-v2',
    name: 'AI vs Rule-based Recommendations',
    description: 'Compare AI-powered vs rule-based product recommendations',
    status: 'running',
    variants: [
      {
        id: 'rule_based',
        name: 'Rule-based Recommendations',
        weight: 40,
        config: {
          algorithm: 'rule_based',
          maxRecommendations: 6,
          showPriceFirst: true
        }
      },
      {
        id: 'ai_powered',
        name: 'AI-powered Recommendations',
        weight: 60,
        config: {
          algorithm: 'ai_ml',
          maxRecommendations: 8,
          showPriceFirst: false,
          personalizedRanking: true
        }
      }
    ],
    targeting: {
      userRoles: ['user', 'premium'],
      userSegments: ['active_shoppers', 'repeat_customers']
    },
    metrics: ['click_through_rate', 'add_to_cart_rate', 'revenue_per_visitor'],
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-04-15'),
    trafficAllocation: 100
  },
  {
    id: 'pricing-display-test',
    name: 'Pricing Display Format',
    description: 'Test different pricing display formats',
    status: 'ready',
    variants: [
      {
        id: 'standard',
        name: 'Standard Pricing',
        weight: 33,
        config: {
          priceFormat: 'standard',
          showOriginalPrice: true,
          currencySymbol: '₩'
        }
      },
      {
        id: 'emphasized',
        name: 'Emphasized Discount',
        weight: 33,
        config: {
          priceFormat: 'emphasized_discount',
          showSavingsAmount: true,
          highlightDiscount: true
        }
      },
      {
        id: 'minimalist',
        name: 'Minimalist Pricing',
        weight: 34,
        config: {
          priceFormat: 'minimalist',
          showOriginalPrice: false,
          cleanLayout: true
        }
      }
    ],
    targeting: {
      deviceTypes: ['desktop', 'mobile'],
      geoLocation: ['KR', 'JP', 'US']
    },
    metrics: ['conversion_rate', 'average_order_value', 'price_comparison_clicks'],
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-03-31'),
    trafficAllocation: 60
  }
]

// 개발 환경용 실험
export const developmentExperiments: Experiment[] = [
  {
    id: 'dev-ui-testing',
    name: 'Development UI Testing',
    description: 'UI component testing in development',
    status: 'running',
    variants: [
      {
        id: 'current',
        name: 'Current UI',
        weight: 50,
        config: { theme: 'current' }
      },
      {
        id: 'new',
        name: 'New UI',
        weight: 50,
        config: { theme: 'experimental' }
      }
    ],
    targeting: {
      userRoles: ['admin', 'developer']
    },
    metrics: ['user_satisfaction'],
    startDate: new Date('2025-01-01'),
    trafficAllocation: 100
  }
]

// 환경에 따른 실험 병합
export function getAllExperiments(): Experiment[] {
  const allExperiments = [...experiments]
  
  if (process.env.NODE_ENV === 'development') {
    allExperiments.push(...developmentExperiments)
  }
  
  return allExperiments
}

// 활성 실험만 가져오기
export function getActiveExperiments(): Experiment[] {
  const now = new Date()
  return getAllExperiments().filter(exp => 
    exp.status === 'running' && 
    exp.startDate <= now && 
    (!exp.endDate || exp.endDate > now)
  )
}