# Task 3: 전체 마이그레이션 및 최적화

**기간**: 3-4주  
**담당**: 전체 개발팀 + 성능 전문가  
**목표**: 모든 도메인을 새 구조로 마이그레이션하고 시스템 전반을 최적화

## 🎯 핵심 목표

- ✅ 모든 도메인 마이그레이션 완료
- ✅ Feature 시스템 구축
- ✅ Routes 레이어 최적화
- ✅ 성능 최적화
- ✅ 기존 코드 완전 정리

## 📋 1단계: 나머지 도메인 마이그레이션 (10-14일)

### 1.1 도메인 마이그레이션 계획

| 주차 | 도메인 | 담당자 | 복잡도 | 예상 공수 |
|------|--------|--------|--------|-----------|
| 1주차 | Order | [담당자] | 🔴 High | 5일 |
| 1주차 | Payment | [담당자] | 🟡 Medium | 3일 |
| 2주차 | Inventory | [담당자] | 🟡 Medium | 4일 |
| 2주차 | Analytics | [담당자] | 🟢 Low | 2일 |
| 3주차 | Admin | [담당자] | 🔴 High | 6일 |
| 3주차 | Notification | [담당자] | 🟢 Low | 2일 |

### 1.2 Order 도메인 마이그레이션 (5일)

#### 1.2.1 기존 코드 분석
```typescript
// 기존 Order 관련 파일 매핑
/components/Order/
├── OrderCard.tsx
├── OrderList.tsx
├── OrderDetail.tsx
├── OrderForm.tsx
├── Checkout.tsx
└── PaymentForm.tsx

/hooks/
├── useOrder.ts
├── useOrderList.ts
├── useCheckout.ts
└── usePayment.ts

/store/
├── orderSlice.ts
├── checkoutSlice.ts
└── paymentSlice.ts
```

#### 1.2.2 복잡한 의존성 처리
```typescript
// Order 도메인의 복잡한 의존성
Order → User (주문자 정보)
Order → Product (주문 상품)
Order → Payment (결제 정보)
Order → Inventory (재고 확인)

// 해결 방안: 타입만 참조, 실제 로직은 API 호출
// src/domain/order/types/order.ts
export interface Order {
  id: string
  userId: string // User 도메인의 ID만 참조
  productIds: string[] // Product ID 배열만 참조
  paymentId: string // Payment ID만 참조
  status: OrderStatus
  // ... 기타 주문 정보
}

// 실제 관련 데이터는 API에서 조합
// src/domain/order/api/orderApi.ts
export const orderApi = {
  async getOrderWithDetails(id: string): Promise<OrderWithDetails> {
    // 주문 기본 정보
    const order = await httpClient.get(`/orders/${id}`)
    
    // 관련 정보는 별도 API 호출 (필요시)
    const user = await httpClient.get(`/users/${order.userId}`)
    const products = await httpClient.get(`/products`, { 
      params: { ids: order.productIds }
    })
    
    return {
      ...order,
      user,
      products
    }
  }
}
```

#### 1.2.3 상태 관리 최적화
```typescript
// src/domain/order/store/orderQueries.ts
export const orderQueryKeys = {
  all: ['orders'] as const,
  lists: () => [...orderQueryKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderQueryKeys.lists(), filters] as const,
  details: () => [...orderQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderQueryKeys.details(), id] as const,
  userOrders: (userId: string) => [...orderQueryKeys.all, 'user', userId] as const,
  checkout: () => [...orderQueryKeys.all, 'checkout'] as const,
}

// 최적화된 쿼리 훅
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderQueryKeys.detail(id),
    queryFn: () => orderApi.getOrderWithDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  })
}

export function useOrderList(filters: OrderFilters) {
  return useQuery({
    queryKey: orderQueryKeys.list(filters),
    queryFn: () => orderApi.getOrderList(filters),
    keepPreviousData: true, // 페이지네이션 최적화
  })
}
```

### 1.3 병렬 도메인 마이그레이션 전략

