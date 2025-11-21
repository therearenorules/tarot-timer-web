# Supabase 연동 이슈 분석 보고서

**분석 날짜**: 2025-11-21
**프로젝트 ID**: syzefbnrnnjkdnoqbwsk
**분석 범위**: 환경 설정, Edge Function, 데이터베이스 스키마

---

## 🚨 **발견된 핵심 문제**

### ⚠️ **Issue #1: Supabase 환경 변수가 더미 값으로 설정됨** 🔴 CRITICAL

**파일**: `.env:3-4`

**현재 설정**:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dummy_key_for_development
```

**실제 값** (`.temp/project-ref`에서 확인):
```
프로젝트 ID: syzefbnrnnjkdnoqbwsk
실제 URL: https://syzefbnrnnjkdnoqbwsk.supabase.co
```

**문제점**:
1. ❌ 모든 Supabase 관련 기능이 작동하지 않음
2. ❌ 영수증 검증 Edge Function 호출 불가
3. ❌ 구독 동기화 완전 실패
4. ❌ 사용자 인증 불가

**영향받는 코드**:
- `utils/supabase.ts:14-22` - Supabase 클라이언트 생성 실패
- `utils/receiptValidator.ts:89-96` - Edge Function 호출 불가
- `contexts/PremiumContext.tsx:217,430` - periodicValidation() 실패

**해결 방법**:
```bash
# 실제 값으로 교체 필요
EXPO_PUBLIC_SUPABASE_URL=https://syzefbnrnnjkdnoqbwsk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<실제_ANON_KEY>
```

**우선순위**: 🔴 **최우선** - 모든 Supabase 기능 블로킹

---

### ⚠️ **Issue #2: Edge Function 환경 변수 미설정** 🔴 CRITICAL

**파일**: `supabase/functions/verify-receipt/index.ts:40-47`

**필수 환경 변수**:
```typescript
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const appleSharedSecret = Deno.env.get('APPLE_SHARED_SECRET');
```

**문제점**:
- Edge Function 배포 시 이 환경 변수들이 설정되지 않았을 가능성
- `APPLE_SHARED_SECRET` - App Store Connect에서 생성해야 함
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 대시보드에서 확인

**오류 발생 시나리오**:
```typescript
// Edge Function 실행 시
throw new ValidationError(
  `필수 환경 변수 누락: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APPLE_SHARED_SECRET`,
  'MISSING_ENV_VARS',
  500
);
```

**해결 방법**:
```bash
# Supabase CLI로 환경 변수 설정
supabase secrets set SUPABASE_URL=https://syzefbnrnnjkdnoqbwsk.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
supabase secrets set APPLE_SHARED_SECRET=<apple_shared_secret>
```

**우선순위**: 🔴 **최우선** - 영수증 검증 완전 차단

---

### ⚠️ **Issue #3: 데이터베이스 테이블 미생성 가능성** 🟠 HIGH

**파일**: `supabase/subscriptions-schema.sql`

**필요 테이블**:
1. `user_subscriptions` - 구독 정보 저장
2. `subscription_history` - 구독 변경 히스토리
3. `profiles` - 사용자 프로필 (참조 무결성)

**문제점**:
- `receiptValidator.ts:343` - `user_subscriptions` 테이블 조회 시 오류 가능
- 스키마 SQL이 실행되지 않았을 수 있음

**확인 방법**:
```sql
-- Supabase SQL Editor에서 실행
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_subscriptions', 'subscription_history', 'profiles');
```

**해결 방법**:
```bash
# 스키마 적용
psql -h db.syzefbnrnnjkdnoqbwsk.supabase.co -U postgres -f supabase/subscriptions-schema.sql
```

또는 Supabase 대시보드 SQL Editor에서 `subscriptions-schema.sql` 전체 복사 후 실행

**우선순위**: 🟠 **높음** - 구독 데이터 저장 불가

---

### ⚠️ **Issue #4: 사용자 인증 누락으로 인한 Edge Function 호출 실패** 🟡 MEDIUM

**파일**: `utils/receiptValidator.ts:109-121`

**코드**:
```typescript
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
  console.error('❌ [ReceiptValidator] 사용자 인증 실패:', authError);
  return {
    isValid: false,
    isActive: false,
    error: '사용자 인증이 필요합니다',
  };
}
```

**문제점**:
- 현재 앱에는 사용자 인증 UI가 없음
- `supabase.auth.getUser()`가 항상 null 반환
- 영수증 검증 시 user_id가 없어서 실패

**해결 방법 옵션**:

**옵션 1: 익명 인증 사용** (권장)
```typescript
// 앱 시작 시 자동 익명 로그인
const { data, error } = await supabase.auth.signInAnonymously();
```

**옵션 2: 디바이스 ID 기반 인증**
```typescript
// 디바이스 고유 ID로 자동 가입/로그인
const deviceId = await getDeviceId();
const email = `${deviceId}@tarottimer.app`;
const password = generateSecurePassword(deviceId);

