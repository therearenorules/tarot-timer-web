# iOS 무료 로컬 빌드 가이드

## 🍎 iOS 앱을 macOS에서 무료로 빌드하기

EAS Build 대신 macOS + Xcode를 사용해 완전 무료로 iOS 앱을 빌드할 수 있습니다.

## 📋 필수 요구사항

### 하드웨어
- **macOS 컴퓨터** (Mac mini, MacBook, iMac 등)
- **최소 15GB 여유 공간** (Xcode + 빌드 파일)

### 소프트웨어
- **macOS 13 (Ventura)** 이상 권장
- **Xcode 15.0** 이상
- **Node.js 18** 이상
- **CocoaPods** (자동 설치됨)

### Apple 계정
- **Apple Developer Program** (연간 $99)
  - App Store 배포 필수
  - 실기기 테스트 필수
- **무료 Apple ID**도 가능하지만:
  - 7일 후 재서명 필요
  - 실기기 테스트만 가능 (배포 불가)

## 🚀 빠른 시작 (5단계)

### 1️⃣ Xcode 설치

```bash
# App Store에서 Xcode 설치 (무료, 10GB+)
# 또는 터미널에서 확인
xcode-select --install

# Xcode Command Line Tools 설치 확인
xcode-select -p
# 출력: /Applications/Xcode.app/Contents/Developer
```

### 2️⃣ 프로젝트 Prebuild

```bash
# 프로젝트 디렉토리로 이동
cd tarot-timer-web

# iOS 네이티브 프로젝트 생성
npx expo prebuild --platform ios --clean

# CocoaPods 의존성 설치
cd ios
pod install
cd ..
```

### 3️⃣ Xcode에서 프로젝트 열기

```bash
# Xcode 실행
open ios/tarottimerweb.xcworkspace
```

⚠️ **중요**: `.xcworkspace` 파일을 열어야 합니다 (`.xcodeproj` 아님!)

### 4️⃣ 서명 설정

Xcode에서:
1. **프로젝트 네비게이터**에서 프로젝트 클릭
2. **Signing & Capabilities** 탭 선택
3. **Automatically manage signing** 체크
4. **Team** 드롭다운에서 Apple Developer Team 선택
5. **Bundle Identifier** 확인 (고유해야 함)

### 5️⃣ 빌드 및 실행

```bash
# 시뮬레이터에서 실행 (무료)
npx expo run:ios

# 실기기에서 실행 (Apple Developer 필요)
npx expo run:ios --device

# 릴리즈 빌드 (App Store 제출용)
npx expo run:ios --configuration Release
```

## 📦 Archive 생성 (App Store 제출용)

### GUI 방법 (Xcode)

1. Xcode에서 **Product** → **Destination** → **Any iOS Device (arm64)**
2. **Product** → **Archive** 클릭
3. 빌드 완료 후 **Organizer** 자동 열림
4. **Distribute App** 클릭:
   - **App Store Connect** 선택 (스토어 배포)
   - **Ad Hoc** 선택 (테스터 배포)
   - **Development** 선택 (개발 테스트)

### CLI 방법 (터미널)

```bash
# Archive 생성
cd ios

# 릴리즈 빌드
xcodebuild -workspace tarottimerweb.xcworkspace \
  -scheme tarottimerweb \
  -configuration Release \
  -archivePath ./build/tarottimerweb.xcarchive \
  archive

# IPA 파일 생성 (App Store 제출용)
xcodebuild -exportArchive \
  -archivePath ./build/tarottimerweb.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist exportOptions.plist

# exportOptions.plist 파일 예시는 아래 참고
```

#### exportOptions.plist 예시

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>
```

## 🤖 빌드 자동화 스크립트

프로젝트에 자동화 스크립트를 추가했습니다:

```bash
# Android 빌드
npm run build:android:local

# iOS 빌드 (macOS만)
npm run build:ios:local

# 둘 다 빌드
npm run build:all:local
```

## 🔐 서명 인증서 관리

### 개발 인증서 (Development)
- **용도**: 실기기 테스트
- **유효기간**: 1년
- **필요**: Apple Developer Program

### 배포 인증서 (Distribution)
- **용도**: App Store 제출
- **유효기간**: 1년
- **필요**: Apple Developer Program

### Provisioning Profile
- **Development Profile**: 등록된 기기에서만 실행
- **Ad Hoc Profile**: 최대 100대 기기 테스트
- **App Store Profile**: App Store 배포용

#### 인증서 갱신
```bash
# 만료된 인증서 확인
security find-identity -v -p codesigning

# Xcode에서 자동 갱신
# Xcode → Settings → Accounts → Manage Certificates → + 버튼
```

## 🐛 문제 해결

### 1. "No provisioning profile found"
```bash
# 해결: Xcode에서 자동 서명 활성화
# Signing & Capabilities → Automatically manage signing 체크
```

### 2. "Pod install failed"
```bash
# CocoaPods 업데이트
sudo gem install cocoapods

# 캐시 삭제 후 재시도
cd ios
pod deintegrate
pod install
```

### 3. "Build failed" (M1/M2 Mac)
```bash
# Rosetta로 실행
sudo softwareupdate --install-rosetta

# 아키텍처 제외 설정
cd ios
echo 'EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64' >> Podfile
pod install
```

### 4. "Code signing error"
```bash
# 인증서 확인
security find-identity -v -p codesigning

# Keychain Access에서 인증서 확인
open "/Applications/Utilities/Keychain Access.app"
```

### 5. "Missing required icon"
```bash
# app.json 아이콘 경로 확인
# 1024x1024 PNG 파일 필수
npx expo prebuild --clean
```

## 📊 빌드 시간 비교

| 방법 | 시간 | 비용 | 편의성 |
|------|------|------|--------|
| **EAS Build** | 15-20분 | 💰 유료 | ⭐⭐⭐⭐⭐ |
| **로컬 빌드** | 5-10분 | 🆓 무료 | ⭐⭐⭐ |
| **CI/CD (GitHub Actions)** | 20-30분 | 🆓 무료 (macOS runner 제한) | ⭐⭐⭐⭐ |

## 🎯 권장 워크플로우

### 개발 단계
```bash
# 시뮬레이터에서 빠른 테스트
npx expo run:ios
```

### 테스트 단계
```bash
# 실기기에서 테스트
npx expo run:ios --device
```

### 배포 단계
```bash
# Xcode에서 Archive 생성
# Product → Archive → Distribute App
```

## 💡 팁과 트릭

### 빌드 속도 향상
```bash
# Derived Data 정리 (빌드 캐시)
rm -rf ~/Library/Developer/Xcode/DerivedData

# 병렬 빌드 활성화
defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsExclusively -bool NO
```

### 빌드 로그 확인
```bash
# 상세 로그 출력
npx expo run:ios --verbose

# Xcode 빌드 로그
# Xcode → Report Navigator (⌘ + 9) → Build 선택
```

### 여러 기기 동시 테스트
```bash
# 연결된 모든 기기 확인
xcrun xctrace list devices

# 특정 기기 지정
npx expo run:ios --device --udid "기기-UDID"
```

## 📚 추가 리소스

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Expo Bare Workflow](https://docs.expo.dev/workflow/overview/)
- [Xcode Build Settings](https://help.apple.com/xcode/mac/current/#/itcaec37c2a6)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)

---

**작성일**: 2025-10-27
**업데이트**: 2025-10-27
**플랫폼**: iOS 17+
**Xcode**: 15.0+
