# Order Domain

## 📋 Overview
Order 도메인의 비즈니스 로직과 UI 컴포넌트를 관리합니다.

## 📁 Structure
- `api/` - Order 관련 API 호출
- `components/` - Order UI 컴포넌트
- `hooks/` - Order 비즈니스 로직 훅
- `store/` - Order 상태 관리
- `types/` - Order 타입 정의
- `utils/` - Order 유틸리티 (내부 사용)
- `constants/` - Order 상수 (내부 사용)

## 🔌 Public API
```typescript
import { 
  OrderCard, 
  OrderList,
  OrderForm,
  useOrder,
  useOrderActions,
  useOrderList
} from '@/domain/order'

// 타입 import
import type { Order } from '@/domain/order'
```

## 📐 Rules
- ✅ 외부에서는 `index.ts`를 통해서만 import
- ✅ 다른 도메인과 직접적인 의존성 금지
- ✅ 비즈니스 로직은 hooks에 캡슐화
- ❌ 내부 구현(store, utils, constants) 직접 접근 금지

## 🧪 Testing
```bash
# 도메인별 테스트 실행
npm run test -- src/domain/order

# 커버리지 확인
npm run test:coverage -- src/domain/order
```

## 🔄 Dependencies
```
Order Domain
├── depends on: shared, services, global, common
├── provides to: feature, routes
└── forbidden: other domains (user, product, etc.)
```
