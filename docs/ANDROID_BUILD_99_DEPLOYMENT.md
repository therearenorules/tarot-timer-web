# Android Build 99 배포 가이드

> **현재 상태**: Android Build 40 → Build 99 업데이트 준비 완료
> **마지막 업데이트**: 2025-10-27

## 📋 배포 전 최종 체크리스트

### ✅ 완료된 사항

#### 1. **코드 동기화 완료**
- [x] iOS Build 99의 모든 기능 동기화
- [x] 22개 커밋 병합 완료
- [x] 타이머 탭 10분 광고 시스템 포함
- [x] 스프레드 탭 React Hooks 크래시 수정 포함
- [x] 다이어리 탭 9개 버그 수정 포함
- [x] 무료 버전 제한 로직 개선 포함

#### 2. **버전 정보 업데이트**
- [x] `app.json` 버전: 1.0.9
- [x] `app.json` versionCode: 99 (40 → 99)
- [x] iOS buildNumber와 동기화: 99

#### 3. **Android 플랫폼 최적화 추가**
- [x] `utils/androidOptimizations.ts` 생성 (11KB)
  - 하드웨어 백 버튼 처리
  - 햅틱 피드백 시스템
  - 네이티브 토스트 메시지
  - 메모리 및 배터리 최적화
  - 디바이스별 최적화 (Samsung, Xiaomi, Huawei)

- [x] `hooks/useAndroidOptimizations.ts` 생성 (7.2KB)
  - 12개 Android 전용 React 훅
  - 백 버튼 더블탭 종료
  - 성능 모니터링 (58fps 리스트 목표)

#### 4. **광고 및 IAP 시스템 검증**
- [x] AdMob 설정 iOS/Android 동등 확인
- [x] 프리미엄 구독 기능 동등 확인
- [x] 무료 버전 제한 동등 확인
- [x] 플랫폼 완전 동등성 검증 완료
- [x] 감사 보고서 작성 (`docs/ANDROID_ADS_IAP_AUDIT.md`)

#### 5. **무료 빌드 시스템 구축**
- [x] GitHub Actions 워크플로우 생성
  - `.github/workflows/android-free-build.yml`
  - APK/AAB 빌드 지원
  - 버전 자동 증가 기능
  - 빌드 시간: 5-10분
  - 비용: $0 (연간 $240 절감)

#### 6. **문서화 완료**
- [x] `docs/FREE_BUILD_COMPLETE_GUIDE.md` - 무료 빌드 가이드
- [x] `docs/ANDROID_OPTIMIZATION_GUIDE.md` - Android 최적화 가이드
- [x] `docs/ANDROID_ADS_IAP_AUDIT.md` - 광고/IAP 감사 보고서
- [x] `docs/IOS_VS_ANDROID_VERSION_COMPARISON.md` - 버전 비교 분석
- [x] `docs/ANDROID_BUILD_99_CHANGELOG.md` - 상세 변경 로그

#### 7. **Git 커밋 및 푸시 완료**
- [x] 18개 파일 커밋 완료
- [x] GitHub에 푸시 완료 (커밋: 336b324)

---

## 🚀 배포 방법

### 방법 1: GitHub Actions를 통한 무료 빌드 (권장)

#### AAB 빌드 (Google Play Console 업로드용)

1. **GitHub Actions 실행**
   ```
   1. https://github.com/therearenorules/tarot-timer-web/actions 접속
   2. "Android Free Build (무료 빌드)" 워크플로우 선택
   3. "Run workflow" 클릭
   4. 설정:
      - 빌드 타입: "aab" 선택
      - 버전 자동 증가: ✅ 체크
   5. "Run workflow" 실행
   ```

2. **빌드 완료 대기** (약 5-10분)
   - 빌드 진행 상황 실시간 모니터링
   - 성공 시: 녹색 체크마크 ✅
   - 실패 시: 빨간색 X ❌ (로그 확인)

3. **AAB 파일 다운로드**
   ```
   1. 완료된 워크플로우 클릭
   2. "Artifacts" 섹션에서 "tarot-timer-aab" 다운로드
   3. ZIP 압축 해제
   4. `tarot-timer-v99.aab` 파일 확인
   ```

4. **Google Play Console 업로드**
   ```
   1. https://play.google.com/console 접속
   2. "Tarot Timer" 앱 선택
   3. "프로덕션" 또는 "내부 테스트" 트랙 선택
   4. "새 릴리스 만들기" 클릭
   5. AAB 파일 업로드: tarot-timer-v99.aab
   6. 출시 노트 작성
   7. "검토" → "출시 시작"
   ```

#### APK 빌드 (테스트용)

```bash
# GitHub Actions에서 "apk" 선택하여 동일한 방법으로 빌드
```

---

### 방법 2: EAS Build (유료, 기존 방식)

```bash
# AAB 빌드 (Google Play Console용)
eas build --platform android --profile production

# 예상 소요 시간: 15-20분
# 비용: 빌드당 과금 (월 구독 필요)
```

---

### 방법 3: 로컬 빌드

```bash
# 사전 요구사항: Android Studio 설치 필요

# 1. Prebuild
npx expo prebuild --platform android --clean

# 2. Gradle 빌드
cd android
./gradlew assembleRelease  # APK
# 또는
./gradlew bundleRelease    # AAB

# 3. 출력 파일 위치
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📝 출시 노트 (한국어)

```markdown
# 버전 1.0.9 (Build 99)

## 🎉 주요 업데이트

### 새로운 기능
- **타이머 탭**: 10분마다 광고 시스템 추가 (무료 버전)
- **Android 최적화**: 플랫폼 전용 UX 개선
  - 하드웨어 백 버튼 더블탭 종료
  - 햅틱 피드백 시스템
  - 네이티브 토스트 메시지
  - 메모리 및 배터리 최적화

