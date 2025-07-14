# 🏛️ Domain Layer

**비즈니스 도메인별 캡슐화된 기능 모듈 레이어**

## 🎯 역할과 책임

Domain 레이어는 **비즈니스 도메인별로 캡슐화된 기능**을 제공하는 레이어로, 다음과 같은 역할을 담당합니다:

- **도메인별 비즈니스 로직** 구현 (User, Product, Order 등)
- **도메인 특화 UI 컴포넌트** 제공
- **도메인별 API 호출 로직** 관리
- **도메인별 상태 관리** (React Query, Zustand 등)
- **도메인별 타입 정의** 및 검증 로직

## 📦 포함되는 내용

### 도메인 구조 (예: `/user`)
```
src/domain/user/
├── index.ts              # Public API (외부 노출 인터페이스)
├── README.md            # 도메인별 가이드
├── types/
│   ├── index.ts         # 타입들 export
│   └── user.ts          # User 관련 타입 정의
├── api/
│   ├── index.ts         # API 함수들 export
│   └── userApi.ts       # User API 호출 함수들
├── hooks/
│   ├── index.ts         # 훅들 export
│   ├── useUser.ts       # 단일 사용자 관리 훅
│   ├── useUserList.ts   # 사용자 목록 관리 훅
│   └── useUserActions.ts # 사용자 액션 훅
├── components/
│   ├── index.ts         # 컴포넌트들 export
│   ├── UserCard.tsx     # 사용자 카드 컴포넌트
│   ├── UserForm.tsx     # 사용자 폼 컴포넌트
│   ├── UserList.tsx     # 사용자 목록 컴포넌트
│   └── UserProfile.tsx  # 사용자 프로필 컴포넌트
├── store/
│   ├── index.ts         # 스토어 export
│   └── userStore.ts     # 사용자 상태 관리
├── utils/
│   ├── index.ts         # 유틸리티 export
│   └── userUtils.ts     # 사용자 관련 유틸리티
└── constants/
    ├── index.ts         # 상수들 export
    └── userConstants.ts # 사용자 관련 상수
```

### `/types` - 타입 정의
```typescript
// user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

### `/api` - API 호출 함수
```typescript
// userApi.ts
import { httpClient } from '@/services/http';
import type { User, CreateUserRequest, UpdateUserRequest, UserListQuery } from '../types';

export const userApi = {
  // 사용자 목록 조회
  getUsers: async (query: UserListQuery = {}): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    
    return httpClient.get<PaginatedResponse<User>>(`/users?${params}`);
  },

  // 사용자 상세 조회
  getUser: async (id: string): Promise<User> => {
    return httpClient.get<User>(`/users/${id}`);
  },

  // 사용자 생성
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return httpClient.post<User>('/users', userData);
  },

  // 사용자 수정
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<User> => {
    return httpClient.put<User>(`/users/${id}`, userData);
  },

  // 사용자 삭제
  deleteUser: async (id: string): Promise<void> => {
    return httpClient.delete(`/users/${id}`);
  },

  // 사용자 검색
  searchUsers: async (query: string): Promise<User[]> => {
    return httpClient.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  }
};
```

### `/hooks` - React Query 훅
```typescript
// useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';

// 사용자 조회 훅
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 사용자 생성 훅
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userApi.createUser(userData),
    onSuccess: (newUser) => {
      // 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // 새 사용자를 캐시에 직접 추가
      queryClient.setQueryData(['user', newUser.id], newUser);
      
      // 성공 알림
      notificationService.showToast('사용자가 성공적으로 생성되었습니다.', 'success');
    },
    onError: (error: Error) => {
      notificationService.showToast(error.message, 'error');
    }
  });
};

// 사용자 수정 훅
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserRequest }) =>
      userApi.updateUser(id, userData),
    onSuccess: (updatedUser) => {
      // 해당 사용자 캐시 업데이트
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
      
      // 사용자 목록 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      notificationService.showToast('사용자 정보가 업데이트되었습니다.', 'success');
    },
    onError: (error: Error) => {
      notificationService.showToast(error.message, 'error');
    }
  });
};
```

### `/components` - 도메인 특화 컴포넌트
```typescript
// UserCard.tsx
import { Card, Button } from '@/shared/components';
import type { User } from '../types';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  showActions?: boolean;
}

