# 🔧 빌드 전 필수 체크리스트

**작성일**: 2025-10-31
**목적**: IAP 기능이 포함된 프로덕션 빌드 준비
**우선순위**: 🔴 필수

---

## 📋 1단계: 필수 설정 파일 수정

### ✅ A. `app.json` - IAP Config Plugin 추가 필요

**현재 상태** ❌:
```json
"plugins": [
  "expo-notifications",
  "react-native-google-mobile-ads",
  "expo-font"
  // ❌ react-native-iap config plugin 없음!
]
```

**수정 필요** ✅:
```json
"plugins": [
  [
    "expo-notifications",
    {
      "icon": "./assets/icon.png",
      "color": "#7b2cbf",
      "sounds": [],
      "mode": "production"
    }
  ],
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-4284542208210945~5287567450",
      "iosAppId": "ca-app-pub-4284542208210945~6525956491",
      "android_app_id": "ca-app-pub-4284542208210945~5287567450",
      "ios_app_id": "ca-app-pub-4284542208210945~6525956491",
      "delayAppMeasurementInit": false
    }
  ],
  "expo-font"
]
```

**설명**:
- ⚠️ `react-native-iap`는 별도 config plugin이 필요 없습니다
- ✅ Expo SDK 54에서는 `expo-build-properties`를 통해 자동 처리됩니다
- ✅ 현재 설정으로 충분합니다

**결론**: `app.json` 수정 불필요 ✅

---

### ✅ B. `eas.json` - 빌드 설정 확인

**현재 상태** ✅:
```json
{
  "build": {
    "production-ios": {
      "extends": "production",
      "ios": {
        "resourceClass": "m-medium",
        "autoIncrement": true,
        "buildConfiguration": "Release",
        "simulator": false
      },
      "channel": "production-ios"
    }
  }
}
```

**확인 사항**:
- ✅ `buildConfiguration: "Release"` - 프로덕션 빌드 설정 올바름
- ✅ `autoIncrement: true` - 빌드 번호 자동 증가
- ✅ `resourceClass: "m-medium"` - 충분한 빌드 리소스

**개선 권장사항** (선택):
```json
{
  "build": {
    "production-ios": {
      "extends": "production",
      "ios": {
        "resourceClass": "m-medium",
        "autoIncrement": true,
        "buildConfiguration": "Release",
        "simulator": false,
        "config": {
          "usesNonExemptEncryption": false
        }
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      },
      "channel": "production-ios"
    }
  }
}
```

**결론**: `eas.json` 수정 선택사항 (현재 설정으로도 빌드 가능) ✅

---

### ✅ C. 의존성 패키지 확인

**현재 설치된 패키지**:
```
react-native-iap@14.4.23 ✅
```

**호환성 확인**:
- Expo SDK 54 ✅
- React Native 0.81.5 ✅
- react-native-iap 14.4.23 ✅

**추가 설치 필요 여부**: 없음 ✅

---

## 📋 2단계: App Store Connect 설정 확인

### A. 구독 상품 등록 확인

**체크리스트**:
```
[ ] App Store Connect 로그인
[ ] 앱 → 기능 → App 내 구입 항목
[ ] 구독 상품 2개 확인:
    - tarot_timer_monthly (월간 구독)
    - tarot_timer_yearly (연간 구독)
[ ] 상품 상태: "Ready to Submit" 또는 "Approved"
[ ] 가격 설정 완료:
    - 월간: ₩6,600
    - 연간: ₩46,000
```

**중요**: 구독 상품이 "Approved" 상태가 아니면 TestFlight에서 테스트 불가!

---

### B. Capabilities 확인 (Xcode)

**iOS 빌드 후 확인 필요**:
```
빌드 완료 후 → Xcode에서 프로젝트 열기
→ Target 선택 → Signing & Capabilities
→ "In-App Purchase" Capability 자동 추가되었는지 확인
```

**수동 추가 방법** (필요 시):
1. Xcode 프로젝트 열기
2. Target → Signing & Capabilities
3. "+ Capability" 클릭
4. "In-App Purchase" 선택

---

### C. Sandbox Tester 계정 설정

