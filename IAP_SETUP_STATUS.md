# IAP 설정 현황 확인 보고서

**확인일**: 2025-10-31
**프로젝트**: Tarot Timer v1.1.1

---

## ✅ 1. App Store Connect 구독 상품 설정

**확인 방법**: 스크린샷 "애플 구독 페이지.png" 확인

**구독 상품 등록 상태**:
```
✅ Monthly Premium (tarot_timer_monthly)
   - 기간: 1개월
   - 상태: 승인됨 ✓
   - 제품 ID: tarot_timer_monthly

✅ Yearly Premium (tarot_timer_yearly)
   - 기간: 1년
   - 상태: 승인됨 ✓
   - 제품 ID: tarot_timer_yearly
```

**현지화 정보**:
```
✅ 영어(미국): Tarot Timer Premium
✅ 한국어: 타로 타이머 프리미엄
```

**구독 그룹 ID**: 21809126

**결론**: ✅ **구독 상품 설정 완료** - TestFlight 테스트 가능 상태

---

## ✅ 2. APPLE_SHARED_SECRET 설정 상태

### A. EAS Secrets 등록 확인

**확인 명령어**:
```bash
eas secret:list
```

**등록 상태**:
```
✅ APPLE_SHARED_SECRET
   ID:          081990f6-5da5-487c-8f05-e22952233e91
   Name:        APPLE_SHARED_SECRET
   Scope:       project
   Type:        STRING
   Updated at:  Oct 22 12:33:45
```

**실제 값** (2025-10-22 등록):
```
1b9e9b48c45946ea8e425b74dc48cdf6
```

**출처**: `docs/2025-10-22-WORK-REPORT.md` 라인 220

---

### B. app.json 설정 확인

**파일 위치**: `app.json`
**설정 내용** (라인 13):
```json
{
  "extra": {
    "EXPO_PUBLIC_API_URL": "https://api.tarottimer.app",
    "APPLE_SHARED_SECRET": "${APPLE_SHARED_SECRET}",  // ✅ 설정됨
    "supabaseUrl": "${SUPABASE_URL}",
    "supabaseAnonKey": "${SUPABASE_ANON_KEY}"
  }
}
```

**결론**: ✅ **환경 변수 참조 올바름**

---

### C. 코드 내 사용 확인

**파일**: `utils/receiptValidator.ts`
**사용 위치** (라인 51):
```typescript
const sharedSecret =
    process.env.APPLE_SHARED_SECRET ||                 // EAS Build (EAS Secret)
    Constants.expoConfig?.extra?.APPLE_SHARED_SECRET || // Runtime
    '';
```

**결론**: ✅ **코드에서 정상적으로 읽어옴**

---

### D. 과거 설정 이력

**2025-10-22 작업 내용** (`docs/2025-10-22-WORK-REPORT.md`):

1. **EAS Secret 등록**:
   ```bash
   eas secret:create --scope project \
     --name APPLE_SHARED_SECRET \
     --value "1b9e9b48c45946ea8e425b74dc48cdf6"
   ```

2. **app.json 환경 변수 추가**:
   ```json
   "APPLE_SHARED_SECRET": "${APPLE_SHARED_SECRET}"
   ```

3. **receiptValidator.ts 코드 수정**:
   - 환경 변수 읽기 로직 추가
   - 더미 값 제거
   - 실제 APPLE_SHARED_SECRET 사용

**결론**: ✅ **2025-10-22에 모든 설정 완료됨**

---

## ✅ 3. APPLE_SHARED_SECRET 발급 방법 (참고)

### App Store Connect에서 발급받는 방법

**경로**:
```
App Store Connect
→ 앱 선택 (Tarot Timer)
→ 기능 탭
→ App 내 구입 항목
→ 구독 그룹 관리
→ "앱별 공유 암호" 섹션
→ "생성" 또는 "보기" 클릭
```

**현재 발급된 값**:
```
1b9e9b48c45946ea8e425b74dc48cdf6
```

**용도**:
- iOS 영수증 검증 시 사용
- App Store Server API 호출 시 필요
- 구독 갱신 상태 확인 시 필요

---

## ✅ 4. Sandbox Tester 계정 확인

**확인 필요 사항**:
```
[ ] App Store Connect → 사용자 및 액세스 → Sandbox Testers
[ ] 테스트 계정 생성 여부
[ ] 국가: 대한민국 (KR)
[ ] 이메일: [테스트용 이메일]
```

**Sandbox Tester 사용 방법**:
1. iOS 기기 설정 → App Store
2. Sandbox 계정 섹션
3. 생성한 Sandbox Tester 계정으로 로그인
4. TestFlight에서 앱 다운로드
5. 구독 구매 테스트 진행

**참고**:
- Sandbox 환경에서는 실제 결제 안 됨
- 테스트 용도로만 사용
- 구독 기간이 빠르게 진행됨 (1개월 → 5분)

