# 🤖 안드로이드 앱 런칭 체크리스트
## Google Play Store 출시 준비 (v1.0.2)

**시작일**: 2025-10-15
**목표 런칭일**: 2025-10-25 (10일 소요 예상)
**현재 진행률**: 65% (iOS 완료, Android 준비 중)

---

## 📊 현재 상태 요약

### ✅ 이미 완료된 사항
- [x] iOS App Store 런칭 완료 (v1.0.2, Build 29)
- [x] React Native 크로스 플랫폼 아키텍처 (코드 94% 공유)
- [x] 구독 시스템 구현 (react-native-iap v14.3.2)
- [x] 안드로이드 기본 설정 완료 (app.json, eas.json)
- [x] Package ID 설정: `com.tarottimer.app`
- [x] EAS Build 설정 완료

### 🔄 작업 필요 사항
- [ ] 안드로이드 버전 코드 업데이트 (1 → 29)
- [ ] Google Play Store 스크린샷 및 메타데이터 준비
- [ ] Google Play 서비스 계정 키 설정
- [ ] 안드로이드 빌드 테스트 (AAB 생성)
- [ ] Google Play Console 구독 상품 등록 ($4.99)
- [ ] 내부 테스트 트랙 배포
- [ ] 프로덕션 배포

---

## 🎯 Phase 1: 안드로이드 설정 최적화 (1일)

### Task 1.1: app.json 안드로이드 설정 업데이트

#### 현재 상태 분석
```json
"android": {
  "package": "com.tarottimer.app",
  "versionCode": 1,  // ⚠️ iOS buildNumber(29)와 불일치
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#1a1625"
  },
  "permissions": [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.WAKE_LOCK",
    "android.permission.VIBRATE"
  ]
}
```

#### 수정 필요 사항

**1. versionCode 동기화**
```json
"versionCode": 29  // iOS buildNumber와 동일하게
```
- iOS Build 29에 맞춰 안드로이드도 29로 설정
- 향후 업데이트 시 자동 증가 (eas.json에서 autoIncrement: true)

**2. 구독 관련 권한 추가**
```json
"permissions": [
  "android.permission.INTERNET",
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.WAKE_LOCK",
  "android.permission.VIBRATE",
  "com.android.vending.BILLING"  // ← 구독 결제 권한 추가
]
```

**3. Google Play Services 설정**
```json
"googleServicesFile": "./google-services.json"  // ← Firebase/Analytics용 (선택사항)
```

**4. 안드로이드 특화 메타데이터**
```json
"android": {
  "package": "com.tarottimer.app",
  "versionCode": 29,
  "softwareKeyboardLayoutMode": "pan",
  "userInterfaceStyle": "dark",
  "navigationBar": {
    "visible": "immersive",
    "barStyle": "dark-content",
    "backgroundColor": "#1a1625"
  },
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#1a1625",
    "mdpi": "./assets/splash.png",
    "hdpi": "./assets/splash.png",
    "xhdpi": "./assets/splash.png",
    "xxhdpi": "./assets/splash.png",
    "xxxhdpi": "./assets/splash.png"
  }
}
```

### Task 1.2: 안드로이드 아이콘 준비 상태 확인

#### 필수 파일 체크리스트
```bash
✅ assets/icon.png (1024x1024)
✅ assets/adaptive-icon.png (1024x1024)
✅ assets/splash.png (최소 2048x2048)
□ assets/android-icon.png (선택사항)
```

#### Adaptive Icon 가이드라인
- **Safe Zone**: 중앙 66% 영역에 로고 배치
- **Background**: 단색 또는 그라데이션
- **Foreground**: 투명 배경 PNG, 중앙 정렬

---

## 🎯 Phase 2: Google Play Console 설정 (2일)

### Task 2.1: Google Play Console 계정 준비

#### Step 1: 개발자 계정 생성
```
1. Google Play Console 접속
   → https://play.google.com/console

2. "계정 만들기" 클릭

3. 개발자 등록 비용 결제
   - 일회성 비용: $25 USD (약 ₩33,500)
   - 결제 수단: 신용카드 또는 체크카드

4. 개발자 정보 입력
   - 개발자 이름: "Tarot Timer Development Team" 또는 개인 이름
   - 이메일: 지원 이메일 주소
   - 웹사이트: https://tarottimer.com (선택사항)

5. 계정 확인 완료 (1~2일 소요)
```