await supabase.auth.signInWithPassword({ email, password });
```

**옵션 3: Edge Function 수정** (user_id 선택사항으로 변경)
```typescript
// Edge Function에서 user_id 없이도 작동하도록 수정
if (!user_id) {
  user_id = 'anonymous-' + crypto.randomUUID();
}
```

**우선순위**: 🟡 **중간** - 임시 우회 가능하지만 근본 해결 필요

---

### ⚠️ **Issue #5: Edge Function 배포 상태 불명확** 🟡 MEDIUM

**확인 필요 사항**:
```bash
# Edge Function이 실제로 배포되었는지 확인
supabase functions list

# verify-receipt 함수 상태 확인
curl -X POST https://syzefbnrnnjkdnoqbwsk.supabase.co/functions/v1/verify-receipt \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**문제점**:
- Edge Function이 배포되지 않았을 수 있음
- 배포되었어도 환경 변수 미설정으로 작동 안 할 수 있음

**해결 방법**:
```bash
# Edge Function 배포
supabase functions deploy verify-receipt

# 로그 확인
supabase functions logs verify-receipt
```

**우선순위**: 🟡 **중간**

---

## 📊 **이슈 우선순위 매트릭스**

| 순위 | 이슈 | 심각도 | 영향 범위 | 해결 난이도 |
|------|------|---------|----------|------------|
| 1 | 환경 변수 더미 값 | 🔴 Critical | 전체 시스템 | ⭐ 쉬움 |
| 2 | Edge Function 환경 변수 | 🔴 Critical | 영수증 검증 | ⭐⭐ 보통 |
| 3 | DB 테이블 미생성 | 🟠 High | 구독 저장 | ⭐⭐ 보통 |
| 4 | 사용자 인증 누락 | 🟡 Medium | Edge Function | ⭐⭐⭐ 어려움 |
| 5 | Edge Function 미배포 | 🟡 Medium | 영수증 검증 | ⭐ 쉬움 |

---

## 🔍 **실제 오류 시나리오 시뮬레이션**

### 시나리오 1: 구독 구매 시도

```
1. 사용자가 구독 구매 클릭
2. IAPManager.purchaseSubscription() 호출
3. Apple StoreKit 결제 완료 ✅
4. purchaseUpdatedListener 이벤트 수신 ✅
5. ReceiptValidator.validateReceipt() 호출

   ❌ [Step 1] Supabase 클라이언트 생성 실패
   → supabase === null (더미 URL 때문)
   → 반환: { isValid: false, error: 'Supabase 연결이 설정되지 않았습니다' }

6. 영수증 검증 실패
7. Supabase 동기화 실패
8. LocalStorage만 업데이트됨 (임시 저장)
9. 다음 앱 실행 시 구독 상태 손실 가능
```

### 시나리오 2: periodicValidation() 호출

```typescript
// PremiumContext.tsx:217, 430
await ReceiptValidator.periodicValidation();

실행 과정:
1. supabase.auth.getUser() 호출
   ❌ 사용자 인증 안 됨 → user === null
   → 조기 종료: "사용자 미인증 - 건너뜀"

2. user_subscriptions 테이블 조회 시도 안 함
3. 동기화 실패
```

### 시나리오 3: Edge Function 호출 (환경 변수 있다고 가정)

```typescript
// 실제 Supabase 설정되었다고 가정
const { data, error } = await supabase.functions.invoke('verify-receipt', {
  body: requestData
});

Edge Function 내부 오류:
1. ❌ APPLE_SHARED_SECRET 환경 변수 없음
2. ValidationError 발생
3. HTTP 500 응답
4. 클라이언트에서 재시도 (최대 3회)
5. 모든 재시도 실패
6. 영수증 검증 최종 실패
```

---

## 🛠️ **해결 단계별 가이드**

### **Step 1: Supabase 프로젝트 확인** ✅

```bash
# 프로젝트 존재 확인
프로젝트 ID: syzefbnrnnjkdnoqbwsk
URL: https://syzefbnrnnjkdnoqbwsk.supabase.co
```

### **Step 2: Supabase 대시보드에서 키 확인**

1. https://app.supabase.com 로그인
2. 프로젝트 `syzefbnrnnjkdnoqbwsk` 선택
3. Settings > API 메뉴 이동
4. 다음 값 복사:
   - `Project URL`
   - `anon/public key`
   - `service_role key` (보안 주의!)

### **Step 3: .env 파일 업데이트**

```bash
# .env 파일 수정
EXPO_PUBLIC_SUPABASE_URL=https://syzefbnrnnjkdnoqbwsk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<실제_ANON_KEY>
```

### **Step 4: 데이터베이스 스키마 적용**

Supabase 대시보드 > SQL Editor:
```sql
-- subscriptions-schema.sql 전체 내용 복사 후 실행
-- 또는
-- schema.sql 실행 (profiles 테이블 포함)
```

### **Step 5: Apple Shared Secret 생성**

1. App Store Connect 로그인
2. My Apps > Tarot Timer 선택
3. App Information > App-Specific Shared Secret
4. Generate 클릭
5. 생성된 키 복사

### **Step 6: Edge Function 환경 변수 설정**

