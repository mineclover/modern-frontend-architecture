# 🗺️ Routes Layer

**애플리케이션 라우팅 및 페이지 구성 관리 레이어**

## 🎯 역할과 책임

Routes 레이어는 **애플리케이션의 라우팅과 페이지 구성**을 담당하는 최상위 레이어로, 다음과 같은 역할을 담당합니다:

- **라우팅 구조** 정의 및 관리
- **페이지 컴포넌트** 구성 및 조합
- **레이아웃 적용** 및 중첩 라우팅 관리
- **코드 분할** 및 지연 로딩 구현
- **라우트 가드** 및 접근 권한 관리

## 📦 포함되는 내용

### `/components` - 라우팅 관련 컴포넌트
```typescript
// LazyRoute.tsx - 지연 로딩 라우트 컴포넌트
interface LazyRouteProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error }>;
}

export const LazyRoute = ({ 
  component: Component, 
  fallback: Fallback = LoadingSpinner,
  errorBoundary: ErrorBoundary = DefaultErrorBoundary
}: LazyRouteProps) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

// SmartLink.tsx - 스마트 링크 컴포넌트
interface SmartLinkProps {
  to: string;
  children: React.ReactNode;
  preload?: boolean;
  analytics?: {
    event: string;
    properties?: Record<string, any>;
  };
  featureFlag?: string;
}

export const SmartLink = ({ 
  to, 
  children, 
  preload = false,
  analytics,
  featureFlag
}: SmartLinkProps) => {
  const navigate = useNavigate();
  const isFeatureEnabled = useFeatureFlag(featureFlag);
  const analyticsService = useAnalytics();

  // 피처 플래그가 설정되어 있고 비활성화된 경우
  if (featureFlag && !isFeatureEnabled) {
    return <span className="text-gray-400 cursor-not-allowed">{children}</span>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 애널리틱스 추적
    if (analytics) {
      analyticsService.track(analytics.event, {
        destination: to,
        ...analytics.properties
      });
    }
    
    navigate(to);
  };

  // 프리로드 로직
  const handleMouseEnter = () => {
    if (preload) {
      preloader.preloadRoute(to);
    }
  };

  return (
    <a 
      href={to} 
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="text-blue-600 hover:text-blue-800"
    >
      {children}
    </a>
  );
};

// RouteGuard.tsx - 라우트 가드 컴포넌트
interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ComponentType;
  redirectTo?: string;
}

export const RouteGuard = ({
  children,
  requireAuth = false,
  requiredRoles = [],
  requiredPermissions = [],
  fallback: Fallback = UnauthorizedPage,
  redirectTo
}: RouteGuardProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
      return;
    }
  }, [requireAuth, isAuthenticated, redirectTo, navigate]);

  // 인증 확인
  if (requireAuth && !isAuthenticated) {
    return <Fallback />;
  }

  // 역할 확인
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => user.roles?.includes(role));
    if (!hasRequiredRole) {
      return <Fallback />;
    }
  }

  // 권한 확인
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermission = requiredPermissions.some(
      permission => user.permissions?.includes(permission)
    );
    if (!hasRequiredPermission) {
      return <Fallback />;
    }
  }

  return <>{children}</>;
};
```

### `preloader.ts` - 라우트 프리로딩
```typescript
// 라우트 프리로딩 시스템
class RoutePreloader {
  private loadedRoutes = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();

  async preloadRoute(path: string): Promise<void> {
    if (this.loadedRoutes.has(path)) {
      return;
    }

    if (this.preloadPromises.has(path)) {
      return this.preloadPromises.get(path);
    }

    const preloadPromise = this.loadRouteComponent(path);
    this.preloadPromises.set(path, preloadPromise);

    try {
      await preloadPromise;
      this.loadedRoutes.add(path);
    } catch (error) {
      console.error(`Failed to preload route ${path}:`, error);
    } finally {
      this.preloadPromises.delete(path);
    }
  }

  private async loadRouteComponent(path: string): Promise<any> {
    const routeMap: Record<string, () => Promise<any>> = {
      '/users': () => import('../user/UserListPage'),
      '/users/:id': () => import('../user/UserDetailPage'),
      '/products': () => import('../product/ProductListPage'),
      '/products/:id': () => import('../product/ProductDetailPage'),
      '/orders': () => import('../order/OrderListPage'),
      '/orders/:id': () => import('../order/OrderDetailPage')
    };

    const loader = routeMap[path];
    if (loader) {
      return await loader();
    }
  }

  // 중요한 라우트들을 미리 로드
  async preloadCriticalRoutes(): Promise<void> {
    const criticalRoutes = ['/users', '/products', '/orders'];
    
    await Promise.all(
      criticalRoutes.map(route => this.preloadRoute(route))
    );
  }
}

export const preloader = new RoutePreloader();
```

