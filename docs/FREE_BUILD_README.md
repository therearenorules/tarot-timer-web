# 🆓 무료 빌드 시스템 - 빠른 참조

## 💰 연간 $240 절감!

EAS Build를 사용하지 않고 **완전 무료**로 빌드하는 시스템입니다.

## 📚 문서 구조

| 문서 | 설명 | 대상 |
|------|------|------|
| **[FREE_BUILD_COMPLETE_GUIDE.md](./FREE_BUILD_COMPLETE_GUIDE.md)** | 전체 시스템 개요 및 상세 가이드 | 모두 |
| **[IOS_LOCAL_BUILD_GUIDE.md](./IOS_LOCAL_BUILD_GUIDE.md)** | iOS 로컬 빌드 상세 가이드 | iOS 개발자 |
| **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** | GitHub Actions 설정 가이드 | DevOps |
| **[GITHUB_ACTIONS_QUICKSTART.md](./GITHUB_ACTIONS_QUICKSTART.md)** | 5분 빠른 시작 | 초보자 |

## 🚀 60초 빠른 시작

### 🤖 Android (자동 빌드)
```bash
# 1. GitHub Actions 푸시
git add .github/workflows/android-free-build.yml
git commit -m "feat: 무료 Android 빌드 추가"
git push

# 2. GitHub → Actions → "Android Free Build" → Run workflow
```

### 🍎 iOS (로컬 빌드)
```bash
# macOS + Xcode 필요
# 1. Prebuild
npm run prebuild:ios

# 2. Xcode 열기
open ios/tarottimerweb.xcworkspace

# 3. Product → Archive → Distribute
```

## 📦 새로운 npm 스크립트

```bash
# Android 빌드
npm run build:android:local    # APK 생성
npm run build:android:aab      # AAB 생성 (스토어용)

# iOS 빌드 (macOS만)
npm run build:ios:local        # Archive 생성

# Prebuild
npm run prebuild:android       # Android 프로젝트 생성
npm run prebuild:ios          # iOS 프로젝트 생성
npm run prebuild:all          # 둘 다 생성
```

## 🎯 워크플로우 비교

| 작업 | EAS Build | 무료 빌드 | 시간 | 비용 |
|------|-----------|-----------|------|------|
| **Android 빌드** | eas build --platform android | GitHub Actions | 5-10분 | $0 |
| **iOS 빌드** | eas build --platform ios | Xcode Archive | 5-10분 | $0 |
| **빌드 대기** | 큐 대기 필요 | 즉시 시작 | 0분 | - |

## ⚙️ 시스템 요구사항

### Android 빌드
- ✅ **GitHub Actions**: 무료, 자동
- ✅ **로컬**: Windows/macOS/Linux + Node.js + Java

### iOS 빌드
- ✅ **macOS + Xcode**: 필수
- ✅ **Apple Developer Program**: $99/년 (스토어 배포)

## 📊 파일 구조

```
tarot-timer-web/
├── .github/workflows/
│   ├── android-free-build.yml      # Android 자동 빌드 ✨
│   ├── eas-build.yml               # EAS 자동 빌드 (기존)
│   └── eas-production.yml          # EAS 프로덕션 (기존)
├── docs/
│   ├── FREE_BUILD_COMPLETE_GUIDE.md   # 📘 전체 가이드
│   ├── IOS_LOCAL_BUILD_GUIDE.md       # 🍎 iOS 가이드
│   ├── GITHUB_ACTIONS_SETUP.md        # ⚙️ GitHub Actions
│   └── GITHUB_ACTIONS_QUICKSTART.md   # ⚡ 빠른 시작
└── package.json                       # 새 스크립트 추가됨 ✨
```

## 🔧 설정 단계

### 1단계: GitHub Actions (Android)
```bash
# 이미 설정 완료!
# GitHub → Actions 탭에서 바로 실행 가능
```

### 2단계: 로컬 환경 (iOS)
```bash
# Xcode 설치 (macOS App Store)
xcode-select --install

# Prebuild
npm run prebuild:ios
cd ios && pod install
```

### 3단계: 첫 빌드 실행
```bash
# Android: GitHub Actions 실행
# iOS: Xcode에서 Archive
```

## 🎉 완료!

이제 **완전 무료**로 빌드할 수 있습니다!

---

**절감 비용**: $240/년
**빌드 시간**: 5-10분
**설정 시간**: 10분
**난이도**: ⭐⭐⭐ (중급)

자세한 내용은 [FREE_BUILD_COMPLETE_GUIDE.md](./FREE_BUILD_COMPLETE_GUIDE.md)를 참고하세요!
