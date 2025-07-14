# 🏗️ Modern Frontend Architecture 통합 가이드

**레이어드 아키텍처 기반 확장 가능한 프론트엔드 시스템**

## 📋 목차

1. [아키텍처 개요](#-아키텍처-개요)
2. [레이어별 상세 가이드](#-레이어별-상세-가이드)
3. [의존성 방향 및 규칙](#-의존성-방향-및-규칙)
4. [실무 적용 가이드](#-실무-적용-가이드)
5. [개발 워크플로우](#-개발-워크플로우)
6. [품질 관리 및 모니터링](#-품질-관리-및-모니터링)
7. [마이그레이션 가이드](#-마이그레이션-가이드)

---

## 🎯 아키텍처 개요

### 핵심 원칙

이 아키텍처는 다음 **4가지 핵심 원칙**을 기반으로 설계되었습니다:

1. **단방향 의존성**: 하위 레이어만 참조 가능
2. **도메인 캡슐화**: 비즈니스 로직의 명확한 경계
3. **관심사의 분리**: 각 레이어는 명확한 책임을 가짐
4. **확장 가능성**: 새로운 기능 추가가 용이

### 레이어 구조

```
    🗺️ Routes      ← 라우팅 및 페이지 구성
         ↑
    🎯 Feature     ← 도메인 조합 비즈니스 기능
         ↑
    🏛️ Domain      ← 도메인별 캡슐화된 기능
         ↑
    🤝 Shared      ← 공유 UI 컴포넌트 및 로직
         ↑
    🔧 Services    ← 외부 시스템 통신 및 인프라
         ↑
    🌐 Global      ← 전역 설정 및 컨텍스트
         ↑
    📁 Common      ← 순수 유틸리티 및 타입
```

### 의존성 방향

**⬆️ 상위 레이어는 하위 레이어만 참조 가능**

```typescript
// ✅ 허용: 상위 → 하위 의존성
import { Button } from '@/shared/components';     // Routes → Shared
import { useUser } from '@/domain/user';          // Feature → Domain
import { httpClient } from '@/services/http';     // Domain → Services

// ❌ 금지: 하위 → 상위 의존성
import { UserPage } from '@/routes/user';         // Domain → Routes (금지!)
import { useFeatureFlag } from '@/feature';       // Services → Feature (금지!)
```

---

## 📚 레이어별 상세 가이드

### 📁 Common Layer - 기반 유틸리티
> **📖 상세 가이드**: [src/common/README.md](../src/common/README.md)

**역할**: 프레임워크 독립적인 순수 유틸리티 제공

```typescript
// 타입 정의
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 순수 함수
export const arrayTool = {
  unique: <T>(arr: T[]): T[] => [...new Set(arr)],
  groupBy: <T>(arr: T[], key: keyof T) => { /* ... */ }
};

// 상수
export const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404
} as const;
```

**사용법**:
```typescript
import { arrayTool, HTTP_STATUS, ApiResponse } from '@/common';
```

### 🌐 Global Layer - 전역 설정
> **📖 상세 가이드**: [src/global/README.md](../src/global/README.md)

**역할**: 애플리케이션 전역 상태와 설정 관리

```typescript
// 설정 관리
export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  environment: import.meta.env.VITE_NODE_ENV,
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  }
};

// 전역 프로바이더
export const AppProvider = ({ children }) => (
  <QueryProvider>
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </QueryProvider>
);
```

**사용법**:
```typescript
import { appConfig, AppProvider } from '@/global';
```

### 🔧 Services Layer - 인프라 서비스
> **📖 상세 가이드**: [src/services/README.md](../src/services/README.md)

**역할**: 외부 시스템 통신 및 인프라 서비스 제공

```typescript
// HTTP 클라이언트
export class HttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }
}

// 인증 서비스
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // 로그인 로직
  }
}
```

**사용법**:
```typescript
import { httpClient, authService } from '@/services';
```

### 🤝 Shared Layer - 공유 컴포넌트
> **📖 상세 가이드**: [src/shared/README.md](../src/shared/README.md)

**역할**: 도메인 간 공유되는 UI 컴포넌트 및 로직 제공

```typescript
// UI 컴포넌트
export const Button = ({ variant, size, children, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }))} {...props}>
    {children}
  </button>
);

// 공통 훅
export const useAsync = <T>(asyncFn: () => Promise<T>) => {
  // 비동기 상태 관리 로직
};
```

**사용법**:
```typescript
import { Button, Modal, useAsync } from '@/shared';
```

### 🏛️ Domain Layer - 도메인 로직
> **📖 상세 가이드**: [src/domain/README.md](../src/domain/README.md)

**역할**: 비즈니스 도메인별 캡슐화된 기능 제공

```typescript
// 도메인 API
export const userApi = {
  getUsers: (query: UserListQuery): Promise<PaginatedResponse<User>> => {
    return httpClient.get(`/users?${new URLSearchParams(query)}`);
  }
};

// 도메인 훅
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUser(id)
  });
};

// 도메인 컴포넌트
export const UserCard = ({ user, onEdit, onDelete }) => (
  <Card>
    {/* 사용자 카드 UI */}
  </Card>
);
```

**Public API 패턴**:
```typescript
// src/domain/user/index.ts
export type { User, CreateUserRequest } from './types';
export { userApi } from './api';
export { useUser, useUserList } from './hooks';
export { UserCard, UserForm } from './components';
```

**사용법**:
```typescript
import { User, useUser, UserCard } from '@/domain/user';
```

### 🎯 Feature Layer - 복합 기능
> **📖 상세 가이드**: [src/feature/README.md](../src/feature/README.md)

**역할**: 여러 도메인을 조합한 비즈니스 기능 구현

```typescript
// 피처 플래그
export const useFeatureFlag = (flagKey: string) => {
  const { user } = useAuth();
  const evaluator = new FeatureFlagEvaluator(user, environment);
  return evaluator.isEnabled(flagKey);
};

// A/B 테스트
export const useExperiment = (experimentId: string) => {
  const { user } = useAuth();
  const engine = new ExperimentEngine(user);
  return engine.getVariant(experimentId);
};

// 복합 워크플로우
export class OrderWorkflow {
  async processOrder(orderData: CreateOrderRequest): Promise<ProcessOrderResult> {
    // 1. 사용자 검증
    // 2. 상품 검증
    // 3. 가격 계산
    // 4. 주문 생성
    // 5. 결제 처리
  }
}
```

**사용법**:
```typescript
import { useFeatureFlag, useExperiment, OrderWorkflow } from '@/feature';
```

### 🗺️ Routes Layer - 라우팅
> **📖 상세 가이드**: [src/routes/README.md](../src/routes/README.md)

**역할**: 애플리케이션 라우팅 및 페이지 구성 관리

```typescript
// 페이지 컴포넌트
const UserListPage = () => {
  const { data: users } = useUserList();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/users');
  }, []);

  return (
    <Layout>
      <UserList users={users} />
    </Layout>
  );
};

// 라우트 정의
export const userRoutes = [
  {
    path: '/users',
    element: (
      <RouteGuard requireAuth>
        <LazyRoute component={UserListPage} />
      </RouteGuard>
    )
  }
];
```

**사용법**:
```typescript
import { userRoutes, LazyRoute, RouteGuard } from '@/routes';
```

---

## 🔗 의존성 방향 및 규칙

### 의존성 매트릭스

| 레이어 | Common | Global | Services | Shared | Domain | Feature | Routes |
|--------|--------|--------|----------|---------|---------|---------|---------|
| **Common** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Global** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Services** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Shared** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Domain** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Feature** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Routes** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 주요 규칙

#### 1. 단방향 의존성
```typescript
// ✅ 허용
Routes → Feature → Domain → Shared → Services → Global → Common

// ❌ 금지
Common → Global  // 하위에서 상위로의 의존성
Domain → Feature // 하위에서 상위로의 의존성
```

#### 2. 도메인 간 의존성 금지
```typescript
// ❌ 금지: 도메인 간 직접 의존성
// user 도메인에서
import { Product } from '@/domain/product';

// ✅ 허용: API 호출을 통한 데이터 교환
const UserProfile = ({ userId }) => {
  const { data: user } = useUser(userId);
  const { data: favoriteProducts } = useQuery({
    queryKey: ['user-favorites', userId],
    queryFn: () => productApi.getProductsByIds(user?.favoriteProductIds || [])
  });
};
```

#### 3. Public API 패턴 준수
```typescript
// ❌ 금지: 내부 구현 직접 접근
import { UserCard } from '@/domain/user/components/UserCard';

// ✅ 올바름: Public API 사용
import { UserCard } from '@/domain/user';
```

### 검증 도구

```bash
# 의존성 방향 검증
npm run arch:check

# 도메인 구조 검증
npm run domain:validate

# 순환 의존성 검사
npm run analyze:circular
```

---

## 🛠️ 실무 적용 가이드

### 새 기능 개발 프로세스

#### 1단계: 요구사항 분석
```
📋 요구사항: "사용자가 상품을 즐겨찾기에 추가할 수 있는 기능"

분석:
- 관련 도메인: User, Product
- 필요한 API: POST /users/:id/favorites
- UI 컴포넌트: FavoriteButton, FavoritesList
- 상태 관리: User 도메인에서 즐겨찾기 상태 관리
```

#### 2단계: 레이어별 구현 계획
```typescript
// Domain Layer (User)
- types: FavoriteProduct, AddFavoriteRequest
- api: addFavorite, removeFavorite, getFavorites
- hooks: useFavorites, useAddFavorite
- components: FavoriteButton, FavoritesList

// Routes Layer
- 즐겨찾기 페이지 또는 기존 페이지에 섹션 추가
```

#### 3단계: 구현 순서
```bash
# 1. Domain API 구현
./scripts/create-domain.sh user  # 이미 있다면 스킵
# src/domain/user/api/favoriteApi.ts 구현

# 2. Domain Hooks 구현
# src/domain/user/hooks/useFavorites.ts 구현

# 3. Domain Components 구현
# src/domain/user/components/FavoriteButton.tsx 구현

# 4. Public API 업데이트
# src/domain/user/index.ts에 새 exports 추가

# 5. Routes에서 사용
# src/routes/user/UserDetailPage.tsx 업데이트

# 6. 검증
npm run arch:check
npm run test
```

### 기존 프로젝트 마이그레이션

#### Phase 1: 구조 준비 (1주)
```bash
# 1. 새 구조 생성
mkdir src-new
cp -r modern-frontend-architecture/src/* src-new/

# 2. 기존 코드 백업
mv src src-old

# 3. 새 구조로 교체
mv src-new src

# 4. 기본 설정 적용
cp modern-frontend-architecture/.eslintrc.cjs .
cp modern-frontend-architecture/tsconfig.json .
```

#### Phase 2: 점진적 마이그레이션 (2-4주)
```bash
# Week 1: Common & Global 마이그레이션
# - 기존 utils → src/common/utils
# - 기존 constants → src/common/constants
# - 기존 types → src/common/types

# Week 2: Services 마이그레이션
# - 기존 api → src/services/http
# - 기존 auth → src/services/auth

# Week 3: Shared 마이그레이션
# - 기존 components/ui → src/shared/components/ui
# - 기존 hooks → src/shared/hooks

# Week 4: Domain 마이그레이션
# - 기존 features/user → src/domain/user
# - 기존 features/product → src/domain/product
```

#### Phase 3: 최적화 및 정리 (1-2주)
```bash
# 1. 의존성 정리
npm run arch:check
npm run lint --fix

# 2. 중복 코드 제거
# 3. 테스트 업데이트
# 4. 문서 업데이트
```

---

## 🔄 개발 워크플로우

### 일일 개발 프로세스

```bash
# 1. 작업 시작 전 검증
npm run arch:check
npm run type-check

# 2. 기능 개발
# - 해당 레이어에서 작업
# - Public API 패턴 준수

# 3. 작업 완료 후 검증
npm run arch:check
npm run domain:validate
npm run test
npm run lint

# 4. 커밋 전 최종 검증
npm run quality:check  # 모든 검증 실행
```

### 새 도메인 생성

```bash
# 1. 도메인 생성
./scripts/create-domain.sh order

# 2. 생성된 구조 확인
tree src/domain/order

# 3. 구현 시작
# - types 정의
# - api 구현
# - hooks 구현
# - components 구현
# - Public API 정의 (index.ts)

# 4. 검증
npm run domain:validate
```

### 코드 리뷰 체크리스트

#### Architecture 준수
- [ ] 의존성 방향 준수 (`npm run arch:check`)
- [ ] Public API 패턴 사용
- [ ] 적절한 레이어에 코드 배치
- [ ] 도메인 간 직접 의존성 없음

#### Code Quality
- [ ] 타입 안정성 (`npm run type-check`)
- [ ] 린팅 규칙 준수 (`npm run lint`)
- [ ] 테스트 커버리지 80% 이상
- [ ] 성능 최적화 (메모이제이션, 지연 로딩)

#### Documentation
- [ ] 새 Public API 문서화
- [ ] 복잡한 로직 주석 추가
- [ ] README 업데이트 (필요시)

---

## 📊 품질 관리 및 모니터링

### 자동화된 품질 검증

```bash
# package.json scripts
{
  "scripts": {
    "arch:check": "node scripts/check-dependencies.js",
    "domain:validate": "node scripts/validate-domains.js",
    "quality:check": "npm run arch:check && npm run type-check && npm run lint && npm run test",
    "quality:report": "node scripts/generate-quality-report.js"
  }
}
```

### 품질 지표 모니터링

#### 아키텍처 지표
```typescript
// scripts/quality-metrics/architecture.js
export const architectureMetrics = {
  dependencyViolations: 0,      // 의존성 위반 개수
  circularDependencies: 0,      // 순환 의존성 개수
  publicApiCompliance: 100,     // Public API 준수율 (%)
  layerCohesion: 85            // 레이어 응집도 (%)
};
```

#### 코드 품질 지표
```typescript
// scripts/quality-metrics/code-quality.js
export const codeQualityMetrics = {
  testCoverage: 85,            // 테스트 커버리지 (%)
  typeScriptErrors: 0,         // TypeScript 에러 개수
  eslintWarnings: 2,           // ESLint 경고 개수
  duplicatedCodeRatio: 3       // 중복 코드 비율 (%)
};
```

### 지속적 개선

#### 주간 아키텍처 리뷰
```bash
# 주간 아키텍처 리포트 생성
npm run arch:report

# 결과 분석 및 개선점 도출
cat architecture-report.md
```

#### 월간 품질 리포트
```bash
# 종합 품질 리포트 생성
npm run generate:quality-report

# 품질 트렌드 분석
# - 의존성 위반 추이
# - 테스트 커버리지 변화
# - 성능 지표 변화
```

---

## 🚀 마이그레이션 가이드

### 기존 React 프로젝트에서

#### Before (기존 구조)
```
src/
├── components/
│   ├── common/
│   └── pages/
├── hooks/
├── services/
├── utils/
└── types/
```

#### After (새 구조)
```
src/
├── common/          ← utils/, types/
├── global/          ← context/, providers/
├── services/        ← services/
├── shared/          ← components/common/
├── domain/          ← features/ (도메인별 분리)
├── feature/         ← 새로 추가
└── routes/          ← components/pages/
```

#### 마이그레이션 스크립트
```bash
#!/bin/bash
# migrate-to-layered-architecture.sh

echo "Starting migration to layered architecture..."

# 1. Backup existing structure
cp -r src src-backup

# 2. Create new structure
mkdir -p src/{common,global,services,shared,domain,feature,routes}

# 3. Move utilities
mv src-backup/utils/* src/common/utils/
mv src-backup/types/* src/common/types/

# 4. Move services
mv src-backup/services/* src/services/

# 5. Move shared components
mv src-backup/components/common/* src/shared/components/

# 6. Create domains from features
for feature in user product order; do
  ./scripts/create-domain.sh $feature
  # Move existing feature code to domain
done

# 7. Move pages to routes
mv src-backup/components/pages/* src/routes/

echo "Migration complete! Please review and update imports."
```

### Next.js 프로젝트에서

#### 특별 고려사항
1. **Pages Router vs App Router**: 라우팅 레이어 조정 필요
2. **SSR/SSG**: 서버 사이드 관련 코드는 별도 처리
3. **API Routes**: `/pages/api`는 백엔드로 간주, 별도 관리

#### 수정된 구조
```
src/
├── common/
├── global/
├── services/
├── shared/
├── domain/
├── feature/
└── app/             ← Next.js App Router
    ├── (auth)/
    ├── users/
    └── products/
```

### Vue.js 프로젝트에서

#### Vue 특화 조정
```typescript
// domain/user/composables/useUser.ts (Vue Composition API)
export const useUser = (id: Ref<string>) => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  
  const fetchUser = async () => {
    loading.value = true;
    try {
      user.value = await userApi.getUser(id.value);
    } finally {
      loading.value = false;
    }
  };
  
  return { user, loading, fetchUser };
};
```

---

## 🎯 성공 지표 및 체크리스트

### 마이그레이션 성공 지표

#### 기술적 지표
- [ ] `npm run arch:check` 통과
- [ ] `npm run domain:validate` 통과
- [ ] TypeScript 에러 0개
- [ ] ESLint 경고 10개 이하
- [ ] 테스트 커버리지 80% 이상

#### 비즈니스 지표
- [ ] 새 기능 개발 속도 30% 향상
- [ ] 버그 발생률 50% 감소
- [ ] 코드 리뷰 시간 40% 단축
- [ ] 신규 개발자 온보딩 시간 50% 단축

### 팀 역량 체크리스트

#### 개발자 레벨
- [ ] 의존성 방향 규칙 이해
- [ ] Public API 패턴 활용 가능
- [ ] 적절한 레이어 선택 가능
- [ ] 도메인 경계 설정 가능

#### 팀 레벨
- [ ] 아키텍처 가이드라인 합의
- [ ] 코드 리뷰 프로세스 정립
- [ ] 품질 게이트 자동화
- [ ] 지속적 개선 프로세스 운영

---

## 🔧 도구 및 스크립트

### 제공되는 스크립트

```bash
# 도메인 생성
./scripts/create-domain.sh <domain-name>

# 아키텍처 검증
npm run arch:check

# 도메인 구조 검증
npm run domain:validate

# 품질 리포트 생성
npm run generate:quality-report

# 순환 의존성 분석
npm run analyze:circular
```

### 권장 IDE 설정

#### VSCode Settings
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "eslint.validate": ["typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  }
}
```

#### 권장 VSCode 확장
- ESLint
- TypeScript Importer
- Auto Import - ES6, TS, JSX, TSX
- Path Intellisense

---

## 📞 지원 및 문의

### 자주 묻는 질문

**Q: 도메인 간 데이터 공유는 어떻게 하나요?**
A: API 호출, 이벤트 시스템, 또는 Shared Types를 사용합니다. 직접 import는 금지입니다.

**Q: 새로운 라이브러리는 어느 레이어에 추가해야 하나요?**
A: 라이브러리의 목적에 따라 결정합니다:
- UI 라이브러리 → Shared
- HTTP 클라이언트 → Services  
- 비즈니스 로직 → Domain
- 순수 유틸리티 → Common

**Q: 기존 프로젝트 마이그레이션 시간은 얼마나 걸리나요?**
A: 프로젝트 크기에 따라 다르지만, 일반적으로:
- 소규모 (1-3개월 프로젝트): 1-2주
- 중규모 (6개월-1년 프로젝트): 3-4주
- 대규모 (1년+ 프로젝트): 6-8주

### 추가 학습 자료

- [Domain-Driven Design](https://domainlanguage.com/ddd/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Layered Architecture Pattern](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)

---

**이 아키텍처를 통해 확장 가능하고 유지보수 가능한 프론트엔드 애플리케이션을 구축하세요! 🚀**