### 도메인별 라우트 구성

#### `/user` - 사용자 관련 라우트
```typescript
// user/index.tsx
const UserListPage = lazy(() => import('./UserListPage'));
const UserDetailPage = lazy(() => import('./UserDetailPage'));
const UserCreatePage = lazy(() => import('./UserCreatePage'));
const UserEditPage = lazy(() => import('./UserEditPage'));

export const userRoutes = [
  {
    path: '/users',
    element: (
      <RouteGuard requireAuth requiredPermissions={['users.read']}>
        <LazyRoute component={UserListPage} />
      </RouteGuard>
    )
  },
  {
    path: '/users/new',
    element: (
      <RouteGuard requireAuth requiredPermissions={['users.create']}>
        <LazyRoute component={UserCreatePage} />
      </RouteGuard>
    )
  },
  {
    path: '/users/:id',
    element: (
      <RouteGuard requireAuth requiredPermissions={['users.read']}>
        <LazyRoute component={UserDetailPage} />
      </RouteGuard>
    )
  },
  {
    path: '/users/:id/edit',
    element: (
      <RouteGuard requireAuth requiredPermissions={['users.update']}>
        <LazyRoute component={UserEditPage} />
      </RouteGuard>
    )
  }
];

// UserListPage.tsx
import { UserList, useUserList } from '@/domain/user';
import { Layout } from '@/shared/components';
import { FeatureFlag } from '@/feature/featureFlags';

const UserListPage = () => {
  const { data: users, isLoading, error } = useUserList();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/users');
  }, [analytics]);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorPage error={error} />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          
          <FeatureFlag flag="enableUserCreation">
            <SmartLink 
              to="/users/new"
              analytics={{ event: 'user_create_button_clicked' }}
            >
              <Button variant="primary">새 사용자 추가</Button>
            </SmartLink>
          </FeatureFlag>
        </div>

        <FeatureFlag 
          flag="enableAdvancedUserFilters"
          fallback={<SimpleUserFilters />}
        >
          <AdvancedUserFilters />
        </FeatureFlag>

        <UserList 
          users={users} 
          onUserClick={(user) => analytics.trackUserAction('user_clicked', user.id)}
        />
      </div>
    </Layout>
  );
};
```

#### `/product` - 상품 관련 라우트
```typescript
// product/ProductListPage.tsx
import { ProductList, useProductList } from '@/domain/product';
import { Layout } from '@/shared/components';
import { Experiment } from '@/feature/experiments';

const ProductListPage = () => {
  const { data: products, isLoading } = useProductList();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView('/products');
  }, [analytics]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">상품 목록</h1>
        
        {/* A/B 테스트: 상품 리스트 레이아웃 */}
        <Experiment experiment="productListLayout">
          {(variant) => (
            <ProductList 
              products={products}
              layout={variant}
              onProductView={(productId) => 
                analytics.trackProductView(productId)
              }
            />
          )}
        </Experiment>
      </div>
    </Layout>
  );
};
```

### `/App.tsx` - 메인 라우터 구성
```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from '@/global';
import { userRoutes } from './user';
import { productRoutes } from './product';
import { orderRoutes } from './order';

// 메인 페이지들
const HomePage = lazy(() => import('./HomePage'));
const DashboardPage = lazy(() => import('./DashboardPage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

export const App = () => {
  useEffect(() => {
    // 중요한 라우트 프리로드
    preloader.preloadCriticalRoutes();
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* 인증이 필요 없는 라우트 */}
          <Route path="/login" element={<LazyRoute component={LoginPage} />} />
          
          {/* 메인 라우트 */}
          <Route 
            path="/" 
            element={
              <RouteGuard requireAuth>
                <LazyRoute component={HomePage} />
              </RouteGuard>
            } 
          />
          
          {/* 대시보드 */}
          <Route 
            path="/dashboard" 
            element={
              <RouteGuard requireAuth>
                <LazyRoute component={DashboardPage} />
              </RouteGuard>
            } 
          />

          {/* 도메인별 라우트 */}
          {userRoutes.map((route, index) => (
            <Route key={index} {...route} />
          ))}
          
          {productRoutes.map((route, index) => (
            <Route key={index} {...route} />
          ))}
          
          {orderRoutes.map((route, index) => (
            <Route key={index} {...route} />
          ))}

          {/* 기본 리다이렉트 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 페이지 */}
          <Route path="*" element={<LazyRoute component={NotFoundPage} />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};
```

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **모든 하위 레이어**: `common`, `global`, `services`, `shared`, `domain`, `feature`
- **라우팅 라이브러리**: React Router, Next.js Router 등
- **레이아웃 시스템**: 레이아웃 컴포넌트 및 관련 라이브러리

