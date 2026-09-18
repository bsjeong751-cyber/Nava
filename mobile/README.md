# 노바리아 모바일 앱 (Expo + React Native + TypeScript)

## 실행 방법

```bash
cd mobile
npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL을 백엔드 주소로 설정
npx expo start
```

Expo Go 앱으로 QR코드를 스캔하거나, `a`(Android)/`i`(iOS 시뮬레이터)/`w`(웹)를 눌러 실행한다.
실기기에서 테스트할 때는 `EXPO_PUBLIC_API_URL`을 `localhost`가 아니라 백엔드가 실행 중인 PC의
로컬 네트워크 IP로 설정해야 한다.

## 구조

```
src/
  theme/         베이지톤 여행 일기장 감성의 컬러/타이포그래피
  components/    공용 버튼/카드/칩/스텝 헤더
  context/       인증 상태(AuthContext, 토큰 저장)
  services/      axios 기반 API 클라이언트
  navigation/     Auth 스택 / 메인 탭 / 루트 스택
  screens/       화면별 컴포넌트
  types/         백엔드 응답과 짝을 맞춘 타입
```

## 화면 흐름 (MVP)

```
Splash → Onboarding → Login/Signup → MainTabs(Home/Community/MyPage)
Home → 새 지도 만들기(NewTripFlow) → RouteCompare → TripGuidebook → TripEdit
Community → CommunityPostDetail → 내 지도에 가져오기 → TripGuidebook
```

## 알려진 제한 (MVP)

- 날짜 입력은 아직 텍스트(YYYY-MM-DD) 방식이다. 네이티브 날짜 선택 UI는 2차 개발에서 추가한다.
- 지도/GPS는 연동되어 있지 않다. 장소는 목록/텍스트 기반으로 표시한다.
- 루트 편집에서 순서 변경은 드래그 앤 드롭이 아닌 위/아래 버튼으로 처리한다.
- 카메라 기반 메뉴판/간판 분석, 음성 입력, 결제 화면은 아직 없다.
