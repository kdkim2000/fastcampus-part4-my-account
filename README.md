# FastCampus — Next.js 실전 프로젝트(Part4: My Account)

> **목적:** 이 문서는 FastCampus 강의(기초 → 중급 → 고급)를 수강하며 본 프로젝트(`part4_my_account`)를 실습용 교재로 활용하기 위해 작성된 종합 가이드입니다. 이 교재는 이론적 배경부터 코드 분석, 실습 과제, 심화 리팩토링/마이그레이션 제안까지 포함합니다.

---

## 목차

1. 소개 및 학습 목표
2. 사전 요구사항(환경)
3. 프로젝트 빠르게 시작하기
4. 프로젝트 구조(상세)
5. Next.js 기초 이론(핵심 개념 정리)
6. 본 프로젝트에서 쓰인 주요 라이브러리와 패턴
7. 코드 심층 분석(핵심 파일/기능별)
8. 인증(Auth) 흐름 분석(next-auth / firebase 관련)
9. 상태관리와 데이터 패칭(react-query 등)
10. 스타일링(Emotion)과 UI 구성
11. 시각화(@visx)와 애니메이션(Framer Motion)
12. 성능 최적화 & 배포
13. 테스트, 디버깅, 린트 규칙
14. 마이그레이션 가이드 (Pages Router → App Router)
15. 실습 과제(레벨별)
16. 자주 발생하는 문제와 해결법
17. 참고자료

---

## 1) 소개 및 학습 목표

이 교재의 목표는 다음과 같습니다.

* Next.js의 핵심 개념(라우팅, 데이터 패칭, 렌더링 전략)을 이해한다.
* 실제 프로젝트(`part4_my_account`)의 코드 구조를 통해 실무 패턴을 학습한다.
* `next-auth`와 `firebase`를 이용한 인증 흐름을 분석하고 응용할 수 있다.
* React 에코시스템(react-query, react-hook-form, emotion, framer-motion 등)을 통합하여 사용하는 법을 익힌다.
* 프로젝트를 최신 Next.js(13+) 환경에 맞게 리팩토링할 때의 고려사항을 학습한다.

학습 대상: Next.js 기본 문법을 알고 있는 자(React 기초 지식 필요).

---

## 2) 사전 요구사항(환경)

* Node.js LTS (추천: 18.x 또는 20.x)
* Yarn 4 (프로젝트 `packageManager`는 `yarn@4.10.3`) 또는 npm 사용 가능
* TypeScript 기초(인터페이스, 타입 유닛)
* Git
* Vercel 계정(배포 실습 시)

**프로젝트에 포함된 주요 dev/dependency 주목사항**

* Next.js: `13.4.19` (Pages Router 기반으로 구현됨)
* TypeScript: `4.9.5`
* ESLint / Prettier 설정이 포함되어 있으므로 코드 스타일 엄수

> 참고: 개발환경의 Node/Yarn 버전이 맞지 않으면 의존성 해석 오류가 발생합니다. 로컬 환경과 동일한 Yarn 버전을 사용하는 것이 가장 안전합니다.

---

## 3) 프로젝트 빠르게 시작하기

### 1) 압축 해제 및 의존성 설치

```bash
# 압축 해제된 프로젝트 폴더로 이동
cd fastcampus-part4-my-account

# yarn berry (v4) recommended
yarn install

# 개발서버 시작
yarn dev
```

> 만약 `yarn` 대신 `npm`을 사용하려면 `package-lock.json`을 활용할 수 있으나, Yarn v4 특유의 플러그인/설정(`.yarnrc.yml`, `.pnp.cjs`)이 있으니 가능하면 Yarn 사용 권장.

### 2) 환경 변수

프로젝트에서 Firebase, OAuth(NextAuth), API 키 등을 사용한다면 `.env` 파일을 루트에 생성해야 합니다. 예시:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

> 실제 키 값은 강의자료 또는 Firebase 콘솔에서 발급받으세요.

---

## 4) 프로젝트 구조(상세)

(요약)

```
src/
├─ components/        # 재사용 가능한 UI 컴포넌트
├─ constants/         # 상수 값 (account, card 등)
├─ contexts/          # React Context (Alert 등)
├─ hooks/             # 커스텀 훅 (useAccount, useUser 등)
├─ mock/              # 모의 데이터
├─ models/            # 타입/도메인 모델
└─ pages/             # Next.js Pages Router 기반 라우트
   ├─ _app.tsx
   ├─ _document.tsx
   └─ index.tsx
```

### 핵심 디렉토리 설명

* `src/pages/` : Next.js의 라우팅 엔트리. URL ↔ 파일 관계(파일 기반 라우팅).
* `src/hooks/` : 인증, 데이터 패칭에 대한 추상화. 재사용성 높은 로직은 여기로.
* `src/contexts/` : 전역 상태나 알림 시스템(모달/토스트)을 위한 Context.
* `src/models/` : `account.ts`, `user.ts` 등 도메인 타입 정의 — 타입 안전성을 유지.

---

## 5) Next.js 기초 이론(핵심 개념 정리)

### 5.1 파일 기반 라우팅

* `pages/index.tsx` → `/`
* `pages/faq.tsx` → `/faq`
* 동적 라우팅: `[id].tsx` 같은 파일이 있다면 `/123` 경로로 매핑

### 5.2 렌더링 전략

* **SSR (Server Side Rendering)**: `getServerSideProps` 사용 — 요청 시 서버에서 HTML 생성.
* **SSG (Static Site Generation)**: `getStaticProps` / `getStaticPaths` 사용 — 빌드 시 정적 페이지 생성.
* **CSR (Client Side Rendering)**: React에서 클라이언트가 데이터를 가져와 렌더링.
* **ISR (Incremental Static Regeneration)**: `revalidate` 옵션을 사용하여 빌드 후에도 재생성.

> 본 프로젝트는 Pages Router를 기반으로 하므로 `getServerSideProps`/`getStaticProps`가 사용될 가능성이 큽니다. 다만 react-query 등 클라이언트 패칭을 많이 활용하면 CSR 방식이 많습니다.

### 5.3 API Routes

* `pages/api/*` 경로 안의 파일은 서버리스 함수(API 엔드포인트)로 동작합니다.
* 예: `pages/api/auth/...` 또는 `pages/api/hello.ts` 형태.

### 5.4 커스텀 App과 Document

* `_app.tsx` : 페이지 전환 시 공통 레이아웃, 전역 스타일, Context Provider를 감싼다.
* `_document.tsx` : 서버사이드에서 렌더되는 HTML 템플릿을 커스터마이징.

---

## 6) 본 프로젝트에서 쓰인 주요 라이브러리와 패턴

### 6.1 next-auth

* 인증 흐름을 간단히 처리하는 라이브러리. 여러 프로바이더(Google, GitHub, Credentials) 지원.
* `pages/api/auth/[...nextauth].ts` 에 설정이 위치하는 게 일반적.

### 6.2 firebase

* 실시간 DB, 인증, 스토리지 등. 프로젝트에서는 인증 및 데이터 저장에 사용될 가능성 높음.
* `firebase.initializeApp()` 또는 modular SDK(`initializeApp`, `getAuth`) 형태를 확인.

### 6.3 react-query (now TanStack Query)

* 서버 상태(데이터 페칭/캐싱/동기화)에 강력. `useQuery`, `useMutation` 주요 훅.
* SSR/SSG와 함께 사용하려면 `Hydration` 전략 필요.

### 6.4 react-hook-form

* 폼 상태 관리를 간단하게. 성능 최적화에 유리.

### 6.5 emotion (CSS-in-JS)

* 스타일을 컴포넌트 단위로 작성.
* SSR 시 `_document.tsx`에서 스타일 스트립핑이 필요할 수 있음.

### 6.6 @visx

* 데이터 시각화 라이브러리(경량). 차트 컴포넌트에 활용.

### 6.7 framer-motion

* 컴포넌트 애니메이션. 페이지 전환이나 UI 상호작용에 사용.

### 6.8 swiper

* 슬라이더 구현(이미지/카드 캐러셀 등).

---

## 7) 코드 심층 분석(핵심 파일/기능별)

> 아래 섹션에서는 프로젝트 내에서 실제로 존재하는 파일명(예: `hooks/useAccount.ts`, `models/account.ts`)을 참고하여 실제 로직 흐름을 학습하도록 합니다.

### 7.1 `src/pages/_app.tsx`

* 역할: 모든 페이지의 공통 진입점.
* 일반적으로 전역 스타일(Emotion ThemeProvider), 전역 Context(React Query Provider, Auth Provider)를 설정.
* 학습 포인트:

  * Provider 구성순서(예: `SessionProvider` → `QueryClientProvider` → `ThemeProvider`)
  * `getInitialProps` 사용시 서버-클라이언트 동작 차이

### 7.2 `src/pages/_document.tsx`

* 역할: 서버사이드에서 렌더되는 HTML 문서 구조를 정의.
* Emotion 사용 시 critical CSS 삽입을 위해 커스터마이즈 필요.
* 학습 포인트: Emotion SSR extraction, CSP meta 태그 등.

### 7.3 `src/hooks/useUser.ts` & `hooks/withAuth.tsx`

* 역할: 사용자 인증 정보를 가져오고, 보호된 라우트 접근 제어.
* 학습 포인트:

  * 클라이언트에서 세션을 확인하는 패턴
  * HOC(Higher-Order Component)로 보호된 페이지 래핑