export const UserCard = ({ 
  user, 
  onEdit, 
  onDelete, 
  showActions = true 
}: UserCardProps) => {
  const handleEdit = () => onEdit?.(user);
  const handleDelete = () => onDelete?.(user);

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === 'admin' 
              ? 'bg-red-100 text-red-800'
              : user.role === 'user'
              ? 'bg-green-100 text-green-800'  
              : 'bg-gray-100 text-gray-800'
          }`}>
            {user.role}
          </span>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={handleEdit}>
              수정
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              삭제
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// UserForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Button } from '@/shared/components';
import { userValidationSchema } from '../utils/validation';
import type { CreateUserRequest, UpdateUserRequest } from '../types';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm = ({ user, onSubmit, onCancel, isLoading }: UserFormProps) => {
  const isEditing = !!user;
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(userValidationSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      role: user.role
    } : {
      name: '',
      email: '',
      password: '',
      role: 'user' as const
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="이름"
        {...register('name')}
        error={errors.name?.message}
      />
      
      <Input
        label="이메일"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      
      {!isEditing && (
        <Input
          label="비밀번호"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
      )}
      
      <select
        {...register('role')}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="user">사용자</option>
        <option value="admin">관리자</option>
        <option value="guest">게스트</option>
      </select>

      <div className="flex space-x-2">
        <Button 
          type="submit" 
          disabled={isLoading}
          variant="primary"
        >
          {isLoading ? '저장 중...' : isEditing ? '수정' : '생성'}
        </Button>
        <Button 
          type="button" 
          onClick={onCancel}
          variant="secondary"
        >
          취소
        </Button>
      </div>
    </form>
  );
};
```

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **하위 레이어**: `common`, `global`, `services`, `shared`
- **상태 관리**: React Query, Zustand
- **폼 관리**: React Hook Form, Zod
- **같은 도메인 내부**: 도메인 내의 다른 모듈들

### ❌ 금지되는 의존성
- **상위 레이어**: `feature`, `routes`
- **다른 도메인**: 다른 도메인의 내부 구현 (Public API만 허용)
- **UI 프레임워크**: 특정 UI 라이브러리에 강하게 결합

## 📝 Public API 패턴

### 도메인의 index.ts
```typescript
// src/domain/user/index.ts
// Public API - 외부에서 접근 가능한 것들만 export

// Types
export type { User, UserRole, CreateUserRequest, UpdateUserRequest } from './types';

// API
export { userApi } from './api';

// Hooks
export { 
  useUser, 
  useUserList, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser 
} from './hooks';

// Components
export { 
  UserCard, 
  UserForm, 
  UserList, 
  UserProfile 
} from './components';

// Utils (필요한 경우만)
export { validateUserEmail } from './utils';

// Constants (필요한 경우만)
export { USER_ROLES } from './constants';

// ❌ 내부 구현은 export하지 않음
// export { InternalUserComponent } from './components/InternalUserComponent';
```

### 다른 레이어에서 사용
```typescript
// ✅ 올바른 사용: Public API 통해서만 접근
import { User, UserCard, useUser } from '@/domain/user';

// ❌ 금지: 내부 구현 직접 접근
import { UserCard } from '@/domain/user/components/UserCard';
import { userValidationSchema } from '@/domain/user/utils/validation';
```

## 🔄 도메인 간 통신

