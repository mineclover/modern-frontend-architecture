# 🤝 Shared Layer

**도메인 간 공유되는 UI 컴포넌트 및 비즈니스 로직 레이어**

## 🎯 역할과 책임

Shared 레이어는 **여러 도메인에서 공통으로 사용되는 요소들**을 관리하는 레이어로, 다음과 같은 역할을 담당합니다:

- **재사용 가능한 UI 컴포넌트** 제공 (Button, Modal, Input 등)
- **공통 비즈니스 로직** 제공 (validation, formatting 등)
- **도메인 간 공유되는 커스텀 훅** 제공
- **레이아웃 컴포넌트** 제공 (Header, Sidebar, Layout 등)

## 📦 포함되는 내용

### `/components/ui`
```typescript
// 기본 UI 컴포넌트들
export const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  onClick,
  children,
  ...props 
}: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeStyles = {
    small: 'text-sm px-3 py-1',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
```

### `/components/layout`
```typescript
// 레이아웃 컴포넌트들
export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export const Header = ({ user }: HeaderProps) => {
  const { logout } = useAuth();
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
            <Navigation />
          </div>
          <div className="flex items-center space-x-4">
            <UserMenu user={user} onLogout={logout} />
          </div>
        </div>
      </div>
    </header>
  );
};
```

### `/hooks`
```typescript
// 공통 커스텀 훅들
export const useAsync = <T, E = Error>(
  asyncFunction: () => Promise<T>,
  dependencies: DependencyList = []
) => {
  const [state, setState] = useState<AsyncState<T, E>>({
    loading: false,
    data: null,
    error: null
  });

  const execute = useCallback(async () => {
    setState({ loading: true, data: null, error: null });
    
    try {
      const data = await asyncFunction();
      setState({ loading: false, data, error: null });
      return data;
    } catch (error) {
      setState({ loading: false, data: null, error: error as E });
      throw error;
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, execute };
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storageService.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storageService.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};
```

### `/constants`
```typescript
// 공통 상수들 (UI 관련)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

export const COLORS = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    500: '#6b7280',
    900: '#111827'
  }
} as const;

export const ANIMATIONS = {
  fadeIn: 'fadeIn 0.3s ease-in-out',
  slideUp: 'slideUp 0.3s ease-in-out',
  bounce: 'bounce 0.5s ease-in-out'
} as const;
```

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **하위 레이어**: `common`, `global`, `services`
- **UI 라이브러리**: React, styled-components, Tailwind CSS
- **상태 관리**: React Query (서버 상태), Zustand (클라이언트 상태)
- **유틸리티 라이브러리**: class-variance-authority, clsx

### ❌ 금지되는 의존성
- **상위 레이어**: `domain`, `feature`, `routes`
- **도메인 특화 로직**: 특정 비즈니스 도메인에 종속적인 코드

## 🏗️ 폴더 구조

```
src/shared/
├── index.ts              # Public API 정의
├── README.md            # 이 문서
├── components/
│   ├── index.ts         # 모든 컴포넌트 export
│   ├── ui/              # 기본 UI 컴포넌트
│   │   ├── index.ts     # UI 컴포넌트들 export
│   │   ├── Button.tsx   # 버튼 컴포넌트
│   │   ├── Input.tsx    # 입력 컴포넌트
│   │   ├── Modal.tsx    # 모달 컴포넌트
│   │   ├── Card.tsx     # 카드 컴포넌트
│   │   └── Loading.tsx  # 로딩 컴포넌트
│   └── layout/          # 레이아웃 컴포넌트
│       ├── index.ts     # 레이아웃 컴포넌트들 export
│       ├── Layout.tsx   # 기본 레이아웃
│       ├── Header.tsx   # 헤더 컴포넌트
│       └── Sidebar.tsx  # 사이드바 컴포넌트
├── hooks/
│   ├── index.ts         # 훅들 export
│   ├── useAsync.ts      # 비동기 상태 관리 훅
│   ├── useDebounce.ts   # 디바운스 훅
│   └── useLocalStorage.ts # 로컬스토리지 훅
└── constants/
    ├── index.ts         # 상수들 export
    ├── ui.ts            # UI 관련 상수
    └── validation.ts    # 검증 관련 상수
```

## 📝 사용 예시