### 7.4 `src/models/*.ts`

* 역할: 데이터 타입 정의(`Account`, `User`, `Transaction` 등).
* 학습 포인트: 타입 안전성으로 런타임 오류 예방, API 응답 타입 매핑.

### 7.5 `src/constants/*` 및 `src/mock/*`

* 역할: 상수와 모의 데이터 제공.
* 학습 포인트: 컴포넌트 UI 개발 시 Mock 데이터로 빠르게 작업하는 패턴.

### 7.6 `src/components/*`

* 역할: Button, Card, Layout 등 재사용 UI.
* 학습 포인트: Atomic Design 적용 여부, 스타일 분리 전략.

---

## 8) 인증(Auth) 흐름 분석(next-auth / firebase 관련)

> 실제 파일은 프로젝트 내부에 있으므로 해당 파일을 열어 세부 설정을 확인하세요. 여기서는 일반적인 통합 패턴을 정리합니다.

### 8.1 next-auth + Firebase 통합 패턴

* `next-auth`는 OAuth/Provider 기반 인증에 강점이 있으나 Firebase Authentication과는 별도로 동작합니다. 두 시스템을 함께 쓰려면 다음과 같은 옵션이 있습니다:

  1. **next-auth의 Credentials Provider 사용하여 Firebase 토큰 검증**

     * 사용자가 로그인하면 Firebase에서 인증 토큰을 받아 서버(NextAuth)에서 검증 후 세션 생성.
  2. **Firebase를 프론트엔드 전용으로 사용하고 next-auth는 OAuth로만 사용**

     * 혼용 시 세션 동기화와 토큰 관리가 복잡해질 수 있음.

### 8.2 세션 관리 전략

* `SessionProvider` (next-auth) 또는 `getServerSideProps`로 세션 정보를 서버에서 획득하여 렌더링 시 보호.
* react-query와 결합할 때는 세션을 의존성으로 하여 데이터 패칭을 제어.

### 8.3 보안 주의사항

* `NEXTAUTH_SECRET`을 안전하게 저장
* 쿠키 설정(secure, sameSite)을 환경(개발/프로덕션)에 맞추어 설정

---

## 9) 상태관리와 데이터 패칭(react-query 등)

### 9.1 react-query 기본

* `QueryClient`를 생성하고 `_app.tsx`에서 `QueryClientProvider`로 감싼다.
* `useQuery(key, fetcher)`로 데이터를 가져오고 캐시한다.
* `useMutation`으로 POST/PUT/DELETE 작업 후 `queryClient.invalidateQueries()`로 갱신.

### 9.2 서버 사이드 렌더링과의 결합

* SSR 시 `dehydrate` / `Hydrate`를 사용해 서버에서 가져온 데이터를 클라이언트로 주입.
* 학습 포인트: `getServerSideProps`에서 `QueryClient`로 prefetch 후 `dehydrate`하여 초기 데이터로 전달.

### 9.3 에러 처리와 로딩 UX

* Suspense 또는 상태 기반 로딩 컴포넌트 사용
* `withSuspense.tsx` 같은 HOC를 사용하여 로딩/에러 공통 처리 패턴 구현

---

## 10) 스타일링(Emotion)과 UI 구성

### 10.1 Emotion 사용 패턴

* `@emotion/react`의 `css`나 `styled` 사용
* ThemeProvider로 테마 정의 후 컴포넌트에서 `props.theme` 접근
* SSR을 사용할 경우 `_document.tsx`에 적절한 스타일 추출 로직 필요

### 10.2 Global 스타일 적용

* `Global` 컴포넌트로 CSS reset 및 기본 폰트/컬러 설정

---

## 11) 시각화(@visx)와 애니메이션(Framer Motion)

### 11.1 @visx

* 축, 스케일, 도형(라인/바 등) 조합으로 커스텀 차트를 제작.
* 학습 포인트: 데이터-스케일-레이아웃 변환 흐름 이해.

### 11.2 Framer Motion

* `motion.div` 형태로 감싸기만 하면 쉽게 애니메이션을 추가할 수 있음.
* 페이지 전환 애니메이션 구현 시 `AnimatePresence` 사용.

---

## 12) 성능 최적화 & 배포

### 12.1 성능 최적화 팁

* 이미지 최적화: `next/image` 사용 (프로젝트 구조에 맞게 변환 필요).
* 코드 분할(동적 import): `dynamic(() => import('./Heavy'))`
* 번들 분석: `next build` 후 번들 크기 확인(webpack-bundle-analyzer)
* 불필요한 의존성 제거

### 12.2 배포(Vercel 권장)

* `vercel`에 연결하면 기본적으로 Next.js에 최적화된 빌드가 가능합니다.
* 환경 변수는 Vercel 대시보드에 설정.
* Edge Functions / Serverless 함수를 사용하는 경우 비용/콜드스타트 고려.

---

## 13) 테스트, 디버깅, 린트 규칙

### 13.1 ESLint / Prettier

* `.eslintrc.json`, `.prettierrc`가 제공됨. 커밋 전에 `yarn lint`로 코드 스타일 확인.

### 13.2 디버깅

* `console.log` 외에 React DevTools, Next.js의 Fast Refresh, `next dev` 로그 확인.
* TypeScript 타입 오류로 인한 빌드 오류는 `yarn build`로 재현 가능.

---

## 14) 마이그레이션 가이드 (Pages Router → App Router)

### 14.1 핵심 차이

* App Router는 `app/` 디렉토리 기반으로 React Server Components(RSC) 지원.
* `pages/`의 기존 API Route 형식과 충돌 가능.

### 14.2 마이그레이션 순서(권장)

1. 프로젝트 백업
2. `app/` 디렉토리 생성 후, 핵심 레이아웃(`app/layout.tsx`)으로 이동
3. `_app.tsx` 의존성 정리 (Provider들을 `layout`으로 옮김)
4. 페이지별로 `page.tsx`, `loading.tsx`, `error.tsx` 생성
5. 클라이언트 컴포넌트는 `'use client'` 지시자 추가
6. API Route 유지 필요시 `pages/api` 유지 또는 edge functions로 변환

> 실습 과제 섹션에서 `index.tsx`를 App Router로 옮기는 워크숍을 제안합니다.

---

## 15) 실습 과제(레벨별)

### 초급

* 프로젝트 로컬 실행 및 폴더 구조를 화면 캡처하여 설명하기.
* `components` 폴더에 간단한 Button 컴포넌트 추가하고 스타일링하기.

### 중급

* `useUser` 훅을 활용하여 로그인 상태에 따라 상단바를 변경하라.
* react-query를 사용해 `/api/sample`을 호출하는 간단한 페이지 만들기.

### 고급

* `pages/index.tsx`를 App Router(`app/`)로 마이그레이션 하라.
* next-auth + Firebase 토큰 동기화 전략 구현하기.
* 차트 컴포넌트를 `@visx`로 만들고, react-query로 데이터를 바인딩.

---

## 16) 자주 발생하는 문제와 해결법

### 문제: `Disabled SWC as replacement for Babel because of custom Babel configuration ".babelrc"`

**원인**: 프로젝트에 `.babelrc`가 있어 Next.js가 SWC 대신 Babel을 사용하려 함.

**해결**:

* `.babelrc`가 꼭 필요하지 않다면 제거하거나, Next.js에서 권장하는 설정으로 변경.
* SWC를 사용하려면 Babel 관련 설정을 제거하고 Next.js가 자동으로 SWC를 사용하게 함.

### 문제: 의존성 충돌/Type 오류

* `yarn install` 후 `yarn build`로 타입 체크 및 빌드 재현.
* TypeScript 버전과 `@types/*` 버전 호환성 확인.

---

## 17) 참고자료

