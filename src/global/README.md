# 🌐 Global Layer

**애플리케이션 전역 설정 및 컨텍스트 관리 레이어**

## 🎯 역할과 책임

Global 레이어는 **애플리케이션 전역 상태와 설정**을 관리하는 레이어로, 다음과 같은 역할을 담당합니다:

- **애플리케이션 전역 설정** 관리 (환경변수, 테마, 언어 등)
- **전역 React 컨텍스트** 제공 (Theme, Query Client, Auth 등)
- **애플리케이션 초기화** 로직 관리
- **전역 상태 관리** (사용자 세션, 애플리케이션 상태 등)

## 📦 포함되는 내용

### `/config`
```typescript
// 환경별 설정 관리
export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  environment: import.meta.env.VITE_NODE_ENV || 'development',
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableExperiments: import.meta.env.VITE_ENABLE_EXPERIMENTS === 'true'
  },
  theme: {
    defaultMode: 'light' as const,
    enableDarkMode: true
  }
};
```

### `/providers`
```typescript
// React Context 프로바이더들
export const AppProvider = ({ children }: PropsWithChildren) => {
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

export const QueryProvider = ({ children }: PropsWithChildren) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5분
        cacheTime: 10 * 60 * 1000, // 10분
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

### `/store`
```typescript
// 전역 상태 관리 (Zustand, Redux 등)
interface GlobalState {
  user: User | null;
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  isOnline: boolean;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  user: null,
  theme: 'light',
  language: 'ko',
  isOnline: true,
  
  setUser: (user: User | null) => set({ user }),
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  setLanguage: (language: 'ko' | 'en') => set({ language }),
  setOnlineStatus: (isOnline: boolean) => set({ isOnline })
}));
```

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **하위 레이어**: `common`
- **서비스 레이어**: `services` (인증, 설정 로드 등)
- **상태 관리 라이브러리**: React Query, Zustand, Redux
- **UI 라이브러리**: React Context API 관련

### ❌ 금지되는 의존성
- **상위 레이어**: `shared`, `domain`, `feature`, `routes`
- **도메인 로직**: 특정 비즈니스 로직
- **컴포넌트**: UI 컴포넌트 직접 의존

## 🏗️ 폴더 구조

```
src/global/
├── index.ts              # Public API 정의
├── README.md            # 이 문서
├── config/
│   ├── index.ts         # 설정들 export
│   ├── app.ts           # 앱 전역 설정
│   ├── theme.ts         # 테마 설정
│   └── features.ts      # 피처 플래그 설정
├── providers/
│   ├── index.ts         # 프로바이더들 export
│   ├── AppProvider.tsx  # 루트 프로바이더
│   ├── QueryProvider.tsx # React Query 프로바이더
│   ├── ThemeProvider.tsx # 테마 프로바이더
│   └── AuthProvider.tsx # 인증 프로바이더
└── store/
    ├── index.ts         # 스토어들 export
    ├── globalStore.ts   # 전역 상태 스토어
    ├── userStore.ts     # 사용자 상태 스토어
    └── appStore.ts      # 앱 상태 스토어
```

## 📝 사용 예시

### 애플리케이션 초기화
```typescript
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from '@/global';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
```

### 전역 설정 사용
```typescript
// 다른 레이어에서 설정 사용
import { appConfig } from '@/global';

// API 호출 시 기본 URL 사용
const fetchUser = async (id: string) => {
  const response = await fetch(`${appConfig.apiBaseUrl}/users/${id}`);
  return response.json();
};
```

### 전역 상태 사용
```typescript
// 컴포넌트에서 전역 상태 사용
import { useGlobalStore } from '@/global';

const UserProfile = () => {
  const { user, theme, setTheme } = useGlobalStore();
  
  return (
    <div className={`profile ${theme}`}>
      <h1>{user?.name}</h1>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        테마 변경
      </button>
    </div>
  );
};
```

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