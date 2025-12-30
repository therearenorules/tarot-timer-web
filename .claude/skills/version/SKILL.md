---
name: version
description: iOS/Android 앱 버전을 업데이트합니다. major/minor/patch 타입 또는 직접 버전을 지정할 수 있습니다.
allowed-tools: Read, Edit, Bash, AskUserQuestion
---

# 앱 버전 업데이트

iOS/Android 앱 버전을 업데이트합니다.

## 현재 버전 확인

```bash
cat app.json | grep -E '"version"|"buildNumber"|"versionCode"'
```

## 사용자에게 확인

버전 업데이트 타입을 확인합니다:
- **major**: 큰 기능 변경 (1.x.x → 2.0.0)
- **minor**: 새 기능 추가 (1.1.x → 1.2.0)
- **patch**: 버그 수정 (1.1.9 → 1.1.10)
- **직접 입력**: 예) 1.2.0

## 업데이트 대상

| 파일 | 필드 |
|------|------|
| app.json | version |
| app.json | expo.ios.buildNumber |
| app.json | expo.android.versionCode |
| package.json | version |

## 버전 규칙

- `version`: semantic versioning (X.Y.Z)
- `buildNumber` (iOS): 문자열, 매 빌드마다 증가 (예: "207" → "208")
- `versionCode` (Android): 정수, 매 빌드마다 증가 (예: 119 → 120)

## 완료 후

버전 업데이트 전후 비교를 보여주세요:

| 필드 | 이전 | 이후 |
|------|------|------|
| version | 1.1.9 | 1.2.0 |
| buildNumber | 207 | 208 |
| versionCode | 119 | 120 |
