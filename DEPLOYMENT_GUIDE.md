# 타로 타이머 앱스토어 배포 가이드

## 📱 개요

이 가이드는 타로 타이머 앱을 iOS App Store와 Google Play Store에 배포하는 전체 과정을 다룹니다.

## 🛠️ 사전 준비사항

### 필수 계정 및 도구
- [x] **Apple Developer Account** ($99/년)
- [x] **Google Play Console Account** ($25 일회성)
- [x] **Expo Account** (무료)
- [x] **EAS CLI** 설치: `npm install -g eas-cli`

### 필수 자산
- [x] **앱 아이콘** (1024x1024px PNG)
- [x] **스플래시 스크린** (다양한 해상도)
- [x] **스크린샷** (각 플랫폼용)
- [x] **앱 설명** (한국어/영어)
- [x] **개인정보처리방침** (웹사이트 링크 필요)

## 🏗️ 빌드 프로세스

### 1단계: 환경 설정

```bash
# EAS CLI 로그인
eas login

# 프로젝트 설정 확인
eas build:configure

# 프로덕션 환경 변수 설정
cp .env.production .env
```

### 2단계: iOS 빌드

```bash
# iOS 프로덕션 빌드
eas build --platform ios --profile production-ios

# 빌드 상태 확인
eas build:list

# 완료된 빌드 다운로드 (선택사항)
eas build:download [BUILD_ID]
```

**iOS 빌드 설정 확인사항:**
- Bundle Identifier: `com.tarottimer.app`
- Version: `1.0.0`
- Build Number: 자동 증가
- Deployment Target: iOS 13.0+

### 3단계: Android 빌드

```bash
# Android 프로덕션 빌드
eas build --platform android --profile production-android

# 빌드 상태 확인
eas build:list
```

**Android 빌드 설정 확인사항:**
- Application ID: `com.tarottimer.app`
- Version Code: 자동 증가
- Version Name: `1.0.0`
- Target SDK: 34
- Min SDK: 21

### 4단계: 동시 빌드 (권장)

```bash
# iOS와 Android 동시 빌드
eas build --platform all --profile production
```

## 📲 앱스토어 제출

### iOS App Store 제출

#### 자동 제출 (권장)
```bash
# EAS Submit 사용 (자동화)
eas submit --platform ios

# 또는 특정 빌드 제출
eas submit --platform ios --id [BUILD_ID]
```

#### 수동 제출
1. **App Store Connect** 로그인
2. **새 앱 생성**
   - 앱 이름: `타로 타이머`
   - Bundle ID: `com.tarottimer.app`
   - SKU: `tarot-timer-ios`
   - 언어: 한국어 (기본)

3. **앱 정보 입력**
   - 카테고리: Entertainment
   - 콘텐츠 등급: 4+ (모든 연령)
   - 개인정보처리방침 URL: `https://tarottimer.app/privacy`

4. **빌드 업로드**
   - EAS에서 생성된 `.ipa` 파일 사용
   - TestFlight를 통한 베타 테스트 권장

5. **메타데이터 입력**
   - 앱 설명 (한국어/영어)
   - 키워드: 타로, 타이머, 공부, 학습, 카드
   - 스크린샷 (5개 이상)

### Google Play Store 제출

#### 자동 제출 (권장)
```bash
# Google Play Console 서비스 계정 키 설정 후
eas submit --platform android
```

#### 수동 제출
1. **Google Play Console** 로그인
2. **새 앱 생성**
   - 앱 이름: `타로 타이머`
   - 패키지명: `com.tarottimer.app`
   - 언어: 한국어

3. **앱 콘텐츠**
   - 콘텐츠 등급: 전체 이용가
   - 타겟 고객층: 전체
   - 카테고리: Entertainment

4. **릴리스 준비**
   - 프로덕션 트랙에 `.aab` 파일 업로드
   - 릴리스 노트 작성

## 🔐 보안 및 인증 설정

