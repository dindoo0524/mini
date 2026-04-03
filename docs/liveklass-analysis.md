# LiveKlass 프론트엔드 코드베이스 완전 분석

> 초보자 가이드 — "나는 API client, token 이런 거 정말 잘 모른다" 하는 분을 위해

---

## 0. 먼저 알아두면 좋은 용어들

코드를 보기 전에, 자주 나오는 용어들을 일상적인 비유로 정리했어요.
모르는 단어가 나오면 여기로 돌아와서 확인하세요!

### 모노레포 (Monorepo)

> **하나의 큰 서랍장에 여러 프로젝트를 넣어두는 것**

보통은 프로젝트마다 별도의 GitHub 저장소를 만들어요. 하지만 모노레포는 하나의 저장소 안에 여러 프로젝트를 함께 넣어요.
장점: 공통 코드를 쉽게 공유할 수 있고, 한 번에 빌드/배포할 수 있어요.

```
liveklass-frontend/          ← 하나의 저장소
├── services/lk-main/        ← 프로젝트 A (사용자 사이트)
├── services/lk-backoffice/  ← 프로젝트 B (관리자 대시보드)
└── packages/base-ui/        ← 공유 부품 (A, B 모두 사용)
```

### API 클라이언트 (API Client)

> **식당의 주문서 양식**

서버에 "이 데이터 주세요", "이거 저장해주세요" 같은 요청을 보내는 도구예요.
우리 프로젝트에서는 **Swagger(메뉴판)**에서 자동으로 주문서 양식을 만들어줘요.

```
[프론트엔드]  →  "유저 목록 주세요" (GET /users)  →  [서버]
[프론트엔드]  ←  { users: [...] }                  ←  [서버]
```

직접 `fetch("/api/users")`를 쓰는 대신, `api.get["/users"]()`처럼 **타입이 안전한** 함수를 써요.
오타를 내면 TypeScript가 미리 잡아줘요!

### 토큰 (Access Token / Refresh Token)

> **놀이공원 입장 팔찌(Access Token)와 재발급 쿠폰(Refresh Token)**

웹사이트에 로그인하면, 서버가 "이 사람은 인증됨"이라는 증표를 줘요. 이게 **토큰**이에요.

- **Access Token** = 놀이공원 입장 팔찌
  - 놀이기구 탈 때마다 보여줘요 (API 요청마다 첨부)
  - 시간이 지나면 만료돼요 (보통 15분~1시간)
- **Refresh Token** = 재발급 쿠폰
  - 팔찌가 만료되면 이걸로 새 팔찌를 받아요
  - 쿠폰 자체는 더 오래 유효해요 (보통 7일~30일)
  - 안전한 곳에 보관해요 (HTTP-only 쿠키)

```
[로그인] → Access Token(팔찌) + Refresh Token(쿠폰) 발급
[API 요청] → 팔찌 보여주기 → 성공!
[팔찌 만료] → 쿠폰으로 새 팔찌 발급 → 다시 요청 → 성공!
[쿠폰도 만료] → 다시 로그인해야 해요
```

### 인터셉터 (Interceptor)

> **모든 택배가 지나가는 검문소**

API 요청/응답이 오가는 중간에 끼어들어서 자동으로 무언가를 해주는 장치예요.

- **요청 인터셉터**: 모든 요청에 토큰을 자동 첨부 (매번 수동으로 안 해도 돼요!)
- **응답 인터셉터**: 401 에러(인증 만료)가 오면 자동으로 로그아웃 처리

```
[내 코드] → 요청 → [검문소: 토큰 붙이기] → [서버]
[서버] → 응답 → [검문소: 에러 확인] → [내 코드]
```

### Hydration (하이드레이션)

> **서버에서 만든 마네킹에 React가 숨을 불어넣는 과정**

1. 서버가 HTML을 미리 만들어요 (마네킹 = 보이기만 하고 클릭 안 됨)
2. 브라우저가 이 HTML을 먼저 보여줘요 (빠르게 화면이 뜸!)
3. React가 로드되면서 이벤트(클릭, 타이핑 등)를 연결해요 (숨을 불어넣기)

이게 **Hydration**이에요. 서버 렌더링(SSR)의 핵심 과정이죠.

### 캐싱 (Caching) / staleTime / gcTime

