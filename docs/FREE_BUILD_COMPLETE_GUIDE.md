# 🆓 완전 무료 빌드 시스템 가이드

## 🎯 목표: EAS Build 비용 $0로 만들기

이 가이드를 따라하면 **EAS Build 비용 없이** iOS와 Android 앱을 빌드할 수 있습니다.

## 📊 비용 비교

| 항목 | EAS Build | 무료 빌드 | 절감액 |
|------|-----------|-----------|--------|
| **Android 빌드** | ~$1/빌드 | $0 | 100% |
| **iOS 빌드** | ~$1/빌드 | $0 | 100% |
| **월간 빌드 (20회)** | ~$20 | $0 | **$240/년** |
| **연간 절감** | ~$240 | $0 | **$240** |

**추가 비용**:
- Apple Developer Program: $99/년 (iOS 배포 필수)
- Google Play 개발자 등록: $25 (일회성)

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    무료 빌드 시스템                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │  Android 빌드     │         │   iOS 빌드        │      │
│  │  (GitHub Actions)│         │   (로컬 macOS)   │      │
│  │                  │         │                  │      │
│  │  ✅ 완전 자동화   │         │  ✅ macOS 필수    │      │
│  │  ✅ APK/AAB 생성 │         │  ✅ Xcode 필요    │      │
│  │  ✅ 무제한 빌드   │         │  ✅ 5-10분 빌드   │      │
│  └──────────────────┘         └──────────────────┘      │
│           │                            │                 │
│           └────────────┬───────────────┘                 │
│                        ▼                                 │
│              ┌──────────────────┐                        │
│              │   배포 시스템      │                        │
│              │  (수동/자동)      │                        │
│              └──────────────────┘                        │
│                        │                                 │
│         ┌──────────────┼──────────────┐                  │
│         ▼              ▼              ▼                  │
│   Google Play    App Store      TestFlight              │
└─────────────────────────────────────────────────────────┘
```

## 🚀 빠른 시작 (플랫폼별)

### 🤖 Android (GitHub Actions - 완전 자동)

#### 1단계: GitHub Actions 활성화 (1분)
```bash
# 워크플로우 파일 푸시
git add .github/workflows/android-free-build.yml
git commit -m "feat: Android 무료 빌드 시스템 추가"
git push origin main
```

#### 2단계: 빌드 실행 (2분)
1. GitHub 저장소 → **Actions** 탭
2. **Android Free Build** 선택
3. **Run workflow** 클릭
4. 옵션 선택:
   - **Build Type**: APK (테스트) 또는 AAB (스토어)
   - **Version Bump**: true (자동 버전 증가)
5. **Run workflow** 버튼

#### 3단계: APK/AAB 다운로드 (1분)
- 빌드 완료 후 **Artifacts** 섹션에서 다운로드
- 파일명: `tarot-timer-v[빌드번호].apk/aab`

#### 로컬에서 빌드 (대안)
```bash
# APK 생성 (테스트용)
npm run build:android:local

# AAB 생성 (스토어 제출용)
npm run build:android:aab

# 빌드 파일 위치
# android/app/build/outputs/apk/release/
# android/app/build/outputs/bundle/release/
```

### 🍎 iOS (로컬 macOS - 5-10분)

#### 필수 준비물
- macOS 컴퓨터 (Mac mini, MacBook, iMac)
- Xcode 15.0 이상 (무료, App Store)
- Apple Developer Program ($99/년)

#### 1단계: Xcode 설치
```bash
# Command Line Tools 설치
xcode-select --install

# App Store에서 Xcode 설치
# https://apps.apple.com/us/app/xcode/id497799835
```

#### 2단계: 프로젝트 Prebuild
```bash
# iOS 네이티브 프로젝트 생성
npm run prebuild:ios

# CocoaPods 의존성 설치
cd ios
pod install
cd ..
```

#### 3단계: Xcode에서 빌드
```bash
# Xcode 열기
open ios/tarottimerweb.xcworkspace
```

**Xcode에서**:
1. **Product** → **Destination** → **Any iOS Device (arm64)**
2. **Product** → **Archive** 클릭
3. 빌드 완료 후 **Distribute App** → **App Store Connect**

#### CLI로 빌드 (대안)
```bash
# 릴리즈 빌드
npm run build:ios:local

