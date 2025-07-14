# 🎯 Feature Layer

**도메인 조합을 통한 비즈니스 기능 구현 레이어**

## 🎯 역할과 책임

Feature 레이어는 **여러 도메인을 조합하여 완전한 비즈니스 기능**을 구현하는 레이어로, 다음과 같은 역할을 담당합니다:

- **도메인 간 협력** 로직 구현 (User + Product + Order 조합)
- **복합 비즈니스 플로우** 관리 (주문 프로세스, 결제 플로우 등)
- **피처 플래그** 및 A/B 테스트 관리
- **애널리틱스** 및 사용자 행동 추적
- **실험(Experiments)** 관리 및 점진적 기능 배포

## 📦 포함되는 내용

### `/featureFlags` - 피처 플래그 시스템
```typescript
// flagConfig.ts
export const featureFlags = {
  // 사용자 관련 기능
  enableUserProfileV2: {
    key: 'enable-user-profile-v2',
    defaultValue: false,
    description: '새로운 사용자 프로필 UI',
    environments: ['development', 'staging']
  },
  
  // 상품 관련 기능
  enableAdvancedSearch: {
    key: 'enable-advanced-search',
    defaultValue: false,
    description: '고급 검색 기능',
    rolloutPercentage: 25
  },
  
  // 주문 관련 기능
  enableOneClickCheckout: {
    key: 'enable-one-click-checkout',
    defaultValue: false,
    description: '원클릭 결제 기능',
    targetUsers: ['premium', 'vip']
  }
} as const;

// flagEvaluator.ts
export class FeatureFlagEvaluator {
  private flags: Map<string, boolean> = new Map();

  constructor(
    private user: User | null,
    private environment: string
  ) {
    this.loadFlags();
  }

  isEnabled(flagKey: keyof typeof featureFlags): boolean {
    const flag = featureFlags[flagKey];
    
    // 환경 기반 평가
    if (flag.environments && !flag.environments.includes(this.environment)) {
      return false;
    }
    
    // 사용자 타겟팅
    if (flag.targetUsers && this.user) {
      const userSegment = this.getUserSegment(this.user);
      if (!flag.targetUsers.includes(userSegment)) {
        return false;
      }
    }
    
    // 점진적 롤아웃
    if (flag.rolloutPercentage) {
      const userHash = this.getUserHash(this.user?.id || 'anonymous');
      return userHash % 100 < flag.rolloutPercentage;
    }
    
    return this.flags.get(flag.key) ?? flag.defaultValue;
  }

  private getUserSegment(user: User): string {
    // 사용자 세그먼트 결정 로직
    if (user.subscriptionType === 'premium') return 'premium';
    if (user.totalOrderValue > 1000000) return 'vip';
    return 'regular';
  }

  private getUserHash(userId: string): number {
    // 일관된 해시 값 생성
    return userId.split('').reduce((hash, char) => 
      ((hash << 5) - hash) + char.charCodeAt(0), 0
    ) % 100;
  }
}

// useFeatureFlag.ts
export const useFeatureFlag = (flagKey: keyof typeof featureFlags) => {
  const { user } = useAuth();
  const environment = appConfig.environment;
  
  return useMemo(() => {
    const evaluator = new FeatureFlagEvaluator(user, environment);
    return evaluator.isEnabled(flagKey);
  }, [flagKey, user, environment]);
};

// FeatureFlag.tsx
interface FeatureFlagProps {
  flag: keyof typeof featureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureFlag = ({ flag, children, fallback = null }: FeatureFlagProps) => {
  const isEnabled = useFeatureFlag(flag);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};
```

