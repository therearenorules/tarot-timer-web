# ✅ 안드로이드 설정 완료 보고서
## Phase 1: 안드로이드 최적화 완료

**완료일**: 2025-10-15
**소요 시간**: 1시간
**진행률**: Phase 1/7 완료 (14%)

---

## 🎯 완료된 작업

### 1. app.json 안드로이드 설정 업데이트

#### ✅ versionCode 동기화
```json
// 변경 전
"versionCode": 1

// 변경 후
"versionCode": 29  // iOS buildNumber와 동일
```

**효과**:
- iOS와 안드로이드 버전 일관성 확보
- 향후 EAS Build autoIncrement로 자동 관리

#### ✅ 구독 결제 권한 추가
```json
"permissions": [
  "android.permission.INTERNET",
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.WAKE_LOCK",
  "android.permission.VIBRATE",
  "com.android.vending.BILLING"  // ← 구독 결제 권한 추가
]
```

**효과**:
- Google Play Billing API 사용 가능
- $4.99/월 구독 결제 처리 준비 완료

#### ✅ 안드로이드 특화 UI 설정
```json
"softwareKeyboardLayoutMode": "pan",  // 키보드 올라올 때 화면 이동
"userInterfaceStyle": "dark",  // 다크 모드 강제
"navigationBar": {
  "visible": "leanback",  // 내비게이션 바 최소화
  "barStyle": "dark-content",
  "backgroundColor": "#1a1625"  // 브랜드 색상
}
```

**효과**:
- iOS와 동일한 미스틱한 다크 테마
- 키보드 입력 시 UI 가려짐 방지
- 풀스크린 몰입 경험

#### ✅ 안드로이드 스플래시 화면 설정
```json
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "#1a1625"
}
```

**효과**:
- 앱 실행 시 브랜드 일관성
- iOS와 동일한 로딩 경험

---

## 📊 수정된 파일 요약

| 파일 | 변경 사항 | 상태 |
|-----|----------|-----|
| **app.json** | versionCode, 권한, UI 설정 | ✅ 완료 |
| **utils/iapManager.ts** | 구독 가격 ($4.99) | ✅ 완료 |
| **components/subscription/SubscriptionPlans.tsx** | 법률 링크 | ✅ 완료 |

---

## 🚀 다음 단계: Phase 2 - Google Play Console 설정

### 즉시 실행 가능한 작업

#### Task 1: Google Play 개발자 계정 생성 (30분)
```
1. https://play.google.com/console 접속
2. "계정 만들기" 클릭
3. $25 USD 결제 (일회성)
4. 개발자 정보 입력
5. 계정 확인 대기 (1~2일)
```

#### Task 2: 앱 만들기 (10분)
```
1. "앱 만들기" 클릭
2. 기본 정보:
   - 앱 이름: "Tarot Timer - Learn Card Meanings"
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료 (구독 포함)
3. 선언 체크
4. 앱 생성 완료
```

#### Task 3: 스토어 등록 정보 작성 (1시간)
```
필요 자료:
✅ 앱 아이콘 (512x512) - assets/icon.png 사용 가능
✅ 기능 그래픽 (1024x500) - 제작 필요
□ 스크린샷 8장 (1080x1920) - 제작 필요
□ 앱 설명 (4,000자) - ANDROID_LAUNCH_CHECKLIST.md 참고

자료 위치:
- 템플릿: ANDROID_LAUNCH_CHECKLIST.md
- 아이콘: assets/icon.png
- 스크린샷: 웹 버전 캡처 또는 Figma 제작
```

---

## 🎨 스크린샷 제작 가이드

### 권장 스크린샷 구성 (8장)

1. **메인 화면** (24시간 타로 타이머)
   - 현재 시간의 카드 표시
   - "지금 뽑기" 버튼
   - 하단 탭 바

2. **타로 카드 상세**
   - 카드 이미지 크게
   - 카드 의미 설명
   - 정방향/역방향 탭

3. **학습 일지**
   - 오늘의 카드 목록
   - 메모 작성 화면
   - 날짜별 필터

4. **통계 화면**
   - 학습 진도율
   - 연속 학습일
   - 카드별 학습 현황

5. **알림 설정**
   - 시간 설정
   - 알림 스타일
   - 진동/소리 옵션

6. **구독 안내**
   - 프리미엄 기능 소개
   - 월간 ₩6,600
   - 연간 ₩46,000 (42% 할인)

7. **프리미엄 기능**
   - 무제한 저장
   - 광고 제거
   - 프리미엄 테마

8. **설정 화면**
   - 언어 선택
   - 알림 설정
   - 계정 관리

### 스크린샷 제작 방법

**옵션 A: 웹 버전 캡처 (추천, 무료)**
```bash
# Expo 서버 실행 중이어야 함
# 브라우저 개발자 도구 (F12)
# 디바이스 모드: Galaxy S21 (360x800)
# 확대/축소: 100%
# 스크린샷 캡처 후 1080x1920으로 리사이즈

도구: Chrome DevTools, Figma, Canva
```

**옵션 B: 안드로이드 에뮬레이터 (권장, 무료)**
```bash
# Android Studio 에뮬레이터 실행
# Pixel 5 (1080x2340)
# 앱 실행 후 캡처
# 상단 상태바 제거 (선택사항)
```

**옵션 C: 외주 제작 (유료, 빠름)**
```
Fiverr: $10~30
업워크: $20~50
크몽: ₩30,000~₩100,000
```

---