> **냉장고에 음식 보관하는 것**

서버에서 받은 데이터를 잠시 저장해두는 거예요. 같은 데이터를 또 요청하지 않아도 돼서 빨라요.

- **staleTime** = "이 음식은 X분 동안 신선하다"
  - 신선한 동안은 서버에 다시 안 물어봐요
- **gcTime** (Garbage Collection Time) = "신선하지 않아도 X분까지는 버리지 않는다"
  - 기한이 지나면 메모리에서 삭제해요

```
staleTime: 60초  → 1분 동안은 저장된 데이터 그대로 사용
staleTime: 0     → 매번 서버에 새로 물어봄 (백오피스처럼 항상 최신이 필요할 때)
```

### FSD (Feature-Sliced Design)

> **회사 조직도처럼 '무엇을 하는가'로 폴더를 나누는 방식**

보통: `components/`, `hooks/`, `utils/` (기술 기준)
FSD: `entities/User/`, `features/Login/`, `widgets/Header/` (역할 기준)

```
entities/  → 명사 (User, Course, Product) — "무엇인가?"
features/  → 동사 (Login, Approve, Search) — "무엇을 하는가?"
widgets/   → 조합 (Header, UserTable) — "여러 부품을 합친 것"
shared/    → 공통 도구 (Button, 유틸 함수)
```

**핵심 규칙: 위에서 아래로만 import 가능!**

```
app → pages → widgets → features → entities → shared
                                  ↑ features는 entities를 쓸 수 있지만
                        ↑ entities는 features를 쓸 수 없어요!
```

### 디자인 토큰 (Design Token)

> **디자이너의 색상표를 코드로 번역한 것**

디자이너가 Figma에서 정한 색상, 글꼴 크기, 간격 등을 JSON으로 정의하면,
자동으로 CSS 변수나 Tailwind 클래스로 변환돼요.

```
디자이너: "주요 색상은 #2563EB이야"
    ↓ 자동 변환
코드: className="bg-primary"  →  배경색 #2563EB 적용!
```

---

## 1. 전체 구조 — Big Picture

LiveKlass 프론트엔드는 **모노레포**로 구성돼 있어요.

### 폴더 구조

```
liveklass-frontend/
├── services/                    ← 실제 돌아가는 앱들
│   ├── lk-main/                ← 사용자가 보는 사이트 (포트 4000)
│   ├── lk-backoffice/          ← 관리자 대시보드 (포트 4010)
│   └── demo-ds/                ← 디자인 시스템 데모 (포트 8000)
│
├── packages/                    ← 공유 도구 상자
│   ├── base-ui/                ← 버튼, 모달, 테이블 등 UI 부품
│   ├── lk-api-client/          ← API 주문서 자동 생성기
│   ├── standard/               ← 회사 코딩 표준 (Query, Store, Error 등)
│   ├── ds-tokens/              ← 디자인 토큰 (색상, 글꼴 등)
│   ├── ds-token-builder/       ← 토큰 → CSS 변환기
│   ├── i18n/                   ← 다국어 (한국어/영어)
│   ├── config/                 ← ESLint, Prettier 공유 설정
│   └── mock/                   ← Mock 개발 환경
│
└── docs/                        ← 문서
```

### 의존성 흐름