**App Store Connect에서 설정**:
```
[ ] App Store Connect → 사용자 및 액세스
[ ] Sandbox Testers 탭
[ ] 새 Sandbox Tester 계정 생성:
    - 이메일: [테스트용 이메일]
    - 비밀번호: [테스트용 비밀번호]
    - 국가: 대한민국
```

**테스트 시 사용**:
- iOS 설정 → App Store → Sandbox 계정으로 로그인
- 구독 구매 테스트 진행

---

## 📋 3단계: 로컬 코드 테스트

### A. 개발 서버에서 오류 메시지 확인

**테스트 절차**:
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:8083 접속
# 프리미엄 구독 화면 열기
# "구매 복원" 버튼 클릭
```

**예상 결과**:
```
✅ "복원할 구매 내역이 없습니다" 메시지 표시
✅ 구독 관리 방법 안내 표시
✅ 오류 메시지가 명확하게 표시됨
```

**확인 사항**:
- [ ] 복원 실패 메시지 정확성
- [ ] 오류 메시지 명확성
- [ ] UI 레이아웃 정상 표시

---

### B. TypeScript 컴파일 오류 확인

```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 예상 결과: 오류 없음
```

**발견된 오류가 있다면**:
- IAP 관련 타입 오류 확인
- `any` 타입 사용 부분 점검
- 누락된 타입 정의 추가

---

## 📋 4단계: Git 커밋 준비

### A. 변경된 파일 확인

```bash
git status
```

**예상 변경 파일**:
```
modified:   utils/iapManager.ts
modified:   components/PremiumSubscription.tsx
new file:   SUBSCRIPTION_ERROR_DIAGNOSIS.md
new file:   SUBSCRIPTION_FIX_SUMMARY.md
new file:   PRE_BUILD_CHECKLIST.md
```

### B. 커밋 메시지 작성

**권장 커밋 메시지**:
```
fix: IAP 복원 로직 및 오류 메시지 개선

주요 변경사항:
- restorePurchases() 실제 복원 여부 정확히 반환
- 초기화 실패 시 명확한 오류 처리 및 가이드 제공
- 사용자 친화적 오류 메시지로 개선
- 구독 관리 방법 상세 안내 추가

영향 범위:
- utils/iapManager.ts: 복원/초기화/구매 로직 개선
- components/PremiumSubscription.tsx: UI 메시지 개선

관련 문서:
- SUBSCRIPTION_ERROR_DIAGNOSIS.md: 오류 진단 보고서
- SUBSCRIPTION_FIX_SUMMARY.md: 수정 사항 요약
- PRE_BUILD_CHECKLIST.md: 빌드 전 체크리스트

