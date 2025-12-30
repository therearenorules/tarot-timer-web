---
name: prebuild
description: Expo prebuild를 실행하여 iOS와 Android 네이티브 프로젝트를 생성/업데이트합니다. 플랫폼 선택을 확인한 후 실행합니다.
allowed-tools: Bash, Read, AskUserQuestion
---

# Expo Prebuild 실행

iOS와 Android 네이티브 프로젝트를 생성/업데이트합니다.

## 사전 확인

사용자에게 플랫폼을 확인합니다:
- iOS만
- Android만
- 둘 다

## 실행 명령어

```bash
# iOS만
npx expo prebuild --platform ios --clean

# Android만
npx expo prebuild --platform android --clean

# 둘 다
npx expo prebuild --clean
```

## 완료 후 확인

1. `ios/` 폴더 생성 확인
2. `android/` 폴더 생성 확인
3. iOS: CocoaPods 설치 상태
4. Android: gradle 설정 상태

## 보고 형식

| 플랫폼 | 상태 | 비고 |
|--------|------|------|
| iOS | ✅/❌ | Podfile 상태 |
| Android | ✅/❌ | build.gradle 상태 |

prebuild 완료 후 결과를 요약해주세요.