### `/experiments` - A/B 테스트 시스템
```typescript
// experimentConfig.ts
export const experiments = {
  checkoutButtonColor: {
    id: 'checkout-button-color',
    variants: {
      control: { buttonColor: 'blue', weight: 50 },
      treatment: { buttonColor: 'green', weight: 50 }
    },
    description: '결제 버튼 색상 A/B 테스트'
  },
  
  productListLayout: {
    id: 'product-list-layout',
    variants: {
      grid: { layout: 'grid', weight: 33 },
      list: { layout: 'list', weight: 33 },
      masonry: { layout: 'masonry', weight: 34 }
    },
    description: '상품 목록 레이아웃 테스트'
  }
} as const;

// experimentEngine.ts
export class ExperimentEngine {
  private assignments: Map<string, string> = new Map();

  constructor(private user: User | null) {
    this.loadAssignments();
  }

  getVariant<T extends keyof typeof experiments>(
    experimentId: T
  ): keyof typeof experiments[T]['variants'] {
    const cached = this.assignments.get(experimentId);
    if (cached) return cached as any;

    const experiment = experiments[experimentId];
    const variant = this.assignVariant(experimentId, experiment);
    
    this.assignments.set(experimentId, variant);
    this.trackAssignment(experimentId, variant);
    
    return variant as any;
  }

  private assignVariant(experimentId: string, experiment: any): string {
    const userId = this.user?.id || 'anonymous';
    const hash = this.getStableHash(userId + experimentId);
    
    let cumWeight = 0;
    const variants = Object.entries(experiment.variants);
    
    for (const [variantName, config] of variants) {
      cumWeight += (config as any).weight;
      if (hash % 100 < cumWeight) {
        return variantName;
      }
    }
    
    return variants[0][0]; // fallback
  }

  private trackAssignment(experimentId: string, variant: string): void {
    analyticsService.track('experiment_assigned', {
      experimentId,
      variant,
      userId: this.user?.id
    });
  }

  private getStableHash(input: string): number {
    return input.split('').reduce((hash, char) => 
      ((hash << 5) - hash) + char.charCodeAt(0), 0
    ) % 100;
  }
}

// useExperiment.ts
export const useExperiment = <T extends keyof typeof experiments>(
  experimentId: T
) => {
  const { user } = useAuth();
  
  const variant = useMemo(() => {
    const engine = new ExperimentEngine(user);
    return engine.getVariant(experimentId);
  }, [experimentId, user?.id]);

  const trackConversion = useCallback((conversionGoal: string, value?: number) => {
    analyticsService.track('experiment_conversion', {
      experimentId,
      variant,
      conversionGoal,
      value,
      userId: user?.id
    });
  }, [experimentId, variant, user?.id]);

  return { variant, trackConversion };
};

// Experiment.tsx
interface ExperimentProps<T extends keyof typeof experiments> {
  experiment: T;
  children: (variant: keyof typeof experiments[T]['variants']) => React.ReactNode;
}

export function Experiment<T extends keyof typeof experiments>({ 
  experiment, 
  children 
}: ExperimentProps<T>) {
  const { variant } = useExperiment(experiment);
  return <>{children(variant)}</>;
}
```

### `/analytics` - 사용자 행동 추적
```typescript
// analyticsService.ts
export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5초

  constructor() {
    this.startBatchProcessor();
  }

  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userId: this.getCurrentUserId(),
        page: window.location.pathname
      }
    };

    this.events.push(event);
    
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  // 도메인별 편의 메서드들
  trackUserAction(action: string, userId: string, properties?: Record<string, any>): void {
    this.track('user_action', { action, userId, ...properties });
  }

  trackProductView(productId: string, properties?: Record<string, any>): void {
    this.track('product_viewed', { productId, ...properties });
  }

  trackOrderEvent(orderId: string, event: string, properties?: Record<string, any>): void {
    this.track('order_event', { orderId, event, ...properties });
  }

  // 페이지뷰 추적
  trackPageView(path: string, properties?: Record<string, any>): void {
    this.track('page_view', { path, ...properties });
  }

  // 에러 추적
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context
    });
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await httpClient.post('/analytics/events', { events: eventsToSend });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // 실패한 이벤트를 다시 큐에 추가 (최대 재시도 횟수 제한)
      this.events.unshift(...eventsToSend.slice(0, 5));
    }
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
}

// useAnalytics.ts
export const useAnalytics = () => {
  const analyticsRef = useRef(new AnalyticsService());

  useEffect(() => {
    // 페이지 변경 감지
    const handleRouteChange = () => {
      analyticsRef.current.trackPageView(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return analyticsRef.current;
};
```

