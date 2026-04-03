# mini 프로젝트 학습 로드맵

> LiveKlass 실전 패턴 마스터하기 — 단계별로 하나씩!

---

## 현재 상태 체크리스트

mini 프로젝트가 이미 갖추고 있는 것들:

- [x] FSD 아키텍처 (entities, features, widgets, shared)
- [x] Mock API (인메모리 저장소)
- [x] User CRUD (목록, 검색, 필터, 승인, 수정)
- [x] Dashboard (통계 카드 + 최근 가입자)
- [x] Toast 알림 (Sonner)
- [x] shadcn/ui 컴포넌트 (Card, Button)
- [x] TanStack Query (기본 useQuery/useMutation)
- [x] Vitest 테스트 (46개 통과)
- [x] GitHub 연동 (dindoo0524/mini)

---

## 로드맵 전체 그림

```
Phase 1: 기초 다지기 (현재 코드를 프로덕션 수준으로)
  ├── Step 1: Query 패턴 정비           ⭐ 쉬움
  ├── Step 2: URL 상태 관리 (nuqs)      ⭐ 쉬움
  └── Step 3: 에러/로딩 경계 처리       ⭐⭐ 보통

Phase 2: 실전 패턴 적용
  ├── Step 4: Zod 폼 검증 도입          ⭐⭐ 보통
  ├── Step 5: Supabase 연동             ⭐⭐⭐ 도전
  └── Step 6: 인증 (Supabase Auth)      ⭐⭐⭐ 도전

Phase 3: 고급 패턴
  ├── Step 7: 고급 테이블               ⭐⭐⭐ 도전
  └── Step 8: AI 기능 추가              ⭐⭐ 보통
```

---

## Phase 1: 기초 다지기

### Step 1: Query 패턴을 프로덕션 스타일로

> **배우는 프로덕션 패턴**: Query Options Factory, Mutation Options Factory

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐ 쉬움 |
| 예상 작업 | 파일 5~6개 수정 |
| 프로덕션 참고 | `docs/patterns/tanstack-query.md` |

#### 현재 mini 코드

```typescript
// widgets/user-table/hooks/use-users.ts
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}
```

쿼리 키와 함수가 **위젯 안에** 숨어있어요.
다른 곳에서 같은 데이터가 필요하면 또 만들어야 해요.

#### 목표 코드

```typescript
// entities/user/model/userListQuery.ts (쿼리 옵션 팩토리)
export const userListQuery = () => ({
  queryKey: ["users"] as const,
  queryFn: fetchUsers,
});

// entities/user/model/userQuery.ts
export const userQuery = (userId: string) => ({
  queryKey: ["users", userId] as const,
  queryFn: () => fetchUserById(userId),
});

// entities/user/model/useApproveUser.ts (뮤테이션 옵션)
export const useApproveUser = () => {
  const queryClient = useQueryClient();
  return {
    mutationFn: (userId: string) => approveUser(userId),
    onSuccess: () => {
      const { queryKey } = userListQuery();
      queryClient.invalidateQueries({ queryKey });
    },
  };
};

// widgets/user-table/hooks/use-users.ts (사용)
export function useUsers() {
  return useQuery(userListQuery());  // 한 줄로 끝!
}
```

#### 체크리스트

- [ ] `entities/user/model/userListQuery.ts` 생성
- [ ] `entities/user/model/userQuery.ts` 생성
- [ ] `entities/user/model/userStatsQuery.ts` 생성 (Dashboard용)
- [ ] `features/user-approve/hooks/use-approve-user.ts` → 옵션 팩토리로 변경
- [ ] `features/user-edit/hooks/use-update-user.ts` → 옵션 팩토리로 변경
- [ ] `widgets/*/hooks/` → 새 쿼리 함수 사용하도록 수정
- [ ] `entities/user/index.ts` → 새 export 추가
- [ ] 테스트 실행 (`pnpm test`) 확인

---

### Step 2: URL 상태 관리 — nuqs 도입