```
┌─────────────────────────────────────────────────────────┐
│                      Services (앱)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   lk-main    │ │ lk-backoffice│ │   demo-ds    │    │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘    │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                    Packages (도구 상자)                   │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐            │
│  │ base-ui  │ │ lk-api-client│ │ standard │            │
│  └──────────┘ └──────────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ ┌────────┐        │
│  │ds-tokens │ │  i18n    │ │config│ │  mock  │        │
│  └──────────┘ └──────────┘ └──────┘ └────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 도구: pnpm workspaces + Turborepo

- **pnpm workspaces**: "이 폴더들은 하나의 프로젝트 가족이야"라고 선언
- **Turborepo**: 빌드할 때 변경된 것만 다시 빌드 (캐싱으로 빠름!)

```bash
pnpm dev          # 전체 개발 서버 시작
pnpm build        # 전체 빌드
pnpm lint         # 전체 린트
pnpm check-types  # 전체 타입 체크
```

---

## 2. lk-main — 사용자 대상 서비스

사용자가 실제로 접속하는 웹사이트예요. 강의 목록, 마이페이지 등이 여기에 있어요.

### 2.1 기술 스택 한눈에 보기

| 카테고리 | 기술 | 역할 |
|---------|------|------|
| 프레임워크 | **Next.js 16** (App Router) | 페이지 라우팅, 서버 렌더링 |
| UI | **React 19** | 컴포넌트 기반 UI |
| 언어 | **TypeScript 5** | 타입 안전성 |
| 서버 상태 | **TanStack Query v5** | API 데이터 캐싱 |
| 클라이언트 상태 | **Jotai** | 전역 UI 상태 |
| URL 상태 | **nuqs** | 검색 필터, 페이지네이션 |
| 스타일링 | **Tailwind CSS v4** + 디자인 토큰 | 유틸리티 CSS |
| 폼 | **TanStack Form** + **Zod** | 폼 상태 & 유효성 검사 |
| API | **@lk/api-client** (자동 생성) | 타입 안전한 API 호출 |
| 다국어 | **next-intl** | 한국어/영어 |
| 에러 추적 | **Sentry** | 에러 모니터링 |
| 분석 | **Amplitude**, **GA4** | 사용자 행동 분석 |

### 2.2 라우팅: [locale] 폴더의 비밀

```
app/
├── [locale]/           ← 다국어 지원을 위한 동적 폴더
│   ├── main/           → /ko/main, /en/main
│   ├── courses/        → /ko/courses, /en/courses
│   ├── mypage/         → /ko/mypage
│   ├── auth/logout/    → /ko/auth/logout
│   └── p/[pagePath]/   → /ko/p/some-page (동적 라우트)
├── health/             ← 서버 상태 확인 (다국어 불필요)
└── layout.tsx          ← 최상위 레이아웃
```

`[locale]`은 Next.js의 **동적 세그먼트**예요.
URL에 따라 `ko` 또는 `en`이 들어가서 같은 페이지를 다른 언어로 보여줘요.

**중요한 규칙**: `next/link` 대신 회사에서 만든 래퍼를 사용해요!
```typescript
// ❌ 직접 사용 금지 (ESLint가 막아요)
import Link from "next/link";

// ✅ 회사 래퍼 사용 (locale을 자동으로 붙여줘요)
import { Link } from "@/shared/lib/routing";
```

### 2.3 상태관리: 4가지 도구 선택법

"어떤 상태관리 도구를 써야 하지?" 고민될 때 이 흐름을 따라가세요:

```
상태가 필요하다
    │
    ├── 서버에서 오는 데이터인가? (유저 목록, 강의 정보 등)
    │   └── Yes → TanStack Query
    │
    ├── URL로 공유되어야 하는가? (검색어, 페이지 번호, 필터)
    │   └── Yes → nuqs
    │
    ├── 여러 컴포넌트에서 공유되는가? (로그인 상태, 테마)
    │   └── Yes → Jotai (createGlobalAtom / createPageAtom)
    │
    └── 한 컴포넌트 안에서만 쓰는가? (모달 열기/닫기, 입력값)
        └── Yes → useState
```

#### TanStack Query — "서버 데이터 전문가"

서버에서 가져온 데이터를 캐싱하고, 자동으로 새로고침해줘요.

```typescript
// entities/Course/model/courseQuery.ts
// 쿼리 옵션을 리턴하는 함수 (이 패턴이 핵심!)
export const courseQuery = (courseId: string) => {
  return {
    queryKey: ["courses", courseId] as const,  // 캐시 키
    queryFn: () => getCourse(courseId),          // 실제 API 호출
  };
};

// 사용하는 곳
const [{ data: course }] = useSharedQueries([courseQuery(courseId)]);
```

#### Jotai — "컴포넌트 간 공유 메모장"

```typescript
// 전역 상태 (앱 전체에서 공유, 페이지 이동해도 유지)
const { useValue: useAuth } = createGlobalAtom({ isAuthenticated: false });

// 페이지 상태 (해당 페이지에서만, 다른 페이지로 가면 초기화)
const { useAtom: useFormDataAtom } = createPageAtom({ name: "", email: "" });
```

#### nuqs — "URL에 상태를 저장하는 마법"

```typescript
// URL: /courses?search=React&page=2
const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
// search === "React", page === 2
```

URL에 저장하면 좋은 점: 새로고침해도 유지, 링크 공유하면 같은 상태!

### 2.4 API 통신 흐름

```
[Swagger 스펙]                           [코드에서 사용]
메뉴판 (API 명세)                         주문하기
     │                                       │
     ▼                                       ▼
