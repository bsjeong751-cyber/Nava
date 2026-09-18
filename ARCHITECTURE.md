# 노바리아 (Novaria) — 로컬 큐레이션 기반 스마트 여행 가이드

> "여행을 계획하는 것이 아니라, 나만의 여행을 기록하세요."
> AI가 초안 80%를 만들고, 사용자가 20%를 완성하는 여행 가이드북 앱.

이 문서는 마스터 기획서(사업 기획 + 개발 마스터 프롬프트)를 기반으로 한
**시스템 아키텍처 / 기술 스택 / MVP 범위 / 로드맵**을 정리한다. 기획서의 "85. 개발 시작 시 반드시
먼저 할 것" 요구사항에 따라 코드를 작성하기 전에 이 설계를 먼저 문서화한다.

## 1. 전체 시스템 아키텍처

```
                     ┌────────────────────┐
                     │   Mobile App        │
                     │ (Expo / React Native)│
                     └─────────┬───────────┘
                               │ HTTPS (REST, JWT)
                     ┌─────────▼───────────┐
                     │   Backend API        │
                     │ (NestJS)              │
                     │  - Auth               │
                     │  - Trips / Routes      │
                     │  - Recommendation      │
                     │  - Community           │
                     │  - Payments (stub)     │
                     └───┬─────────┬────────┘
                         │         │
              ┌──────────▼───┐ ┌───▼────────────┐
              │ PostgreSQL    │ │ External APIs   │
              │ (Prisma ORM)  │ │ Map / AI / Pay  │
              └───────────────┘ │ (Provider 추상화, │
                                 │  현재 MOCK)      │
                                 └─────────────────┘
```

- **모바일 앱이 외부 AI/지도/결제 API 키를 직접 들고 있지 않는다.** 반드시 백엔드를 경유한다
  (마스터 프롬프트 54항).
- 지도(Mapbox), AI(LLM), 결제(PG사), 장소 검색 등은 전부 **Provider 인터페이스로 추상화**하고,
  실제 API 키가 없는 현재는 `Mock*Provider` 구현체를 사용한다. 코드 내에 `// MOCK DATA`로 명시한다
  (75, 76항 원칙).

## 2. 기술 스택 (선정 이유)

| 영역 | 선택 | 이유 |
|---|---|---|
| 모바일 | Expo (React Native + TypeScript) | 기획서 53항의 RN/Flutter 중 RN 선택. Expo는 초기 MVP 개발/실행 속도가 빠르고 카메라·위치·푸시 등 네이티브 모듈을 관리형으로 제공해 2차 개발(GPS, 카메라)로 자연스럽게 확장 가능 |
| 백엔드 | NestJS (Node.js/TypeScript) | 기획서 53항 명시. 모듈 구조가 강제되어 "기능별 모듈화" 원칙(68항)을 지키기 쉽고, 인증/가드/파이프 등 표준 패턴 제공 |
| DB | PostgreSQL + Prisma ORM | 관계형 데이터(여행-일자-루트-장소)가 많고 트랜잭션/제약이 중요. Prisma로 스키마=마이그레이션=타입을 동기화 |
| 인증 | JWT (Passport) | 이메일 기반 MVP 인증. 이후 Google/Apple/카카오/네이버 OAuth로 확장 (40항) |
| 지도 | Mapbox (Provider 추상화, 현재 Mock) | 기획서 14항. 실제 키 연동 전까지 `MockMapProvider` 사용 |
| AI 추천 | 규칙 기반 엔진 + LLM 훅 (현재 Mock) | 58항 "LLM과 추천 알고리즘 분리" 원칙에 따라 거리/시간/예산 계산은 규칙 기반, 장소 설명/자연어 이해는 LLM 자리만 마련 |
| 캐시 | Redis (2차 개발에서 도입) | MVP에서는 생략, 인터페이스만 고려 |

## 3. 데이터베이스 ERD (MVP 범위)

기획서 39항의 테이블 목록 중 MVP(64항)에 필요한 핵심 테이블만 우선 구현한다.

```
User 1───* Trip 1───* TripDay 1───* RoutePlace *───1 Place
 │              │
 │              └───* Route (A/B/C 비교안, 각 Route가 여러 RoutePlace를 가짐)
 │
 └───1 UserPreference

User 1───* CommunityPost ───* CommunityComment
CommunityPost ───* CommunityReport
Trip ───1 CommunityPost (공유 시 연결, nullable)
```

