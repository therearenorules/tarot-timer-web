# 🤖 Android 빌드 가이드
## Phase 3: Android 첫 빌드 생성

**작성일**: 2025-10-15
**현재 상태**: Phase 2 완료, Phase 3 준비 중
**예상 소요 시간**: 1-2시간

---

## ✅ 완료된 사항 (Phase 1 & 2)

### Phase 1: 반응형 개선 ✅
- [x] 터치 타겟 크기 48dp로 최적화
- [x] 모달 높이 동적 계산 (21:9 화면 대응)
- [x] Safe Area 대응 (react-native-safe-area-context 설치)
- [x] app.json Android 설정 완료

### Phase 2: 법률 문서 ✅
- [x] [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) 작성 완료
- [x] [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md) 작성 완료
- [x] app.json navigationBar 필드 제거 (Expo 스키마 오류 해결)
- [x] 패키지 설치 완료 (react-native-safe-area-context)

---

## 🎯 Phase 3: Android 첫 빌드 생성

### 목표
- Android AAB (App Bundle) 파일 생성
- Google Play Store 제출용 빌드 준비
- Keystore 생성 및 서명

### 예상 소요 시간
- Keystore 생성 및 설정: 15분
- 빌드 생성: 30-60분 (EAS 서버에서 처리)
- 다운로드 및 검증: 5분
- **총 소요 시간**: 약 1-2시간

---

## 📋 Phase 3 실행 단계

### Step 1: EAS 로그인 확인

```bash
# EAS 로그인 상태 확인
npx eas whoami

# 로그인 필요 시
npx eas login
```

**예상 결과**:
```
Logged in as threebooks
```

---

### Step 2: Android Keystore 생성

Android 앱 서명을 위한 Keystore를 생성합니다.

#### 옵션 A: EAS가 자동 생성 (권장)

```bash
npx eas build --platform android --profile production-android
```

**인터랙티브 질문**:
```
? Generate a new Android Keystore? (Y/n)
→ Y (Yes 선택)
```

EAS가 자동으로 Keystore를 생성하고 안전하게 저장합니다.

#### 옵션 B: 수동 Keystore 생성

```bash
# Keystore 생성 (Java keytool 사용)
keytool -genkeypair -v -storetype JKS \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass STRONG_PASSWORD \
  -keypass STRONG_PASSWORD \
  -alias tarot-timer-key \
  -keystore tarot-timer.jks \
  -dname "CN=Tarot Timer, OU=Development, O=Tarot Timer Team, L=Seoul, ST=Seoul, C=KR"

# EAS에 Keystore 업로드
npx eas credentials:configure --platform android
```

---

### Step 3: 프로덕션 빌드 생성

```bash
# Android 프로덕션 빌드 (AAB)
npx eas build --platform android --profile production-android

# 또는 APK 빌드 (테스트용)
npx eas build --platform android --profile preview
```

**빌드 프로세스**:
1. ✅ EAS 서버에 코드 업로드
2. ✅ 의존성 설치 (npm install)
3. ✅ Android 네이티브 빌드 (Gradle)
4. ✅ Keystore로 앱 서명
5. ✅ AAB 파일 생성
6. ✅ 다운로드 가능 URL 제공

**예상 소요 시간**: 30-60분

---

### Step 4: 빌드 상태 확인

#### 옵션 A: EAS CLI
```bash
# 빌드 목록 확인
npx eas build:list --platform android

# 특정 빌드 상태 확인
npx eas build:view [BUILD_ID]
```

#### 옵션 B: 웹 대시보드
```
https://expo.dev/accounts/threebooks/projects/tarot-timer/builds
```

---

### Step 5: 빌드 다운로드 및 검증

```bash
# 빌드 다운로드
npx eas build:download [BUILD_ID]

# 또는 웹에서 직접 다운로드
# https://expo.dev/accounts/threebooks/projects/tarot-timer/builds/[BUILD_ID]
```

**생성되는 파일**:
- `build-[BUILD_ID].aab` (Google Play Store용)
- 또는 `build-[BUILD_ID].apk` (테스트용)

---

## 🔧 문제 해결 (Troubleshooting)

### 문제 1: Keystore 생성 실패

**증상**:
```
Generating a new Keystore is not supported in --non-interactive mode
```

**해결**:
```bash
# --non-interactive 플래그 제거
npx eas build --platform android --profile production-android
```

---