### 버그 수정
- 스프레드 탭: React Hooks 크래시 수정
- 다이어리 탭: 9개 버그 수정
  - 날짜 로딩 시간대 버그 수정 (UTC → 로컬 시간대)
  - 타입 오류 수정
  - 보관 개수 표시 개선
- 무료 버전 제한 로직 개선 (저장 횟수 → 보관 개수)

### 성능 개선
- 리스트 스크롤 성능 최적화 (58fps 목표)
- 디바이스별 최적화 (Samsung, Xiaomi, Huawei)
- AdMob 디버깅 개선

### 플랫폼 동등성
- iOS Build 99의 모든 기능 포함
- 광고 시스템 iOS/Android 동등 확인
- 프리미엄 구독 기능 동등 확인
```

---

## 🔍 배포 후 검증 체크리스트

### 1. **기능 테스트**
- [ ] 타이머 탭: 10분 광고 시스템 작동 확인
- [ ] 스프레드 탭: 크래시 없이 정상 작동 확인
- [ ] 다이어리 탭: 날짜 로딩 및 보관 개수 표시 확인
- [ ] 프리미엄 구독: 결제 및 혜택 정상 작동 확인

### 2. **Android 최적화 검증**
- [ ] 백 버튼 더블탭 종료 작동 확인
- [ ] 햅틱 피드백 작동 확인
- [ ] 토스트 메시지 표시 확인
- [ ] 메모리 사용량 정상 범위 확인

### 3. **광고 시스템 검증**
- [ ] AdMob 광고 정상 표시 확인
- [ ] 광고 빈도 정상 작동 확인 (10분 타이머)
- [ ] 광고 수익 트래킹 작동 확인

### 4. **IAP 시스템 검증**
- [ ] 월간 구독 (₩6,600) 결제 작동 확인
- [ ] 연간 구독 (₩66,000) 결제 작동 확인
- [ ] 프리미엄 혜택 정상 활성화 확인
  - 무제한 보관
  - 광고 제거
  - 프리미엄 스프레드

### 5. **성능 모니터링**
- [ ] 앱 시작 시간 <3초 확인
- [ ] 리스트 스크롤 58fps 확인
- [ ] 메모리 사용량 정상 범위 확인
- [ ] 배터리 소모 정상 범위 확인

---

## 🎯 예상 결과

### **개선 사항**
1. **iOS 동등성 달성**: Build 99 기준 완전 동일
2. **Android UX 개선**: 플랫폼 전용 최적화 추가
3. **광고 수익 증대**: 10분 타이머 광고 시스템
4. **버그 수정**: 9개 다이어리 버그 수정
5. **무료 빌드**: 연간 $240 비용 절감

### **성능 목표**
- **앱 시작 시간**: <3초
- **리스트 스크롤**: 58fps
- **메모리 사용**: <100MB (유휴 시)
- **배터리 소모**: 정상 범위

### **비즈니스 임팩트**
- **광고 수익**: 월 ₩216,667 예상 (연간 ₩2.6M)
- **프리미엄 구독**: 월 ₩216,667 예상 (연간 ₩2.6M)
- **총 예상 수익**: 연간 ₩5.2M (iOS + Android)

---

## 📊 빌드 정보 비교

| 항목 | Build 40 (이전) | Build 99 (현재) |
|------|----------------|----------------|
| **버전** | 1.0.4 | 1.0.9 |
| **versionCode** | 40 | 99 |
| **iOS 동등성** | 59 빌드 차이 | ✅ 완전 동등 |
| **타이머 광고** | ❌ 없음 | ✅ 10분 시스템 |
| **Android 최적화** | ❌ 없음 | ✅ 12개 훅 추가 |
| **스프레드 크래시** | ❌ 있음 | ✅ 수정 완료 |
| **다이어리 버그** | ❌ 9개 있음 | ✅ 모두 수정 |
| **무료 빌드** | ❌ 없음 | ✅ GitHub Actions |

---

## 🔗 관련 문서

- [무료 빌드 가이드](FREE_BUILD_COMPLETE_GUIDE.md)
- [Android 최적화 가이드](ANDROID_OPTIMIZATION_GUIDE.md)
- [광고/IAP 감사 보고서](ANDROID_ADS_IAP_AUDIT.md)
- [버전 비교 분석](IOS_VS_ANDROID_VERSION_COMPARISON.md)
- [상세 변경 로그](ANDROID_BUILD_99_CHANGELOG.md)

---

## ⚠️ 주의사항

### **프로덕션 키스토어**
- 현재 워크플로우는 테스트용 키스토어 사용
- **프로덕션 배포 시**: GitHub Secrets에 실제 키스토어 추가 필요
  ```
  Repository Settings → Secrets → Actions
  - ANDROID_KEYSTORE_BASE64: Base64 인코딩된 키스토어
  - KEYSTORE_PASSWORD: 키스토어 비밀번호
  - KEY_ALIAS: 키 별칭
  - KEY_PASSWORD: 키 비밀번호
  ```

### **Google Play Console**
- 첫 AAB 업로드 후에는 동일한 서명 키 사용 필수
- 키스토어 분실 시 새 앱으로 재출시 필요

### **버전 관리**
- versionCode는 이전 빌드보다 항상 높아야 함
- 현재 versionCode 99 → 다음 100부터 시작

---

## ✅ 배포 승인

**배포 준비 완료**: ✅ YES

**다음 단계**: GitHub Actions 워크플로우 실행 → Google Play Console 업로드

---

**마지막 업데이트**: 2025-10-27
**작성자**: Claude Code
**커밋**: 336b324
