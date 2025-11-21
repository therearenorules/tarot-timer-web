# 타로 타이머 - 구독 시스템 테스트 체크리스트

**버전**: 1.0.0
**날짜**: 2025년 11월 21일

---

## 🎯 테스트 목적

Supabase 기반 구독 관리 시스템의 정상 작동 여부를 검증합니다.

---

## ✅ 1. Supabase 연결 테스트

### 1.1 데이터베이스 연결

- [ ] Supabase 프로젝트 생성 완료
- [ ] `.env` 파일에 `EXPO_PUBLIC_SUPABASE_URL` 설정
- [ ] `.env` 파일에 `EXPO_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] 앱 시작 시 Supabase 연결 성공 로그 확인

**테스트 방법**:
```bash
npx expo start --clear
```

**예상 로그**:
```
✅ Supabase 연결 성공
```

### 1.2 스키마 생성 확인

- [ ] `user_subscriptions` 테이블 생성 완료
- [ ] `subscription_history` 테이블 생성 완료
- [ ] RLS (Row Level Security) 정책 활성화 확인

**테스트 방법**:
- Supabase Dashboard → Table Editor 확인

---

## ✅ 2. Edge Function 배포 테스트

### 2.1 함수 배포

- [ ] `verify-receipt` Edge Function 배포 완료
- [ ] 환경 변수 설정 완료:
  - [ ] `APPLE_SHARED_SECRET`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`

**테스트 방법**:
```bash
supabase functions list --project-ref your-project-id
supabase secrets list --project-ref your-project-id
```

### 2.2 함수 호출 테스트

- [ ] Edge Function 호출 성공
- [ ] Apple API 연동 확인 (Status 21002 오류 정상)

**테스트 방법**:
```bash
curl -i --location --request POST 'https://your-project-id.supabase.co/functions/v1/verify-receipt' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "receipt_data": "test",
    "transaction_id": "test123",
    "product_id": "tarot_timer_monthly",
    "platform": "ios",
    "user_id": "test-uuid"
  }'
```

**예상 응답**:
```json
{
  "success": false,
  "error": "Apple API Error: ..."
}
```

---

## ✅ 3. iOS Sandbox 구매 테스트

### 3.1 Sandbox 환경 설정

- [ ] Sandbox Tester 계정 생성 (App Store Connect)
- [ ] iOS 기기/시뮬레이터에서 로그아웃
- [ ] 타로 타이머 앱 설치

### 3.2 월간 구독 구매

- [ ] 앱 실행 → 프리미엄 화면 진입
- [ ] 월간 구독 (tarot_timer_monthly) 선택
- [ ] Sandbox 계정으로 로그인
- [ ] 구매 완료 확인

**예상 로그**:
```
💳 [1/5] 구매 업데이트 수신: tarot_timer_monthly
💳 [2/5] 영수증 확인 완료
💳 [3/5] 결제 승인(finishTransaction) 완료
⏳ Sandbox 영수증 전파 대기 중... (2초)
💳 [4/5] 영수증 전파 대기 완료
🔍 구매 성공 처리 및 영수증 검증 시작...
✅ 영수증 검증 및 동기화 완료
💳 [5/5] 구독 처리 완료
```

### 3.3 Supabase 저장 확인

- [ ] Supabase Dashboard → user_subscriptions 테이블 확인
- [ ] 새 레코드 생성 확인:
  - [ ] `is_active: true`
  - [ ] `environment: Sandbox`
  - [ ] `product_id: tarot_timer_monthly`
  - [ ] `expiry_date`: 현재 시간 + 1개월

### 3.4 앱 상태 확인

- [ ] 프리미엄 배지 활성화 확인
- [ ] 광고 제거 확인
- [ ] 무제한 저장 기능 활성화 확인

---

## ✅ 4. 연간 구독 구매 테스트

### 4.1 연간 구독 구매

- [ ] 앱 실행 → 프리미엄 화면 진입
- [ ] 연간 구독 (tarot_timer_yearly) 선택
- [ ] 구매 완료 확인

### 4.2 Supabase 저장 확인

- [ ] Supabase Dashboard 확인:
  - [ ] `product_id: tarot_timer_yearly`
  - [ ] `expiry_date`: 현재 시간 + 1년

---

## ✅ 5. 멀티 디바이스 동기화 테스트

### 5.1 첫 번째 기기에서 구매

- [ ] iOS 시뮬레이터 A에서 구독 구매

### 5.2 두 번째 기기에서 동기화

- [ ] iOS 시뮬레이터 B 실행
- [ ] 앱 시작 → 자동 동기화 확인
- [ ] 프리미엄 상태 활성화 확인

**예상 로그**:
```
🔄 Supabase 주기적 동기화 시작...
✅ Supabase에서 활성 구독 조회 성공
✅ LocalStorage 업데이트 완료
💎 프리미엄 활성화!
```

