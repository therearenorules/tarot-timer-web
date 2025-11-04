# iOS 인증서 및 프로비저닝 프로필 준비 가이드

## 🎯 목표
Codemagic에서 iOS 빌드에 필요한 인증서(.p12)와 프로비저닝 프로필(.mobileprovision) 준비

---

## 📋 Step 1: Apple Developer 계정 확인

**필수 정보**:
- Apple Developer 계정 (연간 $99)
- Team ID
- App ID: `com.tarottimer.app` (또는 실제 Bundle Identifier)

---

## 📋 Step 2: Mac에서 인증서 내보내기

### Keychain Access에서 인증서 찾기

```bash
# 1. Mac에서 Keychain Access 앱 열기
open "/Applications/Utilities/Keychain Access.app"

# 2. 좌측 "login" 키체인 선택
# 3. 카테고리에서 "My Certificates" 선택
# 4. 다음 중 하나 찾기:
#    - "Apple Distribution: [Your Name]" (App Store용)
#    - "iPhone Distribution: [Your Name]" (구형)
```

### .p12 파일로 내보내기

1. 인증서 우클릭 → **Export "Apple Distribution: ..."**
2. 파일 형식: **Personal Information Exchange (.p12)**
3. 저장 위치: 바탕화면
4. 비밀번호 설정 (나중에 Codemagic에 입력)
5. Mac 로그인 비밀번호 입력

**결과 파일**: `Certificates.p12` (약 2-5 KB)

---

## 📋 Step 3: 프로비저닝 프로필 다운로드

### Apple Developer Portal

```bash
# 브라우저에서:
https://developer.apple.com/account/resources/profiles/list

# 또는 Mac 터미널에서:
open "https://developer.apple.com/account/resources/profiles/list"
```

**절차**:
1. Apple Developer 로그인
2. **Certificates, Identifiers & Profiles** → **Profiles**
3. App Store용 프로필 찾기:
   - Type: **App Store**
   - App ID: `com.tarottimer.app` (실제 Bundle ID 확인)
4. **Download** 클릭

**없으면 새로 생성**:
1. **+** 버튼 클릭
2. Distribution → **App Store** 선택
3. App ID 선택
4. 인증서 선택 (Step 2에서 내보낸 인증서)
5. Profile Name: `Tarot Timer App Store`
6. **Generate** → **Download**

**결과 파일**: `Tarot_Timer_App_Store.mobileprovision` (약 5-10 KB)

---

## 📋 Step 4: Codemagic에 업로드

### 4.1 Codemagic 대시보드 접속

```bash
# 브라우저에서:
https://codemagic.io/apps

# 프로젝트: tarot-timer-web 선택
```

### 4.2 Code Signing Identities 설정

**경로**:
```
Codemagic → Teams (좌측 메뉴) → 본인 Team 선택 → Code signing identities
```

또는:
```
프로젝트 페이지 → Team settings → iOS code signing
```

### 4.3 인증서 업로드

1. **iOS certificates** 섹션
2. **Add certificate** 클릭
3. Certificate (.p12) 파일 선택
4. 비밀번호 입력 (Step 2에서 설정한 비밀번호)
5. **Upload** 클릭

### 4.4 프로비저닝 프로필 업로드

1. **iOS provisioning profiles** 섹션
2. **Add profile** 클릭
3. `.mobileprovision` 파일 선택
4. **Upload** 클릭

---

## 📋 Step 5: codemagic.yaml 환경 변수 추가

업로드 완료 후 Codemagic에서 자동으로 환경 변수가 설정됩니다:

```yaml
environment:
  groups:
    # Codemagic에서 자동 생성된 환경 변수 그룹
    - codemagic
  ios_signing:
    distribution_type: app_store
    bundle_identifier: com.tarottimer.app
```

---

## 📋 Step 6: codemagic.yaml 업데이트

