# 노바리아 백엔드 (NestJS + Prisma)

## 실행 방법

```bash
cd backend
npm install
cp .env.example .env   # DATABASE_URL 등을 채운다
npx prisma migrate dev --name init   # PostgreSQL이 필요하다
npm run start:dev
```

기본 포트는 `3000`이다.

## 구조

```
src/
  auth/            회원가입/로그인, JWT 발급
  users/           내 정보 조회
  places/          장소 검색 (PlaceProvider 추상화, 현재 MockPlaceProvider)
  recommendation/  규칙 기반 추천 엔진 (거리/시간/예산 계산)
  trips/           여행 생성, 루트 생성/조회/선택, 루트 편집(재계산)
  community/       게시/피드/상세/가져오기/신고
  prisma/          PrismaService, PrismaModule
  common/          공통 필터/인터셉터
prisma/schema.prisma   DB 스키마
```

## Mock Provider에 대하여

`src/places/mock-place-provider.ts`는 실제 Mapbox/지도 검색 API가 연동되기 전까지
`서울/부산/도쿄`에 대한 시드 데이터를 제공한다. `PlaceProvider` 인터페이스
(`src/places/place-provider.interface.ts`)를 구현하는 다른 클래스를
`PlacesModule`에서 교체하면 실제 API로 전환할 수 있다.

동일한 원칙으로 AI(LLM) 자연어 이해, 실제 결제 PG 연동, GPS, 이미지/음성 분석은
아직 구현되어 있지 않다 (ARCHITECTURE.md의 로드맵 참고).

## 알려진 제한 (MVP)

- 인증은 이메일/비밀번호만 지원한다 (OAuth 미구현).
- 추천 엔진은 규칙 기반이며 LLM 자연어 이해 단계는 아직 연결되지 않았다.
- 결제/제휴/광고/관리자 시스템은 스키마 설계만 되어 있고 API는 없다.
- 테스트 코드는 아직 작성되지 않았다.