* Next.js 공식 문서: [https://nextjs.org/docs](https://nextjs.org/docs)
* React 공식 문서: [https://reactjs.org/docs/getting-started.html](https://reactjs.org/docs/getting-started.html)
* NextAuth.js: [https://next-auth.js.org/](https://next-auth.js.org/)
* Firebase: [https://firebase.google.com/docs](https://firebase.google.com/docs)
* React Query (TanStack Query): [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
* Emotion: [https://emotion.sh/docs/introduction](https://emotion.sh/docs/introduction)
* @visx: [https://airbnb.io/visx/](https://airbnb.io/visx/)
* Framer Motion: [https://www.framer.com/motion/](https://www.framer.com/motion/)

---

## 부록: 강의형 학습 플랜(권장)

1. **Week 1 — 기본기 다지기**

   * React 복습(컴포넌트, 훅)
   * Next.js 파일 기반 라우팅, `pages/` 이해
   * 프로젝트 셋업 및 `yarn dev`로 실행

2. **Week 2 — 인증과 상태관리**

   * next-auth 기초, Firebase 기초
   * react-query로 데이터 페칭 실습
   * useUser, withAuth 훅 분석

3. **Week 3 — UI/스타일링/시각화**

   * Emotion으로 컴포넌트 스타일링
   * @visx로 간단한 차트 만들기
   * Framer Motion 애니메이션 추가

4. **Week 4 — 고급/마이그레이션**

   * Pages → App Router 마이그레이션 실전
   * 배포(Vercel) 실습 및 성능 튜닝

---

# FastCampus Next.js 교육용 프로젝트: Part4 My Account

이 README.md는 FastCampus의 Next.js 교육과정에 맞춰 초보자를 위한 종합 학습 교재입니다. 본 프로젝트(`part4_my_account`)를 기반으로 이론, 실습, 고급 기능까지 상세히 안내합니다.

---

## 1. 소개 및 학습 목표

* **교육 대상**: React 기본 지식을 가진 초보자, Next.js 입문자, 실전 프로젝트 경험 희망자
* **학습 목표**: Next.js 핵심 개념 이해, 실전 프로젝트 경험, 코드 활용 능력 향상, 실습 기반 학습
* **프로젝트 개요**: 사용자 계정 관리 웹 애플리케이션, 로그인/회원가입, 계정 조회/수정, 대시보드 UI, 시각화/애니메이션 기능 포함

## 2. Next.js 개요 및 핵심 개념

* Next.js 소개, SSR/SSG/ISR/CSR 개념 및 특징
* Pages Router vs App Router 비교
* 라우팅 방식: 동적 라우팅, catch-all, nested routes
* API Routes 및 서버리스 함수 활용

## 3. 프로젝트 환경 설정 및 구조

* Node.js, Yarn/패키지 관리
* TypeScript, ESLint, Prettier 설정
* 프로젝트 구조(`src/pages`, `src/components`, `hooks`, `contexts`, `models`, `mock`) 설명
* 환경 변수 관리와 보안 주의사항

## 4. 페이지와 라우팅

* 파일 기반 라우팅 원리
* 동적 라우팅, `getServerSideProps`, `getStaticProps`, `getStaticPaths` 활용 예제
* `_app.tsx`, `_document.tsx`, `_error.tsx` 역할
* 레이아웃과 공통 컴포넌트 적용

## 5. 데이터 페칭 및 상태 관리

* 서버/클라이언트 데이터 페칭 (SSR, SSG, ISR, React Query)
* 상태 관리 패턴: Context + Hooks
* Suspense와 로딩 처리

## 6. 인증과 권한 관리

* next-auth 기본 구조, Firebase Authentication 연동
* 보호된 페이지(HOC `withAuth`)
* 세션 관리 전략과 보안

## 7. UI 컴포넌트 및 스타일링

* CSS-in-JS(Emotion) 소개, Theme 및 GlobalStyle 적용
* 재사용 가능한 UI 컴포넌트 구조
* 프론트엔드 테스트용 Mock 데이터 활용

## 8. 시각화와 애니메이션

* @visx를 활용한 데이터 시각화 예제
* Framer Motion을 활용한 버튼/컴포넌트/페이지 애니메이션 구현

## 9. 성능 최적화

* 이미지 최적화 (`next/image`), 코드 스플리팅, 동적 import
* 번들 분석, 빌드, 캐싱, ISR 활용

## 10. 배포 및 운영

* Vercel 배포 방법, 환경 변수 관리
* 서버리스 함수 및 Edge Function 소개
* 모니터링 및 오류 대응 전략, `_error.tsx` 커스터마이징

## 11. 프로젝트 심화 분석

* 핵심 훅(`useUser`, `useAccount`)과 Context 분석
* 모델 및 타입 정의 이해
* API 호출과 인증 흐름 분석

## 12. 마이그레이션 가이드

* Pages Router → App Router 마이그레이션 단계
* Server Components 도입
* 레거시 코드 호환성 문제와 해결 전략

## 13. 실습 과제

* **레벨별 실습**: 초급/중급/고급 단계별 실습 과제
* **프로젝트 개선/리팩토링 과제**: 컴포넌트, Hooks, 상태 관리, 스타일, 성능 최적화
* **마이그레이션 실습**: Pages → App Router, Provider/레이아웃 이동, 동적 import 적용

## 14. 문제 해결 & FAQ

* 자주 발생하는 오류와 해결법 (SWC/Babel, 환경 변수, 타입 오류, API fetch, 이미지 로딩)
* Next.js 개발 Tip & Best Practices (파일 구조, 타입스크립트, 컴포넌트 재사용, React Query, Emotion, 빌드 테스트, 모니터링, 성능 최적화)

## 15. 참고 자료

* 공식 문서: Next.js, React, NextAuth, Firebase, React Query, Emotion, @visx, Framer Motion
* 유용한 블로그, 튜토리얼, 예제: Next.js 공식 블로그, Vercel 블로그, React Query 예제, YouTube 튜토리얼, GitHub 공식 예제

---

# FastCampus — Next.js 실전 프로젝트(Part4: My Account)

> **목적:** 이 문서는 Next.js 초보자를 위한 종합 학습 교재입니다. 이론과 실습 프로젝트(`part4_my_account`)를 연계하여 학습할 수 있도록 상세하고 친절하게 작성했습니다.

---

## 1. 소개 및 학습 목표

### 교육 대상

* React 기본 지식을 가진 초보자
* Next.js를 처음 접하거나 Pages Router/SSR 개념을 이해하고 싶은 학습자
* 실전 프로젝트를 통해 실무 감각을 익히고 싶은 분

### 학습 목표

1. **Next.js 핵심 개념 이해**

   * SSR, SSG, ISR, CSR 등 렌더링 방식의 차이와 용도
   * Pages Router 구조와 파일 기반 라우팅 원리
   * API Routes와 서버리스 함수 사용법

2. **실전 프로젝트 경험**

   * 실제 프로젝트(`part4_my_account`)를 통해 컴포넌트, 훅, 상태 관리, 인증 등을 실습
   * react-query, react-hook-form, emotion, framer-motion, @visx 등 라이브러리 사용법 익히기

3. **코드 활용 능력 향상**

   * 커스텀 훅과 Context 활용 패턴 이해
   * 타입스크립트를 활용한 타입 안전성 유지
   * 인증과 권한 관리, 클라이언트-서버 데이터 흐름 이해

4. **실습 기반 학습**

   * 예제 코드를 직접 실행하고 수정하며 실습
   * 프로젝트를 개선하거나 리팩토링하며 Next.js 기능 응용

### 프로젝트 개요 (`part4_my_account`)

**프로젝트 목적:** 사용자 계정 관리 기능이 포함된 웹 애플리케이션을 개발하며, Next.js와 관련 라이브러리의 활용법을 학습

**주요 기능**

* 사용자 로그인/회원가입 (next-auth + Firebase)
* 계정 정보 조회 및 수정
* 트랜잭션, 카드, 포인트 관련 데이터 표시
* 대시보드 UI 및 알림 시스템
* 슬라이더, 차트, 애니메이션 등 시각적 기능

**프로젝트 구조(간략)**

```
src/
├─ pages/           # 페이지 기반 라우팅
├─ components/      # 재사용 UI 컴포넌트
├─ hooks/           # 커스텀 훅
├─ contexts/        # 전역 상태 관리 Context
├─ constants/       # 상수값
├─ models/          # 타입/도메인 모델
└─ mock/            # 테스트용 데이터
```

**예제 코드: index.tsx (홈페이지)**

```tsx
import { NextPage } from 'next';
import { useUser } from '../hooks/useUser';

const HomePage: NextPage = () => {
  const { user, loading } = useUser();

  if (loading) return <p>로딩중...</p>;

  return (
    <div>
      <h1>환영합니다, {user?.name || '게스트'}님!</h1>
      {user ? <p>계정 정보를 확인하세요.</p> : <p>로그인 해주세요.</p>}
    </div>
  );
};

export default HomePage;
```

# 2. Next.js 개요 및 핵심 개념

Next.js는 React를 기반으로 하는 프레임워크로, 서버 사이드 렌더링(SSR)과 정적 사이트 생성(SSG), 클라이언트 사이드 렌더링(CSR)을 통합하여 효율적인 웹 애플리케이션을 개발할 수 있도록 도와줍니다.

---

### Next.js란?

* React로 SPA(Single Page Application)를 개발할 때, SEO 최적화, 초기 로딩 속도 개선, 서버와 클라이언트 통합을 위해 만들어진 프레임워크
* React 컴포넌트를 기반으로 하면서, 파일 기반 라우팅, API Routes, 다양한 렌더링 전략, 빌트인 CSS/TypeScript 지원 등 풍부한 기능 제공

**초보자 포인트:**

* React 지식을 기반으로 Next.js 구조를 이해하면 학습이 빠름
* `pages/` 폴더 안에 파일을 만들면 URL이 자동으로 매핑됨

---

### Next.js 특징: SSR, SSG, ISR, CSR

1. **SSR (Server Side Rendering)**

   * 요청이 들어올 때마다 서버에서 HTML을 생성하여 응답
   * 장점: 최신 데이터 항상 제공, SEO 최적화
   * 단점: 서버 부하 증가, 요청마다 렌더링 필요

2. **SSG (Static Site Generation)**

   * 빌드 시점에 HTML을 생성하여 정적 파일로 제공
   * 장점: 빠른 로딩 속도, CDN 캐싱 가능
   * 단점: 빌드 시점 데이터 반영, 자주 변경되는 데이터에는 부적합

3. **ISR (Incremental Static Regeneration)**

   * SSG + 일정 시간마다 페이지 재생성
   * `revalidate` 옵션 사용

4. **CSR (Client Side Rendering)**

   * React에서 브라우저가 데이터를 받아 렌더링
   * 장점: 서버 부담 적음, 사용자 상호작용 빠름
   * 단점: SEO 불리, 초기 로딩 느림

**예제: SSR 페이지**

```tsx
// pages/ssr-example.tsx
import { GetServerSideProps, NextPage } from 'next';

interface Props {
  message: string;
}

const SSRExample: NextPage<Props> = ({ message }) => {
  return <h1>SSR 메시지: {message}</h1>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { message: '서버에서 전달된 메시지' } };
};

export default SSRExample;
```

---

### Pages Router vs App Router

1. **Pages Router**

   * `pages/` 폴더 기반 라우팅
   * `_app.tsx`, `_document.tsx`를 통해 공통 레이아웃 설정
   * `getStaticProps`, `getServerSideProps`, `getStaticPaths` 사용

2. **App Router (Next.js 13+)**

   * `app/` 폴더 기반, React Server Component 지원
   * `layout.tsx`, `page.tsx`, `loading.tsx` 등 구조화된 라우팅
   * 서버 컴포넌트와 클라이언트 컴포넌트를 구분하여 최적화 가능

> **본 프로젝트(`part4_my_account`)**는 Pages Router 기반으로 구현됨.

---

### 렌더링 전략 비교

| 전략  | 데이터 최신성 | SEO | 서버부하 | 예제 사용 경우               |
| --- | ------- | --- | ---- | ---------------------- |
| SSR | 높음      | 좋음  | 높음   | 로그인/대시보드 등 동적 데이터 페이지  |
| SSG | 낮음      | 좋음  | 낮음   | 블로그, FAQ, 상품 페이지       |
| ISR | 중간      | 좋음  | 중간   | 뉴스, 게시판 등 일정 주기 갱신 페이지 |
| CSR | 낮음      | 낮음  | 낮음   | 사용자 인터랙션 위주, SPA형 UI   |

---

### 라우팅 방식

1. **동적 라우팅 (Dynamic Routes)**

   * `[id].tsx` 형식 사용, URL 파라미터를 받아 페이지 생성

   ```tsx
   // pages/user/[id].tsx
   import { useRouter } from 'next/router';

   const UserPage = () => {
     const router = useRouter();
     const { id } = router.query;
     return <p>사용자 ID: {id}</p>;
   };

   export default UserPage;
   ```

2. **Catch-All Routes**

   * `[...slug].tsx` 형식, 여러 경로를 하나로 처리

3. **Nested Routes**

   * 폴더 구조로 중첩 라우팅 가능
   * 예: `pages/dashboard/settings.tsx` → `/dashboard/settings`

---

### API Routes와 서버리스 함수

* `pages/api/*` 폴더 안에 파일을 만들면 자동으로 API Endpoint 생성
* Next.js에서 제공하는 서버리스 함수(Serverless Functions)로 동작

**예제: 간단한 API Route**

```ts
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Hello, Next.js API!' });
}
```

* 브라우저에서 `/api/hello` 호출 시 JSON 응답 확인 가능

> 본 프로젝트에서는 인증, 계정 데이터, 카드/트랜잭션 API 등이 `pages/api/`에 정의되어 있으며, react-query로 클라이언트에서 데이터를 불러옵니다.

---

# 3. 프로젝트 환경 설정 및 구조

Next.js 프로젝트를 시작하기 전에 개발 환경을 올바르게 설정하는 것은 매우 중요합니다. 초보자도 이해할 수 있도록 자세히 안내합니다.

---

### Node.js, Yarn/패키지 관리

1. **Node.js 설치**

   * Next.js는 Node.js 환경에서 동작합니다.
   * 권장 버전: 18.x 이상 (LTS) 또는 20.x
   * 설치 후 버전 확인:

     ```bash
     node -v
     npm -v
     ```

2. **Yarn 설치 및 사용**

   * 본 프로젝트는 Yarn 4(Berry) 사용
   * 설치: `npm install -g yarn`
   * 프로젝트 의존성 설치:

     ```bash
     yarn install
     ```
   * 개발 서버 실행:

     ```bash
     yarn dev
     ```
   * 장점: `node_modules`를 가볍게 관리, Plug’n’Play(.pnp) 지원

> 참고: npm 대신 Yarn을 사용할 경우, 프로젝트에 포함된 `.yarnrc.yml`과 `.pnp.cjs` 설정을 반드시 확인해야 합니다.

---

### TypeScript와 ESLint, Prettier 설정

1. **TypeScript**

   * 타입스크립트를 사용하면 변수/함수/컴포넌트의 타입을 지정하여 런타임 오류를 예방
   * 설정 파일: `tsconfig.json`
   * 예제:

     ```json
     {
       "compilerOptions": {
         "target": "ESNext",
         "module": "ESNext",
         "jsx": "preserve",
         "strict": true,
         "moduleResolution": "node",
         "esModuleInterop": true
       }
     }
     ```

2. **ESLint**

   * 코드 스타일과 오류를 사전에 확인
   * 설정 파일: `.eslintrc.json`
   * 예제 규칙:

     ```json
     {
       "extends": ["next/core-web-vitals", "plugin:prettier/recommended"],
       "rules": {
         "semi": ["error", "always"]
       }
     }
     ```

3. **Prettier**

   * 코드 포맷팅 자동화
   * 설정 파일: `.prettierrc`
   * 기본 사용법:

     ```bash
     yarn prettier --write .
     ```

> Tip: ESLint와 Prettier를 함께 사용하면 코드 일관성 유지, 타입 안정성 확보 가능

---

### 프로젝트 구조 설명

**프로젝트 루트 구조**

```
src/
├─ pages/           # 페이지 기반 라우팅
├─ components/      # 재사용 UI 컴포넌트
├─ hooks/           # 커스텀 훅
├─ contexts/        # 전역 상태 관리 Context
├─ constants/       # 상수값 정의
├─ models/          # 데이터 모델과 타입 정의
└─ mock/            # 테스트용 모의 데이터
```

**세부 설명:**

* `pages/`: URL과 1:1 매칭되는 페이지 파일
* `components/`: Button, Card, Modal 등 재사용 가능한 UI
* `hooks/`: `useUser`, `useAccount` 등 데이터/상태를 추상화
* `contexts/`: 전역 알림 시스템이나 세션 상태 관리
* `constants/`: 계정, 카드, 포인트 관련 상수
* `models/`: Account, Transaction 등 타입 정의
* `mock/`: API 데이터가 준비되기 전 개발용 가짜 데이터

**예제:** `src/pages/index.tsx`

```tsx
import { NextPage } from 'next';
import { useUser } from '../hooks/useUser';

const HomePage: NextPage = () => {
  const { user, loading } = useUser();

  if (loading) return <p>로딩중...</p>;

  return (
    <div>
      <h1>환영합니다, {user?.name || '게스트'}님!</h1>
    </div>
  );
};

export default HomePage;
```

* `hooks/useUser`를 통해 로그인 사용자 정보를 가져와 조건부 렌더링

---

### 환경 변수와 보안

* 민감한 API 키, Firebase config, NextAuth secret 등은 `.env` 파일에 정의
* 예시 `.env` 파일:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

* 주의사항:

  * `.env`는 절대 깃허브 등 외부에 업로드하지 않음
  * `NEXT_PUBLIC_` 접두사는 클라이언트에서도 접근 가능
  * 서버 전용 변수는 접두사 없이 사용

> 초보자 Tip: 환경 변수를 사용하면 코드에서 민감 정보를 직접 작성하지 않아 보안성이 높아집니다.

---
# 4. 페이지와 라우팅

Next.js에서는 파일 구조만으로 URL을 자동 생성할 수 있어 초보자도 쉽게 라우팅을 이해할 수 있습니다. 이 챕터에서는 페이지와 라우팅 개념을 자세히 설명하고, 본 프로젝트 예제를 통해 실습할 수 있도록 안내합니다.

---

### 파일 기반 라우팅 원리

* `pages/` 폴더 안의 파일명이 URL 경로가 됨
* 예: `pages/index.tsx` → `/`, `pages/faq.tsx` → `/faq`
* 폴더 안에 파일을 넣으면 경로 중첩 가능

  ```
  pages/dashboard/settings.tsx → /dashboard/settings
  ```
* 확장자는 `.js`, `.jsx`, `.ts`, `.tsx` 모두 가능

**초보자 Tip:**

* 파일을 생성하면 별도의 라우터 설정 없이 바로 접근 가능
* URL 경로와 파일명이 1:1 매칭되어 구조 파악이 쉬움

---

### 동적 라우팅과 getStaticPaths/getServerSideProps

1. **동적 라우팅 (Dynamic Routes)**

   * `[param].tsx` 형식으로 경로의 변수를 처리
   * 예제: `pages/user/[id].tsx`

     ```tsx
     import { useRouter } from 'next/router';

     const UserPage = () => {
       const router = useRouter();
       const { id } = router.query;
       return <p>사용자 ID: {id}</p>;
     };

     export default UserPage;
     ```

2. **getServerSideProps (SSR)**

   * 요청 시 서버에서 데이터를 가져와 렌더링
   * 예제: `pages/ssr-example.tsx`

     ```tsx
     import { GetServerSideProps, NextPage } from 'next';

     interface Props { message: string; }

     const SSRExample: NextPage<Props> = ({ message }) => <h1>{message}</h1>;

     export const getServerSideProps: GetServerSideProps = async () => {
       return { props: { message: '서버에서 전달된 메시지' } };
     };

     export default SSRExample;
     ```

3. **getStaticPaths / getStaticProps (SSG)**

   * 미리 정의된 경로의 페이지를 빌드 시 생성
   * 예제: 블로그 게시물 페이지

     ```tsx
     export const getStaticPaths = async () => {
       return {
         paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
         fallback: false
       };
     };
     export const getStaticProps = async ({ params }) => {
       return { props: { postId: params.id } };
     };
     ```

> 본 프로젝트에서는 계정, 카드, 트랜잭션 등의 데이터 조회에 동적 라우팅과 SSR 패턴이 사용됩니다.

---

### _app.tsx, _document.tsx, _error.tsx 역할

1. **_app.tsx**

   * 모든 페이지의 공통 레이아웃과 전역 Provider 설정
   * 예제:

     ```tsx
     import { AppProps } from 'next/app';
     import { QueryClient, QueryClientProvider } from 'react-query';

     const queryClient = new QueryClient();

     function MyApp({ Component, pageProps }: AppProps) {
       return (
         <QueryClientProvider client={queryClient}>
           <Component {...pageProps} />
         </QueryClientProvider>
       );
     }

     export default MyApp;
     ```

2. **_document.tsx**

   * HTML 템플릿과 서버 사이드 렌더링 시 스타일 관리
   * 주로 Emotion, styled-components와 함께 사용

3. **_error.tsx**

   * 404, 500 등 에러 페이지를 커스터마이징
   * 기본 제공 에러 페이지를 대체하여 사용자 친화적 메시지 제공

---

### 레이아웃과 공통 컴포넌트

* 프로젝트에서 반복되는 레이아웃, Header, Footer, Sidebar 등을 컴포넌트화하여 재사용
* 예제: `components/Layout.tsx`

  ```tsx
  import { ReactNode } from 'react';
  import Header from './Header';
  import Footer from './Footer';

  interface LayoutProps { children: ReactNode; }

  const Layout = ({ children }: LayoutProps) => (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );

  export default Layout;
  ```
* 페이지에서 쉽게 적용:

  ```tsx
  import Layout from '../components/Layout';

  const HomePage = () => (
    <Layout>
      <h1>홈페이지 콘텐츠</h1>
    </Layout>
  );

  export default HomePage;
  ```

> 초보자 Tip: 공통 컴포넌트를 만들면 코드 중복이 줄고 유지보수가 쉬워집니다.

---

# 5. 데이터 페칭 및 상태 관리

Next.js 프로젝트에서 데이터를 가져오고 상태를 관리하는 방법은 매우 중요합니다. 이 챕터에서는 초보자도 이해할 수 있도록 단계별로 설명하며, 실제 프로젝트(`part4_my_account`) 예제를 포함합니다.

---

### 1. getServerSideProps / getStaticProps / getStaticPaths

1. **getServerSideProps (SSR)**

   * 페이지 요청 시 서버에서 데이터를 가져와 렌더링
   * 최신 데이터를 보여야 하는 페이지에 적합

   ```tsx
   // pages/account.tsx
   import { GetServerSideProps, NextPage } from 'next';

   interface Props {
     accountName: string;
   }

   const AccountPage: NextPage<Props> = ({ accountName }) => {
     return <h1>계정 이름: {accountName}</h1>;
   };

   export const getServerSideProps: GetServerSideProps = async () => {
     const accountName = '홍길동'; // 서버에서 데이터 조회 예시
     return { props: { accountName } };
   };

   export default AccountPage;
   ```

2. **getStaticProps (SSG)**

   * 빌드 시점에 HTML 생성
   * 데이터가 자주 변경되지 않는 페이지에 적합

3. **getStaticPaths**

   * 동적 라우팅과 함께 사용, 미리 생성할 경로 지정

   ```tsx
   // pages/user/[id].tsx
   export const getStaticPaths = async () => {
     return {
       paths: [{ params: { id: '1' } }, { params: { id: '2' } }],
       fallback: false
     };
   };
   export const getStaticProps = async ({ params }) => {
     return { props: { userId: params.id } };
   };
   ```

> 본 프로젝트에서는 트랜잭션이나 카드 정보 조회 시 SSR 혹은 동적 라우팅과 결합한 SSG를 사용합니다.

---

### 2. 클라이언트 사이드 데이터 페칭 (React Query)

* React Query는 클라이언트에서 데이터를 효율적으로 가져오고 캐싱/동기화할 수 있는 라이브러리
* 예제: 계정 정보를 API에서 가져오기

```tsx
import { useQuery } from 'react-query';

const fetchAccount = async () => {
  const res = await fetch('/api/account');
  return res.json();
};

const AccountComponent = () => {
  const { data, isLoading, error } = useQuery('account', fetchAccount);

  if (isLoading) return <p>로딩중...</p>;
  if (error) return <p>오류 발생</p>;

  return <div>계정 이름: {data.name}</div>;
};
```

> 초보자 Tip: React Query를 사용하면 데이터 캐싱, 오류 처리, 로딩 상태 관리를 쉽게 할 수 있습니다.

---

### 3. 상태 관리 패턴 (Context + Hooks)

1. **React Context**

   * 전역 상태를 관리할 때 사용
   * 예제: 로그인 사용자 정보 전역 관리

   ```tsx
   // contexts/UserContext.tsx
   import { createContext, useContext, ReactNode, useState } from 'react';

   interface UserContextType {
     user: { name: string } | null;
     setUser: (user: { name: string } | null) => void;
   }

   const UserContext = createContext<UserContextType | undefined>(undefined);

   export const UserProvider = ({ children }: { children: ReactNode }) => {
     const [user, setUser] = useState<{ name: string } | null>(null);
     return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
   };

   export const useUserContext = () => {
     const context = useContext(UserContext);
     if (!context) throw new Error('UserContext를 찾을 수 없습니다.');
     return context;
   };
   ```

2. **커스텀 훅 사용**

   * `useUser.ts`처럼 특정 상태와 로직을 훅으로 추상화
   * 초보자 Tip: 반복되는 로직을 재사용 가능하게 만듦

---

### 4. Suspense와 로딩 처리

* React 18 이상에서 Suspense를 사용하면 비동기 데이터를 기다리는 동안 로딩 화면 표시 가능
* React Query와 함께 사용 예제:

```tsx
import { Suspense } from 'react';
import AccountComponent from './AccountComponent';

const HomePage = () => (
  <Suspense fallback={<p>로딩중...</p>}>
    <AccountComponent />
  </Suspense>
);

export default HomePage;
```

* 초보자 Tip: Suspense와 fallback을 사용하면 로딩 UI를 쉽게 관리할 수 있습니다.

---

# 6. 인증과 권한 관리

웹 애플리케이션에서 인증과 권한 관리는 매우 중요합니다. 초보자가 이해할 수 있도록 Next.js와 본 프로젝트(`part4_my_account`)에서 사용하는 인증 방식을 상세히 설명합니다.

---

### 1. next-auth 기본 구조

* NextAuth.js는 Next.js 환경에서 다양한 인증 전략을 쉽게 구현할 수 있는 라이브러리
* 주요 기능:

  * OAuth, Credentials Provider 등 다양한 로그인 방식 지원
  * 세션 관리 및 JWT 지원

**예제: NextAuth 설정**

```ts
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // 예제: 이메일/비밀번호 검증
        if (credentials?.email === 'test@example.com' && credentials.password === '1234') {
          return { id: 1, name: '홍길동', email: credentials.email };
        }
        return null;
      }
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET
});
```

* `providers`에서 인증 방식을 선택하고, `authorize`에서 사용자 검증
* JWT를 사용하여 세션 정보를 암호화하고 유지

---

### 2. Firebase Authentication 연동

* Firebase Auth를 사용하면 소셜 로그인(Google, Kakao 등) 및 이메일/비밀번호 로그인 쉽게 구현
* 예제: Firebase 초기화 및 로그인

```ts
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

* 로그인 후 JWT 토큰을 next-auth 세션과 동기화 가능
* 초보자 Tip: Firebase Authentication은 클라이언트 SDK와 간단한 설정으로 즉시 사용 가능

---

### 3. 보호된 페이지(HOC, withAuth)

* 로그인하지 않은 사용자가 접근할 수 없는 페이지 보호
* HOC(Higher-Order Component)를 활용하여 반복 코드를 줄일 수 있음

**예제: withAuth HOC**

```tsx
// hooks/withAuth.tsx
import { useUser } from './useUser';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

export const withAuth = (Component: () => JSX.Element) => {
  return () => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) router.push('/login');
    }, [user, loading]);

    if (loading || !user) return <p>로딩중...</p>;

    return <Component />;
  };
};
```

* 사용 예제:

```tsx
import { withAuth } from '../hooks/withAuth';

const Dashboard = () => <p>로그인 후 접근 가능한 대시보드</p>;

export default withAuth(Dashboard);
```

* 초보자 Tip: HOC를 사용하면 보호 페이지마다 동일한 로그인 확인 코드를 반복할 필요가 없음

---

### 4. 세션 관리 전략

1. **next-auth 세션**

   * `SessionProvider`로 전체 앱에 세션 공급
   * 클라이언트에서 `useSession`으로 사용자 정보 조회

   ```tsx
   import { SessionProvider } from 'next-auth/react';

   function MyApp({ Component, pageProps }) {
     return (
       <SessionProvider session={pageProps.session}>
         <Component {...pageProps} />
       </SessionProvider>
     );
   }
   ```

2. **클라이언트 상태와 연계**

   * React Context + Hooks와 결합하여 UI 상태와 동기화
   * 예: 로그인 상태에 따라 헤더 메뉴 변경

3. **보안 주의사항**

   * NEXTAUTH_SECRET 환경 변수 설정 필수
   * JWT 토큰을 안전하게 보관 (쿠키 설정 주의)
   * Firebase Auth와 동기화 시, 토큰 만료 처리 필요

---

# 7. UI 컴포넌트 및 스타일링

웹 애플리케이션의 사용자 경험은 UI와 스타일링에서 크게 좌우됩니다. 초보자도 이해할 수 있도록 프로젝트(`part4_my_account`)를 기반으로 설명합니다.

---

### 1. CSS-in-JS (Emotion) 소개

* Emotion은 JavaScript 파일 안에서 CSS를 작성할 수 있는 CSS-in-JS 라이브러리
* 장점:

  * 컴포넌트 단위 스타일 관리
  * JS 변수와 연계한 동적 스타일링 가능
  * SSR 지원으로 SEO와 초기 렌더링 속도 향상

**예제: styled 컴포넌트 사용**

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const Button = styled.button`
  background-color: #0070f3;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #005bb5;
  }
`;

export default Button;
```

* JSX에서 `<Button>클릭</Button>`으로 바로 사용 가능

---

### 2. 테마와 GlobalStyle 적용

1. **ThemeProvider**

   * 전역 테마를 정의하여 색상, 폰트, 간격 등을 통일

   ```tsx
   import { ThemeProvider } from '@emotion/react';

   const theme = {
     colors: {
       primary: '#0070f3',
       secondary: '#ff4081'
     },
     fontSize: '16px'
   };

   function MyApp({ Component, pageProps }) {
     return (
       <ThemeProvider theme={theme}>
         <Component {...pageProps} />
       </ThemeProvider>
     );
   }
   export default MyApp;
   ```

2. **GlobalStyle**

   * 전체 페이지에 공통 스타일 적용

   ```tsx
   import { Global, css } from '@emotion/react';

   const GlobalStyle = () => (
     <Global
       styles={css`
         body { margin: 0; font-family: Arial, sans-serif; }
         a { text-decoration: none; color: inherit; }
       `}
     />
   );
   ```

* `_app.tsx`에서 `<GlobalStyle />`을 렌더링

---

### 3. UI 컴포넌트 구조와 재사용성

* 프로젝트에서는 Button, Card, Modal 등 반복되는 UI를 컴포넌트로 분리
* 재사용성을 높이기 위해 Props와 Emotion 스타일을 활용

**예제: Card 컴포넌트**

```tsx
import styled from '@emotion/styled';

interface CardProps {
  title: string;
  content: string;
}

const CardWrapper = styled.div`
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  margin: 10px;
`;

const Card = ({ title, content }: CardProps) => (
  <CardWrapper>
    <h2>{title}</h2>
    <p>{content}</p>
  </CardWrapper>
);

export default Card;
```

* 사용 예제:

```tsx
<Card title="계정 정보" content="홍길동님의 계정입니다." />
```

* 초보자 Tip: 컴포넌트를 작은 단위로 나누어 재사용성을 높이면 코드 유지보수가 쉬워집니다.

---

### 4. 프론트엔드 테스트용 Mock 데이터 활용

* API가 준비되지 않은 초기 개발 단계에서 Mock 데이터를 사용하면 UI 개발과 테스트가 가능
* 프로젝트의 `src/mock/` 폴더에 예제 데이터 존재

**예제: banner.ts**

```ts
export const banners = [
  { id: 1, title: '이벤트 1', imageUrl: '/banner1.jpg' },
  { id: 2, title: '이벤트 2', imageUrl: '/banner2.jpg' }
];
```

* 컴포넌트에서 Mock 데이터 사용

```tsx
import { banners } from '../mock/banner';
import Card from '../components/Card';

const BannerList = () => (
  <div>
    {banners.map(b => (
      <Card key={b.id} title={b.title} content={<img src={b.imageUrl} alt={b.title} />} />
    ))}
  </div>
);
```

* 초보자 Tip: Mock 데이터를 사용하면 API 개발 전에 UI를 완성하고 테스트할 수 있습니다.

---

# 8. 시각화와 애니메이션

사용자 경험을 높이기 위해 시각화와 애니메이션은 매우 중요합니다. 이 챕터에서는 초보자도 이해할 수 있도록 `@visx`와 `Framer Motion`을 활용한 예제를 포함하여 설명합니다.

---

### 1. @visx를 활용한 데이터 시각화

* `@visx`는 React와 함께 사용하는 경량 데이터 시각화 라이브러리
* SVG를 기반으로 하며, 차트나 그래프를 쉽게 만들 수 있음
* 프로젝트에서는 카드, 트랜잭션, 통계 데이터를 시각화할 때 사용

**예제: 간단한 Bar Chart**

```tsx
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';

const data = [
  { name: '계정 A', value: 30 },
  { name: '계정 B', value: 50 },
  { name: '계정 C', value: 80 }
];

const BarChart = () => (
  <svg width={400} height={200}>
    <Group top={20} left={20}>
      {data.map((d, i) => (
        <Bar
          key={i}
          x={i * 50}
          y={200 - d.value}
          width={40}
          height={d.value}
          fill="#0070f3"
        />
      ))}
    </Group>
  </svg>
);

export default BarChart;
```

* 초보자 Tip: 데이터를 배열로 준비하고 SVG 좌표 계산을 이해하면 기본 차트 구현 가능

---

### 2. Framer Motion으로 애니메이션 구현

* React 컴포넌트를 쉽게 애니메이션화할 수 있는 라이브러리
* 페이지 전환, 컴포넌트 등장/사라짐, 마우스 인터랙션 등 다양하게 활용

**예제: 버튼 애니메이션**

```tsx
import { motion } from 'framer-motion';

const AnimatedButton = () => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px' }}
  >
    클릭
  </motion.button>
);

export default AnimatedButton;
```

* `whileHover`와 `whileTap`으로 사용자 상호작용에 반응

---

### 3. 페이지 전환/컴포넌트 모션 예제

* 페이지 전환 시 `AnimatePresence`를 사용하면 자연스러운 화면 전환 가능

**예제: 페이지 전환 애니메이션**

```tsx
import { AnimatePresence, motion } from 'framer-motion';

const PageTransition = ({ children }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export default PageTransition;
```

* 사용 예제: `_app.tsx`에서 페이지를 감싸 전환 적용 가능

> 초보자 Tip: 애니메이션은 UI를 자연스럽게 만들어 사용자의 경험을 향상시킵니다. 작은 버튼 애니메이션부터 페이지 전환까지 단계적으로 적용해 보세요.

---

# 9. 성능 최적화

웹 애플리케이션의 성능은 사용자 경험과 SEO에 큰 영향을 미칩니다. 초보자가 이해할 수 있도록 Next.js 프로젝트(`part4_my_account`)를 예제로 성능 최적화 방법을 상세히 안내합니다.

---

### 1. 이미지 최적화 (next/image)

* Next.js 내장 컴포넌트 `next/image`를 사용하면 이미지 자동 최적화, 레이지 로딩, 반응형 지원 가능
* 예제:

```tsx
import Image from 'next/image';

const ProfileImage = () => (
  <Image
    src="/profile.jpg"
    alt="사용자 프로필"
    width={200}
    height={200}
    priority // 중요 이미지 우선 로딩
  />
);

export default ProfileImage;
```

* 장점:

  * 페이지 로딩 속도 향상
  * 브라우저별 이미지 최적화
  * SEO와 Core Web Vitals 개선

---

### 2. 코드 스플리팅과 동적 import

* 불필요한 코드 로딩을 줄여 초기 로딩 속도 개선
* Next.js는 페이지 단위로 자동 코드 스플리팅
* 필요 시 동적 import 사용

**예제: 동적 컴포넌트 로딩**

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  ssr: false, // 서버에서는 렌더링하지 않음
  loading: () => <p>로딩중...</p>
});

export default function HomePage() {
  return <HeavyComponent />;
}
```

* 초보자 Tip: 페이지 초기 렌더링에 필요 없는 큰 컴포넌트는 동적 import로 지연 로딩

---

### 3. 번들 분석과 최적화

* `next build` 후 번들 크기 확인 가능
* `@next/bundle-analyzer` 플러그인 사용

```ts
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});
```

* 분석 결과 불필요한 의존성 제거, 라이브러리 경량화 가능

---

### 4. 빌드, 캐싱, ISR 활용

1. **빌드 최적화**

   * `next build`를 통해 정적 페이지와 서버사이드 페이지 생성
   * production 모드에서 최적화됨

2. **캐싱 전략**

   * CDN과 Cache-Control 설정으로 정적 리소스 캐싱
   * 예: 이미지, JS/CSS 파일 캐싱

3. **Incremental Static Regeneration (ISR)**

   * 정적 페이지를 일정 시간마다 재생성
   * 예제:

```ts
export const getStaticProps = async () => {
  const data = await fetchData();
  return {
    props: { data },
    revalidate: 60, // 60초마다 페이지 재생성
  };
};
```

* 장점: 최신 데이터 유지 + 빠른 정적 페이지 제공

---

# 10. 배포 및 운영

Next.js 프로젝트를 완성한 후에는 배포와 운영이 중요합니다. 이 챕터에서는 초보자도 이해할 수 있도록 Vercel 배포, 환경 변수 관리, 서버리스 함수와 Edge Function, 모니터링 및 오류 대응까지 상세하게 안내합니다.

---

### 1. Vercel 배포

* Next.js 공식 배포 플랫폼: Vercel
* 장점:

  * GitHub, GitLab, Bitbucket 연동 가능
  * 자동 빌드 및 배포
  * SSR, SSG, ISR 모두 지원

**배포 단계:**

1. Vercel 계정 생성 및 로그인
2. 프로젝트 GitHub 리포지토리 연결
3. 배포 설정 확인:

   * Framework Preset: Next.js
   * Environment Variables 설정
4. 배포 버튼 클릭 → 자동 빌드 & 배포

**예제:**

* 프로젝트 루트에서:

```bash
vercel --prod
```

* 성공 시 Vercel에서 제공하는 URL에서 서비스 확인 가능

---

### 2. 환경 변수 관리

* Vercel에서 환경 변수 설정 필수
* 예시:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret
```

