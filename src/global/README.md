# 🌐 Global Layer

**애플리케이션 전역 설정 및 컨텍스트 관리 레이어**

## 🎯 역할과 책임

Global 레이어는 **애플리케이션의 전역적 관심사**를 담당하는 레이어로, 다음과 같은 역할을 수행합니다:

- **환경 설정 관리** - 개발/운영 환경별 설정값 관리
- **전역 컨텍스트 제공** - 애플리케이션 전체에서 공유되는 상태와 기능
- **초기화 및 부트스트래핑** - 앱 시작 시 필요한 설정 및 초기화 로직
- **크로스 컷팅 관심사** - 로깅, 모니터링, 에러 추적 등

## 📦 레이어 구성 요소

### `/config`
**목적**: 애플리케이션 전반의 설정값 중앙 관리
- 환경변수 기반 설정 (개발/스테이징/운영)
- 피처 플래그 기본값
- 외부 서비스 연결 정보
- 성능 및 최적화 설정

### `/providers`
**목적**: 애플리케이션 전역 컨텍스트 및 프로바이더 관리
- React Context 기반 전역 상태 제공자
- 써드파티 라이브러리 프로바이더 래핑
- 의존성 주입 및 서비스 컨테이너
- 애플리케이션 생명주기 관리

### `/store`
**목적**: 진정한 전역 상태 관리 (최소화 권장)
- 현재 인증된 사용자 정보
- 애플리케이션 전역 UI 상태 (테마, 언어)
- 네트워크 상태, 온라인/오프라인
- 시스템 전반의 설정값

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **하위 레이어**: Common 레이어의 유틸리티와 타입
- **서비스 레이어**: 인증, 설정 로드 등 인프라 서비스
- **전역 상태 관리**: React Query, Zustand, Redux 등
- **환경 설정**: 환경변수, 설정 파일

### ❌ 금지되는 의존성
- **상위 레이어**: Shared, Domain, Feature, Routes
- **비즈니스 로직**: 도메인 특화 로직이나 업무 규칙
- **UI 컴포넌트**: 구체적인 컴포넌트 구현체

## 🏗️ 권장 폴더 구조

```
src/global/
├── index.ts              # Public API 정의
├── README.md            # 레이어 가이드 문서
├── config/              # 애플리케이션 설정
├── providers/           # React 컨텍스트 프로바이더
└── store/               # 전역 상태 관리
```

## 📝 설계 원칙

### 단일 책임 원칙
- 각 설정은 명확한 하나의 목적을 가져야 함
- 서로 다른 관심사는 분리된 모듈로 관리
- 변경 이유가 다른 설정들은 독립적으로 구성

### 불변성 원칙
- 런타임에 변경되지 않는 설정값들
- 환경별로 다르지만 배포 후에는 고정적인 값
- 전역 상태는 최소한으로 유지하고 명확한 변경 인터페이스 제공

### 의존성 역전 원칙
- 구체적인 구현보다는 추상화에 의존
- 환경에 따라 다른 구현체를 주입할 수 있는 구조
- 테스트 가능한 설정과 프로바이더 설계

## 🔄 라이프사이클 관리

### 애플리케이션 초기화 순서
```typescript
// AppProvider.tsx
export const AppProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    // 1. 설정 로드
    loadAppConfig();
    
    // 2. 사용자 세션 복원
    restoreUserSession();
    
    // 3. 온라인 상태 감지 시작
    startOnlineStatusDetection();
    
    // 4. 애널리틱스 초기화 (선택적)
    if (appConfig.features.enableAnalytics) {
      initializeAnalytics();
    }
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};
```

### 정리(Cleanup) 작업
```typescript
// 애플리케이션 종료 시 정리 작업
useEffect(() => {
  const cleanup = () => {
    // 1. 진행 중인 요청 취소
    queryClient.cancelQueries();
    
    // 2. 타이머 정리
    clearAllTimers();
    
    // 3. 이벤트 리스너 제거
    removeEventListeners();
  };

  window.addEventListener('beforeunload', cleanup);
  return () => window.removeEventListener('beforeunload', cleanup);
}, []);
```

## ⚠️ 주의사항

### 금지사항
1. **도메인 로직 포함 금지**
   ```typescript
   // ❌ 금지: 특정 도메인 로직
   export const calculateOrderTotal = (order: Order) => { /* ... */ }
   
   // ✅ 올바름: 전역 설정
   export const currencyConfig = { symbol: '$', locale: 'en-US' };
   ```

2. **상위 레이어 import 금지**
   ```typescript
   // ❌ 금지
   import { UserCard } from '@/domain/user';
   import { useProductList } from '@/shared/hooks';
   
   // ✅ 올바름
   import { authService } from '@/services/auth';
   import { HTTP_STATUS } from '@/common';
   ```

3. **과도한 전역 상태 금지**
   ```typescript
   // ❌ 금지: 모든 상태를 전역으로
   interface GlobalState {
     users: User[];
     products: Product[];
     orders: Order[];
     // ... 너무 많은 도메인 상태
   }
   
   // ✅ 올바름: 진짜 전역 상태만
   interface GlobalState {
     user: User | null;      // 현재 로그인 사용자
     theme: ThemeMode;       // UI 테마
     language: Language;     // 언어 설정
     isOnline: boolean;      // 온라인 상태
   }
   ```

## 🧪 테스트 가이드

### Provider 테스트
```typescript
// AppProvider.test.tsx
describe('AppProvider', () => {
  it('should provide query client to children', () => {
    const TestComponent = () => {
      const queryClient = useQueryClient();
      return <div data-testid="query-client">{queryClient ? 'present' : 'absent'}</div>;
    };

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('query-client')).toHaveTextContent('present');
  });
});
```

### 전역 상태 테스트
```typescript
// globalStore.test.ts
describe('globalStore', () => {
  beforeEach(() => {
    useGlobalStore.getState().reset(); // 상태 초기화
  });

  it('should update theme', () => {
    const { setTheme } = useGlobalStore.getState();
    
    act(() => {
      setTheme('dark');
    });

    expect(useGlobalStore.getState().theme).toBe('dark');
  });
});
```

## 📈 성능 최적화

### Context 분리
```typescript
// 성능을 위해 컨텍스트를 분리
export const UserProvider = ({ children }: PropsWithChildren) => {
  // 사용자 관련 상태만 관리
};

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  // 테마 관련 상태만 관리
};

// 필요한 컨텍스트만 선택적으로 사용
const UserProfile = () => {
  const { user } = useUser(); // ThemeProvider와 독립적
  return <div>{user?.name}</div>;
};
```

### 메모이제이션 활용
```typescript
// 불필요한 리렌더링 방지
export const AppProvider = memo(({ children }: PropsWithChildren) => {
  const value = useMemo(() => ({
    config: appConfig,
    // ... 다른 값들
  }), []);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
});
```

이 레이어는 애플리케이션의 **전역적인 상태와 설정**을 관리하여 일관된 사용자 경험을 제공합니다.