pnpm api-gen                    api.get["/v1.0/users"]()
(자동 생성 명령)                  (타입이 안전한 API 호출)
     │                                       │
     ▼                                       ▼
@lk/api-client                  인터셉터가 토큰 자동 첨부
(TypeScript 코드 생성됨)                     │
                                             ▼
                                     서버에서 응답 받음
                                             │
                                     ├── 성공 → 데이터 반환
                                     └── 401 → 자동 로그아웃
```

**핵심**: API 호출 코드를 직접 안 짜요! Swagger 스펙에서 **자동 생성**돼요.

```typescript
// 이런 코드가 자동으로 만들어져요
const api = getMainApiClient();
const response = await api.get["/v1.0/courses"]({ page: 1, size: 10 });
// response.data의 타입이 자동으로 잡혀요!
```

### 2.5 인증 흐름

```
[사용자]                    [프론트엔드]                   [서버]
   │                            │                           │
   ├── 로그인 클릭 ────────────▶│                           │
   │                            ├── 외부 인증 서비스로 이동 ▶│
   │                            │                           │
   │                            │◀── access_token 쿠키 설정 ┤
   │                            │                           │
   │  ◀── 메인 페이지 표시 ─────┤                           │
   │                            │                           │
   ├── 강의 목록 요청 ─────────▶│                           │
   │                            ├── 쿠키의 토큰 첨부 ──────▶│
   │                            │◀── 강의 데이터 ───────────┤
   │  ◀── 강의 목록 표시 ──────┤                           │
   │                            │                           │
   │  (1시간 후, 토큰 만료)      │                           │
   │                            ├── API 요청 ──────────────▶│
   │                            │◀── 401 에러 ──────────────┤
   │                            ├── 자동 로그아웃 처리       │
   │  ◀── 로그인 페이지로 이동 ─┤                           │
```

**lk-main의 인증은 단순해요:**
1. 쿠키에 `access_token` 저장
2. 모든 API 요청에 자동 첨부 (인터셉터)
3. 401 오면 자동 로그아웃

---

## 3. lk-backoffice — 관리자 대시보드

관리자가 사용하는 내부 도구예요. **mini 프로젝트와 가장 비슷한 프로젝트**이기도 해요!

### 3.1 mini와 비교해보기

```
lk-backoffice의 FSD 구조          mini의 FSD 구조
src/                               (루트)
├── entities/Seller/               ├── entities/user/
│   ├── api/                       │   ├── api/
│   ├── model/                     │   ├── model/
│   ├── lib/                       │   │
│   ├── config/                    │   │
│   └── ui/                        │   │
├── features/                      ├── features/
│   ├── SellerFilter/              │   ├── user-search/
│   └── ...                        │   ├── user-approve/
├── widgets/                       │   └── user-edit/
│   ├── SellerList/                ├── widgets/
│   └── ...                        │   ├── user-table/
├── pages/                         │   ├── user-detail/
│   └── SellersPage/               │   └── dashboard/
└── shared/                        └── shared/
    ├── ui/                            ├── ui/
    └── lib/                           └── lib/
```

구조가 꽤 비슷하죠? 다만 백오피스에는 `lib/`, `config/` 같은 추가 세그먼트가 있어요.

### 3.2 FSD 아키텍처 실전편 — Seller 엔티티

백오피스에서 가장 잘 구현된 엔티티인 `Seller`를 살펴볼게요:

```
entities/Seller/
├── api/                          ← 서버와 통신하는 함수들
│   ├── getSellerList.ts          ← GET /v1.0/sellers
│   ├── getSellerDetail.ts        ← GET /v1.0/sellers/:id
│   ├── updateSeller.ts           ← PUT /v1.0/sellers/:id
│   ├── requestKycReview.ts       ← POST (특수 액션)
│   └── downloadSettlementFile.ts ← GET (파일 다운로드)
│
├── model/                        ← 데이터 로직
│   ├── sellerListQuery.ts        ← 목록 조회 쿼리 옵션
│   ├── sellerDetailQuery.ts      ← 상세 조회 쿼리 옵션
│   ├── useUpdateSeller.ts        ← 수정 Mutation 옵션
│   ├── useSellerFilters.ts       ← 필터 상태 관리
│   ├── sellerFormSchema.ts       ← Zod 유효성 검사 스키마
│   └── types.ts                  ← TypeScript 타입
│
├── lib/                          ← 유틸리티
│   └── createSellerFilterFields.ts
│
└── ui/                           ← Seller 전용 UI 조각
    └── sellerTableColumns.ts     ← 테이블 컬럼 정의
