# Task 1: 기반 인프라 구축

**기간**: 1-2주  
**담당**: 시니어 개발자 + 아키텍처 리드  
**목표**: 새로운 아키텍처의 기반이 되는 폴더 구조와 개발 도구 구축

## 🎯 핵심 목표

- ✅ 새로운 폴더 구조 완성
- ✅ 개발 도구 및 린팅 규칙 설정
- ✅ 기본 인프라 코드 작성
- ✅ 팀 가이드라인 문서화

## 📋 상세 작업 목록

### 1. 폴더 구조 생성 (1-2일)

#### 1.1 메인 폴더 구조
- [ ] `/src/common` - 프로젝트 독립적 라이브러리
- [ ] `/src/global` - 전역 시스템 관리
- [ ] `/src/services` - 외부 서비스 통합
- [ ] `/src/shared` - 프로젝트 내 공유 자원
- [ ] `/src/domain` - 비즈니스 도메인 (핵심)
- [ ] `/src/feature` - 기능 관리 시스템
- [ ] `/src/routes` - 라우팅 및 페이지 조합 (pages → routes 변경)
- [ ] `/src/types` - 전역 타입 정의

#### 1.2 각 폴더 하위 구조
```bash
# Common 폴더
├── utils/          # 범용 유틸리티
├── constants/      # 프로젝트 독립적 상수
├── types/         # 기본 타입 정의
└── index.ts       # Public API

# Global 폴더  
├── config/        # 환경 변수, 앱 설정
├── store/         # 루트 스토어
├── providers/     # 전역 프로바이더
└── index.ts

# Services 폴더
├── http/          # HTTP 클라이언트
├── auth/          # 인증 서비스
├── storage/       # 스토리지 서비스
├── notification/  # 알림 서비스
└── index.ts

# Shared 폴더
├── components/    # 공통 컴포넌트
│   ├── ui/       # 기본 UI 컴포넌트
│   └── layout/   # 레이아웃 컴포넌트
├── hooks/         # 공통 훅
├── constants/     # 프로젝트 내 상수
└── index.ts
```

### 2. 개발 도구 설정 (2-3일)