#### 1.3.1 팀 분할 작업
```bash
# Team A: Order + Payment
git checkout -b migration/order-payment
# 밀접한 관련이 있는 도메인을 함께 작업

# Team B: Inventory + Analytics  
git checkout -b migration/inventory-analytics
# 독립적인 도메인들을 병렬 작업

# Team C: Admin + Notification
git checkout -b migration/admin-notification
# 시스템 레벨 도메인들을 함께 작업
```

#### 1.3.2 의존성 충돌 방지
```typescript
// 도메인 간 의존성이 있는 경우 인터페이스로 분리
// src/shared/types/domainInterfaces.ts
export interface OrderUser {
  id: string
  name: string
  email: string
}

export interface OrderProduct {
  id: string
  name: string
  price: number
  thumbnail: string
}

// 각 도메인에서 자신의 타입으로 변환
// src/domain/order/utils/typeAdapters.ts
export function adaptUserForOrder(user: User): OrderUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  }
}
```

## 📋 2단계: Feature 시스템 구축 (5-7일)

### 2.1 Feature Flags 시스템

#### 2.1.1 기본 구조
```typescript
// src/feature/featureFlags/flagConfig.ts
export interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  rollout?: number // 0-100% 점진적 롤아웃
  conditions?: FeatureFlagCondition[]
}

export interface FeatureFlagCondition {
  type: 'user_role' | 'user_id' | 'environment' | 'date_range'
  operator: 'equals' | 'in' | 'not_in' | 'greater_than' | 'less_than'
  value: any
}

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
        value: ['admin', 'premium_user']
      }
    ]
  },
  {
    key: 'advanced-search',
    name: 'Advanced Search Feature',
    description: 'Enable advanced search functionality',
    enabled: false
  }
]
```

#### 2.1.2 Feature Flag 훅
```typescript
// src/feature/featureFlags/useFeatureFlag.ts
import { useUser } from '@/domain/user'
import { featureFlags } from './flagConfig'

export function useFeatureFlag(flagKey: string): boolean {
  const { user } = useUser()
  
  const flag = featureFlags.find(f => f.key === flagKey)
  if (!flag || !flag.enabled) return false
  
  // 조건 검사
  if (flag.conditions) {
    const hasAccess = flag.conditions.every(condition => 
      evaluateCondition(condition, user)
    )
    if (!hasAccess) return false
  }
  
  // 점진적 롤아웃
  if (flag.rollout && flag.rollout < 100) {
    const userHash = hashUserId(user?.id || 'anonymous')
    return userHash < flag.rollout
  }
  
  return true
}

function evaluateCondition(condition: FeatureFlagCondition, user: any): boolean {
  switch (condition.type) {
    case 'user_role':
      return condition.operator === 'in' 
        ? condition.value.includes(user?.role)
        : user?.role === condition.value
    
    case 'user_id':
      return condition.operator === 'in'
        ? condition.value.includes(user?.id)
        : user?.id === condition.value
    
    default:
      return false
  }
}

function hashUserId(userId: string): number {
  // 사용자 ID를 0-100 사이 숫자로 해시
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash) % 100
}
```

### 2.2 A/B 테스트 시스템

#### 2.2.1 실험 관리
```typescript
// src/feature/experiments/experimentConfig.ts
export interface Experiment {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'completed' | 'paused'
  variants: ExperimentVariant[]
  targeting: ExperimentTargeting
  metrics: string[]
  startDate: Date
  endDate?: Date
}

export interface ExperimentVariant {
  id: string
  name: string
  weight: number // 0-100% 트래픽 배분
  config: Record<string, any>
}

export interface ExperimentTargeting {
  userRoles?: string[]
  userSegments?: string[]
  geoLocation?: string[]
  deviceTypes?: string[]
}

// src/feature/experiments/useExperiment.ts
export function useExperiment(experimentId: string) {
  const { user } = useUser()
  const experiment = experiments.find(e => e.id === experimentId)
  
  if (!experiment || experiment.status !== 'running') {
    return { variant: null, isParticipant: false }
  }
  
  // 타겟팅 조건 확인
  const isTargeted = checkTargeting(experiment.targeting, user)
  if (!isTargeted) {
    return { variant: null, isParticipant: false }
  }
  
  // 변형 할당
  const variant = assignVariant(experiment.variants, user.id)
  
  return { variant, isParticipant: true }
}
```