자세한 필드는 `backend/prisma/schema.prisma` 참고. 결제/제휴/GPS/이미지분석/음성 관련 테이블은
스키마에 자리만 마련(2차/3차 개발)해두고 API는 아직 구현하지 않는다.

## 4. API 명세 (MVP)

| Method | URL | 설명 | 인증 |
|---|---|---|---|
| POST | /auth/signup | 이메일 회원가입 | - |
| POST | /auth/login | 로그인, JWT 발급 | - |
| GET | /users/me | 내 정보 | JWT |
| POST | /trips | 여행 조건 입력 → 생성 (draft) | JWT |
| GET | /trips/:id | 여행(가이드북) 상세 | JWT |
| GET | /trips | 내 여행 목록 | JWT |
| POST | /trips/:id/routes/generate | 추천 루트 2~3개 생성 (추천 엔진 호출) | JWT |
| PATCH | /trips/:id/routes/:routeId/places | 장소 추가/삭제/순서변경 → 재계산 | JWT |
| POST | /trips/:id/select-route | 비교안 중 하나 최종 선택 | JWT |
| GET | /places/search?q= | 장소 검색 (Mock Provider) | JWT |
| POST | /community/posts | 여행 지도 공유 | JWT |
| GET | /community/posts | 커뮤니티 피드 | JWT |
| GET | /community/posts/:id | 게시물 상세 | JWT |
| POST | /community/posts/:id/import | 내 여행으로 복사해오기 | JWT |
| POST | /community/posts/:id/report | 신고 | JWT |

모든 응답은 `{ data, error }` 형태로 통일하고, 에러는 사용자向 한글 메시지로 변환한다
(51항 "API Error 500" 같은 메시지 노출 금지).

## 5. 화면 구조 (MVP)

```
Splash → Onboarding → Login/Signup → Home
Home ─┬─ 새 지도 만들기 → NewTripFlow(지역→기간→취향→원하는장소→예산→강도→이동수단) → RouteCompare → TripGuidebook
      ├─ 지도 불러오기 → (내 저장 / 커뮤니티 인기 / 지역별) → TripGuidebook
      └─ 커뮤니티 → PostDetail → (내 지도에 가져오기) → TripGuidebook
TripGuidebook → TripEdit (장소 추가/삭제/순서/시간 편집 → 재계산)
```

## 6. MVP 범위 (이번 구현)

**포함**
- 프로젝트 구조 (모노레포: backend / mobile)
- DB 스키마 (핵심 테이블)
- 인증 (회원가입/로그인, JWT)
- 여행 조건 입력 플로우 (지역/기간/취향/원하는 장소/예산/체력/이동수단)
- 규칙 기반 추천 엔진 (가성비/동선최적화/현지감성 3개 루트, Mock 장소 데이터 기반)
- 루트 비교, 여행 가이드북(Day-by-Day) 화면
- 루트 편집(장소 추가/삭제/순서 변경) + 재계산
- 커뮤니티 게시/피드/가져오기 (최소 기능)
- 베이지톤 "여행 일기장" 감성 UI 테마

**제외 (2차/3차 개발, 인터페이스만 준비)**
- 실제 Mapbox/GPS 연동, 실시간 재계산
- 이미지 분석(메뉴판/간판), 음성 인식
- 실결제(PG 연동), 제휴 수수료, 광고
- 관리자 시스템, 자동 콘텐츠 모니터링

## 7. 로드맵 (기획서 67항 기준, 진행 상태)

- [x] PHASE 1 프로젝트 구조 설계
- [x] PHASE 2 DB 설계
- [x] PHASE 3 백엔드 API (MVP 범위)
- [x] PHASE 4 회원가입/로그인
- [x] PHASE 5 홈 UI
- [x] PHASE 6 여행 조건 입력
- [x] PHASE 7 추천 엔진 (규칙 기반, Mock)
- [ ] PHASE 8 지도 연동 (Mapbox 실연동)
- [x] PHASE 9 루트 생성
- [x] PHASE 10 루트 편집
- [x] PHASE 11 가이드북
- [x] PHASE 12 커뮤니티 (최소 기능)
- [ ] PHASE 13~14 테스트 / 버그 수정 (지속)
- [ ] PHASE 15 GPS
- [ ] PHASE 16 AI 고도화 (실 LLM 연동)
- [ ] PHASE 17 이미지/음성
- [ ] PHASE 18 결제
- [ ] PHASE 19 제휴
- [ ] PHASE 20 상용화

## 8. 실행 방법

`backend/README.md`, `mobile/README.md` 참고.