## 🔥 긴급 작업 (법률 문서)

### ⚠️ 개인정보 처리방침 & 이용약관 작성 필요

현재 상태:
- SubscriptionPlans.tsx에 링크 UI 추가됨 ✅
- 실제 URL은 TODO 상태 ⚠️

```typescript
// components/subscription/SubscriptionPlans.tsx:361-376
// TODO: 개인정보 처리방침 URL로 이동
// TODO: 이용약관 URL로 이동
```

**해결 방법**:

#### 방법 1: TermsFeed 무료 생성 (30분)
```
1. https://www.termsfeed.com/privacy-policy-generator/ 접속
2. 질문 응답:
   - 비즈니스 이름: Tarot Timer
   - 웹사이트 URL: https://tarottimer.com
   - 앱 이름: Tarot Timer
   - 수집 정보: 이메일, 학습 기록
   - 제3자 서비스: Google Play, Apple

3. 생성된 HTML 다운로드
4. GitHub Pages에 호스팅
```

#### 방법 2: GitHub Pages 호스팅 (10분)
```bash
# 프로젝트 루트에 docs 폴더 생성
mkdir docs
cd docs

# HTML 파일 생성
touch privacy.html
touch terms.html

# Git에 푸시
git add docs/
git commit -m "Add legal documents"
git push

# GitHub Settings → Pages
# Source: main branch /docs folder

# 최종 URL:
# https://yourusername.github.io/tarot-timer-web/privacy.html
# https://yourusername.github.io/tarot-timer-web/terms.html
```

#### 방법 3: 간단한 정적 페이지 (즉시)
```markdown
# docs/privacy.html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>개인정보 처리방침 - Tarot Timer</title>
</head>
<body>
  <h1>개인정보 처리방침</h1>
  <p>최종 업데이트: 2025-10-15</p>

  <h2>1. 수집하는 정보</h2>
  <ul>
    <li>이메일 주소 (구독 관리용)</li>
    <li>학습 기록 (앱 내 저장)</li>
    <li>결제 정보 (Google Play 처리)</li>
  </ul>

  <h2>2. 정보 사용 목적</h2>
  <ul>
    <li>서비스 제공 및 개선</li>
    <li>구독 관리</li>
    <li>고객 지원</li>
  </ul>

  <h2>3. 개인정보 보호</h2>
  <p>수집된 정보는 암호화되어 안전하게 보관됩니다.</p>

  <h2>4. 문의</h2>
  <p>이메일: support@tarottimer.com</p>
</body>
</html>
```

---

## 📈 예상 타임라인

| 날짜 | 작업 | 담당 |
|-----|------|-----|
| **2025-10-15** | Phase 1 완료 ✅ | 완료 |
| **2025-10-16** | Google Play 계정 생성 | 사용자 |
| **2025-10-17** | 법률 문서 작성 및 호스팅 | 사용자 |
| **2025-10-18** | 스토어 등록 정보 작성 | 사용자 |
| **2025-10-19** | 스크린샷 8장 제작 | 사용자 |
| **2025-10-20** | Phase 2 완료, Phase 3 시작 | 사용자 + Claude |
| **2025-10-21** | 첫 안드로이드 빌드 (EAS) | Claude |
| **2025-10-22** | 내부 테스트 트랙 배포 | Claude |
| **2025-10-23~24** | 테스터 피드백 수집 | 사용자 |
| **2025-10-25** | 프로덕션 제출 | Claude |
| **2025-10-26~11-01** | Google Play 심사 대기 | - |
| **2025-11-01** | 🎉 **안드로이드 앱 런칭!** | - |

---

## 💰 비용 정산

| 항목 | 예상 비용 | 실제 비용 | 상태 |
|-----|---------|---------|-----|
| Google Play 등록 | $25 | - | ⏳ 대기 |
| 법률 문서 작성 | $0 (무료 생성) | - | ⏳ 대기 |
| 스크린샷 제작 | $0 (자체 제작) | - | ⏳ 대기 |
| EAS Build | $0 (Free tier) | - | ⏳ 대기 |
| **총계** | **$25** | **-** | |

---

## ✅ 체크리스트 요약

### 완료됨 ✅
- [x] iOS 앱 런칭 (v1.0.2)
- [x] 구독 시스템 구현 ($4.99/월)
- [x] 안드로이드 app.json 설정
- [x] 구독 가격 업데이트 (₩6,600/₩46,000)
- [x] 법률 링크 UI 추가
- [x] 안드로이드 런칭 가이드 작성

### 진행 중 🔄
- [ ] Google Play 개발자 계정 (사용자 작업)
- [ ] 법률 문서 호스팅 (사용자 작업)

### 대기 중 ⏳
- [ ] 스토어 등록 정보
- [ ] 스크린샷 8장
- [ ] 첫 안드로이드 빌드
- [ ] 내부 테스트
- [ ] 프로덕션 배포

---

## 📞 다음 세션 준비사항

**다음에 작업할 내용**:
1. Google Play 개발자 계정 생성 완료 확인
2. 법률 문서 URL 제공 (privacy, terms)
3. 스크린샷 제작 진행 여부
4. EAS Build 첫 빌드 실행

**필요한 정보**:
- Google Play 개발자 이메일
- 법률 문서 호스팅 URL
- 스크린샷 제작 방법 선택 (자체/외주)

---

**작성자**: Claude Code
**완료 시각**: 2025-10-15 13:30
**다음 세션**: Phase 2 시작 예정