#### Step 2: 앱 생성
```
1. "앱 만들기" 클릭

2. 기본 정보 입력:
   - 앱 이름: "Tarot Timer - Learn Card Meanings"
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료 (구독 포함)

3. 선언 사항 체크
   - [✓] 개발자 프로그램 정책 준수
   - [✓] 미국 수출법 준수

4. "앱 만들기" 완료
```

### Task 2.2: 스토어 등록 정보 작성

#### 앱 상세 정보 (Store Listing)

**앱 이름** (최대 30자)
```
Tarot Timer - 타로 카드 학습
```

**간단한 설명** (최대 80자)
```
24시간 실시간 타로 카드 학습 시스템으로 78장 카드의 의미를 체계적으로 마스터하세요
```

**전체 설명** (최대 4,000자)
```markdown
🔮 타로 타이머 - 24시간 실시간 학습 시스템

매 시간마다 새로운 타로 카드를 만나보세요! 타로 타이머는 시계처럼 작동하는 혁신적인 학습 플랫폼입니다.

✨ 주요 기능

📚 체계적 학습 시스템
• 24시간 실시간 카드 순환
• 메이저 아르카나 22장 + 마이너 아르카나 56장
• 78장 전체 카드 상세 해설
• 정방향/역방향 의미 학습

⏰ 스마트 타이머 알림
• 매 시간 새로운 카드 알림
• 학습 진도 자동 추적
• 개인화된 학습 스케줄

📝 학습 일지 작성
• 카드별 개인 노트 작성
• 학습 히스토리 기록
• 복습 알림 시스템

🎨 몰입감 있는 디자인
• 미스틱한 보라/골드 테마
• 다크 모드 최적화
• 직관적인 한글 인터페이스

💎 프리미엄 기능 ($4.99/월)
• 무제한 세션 저장
• 광고 제거
• 프리미엄 테마
• 우선 고객 지원

🎓 이런 분들께 추천합니다
• 타로를 처음 시작하는 초보자
• 체계적으로 카드를 암기하고 싶은 분
• 매일 꾸준히 학습하고 싶은 분
• 한글로 쉽게 배우고 싶은 분

📱 지금 시작하세요
타로 카드 78장, 24시간 안에 완벽 마스터!

---

💡 고객 지원
이메일: support@tarottimer.com
웹사이트: https://tarottimer.com

📋 법률 정보
개인정보 처리방침: https://tarottimer.com/privacy
이용약관: https://tarottimer.com/terms

© 2025 Tarot Timer Development Team. All rights reserved.
```

#### 스크린샷 요구사항

**휴대전화 스크린샷** (필수)
- 최소: 2장
- 권장: 8장
- 크기: 1080 x 1920 픽셀 (세로) 또는 1920 x 1080 (가로)
- 형식: PNG 또는 JPEG

**권장 스크린샷 구성**:
1. 메인 화면 (24시간 타로 타이머)
2. 타로 카드 상세 화면
3. 학습 일지 화면
4. 통계 화면
5. 설정 화면
6. 구독 안내 화면
7. 알림 설정 화면
8. 프리미엄 기능 소개

**7인치 태블릿** (선택사항)
- 크기: 1024 x 1920 픽셀
- 최소 1장

**10인치 태블릿** (선택사항)
- 크기: 1536 x 2048 픽셀
- 최소 1장

#### 그래픽 애셋

**앱 아이콘**
- 크기: 512 x 512 픽셀
- 형식: PNG (32비트)
- 투명 배경 없음

**기능 그래픽** (필수)
- 크기: 1024 x 500 픽셀
- 형식: PNG 또는 JPEG
- Play Store 상단 배너 이미지

**프로모션 그래픽** (선택사항)
- 크기: 180 x 120 픽셀
- Play Store 검색 결과 표시용

### Task 2.3: 콘텐츠 등급 설정

#### 콘텐츠 등급 질문지 (IARC)
```
카테고리: 교육/자기계발
대상 연령: 전체 이용가

질문 응답 예시:
Q: 폭력성 콘텐츠가 포함되어 있나요?
A: 아니요

Q: 성적 콘텐츠가 포함되어 있나요?
A: 아니요

Q: 약물/음주 관련 콘텐츠가 포함되어 있나요?
A: 아니요

Q: 사용자 생성 콘텐츠가 있나요?
A: 예 (학습 일지 작성 기능)

Q: 위치 정보를 공유하나요?
A: 아니요

Q: 개인정보를 수집하나요?
A: 예 (이메일, 학습 기록)

예상 등급: 전체 이용가 (3+)
```