* NEXT_PUBLIC_ 접두사는 클라이언트에서 접근 가능, 나머지는 서버 전용
* 초보자 Tip: 환경 변수는 민감 정보를 보호하기 위해 절대 GitHub에 직접 커밋하지 않음

---

### 3. 서버리스 함수, Edge Function 소개

1. **서버리스 함수 (Serverless Function)**

   * `pages/api/*`에 작성한 함수가 자동으로 서버리스 함수로 배포
   * 장점: 서버 운영 부담 없음, 필요할 때만 실행

**예제:**

```ts
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from 'next';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: 'Hello, Next.js API!' });
}
```

2. **Edge Function**

   * Vercel Edge Network 상에서 실행되는 서버리스 함수
   * 전 세계 사용자에게 낮은 지연 시간 제공
   * 예: 인증 토큰 검증, A/B 테스트

---

### 4. 모니터링 및 오류 대응

* **모니터링 도구:**

  * Vercel Dashboard: 빌드 상태, 트래픽 확인
  * Sentry, LogRocket 등: 런타임 에러 모니터링

* **오류 대응 전략:**

  1. 빌드 에러: `next build`로 사전 확인
  2. 런타임 에러: Sentry 연동하여 원인 분석
  3. 클라이언트 에러: try/catch와 fallback UI 적용