```bash
# Supabase CLI 설치 (아직 안 했다면)
brew install supabase/tap/supabase

# 프로젝트 연결
supabase link --project-ref syzefbnrnnjkdnoqbwsk

# 환경 변수 설정
supabase secrets set SUPABASE_URL=https://syzefbnrnnjkdnoqbwsk.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
supabase secrets set APPLE_SHARED_SECRET=<apple_shared_secret>
```

### **Step 7: Edge Function 배포**

```bash
# verify-receipt 함수 배포
supabase functions deploy verify-receipt

# 배포 확인
supabase functions list

# 로그 확인
supabase functions logs verify-receipt --tail
```

### **Step 8: 사용자 인증 구현** (3가지 옵션 중 선택)

**옵션 A: 익명 인증** (가장 빠름)
```typescript
// App.tsx 또는 PremiumContext.tsx 초기화 시
const signInAnonymously = async () => {
  if (!supabase) return;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('익명 로그인 실패:', error);
  } else {
    console.log('익명 로그인 성공:', data.user.id);
  }
};
```

**옵션 B: 디바이스 ID 기반**
```typescript
import * as Device from 'expo-device';
import * as Crypto from 'expo-crypto';

const signInWithDeviceId = async () => {
  const deviceId = Device.osBuildId || await Crypto.randomUUID();
  const email = `${deviceId}@tarottimer.app`;
  const password = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    deviceId + 'tarot-timer-salt'
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error?.message.includes('Invalid login')) {
    // 계정 없으면 생성
    await supabase.auth.signUp({ email, password });
  }
};
```

**옵션 C: Edge Function 수정** (user_id 선택사항)
```typescript
// supabase/functions/verify-receipt/index.ts:68-75 수정
const { receipt_data, transaction_id, product_id, platform } = body;
let { user_id } = body;

// user_id 없으면 임시 생성
if (!user_id) {
  user_id = 'anonymous-' + crypto.randomUUID();
  console.warn('[Main] user_id 없음 - 임시 ID 생성:', user_id);
}
```

### **Step 9: 테스트**

```bash
# 앱 재시작 (환경 변수 반영)
npx expo start --clear

# iOS TestFlight에서 구독 구매 테스트
# 로그 확인:
# - ✅ Supabase 클라이언트 생성 성공
# - ✅ 사용자 인증 성공
# - ✅ Edge Function 호출 성공
# - ✅ DB 저장 성공
```

---

## 📋 **체크리스트**

### Supabase 설정
- [ ] .env 파일 업데이트 (실제 URL, ANON_KEY)
- [ ] Supabase 프로젝트 확인
- [ ] API 키 확인 (anon, service_role)

### 데이터베이스
- [ ] schema.sql 실행 (profiles 테이블)
- [ ] subscriptions-schema.sql 실행
- [ ] 테이블 생성 확인 (SQL Editor)
- [ ] RLS 정책 활성화 확인

### Edge Function
- [ ] Apple Shared Secret 생성
- [ ] Supabase CLI 설치
- [ ] 프로젝트 연결 (link)
- [ ] 환경 변수 설정 (secrets)
- [ ] Edge Function 배포
- [ ] 배포 확인 (functions list)
- [ ] 로그 확인 (functions logs)

### 사용자 인증
- [ ] 인증 방식 선택 (익명/디바이스/수정)
- [ ] 코드 구현
- [ ] 테스트

### 통합 테스트
- [ ] 앱 재시작
- [ ] Supabase 연결 확인
- [ ] 구독 구매 테스트
- [ ] 영수증 검증 테스트
- [ ] DB 저장 확인
- [ ] periodicValidation 테스트

---

## 🎯 **예상 결과**

### 수정 전 (현재)
```
❌ Supabase 클라이언트: null
❌ Edge Function 호출: 실패
❌ 영수증 검증: 실패
❌ 구독 동기화: 실패
⚠️ LocalStorage만 사용 (임시)
```

### 수정 후 (예상)
```
✅ Supabase 클라이언트: 정상
✅ 사용자 인증: 익명/디바이스 ID
✅ Edge Function 호출: 성공
✅ Apple 영수증 검증: 성공
✅ DB 저장: user_subscriptions 테이블
✅ 구독 동기화: 완벽
✅ 다른 기기 로그인 시 자동 복원
```

---

## 💡 **권장 사항**

1. **즉시 실행 필요**:
   - .env 파일 업데이트
   - Supabase 대시보드 접속하여 키 확인
   - 데이터베이스 스키마 적용

2. **우선순위 높음**:
   - Edge Function 환경 변수 설정
   - Edge Function 배포
   - 익명 인증 구현

3. **선택적**:
   - 정식 회원가입/로그인 UI 추가
   - 소셜 로그인 연동
   - 프로필 관리 기능

4. **모니터링**:
   - Supabase 대시보드에서 실시간 로그 확인
   - Edge Function 로그 모니터링
   - 오류율 추적

---

**작성자**: Claude Code AI
**마지막 업데이트**: 2025-11-21
**우선순위**: 🔴 **긴급** - 프로덕션 블로킹 이슈
