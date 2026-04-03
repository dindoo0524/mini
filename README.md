<div align="center">

# mini

**User Management Admin Dashboard**

Next.js 16 · React 19 · TanStack Query · Feature-Sliced Design

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

</div>

---

## Overview

사용자 승인, 검색, 편집 기능을 갖춘 어드민 대시보드입니다.  
**Feature-Sliced Design** 아키텍처를 기반으로, 관심사 분리와 확장성에 초점을 맞췄습니다.

> 100% Vibe Coding으로 만들어졌습니다. 사람 손으로 작성된 코드는 단 한 줄도 없습니다.

---

## Features

| Feature | Description |
|---------|-------------|
| **User List** | 전체 사용자 목록을 테이블 형태로 조회 |
| **Search & Filter** | 이름/ID 검색, 상태별(Pending/Approved) 필터링 |
| **User Approval** | 확인 다이얼로그를 통한 사용자 승인 워크플로우 |
| **User Edit** | 이름, 이메일, 상태 수정 + 실시간 유효성 검사 |
| **URL State Sync** | 검색 조건이 URL에 반영되어 딥링크 & 뒤로가기 지원 |
| **Loading Skeleton** | 데이터 로딩 중 스켈레톤 UI 표시 |
| **Error Handling** | API 실패 시 에러 메시지 + 재시도 |

---

## Architecture

[Feature-Sliced Design](https://feature-sliced.design/) 방법론을 따릅니다.

```
mini/
├── app/                  # Application layer (Next.js App Router)
│   └── admin/users/      # 사용자 관리 페이지 라우팅
│
├── entities/user/        # Entity layer — 핵심 비즈니스 로직
│   ├── api/              # API 호출 (fetchUsers, approveUser, updateUser)
│   └── model/            # 타입, 유효성 검사, 필터, 상태 변환
│
├── features/             # Feature layer — 독립적인 기능 단위
│   ├── user-search/      # 검색 & 필터 폼
│   ├── user-approve/     # 승인 다이얼로그 + mutation hook
│   └── user-edit/        # 수정 폼 + mutation hook
│
├── widgets/              # Widget layer — 복합 UI 조합
│   ├── user-table/       # 사용자 목록 테이블 (검색 + 승인 통합)
│   └── user-detail/      # 사용자 상세 (조회 + 편집 통합)
│
└── shared/               # Shared layer — 공통 유틸 & UI
    ├── lib/              # QueryProvider 등
    └── ui/               # Dialog, StatusBadge 등
```

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19** + **Tailwind CSS 4** |
| Language | **TypeScript 5** |
| Data Fetching | **TanStack React Query 5** |
| Testing | **Vitest 4** |
| Package Manager | **pnpm** |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm vitest
```

Open [http://localhost:3000/admin/users](http://localhost:3000/admin/users) to see the dashboard.

---

## Routes

| Path | Description |
|------|-------------|
| `/admin/users` | 사용자 목록 페이지 |
| `/admin/users/[id]` | 사용자 상세 페이지 |

---

## Data Flow

```
User Action → Feature Hook (mutation) → Entity API → React Query Cache → Widget Re-render
```

예시: 사용자 승인 플로우

```
[Approve 클릭] → ApproveDialog → useApproveUser() → approveUser(id) → Cache Invalidation → UserTable 갱신
```

---

<div align="center">

Built with AI. Powered by vibes.

</div>