### 5.3 수동 복원 테스트

- [ ] 설정 → 구매 복원 버튼 클릭
- [ ] Supabase 동기화 확인
- [ ] 프리미엄 활성화 확인

---

## ✅ 6. 구독 복원 테스트

### 6.1 앱 재설치 시나리오

- [ ] 타로 타이머 앱 삭제
- [ ] 앱 재설치
- [ ] 설정 → 구매 복원 클릭

### 6.2 복원 확인

- [ ] Supabase에서 구독 조회 성공
- [ ] LocalStorage에 구독 정보 복원
- [ ] 프리미엄 기능 활성화 확인

**예상 로그**:
```
🔄 [1/4] 구매 복원 시작...
📦 [2/4] 복원된 구매 내역: 1개
🔍 [3/4] 구독 내역 처리 중...
✅ 구독 복원 완료: tarot_timer_monthly
✅ [4/4] 구매 복원 완료 (1개)
```

---

## ✅ 7. 주기적 검증 테스트

### 7.1 앱 포그라운드 복귀 시 동기화

- [ ] 앱 실행 → 백그라운드로 전환
- [ ] 1분 대기
- [ ] 앱 포그라운드로 복귀
- [ ] Supabase 동기화 로그 확인

**예상 로그**:
```
🔄 [모바일] 프리미엄 상태 변경 감지
🔄 구독 상태 새로고침 시작...
✅ Supabase 주기적 동기화 완료
✅ IAP 구독 상태 확인 완료
✅ 구독 상태 새로고침 완료
```

### 7.2 주기적 검증 (periodicValidation)

- [ ] 앱 시작 시 자동 실행 확인
- [ ] Supabase 구독 데이터 조회 성공
- [ ] LocalStorage 업데이트 확인

---

## ✅ 8. 만료 처리 테스트

### 8.1 수동 만료 시뮬레이션

**Supabase Dashboard → SQL Editor**:
```sql
UPDATE user_subscriptions
SET expiry_date = NOW() - INTERVAL '1 day',
    is_active = false
WHERE user_id = 'test-user-uuid';
```

### 8.2 앱에서 확인

- [ ] 앱 재시작
- [ ] 주기적 검증 실행 확인
- [ ] 무료 버전으로 전환 확인
- [ ] 광고 표시 재개 확인

**예상 로그**:
```
✅ Supabase 주기적 동기화 완료
⚠️ 구독 만료됨
✅ 무료 버전 활성화
```

---

## ✅ 9. 환불 처리 테스트

### 9.1 환불 요청 (Sandbox)

- [ ] Sandbox Tester 계정으로 App Store 접속
- [ ] 구독 관리 → 환불 요청
- [ ] 환불 승인 확인

### 9.2 앱에서 확인

- [ ] 앱 재시작
- [ ] 구독 비활성화 확인
- [ ] 무료 버전으로 전환 확인

---

## ✅ 10. Sandbox → Production 전환 테스트

### 10.1 TestFlight 빌드 생성

- [ ] EAS Build로 Production 빌드 생성
- [ ] TestFlight 업로드
- [ ] TestFlight 앱 설치

### 10.2 실제 결제 테스트

- [ ] TestFlight 앱에서 구독 구매 (실제 결제!)
- [ ] Edge Function이 자동으로 Production 모드 전환 확인

### 10.3 Supabase 확인

- [ ] `environment: Production` 확인

**SQL 쿼리**:
```sql
SELECT environment FROM user_subscriptions
WHERE user_id = 'production-user-uuid';
```

**예상 결과**: `Production`

---

## ✅ 11. 에러 처리 테스트

### 11.1 네트워크 오류

- [ ] 비행기 모드 활성화
- [ ] 구독 구매 시도
- [ ] 오류 메시지 표시 확인
- [ ] 네트워크 복구 후 재시도 성공 확인

### 11.2 Edge Function 타임아웃

- [ ] Edge Function 일시 중지 (Supabase Dashboard)
- [ ] 구독 구매 시도
- [ ] 타임아웃 오류 확인
- [ ] 재시도 로직 작동 확인

### 11.3 Apple API 오류

- [ ] 잘못된 영수증 데이터로 검증 시도
- [ ] Apple API 오류 메시지 확인
- [ ] 사용자 친화적 오류 메시지 표시 확인

---

## ✅ 12. 보안 테스트

### 12.1 클라이언트 코드 검증

- [ ] `APPLE_SHARED_SECRET`이 클라이언트 코드에 없음 확인
- [ ] `EXPO_PUBLIC_APP_STORE_SHARED_SECRET` 완전 삭제 확인
- [ ] `.env` 파일이 `.gitignore`에 포함됨 확인

