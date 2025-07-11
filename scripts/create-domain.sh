#!/bin/bash

# 새 도메인 생성 스크립트
# 사용법: ./create-domain.sh <domain-name>

DOMAIN_NAME=$1

if [ -z "$DOMAIN_NAME" ]; then
  echo "❌ Error: Domain name is required"
  echo "Usage: ./create-domain.sh <domain-name>"
  exit 1
fi

DOMAIN_DIR="src/domain/$DOMAIN_NAME"

# 도메인 폴더 구조 생성
echo "📁 Creating domain folder structure..."
mkdir -p "$DOMAIN_DIR"/{api,components,hooks,store,types,utils,constants}

# index.ts 파일들 생성
echo "📝 Creating index files..."

cat > "$DOMAIN_DIR/index.ts" << EOF
// 👇 Public API - 외부에 노출할 것만 export
export * from './components'
export * from './hooks'
export * from './api'
export type * from './types'

// 🚨 내부 구현은 절대 노출하지 않음
// ❌ export { ${DOMAIN_NAME}Store } from './store'
// ❌ export { ${DOMAIN_NAME}Utils } from './utils'
EOF

cat > "$DOMAIN_DIR/api/index.ts" << EOF
export * from './${DOMAIN_NAME}Api'
EOF

cat > "$DOMAIN_DIR/components/index.ts" << EOF
export * from './${DOMAIN_NAME}Card'
export * from './${DOMAIN_NAME}List'
export * from './${DOMAIN_NAME}Form'
EOF

cat > "$DOMAIN_DIR/hooks/index.ts" << EOF
export * from './use${DOMAIN_NAME^}'
export * from './use${DOMAIN_NAME^}Actions'
export * from './use${DOMAIN_NAME^}List'
EOF

cat > "$DOMAIN_DIR/store/index.ts" << EOF
export * from './${DOMAIN_NAME}Queries'
// 내부 구현은 노출하지 않음
// export { ${DOMAIN_NAME}Slice } from './${DOMAIN_NAME}Slice'
EOF

cat > "$DOMAIN_DIR/types/index.ts" << EOF
export type * from './${DOMAIN_NAME}'
EOF

cat > "$DOMAIN_DIR/utils/index.ts" << EOF
// 내부 유틸리티는 도메인 내부에서만 사용
EOF

cat > "$DOMAIN_DIR/constants/index.ts" << EOF
// 내부 상수는 도메인 내부에서만 사용
EOF

# .gitkeep 파일 생성
echo "🔒 Creating .gitkeep files..."
echo "# ${DOMAIN_NAME^} 도메인" > "$DOMAIN_DIR/.gitkeep"
echo "# ${DOMAIN_NAME^} API 호출" > "$DOMAIN_DIR/api/.gitkeep"
echo "# ${DOMAIN_NAME^} UI 컴포넌트" > "$DOMAIN_DIR/components/.gitkeep"
echo "# ${DOMAIN_NAME^} 비즈니스 로직 훅" > "$DOMAIN_DIR/hooks/.gitkeep"
echo "# ${DOMAIN_NAME^} 상태 관리" > "$DOMAIN_DIR/store/.gitkeep"
echo "# ${DOMAIN_NAME^} 타입 정의" > "$DOMAIN_DIR/types/.gitkeep"
echo "# ${DOMAIN_NAME^} 유틸리티" > "$DOMAIN_DIR/utils/.gitkeep"
echo "# ${DOMAIN_NAME^} 상수" > "$DOMAIN_DIR/constants/.gitkeep"

# README 생성
cat > "$DOMAIN_DIR/README.md" << EOF
# ${DOMAIN_NAME^} Domain

## 📋 Overview
${DOMAIN_NAME^} 도메인의 비즈니스 로직과 UI 컴포넌트를 관리합니다.

## 📁 Structure
- \`api/\` - ${DOMAIN_NAME^} 관련 API 호출
- \`components/\` - ${DOMAIN_NAME^} UI 컴포넌트
- \`hooks/\` - ${DOMAIN_NAME^} 비즈니스 로직 훅
- \`store/\` - ${DOMAIN_NAME^} 상태 관리
- \`types/\` - ${DOMAIN_NAME^} 타입 정의
- \`utils/\` - ${DOMAIN_NAME^} 유틸리티 (내부 사용)
- \`constants/\` - ${DOMAIN_NAME^} 상수 (내부 사용)

## 🔌 Public API
\`\`\`typescript
import { 
  ${DOMAIN_NAME^}Card, 
  ${DOMAIN_NAME^}List,
  ${DOMAIN_NAME^}Form,
  use${DOMAIN_NAME^},
  use${DOMAIN_NAME^}Actions,
  use${DOMAIN_NAME^}List
} from '@/domain/${DOMAIN_NAME}'

// 타입 import
import type { ${DOMAIN_NAME^} } from '@/domain/${DOMAIN_NAME}'
\`\`\`

## 📐 Rules
- ✅ 외부에서는 \`index.ts\`를 통해서만 import
- ✅ 다른 도메인과 직접적인 의존성 금지
- ✅ 비즈니스 로직은 hooks에 캡슐화
- ❌ 내부 구현(store, utils, constants) 직접 접근 금지

## 🧪 Testing
\`\`\`bash
# 도메인별 테스트 실행
npm run test -- src/domain/${DOMAIN_NAME}

# 커버리지 확인
npm run test:coverage -- src/domain/${DOMAIN_NAME}
\`\`\`

## 🔄 Dependencies
\`\`\`
${DOMAIN_NAME^} Domain
├── depends on: shared, services, global, common
├── provides to: feature, routes
└── forbidden: other domains (user, product, etc.)
\`\`\`
EOF

echo "✅ Domain '${DOMAIN_NAME}' created successfully!"
echo "📁 Location: ${DOMAIN_DIR}"
echo ""
echo "🚀 Next steps:"
echo "1. Implement ${DOMAIN_NAME}Api.ts in api/ folder"
echo "2. Create ${DOMAIN_NAME^}Card.tsx component"
echo "3. Implement use${DOMAIN_NAME^}.ts hook"
echo "4. Define ${DOMAIN_NAME^} types"
echo "5. Update main domain index.ts if needed"