> **배우는 프로덕션 패턴**: URL-driven State, Two-Phase Filtering, URL Pagination

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐ 쉬움 |
| 설치 | `pnpm add nuqs` |
| 프로덕션 참고 | `docs/patterns/state-management.md` (Section 3) |

#### 현재 mini 코드

```typescript
// widgets/user-table/ui/user-table.tsx
const [searchParams, setSearchParams] = useState<UserSearchParams>(initialSearch);
// → useState로 관리 → 새로고침하면 사라짐!
```

#### 목표 코드

```typescript
// nuqs로 URL 상태 관리
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

const [status, setStatus] = useQueryState('status', parseAsString.withDefault('all'));
const [keyword, setKeyword] = useQueryState('keyword', parseAsString.withDefault(''));
const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
// URL: /admin/users?status=pending&keyword=Joy&page=2
```

#### 체크리스트

- [ ] `pnpm add nuqs` 설치
- [ ] NuqsAdapter 설정 (Next.js App Router용)
- [ ] `widgets/user-table/` — 필터를 nuqs로 변경
- [ ] 페이지네이션 추가 (URL 기반)
  - [ ] `shared/ui/Pagination` 컴포넌트 (shadcn/ui에서 추가)
  - [ ] 페이지당 10/30/50개 선택
- [ ] `entities/user/model/search-params.ts` — nuqs 기반으로 리팩토링
- [ ] 새로고침 후 필터 유지 확인
- [ ] 뒤로가기/앞으로가기 확인

---

### Step 3: 에러/로딩 경계 처리

> **배우는 프로덕션 패턴**: AsyncBoundary, Suspense, Error Boundary

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐ 보통 |
| 프로덕션 참고 | `docs/patterns/error-handling-policy.md` |

#### 현재 mini 코드

```typescript
// 모든 위젯에서 직접 로딩/에러 처리
const { data, isLoading, isError } = useQuery(...);
if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage />;
return <ActualContent data={data} />;
```

매번 `isLoading`, `isError` 체크하는 게 반복돼요.

#### 목표 코드

```typescript
// shared/ui/AsyncBoundary.tsx (한 번만 만들면 끝!)
<AsyncBoundary
  loadingFallback={<Skeleton />}
  errorFallback={({ error, retry }) => (
    <ErrorCard message={error.message} onRetry={retry} />
  )}
>
  <UserTable />  {/* 여기서는 data만 신경 쓰면 돼요! */}
</AsyncBoundary>
```

#### 체크리스트

- [ ] `shared/ui/AsyncBoundary.tsx` 컴포넌트 생성
  - [ ] ErrorBoundary (react-error-boundary) + Suspense 조합
  - [ ] 재시도(retry) 버튼 포함
- [ ] `shared/ui/ErrorCard.tsx` — 에러 표시 UI
- [ ] Dashboard: 각 통계 카드를 독립적인 AsyncBoundary로 감싸기
- [ ] User Table: AsyncBoundary 적용
- [ ] User Detail: AsyncBoundary 적용
- [ ] `useSuspenseQuery`로 전환 (또는 커스텀 wrapper)

---

## Phase 2: 실전 패턴 적용

### Step 4: Zod 폼 검증 도입

> **배우는 프로덕션 패턴**: Schema-based Validation, TanStack Form

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐ 보통 |
| 설치 | `pnpm add zod @tanstack/react-form @tanstack/zod-form-adapter` |
| 프로덕션 참고 | `services/lk-backoffice/src/entities/Seller/model/sellerFormSchema.ts` |

#### 현재 mini 코드

```typescript
// entities/user/model/validation.ts
export function validateUser(user) {
  const errors = {};
  if (!user.name.trim()) errors.name = "Name is required";
  if (!user.email.trim()) errors.email = "Email is required";
  return errors;
}
```

#### 목표 코드