**예제: _error.tsx 커스터마이징**

```tsx
import { NextPage } from 'next';
interface Props { statusCode?: number; }
const ErrorPage: NextPage<Props> = ({ statusCode }) => (
  <div>
    <h1>에러 발생</h1>
    <p>{statusCode ? `서버 에러: ${statusCode}` : '클라이언트 에러 발생'}</p>
  </div>
);
export default ErrorPage;
```

* 초보자 Tip: 배포 후 에러 페이지를 커스터마이징하면 사용자 친화적인 UI 제공 가능

---

# 11. 프로젝트 심화 분석

이 챕터에서는 초보자가 `part4_my_account` 프로젝트를 깊이 이해할 수 있도록 핵심 훅, Context, 모델, 타입, API 호출 및 인증 흐름을 상세히 설명합니다.

---

### 1. 프로젝트 핵심 훅과 Context 분석

* **useUser**

  * 로그인 사용자 정보를 가져오는 훅
  * `next-auth` 세션과 연계되어 상태 관리

  ```tsx
  // hooks/useUser.ts
  import { useSession } from 'next-auth/react';

  export const useUser = () => {
    const { data: session, status } = useSession();
    const loading = status === 'loading';
    const user = session?.user || null;
    return { user, loading };
  };
  ```
* **withAuth HOC**

  * 로그인 상태에 따라 페이지 접근 제어
  * 반복되는 로그인 체크 로직 제거