#### 2.1 TypeScript 설정
- [ ] `tsconfig.json` Path Mapping 설정
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/common/*": ["src/common/*"],
      "@/global/*": ["src/global/*"],
      "@/services/*": ["src/services/*"],
      "@/shared/*": ["src/shared/*"],
      "@/domain/*": ["src/domain/*"],
      "@/feature/*": ["src/feature/*"],
      "@/routes/*": ["src/routes/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

#### 2.2 ESLint 의존성 규칙
- [ ] `.eslintrc.architecture.js` 생성
- [ ] 의존성 방향 규칙 설정 (common ← global ← services ← shared ← domain ← feature ← routes)
- [ ] Public API 접근 규칙 설정
- [ ] 도메인 간 직접 의존성 금지 규칙

#### 2.3 자동화 스크립트
- [ ] `scripts/check-dependencies.js` - 의존성 검증
- [ ] `scripts/create-domain.sh` - 도메인 생성 자동화
- [ ] `scripts/validate-domains.js` - 도메인 구조 검증
- [ ] `scripts/generate-architecture-report.js` - 리포트 생성

#### 2.4 Git Hooks 설정
- [ ] `husky` 설치 및 설정
- [ ] Pre-commit hook: 린팅 + 아키텍처 검증
- [ ] Pre-push hook: 전체 테스트 + 아키텍처 리포트

### 3. 기본 인프라 코드 작성 (3-4일)

#### 3.1 Common 레이어
- [ ] `src/common/utils/date.ts` - 날짜 유틸리티
- [ ] `src/common/utils/string.ts` - 문자열 처리
- [ ] `src/common/utils/validation.ts` - 검증 로직
- [ ] `src/common/constants/errors.ts` - 에러 코드
- [ ] `src/common/types/base.ts` - 기본 타입
- [ ] `src/common/types/api.ts` - API 응답 타입

#### 3.2 Global 레이어
- [ ] `src/global/config/env.ts` - 환경 변수 관리
- [ ] `src/global/config/app.ts` - 앱 설정
- [ ] `src/global/store/root.ts` - 루트 스토어 (Redux/Zustand)
- [ ] `src/global/providers/QueryProvider.tsx` - React Query
- [ ] `src/global/providers/ThemeProvider.tsx` - 테마 관리

#### 3.3 Services 레이어
- [ ] `src/services/http/client.ts` - Axios/Fetch 기반 HTTP 클라이언트
- [ ] `src/services/http/interceptors.ts` - 요청/응답 인터셉터
- [ ] `src/services/auth/authService.ts` - 인증 서비스
- [ ] `src/services/auth/tokenManager.ts` - 토큰 관리
- [ ] `src/services/storage/localStorage.ts` - 로컬 스토리지 래퍼
- [ ] `src/services/notification/toastService.ts` - 토스트 알림

#### 3.4 Shared 레이어
- [ ] `src/shared/components/ui/Button.tsx` - 기본 버튼
- [ ] `src/shared/components/ui/Input.tsx` - 기본 입력
- [ ] `src/shared/components/ui/Modal.tsx` - 모달
- [ ] `src/shared/components/layout/Header.tsx` - 헤더
- [ ] `src/shared/hooks/useLocalStorage.ts` - 로컬스토리지 훅
- [ ] `src/shared/hooks/useDebounce.ts` - 디바운스 훅

### 4. 문서화 (1-2일)

#### 4.1 아키텍처 가이드
- [ ] `docs/architecture-guide.md` - 전체 아키텍처 개요
- [ ] `docs/folder-structure.md` - 폴더 구조 상세 설명
- [ ] `docs/dependency-rules.md` - 의존성 규칙

#### 4.2 개발 가이드
- [ ] `docs/development-guide.md` - 개발 워크플로우
- [ ] `docs/domain-creation.md` - 새 도메인 생성 가이드
- [ ] `docs/public-api-guide.md` - Public API 패턴 가이드

#### 4.3 팀 컨벤션
- [ ] `docs/team-conventions.md` - 팀 개발 규칙
- [ ] `docs/code-review-checklist.md` - 코드 리뷰 체크리스트
- [ ] `docs/troubleshooting.md` - 문제 해결 가이드

## 🚨 주의사항

### 기존 코드 보존
- ⚠️ 기존 코드는 절대 삭제하지 않음
- ⚠️ 새로운 구조만 구축하고 기존과 병행 운영
- ⚠️ 모든 변경사항은 별도 브랜치에서 작업

### 팀 협의
- 📋 폴더 구조 확정 전 팀 리뷰 필수
- 📋 의존성 규칙에 대한 팀 합의
- 📋 네이밍 컨벤션 결정

### 성능 고려
- ⚡ 초기 번들 크기 영향 최소화
- ⚡ 트리 쉐이킹 고려한 구조 설계
- ⚡ 코드 스플리팅 준비

## 📊 완료 기준

### 기술적 완료 조건
- [ ] 모든 기본 폴더 구조 완성
- [ ] ESLint 규칙이 정상 동작
- [ ] TypeScript 컴파일 에러 없음
- [ ] 도메인 생성 스크립트 정상 동작
- [ ] 의존성 검증 스크립트 테스트 통과

### 문서화 완료 조건
- [ ] 모든 가이드 문서 작성 완료
- [ ] 팀 리뷰 및 승인 완료
- [ ] README.md 업데이트

### 팀 준비도 확인
- [ ] 팀원 교육 계획 수립
- [ ] 다음 단계 일정 확정
- [ ] 리스크 요소 식별 및 대응 방안 마련

## 🎯 다음 단계 준비

### Task 2 준비사항
- 📋 마이그레이션할 첫 번째 도메인 선정 (추천: User 도메인)
- 📋 기존 코드 의존성 분석
- 📋 점진적 마이그레이션 전략 수립

### 성공 지표
- ✅ 새로운 구조에서 간단한 컴포넌트 생성 테스트
- ✅ 의존성 규칙 위반 없이 import 가능
- ✅ 팀원 모두가 새로운 구조 이해

## 📞 지원 및 문의

- **아키텍처 문의**: 시니어 개발자
- **기술적 이슈**: 개발팀 리드
- **일정 조율**: 프로젝트 매니저

---

**⚡ 다음 Task**: [Task 2: 핵심 도메인 마이그레이션](./task2.md)