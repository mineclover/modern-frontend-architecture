# Task 2: 핵심 도메인 마이그레이션

**기간**: 2-3주  
**담당**: 전체 개발팀 (도메인별 담당자 지정)  
**목표**: 가장 중요한 1-2개 도메인을 새로운 구조로 마이그레이션하여 패턴 검증

## 🎯 핵심 목표

- ✅ 핵심 도메인 2개 마이그레이션 완료
- ✅ 도메인 독립성 확보
- ✅ Public API 패턴 적용
- ✅ 기존 코드와 호환성 유지
- ✅ 성능 영향 최소화

## 📋 1단계: 도메인 우선순위 결정 (2-3일)

### 1.1 도메인 분석 매트릭스
비즈니스 중요도와 기술적 복잡도를 기준으로 우선순위 결정

| 도메인 | 비즈니스 중요도 | 코드 복잡도 | 의존성 수 | 우선순위 | 담당자 |
|--------|----------------|-------------|-----------|----------|--------|
| User   | 🔴 High        | 🟡 Medium   | 낮음      | 1순위    | [담당자] |
| Auth   | 🔴 High        | 🟢 Low      | 낮음      | 2순위    | [담당자] |
| Product| 🟡 Medium      | 🔴 High     | 높음      | 3순위    | [담당자] |
| Order  | 🟡 Medium      | 🔴 High     | 높음      | 4순위    | [담당자] |

### 1.2 첫 번째 도메인 선정 기준
- [ ] **비즈니스 중요도**: 핵심 기능
- [ ] **독립성**: 다른 도메인과 의존성 낮음
- [ ] **복잡도**: 적당한 수준 (너무 간단하거나 복잡하지 않음)
- [ ] **테스트 가능성**: 충분한 테스트 커버리지

**🎯 선정 결과**: `User` 도메인 (사용자 관리)

### 1.3 두 번째 도메인 선정
**🎯 선정 결과**: `Product` 도메인 (상품 관리)

## 📋 2단계: User 도메인 마이그레이션 (7-10일)

### 2.1 기존 코드 분석 (1일)
- [ ] 현재 User 관련 파일 위치 파악
- [ ] 의존성 관계 매핑
- [ ] API 엔드포인트 정리
- [ ] 컴포넌트 목록 작성
- [ ] 상태 관리 방식 확인

```bash
# 기존 구조 예시
/components/User/
├── UserCard.tsx
├── UserList.tsx
├── UserProfile.tsx
└── UserForm.tsx

/hooks/
├── useUser.ts
├── useUserList.ts
└── useUserActions.ts

/api/
└── userApi.ts

/types/
└── user.ts
```

### 2.2 새 도메인 구조 생성 (1일)
```bash
# 도메인 생성 스크립트 실행
./scripts/create-domain.sh user

# 생성된 구조
/src/domain/user/
├── api/
│   ├── userApi.ts
│   └── index.ts
├── components/
│   ├── UserCard.tsx
│   ├── UserList.tsx
│   ├── UserProfile.tsx
│   ├── UserForm.tsx
│   └── index.ts
├── hooks/
│   ├── useUser.ts
│   ├── useUserActions.ts
│   ├── useUserList.ts
│   └── index.ts
├── store/
│   ├── userQueries.ts
│   ├── userSlice.ts
│   └── index.ts
├── types/
│   ├── user.ts
│   └── index.ts
├── utils/
│   ├── userHelpers.ts
│   └── index.ts
├── constants/
│   ├── userStatus.ts
│   └── index.ts
├── README.md
└── index.ts (Public API)
```

### 2.3 API 레이어 마이그레이션 (2일)

#### 2.3.1 userApi.ts 작성
```typescript
// src/domain/user/api/userApi.ts
import { httpClient } from '@/services/http'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types'

export const userApi = {
  async getUser(id: string): Promise<User> {
    const response = await httpClient.get(`/users/${id}`)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get('/users/me')
    return response.data
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await httpClient.post('/users', data)
    return response.data
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await httpClient.patch(`/users/${id}`, data)
    return response.data
  },

  async deleteUser(id: string): Promise<void> {
    await httpClient.delete(`/users/${id}`)
  },

  async getUserList(params?: UserListParams): Promise<UserListResponse> {
    const response = await httpClient.get('/users', { params })
    return response.data
  }
}
```

#### 2.3.2 타입 정의 마이그레이션
```typescript
// src/domain/user/types/user.ts
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  notifications: NotificationSettings
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface CreateUserRequest {
  email: string
  name: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}
```