### 2.3 Task 관리 시스템

#### 2.3.1 백그라운드 작업 관리
```typescript
// src/feature/tasks/taskScheduler.ts
export interface Task {
  id: string
  name: string
  type: 'immediate' | 'delayed' | 'recurring'
  status: 'pending' | 'running' | 'completed' | 'failed'
  handler: TaskHandler
  config: TaskConfig
  createdAt: Date
  scheduledAt?: Date
  completedAt?: Date
}

export interface TaskConfig {
  maxRetries?: number
  retryDelay?: number
  timeout?: number
  cronExpression?: string // for recurring tasks
}

export class TaskScheduler {
  private tasks = new Map<string, Task>()
  private runningTasks = new Set<string>()

  async scheduleTask(task: Omit<Task, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const taskId = generateTaskId()
    const fullTask: Task = {
      ...task,
      id: taskId,
      status: 'pending',
      createdAt: new Date()
    }
    
    this.tasks.set(taskId, fullTask)
    
    if (task.type === 'immediate') {
      this.executeTask(taskId)
    } else if (task.type === 'delayed' && task.scheduledAt) {
      setTimeout(() => this.executeTask(taskId), 
        task.scheduledAt.getTime() - Date.now())
    }
    
    return taskId
  }

  private async executeTask(taskId: string) {
    const task = this.tasks.get(taskId)
    if (!task || this.runningTasks.has(taskId)) return

    try {
      this.runningTasks.add(taskId)
      task.status = 'running'
      
      await task.handler(task.config)
      
      task.status = 'completed'
      task.completedAt = new Date()
    } catch (error) {
      task.status = 'failed'
      console.error(`Task ${taskId} failed:`, error)
      
      // 재시도 로직
      if (task.config.maxRetries && task.config.maxRetries > 0) {
        // 재시도 구현
      }
    } finally {
      this.runningTasks.delete(taskId)
    }
  }
}
```

## 📋 3단계: Routes 레이어 최적화 (3-5일)

### 3.1 라우트 기반 코드 스플리팅

#### 3.1.1 동적 Import 적용
```typescript
// src/routes/index.ts
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/shared/components'

// 도메인별 코드 스플리팅
const UserRoutes = lazy(() => import('./user'))
const ProductRoutes = lazy(() => import('./product'))
const OrderRoutes = lazy(() => import('./order'))
const AdminRoutes = lazy(() => import('./admin'))

// 라우트 컴포넌트 래퍼
function LazyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

// 메인 라우터 설정
export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/users/*" element={
          <LazyRoute>
            <UserRoutes />
          </LazyRoute>
        } />
        
        <Route path="/products/*" element={
          <LazyRoute>
            <ProductRoutes />
          </LazyRoute>
        } />
        
        <Route path="/orders/*" element={
          <LazyRoute>
            <OrderRoutes />
          </LazyRoute>
        } />
        
        <Route path="/admin/*" element={
          <LazyRoute>
            <AdminRoutes />
          </LazyRoute>
        } />
      </Routes>
    </Router>
  )
}
```

#### 3.1.2 프리로딩 최적화
```typescript
// src/routes/preloader.ts
export class RoutePreloader {
  private preloadedRoutes = new Set<string>()

  preloadRoute(routePath: string) {
    if (this.preloadedRoutes.has(routePath)) return

    switch (routePath) {
      case '/users':
        import('./user').then(() => {
          this.preloadedRoutes.add(routePath)
        })
        break
      
      case '/products':
        import('./product').then(() => {
          this.preloadedRoutes.add(routePath)
        })
        break
      
      // 다른 라우트들...
    }
  }

  preloadOnHover(element: HTMLElement, routePath: string) {
    element.addEventListener('mouseenter', () => {
      this.preloadRoute(routePath)
    }, { once: true })
  }
}

// 사용법
const preloader = new RoutePreloader()

// 링크에 호버시 프리로드
<Link 
  to="/products"
  onMouseEnter={() => preloader.preloadRoute('/products')}
>
  Products
</Link>
```

