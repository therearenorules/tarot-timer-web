# GitHub Actions 수동 실행 가이드

> **Android Build 99 AAB 빌드 실행 방법**

## 🚀 빠른 실행 (5단계)

### 1단계: GitHub Actions 페이지 접속
```
https://github.com/therearenorules/tarot-timer-web/actions
```

### 2단계: 워크플로우 선택
- 왼쪽 사이드바에서 **"Android Free Build (무료 빌드)"** 클릭

### 3단계: 워크플로우 실행
- 오른쪽 상단 **"Run workflow"** 버튼 클릭
- 드롭다운 메뉴가 나타남

### 4단계: 빌드 옵션 설정
```
Branch: main (기본값)
빌드 타입: aab ✅ (선택)
버전 자동 증가: ✅ (체크됨, 기본값)
```

### 5단계: 빌드 시작
- 녹색 **"Run workflow"** 버튼 클릭
- 빌드 시작됨 (약 5-10분 소요)

---

## 📊 빌드 진행 상황 모니터링

### 빌드 시작 확인
1. Actions 페이지 상단에 새 워크플로우 실행 표시
2. 노란색 점 🟡 = 진행 중
3. 클릭하여 상세 로그 확인 가능

### 빌드 단계
```
✅ Checkout code (1분)
✅ Setup Node.js (1분)
✅ Setup Java 17 (1분)
✅ Install dependencies (2분)
✅ Version Bump (10초)
✅ Expo Prebuild (2분)
✅ Setup Keystore (30초)
✅ Configure Gradle (10초)
✅ Build AAB (3-4분) ⏳ 가장 시간 소요
✅ Rename Build Files (5초)
✅ Upload AAB (30초)
✅ Build Summary (5초)
✅ Commit Version Bump (10초)
```

**총 예상 시간**: 5-10분

---

## 📥 AAB 파일 다운로드

### 빌드 완료 후
1. 녹색 체크마크 ✅ 표시 확인
2. 완료된 워크플로우 클릭
3. 하단 **"Artifacts"** 섹션 확인
4. **"tarot-timer-aab"** 클릭하여 다운로드
5. ZIP 파일 압축 해제
6. `tarot-timer-v100.aab` 파일 확인

### 파일 정보
- **파일명**: `tarot-timer-v100.aab`
- **versionCode**: 100 (자동 증가: 99 → 100)
- **버전**: 1.0.9
- **크기**: 약 40-50MB

---

## 🎯 Google Play Console 업로드

### 1단계: Google Play Console 접속
```
https://play.google.com/console
```

### 2단계: 앱 선택
- **"Tarot Timer"** 앱 선택
- 왼쪽 메뉴에서 **"출시" → "프로덕션"** 선택

### 3단계: 새 릴리스 만들기
- **"새 릴리스 만들기"** 버튼 클릭
- AAB 파일 업로드: `tarot-timer-v100.aab`
- 자동으로 파일 분석 시작 (1-2분)

### 4단계: 출시 노트 작성
```markdown
# 버전 1.0.9 (Build 100)

## 주요 업데이트
- 타이머 탭: 10분마다 광고 시스템 추가
- Android 최적화: 백 버튼, 햅틱 피드백, 토스트 메시지
- 스프레드 탭: React Hooks 크래시 수정
- 다이어리 탭: 9개 버그 수정
- 성능 개선: 리스트 스크롤 최적화
```

### 5단계: 검토 및 출시
- **"검토"** 버튼 클릭
- 모든 정보 확인
- **"출시 시작"** 버튼 클릭

### 출시 시간
- **검토 시간**: 1-3일 (Google 자동 검토)
- **출시 완료**: 검토 승인 후 몇 시간 내

---

## ⚠️ 주의사항

### 버전 관리
- 이번 빌드로 versionCode가 **99 → 100**으로 자동 증가됨
- 다음 빌드는 versionCode **101**부터 시작
- **중요**: Google Play는 versionCode를 절대 감소시킬 수 없음

### 키스토어
- 현재 워크플로우는 **테스트용 키스토어** 사용 중
- **프로덕션 배포 시**: 실제 키스토어 설정 필요
- 키스토어 변경 방법: [FREE_BUILD_COMPLETE_GUIDE.md](FREE_BUILD_COMPLETE_GUIDE.md) 참조

### 첫 배포 vs 업데이트
- **첫 배포**: 새 앱으로 등록 → 전체 검토 과정 (3-7일)
- **업데이트**: 기존 앱 업데이트 → 빠른 검토 (1-3일)

---

## 🔍 문제 해결

### 빌드 실패 시
1. **빌드 로그 확인**
   - 실패한 워크플로우 클릭
   - 빨간색 X ❌ 단계 확인
   - 로그에서 에러 메시지 확인

2. **일반적인 문제**
   - **Gradle 빌드 실패**: `android/` 폴더 확인
   - **의존성 설치 실패**: `package.json` 확인
   - **Prebuild 실패**: Expo 설정 확인

3. **재시도**
   - 워크플로우 다시 실행 (Run workflow)
   - 동일한 설정으로 재시도

### AAB 업로드 실패 시
1. **파일 손상 확인**
   - ZIP 파일 정상 압축 해제 확인
   - AAB 파일 크기 확인 (40-50MB)

2. **버전 충돌**
   - Google Play Console에서 기존 versionCode 확인
   - 새 빌드는 반드시 더 높은 versionCode 필요

3. **서명 오류**
   - 키스토어 설정 확인
   - 첫 배포 시와 동일한 서명 키 사용 필수

---

## 📊 빌드 히스토리

### 현재 상태
- **마지막 빌드**: Build 40 (2025-10-20)
- **다음 빌드**: Build 100 (예정)
- **버전**: 1.0.9

### 빌드 로그 확인
```bash
# 로컬에서 최근 빌드 확인
eas build:list --platform android --limit 5
```

---

## 🎉 성공 확인

### 빌드 성공 시
- ✅ 녹색 체크마크 표시
- ✅ Artifacts에서 AAB 파일 다운로드 가능
- ✅ Build Summary에서 빌드 정보 확인
- ✅ Git에 버전 증가 커밋 자동 생성

### 배포 성공 시
- ✅ Google Play Console에서 "검토 중" 상태 확인
- ✅ 1-3일 후 "출시됨" 상태로 변경
- ✅ Play Store에서 앱 업데이트 확인 가능

---

## 🔗 관련 문서

- [무료 빌드 완전 가이드](FREE_BUILD_COMPLETE_GUIDE.md)
- [Android Build 99 배포 가이드](ANDROID_BUILD_99_DEPLOYMENT.md)
- [GitHub Actions 설정 가이드](GITHUB_ACTIONS_SETUP.md)

---

## 💡 팁

### 빠른 배포
1. **내부 테스트 트랙 사용**
   - 프로덕션 대신 "내부 테스트" 트랙 선택
   - 검토 시간 단축 (몇 시간 내)
   - 소수 테스터로 빠른 검증

2. **자동화**
   - GitHub Actions 워크플로우 일정 실행 설정 가능
   - 매주/매달 자동 빌드 가능

3. **비용 절감**
   - 무료 빌드: $0
   - EAS Build: 월 $99-$299
   - **연간 절감**: $240+

---

**작성일**: 2025-10-27
**작성자**: Claude Code