```

### 3.3 Query/Mutation 패턴

**이게 회사 코드에서 가장 중요한 패턴이에요!**

#### Query Options Factory (쿼리 옵션 공장)

```typescript
// entities/Seller/model/sellerListQuery.ts
export const sellerListQuery = (params?: SellerListParams) => {
  return {
    queryKey: ["sellers", "list", params] as const,  // 캐시 키
    queryFn: () => getSellerList(params!),             // API 호출
  } as const;
};
```

**왜 이렇게 할까?**
- `queryKey`와 `queryFn`을 한 곳에서 관리 → 실수 방지
- 어디서든 `sellerListQuery(params)`로 쉽게 사용
- 캐시 무효화할 때도 같은 함수에서 키를 가져올 수 있음

#### Mutation Options Factory (수정 옵션 공장)

```typescript
// entities/Seller/model/useUpdateSeller.ts
export const useUpdateSeller = () => {
  const queryClient = useQueryClient();
  
  return {
    mutationFn: async ({ channelSeq, data }) => 
      await updateSeller(channelSeq, data),
    onSuccess: (_, variables) => {
      // 수정 성공하면 상세 데이터 캐시를 새로고침
      const { queryKey } = sellerDetailQuery(String(variables.channelSeq));
      queryClient.invalidateQueries({ queryKey });
    },
  };
};

// 사용하는 곳
const updateMutation = useMutation(useUpdateSeller());
await updateMutation.mutateAsync({ channelSeq, data });
```

#### mini와의 차이점

```typescript
// 🏠 mini의 현재 방식 (직접적)
// widgets/user-table/hooks/use-users.ts
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

// 🏢 회사의 방식 (쿼리 옵션 분리)
// entities/user/model/userListQuery.ts
export const userListQuery = () => ({
  queryKey: ["users"] as const,
  queryFn: fetchUsers,
});
// 사용: useSharedQueries([userListQuery()])
```

mini의 방식도 동작하지만, 회사 방식은 **재사용**이 쉬워요.
같은 쿼리를 여러 곳에서 쓰거나, 캐시를 무효화할 때 편해요.

### 3.4 AsyncListTable — 테이블의 완성형

백오피스에서 테이블은 정말 중요해요. 회사에서는 이걸 하나의 컴포넌트로 추상화했어요:

```typescript
<AsyncListTable
  query={sellerListQuery(params)}           // 데이터 조회
  getDataFromResponse={(res) => res.content} // 응답에서 데이터 추출
  columns={columns}                          // 컬럼 정의
  onRowClick={handleRowClick}                // 행 클릭
  selectable                                 // 체크박스 선택
  enableColumnManagement                     // 컬럼 표시/숨기기
  sort={sort}                                // 정렬
  onSortChange={handleSortChange}            // 정렬 변경
  skeleton={{ rows: 10 }}                    // 로딩 중 스켈레톤
  keepPreviousData                           // 데이터 갱신 중 이전 데이터 유지
/>
```

이 하나의 컴포넌트가 **로딩, 에러, 빈 상태, 스켈레톤, 정렬, 선택, 컬럼 관리**를 다 처리해요!

### 3.5 URL 기반 필터링 & 페이지네이션 (nuqs)

백오피스에서는 검색 조건을 URL에 저장해요. 왜?
- 새로고침해도 필터가 유지돼요
- "이 검색 결과 봐봐" 하고 URL을 공유할 수 있어요
- 뒤로가기하면 이전 검색 조건으로 돌아가요

#### Two-Phase 필터링 (2단계 필터링)

```
[사용자가 입력 중]              [검색 버튼 클릭]
 (로컬 상태 변경)         →     (URL에 반영)
 빠른 타이핑 가능               API 호출 발생