Related: #구독오류수정
```

---

## 📋 5단계: 빌드 전 최종 확인

### A. 버전 정보 확인

**app.json 확인**:
```json
{
  "expo": {
    "version": "1.1.1",
    "ios": {
      "buildNumber": "107"  // ✅ 현재 버전
    },
    "android": {
      "versionCode": 102    // ✅ 현재 버전
    }
  }
}
```

**버전 업데이트 필요 여부**:
- IAP 기능 추가 = Minor Update
- 권장 버전: `1.2.0` (IAP 기능 추가)
- 또는 유지: `1.1.1` (버그 수정만)

**결정 필요**:
```
[ ] 버전 업데이트 (1.2.0)
[ ] 현재 버전 유지 (1.1.1)
```

---

### B. 환경 변수 확인

**app.json extra 섹션**:
```json
"extra": {
  "EXPO_PUBLIC_API_URL": "https://api.tarottimer.app",
  "APPLE_SHARED_SECRET": "${APPLE_SHARED_SECRET}",  // ✅ 영수증 검증용
  "supabaseUrl": "${SUPABASE_URL}",
  "supabaseAnonKey": "${SUPABASE_ANON_KEY}"
}
```

**확인 사항**:
- [ ] `APPLE_SHARED_SECRET` 환경 변수 설정됨
- [ ] App Store Connect에서 Shared Secret 발급받음
- [ ] EAS Secrets에 등록됨

**Shared Secret 확인 방법**:
1. App Store Connect → 앱 선택
2. 기능 → App 내 구입 항목
3. "앱별 공유 암호" 생성
4. EAS Secrets 등록:
   ```bash
   eas secret:create --name APPLE_SHARED_SECRET --value [발급받은_값] --type string
   ```

---

### C. 권한 설정 확인

**iOS (app.json)**:
```json
"ios": {
  "infoPlist": {
    "NSUserNotificationUsageDescription": "24시간 타로 카드 학습 알림..."
  }
}
```

**Android (app.json)**:
```json
"android": {
  "permissions": [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "com.android.vending.BILLING"  // ✅ IAP 권한 있음
  ]
}
```

**확인 결과**: 권한 설정 올바름 ✅

---

## 📋 6단계: 빌드 준비 완료 체크

### 최종 체크리스트

**코드 수정**:
- [x] iapManager.ts 수정 완료
- [x] PremiumSubscription.tsx 수정 완료
- [x] TypeScript 컴파일 오류 없음

**설정 파일**:
- [x] app.json 확인 (수정 불필요)
- [x] eas.json 확인 (현재 설정 OK)
- [x] package.json 의존성 확인

**App Store Connect** (사용자 확인 필요):
- [ ] 구독 상품 2개 등록 완료
- [ ] 상품 상태 "Approved" 확인
- [ ] Sandbox Tester 계정 생성
- [ ] APPLE_SHARED_SECRET 발급

**환경 변수** (사용자 확인 필요):
- [ ] EAS Secrets에 APPLE_SHARED_SECRET 등록
- [ ] SUPABASE_URL, SUPABASE_ANON_KEY 등록

**Git**:
- [ ] 변경사항 커밋
- [ ] 커밋 메시지 작성 완료
- [ ] GitHub에 푸시

**버전 관리** (사용자 결정 필요):
- [ ] 버전 번호 결정 (1.1.1 유지 vs 1.2.0 업데이트)

---

## 🚀 빌드 실행 명령어 (확인 후 실행)

### iOS 빌드
```bash
# 프로덕션 iOS 빌드
eas build --platform ios --profile production-ios

# 예상 소요 시간: 15-20분
# 빌드 완료 후 TestFlight 자동 업로드
```

### Android 빌드 (로컬)
```bash
# ⚠️ Android는 로컬에서만 빌드!
# (LOCAL_ANDROID_BUILD_RULE.md 참고)

# 1. Prebuild
npx expo prebuild --platform android --clean

# 2. AAB 빌드
cd android && ./gradlew bundleRelease --no-daemon

# 3. 결과 확인
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

## 📝 빌드 후 테스트 계획

### TestFlight 테스트 (iOS)

**준비사항**:
1. TestFlight 앱 설치
2. Sandbox Tester 계정으로 로그인
3. 빌드 다운로드

**테스트 시나리오**:
```
1. 앱 실행 → 프리미엄 구독 화면 열기
2. 구독 상품 2개 표시 확인
3. 월간 구독 선택 → Apple 결제 화면 표시 확인
4. Sandbox 환경에서 구매 진행
5. 구매 완료 후 프리미엄 상태 활성화 확인
6. 앱 재시작 → 프리미엄 상태 유지 확인
7. "구매 복원" 버튼 → 복원 성공 확인
```

**예상 결과**:
- ✅ Apple 결제 화면 정상 표시
- ✅ 구매 완료 후 프리미엄 활성화
- ✅ 복원 기능 정상 작동
- ✅ 오류 메시지 명확히 표시

---

## ⚠️ 중요 알림

### 사용자가 확인해야 할 사항

1. **App Store Connect 설정** (가장 중요!)
   - 구독 상품 등록 및 승인 상태 확인
   - Sandbox Tester 계정 생성
   - APPLE_SHARED_SECRET 발급

2. **EAS Secrets 등록**
   ```bash
   # 확인 명령어
   eas secret:list

   # 등록 명령어 (필요 시)
   eas secret:create --name APPLE_SHARED_SECRET --value [값]
   ```

3. **버전 번호 결정**
   - 1.1.1 유지 (버그 수정)
   - 1.2.0 업데이트 (기능 추가)

4. **Git 커밋 및 푸시**
   ```bash
   git add .
   git commit -m "fix: IAP 복원 로직 및 오류 메시지 개선"
   git push origin main
   ```

---

**다음 단계**: 위 체크리스트 완료 후 빌드 진행 요청

**문의사항**: PRE_BUILD_CHECKLIST.md 참고