### 3.2 페이지 최적화

#### 3.2.1 표준화된 페이지 구조
```typescript
// src/routes/user/UserListPage.tsx
import React from 'react'
import { UserList } from '@/domain/user'
import { PageLayout, SEOHead } from '@/shared/components'
import { useFeatureFlag } from '@/feature/featureFlags'

const UserListPage = () => {
  const isNewDesignEnabled = useFeatureFlag('new-user-list-design')

  return (
    <>
      <SEOHead 
        title="사용자 목록"
        description="시스템에 등록된 모든 사용자를 관리합니다"
        keywords="사용자, 관리, 목록"
      />
      
      <PageLayout>
        <UserList variant={isNewDesignEnabled ? 'enhanced' : 'default'} />
      </PageLayout>
    </>
  )
}

export default UserListPage
```

#### 3.2.2 에러 바운더리 적용
```typescript
// src/routes/ErrorBoundary.tsx
import React from 'react'
import { ErrorMessage } from '@/shared/components'
import { trackError } from '@/feature/analytics'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class RouteErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    trackError(error, {
      component: 'RouteErrorBoundary',
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          title="페이지 로딩 중 오류가 발생했습니다"
          message="잠시 후 다시 시도해주세요"
          onRetry={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}
```

## 📋 4단계: 성능 최적화 (5-7일)

### 4.1 번들 분석 및 최적화

#### 4.1.1 번들 분석 도구 설정
```bash
# 번들 분석 스크립트
npm run build
npx vite-bundle-analyzer dist

# Webpack Bundle Analyzer (if using webpack)
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

#### 4.1.2 청크 최적화
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 도메인별 청크 분리
          'domain-user': ['src/domain/user'],
          'domain-product': ['src/domain/product'],
          'domain-order': ['src/domain/order'],
          
          // 라이브러리별 청크 분리
          vendor: ['react', 'react-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-router': ['react-router-dom'],
          
          // 공통 모듈
          shared: ['src/shared'],
          services: ['src/services'],
        }
      }
    }
  }
})

// webpack.config.js (if using webpack)
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        domain: {
          test: /[\\/]src[\\/]domain[\\/]/,
          name: 'domain',
          chunks: 'all',
          enforce: true
        },
        shared: {
          test: /[\\/]src[\\/]shared[\\/]/,
          name: 'shared',
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
}
```

### 4.2 트리 쉐이킹 최적화

#### 4.2.1 Public API 최적화
```typescript
// ❌ 잘못된 export - 모든 것을 export
export * from './components'
export * from './hooks'
export * from './utils'
export * from './store'

// ✅ 올바른 export - 필요한 것만 export
export { UserCard, UserList } from './components'
export { useUser, useUserActions } from './hooks'
export type { User, UserPreferences } from './types'
// utils, store는 내부 구현으로 export하지 않음
```

#### 4.2.2 사이드 이펙트 제거
```typescript
// package.json에 sideEffects 설정
{
  "sideEffects": false
}

// 또는 특정 파일만 사이드 이펙트가 있는 경우
{
  "sideEffects": [
    "*.css",
    "src/global/config/env.ts"
  ]
}
```

### 4.3 로딩 성능 최적화

#### 4.3.1 리소스 힌트 적용
```html
<!-- index.html -->
<head>
  <!-- DNS 프리페치 -->
  <link rel="dns-prefetch" href="//api.example.com">
  <link rel="dns-prefetch" href="//cdn.example.com">
  
  <!-- 중요 리소스 프리로드 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/critical.css" as="style">
  
  <!-- 다음 페이지 프리로드 -->
  <link rel="prefetch" href="/products">
  <link rel="prefetch" href="/orders">
</head>
```

#### 4.3.2 이미지 최적화
```typescript
// src/shared/components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  className?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  loading = 'lazy',
  className 
}: OptimizedImageProps) {
  return (
    <picture>
      {/* WebP 포맷 우선 */}
      <source 
        srcSet={`${src}?format=webp&w=${width}&h=${height}`} 
        type="image/webp" 
      />
      
      {/* 폴백 이미지 */}
      <img
        src={`${src}?w=${width}&h=${height}`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
        decoding="async"
      />
    </picture>
  )
}
```

