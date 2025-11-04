# Android 로컬 빌드 키스토어 설정 가이드

## ❌ 문제 상황
로컬 빌드 시 생성한 임시 키스토어를 사용하여 AAB를 서명했기 때문에 Google Play Console에서 거부됨.

**오류 메시지**:
```
Android App Bundle이 잘못된 키로 서명되었습니다.
필요한 SHA1: 62:0F:37:93:FA:E8:61:50:10:0C:8D:65:E6:FA:63:35:02:09:0F:B7
실제 사용된 SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## ✅ 해결 방법

### 방법 1: EAS 빌드 사용 (권장) ⭐

**가장 안전하고 확실한 방법**

```bash
# 1. EAS 클라우드 빌드 실행
eas build --platform android --profile production

# 2. 빌드 완료 후 AAB 다운로드
# Expo 대시보드에서 자동으로 다운로드 링크 제공

# 3. Google Play Console에 업로드
```

**장점**:
- ✅ 올바른 키스토어로 자동 서명
- ✅ 키스토어 관리 불필요
- ✅ 일관된 빌드 환경
- ✅ 실수 가능성 제로

**비용**:
- 월 30분 무료 (Android AAB 빌드 ~10-15분)
- 초과 시 $1/분

---

### 방법 2: EAS 키스토어 다운로드 후 로컬 사용

#### Step 1: EAS에서 키스토어 다운로드

```bash
# credentials.json 생성
eas credentials
# → Select: Android
# → Select: production
# → Select: Keystore: Manage everything needed to build your project
# → Select: Download credentials
```

또는 수동으로:

```bash
# 키스토어 정보 조회
eas credentials -p android

# JSON 형태로 저장
eas credentials -p android --json > android-credentials.json
```

#### Step 2: 키스토어 파일 복원

```bash
# EAS에서 다운로드한 base64 키스토어를 파일로 변환
cd android/app

# credentials.json에서 keystore base64 추출 후 디코딩
# (실제 명령어는 다운로드한 파일 형식에 따라 다름)
cat android-credentials.json | jq -r '.keystore' | base64 -d > production.keystore
```

#### Step 3: gradle.properties 업데이트

```bash
# android/gradle.properties 파일 수정
cd android

cat > gradle.properties.local <<EOF
# EAS Production Keystore
MYAPP_RELEASE_STORE_FILE=production.keystore
MYAPP_RELEASE_KEY_ALIAS=<EAS에서 확인한 alias>
MYAPP_RELEASE_STORE_PASSWORD=<EAS에서 확인한 password>
MYAPP_RELEASE_KEY_PASSWORD=<EAS에서 확인한 password>
EOF

# .gitignore에 추가 (중요!)
echo "gradle.properties.local" >> .gitignore
echo "android/app/production.keystore" >> .gitignore
```

#### Step 4: 로컬 빌드 실행

```bash
# Prebuild
npx expo prebuild --platform android --clean

# AAB 빌드
cd android
./gradlew bundleRelease --no-daemon

# 결과 확인
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

### 방법 3: GitHub Actions 무료 빌드 (EAS 키스토어 사용)

#### Step 1: GitHub Secrets 설정

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 다음 시크릿 추가:

```
ANDROID_KEYSTORE_BASE64: <EAS에서 다운로드한 키스토어를 base64로 인코딩>
ANDROID_KEY_ALIAS: <EAS alias>
ANDROID_KEYSTORE_PASSWORD: <EAS password>
ANDROID_KEY_PASSWORD: <EAS password>
```

**키스토어 base64 인코딩**:
```bash
# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("production.keystore"))

# macOS/Linux
base64 -i production.keystore
```

#### Step 2: Workflow 트리거

```bash
# GitHub Actions 탭에서 수동 트리거
# 또는 CLI로:
gh workflow run "Android Free Build (무료 빌드)" \
  --field build_type=aab \
  --field version_bump=true
```

---

## 🎯 권장 솔루션 비교

| 방법 | 난이도 | 비용 | 안전성 | 권장도 |
|------|--------|------|--------|--------|
| **EAS 빌드** | ⭐ 쉬움 | 무료(월 30분) | ⭐⭐⭐ | ✅ 최고 |
| **로컬 + EAS 키** | ⭐⭐⭐ 어려움 | 무료 | ⭐⭐ | 보통 |
| **GitHub Actions** | ⭐⭐ 보통 | 무료 | ⭐⭐⭐ | ✅ 좋음 |

---

## 🚀 즉시 실행 가능한 명령어 (방법 1)

```bash
# 1. EAS 빌드 (가장 확실한 방법)
eas build --platform android --profile production

# 2. 빌드 상태 확인
eas build:list --platform android --limit 1

# 3. 빌드 완료 후 Google Play에 자동 제출 (선택)
eas submit --platform android --latest
```

---

## 📋 체크리스트

### 로컬 빌드 실행 전 반드시 확인:
- [ ] EAS 키스토어 다운로드 완료
- [ ] `android/app/production.keystore` 파일 존재
- [ ] `gradle.properties`에 올바른 키스토어 설정
- [ ] 키스토어 SHA1 지문 확인:
  ```bash
  keytool -list -v -keystore android/app/production.keystore
  # 출력된 SHA1이 Google Play Console 요구사항과 일치하는지 확인
  # 필요한 SHA1: 62:0F:37:93:FA:E8:61:50:10:0C:8D:65:E6:FA:63:35:02:09:0F:B7
  ```

---

## 💡 최종 권장사항

**✅ 가장 안전한 방법: EAS 빌드 사용**

```bash
# 현재 상태:
# - app.json 버전: 1.0.9
# - Android versionCode: 100

# 즉시 실행:
eas build --platform android --profile production

# 예상 소요 시간: 10-15분
# 비용: 무료 (월 30분 한도 내)
# 결과: 올바른 키로 서명된 AAB 자동 생성
```

**다음 빌드부터는 로컬 빌드를 원하면**:
1. 위 방법 2 또는 3을 한 번만 설정
2. 이후 로컬 빌드 가능

---

**작성일**: 2025-10-27
**문제**: 로컬 빌드 키스토어 불일치
**상태**: ✅ 해결 방법 문서화 완료