# 또는
npx expo run:ios --configuration Release
```

## 📋 상세 설정 가이드

### Android 상세 가이드

#### Keystore 설정 (프로덕션)

**1. Keystore 생성**
```bash
cd android/app

# Release keystore 생성
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias tarot-timer-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Tarot Timer, OU=Development, O=Tarot Timer Team, L=Seoul, ST=Seoul, C=KR"
```

**2. GitHub Secrets 등록**
- `ANDROID_KEYSTORE_BASE64`: keystore 파일을 base64로 인코딩
- `KEYSTORE_PASSWORD`: Keystore 비밀번호
- `KEY_ALIAS`: tarot-timer-key
- `KEY_PASSWORD`: Key 비밀번호

```bash
# Keystore를 base64로 인코딩
base64 android/app/release.keystore | pbcopy  # macOS
base64 android/app/release.keystore | clip    # Windows
```

**3. gradle.properties 설정**
```properties
# android/gradle.properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=tarot-timer-key
MYAPP_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

### iOS 상세 가이드

자세한 내용은 [IOS_LOCAL_BUILD_GUIDE.md](./IOS_LOCAL_BUILD_GUIDE.md) 참고

#### 주요 단계 요약
1. **Apple Developer 계정** 등록 ($99/년)
2. **Xcode** 설치 및 설정
3. **서명 인증서** 설정
4. **Provisioning Profile** 생성
5. **Archive** 생성 및 제출

## 🔄 CI/CD 통합

### GitHub Actions 워크플로우

#### Android 자동 빌드
```yaml
# .github/workflows/android-free-build.yml
# 이미 설정되어 있음!
# 사용법: GitHub → Actions → Run workflow
```

#### iOS CI/CD (옵션)
```yaml
# macOS runner 사용 (GitHub Actions)
# 주의: macOS runner는 Linux보다 10배 비쌈
# 권장: 로컬 빌드 사용
```

### 브랜치 전략

```
main (프로덕션)
  ├─ release/* (릴리즈 브랜치)
  └─ develop (개발)
      └─ feature/* (기능 브랜치)
```

**자동 빌드 트리거**:
- `main` 브랜치 푸시 → Android AAB 빌드
- `develop` 브랜치 푸시 → Android APK 빌드
- `release/*` 태그 → iOS + Android 프로덕션 빌드

## 🎛️ 빌드 스크립트

### package.json 스크립트

```json
{
  "scripts": {
    // 무료 빌드 (새로 추가됨)
    "build:android:local": "expo prebuild --platform android --clean && cd android && ./gradlew assembleRelease",
    "build:android:aab": "expo prebuild --platform android --clean && cd android && ./gradlew bundleRelease",
    "build:ios:local": "expo prebuild --platform ios --clean && cd ios && pod install && xcodebuild -workspace tarottimerweb.xcworkspace -scheme tarottimerweb -configuration Release archive",
    "build:all:local": "npm run build:android:local && npm run build:ios:local",

    // Prebuild 스크립트
    "prebuild:android": "expo prebuild --platform android --clean",
    "prebuild:ios": "expo prebuild --platform ios --clean",
    "prebuild:all": "expo prebuild --clean"
  }
}
```

## 📦 배포 워크플로우

### Android 배포 (Google Play)

#### 1. AAB 생성
```bash
# GitHub Actions에서 자동 빌드
# 또는
npm run build:android:aab
```