```typescript
// entities/user/model/userFormSchema.ts
import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요.").max(50, "50자 이내로 입력하세요."),
  email: z.string().min(1, "이메일을 입력하세요.").email("올바른 이메일 형식이 아닙니다."),
  status: z.enum(["pending", "approved"]),
});

// 타입도 자동으로 추론돼요!
export type UserFormValues = z.infer<typeof userFormSchema>;

// features/user-edit/hooks/useUserEditForm.ts
export const useUserEditForm = (defaultValues: UserFormValues) => {
  return useForm({
    defaultValues,
    validators: { onChange: userFormSchema },
  });
};
```

#### 체크리스트

- [ ] `pnpm add zod` 설치
- [ ] `entities/user/model/userFormSchema.ts` 생성 (Zod 스키마)
- [ ] `features/user-edit/ui/user-edit-form.tsx` — Zod 검증 연동
- [ ] 기존 `validation.ts` → Zod 기반으로 교체
- [ ] (선택) TanStack Form 도입
- [ ] 실시간 에러 메시지 동작 확인
- [ ] 기존 테스트 업데이트

---

### Step 5: Supabase 연동 — 진짜 백엔드

> **배우는 프로덕션 패턴**: Real API Client, 환경 변수, Server/Client 분리

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐⭐ 도전 |
| 설치 | `pnpm add @supabase/supabase-js` |
| 프로덕션 참고 | `services/lk-backoffice/src/shared/lib/apiClient/` |

#### 현재 → 목표

```
현재: Mock API (인메모리, 새로고침하면 초기화)
  ↓
목표: Supabase (진짜 DB, 데이터 영구 저장)
```

이 단계를 거치면 "토이 프로젝트"가 "실제 서비스"가 돼요!

#### 체크리스트

- [ ] Supabase 프로젝트 생성 (supabase.com)
- [ ] `users` 테이블 생성
  ```sql
  create table users (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    email text not null,
    status text default 'pending',
    created_at timestamptz default now()
  );
  ```
