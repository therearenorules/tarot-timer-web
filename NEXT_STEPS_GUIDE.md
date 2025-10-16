# 🚀 다음 단계 진행 가이드
## Google Play Console 준비 완료 후 작업 절차

**작성일**: 2025-10-15
**현재 상태**: Phase 2 완료, Google Play Console 계정 준비 완료
**EAS 계정**: threebooks (로그인 완료)

---

## 📊 현재 상황 요약

### ✅ 완료된 사항
- [x] Phase 1: 반응형 개선 완료
- [x] Phase 2: 법률 문서 작성 완료
- [x] Google Play Console 계정 생성 및 인증 완료
- [x] EAS 로그인 완료 (threebooks)

### 🔄 진행 중인 사항
- [ ] Phase 3: Android 첫 빌드 생성
- [ ] Phase 5: Google Play Console 앱 등록 및 설정

---

## 🎯 즉시 진행 가능한 작업

### 작업 A: Android 빌드 생성 (Claude가 실행 가능)

**명령어**:
```bash
npx eas build --platform android --profile production-android
```

**프로세스**:
1. ✅ Keystore 자동 생성 (EAS가 처리)
2. ✅ 빌드 시작 (30-60분 소요)
3. ✅ AAB 파일 생성
4. ✅ 다운로드 URL 제공

**Claude 실행 가능 여부**: ✅ **가능**
- EAS CLI를 통해 빌드를 시작할 수 있습니다
- 빌드는 EAS 서버에서 자동으로 진행됩니다
- 완료되면 다운로드 링크를 제공합니다

---

### 작업 B: Google Play Console 설정 (사용자 직접 작업 필요)

**Claude 실행 가능 여부**: ❌ **불가능**
- Google Play Console은 웹 브라우저 기반 GUI입니다
- 로그인 인증이 필요합니다
- 수동으로 클릭 및 입력 작업이 필요합니다

**사용자가 직접 해야 할 작업**:

#### Step 1: Google Play Console에서 앱 생성
1. https://play.google.com/console 접속
2. "앱 만들기" 클릭
3. 기본 정보 입력:
   - **앱 이름**: "Tarot Timer - Learn Card Meanings"
   - **기본 언어**: 한국어
   - **앱/게임**: 앱 선택
   - **무료/유료**: 무료 (인앱 결제 포함)

#### Step 2: 앱 액세스 권한 설정
1. "앱 콘텐츠" → "앱 액세스 권한"
2. "모든 기능을 무료로 사용할 수 있음" 선택
3. "저장" 클릭

#### Step 3: 광고 정책 설정
1. "앱 콘텐츠" → "광고"
2. "아니요, 앱에 광고가 포함되어 있지 않습니다" 선택
   (프리미엄 사용자는 광고 없음이므로)
3. "저장" 클릭

#### Step 4: 타겟 연령 및 콘텐츠 등급
1. "앱 콘텐츠" → "타겟 연령 및 콘텐츠"
2. **타겟 연령**: 13세 이상 선택
3. **콘텐츠 등급 설문**: 설문 작성
   - 폭력성: 없음
   - 성적 콘텐츠: 없음
   - 약물/알코올: 없음
4. "저장" 클릭

#### Step 5: 개인정보 처리방침
1. "앱 콘텐츠" → "개인정보 처리방침"
2. **개인정보 처리방침 URL** 입력:
   ```
   https://raw.githubusercontent.com/therearenorules/tarot-timer-web/main/PRIVACY_POLICY.md
   ```
   또는 별도 웹사이트 URL
3. "저장" 클릭

#### Step 6: 데이터 보안
1. "앱 콘텐츠" → "데이터 보안"
2. **데이터 수집 및 보안** 설문 작성:
   - 사용자 데이터 수집: 예
   - 수집 데이터: 디바이스 ID, 알림 토큰
   - 데이터 암호화: 예
   - 데이터 삭제 요청: 가능
3. "저장" 클릭

---

## 🔧 Claude가 도울 수 있는 작업

### ✅ 가능한 작업

1. **Android 빌드 생성**
   ```bash
   npx eas build --platform android --profile production-android
   ```
   - Keystore 자동 생성
   - AAB 파일 생성
   - 빌드 ID 및 다운로드 URL 제공

2. **빌드 상태 확인**
   ```bash
   npx eas build:list --platform android
   npx eas build:view [BUILD_ID]
   ```

3. **AAB 파일 다운로드**
   ```bash
   npx eas build:download [BUILD_ID]
   ```

4. **스토어 리스팅 텍스트 작성**
   - 앱 설명 (한/영/일)
   - 짧은 설명
   - 업데이트 내용

5. **스크린샷 가이드 제공**
   - 필요한 스크린샷 사양
   - 촬영 가이드

6. **버전 관리**
   - app.json 버전 업데이트
   - buildNumber / versionCode 관리

### ❌ 불가능한 작업

1. **Google Play Console 웹 작업**
   - 브라우저 로그인 불가
   - GUI 클릭/입력 작업 불가
   - AAB 파일 수동 업로드 불가

