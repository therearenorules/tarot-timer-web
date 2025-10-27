# GitHub Actions 빠른 시작 가이드

## 🚀 5분 안에 설정 완료하기

### 1️⃣ Expo Token 발급 (2분)
```bash
# 터미널에서 확인
eas whoami
```

1. https://expo.dev/accounts/settings/access-tokens 접속
2. "Create Token" 클릭
3. 이름: `github-actions`
4. 토큰 복사 (다시 볼 수 없습니다!)

### 2️⃣ GitHub Secrets 등록 (2분)

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 2개 등록:

```
Name: EXPO_TOKEN
Value: [1단계에서 복사한 토큰]
```

```
Name: EXPO_ACCOUNT_NAME
Value: [eas whoami 결과 또는 expo.dev URL의 계정명]
```

### 3️⃣ 워크플로우 파일 푸시 (1분)

```bash
git add .github/workflows/
git commit -m "feat: GitHub Actions EAS 빌드 자동화 추가"
git push origin main
```

## ✅ 완료! 이제 사용 가능합니다.

### 자동 빌드
- `main` 브랜치 푸시 → iOS 빌드 자동 실행
- `develop` 브랜치 푸시 → Android 빌드 자동 실행

### 수동 빌드
1. GitHub → Actions → "EAS Build"
2. Run workflow 클릭
3. 플랫폼/프로필 선택 → Run

### 프로덕션 빌드
1. GitHub → Actions → "EAS Production Build & Submit"
2. Run workflow 클릭
3. 플랫폼 선택 + 자동제출 여부 → Run

## 📝 상세 가이드
더 자세한 내용은 [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) 참고
