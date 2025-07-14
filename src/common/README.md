# 📁 Common Layer

**최하위 기반 레이어 - 모든 레이어에서 사용 가능한 순수 유틸리티**

## 🎯 역할과 책임

Common 레이어는 아키텍처의 **최하위 기반 레이어**로, 다음과 같은 역할을 담당합니다:

- **순수 JavaScript/TypeScript 유틸리티 함수** 제공
- **프레임워크 독립적인 헬퍼 함수** 제공
- **기본 타입 정의와 상수** 제공
- **프로젝트 전반에서 재사용 가능한 도구** 제공

## 📦 포함되는 내용

### `/types`
```typescript
// 프레임워크 독립적인 기본 타입들
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export type SortOrder = 'asc' | 'desc';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

### `/utils`
```typescript
// 순수 함수들 (외부 의존성 없음)
export const arrayTool = {
  unique: <T>(arr: T[]): T[] => [...new Set(arr)],
  groupBy: <T>(arr: T[], key: keyof T) => { /* ... */ }
};

export const formatters = {
  currency: (amount: number) => `$${amount.toFixed(2)}`,
  date: (date: Date) => date.toISOString().split('T')[0]
};
```

### `/constants`
```typescript
// 애플리케이션 전반에서 사용하는 상수들
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8
} as const;
```

### `/react` (React 관련 공통 유틸리티)
```typescript
// React 전용 커스텀 훅들 (하지만 도메인 로직 없음)
export const useDebounce = <T>(value: T, delay: number): T => {
  // 디바운스 로직
};

export const useResize = () => {
  // 윈도우 리사이즈 감지 로직
};
```

## 🔒 의존성 규칙

### ✅ 허용되는 의존성
- **내부 모듈**: `common` 내의 다른 모듈
- **외부 라이브러리**: `lodash`, `date-fns` 등 순수 유틸리티 라이브러리
- **React**: React 관련 유틸리티의 경우에만

### ❌ 금지되는 의존성
- **상위 레이어**: `global`, `services`, `shared`, `domain`, `feature`, `routes`
- **도메인 로직**: 비즈니스 로직이나 도메인 특화 코드
- **HTTP 클라이언트**: API 호출 관련 코드
- **상태 관리**: Redux, Zustand 등

## 🏗️ 폴더 구조

```
src/common/
├── index.ts              # Public API 정의
├── README.md            # 이 문서
├── types/
│   ├── index.ts         # 기본 타입들 export
│   └── common.ts        # 공통 타입 정의
├── utils/
│   ├── index.ts         # 유틸리티 함수들 export
│   ├── arrayTool.ts     # 배열 관련 도구
│   ├── stringTool.ts    # 문자열 관련 도구
│   └── validationTool.ts # 검증 관련 도구
├── constants/
│   ├── index.ts         # 상수들 export
│   ├── httpStatus.ts    # HTTP 상태 코드
│   └── validation.ts    # 검증 규칙
└── react/               # React 전용 유틸리티
    ├── useDebounce.ts   # 디바운스 훅
    ├── useResize.ts     # 리사이즈 훅
    └── useDebounceEffect.ts # 디바운스 이펙트 훅
```

## 📝 사용 예시

### 다른 레이어에서 사용
```typescript
// ✅ 모든 레이어에서 사용 가능
import { arrayTool, HTTP_STATUS, ApiResponse } from '@/common';

// services layer에서 사용
const processUserData = (users: User[]): User[] => {
  return arrayTool.unique(users);
};

// domain layer에서 사용
const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_REGEX.test(email);
};
```

### Public API 패턴
```typescript
// src/common/index.ts
export * from './types';
export * from './utils';
export * from './constants';
export * from './react';

// 사용하는 곳에서
import { arrayTool, useDebounce, HTTP_STATUS } from '@/common';
```

## ⚠️ 주의사항

### 금지사항
1. **도메인 로직 포함 금지**
   ```typescript
   // ❌ 금지: 도메인 특화 로직
   export const calculateUserDiscount = (user: User) => { /* ... */ }
   
   // ✅ 올바름: 범용 계산 함수
   export const calculatePercentage = (value: number, total: number) => { /* ... */ }
   ```

2. **상위 레이어 import 금지**
   ```typescript
   // ❌ 금지
   import { UserService } from '@/services/user';
   import { useUserStore } from '@/shared/store';
   
   // ✅ 올바름
   import { debounce } from 'lodash';
   ```

3. **부작용 있는 코드 금지**
   ```typescript
   // ❌ 금지: API 호출, 로컬스토리지 접근 등
   export const fetchData = () => fetch('/api/data');
   
   // ✅ 올바름: 순수 함수
   export const formatData = (data: any[]) => data.map(item => ({ ...item }));
   ```

## 🧪 테스트 가이드

### 테스트 작성 원칙
```typescript
// arrayTool.test.ts
describe('arrayTool', () => {
  describe('unique', () => {
    it('should remove duplicate values', () => {
      const input = [1, 2, 2, 3, 3, 3];
      const expected = [1, 2, 3];
      expect(arrayTool.unique(input)).toEqual(expected);
    });
  });
});
```

### 테스트 실행
```bash
# Common 레이어만 테스트
npm run test src/common

# 특정 파일 테스트
npm run test src/common/utils/arrayTool.test.ts
```

## 📈 품질 지표

- **테스트 커버리지**: 90% 이상 유지
- **순수 함수 비율**: 100% (부작용 없는 함수만)
- **의존성 개수**: 최소한으로 유지
- **번들 크기**: 경량 유지 (트리 셰이킹 최적화)

이 레이어는 전체 아키텍처의 **안정적인 기반**을 제공합니다. 변경 시에는 전체 애플리케이션에 영향을 줄 수 있으므로 신중하게 접근해야 합니다.