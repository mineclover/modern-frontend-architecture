# 🤖 Claude 아키텍처 가이드

**Claude가 설계한 Modern Frontend Architecture 사용법**

## 📖 어디부터 읽어야 할까요?

### 🚀 **빠른 시작 (5분)**
처음 보시는 분이라면 이 순서대로 읽어보세요:

1. **[README.md](./README.md)** - 전체 개요와 핵심 개념 이해
2. **[폴더 구조 둘러보기](#-폴더-구조-이해하기)** - src 디렉토리 구조 파악
3. **[첫 번째 명령어 실행](#-첫-번째-명령어)** - 실제 동작 확인

### 🏗️ **실무 적용 (30분)**
바로 프로젝트에 적용하고 싶다면:

1. **[Task 1 가이드](./tasks/task1.md)** - 기반 인프라 구축 방법
2. **[새 도메인 생성 실습](#-새-도메인-생성-실습)** - 실제 도메인 만들어보기
3. **[아키텍처 검증](#-아키텍처-검증-방법)** - 규칙 준수 확인

### 🎓 **완전한 이해 (1-2시간)**
아키텍처를 완전히 이해하고 싶다면:

1. **모든 Task 파일 순서대로 읽기**: [Task 1](./tasks/task1.md) → [Task 2](./tasks/task2.md) → [Task 3](./tasks/task3.md)
2. **스크립트 동작 이해**: [scripts 폴더](./scripts/) 파일들 살펴보기
3. **설정 파일 분석**: ESLint, TypeScript, Vite 설정 이해

---

## 🛠️ 어떻게 작업하면 될까요?

### 🎯 **첫 번째 명령어**

```bash
# 1. 프로젝트 디렉토리로 이동
cd /Users/junwoobang/mcp/modern-frontend-architecture

# 2. 의존성 설치 (Node.js 18+ 필요)
npm install

# 3. 아키텍처 검증 (현재는 빈 구조이므로 통과됨)
npm run arch:check

# 4. 스크립트 권한 확인
ls -la scripts/create-domain.sh
# -rwxr-xr-x 권한이 있어야 함

# 5. 개발 서버 시작 (아직 구현이 없으므로 에러 날 수 있음)
# npm run dev
```

### 🏢 **새 도메인 생성 실습**

```bash
# 1. Payment 도메인 생성
./scripts/create-domain.sh payment

# 2. 생성된 구조 확인
tree src/domain/payment

# 3. 도메인 구조 검증
npm run domain:validate

# 4. 생성된 파일들 살펴보기
cat src/domain/payment/README.md
cat src/domain/payment/index.ts
```

**생성되는 것들:**
- 📁 완전한 도메인 폴더 구조
- 📄 README.md (도메인 사용법)
- 📄 index.ts (Public API 정의)
- 📄 각 하위 폴더의 index.ts 파일들

### 🔍 **아키텍처 검증 방법**

```bash
# 1. 의존성 방향 검증
npm run arch:check
# ✅ 올바른 의존성 방향 확인
# ❌ 위반 사항 발견 시 상세 리포트

# 2. 도메인 구조 검증
npm run domain:validate
# ✅ 모든 필수 폴더/파일 존재 확인
# ✅ Public API 패턴 준수 확인

# 3. 전체 아키텍처 리포트 생성
npm run arch:report
# 📄 architecture-report.md 생성
# 📄 architecture-report.json 생성

# 4. 품질 메트릭 수집 (구현 후)
npm run generate:quality-report
```

---

## 📋 작업 단계별 가이드

### 🌟 **Phase 1: 기본 이해 (1일)**

#### Step 1: 구조 파악
```bash
# 전체 구조 보기
tree src -L 2

# 각 레이어의 역할 이해
cat src/common/.gitkeep
cat src/global/.gitkeep
cat src/services/.gitkeep
cat src/shared/.gitkeep
cat src/domain/.gitkeep
cat src/feature/.gitkeep
cat src/routes/.gitkeep
```

#### Step 2: 의존성 규칙 이해
```bash
# ESLint 규칙 확인
cat .eslintrc.cjs

# TypeScript 설정 확인
cat tsconfig.json

# 의존성 방향 이해:
# common ← global ← services ← shared ← domain ← feature ← routes
```

#### Step 3: 실제 도메인 생성
```bash
# User 도메인 생성
./scripts/create-domain.sh user

# Product 도메인 생성  
./scripts/create-domain.sh product

# 생성된 구조 비교
diff src/domain/user src/domain/product
```

### 🏗️ **Phase 2: 실제 구현 (1-2주)**

#### Step 1: 첫 번째 도메인 구현
```bash
# User 도메인부터 시작 (Task 2 가이드 참조)
cat tasks/task2.md

# 구현 순서:
# 1. types 정의
# 2. api 구현  
# 3. store/queries 구현
# 4. hooks 구현
# 5. components 구현
# 6. Public API 노출 (index.ts)
```

#### Step 2: 지속적 검증
```bash
# 매번 구현 후 검증
npm run arch:check
npm run domain:validate
npm run type-check
npm run lint
```

#### Step 3: 테스트 작성
```bash
# 도메인별 테스트
npm run test src/domain/user
npm run test:coverage
```

### 🚀 **Phase 3: 고도화 (2-3주)**

#### Task 3, 4 가이드 따라하기
```bash
# 상세 가이드 확인
cat tasks/task3.md
cat tasks/task4.md

# Feature 시스템 구축
# 성능 최적화
# 모니터링 시스템 구축
```

---

## 🎯 실무 적용 시나리오

### 🏢 **기존 프로젝트에 적용하는 경우**

#### 1단계: 점진적 마이그레이션 준비
```bash
# 1. 새 브랜치 생성
git checkout -b feature/architecture-migration

# 2. 이 구조를 기존 프로젝트에 복사
cp -r /Users/junwoobang/mcp/modern-frontend-architecture/src ./src-new
cp -r /Users/junwoobang/mcp/modern-frontend-architecture/scripts ./
cp /Users/junwoobang/mcp/modern-frontend-architecture/.eslintrc.cjs ./
cp /Users/junwoobang/mcp/modern-frontend-architecture/tsconfig.json ./

# 3. 기존 코드는 src-old로 백업
mv src src-old
mv src-new src
```

#### 2단계: 한 번에 하나씩 마이그레이션
```bash
# Task 2 가이드에 따라 User 도메인부터 시작
# 기존 components/User/* → src/domain/user/components/
# 기존 hooks/useUser.ts → src/domain/user/hooks/
# 기존 api/userApi.ts → src/domain/user/api/
```

### 🆕 **새 프로젝트에 적용하는 경우**

#### 1단계: 이 구조를 베이스로 시작
```bash
# 1. 이 구조를 새 프로젝트로 복사
cp -r /Users/junwoobang/mcp/modern-frontend-architecture /path/to/new-project

# 2. 프로젝트 정보 수정
cd /path/to/new-project
# package.json에서 name, description 등 수정

# 3. 첫 도메인부터 구현 시작
./scripts/create-domain.sh auth
./scripts/create-domain.sh dashboard
```

#### 2단계: 핵심 기능부터 구현
```bash
# 인증부터 시작 (가장 기본)
# 1. src/domain/auth 구현
# 2. src/services/auth 구현  
# 3. src/global/providers 구현
# 4. src/routes/auth 구현
```

---

## 🚨 주의사항 및 팁

### ⚠️ **반드시 지켜야 할 규칙**

1. **의존성 방향 절대 준수**
   ```bash
   # 매번 이 명령어로 확인
   npm run arch:check
   ```

2. **Public API 패턴 준수**
   ```typescript
   // ❌ 금지: 내부 구현 직접 접근
   import { UserCard } from '@/domain/user/components/UserCard'
   
   // ✅ 올바름: Public API 사용
   import { UserCard } from '@/domain/user'
   ```

3. **도메인 간 직접 의존성 금지**
   ```typescript
   // ❌ 금지: 다른 도메인 직접 import
   import { Product } from '@/domain/product' // in user domain
   
   // ✅ 올바름: shared 타입 사용 또는 API 호출
   import { ProductReference } from '@/shared/types'
   ```

### 💡 **개발 효율성 팁**

1. **스크립트 활용**
   ```bash
   # 새 도메인은 항상 스크립트로 생성
   ./scripts/create-domain.sh order
   
   # 정기적 검증
   npm run arch:check
   npm run domain:validate
   ```

2. **IDE 설정**
   ```json
   // VSCode settings.json
   {
     "typescript.preferences.includePackageJsonAutoImports": "auto",
     "typescript.suggest.autoImports": true,
     "eslint.validate": ["typescript", "typescriptreact"]
   }
   ```

3. **Git Hook 활용**
   ```bash
   # Pre-commit에서 자동 검증
   # 이미 설정되어 있음
   cat package.json | grep "pre-commit"
   ```

### 🐛 **자주 하는 실수**

1. **의존성 방향 위반**
   ```bash
   # 이런 에러가 나면:
   # ❌ domain → routes import detected
   
   # 해결: 코드를 올바른 레이어로 이동
   ```

2. **내부 구현 직접 접근**
   ```bash
   # 이런 에러가 나면:
   # ❌ Direct internal access detected
   
   # 해결: Public API 사용
   ```

3. **순환 의존성**
   ```bash
   # 감지 명령어
   npm run analyze:circular
   
   # 해결: 공통 모듈로 분리
   ```

---

## 📞 도움이 필요할 때

### 🔍 **문제 진단 순서**

1. **아키텍처 검증**
   ```bash
   npm run arch:check
   npm run domain:validate
   ```

2. **타입 검증**
   ```bash
   npm run type-check
   ```

3. **린팅 검증**
   ```bash
   npm run lint
   ```

4. **상세 리포트 확인**
   ```bash
   npm run arch:report
   cat architecture-report.md
   ```

### 📚 **추가 학습 자료**

- **도메인 주도 설계(DDD)** 개념 학습
- **레이어드 아키텍처** 패턴 이해
- **마이크로 프론트엔드** 아키텍처 개념
- **React Query** 상태 관리 패턴
- **ESLint 커스텀 규칙** 작성법

### 🎯 **성공 체크리스트**

- [ ] `npm run arch:check` 통과
- [ ] `npm run domain:validate` 통과  
- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 통과
- [ ] 새 도메인을 스크립트로 생성할 수 있음
- [ ] Public API 패턴을 이해하고 적용할 수 있음
- [ ] 의존성 방향 규칙을 지킬 수 있음

---

## 🚀 다음 단계

이제 여러분은 Claude가 설계한 **현대적이고 확장 가능한 프론트엔드 아키텍처**를 완전히 이해하고 사용할 수 있습니다!

**Happy Coding! 🎉**

---

*💡 이 가이드에 대한 개선사항이나 질문이 있다면 이슈를 남겨주세요.*