### `/tasks` - 복합 비즈니스 플로우
```typescript
// orderWorkflow.ts - 주문 프로세스 예시
export class OrderWorkflow {
  constructor(
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private analytics: AnalyticsService
  ) {}

  async processOrder(orderData: CreateOrderRequest): Promise<ProcessOrderResult> {
    const startTime = Date.now();
    this.analytics.track('order_process_started', { orderData });

    try {
      // 1. 사용자 검증
      const user = await this.validateUser(orderData.userId);
      
      // 2. 상품 검증 및 재고 확인
      const products = await this.validateProducts(orderData.items);
      
      // 3. 가격 계산
      const pricing = await this.calculatePricing(products, user);
      
      // 4. 주문 생성
      const order = await this.createOrder(orderData, pricing);
      
      // 5. 결제 처리
      const payment = await this.processPayment(order, orderData.paymentMethod);
      
      // 6. 재고 차감
      await this.updateInventory(orderData.items);
      
      // 7. 완료 처리
      await this.finalizeOrder(order.id);
      
      this.analytics.track('order_process_completed', {
        orderId: order.id,
        processingTime: Date.now() - startTime,
        totalAmount: pricing.total
      });

      return { success: true, order, payment };

    } catch (error) {
      this.analytics.trackError(error as Error, { 
        context: 'order_process',
        orderData 
      });
      
      return { success: false, error: error as Error };
    }
  }

  private async validateUser(userId: string): Promise<User> {
    const user = await this.userService.getUser(userId);
    
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    
    if (user.status === 'blocked') {
      throw new Error('차단된 사용자입니다.');
    }
    
    return user;
  }

  private async validateProducts(items: OrderItem[]): Promise<Product[]> {
    const productIds = items.map(item => item.productId);
    const products = await this.productService.getProductsByIds(productIds);
    
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        throw new Error(`상품을 찾을 수 없습니다: ${item.productId}`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`재고가 부족합니다: ${product.name}`);
      }
    }
    
    return products;
  }

  private async calculatePricing(products: Product[], user: User): Promise<OrderPricing> {
    const subtotal = products.reduce((sum, product, index) => {
      return sum + (product.price * items[index].quantity);
    }, 0);
    
    const discount = await this.calculateDiscount(user, subtotal);
    const tax = this.calculateTax(subtotal - discount);
    const shipping = await this.calculateShipping(user.address);
    
    return {
      subtotal,
      discount,
      tax,
      shipping,
      total: subtotal - discount + tax + shipping
    };
  }
}

// checkoutFlow.ts - 결제 플로우 관리
export const useCheckoutFlow = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [orderData, setOrderData] = useState<Partial<CreateOrderRequest>>({});
  const analytics = useAnalytics();

  const steps: CheckoutStep[] = ['cart', 'shipping', 'payment', 'confirmation'];

  const goToStep = useCallback((step: CheckoutStep) => {
    analytics.track('checkout_step_changed', { 
      from: currentStep, 
      to: step 
    });
    setCurrentStep(step);
  }, [currentStep, analytics]);

  const updateOrderData = useCallback((data: Partial<CreateOrderRequest>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  }, []);

  const completeStep = useCallback((stepData: any) => {
    const currentIndex = steps.indexOf(currentStep);
    
    analytics.track('checkout_step_completed', { 
      step: currentStep, 
      data: stepData 
    });
    
    updateOrderData(stepData);
    
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1]);
    }
  }, [currentStep, steps, analytics, updateOrderData, goToStep]);

  return {
    currentStep,
    orderData,
    goToStep,
    completeStep,
    updateOrderData,
    canGoBack: currentStep !== 'cart',
    canGoForward: currentStep !== 'confirmation'
  };
};
```

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **모든 하위 레이어**: `common`, `global`, `services`, `shared`, `domain`
- **외부 서비스**: Analytics SDK, Feature Flag 서비스
- **상태 관리**: 복합 상태 관리를 위한 라이브러리