### Task 2.4: 앱 액세스 권한 선언

#### 사용하는 권한 설명
```
✅ INTERNET
용도: 구독 상태 확인, 클라우드 동기화

✅ ACCESS_NETWORK_STATE
용도: 네트워크 연결 상태 확인

✅ WAKE_LOCK
용도: 알림 발송 시 화면 깨우기

✅ VIBRATE
용도: 알림 진동

✅ BILLING
용도: 프리미엄 구독 결제 처리
```

---

## 🎯 Phase 3: 구독 시스템 설정 (1일)

### Task 3.1: Google Play Billing 구독 생성

#### 구독 ID 규칙
```
월간 구독: tarot_timer_monthly
연간 구독: tarot_timer_yearly

⚠️ 주의: iapManager.ts의 SUBSCRIPTION_SKUS와 정확히 동일해야 함!
```

#### 월간 구독 설정 ($4.99)
```
Google Play Console → 수익 창출 → 구독 → "구독 만들기"

구독 ID: tarot_timer_monthly
제품 이름: Tarot Timer Premium Monthly
설명: 무제한 세션 저장, 광고 제거, 프리미엄 테마

기본 플랜:
- 청구 기간: 1개월(매월)
- 기본 가격: $4.99 USD

지역별 가격:
- 미국: $4.99
- 한국: ₩6,600
- 일본: ¥730
- 유럽: €5.49

무료 체험 (선택):
- 7일 무료 체험 (권장)
- 첫 구독자 확보에 효과적

혜택:
• 무제한 세션 저장
• 광고 제거
• 프리미엄 테마 접근
• 우선 고객 지원
```

#### 연간 구독 설정 ($34.99)
```
구독 ID: tarot_timer_yearly
제품 이름: Tarot Timer Premium Yearly
설명: 무제한 세션 저장, 광고 제거, 프리미엄 테마 - 연간 구독 42% 할인!

기본 플랜:
- 청구 기간: 1년(연간)
- 기본 가격: $34.99 USD

지역별 가격:
- 미국: $34.99
- 한국: ₩46,000
- 일본: ¥5,100
- 유럽: €40.99

월 환산 가격:
- $2.92/월 (원래 $4.99에서 42% 할인)

혜택: (월간과 동일)
```

#### 구독 설정 옵션

**유예 기간 (Grace Period)**
```
✅ 활성화 (권장)
- 결제 실패 시 7일 유예 기간 제공
- 사용자 이탈 방지
```

**계정 보류 (Account Hold)**
```
✅ 활성화 (필수)
- 유예 기간 후 30일간 계정 보류
- Google Play 정책 준수
```

**가격 변경**
```
□ 기존 구독자 가격 유지 (권장)
- 신규 가격은 신규 구독자만 적용
- 기존 사용자 신뢰 유지
```

### Task 3.2: 테스트 계정 설정

#### 라이선스 테스터 추가
```
Google Play Console → 설정 → 라이선스 테스트

테스터 이메일 추가:
- 개발자 본인 이메일
- QA 팀원 이메일 (있는 경우)

효과:
- 실제 결제 없이 구독 테스트 가능
- 즉시 결제 확인 및 취소 가능
```

---

## 🎯 Phase 4: 안드로이드 빌드 및 테스트 (2일)

### Task 4.1: 첫 안드로이드 빌드 생성

#### EAS Build 명령어
```bash
# Preview 빌드 (APK, 테스트용)
eas build --platform android --profile preview

# Production 빌드 (AAB, 스토어 제출용)
eas build --platform android --profile production-android
```

#### 빌드 설정 확인 (eas.json)
```json
"production-android": {
  "extends": "production",
  "android": {
    "autoIncrement": true,  // versionCode 자동 증가
    "buildType": "app-bundle"  // AAB 생성 (Google Play 필수)
  }
}
```

#### 예상 빌드 시간
- 첫 빌드: 15~25분
- 이후 빌드: 10~15분

### Task 4.2: APK 내부 테스트

#### 테스트 환경
```
✅ Android 11 이상 권장
✅ Android 8.0 (API 26) 이상 필수
✅ 다양한 화면 크기 테스트 (휴대폰, 태블릿)
```