### 2.4 상태 관리 마이그레이션 (2일)

#### 2.4.1 React Query 기반 상태 관리
```typescript
// src/domain/user/store/userQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api'
import type { CreateUserRequest, UpdateUserRequest } from '../types'

export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params: object) => [...userQueryKeys.lists(), params] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  current: () => [...userQueryKeys.all, 'current'] as const,
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: userQueryKeys.current(),
    queryFn: userApi.getCurrentUser,
  })
}

export function useUserList(params?: UserListParams) {
  return useQuery({
    queryKey: userQueryKeys.list(params || {}),
    queryFn: () => userApi.getUserList(params),
  })
}
```

### 2.5 훅 레이어 마이그레이션 (2일)

#### 2.5.1 비즈니스 로직 훅
```typescript
// src/domain/user/hooks/useUser.ts
import { useCurrentUser, useUser as useUserQuery } from '../store'

export function useUser(id?: string) {
  const currentUserQuery = useCurrentUser()
  const userQuery = useUserQuery(id!, { enabled: !!id })
  
  if (id) {
    return {
      user: userQuery.data,
      isLoading: userQuery.isLoading,
      error: userQuery.error,
      refetch: userQuery.refetch,
    }
  }
  
  return {
    user: currentUserQuery.data,
    isLoading: currentUserQuery.isLoading,
    error: currentUserQuery.error,
    refetch: currentUserQuery.refetch,
  }
}
```

#### 2.5.2 액션 훅
```typescript
// src/domain/user/hooks/useUserActions.ts
import { useCreateUser, useUpdateUser, useDeleteUser } from '../store'
import { useCallback } from 'react'

export function useUserActions() {
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const createUser = useCallback(async (data: CreateUserRequest) => {
    try {
      const user = await createUserMutation.mutateAsync(data)
      return { success: true, user }
    } catch (error) {
      return { success: false, error }
    }
  }, [createUserMutation])

  return {
    createUser,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  }
}
```

### 2.6 컴포넌트 마이그레이션 (2일)

#### 2.6.1 UserCard 컴포넌트
```typescript
// src/domain/user/components/UserCard.tsx
import React from 'react'
import { Card, Avatar, Badge } from '@/shared/components'
import type { User } from '../types'

interface UserCardProps {
  user: User
  onClick?: () => void
  showRole?: boolean
  className?: string
}

export function UserCard({ user, onClick, showRole = true, className }: UserCardProps) {
  return (
    <Card className={className} onClick={onClick}>
      <div className="flex items-center space-x-3">
        <Avatar 
          src={user.avatar} 
          alt={user.name}
          fallback={user.name.charAt(0).toUpperCase()}
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
        </div>
        
        {showRole && (
          <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
            {user.role}
          </Badge>
        )}
      </div>
    </Card>
  )
}
```

### 2.7 Public API 설계 (1일)

```typescript
// src/domain/user/index.ts
// 👇 외부에 노출할 것만 export

// Components
export { UserCard, UserList, UserProfile, UserForm } from './components'

// Hooks  
export { useUser, useUserActions, useUserList } from './hooks'

// API (필요한 경우만)
export { userApi } from './api'

// Types
export type { 
  User, 
  UserPreferences, 
  UserRole,
  CreateUserRequest,
  UpdateUserRequest 
} from './types'

// 🚨 내부 구현은 절대 노출하지 않음
// ❌ export { userQueryKeys } from './store'
// ❌ export { useCreateUser } from './store'
```

## 📋 3단계: Product 도메인 마이그레이션 (7-10일)

### 3.1 User 도메인 패턴 적용
- [ ] 동일한 구조와 패턴 적용
- [ ] 도메인별 특성 고려한 커스터마이징
- [ ] User 도메인에서 학습한 개선사항 반영

### 3.2 도메인 간 의존성 제거
- [ ] Product → User 직접 참조 제거
- [ ] 공통 타입을 shared로 이동
- [ ] 의존성 규칙 검증

## 📋 4단계: 기존 코드와 호환성 유지 (3-5일)

### 4.1 점진적 마이그레이션 전략

#### 4.1.1 Barrel Export 패턴
```typescript
// 기존 위치에 Re-export 파일 생성
// /components/User/index.ts
export { 
  UserCard, 
  UserList, 
  UserProfile, 
  UserForm 
} from '@/domain/user'

// /hooks/user.ts
export { 
  useUser, 
  useUserActions, 
  useUserList 
} from '@/domain/user'
```