### UI 컴포넌트 사용
```typescript
// Domain 컴포넌트에서 Shared UI 사용
import { Button, Modal, Card } from '@/shared/components';

const UserProfile = ({ user }: UserProfileProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <Card>
      <h1>{user.name}</h1>
      <Button 
        variant="primary" 
        onClick={() => setIsEditModalOpen(true)}
      >
        프로필 수정
      </Button>
      
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="프로필 수정"
      >
        <UserEditForm user={user} />
      </Modal>
    </Card>
  );
};
```

### 공통 훅 사용
```typescript
// Domain 컴포넌트에서 Shared Hook 사용
import { useAsync, useLocalStorage } from '@/shared/hooks';

const ProductList = () => {
  const [viewMode, setViewMode] = useLocalStorage('product-view-mode', 'grid');
  
  const { data: products, loading, error } = useAsync(
    () => productApi.getProducts(),
    []
  );

  if (loading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={`product-list ${viewMode}`}>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### 레이아웃 컴포넌트 사용
```typescript
// Routes에서 레이아웃 사용
import { Layout } from '@/shared/components';

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/users" element={<UserListPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/orders" element={<OrderListPage />} />
      </Routes>
    </Layout>
  );
};
```

## 🎨 디자인 시스템 통합

### 테마 시스템
```typescript
// theme.ts
export const theme = {
  colors: COLORS,
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px'
  }
};
```

### 컴포넌트 변형 관리
```typescript
// Button.tsx with variants
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
```

## ⚠️ 주의사항

### 금지사항
1. **도메인 특화 로직 포함 금지**
   ```typescript
   // ❌ 금지: 특정 도메인 로직
   export const UserSpecificButton = ({ user }: { user: User }) => {
     const isAdmin = user.role === 'admin'; // 도메인 로직
     return <Button disabled={!isAdmin}>관리자 전용</Button>;
   };
   
   // ✅ 올바름: 범용 컴포넌트
   export const RoleBasedButton = ({ 
     allowedRoles, 
     userRole, 
     children 
   }: RoleBasedButtonProps) => {
     const isAllowed = allowedRoles.includes(userRole);
     return <Button disabled={!isAllowed}>{children}</Button>;
   };
   ```

2. **상위 레이어 의존성 금지**
   ```typescript
   // ❌ 금지
   import { useUserStore } from '@/domain/user';
   import { ProductCard } from '@/feature/product';
   
   // ✅ 올바름
   import { httpClient } from '@/services/http';
   import { useGlobalStore } from '@/global';
   ```

3. **과도한 추상화 금지**
   ```typescript
   // ❌ 금지: 불필요한 추상화
   export const SuperFlexibleGenericComponent = ({ 
     data, 
     renderer, 
     transformer, 
     validator 
   }) => {
     // 너무 복잡한 범용 컴포넌트
   };
   
   // ✅ 올바름: 명확한 목적의 컴포넌트
   export const DataTable = ({ 
     columns, 
     data, 
     onRowClick 
   }: DataTableProps) => {
     // 명확한 용도의 테이블 컴포넌트
   };
   ```

## 🧪 테스트 가이드

### 컴포넌트 테스트
```typescript
// Button.test.tsx
describe('Button', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });
});
```

### 훅 테스트
```typescript
// useAsync.test.ts
describe('useAsync', () => {
  it('should handle successful async operation', async () => {
    const mockAsyncFn = jest.fn().mockResolvedValue('success');
    
    const { result } = renderHook(() => useAsync(mockAsyncFn));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('success');
      expect(result.current.error).toBeNull();
    });
  });
});
```

## 📈 성능 최적화

### 코드 분할
```typescript
// Lazy loading for heavy components
export const Modal = lazy(() => import('./Modal'));
export const DataTable = lazy(() => import('./DataTable'));

// Re-export with Suspense wrapper
export const LazyModal = (props: ModalProps) => (
  <Suspense fallback={<Loading />}>
    <Modal {...props} />
  </Suspense>
);
```

### 메모이제이션
```typescript
// 불필요한 리렌더링 방지
export const Button = memo(({ 
  variant, 
  size, 
  disabled, 
  onClick, 
  children,
  ...props 
}: ButtonProps) => {
  const memoizedStyles = useMemo(() => 
    cn(buttonVariants({ variant, size })), 
    [variant, size]
  );

  return (
    <button
      className={memoizedStyles}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});
```

이 레이어는 **여러 도메인에서 재사용**되는 UI 요소들을 제공하여 일관성 있는 사용자 경험을 보장합니다.