### 도메인 간 데이터 공유가 필요한 경우
```typescript
// ❌ 금지: 직접 의존성
import { Product } from '@/domain/product'; // user 도메인에서

// ✅ 방법 1: Shared Types 사용
import { ProductReference } from '@/shared/types';

interface User {
  id: string;
  favoriteProducts: ProductReference[]; // 전체 Product 객체가 아닌 참조만
}

// ✅ 방법 2: API 호출로 필요시 데이터 가져오기
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user } = useUser(userId);
  const { data: favoriteProducts } = useQuery({
    queryKey: ['user-favorite-products', userId],
    queryFn: () => productApi.getProductsByIds(user?.favoriteProductIds || []),
    enabled: !!user?.favoriteProductIds?.length
  });

  return (
    <div>
      <h1>{user?.name}</h1>
      <FavoriteProductsList products={favoriteProducts} />
    </div>
  );
};

// ✅ 방법 3: Events를 통한 통신
import { eventBus } from '@/services/eventBus';

// User 도메인에서 이벤트 발생
const handleUserUpdate = (user: User) => {
  eventBus.emit('user:updated', { userId: user.id, userData: user });
};

// Product 도메인에서 이벤트 수신
useEffect(() => {
  const handleUserUpdate = ({ userId, userData }) => {
    // 사용자 관련 제품 정보 업데이트
    queryClient.invalidateQueries(['user-products', userId]);
  };

  eventBus.on('user:updated', handleUserUpdate);
  return () => eventBus.off('user:updated', handleUserUpdate);
}, []);
```

## ⚠️ 주의사항

### 금지사항
1. **다른 도메인 직접 의존 금지**
   ```typescript
   // ❌ 금지: user 도메인에서 product 도메인 직접 import
   import { ProductCard } from '@/domain/product';
   
   // ✅ 올바름: API 호출로 필요한 데이터만 가져오기
   const { data: products } = useQuery(['products'], productApi.getProducts);
   ```

2. **과도한 Public API 노출 금지**
   ```typescript
   // ❌ 금지: 내부 구현까지 모두 export
   export * from './components'; // 모든 컴포넌트 노출
   export * from './utils';      // 모든 유틸리티 노출
   
   // ✅ 올바름: 필요한 것만 명시적으로 export
   export { UserCard, UserForm } from './components';
   export { validateUserEmail } from './utils';
   ```

3. **비즈니스 로직을 컴포넌트에 집중시키지 않기**
   ```typescript
   // ❌ 금지: 컴포넌트에 비즈니스 로직 집중
   const UserCard = ({ user }) => {
     const calculateUserScore = () => {
       // 복잡한 점수 계산 로직
     };
     
     const validateUserData = () => {
       // 복잡한 검증 로직
     };
     
     // ... JSX
   };
   
   // ✅ 올바름: 로직을 별도 모듈로 분리
   const UserCard = ({ user }) => {
     const score = userUtils.calculateScore(user);
     const isValid = userUtils.validateUser(user);
     
     // ... JSX
   };
   ```

## 🧪 테스트 가이드

### API 테스트
```typescript
// userApi.test.ts
describe('userApi', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should fetch user by id', async () => {
    const mockUser = { id: '1', name: 'John', email: 'john@example.com' };
    fetchMock.mockResponseOnce(JSON.stringify(mockUser));

    const user = await userApi.getUser('1');

    expect(user).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });
});
```

### Hook 테스트
```typescript
// useUser.test.ts
describe('useUser', () => {
  it('should fetch user data', async () => {
    const mockUser = { id: '1', name: 'John' };
    
    const { result } = renderHook(() => useUser('1'), {
      wrapper: QueryClientProvider
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

### 컴포넌트 테스트
```typescript
// UserCard.test.tsx
describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user' as const
  };

  it('should render user information', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const handleEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={handleEdit} />);

    fireEvent.click(screen.getByText('수정'));
    expect(handleEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

## 📈 성능 최적화

### 데이터 캐싱 전략
```typescript
// useUser.ts with advanced caching
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,    // 5분간 fresh
    cacheTime: 30 * 60 * 1000,   // 30분간 캐시 유지
    retry: 3,                     // 3번 재시도
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

### 지연 로딩
```typescript
// components/index.ts
export const UserCard = lazy(() => import('./UserCard'));
export const UserForm = lazy(() => import('./UserForm'));
export const UserProfile = lazy(() => import('./UserProfile'));
```

이 레이어는 **비즈니스 도메인별로 캡슐화된 기능**을 제공하여 높은 응집도와 낮은 결합도를 달성합니다.