Phase 1: 입력                   Phase 2: 적용
useState로 관리                 nuqs로 URL 변경
```

왜 2단계로 나눌까?
- 사용자가 글자 하나 칠 때마다 API를 호출하면 너무 느려요
- "검색" 버튼을 누를 때만 실제로 서버에 요청해요

```typescript
// Phase 1: 로컬 상태 (입력용)
const [keyword, setKeyword] = useState("");

// Phase 2: URL 상태 (적용된 필터)
const [appliedKeyword, setAppliedKeyword] = useQueryState('keyword');

const handleSearch = () => {
  setAppliedKeyword(keyword); // 검색 버튼 클릭 시 URL에 반영
};
```

#### 페이지네이션도 URL 기반

```typescript
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(10));

// URL: /admin/sellers?page=2&size=30&keyword=홍길동
```

### 3.6 폼 처리: TanStack Form + Zod

#### Zod — 데이터의 모양을 정의하는 도구

```typescript
// "이 데이터는 이런 모양이어야 해" 를 코드로 선언
const sellerFormSchema = z.object({
  name: z.string()
    .min(1, "이름을 입력하세요.")        // 최소 1글자
    .max(100, "100자 이내로 입력하세요."), // 최대 100글자
  email: z.string()
    .email("올바른 이메일 형식이 아닙니다."),
  rate: z.string()
    .refine((v) => {
      const num = Number(v);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "0~100 사이의 숫자를 입력하세요."),
});
```

#### TanStack Form — 폼 상태 관리

```typescript
const form = useForm({
  defaultValues: { name: "", email: "" },
  validators: {
    onChange: sellerFormSchema,  // 입력할 때마다 실시간 검증!
  },
});

// 제출 전 검증
await form.validate("change");
if (form.state.isValid) {
  // 저장 로직
}
```

#### mini와의 차이점

```typescript
// 🏠 mini: 직접 구현한 유효성 검사
if (!name.trim()) errors.name = "필수 항목입니다";
if (!email.includes("@")) errors.email = "이메일 형식이 아닙니다";

// 🏢 회사: Zod 스키마로 선언적 검증
const schema = z.object({
  name: z.string().min(1, "필수 항목입니다"),
  email: z.string().email("이메일 형식이 아닙니다"),
});
// → 스키마 하나로 프론트 검증 + API 요청 전 검증 + 타입 추론까지!
```

### 3.7 인증: OAuth + 토큰 갱신 큐

백오피스는 lk-main보다 인증이 더 복잡해요.

```
[관리자]                [프론트엔드]            [Cognito]          [API 서버]
   │                        │                     │                   │
   ├── 로그인 클릭 ────────▶│                     │                   │
   │                        ├── Cognito로 이동 ──▶│                   │
   │                        │                     │                   │
   │  ◀── 구글/카카오 로그인 │◀── code 발급 ──────┤                   │
   │                        │                     │                   │
   │                        ├── code → token 교환 ▶│                  │
   │                        │◀── access + refresh ─┤                  │
   │                        │                     │                   │
   │                        │ (access: 클라이언트 저장)                │
   │                        │ (refresh: HTTP-only 쿠키)               │
   │                        │                     │                   │
   │  ◀── 대시보드 표시 ────┤                     │                   │
```

#### 토큰 갱신 큐 — 동시 요청 문제 해결

만약 5개의 API 요청이 동시에 401을 받으면?
토큰 갱신을 5번 하면 안 되겠죠? **큐**로 해결해요:

```
요청 A → 401 → "내가 갱신할게!" → 토큰 갱신 시작
요청 B → 401 → "A가 갱신 중이네, 대기열에 들어가자"
요청 C → 401 → "대기열에 들어가자"
              ↓
         토큰 갱신 완료!
              ↓
요청 A → 새 토큰으로 재시도 → 성공!
요청 B → 새 토큰으로 재시도 → 성공!
요청 C → 새 토큰으로 재시도 → 성공!
```

이 패턴은 `shared/lib/apiClient/index.ts`에 구현되어 있어요.

### 3.8 에러 처리 3계층

```
에러가 발생했다!
    │
    ├── 🟠 S1 (Critical) — 큰 문제!
    │   예: 서버 다운(500), 네트워크 끊김
    │   처리: 화면에 에러 메시지 표시 + Sentry에 보고
    │
    ├── 🟡 S2 (Warning) — 작은 문제
    │   예: 잘못된 요청(400), 타임아웃
    │   처리: 토스트 알림 + Sentry에 보고
    │
    └── ⚪ S3 (Unknown) — 에러가 아닌 에러
        예: 사용자가 잘못 입력, 요청 취소
        처리: 조용히 넘어감 (사용자한테 알리지 않음)
```

#### Query vs Mutation 에러 처리가 달라요

```
Query 에러 (페이지 열 때):
  S1 → 화면 전체에 "문제가 발생했습니다" 표시
  S2 → 화면 전체에 에러 표시

Mutation 에러 (버튼 클릭 시):
  S1 → 토스트: "저장에 실패했습니다"
  S2 → 토스트: "문제가 발생했습니다"
```

왜 다르게?
- Query는 "페이지를 보여줘야 하는데 데이터가 없다" → 화면 자체를 에러로 전환
- Mutation은 "작업이 실패했다" → 기존 화면은 유지하고 알림만

### 3.9 백오피스만의 특별한 설정

```typescript
// 백오피스는 항상 최신 데이터가 필요해요 (금전 관련이니까!)
const NO_CACHE_QUERY_KEYS = [
  ["sellers"],
  ["settlementPolicies"],
  ["payoutRequest"],
];
// staleTime: 0, gcTime: 0 → 매번 서버에서 새로 가져옴
```

일반 사용자 사이트는 "1분 전 데이터도 괜찮아"이지만,
관리자 도구는 "항상 최신이어야 해" (정산 금액이 틀리면 큰일!)

---

## 4. 디자인 시스템 — @futureschole/base-ui

### 4.1 구조

```
packages/base-ui/src/
├── base/                    ← 25개+ 기본 컴포넌트
│   ├── Button/              ← 버튼 (여러 변형)
│   ├── TextField/           ← 텍스트 입력
│   ├── Select/              ← 드롭다운 선택
│   ├── Dialog/              ← 모달 팝업
│   ├── Table/               ← 테이블
│   ├── Tabs/                ← 탭 메뉴
│   ├── Checkbox/            ← 체크박스
│   ├── Radio/               ← 라디오 버튼
│   ├── Badge/               ← 상태 뱃지
│   ├── Toast/               ← 토스트 알림
│   ├── Pagination/          ← 페이지네이션
│   ├── ThemeProvider/       ← 테마 (라이트/다크)
│   └── ... (총 25개+)
└── admin/                   ← 어드민 전용 컴포넌트
    ├── Alert/
    └── Filter/
```

**mini에서 쓰는 shadcn/ui와 비슷한 점**: 둘 다 Radix UI(접근성) + Tailwind CSS(스타일링)을 기반으로 해요!

### 4.2 디자인 토큰 파이프라인

```
[디자이너]                [토큰 정의]              [자동 변환]            [코드에서 사용]
Figma에서                 ds-tokens/               ds-token-builder       base-ui & 앱에서
색상 결정                 JSON 파일                Style Dictionary       className으로 사용
     │                       │                        │                       │
     ▼                       ▼                        ▼                       ▼
"주요색은            {                          Tailwind 프리셋        bg-primary
 #2563EB"             "primary": {              생성                   text-muted
                        "value": "#2563EB"                              border-border
                      }
                    }