### ❌ 금지되는 의존성
- **외부 라우터**: 이 레이어보다 상위에 있는 라우터 시스템

## 🏗️ 폴더 구조

```
src/routes/
├── index.ts              # Public API 정의
├── README.md            # 이 문서
├── App.tsx              # 메인 애플리케이션 라우터
├── components/
│   ├── index.ts         # 라우팅 컴포넌트들 export
│   ├── LazyRoute.tsx    # 지연 로딩 라우트
│   ├── SmartLink.tsx    # 스마트 링크 컴포넌트
│   ├── RouteGuard.tsx   # 라우트 가드
│   └── ErrorBoundary.tsx # 에러 바운더리
├── preloader.ts         # 라우트 프리로딩 시스템
├── user/
│   ├── index.ts         # 사용자 라우트 정의
│   ├── UserListPage.tsx # 사용자 목록 페이지
│   ├── UserDetailPage.tsx # 사용자 상세 페이지
│   ├── UserCreatePage.tsx # 사용자 생성 페이지
│   └── UserEditPage.tsx # 사용자 수정 페이지
├── product/
│   ├── index.ts         # 상품 라우트 정의
│   ├── ProductListPage.tsx # 상품 목록 페이지
│   ├── ProductDetailPage.tsx # 상품 상세 페이지
│   └── ProductCreatePage.tsx # 상품 생성 페이지
├── order/
│   ├── index.ts         # 주문 라우트 정의
│   ├── OrderListPage.tsx # 주문 목록 페이지
│   ├── OrderDetailPage.tsx # 주문 상세 페이지
│   └── CheckoutPage.tsx # 결제 페이지
├── auth/
│   ├── LoginPage.tsx    # 로그인 페이지
│   ├── RegisterPage.tsx # 회원가입 페이지
│   └── ForgotPasswordPage.tsx # 비밀번호 찾기 페이지
├── HomePage.tsx         # 홈페이지
├── DashboardPage.tsx    # 대시보드 페이지
└── NotFoundPage.tsx     # 404 페이지
```

## 📝 사용 예시

### 페이지 컴포넌트 작성
```typescript
// UserDetailPage.tsx
import { useParams } from 'react-router-dom';
import { UserProfile, useUser } from '@/domain/user';
import { Layout } from '@/shared/components';
import { FeatureFlag } from '@/feature/featureFlags';

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, error } = useUser(id!);
  const analytics = useAnalytics();

  useEffect(() => {
    if (user) {
      analytics.trackPageView(`/users/${id}`, { userId: id });
    }
  }, [user, id, analytics]);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorPage error={error} />;
  if (!user) return <NotFoundPage />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">사용자 상세</h1>
          
          <div className="space-x-2">
            <SmartLink 
              to={`/users/${id}/edit`}
              analytics={{ event: 'user_edit_button_clicked', properties: { userId: id } }}
            >
              <Button variant="primary">수정</Button>
            </SmartLink>
            
            <FeatureFlag flag="enableUserDeletion">
              <Button 
                variant="danger" 
                onClick={() => analytics.track('user_delete_clicked', { userId: id })}
              >
                삭제
              </Button>
            </FeatureFlag>
          </div>
        </div>

        <UserProfile user={user} />
        
        {/* 실험: 사용자 상세 정보 섹션 */}
        <Experiment experiment="userDetailSections">
          {(variant) => (
            variant === 'extended' ? (
              <ExtendedUserInfo user={user} />
            ) : (
              <BasicUserInfo user={user} />
            )
          )}
        </Experiment>
      </div>
    </Layout>
  );
};
```

### 중첩 라우팅
```typescript
// DashboardPage.tsx with nested routes
import { Outlet, NavLink } from 'react-router-dom';
import { Layout } from '@/shared/components';

const DashboardPage = () => {
  return (
    <Layout>
      <div className="flex">
        <nav className="w-64 bg-gray-100 p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/dashboard/overview" 
                className={({ isActive }) => 
                  `block p-2 rounded ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`
                }
              >
                개요
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/users" className="block p-2 rounded hover:bg-gray-200">
                사용자 관리
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard/analytics" className="block p-2 rounded hover:bg-gray-200">
                분석
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </Layout>
  );
};
```

