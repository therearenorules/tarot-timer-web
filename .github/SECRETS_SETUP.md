# 🔐 GitHub Secrets 설정 가이드

GitHub Actions 자동 배포를 위해 필요한 시크릿 설정 가이드입니다.

## 📋 필수 Secrets 목록

### Expo 관련
```
EXPO_TOKEN
```
- **설명**: Expo CLI 인증 토큰
- **획득 방법**: `expo login` 후 `expo whoami --json` 실행하여 token 값 복사
- **사용처**: EAS Build 및 Submit 인증

### iOS App Store 관련
```
APPLE_ID
APPLE_TEAM_ID
ASC_APP_ID
```
- **APPLE_ID**: Apple Developer 계정 이메일
- **APPLE_TEAM_ID**: Apple Developer Team ID (10자리 문자열)
- **ASC_APP_ID**: App Store Connect에서 생성한 앱 ID

### Android Play Store 관련
```
GOOGLE_SERVICE_ACCOUNT_KEY
```
- **설명**: Google Play Console API 서비스 계정 키 (JSON)
- **획득 방법**: Google Play Console → Setup → API access → Create service account
- **형식**: 전체 JSON 파일 내용을 Secret 값으로 설정

### 선택적 Secrets

#### 알림 (Slack/Discord)
```
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL
```
- **용도**: 배포 완료/실패 알림

#### 분석 및 모니터링
```
SENTRY_AUTH_TOKEN
AMPLITUDE_API_KEY
```
- **용도**: 오류 추적 및 사용자 분석

## 🛠️ Secrets 설정 방법

### 1. GitHub Repository Settings 접근
1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 좌측 메뉴에서 **Secrets and variables** → **Actions** 클릭

### 2. Secret 추가
1. **New repository secret** 버튼 클릭
2. Secret 이름과 값 입력
3. **Add secret** 버튼으로 저장

### 3. 환경별 Secrets (선택사항)
- **Development**: 개발 환경용 별도 설정
- **Production**: 프로덕션 환경용 설정

## 🔧 Expo 토큰 획득 방법

```bash
# 1. Expo 로그인
expo login

# 2. 토큰 확인
expo whoami --json

# 3. accessToken 값을 EXPO_TOKEN Secret으로 설정
```

## 🍎 iOS 설정 상세

### Apple Developer 계정 설정
1. [Apple Developer](https://developer.apple.com/) 가입
2. Certificates, Identifiers & Profiles 설정
3. App Store Connect에서 앱 등록

### 필수 정보 확인
```bash
# Team ID 확인 방법
# Apple Developer → Membership → Team ID

# Bundle Identifier 설정
# com.tarottimer.app (app.json과 일치해야 함)
```

## 🤖 Android 설정 상세

### Google Play Console 설정
1. [Google Play Console](https://play.google.com/console/) 접근
2. 새 앱 생성
3. API 액세스 설정

### 서비스 계정 생성
```bash
# 1. Google Cloud Console에서 서비스 계정 생성
# 2. JSON 키 파일 다운로드
# 3. Play Console에서 API 액세스 권한 부여
# 4. JSON 파일 전체 내용을 GOOGLE_SERVICE_ACCOUNT_KEY로 설정
```

## ⚠️ 보안 주의사항

### 절대 하지 말 것
- ❌ 코드에 직접 토큰/키 작성
- ❌ 로그에 민감 정보 출력
- ❌ 공개 저장소에 시크릿 파일 커밋

### 권장 사항
- ✅ 정기적으로 토큰 갱신
- ✅ 최소 권한 원칙 적용
- ✅ 환경별 분리 운영

## 🔍 검증 방법

### 1. 로컬 테스트
```bash
# 환경 변수 설정 후 테스트
export EXPO_TOKEN="your_token"
eas whoami
```

### 2. GitHub Actions 테스트
```bash
# 간단한 테스트 워크플로우 실행
# Repository → Actions → Run workflow
```

### 3. 빌드 테스트
```bash
# 개발 빌드로 설정 검증
eas build --platform all --profile development
```

## 📞 문제 해결

### 일반적인 오류
1. **Expo 토큰 만료**: `expo login` 후 새 토큰 생성
2. **Apple 인증 실패**: Team ID 및 Bundle ID 확인
3. **Google 권한 오류**: 서비스 계정 권한 재설정

### 지원 리소스
- [Expo Documentation](https://docs.expo.dev/)
- [Apple Developer Support](https://developer.apple.com/support/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

---

**💡 팁**: 모든 Secrets 설정 완료 후 수동으로 워크플로우를 실행하여 정상 작동을 확인하세요.

**🔄 업데이트**: 이 문서는 새로운 요구사항이나 플랫폼 변경사항에 따라 주기적으로 업데이트됩니다.