```yaml
workflows:
  ios-production:
    name: iOS Production Build
    max_build_duration: 60
    instance_type: mac_mini_m1

    environment:
      ios_signing:
        distribution_type: app_store
        bundle_identifier: com.tarottimer.app  # 실제 Bundle ID로 변경

      vars:
        XCODE_WORKSPACE: "ios/TarotTimerLearnCardMeanings.xcodeproj/project.xcworkspace"
        XCODE_SCHEME: "TarotTimerLearnCardMeanings"

      node: 20.11.0
      xcode: latest

    scripts:
      # ... (기존 스크립트 유지)

      - name: 🏗️ Build iOS app
        script: |
          xcode-project build-ipa \
            --workspace "$WORKSPACE_FILE" \
            --scheme "$SCHEME_NAME" \
            --config "Release"
          # export-options-plist는 자동 생성됨

    artifacts:
      - build/ios/ipa/*.ipa

    publishing:
      app_store_connect:
        # App Store Connect 자동 업로드 (선택사항)
        api_key: $APP_STORE_CONNECT_KEY_IDENTIFIER
        key_id: $APP_STORE_CONNECT_KEY_IDENTIFIER
        issuer_id: $APP_STORE_CONNECT_ISSUER_ID
```

---

## 📋 Step 7: Bundle Identifier 확인

### app.json 확인

```bash
cat app.json | grep bundleIdentifier
```

**출력 예시**:
```json
"bundleIdentifier": "com.tarottimer.app"
```

### 불일치 시 수정

```bash
# app.json 수정
# ios.bundleIdentifier를 프로비저닝 프로필의 App ID와 일치시키기
```

---

## 📋 Step 8: Team ID 확인 및 설정

### Apple Developer에서 Team ID 확인

```bash
# 브라우저에서:
https://developer.apple.com/account

# Membership Details → Team ID (10자리 영문+숫자)
```

### app.json에 Team ID 추가

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tarottimer.app",
      "buildNumber": "106",
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      },
      "appleTeamId": "YOUR_TEAM_ID"  // 추가
    }
  }
}
```

---

## ✅ 최종 체크리스트

Codemagic 빌드 전 확인:

- [ ] Apple Distribution 인증서 (.p12) Codemagic에 업로드 완료
- [ ] App Store 프로비저닝 프로필 (.mobileprovision) 업로드 완료
- [ ] `app.json`의 `ios.bundleIdentifier`와 프로필의 App ID 일치
- [ ] `app.json`에 `ios.appleTeamId` 추가
- [ ] `codemagic.yaml`에 `ios_signing` 설정 추가
- [ ] Bundle Identifier가 프로비저닝 프로필과 일치하는지 확인

---

## 🆘 문제 해결

### "인증서를 찾을 수 없습니다"

**Mac Keychain에 없는 경우**:

1. **Apple Developer Portal에서 새로 생성**:
   ```bash
   # 브라우저에서:
   https://developer.apple.com/account/resources/certificates/list

   # + 버튼 → iOS Distribution → Continue
   # CSR 업로드 (Mac Keychain Access에서 생성)
   # 다운로드 → 더블클릭하여 Keychain에 설치
   # Keychain Access에서 .p12로 내보내기
   ```

### "프로비저닝 프로필이 만료되었습니다"

```bash
# 1. Apple Developer Portal에서 프로필 재생성
# 2. 다운로드
# 3. Codemagic에 재업로드
```

### "Bundle Identifier가 일치하지 않습니다"

```bash
# 1. 프로비저닝 프로필의 App ID 확인
#    (프로필 파일을 텍스트 에디터로 열어서 확인 가능)

# 2. app.json 수정
#    "bundleIdentifier": "프로필의_App_ID"

# 3. Expo prebuild 재실행
npx expo prebuild --platform ios --clean
```

---

## 📝 현재 상태

- **프로젝트**: Tarot Timer Web
- **Bundle ID**: 확인 필요
- **다음 작업**:
  1. Mac에서 인증서 .p12 내보내기
  2. Apple Developer에서 프로비저닝 프로필 다운로드
  3. Codemagic에 업로드
  4. `codemagic.yaml` 업데이트

---

**작성일**: 2025-10-30
**목적**: Codemagic iOS 빌드 코드 서명 설정
**우선순위**: 🔴 필수