## 📋 5단계: 기존 코드 정리 (3-4일)

### 5.1 레거시 코드 제거

#### 5.1.1 사용하지 않는 파일 식별
```bash
# 사용되지 않는 파일 찾기
npm install -g unimported
unimported

# 사용되지 않는 의존성 찾기
npm install -g depcheck
depcheck

# 데드 코드 제거
npm install --save-dev ts-prune
npx ts-prune
```

#### 5.1.2 단계적 제거 계획
```typescript
// 1단계: Deprecation 경고 추가
/**
 * @deprecated Use '@/domain/user' instead
 * This file will be removed in v2.0.0
 */
export { UserCard } from '@/domain/user'

// 2단계: 콘솔 경고 추가
export function UserCard(props: UserCardProps) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('UserCard from legacy path is deprecated. Use @/domain/user instead')
  }
  return <DomainUserCard {...props} />
}

// 3단계: 완전 제거
// 파일 삭제 후 빌드 오류 확인 및 수정
```

### 5.2 Import 경로 정리

#### 5.2.1 일괄 변경 스크립트
```bash
#!/bin/bash
# scripts/update-imports.sh

echo "🔄 Import 경로 업데이트 중..."

# 기존 경로를 새 경로로 변경
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  -e "s|import.*from ['\"]../components/User['\"]|import { UserCard, UserList } from '@/domain/user'|g" \
  -e "s|import.*from ['\"]../hooks/useUser['\"]|import { useUser } from '@/domain/user'|g" \
  -e "s|import.*from ['\"]../api/userApi['\"]|import { userApi } from '@/domain/user'|g"

echo "✅ Import 경로 업데이트 완료"

# 변경사항 확인
echo "📊 변경된 파일 수:"
git diff --name-only | wc -l
```

#### 5.2.2 ESLint 규칙으로 강제
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../components/User*', '../hooks/use*', '../api/*'],
            message: 'Use domain imports instead: @/domain/{domain}'
          }
        ]
      }
    ]
  }
}
```

## 📊 완료 기준

### 기술적 완료 조건
- [ ] 100% 도메인 마이그레이션 완료
- [ ] 모든 ESLint 규칙 통과 (위반 0건)
- [ ] TypeScript 컴파일 에러 0개
- [ ] 테스트 커버리지 80% 이상 유지
- [ ] 번들 크기 기존 대비 10% 이내 증가
- [ ] 초기 로딩 시간 20% 개선

### 성능 목표 달성
- [ ] First Contentful Paint < 1.5초
- [ ] Largest Contentful Paint < 2.5초
- [ ] Time to Interactive < 3.5초
- [ ] Cumulative Layout Shift < 0.1

### 품질 지표
- [ ] 순환 의존성: 0개
- [ ] 의존성 방향 위반: 0개
- [ ] Public API 위반: 0개
- [ ] 코드 중복률: 5% 이하

## 🎯 성공 지표

### 개발 생산성
- ✅ 새 기능 개발 시간: 26% 단축
- ✅ 버그 수정 시간: 37% 단축
- ✅ 코드 리뷰 시간: 43% 단축
- ✅ 빌드 시간: 15% 단축

### 사용자 경험
- ✅ 페이지 로딩 속도: 20% 개선
- ✅ 에러 발생률: 51% 감소
- ✅ 사용자 만족도: 향상

### 운영 효율성
- ✅ 배포 실패율: 60% 감소
- ✅ 핫픽스 빈도: 57% 감소
- ✅ 모니터링 및 디버깅 효율성: 향상

## 📞 지원 및 문의

- **성능 최적화**: 성능 전문가
- **번들 분석**: 빌드 시스템 담당자
- **Feature 시스템**: 아키텍처 리드
- **마이그레이션 이슈**: 도메인 담당자

---

**⚡ 이전 Task**: [Task 2: 핵심 도메인 마이그레이션](./task2.md)  
**⚡ 다음 Task**: [Task 4: 고도화 및 모니터링](./task4.md)