## ⚠️ 주의사항

### 금지사항
1. **페이지에서 직접 비즈니스 로직 구현 금지**
   ```typescript
   // ❌ 금지: 페이지에서 비즈니스 로직 구현
   const UserListPage = () => {
     const [users, setUsers] = useState([]);
     
     useEffect(() => {
       // 직접 API 호출 및 로직 구현
       fetch('/api/users').then(/* ... */);
     }, []);
   };
   
   // ✅ 올바름: 도메인 훅 사용
   const UserListPage = () => {
     const { data: users, isLoading } = useUserList();
   };
   ```

2. **과도한 라우트 가드 중첩 금지**
   ```typescript
   // ❌ 금지: 불필요한 중첩
   <RouteGuard requireAuth>
     <RouteGuard requiredRoles={['admin']}>
       <RouteGuard requiredPermissions={['users.read']}>
         <UserListPage />
       </RouteGuard>
     </RouteGuard>
   </RouteGuard>
   
   // ✅ 올바름: 하나의 가드로 통합
   <RouteGuard 
     requireAuth 
     requiredRoles={['admin']} 
     requiredPermissions={['users.read']}
   >
     <UserListPage />
   </RouteGuard>
   ```

3. **페이지 간 직접 상태 공유 금지**
   ```typescript
   // ❌ 금지: 페이지 간 직접 상태 전달
   const UserListPage = () => {
     const [selectedUser, setSelectedUser] = useState(null);
     // 다른 페이지로 상태 전달하려는 시도
   };
   
   // ✅ 올바름: URL 파라미터 또는 전역 상태 사용
   const UserListPage = () => {
     const navigate = useNavigate();
     const handleUserSelect = (user) => {
       navigate(`/users/${user.id}`);
     };
   };
   ```

## 🧪 테스트 가이드

### 라우팅 테스트
```typescript
// UserListPage.test.tsx
describe('UserListPage', () => {
  it('should render user list', async () => {
    render(
      <MemoryRouter initialEntries={['/users']}>
        <QueryClientProvider client={queryClient}>
          <UserListPage />
        </QueryClientProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    });
  });

  it('should navigate to user detail on click', async () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    render(<UserListPage />);
    
    fireEvent.click(screen.getByText('John Doe'));
    expect(mockNavigate).toHaveBeenCalledWith('/users/1');
  });
});
```

### 라우트 가드 테스트
```typescript
// RouteGuard.test.tsx
describe('RouteGuard', () => {
  it('should render children when user is authenticated', () => {
    const mockUser = { id: '1', roles: ['user'] };
    
    render(
      <AuthProvider value={{ user: mockUser, isAuthenticated: true }}>
        <RouteGuard requireAuth>
          <div>Protected Content</div>
        </RouteGuard>
      </AuthProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render fallback when user lacks required role', () => {
    const mockUser = { id: '1', roles: ['user'] };
    
    render(
      <AuthProvider value={{ user: mockUser, isAuthenticated: true }}>
        <RouteGuard requiredRoles={['admin']}>
          <div>Admin Content</div>
        </RouteGuard>
      </AuthProvider>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});
```

## 📈 성능 최적화

### 코드 분할 전략
```typescript
// 페이지별 코드 분할
const HomePage = lazy(() => import('./HomePage'));
const UserListPage = lazy(() => import('./user/UserListPage'));

// 라우트 기반 청크 분할
const userRoutes = lazy(() => import('./user'));
const productRoutes = lazy(() => import('./product'));
```

### 프리로딩 최적화
```typescript
// 사용자 행동 기반 프리로딩
export const SmartLink = ({ to, children, ...props }) => {
  const handleMouseEnter = useCallback(() => {
    // 마우스 호버 시 프리로드
    preloader.preloadRoute(to);
  }, [to]);

  const handleFocus = useCallback(() => {
    // 포커스 시 프리로드 (키보드 네비게이션)
    preloader.preloadRoute(to);
  }, [to]);

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      {children}
    </Link>
  );
};
```

### 메모리 관리
```typescript
// 페이지 언마운트 시 정리
const UserListPage = () => {
  const analytics = useAnalytics();

  useEffect(() => {
    // 페이지 진입 시 이벤트
    analytics.trackPageView('/users');

    return () => {
      // 페이지 이탈 시 정리
      analytics.track('page_exit', { page: '/users' });
    };
  }, [analytics]);

  // ...
};
```

이 레이어는 **애플리케이션의 네비게이션과 페이지 구성**을 관리하여 우수한 사용자 경험과 효율적인 애플리케이션 구조를 제공합니다.