#### 2. Google Play Console 업로드
1. [Google Play Console](https://play.google.com/console) 접속
2. **프로덕션** → **새 버전 만들기**
3. AAB 파일 업로드
4. 출시 노트 작성
5. **출시 검토** → **출시 시작**

#### 3. 자동 제출 (옵션)
```bash
# EAS Submit 사용 (무료)
eas submit --platform android --latest
```

### iOS 배포 (App Store)

#### 1. Archive 생성
```bash
# Xcode에서 생성
# Product → Archive → Distribute App
```

#### 2. App Store Connect 업로드
- Xcode Organizer에서 자동 업로드
- 또는 Transporter 앱 사용

#### 3. App Store Connect에서 제출
1. [App Store Connect](https://appstoreconnect.apple.com) 접속
2. **TestFlight** 탭에서 빌드 확인
3. **App Store** 탭 → **제출 준비**
4. 스크린샷, 설명 등 메타데이터 입력
5. **심사 제출**

## 🔐 보안 권장사항

### ✅ 해야 할 것
- Keystore 파일을 **절대** Git에 커밋하지 않기
- `.gitignore`에 `*.keystore`, `*.jks` 추가
- GitHub Secrets에 민감한 정보 저장
- 정기적으로 인증서 및 키 갱신

### ❌ 하지 말아야 할 것
- 테스트 keystore로 프로덕션 빌드
- 비밀번호를 코드에 하드코딩
- 인증서를 공개 저장소에 노출

## 🐛 문제 해결

### Android 빌드 실패

#### "SDK location not found"
```bash
# ANDROID_HOME 환경변수 설정
export ANDROID_HOME=$HOME/Android/Sdk  # Linux/macOS
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk  # Windows
```

#### "Execution failed for task ':app:mergeReleaseResources'"
```bash
# Gradle 캐시 삭제
cd android
./gradlew clean
./gradlew assembleRelease --refresh-dependencies
```

### iOS 빌드 실패

#### "No provisioning profile found"
- Xcode → Signing & Capabilities → Automatically manage signing 체크

#### "Code signing error"
```bash
# 인증서 확인
security find-identity -v -p codesigning

# Keychain에서 인증서 상태 확인
```

자세한 내용은 [IOS_LOCAL_BUILD_GUIDE.md](./IOS_LOCAL_BUILD_GUIDE.md) 참고

## 📈 성능 비교

| 항목 | EAS Build | 무료 빌드 | 차이 |
|------|-----------|-----------|------|
| **Android 빌드 시간** | 15-20분 | 5-10분 | **2-3배 빠름** |
| **iOS 빌드 시간** | 15-20분 | 5-10분 | **2-3배 빠름** |
| **비용 (월 20회)** | ~$20 | $0 | **$240/년 절감** |
| **빌드 큐 대기** | 있음 | 없음 | **즉시 빌드** |
| **커스터마이징** | 제한적 | 무제한 | **완전 제어** |

## 🎯 권장 워크플로우

### 개발 단계
```bash
# 로컬 개발 서버
npm start

# Android 에뮬레이터
npm run android

# iOS 시뮬레이터
npm run ios
```

### 테스트 단계
```bash
# Android APK 생성 (GitHub Actions)
# GitHub → Actions → Android Free Build → APK

# iOS 시뮬레이터 빌드
npx expo run:ios
```

### 프로덕션 단계
```bash
# Android AAB (GitHub Actions)
# GitHub → Actions → Android Free Build → AAB

# iOS Archive (로컬 macOS)
npm run build:ios:local
# 또는 Xcode → Product → Archive
```

## 📚 추가 리소스

### 공식 문서
- [Expo Bare Workflow](https://docs.expo.dev/workflow/overview/)
- [Android App Bundles](https://developer.android.com/guide/app-bundle)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)
- [GitHub Actions](https://docs.github.com/en/actions)

### 프로젝트 가이드
- [IOS_LOCAL_BUILD_GUIDE.md](./IOS_LOCAL_BUILD_GUIDE.md) - iOS 상세 가이드
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - GitHub Actions 설정
- [GITHUB_ACTIONS_QUICKSTART.md](./GITHUB_ACTIONS_QUICKSTART.md) - 빠른 시작

## 🎉 완료!

이제 **완전 무료**로 iOS와 Android 앱을 빌드할 수 있습니다!

### 다음 단계
1. ✅ Android: GitHub Actions 워크플로우 실행
2. ✅ iOS: macOS에서 Xcode로 빌드
3. ✅ 배포: Google Play & App Store 제출

---

**작성일**: 2025-10-27
**업데이트**: 2025-10-27
**비용 절감**: $240/년
**빌드 시간**: 평균 5-10분