**검증 방법**:
```bash
# 클라이언트 번들에서 APPLE_SHARED_SECRET 검색
grep -r "APPLE_SHARED_SECRET" .expo/
grep -r "1b9e9b48c45946ea8e425b74dc48cdf6" .expo/

# 결과: 발견되지 않아야 함
```

### 12.2 RLS (Row Level Security) 검증

- [ ] 다른 사용자의 구독 데이터 조회 시도 → 차단 확인

**SQL 쿼리** (Supabase Dashboard):
```sql
-- 현재 사용자가 아닌 다른 사용자의 구독 조회 시도
SELECT * FROM user_subscriptions
WHERE user_id != auth.uid();
-- 결과: 빈 배열 또는 RLS 오류
```

### 12.3 Service Role Key 보호

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트에 노출되지 않음 확인
- [ ] Edge Function에서만 사용됨 확인

---

## ✅ 13. 성능 테스트

### 13.1 영수증 검증 속도

- [ ] 구매 후 영수증 검증 시간 측정
- [ ] 목표: 5초 이내

### 13.2 Supabase 동기화 속도

- [ ] 주기적 검증 시간 측정
- [ ] 목표: 3초 이내

### 13.3 멀티 디바이스 동기화 지연

- [ ] 첫 번째 기기 구매 후 두 번째 기기 동기화 시간
- [ ] 목표: 10초 이내

---

## ✅ 14. 사용자 경험 테스트

### 14.1 구매 플로우

- [ ] 구매 버튼 클릭 → 결제 시트 표시
- [ ] Sandbox 계정 로그인 → 구매 확인
- [ ] 로딩 인디케이터 표시
- [ ] 구매 완료 → 성공 메시지 표시
- [ ] 프리미엄 기능 즉시 활성화

### 14.2 오류 메시지

- [ ] 네트워크 오류 → "인터넷 연결을 확인해주세요"
- [ ] 결제 취소 → "사용자가 구매를 취소했습니다"
- [ ] 이미 구매한 상품 → "이미 구매한 상품입니다. 구매 복원을 시도해주세요"

### 14.3 복원 플로우

- [ ] 설정 → 구매 복원 버튼
- [ ] 로딩 인디케이터
- [ ] 복원 성공 → "구독이 복원되었습니다"
- [ ] 복원 실패 → "복원할 구매 내역이 없습니다"

---

## ✅ 15. 개인정보 처리방침 확인

### 15.1 문서 업데이트

- [ ] PRIVACY_POLICY.md 버전 1.1.0 확인
- [ ] public/privacy-policy.html 업데이트 확인
- [ ] Supabase 데이터 처리 내용 포함 확인

### 15.2 앱 내 링크

- [ ] 설정 → 개인정보 처리방침 링크 작동 확인
- [ ] 프리미엄 화면 → 개인정보 처리방침 링크 작동 확인

---

## 📊 테스트 결과 요약

### 테스트 통과 기준

- **필수 테스트**: 1~10번 모두 통과
- **선택 테스트**: 11~15번 중 80% 이상 통과

### 결과 기록

| 테스트 항목 | 통과 여부 | 비고 |
|------------|----------|------|
| 1. Supabase 연결 | ⬜ |  |
| 2. Edge Function 배포 | ⬜ |  |
| 3. iOS Sandbox 구매 | ⬜ |  |
| 4. 연간 구독 구매 | ⬜ |  |
| 5. 멀티 디바이스 동기화 | ⬜ |  |
| 6. 구독 복원 | ⬜ |  |
| 7. 주기적 검증 | ⬜ |  |
| 8. 만료 처리 | ⬜ |  |
| 9. 환불 처리 | ⬜ |  |
| 10. Sandbox → Production | ⬜ |  |
| 11. 에러 처리 | ⬜ |  |
| 12. 보안 테스트 | ⬜ |  |
| 13. 성능 테스트 | ⬜ |  |
| 14. 사용자 경험 | ⬜ |  |
| 15. 개인정보 처리방침 | ⬜ |  |

---

## 📝 테스트 환경

- **Supabase 프로젝트**: _______________
- **iOS 버전**: _______________
- **Xcode 버전**: _______________
- **테스트 날짜**: _______________
- **테스터**: _______________

---

## 🚀 프로덕션 배포 전 최종 체크

- [ ] ✅ 모든 필수 테스트 통과 (1~10번)
- [ ] ✅ Supabase 프로젝트 Pro 플랜 업그레이드 (선택)
- [ ] ✅ EAS Secrets 설정 완료
- [ ] ✅ 개인정보 처리방침 업데이트
- [ ] ✅ App Store/Play Store 설명 업데이트
- [ ] ✅ TestFlight 베타 테스트 완료 (최소 2주)
- [ ] ✅ 실제 결제 테스트 완료 (Production 환경)

---

**문서 버전**: 1.0.0
**마지막 업데이트**: 2025년 11월 21일