* **AlertContext**

  * 전역 알림, 모달, 토스트 메시지 관리
  * `useContext`를 활용하여 어디서나 상태 접근 가능

> 초보자 Tip: 훅과 Context를 적절히 사용하면 컴포넌트 간 상태 전달이 간단하고 재사용성이 높습니다.

---

### 2. 모델, 타입 정의 이해

* 프로젝트에서는 TypeScript를 활용하여 데이터 타입을 정의
* `models/` 폴더 예제:

```ts
// models/account.ts
export interface Account {
  id: string;
  name: string;
  balance: number;
}

// models/transaction.ts
export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
}
```

* 장점:

  * API 응답과 컴포넌트 타입을 안전하게 매핑
  * 런타임 오류 예방

---

### 3. API 호출 및 인증 흐름 분석

1. **API 호출 예제**

```tsx
import { useQuery } from 'react-query';
import { Account } from '../models/account';

const fetchAccounts = async (): Promise<Account[]> => {
  const res = await fetch('/api/account');
  if (!res.ok) throw new Error('계정 데이터를 가져오는 중 오류 발생');
  return res.json();
};

export const useAccounts = () => useQuery('accounts', fetchAccounts);
```

* React Query를 사용하여 API 호출, 캐싱, 로딩 상태 관리

2. **인증 흐름 예제**