```

토큰 예시:
- **색상**: `gray-50` ~ `gray-950`, `blue`, `red`, `green` 등 16개 팔레트
- **글꼴 크기**: 10px ~ 50px (12단계)
- **글꼴 굵기**: regular(400), medium(525), bold(650)
- **둥글기**: xs(4px) ~ full(9999px)

### 4.3 Tailwind Variants — 컴포넌트 변형 관리

```typescript
// Button의 variant 시스템
const buttonVariants = tv({
  slots: {
    base: ["rounded-md", "font-medium"],      // 기본 스타일
    label: ["truncate"],                        // 라벨 텍스트
    icon: ["shrink-0"],                         // 아이콘
    spinner: ["animate-spin"],                  // 로딩 스피너
  },
  variants: {
    variant: {
      "primary-solid": {
        base: "bg-primary text-white",
      },
      "secondary-outline": {
        base: "border border-gray-300 text-gray-700",
      },
    },
    size: {
      lg: { base: "h-12 px-6", label: "text-base" },
      md: { base: "h-10 px-4", label: "text-sm" },
      sm: { base: "h-8 px-3", label: "text-xs" },
    },
  },
});

// 사용
<Button variant="primary-solid" size="md">저장</Button>
```

**핵심**: `tv()` (Tailwind Variants)로 variant를 선언하면,
`className`을 직접 조합하지 않아도 깔끔하게 스타일을 관리할 수 있어요.

### 4.4 ThemeProvider — 라이트/다크 모드

```typescript
// 앱 최상위에서 테마 초기화
import { ThemeProvider, initialize } from '@futureschole/base-ui';
import { tokens, variants } from '@futureschole/base-ui/generated/tokens';