### iOS 인증서 관리
```bash
# iOS 인증서 자동 생성 (권장)
eas credentials

# 수동 인증서 업로드
eas credentials --platform ios
```

### Android 키스토어 관리
```bash
# Android 키스토어 자동 생성 (권장)
eas credentials --platform android

# 기존 키스토어 사용 시
eas credentials --platform android --local
```

## 📊 배포 후 체크리스트

### 필수 확인사항
- [ ] **앱 다운로드 및 설치 테스트**
- [ ] **주요 기능 동작 확인**
  - [ ] 24시간 타이머
  - [ ] 타로 카드 선택
  - [ ] 일기 작성 및 저장
  - [ ] 다국어 전환
  - [ ] 설정 기능
- [ ] **UI/UX 반응성 테스트**
- [ ] **오류 로그 모니터링 설정**
- [ ] **사용자 피드백 수집 체계 구축**

### 성능 모니터링
```bash
# 앱 성능 분석 (Expo Analytics 활용)
# utils/adminSupabase.ts의 수집 함수들이 자동으로 데이터 수집

# 관리자 대시보드에서 확인 가능:
# - 사용자 활동 통계
# - 오류 로그 모니터링
# - 피드백 수집 현황
```

## 🚀 업데이트 배포

### OTA(Over-The-Air) 업데이트
```bash
# 코드 변경사항만 있는 경우 (빠른 업데이트)
eas update --channel production

# 특정 메시지와 함께 업데이트
eas update --channel production --message "버그 수정 및 성능 개선"
```

### 새 버전 배포
```bash
# app.json에서 버전 업데이트 후
eas build --platform all --profile production
eas submit --platform all
```

## 🆘 문제 해결

### 일반적인 빌드 오류
1. **인증서 문제**
   ```bash
   eas credentials --clear-cache
   eas credentials
   ```

2. **네이티브 의존성 충돌**
   ```bash
   expo install --fix
   npx expo-doctor
   ```

3. **용량 초과**
   - 이미지 최적화
   - 번들 분석: `eas build --platform ios --profile production --local`

### 제출 거부 대응
1. **App Store 거부 사유**
   - 개인정보처리방침 누락 → 웹사이트에 정책 게시
   - 메타데이터 불일치 → 앱 설명과 실제 기능 일치 확인
   - 콘텐츠 가이드라인 위반 → 타로 학습 도구임을 명확히 표시

2. **Google Play 거부 사유**
   - 타겟 API 레벨 → 최신 Android API로 업데이트
   - 권한 설명 누락 → 필요한 권한에 대한 설명 추가

## 📝 배포 체크리스트

### 배포 전
- [ ] 모든 기능 테스트 완료
- [ ] 프로덕션 환경 변수 설정
- [ ] 앱 아이콘 및 스플래시 최종 확인
- [ ] 개인정보처리방침 웹사이트 게시
- [ ] 앱 메타데이터 검토

### 배포 중
- [ ] iOS 빌드 성공
- [ ] Android 빌드 성공
- [ ] App Store Connect 업로드 완료
- [ ] Google Play Console 업로드 완료

### 배포 후
- [ ] 앱스토어 승인 대기
- [ ] 베타 테스터 피드백 수집
- [ ] 성능 모니터링 활성화
- [ ] 사용자 지원 체계 구축

## 📞 지원 및 연락처

**기술 지원:**
- Expo Documentation: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/

**앱스토어 정책:**
- Apple App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policy: https://developer.android.com/distribute/google-play/policies

**프로젝트 관련:**
- 관리자 대시보드: 앱 내 설정 → 앱 정보 (7회 탭)
- 피드백: 앱 내 피드백 기능 활용
- 긴급 이슈: adminSupabase.ts의 오류 수집 시스템 활용

---

**마지막 업데이트:** 2025-09-17
**버전:** 1.0.0
**상태:** 배포 준비 완료 ✅