* `next-auth`와 Firebase 인증 연동
* 클라이언트에서 세션 확인 후 API 호출 시 토큰 전달

```ts
const { user } = useUser();
const res = await fetch('/api/transaction', {
  headers: {
    Authorization: `Bearer ${user?.token}`
  }
});
```

* 서버에서 토큰 검증 후 데이터 반환

> 초보자 Tip: 훅과 타입을 활용하면 API 호출과 인증 로직을 안전하게 구현할 수 있습니다.

---

# 12. 마이그레이션 가이드

Next.js 13 이상에서는 App Router와 Server Components를 도입하여 성능과 구조를 개선할 수 있습니다. 초보자를 위해 단계별로 Pages Router에서 App Router로 마이그레이션하는 방법을 설명합니다.

---

### 1. Pages Router → App Router

* Pages Router: `pages/` 폴더 기반, `_app.tsx`, `_document.tsx` 필요
* App Router: `app/` 폴더 기반, React Server Component 지원, layout, page, loading 파일 구조

**마이그레이션 단계:**

1. `app/` 폴더 생성
2. 각 페이지를 `page.tsx`로 변환

   ```tsx
   // app/page.tsx
   export default function HomePage() {
     return <h1>홈페이지</h1>;
   }
   ```
3. `_app.tsx` 대신 `layout.tsx`로 Provider 및 전역 레이아웃 이동

   ```tsx
   // app/layout.tsx
   import { ReactNode } from 'react';
   import { QueryClient, QueryClientProvider } from 'react-query';

   const queryClient = new QueryClient();

   export default function RootLayout({ children }: { children: ReactNode }) {
     return (
       <QueryClientProvider client={queryClient}>
         <html lang="ko">
           <body>{children}</body>
         </html>
       </QueryClientProvider>
     );
   }
   ```
4. 페이지별 동적 import 및 레이아웃 적용

> 초보자 Tip: App Router는 파일 구조가 Pages Router와 다르므로, 폴더와 파일명을 정확히 맞추는 것이 중요합니다.

---

### 2. Server Components 도입

* React Server Component(RSC)란 서버에서만 렌더링되고 클라이언트로는 HTML만 전달되는 컴포넌트
* 장점: 초기 로딩 속도 향상, 불필요한 JS 번들 감소
* 예제:

```tsx
'use server';
import { fetchAccounts } from '../lib/api';

export default async function AccountList() {
  const accounts = await fetchAccounts();
  return (
    <ul>
      {accounts.map(a => <li key={a.id}>{a.name}</li>)}
    </ul>
  );
}
```

* 클라이언트에서 상호작용이 필요한 컴포넌트는 `'use client'` 지시자를 추가

---

### 3. 레거시 코드 호환성 문제

* Pages Router의 `_app.tsx`, `_document.tsx`, `getServerSideProps`, `getStaticProps` 등 기존 코드와 충돌 가능
* 마이그레이션 전략:

  1. Pages Router와 App Router 병행 가능 (점진적 마이그레이션)
  2. API Routes는 그대로 `pages/api`에서 유지 가능
  3. 클라이언트 컴포넌트(`'use client'`)와 서버 컴포넌트(`'use server'`) 구분 필수
  4. 기존 Context, Provider 위치를 App Router 구조에 맞게 이동

> 초보자 Tip: 마이그레이션 전 프로젝트 백업 필수, 단계별로 파일 단위로 변환하며 테스트 진행

---

# 13. 실습 과제

실습은 이론 학습을 실제 프로젝트에 적용하여 이해를 높이는 가장 좋은 방법입니다. 초보자도 쉽게 따라할 수 있도록 레벨별 과제를 제시하며, 프로젝트(`part4_my_account`) 예제를 활용합니다.

---

### 1. 레벨별 실습

**초급**

* 프로젝트 실행 및 구조 이해
* `components/` 폴더에 간단한 버튼 컴포넌트 작성
* 페이지에 버튼 추가 후 클릭 이벤트 구현

**중급**

* `useUser` 훅을 사용하여 로그인 상태에 따라 상단바 메뉴 변경
* react-query를 활용하여 `/api/account` 데이터를 가져와 계정 정보 페이지 구성
* Emotion 스타일링 적용

**고급**

* Pages Router 기반 페이지를 App Router로 마이그레이션 (`index.tsx` → `app/page.tsx`)
* next-auth + Firebase 인증 토큰 동기화 구현
* @visx로 차트 컴포넌트 생성 및 react-query 데이터 바인딩
* Framer Motion을 사용하여 페이지 전환 애니메이션 구현

---

### 2. 프로젝트 개선/리팩토링 과제

