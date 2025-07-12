# User Domain

사용자 관리와 관련된 모든 기능을 포함하는 도메인입니다.

## 📁 구조

```
user/
├── api/           # API 호출 함수들
├── components/    # 사용자 관련 컴포넌트들
├── constants/     # 사용자 관련 상수들
├── hooks/         # React Query 훅들
├── store/         # 상태 관리 (hooks re-export)
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수들
├── index.ts       # Public API
└── README.md      # 이 파일
```

## 🎯 주요 기능

### 컴포넌트
- `UserCard`: 사용자 카드 컴포넌트
- `UserList`: 사용자 목록 컴포넌트  
- `UserProfile`: 사용자 프로필 컴포넌트
- `UserForm`: 사용자 생성/수정 폼

### 훅 (Hooks)
- `useUsers()`: 사용자 목록 조회
- `useUser(id)`: 특정 사용자 조회
- `useCreateUser()`: 사용자 생성
- `useUpdateUser()`: 사용자 수정
- `useDeleteUser()`: 사용자 삭제
- `useUploadAvatar()`: 아바타 업로드

### API
- `userApi.getUsers()`: 사용자 목록 API
- `userApi.getUser()`: 사용자 상세 API
- `userApi.createUser()`: 사용자 생성 API
- `userApi.updateUser()`: 사용자 수정 API
- `userApi.deleteUser()`: 사용자 삭제 API
- `userApi.uploadAvatar()`: 아바타 업로드 API

## 📖 사용법

### 기본 사용법

```typescript
import { 
  UserCard, 
  UserList, 
  useUsers, 
  useUser,
  User 
} from '@/domain/user'

// 사용자 목록 조회
function UserListPage() {
  const { data: users, isLoading } = useUsers()
  
  if (isLoading) return <div>로딩 중...</div>
  
  return <UserList users={users?.data || []} />
}

// 사용자 상세 조회
function UserDetailPage({ userId }: { userId: string }) {
  const { data: user } = useUser(userId)
  
  if (!user) return <div>사용자를 찾을 수 없습니다</div>
  
  return <UserCard user={user} />
}
```

### 필터링과 페이지네이션

```typescript
import { useUsers } from '@/domain/user'

function FilteredUserList() {
  const { data: users } = useUsers({
    role: 'admin',
    status: 'active',
    search: 'john',
    page: 1,
    limit: 10
  })
  
  return <UserList users={users?.data || []} />
}
```

### 사용자 생성/수정

```typescript
import { useCreateUser, useUpdateUser } from '@/domain/user'

function UserManagement() {
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  
  const handleCreate = async (data: CreateUserRequest) => {
    try {
      await createUser.mutateAsync(data)
      // 성공 처리
    } catch (error) {
      // 에러 처리
    }
  }
  
  const handleUpdate = async (id: string, data: UpdateUserRequest) => {
    try {
      await updateUser.mutateAsync({ id, data })
      // 성공 처리
    } catch (error) {
      // 에러 처리
    }
  }
}
```

### 유틸리티 함수 사용

```typescript
import { 
  getUserDisplayName,
  getUserInitials,
  formatUserRole,
  isUserActive
} from '@/domain/user'

function UserInfo({ user }: { user: User }) {
  return (
    <div>
      <h3>{getUserDisplayName(user)}</h3>
      <p>역할: {formatUserRole(user.role)}</p>
      <p>상태: {isUserActive(user) ? '활성' : '비활성'}</p>
      <div className="avatar">
        {getUserInitials(user)}
      </div>
    </div>
  )
}
```

## 🔧 개발 가이드

### 새 컴포넌트 추가
1. `components/` 폴더에 컴포넌트 파일 생성
2. `components/index.ts`에 export 추가
3. 도메인 `index.ts`에서 re-export 확인

### 새 API 추가
1. `api/index.ts`에 새 API 함수 추가
2. `hooks/index.ts`에 React Query 훅 추가
3. 필요한 타입을 `types/index.ts`에 정의

### 새 유틸리티 추가
1. `utils/index.ts`에 유틸리티 함수 추가
2. 관련 상수는 `constants/index.ts`에 정의

## ⚠️ 주의사항

### Public API 사용
```typescript
// ✅ 올바른 사용법
import { UserCard } from '@/domain/user'

// ❌ 잘못된 사용법 - 내부 구현 직접 접근
import { UserCard } from '@/domain/user/components/UserCard'
```

### 도메인 의존성
```typescript
// ❌ 다른 도메인 직접 import 금지
import { Product } from '@/domain/product'

// ✅ shared 타입 사용
import { EntityReference } from '@/shared/types'
```

## 🧪 테스트

```bash
# 유닛 테스트
npm test src/domain/user

# 커버리지 확인
npm run test:coverage -- --testPathPattern=src/domain/user
```

## 📝 타입 정의

### 주요 타입
- `User`: 사용자 엔티티
- `UserRole`: 사용자 역할 (`admin` | `user` | `guest`)
- `UserStatus`: 사용자 상태 (`active` | `inactive` | `pending` | `suspended`)
- `CreateUserRequest`: 사용자 생성 요청 데이터
- `UpdateUserRequest`: 사용자 수정 요청 데이터
- `UserListFilter`: 사용자 목록 필터 조건

## 🔗 관련 문서

- [아키텍처 가이드](../../../CLAUDE.md)
- [Task 2 가이드](../../../tasks/task2.md)
- [전체 프로젝트 README](../../../README.md)