### 문제 2: 빌드 실패 - Gradle 오류

**증상**:
```
Gradle build failed
```

**해결 방법**:
1. `package.json` 의존성 확인
2. `app.json` Android 설정 확인
3. EAS 로그 확인:
```bash
npx eas build:view [BUILD_ID] --verbose
```

---

### 문제 3: 패키지 버전 불일치

**증상**:
```
Package version mismatch: expo 54.0.13 expected, 54.0.12 found
```

**해결**:
```bash
# 패키지 업데이트
npx expo install --check

# 또는 수동 업데이트
npm install expo@54.0.13 expo-font@~14.0.9
```

---

## 📊 빌드 설정 확인

### 현재 설정 (eas.json)

```json
{
  "build": {
    "production-android": {
      "extends": "production",
      "android": {
        "autoIncrement": true,
        "buildType": "app-bundle"
      },
      "channel": "production-android"
    }
  }
}
```

### 현재 설정 (app.json)

```json
{
  "expo": {
    "version": "1.0.2",
    "android": {
      "package": "com.tarottimer.app",
      "versionCode": 29,
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.WAKE_LOCK",
        "android.permission.VIBRATE",
        "com.android.vending.BILLING"
      ]
    }
  }
}
```

---

## ✅ 빌드 성공 체크리스트

빌드 완료 후 다음 사항을 확인하세요:

- [ ] AAB 파일 다운로드 완료
- [ ] 파일 크기 확인 (예상: 30-50MB)
- [ ] Build ID 기록:
  ```
  Build ID: ___________________________
  Download URL: _____________________
  ```
- [ ] 빌드 버전 확인:
  ```
  Version: 1.0.2
  Version Code: 29 (또는 30 - autoIncrement 적용 시)
  ```

---

## 🚀 다음 단계 (Phase 4)

빌드 완료 후 진행할 작업:

1. **Google Play Console 계정 생성**
   - 개발자 등록 비용: $25 USD
   - 예상 소요 시간: 1-2일 (승인 대기)

2. **앱 등록 및 메타데이터 준비**
   - 스토어 리스팅 작성
   - 스크린샷 준비 (최소 2장)
   - 앱 설명 작성

3. **내부 테스트**
   - 테스트 트랙에 AAB 업로드
   - 실기기 테스트
   - 버그 수정

---

## 📱 테스트 방법

### APK 설치 (개발용)

```bash
# 테스트용 APK 다운로드
npx eas build:download [BUILD_ID]

# Android 기기에 전송
adb install build-[BUILD_ID].apk

# 또는 이메일/구글 드라이브로 공유
```

### AAB 테스트 (Google Play용)

AAB는 직접 설치 불가하며, Google Play Console의 내부 테스트 트랙을 통해서만 테스트 가능합니다.

---

## 💡 유용한 명령어

```bash
# EAS 빌드 목록
npx eas build:list --platform android

# 특정 빌드 다운로드
npx eas build:download [BUILD_ID]

# 빌드 취소
npx eas build:cancel [BUILD_ID]

# 빌드 로그 보기
npx eas build:view [BUILD_ID] --verbose

# EAS 크레딧 확인
npx eas account:view

# Keystore 정보 확인
npx eas credentials --platform android
```

---

## 🎯 예상 결과

### 빌드 성공 시

```bash
✔ Build finished.

┌──────────────────────────────────────────────────┐
│                                                  │
│   Build ID: abc123def456                         │
│   Platform: Android                              │
│   Version: 1.0.2 (30)                           │
│   Profile: production-android                    │
│   Type: app-bundle                               │
│   Status: FINISHED                               │
│                                                  │
│   Download:                                      │
│   https://expo.dev/accounts/threebooks/...      │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 파일 정보

- **파일 이름**: `build-[BUILD_ID].aab`
- **파일 크기**: 약 30-50MB
- **서명 상태**: ✅ Signed
- **Google Play 업로드**: ✅ Ready

---

## 📞 문제 발생 시 연락처

- **EAS Support**: https://expo.dev/support
- **Expo Forums**: https://forums.expo.dev
- **Documentation**: https://docs.expo.dev/build/introduction

---

**마지막 업데이트**: 2025-10-15
**다음 단계**: [ANDROID_LAUNCH_CHECKLIST.md](./ANDROID_LAUNCH_CHECKLIST.md) Phase 4 참고
**진행률**: Phase 3/7 (42%)