### ❌ 금지되는 의존성
- **상위 레이어**: `routes`
- **UI 프레임워크**: 특정 라우팅 라이브러리에 강하게 결합

## 🏗️ 폴더 구조

```
src/feature/
├── index.ts              # Public API 정의
├── README.md            # 이 문서
├── featureFlags/
│   ├── index.ts         # 피처 플래그 시스템 export
│   ├── flagConfig.ts    # 플래그 설정
│   ├── flagEvaluator.ts # 플래그 평가 엔진
│   ├── useFeatureFlag.ts # 피처 플래그 훅
│   ├── FeatureFlagProvider.tsx # 컨텍스트 프로바이더
│   └── components/
│       └── FeatureFlag.tsx # 플래그 기반 렌더링 컴포넌트
├── experiments/
│   ├── index.ts         # A/B 테스트 시스템 export
│   ├── experimentConfig.ts # 실험 설정
│   ├── experimentEngine.ts # 실험 엔진
│   ├── useExperiment.ts # 실험 훅
│   ├── ExperimentProvider.tsx # 실험 컨텍스트
│   └── components/
│       └── Experiment.tsx # 실험 기반 렌더링 컴포넌트
├── analytics/
│   ├── index.ts         # 애널리틱스 시스템 export
│   ├── analyticsService.ts # 애널리틱스 서비스
│   ├── useAnalytics.ts  # 애널리틱스 훅
│   ├── eventTrackers.ts # 이벤트 추적기들
│   └── types.ts         # 애널리틱스 타입들
└── tasks/
    ├── index.ts         # 복합 태스크들 export
    ├── orderWorkflow.ts # 주문 처리 워크플로우
    ├── checkoutFlow.ts  # 결제 플로우
    ├── userOnboarding.ts # 사용자 온보딩 플로우
    └── dataSync.ts      # 데이터 동기화 태스크
```

## 📝 사용 예시

### 피처 플래그 사용
```typescript
// 컴포넌트에서 피처 플래그 사용
const ProductListPage = () => {
  const enableAdvancedSearch = useFeatureFlag('enableAdvancedSearch');
  
  return (
    <div>
      <h1>상품 목록</h1>
      
      {/* 조건부 렌더링 */}
      {enableAdvancedSearch ? (
        <AdvancedSearchForm />
      ) : (
        <SimpleSearchForm />
      )}
      
      {/* 컴포넌트 기반 사용 */}
      <FeatureFlag flag="enableUserProfileV2">
        <NewUserProfileButton />
      </FeatureFlag>
      
      <ProductList />
    </div>
  );
};
```

### A/B 테스트 사용
```typescript
// 실험 기반 UI 변경
const CheckoutButton = () => {
  const { variant, trackConversion } = useExperiment('checkoutButtonColor');
  
  const handleClick = () => {
    trackConversion('checkout_clicked');
    // 결제 로직...
  };

  return (
    <Experiment experiment="checkoutButtonColor">
      {(variant) => (
        <Button
          style={{ 
            backgroundColor: variant === 'treatment' ? 'green' : 'blue' 
          }}
          onClick={handleClick}
        >
          결제하기
        </Button>
      )}
    </Experiment>
  );
};
```

### 복합 플로우 사용
```typescript
// 결제 플로우 관리
const CheckoutPage = () => {
  const {
    currentStep,
    orderData,
    goToStep,
    completeStep,
    canGoBack
  } = useCheckoutFlow();

  const renderStep = () => {
    switch (currentStep) {
      case 'cart':
        return <CartStep onComplete={completeStep} />;
      case 'shipping':
        return <ShippingStep onComplete={completeStep} />;
      case 'payment':
        return <PaymentStep orderData={orderData} onComplete={completeStep} />;
      case 'confirmation':
        return <ConfirmationStep orderData={orderData} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <CheckoutProgress currentStep={currentStep} />
      
      {canGoBack && (
        <Button onClick={() => goToStep(getPreviousStep(currentStep))}>
          이전 단계
        </Button>
      )}
      
      {renderStep()}
    </div>
  );
};
```