initialize({ tokens, variants });

<ThemeProvider defaultTheme="light">
  <App />
</ThemeProvider>
```

`data-theme="light"` 또는 `data-theme="dark"`이 `<html>`에 설정되고,
CSS 변수가 자동으로 전환돼요.

---

## 5. 세 프로젝트 비교표

| 항목 | lk-main | lk-backoffice | mini (현재) |
|------|---------|---------------|-------------|
| **FSD 아키텍처** | ✅ 완전 적용 | ✅ 완전 적용 | ✅ 기본 구조 |
| **TanStack Query** | useSharedQueries | useSharedQueries | useQuery (직접) |
| **상태관리** | Jotai + nuqs | Jotai + nuqs | useState만 |
| **API 클라이언트** | 자동 생성 (OpenAPI) | 자동 생성 (OpenAPI) | Mock (인메모리) |
| **폼 처리** | TanStack Form + Zod | TanStack Form + Zod | 직접 구현 (useState) |
| **에러 처리** | AppError + AsyncBoundary + Sentry | AppError + AsyncBoundary + Sentry | 기본 (isError 체크) |
| **인증** | Cookie + 자동 로그아웃 | OAuth + 토큰 갱신 큐 | 없음 |
| **URL 상태** | nuqs | nuqs + 2단계 필터링 | 직접 구현 (searchParams) |
| **디자인 시스템** | @futureschole/base-ui | @futureschole/base-ui | shadcn/ui |
| **테이블** | 기본 | AsyncListTable (고급) | 직접 구현 |
| **다국어** | next-intl | - | - |
| **테스트** | Storybook | Storybook | Vitest |

---

## 6. 핵심 파일 경로 Quick Reference

나중에 실제 코드를 볼 때 참고하세요:

### 프로젝트 설정
| 파일 | 위치 |
|------|------|
| 모노레포 설정 | `pnpm-workspace.yaml`, `turbo.json` |
| ESLint | `packages/config/eslint.js` |
| TypeScript | 각 서비스의 `tsconfig.json` |

### lk-main
| 패턴 | 파일 |
|------|------|
| 앱 초기화 | `services/lk-main/src/app/initialization/` |
| API 클라이언트 | `services/lk-main/src/shared/lib/apiClient/` |
| 인증 상태 | `services/lk-main/src/shared/lib/store/atoms/AuthenticationAtom.ts` |
| 라우팅 래퍼 | `services/lk-main/src/shared/lib/routing/` |

### lk-backoffice
| 패턴 | 파일 |
|------|------|
| Entity 예시 | `services/lk-backoffice/src/entities/Seller/` |
| 테이블 컴포넌트 | `services/lk-backoffice/src/shared/ui/AsyncListTable/` |
| API 클라이언트 + 인터셉터 | `services/lk-backoffice/src/shared/lib/apiClient/index.ts` |
| 에러 처리 정책 | `docs/patterns/error-handling-policy.md` |

### 디자인 시스템
| 패턴 | 파일 |
|------|------|
| 컴포넌트 | `packages/base-ui/src/base/` |
| 토큰 정의 | `packages/ds-tokens/tokens/themes/base/primitive/` |
| 변형 관리 | `packages/base-ui/src/base/variants/index.ts` |

### 문서
| 주제 | 파일 |
|------|------|
| 상태관리 가이드 | `docs/patterns/state-management.md` |
| Query/Mutation 패턴 | `docs/patterns/tanstack-query.md` |
| FSD 아키텍처 | `docs/architecture/fsd.md` |
| 에러 처리 정책 | `docs/patterns/error-handling-policy.md` |
