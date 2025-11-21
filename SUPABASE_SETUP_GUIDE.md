# Supabase 구독 관리 시스템 설정 가이드

**작성일**: 2025년 11월 21일
**버전**: 1.0.0
**대상**: 타로 타이머 앱 - iOS/Android 인앱결제 시스템

---

## 📋 목차

1. [개요](#개요)
2. [사전 준비사항](#사전-준비사항)
3. [Supabase 프로젝트 생성](#supabase-프로젝트-생성)
4. [데이터베이스 스키마 설정](#데이터베이스-스키마-설정)
5. [Edge Function 배포](#edge-function-배포)
6. [환경 변수 설정](#환경-변수-설정)
7. [앱 설정 업데이트](#앱-설정-업데이트)
8. [테스트 체크리스트](#테스트-체크리스트)
9. [문제 해결](#문제-해결)

---

## 개요

이 가이드는 타로 타이머 앱에 Supabase 기반 구독 관리 시스템을 설정하는 방법을 안내합니다.

### 🎯 구현 목표

- ✅ **서버 측 영수증 검증**: Apple/Google 영수증을 Supabase Edge Function에서 검증
- ✅ **멀티 디바이스 동기화**: 모든 기기에서 구독 상태 실시간 동기화
- ✅ **보안 강화**: Apple Shared Secret 클라이언트 노출 차단
- ✅ **주기적 검증**: 구독 상태 자동 재검증 및 만료 처리

### 🏗️ 아키텍처

```
[iOS/Android 앱]
    ↓ (구매 완료)
    ↓ receiptData + transactionId + productId
    ↓
[Supabase Edge Function: verify-receipt]
    ↓ (Apple Server 통신)
    ↓ APPLE_SHARED_SECRET (서버 환경변수)
    ↓
[Apple verifyReceipt API]
    ↓ (검증 결과)
    ↓
[Supabase Database: user_subscriptions]
    ↓ (RLS 적용, 사용자별 격리)
    ↓
[앱 - 주기적 동기화]
    ↓ periodicValidation()
    ↓ Supabase에서 구독 상태 조회
    ↓ LocalStorage 업데이트
```

---

## 사전 준비사항

### 1. 계정 및 자격증명

- [ ] Supabase 계정 생성 (https://supabase.com)
- [ ] App Store Connect 계정 (iOS 결제용)
- [ ] Google Play Console 계정 (Android 결제용)
- [ ] Apple App별 공유 암호 생성

### 2. 도구 설치

```bash
# Supabase CLI 설치 (필수)
npm install -g supabase

# 로그인
supabase login

# 버전 확인
supabase --version
```

### 3. Apple App별 공유 암호 생성

1. **App Store Connect** → https://appstoreconnect.apple.com
2. **나의 앱** → 타로 타이머 선택
3. **앱 정보** 탭 → **App별 공유 암호** 섹션
4. **관리** 클릭 → **생성** 버튼
5. 생성된 암호 복사 (예: `1b9e9b48c45946ea8e425b74dc48cdf6`)

⚠️ **중요**: 이 값은 절대 클라이언트 코드에 포함하지 마세요!

---

## Supabase 프로젝트 생성

### 1. 새 프로젝트 생성

1. **Supabase Dashboard** → https://app.supabase.com
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Project Name**: `tarot-timer-prod` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` - ap-northeast-2 (한국 사용자용)
   - **Pricing Plan**: Free 또는 Pro (필요에 따라)

4. **Create new project** 클릭 (생성 약 2-3분 소요)

### 2. 프로젝트 정보 확인

프로젝트 생성 후 **Settings** → **API** 메뉴에서 다음 정보를 복사하세요:

```bash
# Project URL
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# anon/public key (클라이언트 앱에서 사용)
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (Edge Function에서 사용, 절대 클라이언트 노출 금지!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **보안 주의**:
- `service_role key`는 RLS를 우회하므로 절대 클라이언트에 노출하지 마세요!
- `.env` 파일에만 저장하고, `.gitignore`에 추가하세요!

---

## 데이터베이스 스키마 설정

### 1. SQL 에디터로 스키마 생성

1. **Supabase Dashboard** → **SQL Editor** 메뉴
2. **New Query** 클릭
3. 아래 SQL 스크립트 복사 & 실행:

```sql
-- supabase/subscriptions-schema.sql 파일 내용 복사
-- (프로젝트 루트의 supabase/subscriptions-schema.sql 파일 참조)
```

또는 로컬에서 Supabase CLI 사용:

```bash
# 프로젝트 루트 디렉토리에서 실행
cd tarot-timer-web

# Supabase 로컬 프로젝트 초기화 (처음 한 번만)
supabase init

# Supabase 프로젝트 연결
supabase link --project-ref your-project-id

# 스키마 파일 실행
supabase db push
```

### 2. 테이블 생성 확인

**Table Editor** 메뉴에서 다음 테이블이 생성되었는지 확인:

- ✅ `user_subscriptions` - 구독 정보 저장
- ✅ `subscription_history` - 구독 이력 저장

### 3. RLS (Row Level Security) 확인

각 테이블에서 **RLS Enabled** 상태 확인:

```sql
-- RLS 정책 확인
SELECT * FROM pg_policies
WHERE tablename IN ('user_subscriptions', 'subscription_history');
```

예상 결과:
- ✅ `users_read_own_subscriptions` 정책 활성화
- ✅ `users_insert_own_subscriptions` 정책 활성화
- ✅ `users_read_own_history` 정책 활성화

---

## Edge Function 배포

### 1. Edge Function 파일 확인

로컬 프로젝트에서 다음 파일들이 있는지 확인:

```
supabase/
└── functions/
    └── verify-receipt/
        ├── index.ts                   # 메인 엔트리포인트
        └── _shared/
            ├── types.ts               # TypeScript 타입 정의
            ├── apple-validator.ts     # Apple 영수증 검증
            └── database.ts            # Supabase DB 헬퍼
```

### 2. Supabase CLI로 함수 배포

```bash
# 프로젝트 루트에서 실행
cd tarot-timer-web

# Edge Function 배포
supabase functions deploy verify-receipt --project-ref your-project-id

# 배포 확인
supabase functions list --project-ref your-project-id
```

### 3. 환경 변수 설정 (Edge Function용)

```bash
# Apple Shared Secret 설정 (필수!)
supabase secrets set APPLE_SHARED_SECRET=1b9e9b48c45946ea8e425b74dc48cdf6 --project-ref your-project-id

# Supabase URL 설정
supabase secrets set SUPABASE_URL=https://your-project-id.supabase.co --project-ref your-project-id

# Service Role Key 설정 (RLS 우회용)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... --project-ref your-project-id

# 설정 확인
supabase secrets list --project-ref your-project-id
```

⚠️ **중요**: `APPLE_SHARED_SECRET`는 절대 클라이언트 코드에 포함하지 마세요!

### 4. Edge Function 테스트

```bash
# 로컬 테스트 (개발 환경)
supabase functions serve verify-receipt

# cURL로 테스트
curl -i --location --request POST 'http://localhost:54321/functions/v1/verify-receipt' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "receipt_data": "test_receipt_data",
    "transaction_id": "test_transaction_123",
    "product_id": "tarot_timer_monthly",
    "platform": "ios",
    "user_id": "test-user-uuid"
  }'
```

예상 응답:
```json
{
  "success": false,
  "error": "Apple API Error: 영수증이 유효하지 않습니다 (Status 21002)"
}
```

✅ 이 응답이 나오면 정상 작동 (실제 영수증 데이터가 아니므로)

---

## 환경 변수 설정

### 1. 앱 환경 변수 업데이트 (.env)

```bash
# .env 파일 수정
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ⚠️ 삭제 필수: 이전에 있던 APPLE_SHARED_SECRET 관련 변수 모두 삭제
# APPLE_SHARED_SECRET=xxxxx (삭제!)
# EXPO_PUBLIC_APP_STORE_SHARED_SECRET=xxxxx (삭제!)
```

### 2. EAS Secrets 설정 (프로덕션 빌드용)

```bash
# EAS CLI 설치 (없는 경우)
npm install -g eas-cli

# EAS 로그인
eas login

# Supabase URL 설정
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project-id.supabase.co

# Supabase Anon Key 설정
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 설정 확인
eas secret:list
```

⚠️ **중요**: EAS Secrets에는 `EXPO_PUBLIC_` 접두사가 있는 변수만 설정하세요!

---

## 앱 설정 업데이트

### 1. app.json 업데이트

```json
{
  "expo": {
    "extra": {
      "supabase": {
        "url": "https://your-project-id.supabase.co",
        "anonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

### 2. 앱 재시작

```bash
# 개발 서버 재시작
npx expo start --clear

# iOS 시뮬레이터
npx expo run:ios

# Android 에뮬레이터
npx expo run:android
```

---

## 테스트 체크리스트

### ✅ 1단계: 데이터베이스 연결 테스트

```typescript
// utils/supabase.ts에서 연결 테스트
import { supabase } from './utils/supabase';

async function testConnection() {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('count');

  if (error) {
    console.error('❌ Supabase 연결 실패:', error);
  } else {
    console.log('✅ Supabase 연결 성공!');
  }
}
```

### ✅ 2단계: Edge Function 호출 테스트

```typescript
// receiptValidator.ts의 validateReceipt 함수 테스트
const result = await ReceiptValidator.validateReceipt(
  'test_receipt_data',
  'test_transaction_123',
  'tarot_timer_monthly'
);

console.log('Edge Function 결과:', result);
```

### ✅ 3단계: iOS Sandbox 구매 테스트

1. **Sandbox 테스터 계정 생성**:
   - App Store Connect → Users and Access → Sandbox Testers
   - 새 Sandbox 계정 생성 (실제 Apple ID와 다른 이메일)

2. **iOS 기기/시뮬레이터에서 로그아웃**:
   - Settings → iTunes & App Store → Sign Out

3. **앱에서 구매 시도**:
   - 타로 타이머 앱 실행
   - 프리미엄 화면 → 월간/연간 구독 선택
   - Sandbox 계정으로 로그인 (첫 구매 시 자동 프롬프트)

4. **검증 확인**:
   ```typescript
   // 구매 후 콘솔 로그 확인
   console.log('💳 구매 완료:', productId);
   console.log('🔍 영수증 검증 시작...');
   console.log('✅ 영수증 검증 완료');
   console.log('📊 Supabase 저장 완료');
   ```

5. **Supabase Dashboard 확인**:
   - Table Editor → user_subscriptions
   - 새 구독 레코드 생성 확인
   - `is_active: true`, `environment: Sandbox` 확인

### ✅ 4단계: 멀티 디바이스 동기화 테스트

1. **첫 번째 기기에서 구매**:
   - iOS 시뮬레이터 A에서 구독 구매

2. **두 번째 기기에서 동기화 확인**:
   - iOS 시뮬레이터 B 실행
   - 앱 시작 → 자동 동기화 확인
   - 또는 설정 → 구매 복원 버튼 클릭

3. **콘솔 로그 확인**:
   ```typescript
   console.log('🔄 Supabase 주기적 동기화 시작...');
   console.log('✅ 구독 상태 동기화 완료');
   console.log('💎 프리미엄 활성화!');
   ```

### ✅ 5단계: 구독 복원 테스트

1. **앱 삭제 후 재설치**
2. **설정 → 구매 복원** 클릭
3. **Supabase 동기화 확인**:
   ```typescript
   console.log('🔄 구매 복원 시작...');
   console.log('✅ Supabase에서 구독 조회 성공');
   console.log('💎 구독 복원 완료!');
   ```

### ✅ 6단계: 만료 및 환불 처리 테스트

1. **Supabase Dashboard**에서 수동 만료:
   ```sql
   UPDATE user_subscriptions
   SET expiry_date = NOW() - INTERVAL '1 day',
       is_active = false
   WHERE user_id = 'test-user-uuid';
   ```

2. **앱 재시작 → 무료 버전으로 전환 확인**

3. **환불 시뮬레이션**:
   - Sandbox Tester 계정으로 App Store에서 환불 요청
   - 앱 재시작 → 구독 비활성화 확인

### ✅ 7단계: Sandbox → Production 전환 테스트

1. **Production 영수증으로 테스트**:
   - TestFlight 빌드에서 실제 구매 (Sandbox 아님)
   - Edge Function이 자동으로 Production 모드로 전환 확인

2. **환경 필드 확인**:
   ```sql
   SELECT environment FROM user_subscriptions
   WHERE user_id = 'test-user-uuid';
   -- 결과: 'Production'
   ```

---

## 문제 해결

### ❌ "Supabase 연결 실패" 오류

**원인**: 잘못된 URL 또는 Anon Key

**해결**:
1. `.env` 파일의 `EXPO_PUBLIC_SUPABASE_URL` 확인
2. Supabase Dashboard → Settings → API에서 올바른 값 복사
3. 앱 재시작 (`npx expo start --clear`)

### ❌ "Edge Function 호출 실패" 오류

**원인**: Edge Function 미배포 또는 환경 변수 미설정

**해결**:
1. Edge Function 배포 확인:
   ```bash
   supabase functions list --project-ref your-project-id
   ```

2. 환경 변수 확인:
   ```bash
   supabase secrets list --project-ref your-project-id
   ```

3. `APPLE_SHARED_SECRET` 재설정:
   ```bash
   supabase secrets set APPLE_SHARED_SECRET=your-secret --project-ref your-project-id
   ```

### ❌ "Apple API Error: Status 21002" 오류

**원인**: 잘못된 영수증 데이터 또는 Shared Secret

**해결**:
1. App Store Connect에서 App별 공유 암호 재확인
2. Supabase Edge Function 환경 변수 업데이트:
   ```bash
   supabase secrets set APPLE_SHARED_SECRET=correct-secret --project-ref your-project-id
   ```

3. Edge Function 재배포:
   ```bash
   supabase functions deploy verify-receipt --project-ref your-project-id
   ```

### ❌ "RLS 정책 오류" - Row Level Security

**원인**: 사용자 인증 없이 데이터 접근 시도

**해결**:
1. 현재 사용자 ID 확인:
   ```typescript
   const userId = await LocalStorageManager.getUserId();
   console.log('User ID:', userId);
   ```

2. RLS 정책 확인:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_subscriptions';
   ```

3. 필요 시 임시로 RLS 비활성화 (개발 환경만!):
   ```sql
   ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
   ```

### ❌ "멀티 디바이스 동기화 안 됨"

**원인**: 동일한 user_id를 사용하지 않음

**해결**:
1. 사용자 ID 생성 로직 확인:
   ```typescript
   // localStorage.ts
   const userId = await AsyncStorage.getItem('user_id');
   if (!userId) {
     const newUserId = uuidv4();
     await AsyncStorage.setItem('user_id', newUserId);
   }
   ```

2. 두 기기에서 동일한 `user_id` 사용 확인

### ❌ "구매 후 Supabase에 저장 안 됨"

**원인**: Edge Function에서 DB 저장 실패

**해결**:
1. Edge Function 로그 확인:
   ```bash
   supabase functions logs verify-receipt --project-ref your-project-id
   ```

2. Service Role Key 확인:
   ```bash
   supabase secrets list --project-ref your-project-id
   ```

3. Database Helper 디버깅:
   - `supabase/functions/verify-receipt/_shared/database.ts` 확인
   - 콘솔 로그 추가하여 오류 추적

---

## 📌 중요 보안 체크리스트

배포 전 반드시 확인하세요:

- [ ] ✅ `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] ✅ `APPLE_SHARED_SECRET`이 클라이언트 코드에 없음
- [ ] ✅ `EXPO_PUBLIC_APP_STORE_SHARED_SECRET` 변수 완전 삭제
- [ ] ✅ Supabase Service Role Key가 클라이언트에 노출되지 않음
- [ ] ✅ RLS (Row Level Security) 정책이 활성화됨
- [ ] ✅ Edge Function 환경 변수가 올바르게 설정됨
- [ ] ✅ Production 환경에서 Sandbox 영수증 차단 확인

---

## 🚀 프로덕션 배포 체크리스트

- [ ] ✅ Supabase 프로젝트를 Pro 플랜으로 업그레이드 (선택)
- [ ] ✅ Edge Function 배포 완료
- [ ] ✅ 데이터베이스 백업 설정
- [ ] ✅ Supabase 모니터링 설정 (Alerts)
- [ ] ✅ EAS Secrets 설정 완료
- [ ] ✅ iOS TestFlight 빌드로 실제 결제 테스트
- [ ] ✅ Android Internal Testing으로 실제 결제 테스트
- [ ] ✅ 개인정보 처리방침 업데이트 완료
- [ ] ✅ App Store/Play Store 설명에 구독 관리 안내 추가

---

## 📞 지원 및 문의

**문제가 해결되지 않으면**:
- 📧 **이메일**: support@tarottimer.app
- 📖 **Supabase Docs**: https://supabase.com/docs
- 🐛 **GitHub Issues**: https://github.com/your-repo/issues

---

**문서 버전**: 1.0.0
**마지막 업데이트**: 2025년 11월 21일
**작성자**: Tarot Timer Development Team