- [ ] `.env.local` 환경 변수 설정
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  ```
- [ ] `shared/lib/supabase/client.ts` — 브라우저용 Supabase 클라이언트
- [ ] `shared/lib/supabase/server.ts` — 서버용 Supabase 클라이언트
- [ ] `entities/user/api/user-api.ts` — Mock → Supabase로 교체
  ```typescript
  export async function fetchUsers(): Promise<User[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  ```
- [ ] `.gitignore`에 `.env.local` 추가 확인
- [ ] CRUD 전체 동작 확인

**프로덕션과의 대응:**
| mini (Supabase) | 프로덕션 (OpenAPI) |
|------------------|-------------------|
| `shared/lib/supabase/client.ts` | `shared/lib/apiClient/index.ts` |
| `shared/lib/supabase/server.ts` | `shared/lib/apiClient/server.ts` |
| `.env.local` | `.env.development` |

---

### Step 6: 인증 — Supabase Auth

> **배우는 프로덕션 패턴**: Auth Flow, Protected Routes, Token Management

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐⭐ 도전 |
| 프로덕션 참고 | `services/lk-backoffice/src/shared/lib/apiClient/index.ts` (401 인터셉터) |

#### 체크리스트

- [ ] Supabase Auth 설정 (이메일/비밀번호 또는 OAuth)
- [ ] `app/login/page.tsx` — 로그인 페이지
- [ ] `app/admin/` → `app/(authenticated)/admin/` 라우트 그룹으로 변경
- [ ] `middleware.ts` — 인증 안 된 사용자 리다이렉트
  ```typescript
  // 프로덕션의 withRouteAuth를 단순화한 버전
  export async function middleware(request: NextRequest) {
    const supabase = createServerClient(/* ... */);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  ```
- [ ] `shared/lib/store/authAtom.ts` — 인증 상태 (Jotai 또는 Context)
- [ ] 로그아웃 기능
- [ ] 로그인 안 한 상태로 `/admin` 접근 시 리다이렉트 확인

**프로덕션과의 대응:**
| mini | 프로덕션 |
|------|---------|
| Supabase Auth | Cognito OAuth |
| `middleware.ts` | `withRouteAuth` proxy |
| authAtom (Context/Jotai) | `AuthenticationAtom` (Jotai) |
| 자동 세션 관리 (Supabase) | 토큰 갱신 큐 (직접 구현) |

---

## Phase 3: 고급 패턴

### Step 7: 고급 테이블 패턴

> **배우는 프로덕션 패턴**: Column Management, Row Selection, Bulk Actions, Sorting

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐⭐ 도전 |
| 설치 | `pnpm add @tanstack/react-table` |
| 프로덕션 참고 | `services/lk-backoffice/src/shared/ui/AsyncListTable/` |

#### 체크리스트

- [ ] `@tanstack/react-table` 설치
- [ ] `shared/ui/DataTable/` 컴포넌트 생성
  - [ ] 기본 테이블 렌더링
  - [ ] 컬럼 정렬 (URL 기반, nuqs 연동)
  - [ ] 행 선택 (체크박스)
  - [ ] 컬럼 표시/숨기기 관리
- [ ] `shared/ui/FloatingActionBar/` — 선택 시 하단에 액션 바 표시
- [ ] User Table을 DataTable로 교체
- [ ] 일괄 승인 기능 (선택한 유저 한번에 승인)

---

### Step 8: AI 기능 추가

> **배우는 프로덕션 패턴**: External API Integration, Streaming, Feature Slice

| 항목 | 내용 |
|------|------|
| 난이도 | ⭐⭐ 보통 |
| 설치 | `pnpm add @anthropic-ai/sdk` |
| 프로덕션 참고 | 백오피스에도 `@anthropic-ai/sdk` 설치되어 있음 |

#### 아이디어

- **유저 분석 요약**: "이번 주 가입 트렌드를 분석해줘"
- **자연어 검색**: "pending 상태인 gmail 유저 보여줘"
- **리포트 생성**: 유저 데이터 기반 주간 리포트

#### 체크리스트

- [ ] `app/api/ai/route.ts` — AI API 라우트 생성
- [ ] `features/ai-analysis/` — 새 feature slice 생성
  - [ ] `ui/AiAnalysisPanel.tsx` — 분석 결과 표시
  - [ ] `hooks/useAiAnalysis.ts` — API 호출 hook
- [ ] 스트리밍 응답 처리 (실시간으로 텍스트 표시)
- [ ] Dashboard에 AI 분석 위젯 추가

---

## 프로덕션 패턴 매핑표

| Step | 배우는 패턴 | 프로덕션 참고 파일 | 난이도 |
|------|------------|-------------------|--------|
| 1 | Query Options Factory | `docs/patterns/tanstack-query.md` | ⭐ |
| 2 | URL State (nuqs) | `docs/patterns/state-management.md` | ⭐ |
| 3 | AsyncBoundary | `docs/patterns/error-handling-policy.md` | ⭐⭐ |
| 4 | Zod + Form Validation | `lk-backoffice/src/entities/Seller/model/sellerFormSchema.ts` | ⭐⭐ |
| 5 | Real API Client | `lk-backoffice/src/shared/lib/apiClient/` | ⭐⭐⭐ |
| 6 | Auth + Protected Routes | `lk-backoffice/src/shared/lib/apiClient/index.ts` | ⭐⭐⭐ |
| 7 | Advanced Table | `lk-backoffice/src/shared/ui/AsyncListTable/` | ⭐⭐⭐ |
| 8 | External API + Streaming | Feature slice 패턴 일반 | ⭐⭐ |

---

## 추천 진행 순서

```
지금 바로 시작할 수 있는 것:
  Step 1 (Query 정비) + Step 2 (nuqs) → 같이 진행 가능

그 다음:
  Step 3 (AsyncBoundary) → Step 4 (Zod)

큰 도약:
  Step 5 (Supabase) → Step 6 (인증) → 여기까지 오면 "실제 서비스"

마무리:
  Step 7 (테이블) → Step 8 (AI)
```

각 Step을 완료할 때마다 **커밋 & 푸시**하면서 GitHub에 기록을 남기세요!
나중에 포트폴리오로도 활용할 수 있어요.

---

> 궁금한 Step이 있으면 "Step X 시작하자!" 라고 말해주세요. 타타가 바로 함께 진행할게요!