#### 4.1.2 점진적 Import 변경
```typescript
// 1단계: 기존 import 유지 (호환성)
import { UserCard } from '../components/User'

// 2단계: 새로운 import로 점진적 변경
import { UserCard } from '@/domain/user'

// 3단계: 기존 re-export 제거
```

### 4.2 Deprecation 경고
```typescript
// 기존 파일에 deprecation 주석 추가
/**
 * @deprecated Use '@/domain/user' instead
 * This file will be removed in v2.0.0
 */
export { UserCard } from '@/domain/user'
```

## 📋 5단계: 테스트 및 검증 (3-4일)

### 5.1 단위 테스트 작성
```typescript
// src/domain/user/__tests__/userApi.test.ts
import { userApi } from '../api'
import { httpClient } from '@/services/http'

jest.mock('@/services/http')

describe('userApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUser', () => {
    it('should fetch user by id', async () => {
      const mockUser = { id: '1', name: 'John', email: 'john@test.com' }
      ;(httpClient.get as jest.Mock).mockResolvedValue({ data: mockUser })

      const result = await userApi.getUser('1')
      
      expect(httpClient.get).toHaveBeenCalledWith('/users/1')
      expect(result).toEqual(mockUser)
    })
  })
})
```

### 5.2 통합 테스트
```typescript
// src/domain/user/__tests__/integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserProfile } from '../components'

describe('User Domain Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
  })

  it('should render user profile with data', async () => {
    // Mock API response
    // Render component
    // Assert UI updates
  })
})
```

### 5.3 아키텍처 규칙 검증
```bash
# 의존성 방향 검증
npm run arch:check

# 도메인 구조 검증
npm run domain:validate

# Public API 검증
npm run lint:architecture
```

### 5.4 성능 테스트
- [ ] 번들 크기 변화 측정
- [ ] 초기 로딩 시간 비교
- [ ] 메모리 사용량 확인
- [ ] 렌더링 성능 측정

## 🚨 주의사항

### 마이그레이션 원칙
- ⚠️ **점진적 변경**: 한 번에 모든 것을 바꾸지 않음
- ⚠️ **기능 우선**: 새로운 기능보다 기존 기능 안정성 우선
- ⚠️ **롤백 계획**: 문제 발생 시 빠른 롤백 가능하도록 준비

### 팀 협업
- 📋 도메인별 담당자 명확히 지정
- 📋 일일 스탠드업에서 진행상황 공유
- 📋 블로킹 이슈 즉시 에스컬레이션

### 품질 관리
- 🔍 모든 변경사항에 대한 코드 리뷰 필수
- 🔍 아키텍처 규칙 위반 시 즉시 수정
- 🔍 테스트 커버리지 80% 이상 유지

## 📊 완료 기준

### 기술적 완료 조건
- [ ] User, Product 도메인 100% 마이그레이션
- [ ] 모든 테스트 통과 (단위 + 통합)
- [ ] 아키텍처 규칙 위반 0개
- [ ] 성능 저하 없음 (번들 크기 ±5% 이내)
- [ ] Public API 문서화 완료

### 비즈니스 완료 조건
- [ ] 기존 기능 100% 동작
- [ ] 사용자 영향 없음
- [ ] QA 테스트 통과

### 팀 준비도
- [ ] 새로운 패턴에 대한 팀 이해도 확보
- [ ] 다음 도메인 마이그레이션 계획 수립
- [ ] 문제점 및 개선사항 정리

## 🎯 성공 지표

### 정량적 지표
- ✅ 마이그레이션 완료율: 100%
- ✅ 테스트 커버리지: 80% 이상
- ✅ 아키텍처 위반: 0건
- ✅ 번들 크기 증가: 5% 이내
- ✅ 빌드 시간 증가: 10% 이내

### 정성적 지표
- ✅ 개발자 만족도: 새로운 구조의 편의성
- ✅ 코드 가독성: 도메인별 응집도 향상
- ✅ 유지보수성: 변경 영향도 최소화

## 📞 지원 및 문의

- **도메인 설계**: 시니어 개발자
- **마이그레이션 이슈**: 도메인 담당자
- **성능 문제**: 성능 전문가
- **일정 이슈**: 프로젝트 매니저

---

**⚡ 이전 Task**: [Task 1: 기반 인프라 구축](./task1.md)  
**⚡ 다음 Task**: [Task 3: 전체 마이그레이션 및 최적화](./task3.md)