## ⚠️ 주의사항

### 금지사항
1. **도메인 로직 중복 구현 금지**
   ```typescript
   // ❌ 금지: Feature에서 도메인 로직 재구현
   const calculateUserDiscount = (user: User) => {
     // User 도메인에 있어야 할 로직
   };
   
   // ✅ 올바름: 도메인 API 사용
   import { userUtils } from '@/domain/user';
   const discount = userUtils.calculateDiscount(user);
   ```

2. **과도한 플래그 생성 금지**
   ```typescript
   // ❌ 금지: 모든 작은 변경사항에 플래그 생성
   const enableButtonColorChange = useFeatureFlag('buttonColorChange');
   const enableFontSizeIncrease = useFeatureFlag('fontSizeIncrease');
   
   // ✅ 올바름: 의미있는 기능 단위로 플래그 관리
   const enableNewCheckoutFlow = useFeatureFlag('newCheckoutFlow');
   ```

3. **실험 결과 분석 없이 실험 제거 금지**
   ```typescript
   // ❌ 금지: 분석 없이 실험 코드 제거
   // 실험이 끝나면 바로 코드에서 제거하지 말고,
   // 결과를 분석하고 우승 변형을 확정한 후 제거
   
   // ✅ 올바름: 실험 결과 기반 코드 정리
   // 1. 실험 결과 분석
   // 2. 우승 변형 확정
   // 3. 실험 코드 제거하고 우승 변형으로 대체
   ```

## 🧪 테스트 가이드

### 피처 플래그 테스트
```typescript
// featureFlag.test.ts
describe('FeatureFlagEvaluator', () => {
  it('should return default value when flag is not set', () => {
    const evaluator = new FeatureFlagEvaluator(null, 'development');
    
    expect(evaluator.isEnabled('enableAdvancedSearch')).toBe(false);
  });

  it('should respect environment restrictions', () => {
    const evaluator = new FeatureFlagEvaluator(null, 'production');
    
    expect(evaluator.isEnabled('enableUserProfileV2')).toBe(false);
  });
});
```

### 실험 테스트
```typescript
// experiment.test.ts
describe('ExperimentEngine', () => {
  it('should assign variants consistently', () => {
    const user = { id: 'user123' };
    const engine1 = new ExperimentEngine(user);
    const engine2 = new ExperimentEngine(user);
    
    const variant1 = engine1.getVariant('checkoutButtonColor');
    const variant2 = engine2.getVariant('checkoutButtonColor');
    
    expect(variant1).toBe(variant2);
  });
});
```

### 워크플로우 테스트
```typescript
// orderWorkflow.test.ts
describe('OrderWorkflow', () => {
  it('should process order successfully', async () => {
    const workflow = new OrderWorkflow(/* mocked services */);
    
    const result = await workflow.processOrder(mockOrderData);
    
    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
  });

  it('should handle user validation failure', async () => {
    const workflow = new OrderWorkflow(/* mocked services */);
    userService.getUser.mockResolvedValue(null);
    
    const result = await workflow.processOrder(mockOrderData);
    
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('사용자를 찾을 수 없습니다.');
  });
});
```

## 📈 성능 최적화

### 피처 플래그 캐싱
```typescript
// flagCache.ts
class FeatureFlagCache {
  private cache = new Map<string, { value: boolean; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5분

  get(key: string): boolean | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.value;
  }

  set(key: string, value: boolean): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}
```

### 배치 이벤트 전송
```typescript
// 애널리틱스 이벤트 배치 처리
export class BatchedAnalyticsService extends AnalyticsService {
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL = 10000; // 10초

  protected startBatchProcessor(): void {
    setInterval(() => {
      if (this.events.length >= this.BATCH_SIZE) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);
  }
}
```

이 레이어는 **여러 도메인을 조합한 완전한 비즈니스 기능**을 제공하며, 점진적 기능 배포와 사용자 행동 분석을 통해 지속적인 개선을 지원합니다.