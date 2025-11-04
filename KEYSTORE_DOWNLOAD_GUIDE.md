# EAS 키스토어 다운로드 및 설정 가이드

## 🎯 목표
Google Play Console에서 요구하는 올바른 키스토어로 서명된 AAB 생성

**필요한 SHA1**: `62:0F:37:93:FA:E8:61:50:10:0C:8D:65:E6:FA:63:35:02:09:0F:B7`

---

## 📋 Step 1: EAS에서 키스토어 다운로드

### 방법 1: EAS CLI (추천)

```bash
# 1. EAS credentials 조회
eas credentials

# 프롬프트에서 선택:
# 1) Select platform: Android
# 2) Select profile: production
# 3) Select: Keystore: Manage everything needed to build your project
# 4) Select: Download credentials

# 키스토어가 다운로드됩니다:
# - 파일명: keystore.jks 또는 upload-keystore.jks
# - 저장 위치: 현재 디렉토리
```

### 방법 2: Expo 대시보드

1. https://expo.dev 접속
2. 프로젝트 선택: `tarot-timer`
3. 좌측 메뉴 → **Credentials**
4. Platform: **Android**
5. **Keystore** 섹션 찾기
6. **Download** 버튼 클릭

---

## 📋 Step 2: 키스토어 정보 확인

```bash
# 다운로드한 키스토어 정보 확인
keytool -list -v -keystore [다운로드한파일.jks]

# 프롬프트에서 비밀번호 입력 요청 시:
# EAS credentials에서 확인한 비밀번호 입력
```

**확인할 정보**:
- Alias name (예: upload)
- SHA1 지문 (62:0F:37:93:FA:E8:61:50:10:0C:8D:65:E6:FA:63:35:02:09:0F:B7과 일치해야 함)

---

## 📋 Step 3: 키스토어 파일 배치

```bash
# 1. 다운로드한 키스토어를 android/app/로 복사
cp [다운로드한파일.jks] android/app/upload-keystore.jks

# 2. 권한 설정 (Unix/Linux/Mac)
chmod 600 android/app/upload-keystore.jks

# 3. .gitignore 확인
echo "android/app/upload-keystore.jks" >> .gitignore
```

---

## 📋 Step 4: gradle.properties 설정

### EAS에서 비밀번호 확인

```bash
# credentials 정보 JSON으로 출력
eas credentials -p android --json

# 또는 대화형으로 확인
eas credentials
# → Android
# → production
# → View credentials
```

### gradle.properties 업데이트

```bash
# android/gradle.properties 파일 수정
cd android

# 기존 MYAPP_RELEASE_* 설정 제거하고 다음 추가:
cat >> gradle.properties <<EOF

# Production Keystore (from EAS)
MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=[EAS에서 확인한 비밀번호]
MYAPP_UPLOAD_KEY_PASSWORD=[EAS에서 확인한 비밀번호]
EOF
```

**⚠️ 보안 주의사항**:
```bash
# gradle.properties를 gitignore에 추가 (비밀번호 보호)
echo "android/gradle.properties" >> .gitignore

# 또는 별도 파일로 관리:
# android/gradle.properties.local 생성
# android/build.gradle에서 로드
```

---

## 📋 Step 5: build.gradle 서명 설정 확인

### android/app/build.gradle 파일 확인

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

**이 설정이 없으면 추가해야 합니다.**

---

## 📋 Step 6: 키스토어 SHA1 검증

```bash
# 키스토어 SHA1 확인
keytool -list -v -keystore android/app/upload-keystore.jks -alias upload

# 출력에서 SHA1 지문 확인:
# SHA1: 62:0F:37:93:FA:E8:61:50:10:0C:8D:65:E6:FA:63:35:02:09:0F:B7

# ✅ 일치하면 올바른 키스토어
# ❌ 불일치하면 다시 다운로드 또는 EAS 대시보드에서 확인
```

---

## 📋 Step 7: 로컬 빌드 테스트

```bash
# 1. Clean build
npx expo prebuild --platform android --clean

# 2. AAB 빌드
cd android
./gradlew clean
./gradlew bundleRelease --no-daemon

# 3. 빌드 성공 확인
ls -lh app/build/outputs/bundle/release/app-release.aab

# 4. AAB의 서명 확인 (선택사항)
# jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab
```

---

## 📋 Step 8: Google Play Console 업로드

```bash
# 1. AAB 파일 위치
android/app/build/outputs/bundle/release/app-release.aab

# 2. Google Play Console 수동 업로드
# https://play.google.com/console
# → Tarot Timer 앱 선택
# → 프로덕션 → 새 버전 만들기
# → AAB 파일 업로드

# 3. 또는 EAS Submit 사용
eas submit --platform android --path android/app/build/outputs/bundle/release/app-release.aab
```

---

## ✅ 최종 체크리스트

빌드 전 반드시 확인:

- [ ] `android/app/upload-keystore.jks` 파일 존재
- [ ] `android/gradle.properties`에 MYAPP_UPLOAD_* 설정 완료
- [ ] `android/local.properties`에 sdk.dir 설정 완료
- [ ] 키스토어 SHA1 지문 일치 확인
- [ ] `android/app/build.gradle`에 signingConfigs 설정 확인
- [ ] `.gitignore`에 키스토어 및 비밀번호 파일 추가

---

## 🆘 문제 해결

### "키스토어를 찾을 수 없습니다"

```bash
# 1. 파일 존재 확인
ls -la android/app/upload-keystore.jks

# 2. gradle.properties 경로 확인
cat android/gradle.properties | grep MYAPP_UPLOAD_STORE_FILE
# 출력: MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
```

### "비밀번호가 틀렸습니다"

```bash
# EAS에서 비밀번호 다시 확인
eas credentials -p android

# gradle.properties 업데이트
```

### "SHA1이 여전히 일치하지 않습니다"

```bash
# 1. 다운로드한 키스토어 SHA1 확인
keytool -list -v -keystore android/app/upload-keystore.jks

# 2. Google Play Console 요구사항 재확인
# 필요한 SHA1: 62:0F:37:93:FA:E8:61:50:10:0C:8D:65:E6:FA:63:35:02:09:0F:B7

# 3. 불일치 시 EAS 대시보드에서 키스토어 재확인 필요
# 또는 Google Play Console에서 새 키스토어 등록 고려
```

---

## 📝 현재 상태 (2025-10-27)

- **app.json 버전**: 1.0.9
- **Android versionCode**: 100
- **빌드 상태**: ❌ 키스토어 불일치 (임시 키스토어 사용됨)
- **다음 작업**: EAS에서 올바른 키스토어 다운로드 및 설정

---

**작성일**: 2025-10-27
**목적**: 로컬 Android 빌드에 올바른 키스토어 적용
**우선순위**: 🔴 긴급