---

## 📊 종합 현황

| 항목 | 상태 | 확인 내용 |
|------|------|-----------|
| **구독 상품 등록** | ✅ 완료 | Monthly, Yearly 모두 승인됨 |
| **APPLE_SHARED_SECRET 발급** | ✅ 완료 | 2025-10-22 발급받음 |
| **EAS Secrets 등록** | ✅ 완료 | project scope으로 등록됨 |
| **app.json 설정** | ✅ 완료 | 환경 변수 참조 올바름 |
| **코드 적용** | ✅ 완료 | receiptValidator.ts에서 사용 중 |
| **Sandbox Tester** | ❓ 확인 필요 | 생성 여부 사용자 확인 필요 |

---

## ✅ 빌드 준비 상태

### 필수 설정 완료 여부

**코드 수정**:
- [x] iapManager.ts 수정 완료
- [x] PremiumSubscription.tsx 수정 완료
- [x] TypeScript 컴파일 오류 없음

**App Store Connect**:
- [x] 구독 상품 2개 등록 완료
- [x] 상품 상태 "승인됨" 확인
- [x] APPLE_SHARED_SECRET 발급 완료

**환경 변수**:
- [x] EAS Secrets에 APPLE_SHARED_SECRET 등록 완료
- [x] app.json에 환경 변수 참조 추가 완료
- [x] 코드에서 환경 변수 사용 완료

**Sandbox Tester**:
- [ ] 생성 여부 확인 필요 (사용자 확인 요청)

**Git**:
- [ ] 변경사항 커밋 필요
- [ ] GitHub 푸시 필요

**버전 관리**:
- [ ] 버전 번호 결정 필요 (1.1.1 유지 vs 1.2.0 업데이트)

---

## 🚀 다음 단계

### 1. Sandbox Tester 확인 (선택사항)

**확인 방법**:
```
App Store Connect 로그인
→ 사용자 및 액세스
→ Sandbox 탭
→ 생성된 계정 확인
```

**생성 방법** (없는 경우):
```
1. "+" 버튼 클릭
2. 이메일 주소 입력 (예: test@example.com)
3. 비밀번호 설정
4. 국가: 대한민국
5. 저장
```

---

### 2. 버전 번호 결정

**옵션 A**: 1.1.1 유지 (버그 수정)
- 구독 복원 로직 수정
- 오류 메시지 개선

**옵션 B**: 1.2.0 업데이트 (기능 추가)
- IAP 기능 정식 활성화
- 구독 시스템 개선

**권장**: 1.1.2 (마이너 버그 수정)

---

### 3. Git 커밋

```bash
git add .
git commit -m "fix: IAP 복원 로직 및 오류 메시지 개선

주요 변경사항:
- restorePurchases() 실제 복원 여부 정확히 반환
- 초기화 실패 시 명확한 오류 처리 및 가이드 제공
- 사용자 친화적 오류 메시지로 개선
- 구독 관리 방법 상세 안내 추가

영향 범위:
- utils/iapManager.ts: IAP 핵심 로직 개선
- components/PremiumSubscription.tsx: UI 메시지 개선

관련 문서:
- SUBSCRIPTION_ERROR_DIAGNOSIS.md
- SUBSCRIPTION_FIX_SUMMARY.md
- PRE_BUILD_CHECKLIST.md
- IAP_SETUP_STATUS.md

Related: #구독오류수정"

git push origin main
```

---

### 4. 빌드 실행 가능 여부

**현재 상태**: ✅ **빌드 실행 가능**

**필수 완료 항목**:
- [x] 구독 상품 승인 완료
- [x] APPLE_SHARED_SECRET 설정 완료
- [x] 코드 수정 완료

**선택 항목**:
- [ ] Sandbox Tester 계정 (TestFlight 테스트 시 필요)
- [ ] Git 커밋 (권장)

**빌드 명령어** (준비되면 실행):
```bash
# iOS 빌드
eas build --platform ios --profile production-ios

# 예상 소요 시간: 15-20분
# 빌드 완료 후 TestFlight 자동 업로드
```

---

## 📝 결론

### ✅ 모든 필수 설정 완료됨

1. **App Store Connect**: 구독 상품 2개 승인 완료 ✓
2. **APPLE_SHARED_SECRET**: 2025-10-22 발급 및 등록 완료 ✓
3. **EAS Secrets**: project scope으로 등록 완료 ✓
4. **코드 적용**: 환경 변수 사용 중 ✓

### 🎯 빌드 실행 가능

**필수 조건**: 모두 충족 ✅
**선택 조건**: Sandbox Tester 계정 (테스트 시 필요)

**준비 완료 시점**: Git 커밋 후 즉시 빌드 가능

---

**작성자**: Claude Code
**확인 완료**: 2025-10-31
**결론**: ✅ **빌드 진행 가능 상태**
