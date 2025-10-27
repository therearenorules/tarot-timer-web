# GitHub Actions로 EAS 빌드 자동화 설정 가이드

## 🎯 개요

GitHub Actions를 사용하면 코드를 푸시할 때마다 자동으로 EAS 빌드를 실행할 수 있습니다.
더 이상 Expo.dev 웹사이트에 접속하지 않고도 빌드를 자동화할 수 있습니다!

## 📋 필수 준비사항

### 1. Expo Access Token 발급

1. [Expo.dev](https://expo.dev)에 로그인
2. **Account Settings** → **Access Tokens** 이동
3. **Create Token** 클릭
4. 토큰 이름 입력 (예: `github-actions`)
5. 생성된 토큰을 **안전하게 복사** (한 번만 표시됩니다!)

### 2. GitHub Secrets 설정

GitHub 저장소에 Expo 토큰과 계정 정보를 등록해야 합니다.

#### 설정 방법:
1. GitHub 저장소 페이지로 이동
2. **Settings** → **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 클릭
4. 다음 Secrets를 추가:

| Secret 이름 | 값 | 설명 |
|------------|-----|------|
| `EXPO_TOKEN` | `your-expo-access-token` | 1단계에서 발급받은 토큰 |
| `EXPO_ACCOUNT_NAME` | `your-expo-account-name` | Expo 계정 이름 (expo.dev URL에서 확인) |

#### Expo 계정 이름 찾는 법:
- Expo.dev에 로그인 후 URL 확인: `https://expo.dev/accounts/[계정이름]/`
- 또는 `eas whoami` 명령어로 확인

## 🚀 워크플로우 설명

### 1. 자동 빌드 워크플로우 (`eas-build.yml`)

#### 트리거 조건:
- **main 브랜치 푸시** → iOS Preview 빌드 자동 실행
- **develop 브랜치 푸시** → Android Preview 빌드 자동 실행
- **Pull Request** → 코드 검증만 수행 (빌드 없음)
- **수동 실행** → 원하는 플랫폼/프로필 선택 가능

#### 수동 실행 방법:
1. GitHub 저장소 → **Actions** 탭
2. **EAS Build** 워크플로우 선택
3. **Run workflow** 클릭
4. 옵션 선택:
   - **Platform**: iOS, Android, All
   - **Profile**: production, preview, development
5. **Run workflow** 버튼 클릭

### 2. 프로덕션 빌드 워크플로우 (`eas-production.yml`)

#### 특징:
- **수동 실행만 가능** (안전성 보장)
- **프로덕션 빌드** 전용
- **자동 스토어 제출** 옵션 제공

#### 실행 방법:
1. GitHub 저장소 → **Actions** 탭
2. **EAS Production Build & Submit** 선택
3. **Run workflow** 클릭
4. 옵션 선택:
   - **Platform**: iOS, Android, All
   - **Auto submit**: true/false (스토어 자동 제출 여부)
5. **Run workflow** 버튼 클릭

## 📊 빌드 상태 확인

### GitHub에서 확인:
1. 저장소 → **Actions** 탭
2. 실행 중인 워크플로우 클릭
3. 각 단계별 로그 확인 가능

### Expo.dev에서 확인:
- 워크플로우 완료 후 링크를 통해 상세 빌드 상태 확인
- 또는 직접 [Expo Builds](https://expo.dev/) 페이지 방문

## ⚙️ 워크플로우 커스터마이징

### 브랜치별 빌드 전략 변경

현재 설정:
- `main` 브랜치 → iOS Preview
- `develop` 브랜치 → Android Preview

변경하려면 `.github/workflows/eas-build.yml` 파일 수정:

```yaml
- name: 🚀 Build iOS (Preview)
  if: github.ref == 'refs/heads/YOUR_BRANCH'  # 브랜치 변경
  run: eas build --platform ios --profile PROFILE_NAME --non-interactive --no-wait
```

### 빌드 프로필 추가

`eas.json` 파일에 새로운 프로필을 추가하고 워크플로우에서 사용:

```json
{
  "build": {
    "staging": {
      "extends": "preview",
      "env": {
        "ENVIRONMENT": "staging"
      }
    }
  }
}
```

## 🔒 보안 권장사항

### ✅ 해야 할 것:
- Expo Access Token을 GitHub Secrets에만 저장
- 토큰을 코드에 절대 커밋하지 않기
- 정기적으로 토큰 갱신 (6개월마다 권장)
- 프로덕션 빌드는 수동 승인 필요하도록 설정

### ❌ 하지 말아야 할 것:
- 토큰을 `.env` 파일에 저장
- 토큰을 공개 저장소에 노출
- 모든 브랜치에서 자동 프로덕션 빌드

## 🐛 트러블슈팅

### 문제: "Invalid token" 오류
**해결**:
1. Expo.dev에서 새 토큰 발급
2. GitHub Secrets의 `EXPO_TOKEN` 업데이트

### 문제: 빌드가 시작되지 않음
**해결**:
1. GitHub Actions 탭에서 워크플로우 로그 확인
2. Secrets가 올바르게 설정되었는지 확인
3. `npm ci` 단계에서 의존성 설치 오류 확인

### 문제: 빌드는 시작되지만 실패함
**해결**:
1. Expo.dev의 빌드 로그 확인
2. `app.json` 및 `eas.json` 설정 검토
3. 로컬에서 `eas build` 테스트

## 📚 추가 자료

- [Expo GitHub Actions 공식 문서](https://docs.expo.dev/build/building-on-ci/)
- [EAS Build 가이드](https://docs.expo.dev/build/introduction/)
- [GitHub Actions 문서](https://docs.github.com/en/actions)

## 🎉 완료!

이제 코드를 푸시하면 자동으로 빌드가 시작됩니다!

```bash
# main 브랜치에 푸시하면 iOS 빌드 자동 실행
git checkout main
git push origin main

# develop 브랜치에 푸시하면 Android 빌드 자동 실행
git checkout develop
git push origin develop
```

---

**작성일**: 2025-10-27
**마지막 업데이트**: 2025-10-27