#### 테스트 체크리스트
```
□ 앱 설치 및 실행
□ 메인 화면 (24시간 타이머) 정상 표시
□ 타로 카드 뽑기 기능
□ 카드 상세 정보 표시
□ 학습 일지 작성
□ 알림 권한 요청
□ 알림 수신 테스트
□ 구독 화면 표시 (₩6,600/₩46,000)
□ 구독 결제 테스트 (라이선스 테스터 계정)
□ 구독 복원 기능
□ 프리미엄 기능 잠금 해제
□ 앱 종료 후 재시작
□ 다크 모드 표시
□ 한글 폰트 정상 표시
□ 성능 (로딩 시간, 메모리 사용량)
```

### Task 4.3: 버그 수정 및 최적화

#### 예상 이슈 및 해결책

**이슈 1: 안드로이드 뒤로가기 버튼**
```typescript
// utils/androidBackHandler.ts (작성 필요)
import { BackHandler } from 'react-native';

useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    // 뒤로가기 동작 커스터마이징
    return true; // true = 기본 동작 차단
  });

  return () => backHandler.remove();
}, []);
```

**이슈 2: 안드로이드 키보드 레이아웃**
```json
// app.json
"android": {
  "softwareKeyboardLayoutMode": "pan"  // 키보드 올라올 때 화면 이동
}
```

**이슈 3: 안드로이드 폰트 렌더링**
```typescript
// 이미 구현됨: @expo-google-fonts/noto-sans-kr
import { NotoSansKR_400Regular, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
```

---

## 🎯 Phase 5: Google Play 내부 테스트 (2일)

### Task 5.1: 내부 테스트 트랙 설정

#### 내부 테스트 생성
```
Google Play Console → 테스트 → 내부 테스트

1. "새 버전 만들기" 클릭

2. AAB 파일 업로드
   - EAS Build에서 다운로드한 .aab 파일
   - 자동으로 버전 정보 인식

3. 출시 노트 작성:
```

**출시 노트 (한국어)**
```markdown
# v1.0.2 - 첫 안드로이드 버전 출시

## 🎉 신규 기능
• 24시간 실시간 타로 카드 학습 시스템
• 78장 타로 카드 전체 데이터베이스
• 스마트 알림 시스템
• 학습 일지 작성 기능
• 프리미엄 구독 ($4.99/월)

## ✨ 특징
• iOS 버전과 100% 동일한 기능
• 다크 모드 최적화
• 한글 인터페이스
• 직관적인 UX/UI

## 🐛 알려진 이슈
• 없음 (첫 출시)

## 📧 문의
support@tarottimer.com
```

### Task 5.2: 테스터 초대

#### 테스터 목록 작성
```
1. Google Play Console → 내부 테스트 → 테스터 탭

2. 이메일 목록 추가:
   - 개발자 본인
   - 가족/친구 5~10명
   - 베타 테스터 커뮤니티

3. "테스트 링크 생성" 클릭

4. 테스터에게 이메일 발송:
   제목: 타로 타이머 안드로이드 앱 베타 테스트 초대
   내용: 테스트 링크 + 피드백 요청
```

### Task 5.3: 피드백 수집 및 개선

#### 피드백 수집 방법
```
✅ Google Play Console 크래시 보고서
✅ 내부 테스터 직접 피드백
✅ Firebase Crashlytics (선택사항)
✅ Sentry (선택사항)

피드백 주기: 2~3일
```

---

## 🎯 Phase 6: 프로덕션 배포 준비 (1일)

### Task 6.1: 최종 체크리스트

#### 필수 확인 사항
```
✅ 스토어 등록 정보 작성 완료
✅ 스크린샷 8장 업로드
✅ 앱 아이콘 512x512 업로드
✅ 기능 그래픽 1024x500 업로드
✅ 콘텐츠 등급 설정 완료
✅ 개인정보 처리방침 URL 등록
✅ 이용약관 URL 등록
✅ 구독 상품 2개 활성화
✅ 내부 테스트 통과
✅ 크래시/버그 0건
✅ 평균 평점 4.0+ (내부 테스터)
```

### Task 6.2: 프로덕션 출시

