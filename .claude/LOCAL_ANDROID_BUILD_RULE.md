# 🤖 Android 빌드 규칙 (Claude Code)

## ⚠️ 중요 규칙

### Android 빌드는 항상 로컬에서만 수행

**절대 금지**:
```bash
❌ eas build --platform android
❌ eas build --platform all
❌ GitHub Actions Android 빌드 워크플로우 트리거
```

**허용됨**:
```bash
✅ 로컬 Gradle 빌드만 사용
✅ npx expo prebuild --platform android --clean
✅ cd android && ./gradlew bundleRelease
✅ cd android && ./gradlew assembleRelease
```

---

## 📋 로컬 Android 빌드 체크리스트

### 빌드 전 필수 확인사항

1. **키스토어 존재 확인**
   ```bash
   ls android/app/upload-keystore.jks
   ```

2. **gradle.properties 설정 확인**
   ```bash
   cat android/gradle.properties | grep MYAPP_UPLOAD
   ```

3. **Android SDK 경로 확인**
   ```bash
   cat android/local.properties
   # sdk.dir가 올바르게 설정되어 있는지 확인
   ```

4. **버전 코드 증가**
   ```bash
   # app.json에서 android.versionCode 수동 증가
   ```

### 빌드 실행 순서

```bash
# 1. 버전 코드 증가 (app.json 수정)
# android.versionCode: 현재값 + 1

# 2. Expo Prebuild
npx expo prebuild --platform android --clean

# 3. AAB 빌드 (Google Play 업로드용)
cd android
./gradlew bundleRelease --no-daemon

# 4. 결과 확인
ls -lh app/build/outputs/bundle/release/app-release.aab

# 5. 파일명 변경
cd app/build/outputs/bundle/release
mv app-release.aab tarot-timer-v[버전코드].aab
```

---

## 🔐 키스토어 관리

### 프로덕션 키스토어 위치
```
android/app/upload-keystore.jks
```

### 키스토어 정보 (gradle.properties)
```properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=[실제 비밀번호]
MYAPP_UPLOAD_KEY_PASSWORD=[실제 비밀번호]
```

### 키스토어 SHA1 확인
```bash
keytool -list -v -keystore android/app/upload-keystore.jks -alias upload
# Google Play Console 요구사항과 일치하는지 확인
# 필요한 SHA1: 62:0F:37:93:FA:E8:61:50:10:0C:8D:65:E6:FA:63:35:02:09:0F:B7
```

---

## 🚫 Claude Code 자동 실행 금지 명령어

Claude Code는 다음 명령어를 **사용자 명시적 요청 없이 절대 실행 불가**:

```bash
# EAS 빌드 (iOS는 허용, Android는 금지)
eas build --platform android          # ❌ 금지
eas build --platform all               # ❌ 금지
eas build                              # ❌ 금지 (platform 미지정)

# GitHub Actions
gh workflow run "Android Free Build"   # ❌ 금지
```

**허용되는 EAS 명령어**:
```bash
eas build --platform ios               # ✅ 허용
eas submit --platform android          # ✅ 허용 (빌드는 로컬, 제출만 EAS)
eas build:list                         # ✅ 허용 (조회만)
```

---

## 💡 사용자 요청 해석 규칙

### "빌드해줘" 요청 시:

**iOS 빌드 요청**:
```
사용자: "iOS 빌드해줘"
→ eas build --platform ios 실행 ✅
```

**Android 빌드 요청**:
```
사용자: "Android 빌드해줘"
→ 로컬 Gradle 빌드 실행 ✅
→ npx expo prebuild + ./gradlew bundleRelease
```

**전체 빌드 요청**:
```
사용자: "빌드해줘" (플랫폼 미지정)
→ 질문: "iOS와 Android 중 어느 것을 빌드할까요?"
→ iOS: EAS 빌드
→ Android: 로컬 Gradle 빌드
```

---

## 📝 Google Play 업로드 프로세스

### 로컬 빌드 → Google Play 업로드

```bash
# 1. 로컬에서 AAB 빌드
cd android && ./gradlew bundleRelease

# 2. Google Play Console 수동 업로드
# https://play.google.com/console
# → 프로덕션 → 새 버전 만들기
# → AAB 파일 업로드

# 또는 EAS Submit 사용 (선택사항)
eas submit --platform android --path android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔧 문제 해결

### 키스토어 서명 오류 시

**증상**:
```
Android App Bundle이 잘못된 키로 서명되었습니다.
```

**해결책**:
1. `android/app/upload-keystore.jks` 존재 확인
2. `gradle.properties` 설정 확인
3. 키스토어 SHA1 지문 확인
4. 필요시 EAS에서 올바른 키스토어 다운로드

**EAS에서 키스토어 다운로드**:
```bash
# 1. credentials.json 다운로드
eas credentials -p android

# 2. 키스토어 추출
# (수동으로 base64 디코딩 또는 EAS 대시보드에서 다운로드)

# 3. 올바른 위치에 배치
mv downloaded-keystore.jks android/app/upload-keystore.jks
```

---

## 📊 빌드 히스토리 추적

### 로컬 빌드 기록

| 날짜 | 버전 | 빌드 번호 | 파일명 | 상태 |
|------|------|-----------|--------|------|
| 2025-10-27 | 1.0.9 | 100 | tarot-timer-v100.aab | ❌ 잘못된 키 |
| 다음 빌드 | 1.0.9 | 101 | tarot-timer-v101.aab | 🔄 예정 |

---

## ✅ 최종 확인사항

빌드 실행 전 반드시 확인:

- [ ] `android/app/upload-keystore.jks` 파일 존재
- [ ] `android/gradle.properties`에 올바른 키스토어 설정
- [ ] `android/local.properties`에 Android SDK 경로 설정
- [ ] `app.json`에서 `android.versionCode` 증가
- [ ] 키스토어 SHA1 지문이 Google Play 요구사항과 일치

---

**규칙 생성일**: 2025-10-27
**마지막 업데이트**: 2025-10-27
**규칙 우선순위**: 🔴 최고 (절대 준수)
