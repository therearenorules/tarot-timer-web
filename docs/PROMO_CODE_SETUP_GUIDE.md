# 🎁 프로모션 코드 시스템 설치 가이드

## 📋 목차
1. [Supabase 설정](#1-supabase-설정)
2. [코드 배포](#2-코드-배포)
3. [테스트](#3-테스트)
4. [관리자 사용법](#4-관리자-사용법)
5. [문제 해결](#5-문제-해결)

---

## 1. Supabase 설정

### 1-1. SQL 실행

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택: `tarot-timer-web`

2. **SQL Editor 열기**
   - 왼쪽 메뉴: `SQL Editor` 클릭
   - `New query` 버튼 클릭

3. **SQL 파일 복사 붙여넣기**
   ```
   supabase/migrations/create_promo_codes_table.sql 파일 전체 내용 복사
   ```

4. **실행**
   - `Run` 버튼 클릭 (또는 Ctrl/Cmd + Enter)
   - ✅ 성공 메시지 확인

### 1-2. 결과 확인

SQL 실행 후 다음이 생성됩니다:

**테이블 2개:**
- `promo_codes` - 프로모션 코드 마스터
- `promo_code_usage` - 사용 내역

**함수 2개:**
- `validate_promo_code()` - 코드 유효성 검증
- `apply_promo_code()` - 코드 적용

**뷰 1개:**
- `promo_code_stats` - 통계 (관리자용)

**확인 방법:**
1. 왼쪽 메뉴: `Table Editor` 클릭
2. `promo_codes` 테이블이 보이는지 확인
3. 기존 4개 코드가 자동으로 삽입되었는지 확인:
   - TAROT2025
   - 타로사랑
   - 웰컴7일
   - 데아노사주타로

---

## 2. 코드 배포

### 2-1. 기존 파일 백업

```bash
# 기존 파일 백업
cp services/promoService.ts services/promoService.backup.ts
cp constants/promoCodes.ts constants/promoCodes.backup.ts
```

### 2-2. 새 파일로 교체

```bash
# 새 버전 적용
mv services/promoService.v2.ts services/promoService.ts
```

### 2-3. 필요한 패키지 확인

```bash
# Expo Device 패키지 확인 (이미 설치되어 있을 것)
npm list expo-device

# 없으면 설치
npm install expo-device
```

---

## 3. 테스트

### 3-1. Supabase 함수 직접 테스트

**SQL Editor에서 실행:**

```sql
-- 1. 코드 유효성 검증 테스트
SELECT * FROM validate_promo_code(
    'TAROT2025',
    'test-device-123',
    NULL
);

-- 예상 결과:
-- is_valid: true
-- error_message: NULL
-- promo_id: UUID
-- free_days: 7
-- benefits: {"ad_free": true, "unlimited_storage": true, "premium_spreads": true}


-- 2. 코드 적용 테스트
SELECT * FROM apply_promo_code(
    'TAROT2025',
    'test-device-123',
    NULL,
    'web',
    'Test User Agent',
    '127.0.0.1'::inet
);

-- 예상 결과:
-- success: true
-- message: "🎉 7일간 프리미엄 혜택이 적용되었습니다!"
-- expires_at: (현재 시간 + 7일)
-- benefits: {"ad_free": true, "unlimited_storage": true, "premium_spreads": true}


-- 3. 사용 내역 확인
SELECT * FROM promo_code_usage
WHERE code = 'TAROT2025'
ORDER BY applied_at DESC;


-- 4. 통계 확인
SELECT * FROM promo_code_stats
WHERE code = 'TAROT2025';
```

### 3-2. 앱에서 테스트

1. **개발 서버 시작**
   ```bash
   npm start
   ```

2. **프로모션 코드 입력**
   - 프리미엄 구독 화면 열기
   - "프로모션 코드" 섹션 찾기
   - 코드 입력: `TAROT2025`
   - "등록" 버튼 클릭

3. **결과 확인**
   - ✅ 성공 Alert: "🎉 7일간 프리미엄 혜택이 적용되었습니다!"
   - 프리미엄 상태 즉시 활성화
   - 만료일 확인 (7일 후)

4. **중복 사용 테스트**
   - 같은 코드 다시 입력
   - ❌ 오류 Alert: "이미 사용한 코드입니다."

---

## 4. 관리자 사용법

### 4-1. 새 프로모션 코드 생성 (SQL)

```sql
-- 단일 코드 생성
INSERT INTO promo_codes (code, description, free_days, max_uses, valid_until)
VALUES (
    'NEWYEAR2025',
    '새해 특별 이벤트 코드',
    14, -- 14일 무료
    100, -- 선착순 100명
    '2025-01-31 23:59:59+00' -- 2025년 1월 31일까지
);


-- 무제한 사용 코드 (max_uses = NULL)
INSERT INTO promo_codes (code, description, free_days)
VALUES (
    'FOREVER2025',
    '무제한 사용 가능 코드',
    30 -- 30일 무료
);


-- 특정 혜택만 제공하는 코드
INSERT INTO promo_codes (
    code,
    description,
    free_days,
    benefits
) VALUES (
    'ADFREE7',
    '광고 제거만 7일 무료',
    7,
    '{"ad_free": true, "unlimited_storage": false, "premium_spreads": false}'::jsonb
);
```

### 4-2. 코드 관리

```sql
-- 코드 비활성화 (더 이상 사용 불가)
UPDATE promo_codes
SET is_active = false
WHERE code = 'TAROT2025';


-- 사용 횟수 제한 변경
UPDATE promo_codes
SET max_uses = 200
WHERE code = 'NEWYEAR2025';


-- 유효 기간 연장
UPDATE promo_codes
SET valid_until = '2025-12-31 23:59:59+00'
WHERE code = 'FOREVER2025';


-- 코드 삭제 (사용 내역도 함께 삭제됨)
DELETE FROM promo_codes
WHERE code = 'OLD_CODE';
```

### 4-3. 통계 조회

```sql
-- 전체 통계
SELECT
    code,
    description,
    free_days,
    max_uses,
    current_uses,
    total_redemptions,
    unique_users,
    unique_devices,
    is_active,
    last_used_at
FROM promo_code_stats
ORDER BY created_at DESC;


-- 인기 코드 Top 5
SELECT
    code,
    total_redemptions,
    unique_users
FROM promo_code_stats
WHERE is_active = true
ORDER BY total_redemptions DESC
LIMIT 5;


-- 사용률 분석
SELECT
    code,
    max_uses,
    current_uses,
    CASE
        WHEN max_uses IS NULL THEN 'unlimited'
        ELSE ROUND((current_uses::DECIMAL / max_uses) * 100, 2) || '%'
    END AS usage_rate
FROM promo_code_stats
WHERE max_uses IS NOT NULL
ORDER BY usage_rate DESC;
```

### 4-4. 사용 내역 확인

```sql
-- 특정 코드의 최근 사용 내역 10개
SELECT
    code,
    applied_at,
    expires_at,
    platform,
    user_agent,
    ip_address
FROM promo_code_usage
WHERE code = 'TAROT2025'
ORDER BY applied_at DESC
LIMIT 10;


-- 오늘 사용된 코드 모두 보기
SELECT
    code,
    COUNT(*) AS usage_count,
    COUNT(DISTINCT device_id) AS unique_devices
FROM promo_code_usage
WHERE applied_at >= CURRENT_DATE
GROUP BY code
ORDER BY usage_count DESC;


-- 플랫폼별 사용 통계
SELECT
    platform,
    COUNT(*) AS total_uses,
    COUNT(DISTINCT code) AS unique_codes
FROM promo_code_usage
GROUP BY platform
ORDER BY total_uses DESC;
```

---

## 5. 문제 해결

### 5-1. SQL 실행 오류

**오류:** `relation "promo_codes" already exists`

**해결:**
```sql
-- 기존 테이블 삭제 후 재실행
DROP TABLE IF EXISTS promo_code_usage CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP VIEW IF EXISTS promo_code_stats CASCADE;
DROP FUNCTION IF EXISTS validate_promo_code CASCADE;
DROP FUNCTION IF EXISTS apply_promo_code CASCADE;
DROP FUNCTION IF EXISTS increment_promo_code_usage CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- 이후 전체 SQL 다시 실행
```

### 5-2. 앱에서 코드 적용 안 됨

**증상:** "유효하지 않은 코드입니다" 오류

**확인 사항:**
1. Supabase SQL이 정상 실행되었는지 확인
2. 코드가 대소문자 구분 없이 입력되는지 확인 (자동으로 대문자 변환됨)
3. 네트워크 연결 확인
4. 브라우저 콘솔에서 오류 메시지 확인

**디버깅:**
```javascript
// 개발자 도구 콘솔에서 실행
import { PromoService } from './services/promoService';

// 코드 검증
const result = await PromoService.validatePromoCode('TAROT2025');
console.log('검증 결과:', result);

// 코드 적용
const applyResult = await PromoService.applyPromoCode('TAROT2025');
console.log('적용 결과:', applyResult);
```

### 5-3. 중복 사용 방지 안 됨

**증상:** 같은 코드를 여러 번 사용할 수 있음

**확인:**
```sql
-- 디바이스 ID 중복 확인
SELECT device_id, COUNT(*) AS use_count
FROM promo_code_usage
WHERE code = 'TAROT2025'
GROUP BY device_id
HAVING COUNT(*) > 1;
```

**해결:**
- 디바이스 ID 생성 로직 확인
- `DEVICE_ID` AsyncStorage 키 확인
- 개발 환경에서 `PromoService.resetDeviceId()` 호출하여 초기화

### 5-4. RLS 정책 오류

**증상:** "new row violates row-level security policy"

**확인:**
```sql
-- RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('promo_codes', 'promo_code_usage');
```

**해결:**
- RLS 정책이 올바르게 설정되었는지 확인
- `apply_promo_code` 함수가 `SECURITY DEFINER`로 설정되었는지 확인

---

## 6. 고급 기능

### 6-1. 관리자 TypeScript API 사용 (추후)

```typescript
import { AdminPromoService } from './services/adminPromoService';

// 새 코드 생성
const newCode = await AdminPromoService.createPromoCode({
    code: 'SUMMER2025',
    description: '여름 특별 이벤트',
    freeDays: 14,
    maxUses: 500
});

// 대량 코드 생성
const bulkCodes = await AdminPromoService.createBulkPromoCodes({
    prefix: 'EVENT',
    count: 100,
    freeDays: 7,
    maxUses: 1, // 1회용 코드
    description: '이벤트 배포용 코드'
});

// 통계 조회
const stats = await AdminPromoService.getPromoCodeStats();
```

### 6-2. 자동 만료 처리

앱 시작 시 자동으로 만료된 프로모션 체크:

```typescript
import { PromoService } from './services/promoService';

// App.tsx 또는 적절한 위치에서 호출
useEffect(() => {
    PromoService.checkPromoStatus();
}, []);
```

---

## 7. 체크리스트

설치 완료 후 다음을 확인하세요:

- [ ] Supabase SQL 실행 성공
- [ ] `promo_codes` 테이블 생성 확인
- [ ] `promo_code_usage` 테이블 생성 확인
- [ ] 기존 4개 코드 자동 삽입 확인
- [ ] SQL 함수 테스트 성공
- [ ] 앱에서 코드 입력 테스트 성공
- [ ] 중복 사용 방지 테스트 성공
- [ ] 만료일 정상 설정 확인
- [ ] 프리미엄 상태 정상 활성화 확인

---

## 8. 다음 단계

✅ **완료된 것:**
1. Supabase 테이블 및 함수 생성
2. 클라이언트 코드 (promoService.v2.ts)
3. 관리자 API (adminPromoService.ts)

🚧 **추후 추가 가능:**
1. 관리자 대시보드 UI (React Admin Panel)
2. 코드 생성 자동화 (Cron Job)
3. 이메일/SMS 코드 발송 시스템
4. A/B 테스트 및 분석

---

**문제가 있으면 언제든지 물어보세요!** 🚀