2. **실기기 테스트**
   - Android 기기 접근 불가
   - 실제 설치 및 테스트 불가

3. **결제 정보 입력**
   - 신용카드 정보 입력 불가
   - 본인 인증 불가

---

## 📋 권장 진행 순서

### Step 1: Claude가 Android 빌드 생성 (지금 바로 가능)

**실행 여부를 알려주시면 바로 진행하겠습니다**:
```bash
npx eas build --platform android --profile production-android
```

**예상 소요 시간**: 30-60분

---

### Step 2: 사용자가 Google Play Console 앱 등록 (병렬 진행 가능)

빌드가 진행되는 동안 Google Play Console에서 앱을 생성하고 기본 설정을 완료하세요.

**소요 시간**: 30-60분

---

### Step 3: Claude가 스토어 리스팅 텍스트 제공

Google Play Console에 입력할 텍스트를 작성해드립니다:
- 앱 설명 (한국어, 영어, 일본어)
- 짧은 설명
- 주요 기능 소개
- 업데이트 내용

---

### Step 4: 사용자가 AAB 업로드 및 스크린샷 등록

1. Claude가 제공한 AAB 다운로드 링크에서 파일 다운로드
2. Google Play Console → "프로덕션" → "새 버전 만들기"
3. AAB 파일 업로드
4. 스크린샷 업로드 (2장 이상)
5. 스토어 리스팅 텍스트 입력 (Claude 제공)

---

### Step 5: 내부 테스트 또는 프로덕션 배포

- **옵션 A**: 내부 테스트 (권장)
  - 테스트 이메일 추가
  - 실기기 테스트
  - 버그 수정 후 프로덕션 배포

- **옵션 B**: 프로덕션 직접 배포
  - 심사 제출
  - 1-7일 대기
  - 승인 후 출시

---

## 🎯 지금 바로 진행할 작업

### 질문 1: Android 빌드를 지금 바로 시작할까요?

**Yes 선택 시**:
- Claude가 즉시 빌드를 시작합니다
- 30-60분 후 AAB 파일 다운로드 가능
- 빌드 진행 상황을 실시간으로 알려드립니다

**No 선택 시**:
- 나중에 사용자가 직접 실행:
  ```bash
  npx eas build --platform android --profile production-android
  ```

---

### 질문 2: 스토어 리스팅 텍스트가 필요하신가요?

**Yes 선택 시**:
- Claude가 Google Play Console에 입력할 텍스트를 작성합니다
- 한국어, 영어, 일본어 3개 언어 제공
- 앱 설명, 짧은 설명, 주요 기능 포함

---

### 질문 3: 스크린샷 가이드가 필요하신가요?

**Yes 선택 시**:
- 필요한 스크린샷 사양 안내
- 촬영 가이드 제공
- 예시 화면 추천

---

## 📊 예상 타임라인

| 작업 | 담당 | 소요 시간 | 상태 |
|------|------|----------|------|
| Android 빌드 생성 | Claude | 30-60분 | ⏸️ 대기 |
| Google Play Console 앱 생성 | 사용자 | 30-60분 | ⏸️ 대기 |
| 스토어 리스팅 텍스트 작성 | Claude | 10분 | ⏸️ 대기 |
| AAB 업로드 & 스크린샷 | 사용자 | 30분 | ⏸️ 대기 |
| 내부 테스트 | 사용자 | 1-2일 | ⏸️ 대기 |
| 프로덕션 배포 & 심사 | Google | 1-7일 | ⏸️ 대기 |

**전체 예상 소요**: 3-10일

---

## 💡 추가 정보

### Google Play Console 필수 항목

1. **개인정보 처리방침 URL** (필수)
   - GitHub Raw URL 또는 별도 웹사이트
   - 권장: GitHub Pages 또는 Notion

2. **앱 아이콘** (필수)
   - 512x512 PNG
   - 현재 사용 중: `./assets/icon.png`

3. **스크린샷** (최소 2장)
   - 휴대전화: 1080x1920 이상
   - 7인치 태블릿: 1024x1600 이상 (선택사항)
   - 10인치 태블릿: 1280x800 이상 (선택사항)

4. **그래픽 이미지** (선택사항)
   - 프로모션 그래픽: 1024x500
   - 기능 그래픽: 1024x500

---

## 📞 다음 단계 확인

**사용자님께서 알려주시면 바로 진행하겠습니다**:

1. ✅ Android 빌드를 지금 바로 시작할까요? (Yes/No)
2. ✅ 스토어 리스팅 텍스트를 작성해드릴까요? (Yes/No)
3. ✅ 스크린샷 가이드를 제공해드릴까요? (Yes/No)
4. ✅ 개인정보 처리방침 URL을 어디에 호스팅하시겠습니까?
   - GitHub Raw URL
   - 별도 웹사이트
   - GitHub Pages
   - Notion 등

---

**마지막 업데이트**: 2025-10-15
**EAS 계정**: threebooks (로그인 완료)
**Google Play Console**: 계정 준비 완료
**다음 작업**: 사용자 답변 대기 중