#### 프로덕션 트랙 생성
```
1. Google Play Console → 프로덕션 → "새 버전 만들기"

2. AAB 파일 업로드 (내부 테스트와 동일 버전)

3. 출시 노트 작성 (내부 테스트와 동일)

4. 출시 국가/지역 선택:
   ✅ 대한민국 (우선)
   ✅ 전 세계 (선택사항)

5. "검토를 위해 제출" 클릭
```

#### Google Play 심사 프로세스
```
예상 심사 기간: 1~7일 (평균 3일)

심사 단계:
1. 대기 중 (0~1일)
2. 검토 중 (1~3일)
3. 게시 중 (0.5~1일)
4. ✅ 게시됨!

심사 거부 가능성:
- 개인정보 처리방침 URL 누락
- 콘텐츠 등급 부적절
- 결제 정보 불명확
→ 모두 이미 준비됨 ✅
```

---

## 🎯 Phase 7: 런칭 후 모니터링 (지속)

### Task 7.1: 주요 지표 모니터링

#### Google Play Console 대시보드
```
일일 확인 지표:
✅ 다운로드 수
✅ 설치 수
✅ 평점 및 리뷰
✅ 크래시율 (0.5% 미만 유지)
✅ ANR(응답 없음) 비율 (0.1% 미만)
✅ 구독 전환율

주간 확인 지표:
✅ 사용자 유지율
✅ 일일 활성 사용자(DAU)
✅ 월간 활성 사용자(MAU)
✅ 구독 수익
```

### Task 7.2: 사용자 피드백 대응

#### 리뷰 관리 전략
```
목표: 평균 평점 4.5+ 유지

긍정 리뷰 (4~5점):
→ 감사 댓글 작성
→ 새 기능 안내

부정 리뷰 (1~3점):
→ 24시간 내 응답
→ 문제 해결 방법 안내
→ 다음 업데이트에 반영
```

---

## 📊 예상 일정 및 마일스톤

| 단계 | 작업 내용 | 예상 기간 | 상태 |
|-----|----------|----------|-----|
| Phase 1 | 안드로이드 설정 최적화 | 1일 | ⏳ 진행 예정 |
| Phase 2 | Google Play Console 설정 | 2일 | ⏳ 대기 중 |
| Phase 3 | 구독 시스템 설정 | 1일 | ⏳ 대기 중 |
| Phase 4 | 빌드 및 테스트 | 2일 | ⏳ 대기 중 |
| Phase 5 | 내부 테스트 | 2일 | ⏳ 대기 중 |
| Phase 6 | 프로덕션 배포 | 1일 | ⏳ 대기 중 |
| Phase 7 | 심사 대기 | 1~7일 | ⏳ 대기 중 |
| **총 소요 기간** | | **10~16일** | |

---

## 💰 예상 비용

| 항목 | 비용 | 비고 |
|-----|------|-----|
| Google Play 개발자 등록 | $25 | 일회성 |
| EAS Build 크레딧 | $0 | Free tier 사용 가능 |
| 도메인 (tarottimer.com) | $15/년 | 법률 문서 호스팅 |
| 스크린샷 제작 | $0 | 자체 제작 |
| **총 초기 비용** | **$40** | **약 ₩54,000** |

---

## 🚨 주의사항

### 법률 및 컴플라이언스
```
✅ 개인정보 처리방침 URL 필수 (심사 거부 1위 원인)
✅ 이용약관 URL 권장
✅ 구독 자동 갱신 안내 명시
✅ 환불 정책 명시 (Google Play 정책 준수)
```

### 기술적 제약
```
⚠️ AAB 형식 필수 (2021년부터 APK 대신 AAB 요구)
⚠️ Android 8.0 (API 26) 이상 타겟 필수
⚠️ 64비트 아키텍처 지원 필수 (이미 지원됨)
```

### 구독 정책
```
⚠️ 구독 ID는 한 번 생성하면 변경 불가
⚠️ 가격 변경 시 기존 사용자 알림 필요
⚠️ 무료 체험 제공 시 명확한 안내 필수
```

---

## 📞 지원 리소스

### 공식 문서
- [Expo EAS Build 가이드](https://docs.expo.dev/build/introduction/)
- [Google Play Console 도움말](https://support.google.com/googleplay/android-developer)
- [react-native-iap 문서](https://github.com/dooboolab-community/react-native-iap)

### 커뮤니티
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

**작성자**: Claude Code
**최종 업데이트**: 2025-10-15
**다음 업데이트**: Phase 1 완료 후