* **컴포넌트 구조 개선**: 중복 코드 제거, 재사용 가능한 컴포넌트 분리
* **Hooks 개선**: `useAccount`, `useUser` 훅을 보다 효율적이고 타입 안전하게 리팩토링
* **상태 관리 개선**: Context와 React Query 결합, 불필요한 상태 제거
* **스타일 최적화**: Emotion Theme 적용, GlobalStyle 통합
* **성능 최적화**: next/image 사용, 코드 스플리팅, ISR 적용
* **테스트 및 문서화**: 주요 컴포넌트 단위 테스트 및 문서화 진행

> 초보자 Tip: 실습 과제는 단계적으로 진행하며, 각 단계 완료 후 반드시 실행 확인과 오류 해결을 반복하는 것이 중요합니다. 이렇게 하면 프로젝트 이해도가 높아지고, 실제 실무에서도 적용할 수 있는 경험을 쌓을 수 있습니다.

---

# 13. 실습 과제

실습은 학습한 이론과 기술을 실제 프로젝트에 적용하며 이해를 높이는 가장 효과적인 방법입니다. 초보자가 따라할 수 있도록 단계별 과제를 제시하며, 프로젝트(`part4_my_account`) 예제를 활용합니다.

---

### 1. 레벨별 실습

**초급**

* 프로젝트 실행 및 구조 이해
* `components/` 폴더에 간단한 버튼 컴포넌트 작성 후 페이지에 추가
* 클릭 이벤트로 간단한 알림 표시

**중급**

* `useUser` 훅을 사용하여 로그인 상태에 따라 상단바 메뉴 변경
* React Query를 활용하여 `/api/account` 데이터를 가져와 계정 정보 페이지 구성
* Emotion 스타일링 적용
* Mock 데이터를 활용하여 UI 개발 후 API 데이터와 연동

**고급**

* Pages Router 기반 페이지를 App Router로 마이그레이션 (`index.tsx` → `app/page.tsx`)
* next-auth + Firebase 인증 토큰 동기화 구현
* @visx를 사용하여 차트 컴포넌트 생성 후 React Query 데이터 바인딩
* Framer Motion을 활용한 페이지 전환 애니메이션 구현

---

### 2. 프로젝트 개선/리팩토링 과제

* **컴포넌트 구조 개선**: 중복 코드 제거, 재사용 가능한 컴포넌트 분리
* **Hooks 개선**: `useAccount`, `useUser` 훅을 타입 안전하게 리팩토링
* **상태 관리 개선**: Context와 React Query를 효율적으로 결합, 불필요한 상태 제거
* **스타일 최적화**: Emotion Theme 적용, GlobalStyle 통합
* **성능 최적화**: next/image 사용, 코드 스플리팅, ISR 적용
* **테스트 및 문서화**: 주요 컴포넌트 단위 테스트 및 문서화 진행

---

### 3. 마이그레이션 실습

* Pages Router에서 App Router로 페이지 단위 마이그레이션
* `_app.tsx`의 Provider 및 레이아웃을 `app/layout.tsx`로 이동
* 동적 import와 Server/Client Components 구분 적용
* 기존 API Routes(`pages/api`) 유지하면서 클라이언트 호출 테스트
* 단계별로 마이그레이션 후 빌드 및 실행 확인

> 초보자 Tip: 실습은 단계별로 진행하며, 각 단계 완료 후 반드시 실행 확인과 오류 해결을 반복해야 합니다. 마이그레이션 실습까지 완료하면 Next.js 최신 구조를 이해하고 실무에 적용할 수 있는 능력을 갖출 수 있습니다.

---

# 14. 문제 해결 & FAQ

Next.js 프로젝트를 개발하다 보면 자주 발생하는 오류와 해결 방법을 미리 알고 있으면 초보자도 빠르게 문제를 해결할 수 있습니다. 또한 개발 팁과 Best Practices를 통해 보다 효율적으로 프로젝트를 관리할 수 있습니다.

---

### 1. 자주 발생하는 오류와 해결법

**오류 1: Disabled SWC as replacement for Babel**

* 원인: 프로젝트에 `.babelrc` 파일이 있어 Next.js가 기본 SWC 대신 Babel을 사용
* 해결법: `.babelrc` 제거 후 SWC 사용 권장, 필요 시 Next.js 권장 Babel 설정 적용

**오류 2: 환경 변수 미설정**

* 원인: `.env` 파일에 필요한 환경 변수가 없거나 잘못 설정
* 해결법: `.env` 파일 생성 후 `NEXT_PUBLIC_` 접두사와 서버 전용 변수를 구분하여 설정

**오류 3: TypeScript 타입 오류**

* 원인: API 응답 타입과 컴포넌트 Props 불일치
* 해결법: `models/` 폴더에서 타입 정의를 확인하고 `useQuery`나 Props에 정확하게 적용

**오류 4: React Query 데이터 fetch 실패**

* 원인: API 경로 오류, 인증 헤더 누락, 서버 문제
* 해결법: API 경로 확인, 인증 토큰 전달, 서버 로그 확인

**오류 5: 이미지 로딩 문제**

* 원인: `next/image` 사용 시 외부 도메인 설정 누락
* 해결법: `next.config.js`의 `images.domains`에 도메인 추가

---

### 2. Next.js 개발 Tip & Best Practices

1. **파일 구조 규칙 유지**

   * `pages/` 또는 `app/` 구조를 명확히 이해하고 일관성 유지

2. **타입스크립트 활용**

   * API 응답, Props, 상태 값에 타입을 적용하여 오류 사전 예방

3. **컴포넌트 재사용성 확보**

   * 작은 단위 컴포넌트 생성, Props를 통해 유연하게 사용

4. **React Query 활용**

   * 클라이언트 데이터 fetch 시 캐싱, 로딩, 오류 처리 쉽게 구현

5. **Emotion 및 테마 사용**

   * GlobalStyle과 ThemeProvider 적용으로 일관된 UI 제공

6. **배포 전 빌드 및 테스트 필수**

   * `next build`와 `yarn dev`로 로컬 확인 후 Vercel 배포

7. **로그와 모니터링 활용**

   * Sentry, Vercel Dashboard로 오류 및 트래픽 모니터링

8. **성능 최적화**

   * next/image, 동적 import, ISR 활용

> 초보자 Tip: 오류 발생 시 로그를 꼼꼼히 확인하고, 한 번에 많은 변경을 하지 말고 단계별로 테스트하면서 진행하는 것이 좋습니다. 또한 Best Practices를 미리 적용하면 유지보수와 성능 측면에서 유리합니다.

---

# 15. 참고 자료

Next.js를 깊이 이해하고, 본 프로젝트(`part4_my_account`) 학습을 보강하기 위해 참고할 수 있는 공식 문서, 유용한 블로그, 튜토리얼, 예제를 정리합니다.

---

### 1. 공식 문서 링크

* **Next.js 공식 문서**: [https://nextjs.org/docs](https://nextjs.org/docs)

  * Next.js 설치, 라우팅, 데이터 패칭, SSR/SSG/ISR, App Router 등 공식 가이드 제공
* **React 공식 문서**: [https://reactjs.org/docs/getting-started.html](https://reactjs.org/docs/getting-started.html)

  * React 컴포넌트, 훅, 상태 관리 기초 학습
* **NextAuth.js**: [https://next-auth.js.org/](https://next-auth.js.org/)

  * Next.js 기반 인증 및 세션 관리
* **Firebase**: [https://firebase.google.com/docs](https://firebase.google.com/docs)

  * Firebase Authentication, Firestore, Storage 등 기능 학습
* **React Query (TanStack Query)**: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)

  * 클라이언트 상태 관리 및 데이터 페칭
* **Emotion**: [https://emotion.sh/docs/introduction](https://emotion.sh/docs/introduction)

  * CSS-in-JS 및 스타일링 학습
* **@visx**: [https://airbnb.io/visx/](https://airbnb.io/visx/)

  * 데이터 시각화 라이브러리 공식 문서
* **Framer Motion**: [https://www.framer.com/motion/](https://www.framer.com/motion/)

  * 애니메이션 및 페이지 전환 효과 학습

---

### 2. 유용한 블로그, 튜토리얼, 예제

* **Next.js 공식 블로그**: [https://nextjs.org/blog](https://nextjs.org/blog)

  * 최신 기능 업데이트, App Router, Server Components 관련 튜토리얼
* **Vercel 블로그**: [https://vercel.com/blog](https://vercel.com/blog)

  * 배포, 성능 최적화, Edge Function 활용 사례
* **React Query 공식 예제**: [https://react-query.tanstack.com/examples](https://react-query.tanstack.com/examples)

  * 다양한 API 데이터 fetch 패턴과 캐싱 전략 실습
* **YouTube 강좌**:

  * "Next.js 13 Tutorial" 시리즈: App Router, SSR/CSR 예제 포함
* **깃허브 예제**:

  * [https://github.com/vercel/next.js/tree/canary/examples](https://github.com/vercel/next.js/tree/canary/examples)
  * 공식 예제 코드, 프로젝트 기반 실습 가능

> 초보자 Tip: 공식 문서와 예제를 먼저 확인하고, 블로그와 튜토리얼을 통해 다양한 실습 예제를 참고하면 이해가 빠릅니다. 학습한 내용을 본 프로젝트에 바로 적용하며 반복 학습하는 것이 중요합니다.

---

이 챕터에서는 Next.js 및 관련 라이브러리의 공식 문서, 블로그, 튜토리얼, 예제를 정리하여 초보자가 참고하며 학습할 수 있도록 안내했습니다.
