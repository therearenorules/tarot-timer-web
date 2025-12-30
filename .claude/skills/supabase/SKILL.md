---
name: supabase
description: Supabase 설정 및 연결 상태를 확인합니다. 클라이언트 설정, Edge Function URL, 인증 상태를 점검합니다.
allowed-tools: Read, Grep, Bash
---

# Supabase 연결 상태 확인

Supabase 설정 및 연결 상태를 확인합니다.

## 확인 대상 파일

1. `lib/supabase.ts` - 메인 클라이언트 설정
2. `utils/supabase.ts` - 유틸리티 함수
3. `utils/receiptValidator.ts` - Edge Function URL
4. `supabase/functions/` - Edge Functions

## 확인 명령어

```bash
# Supabase URL 설정 확인
grep -n "SUPABASE_URL" lib/supabase.ts utils/supabase.ts

# Edge Function 목록
ls supabase/functions/

# Edge Function URL 확인
grep -n "EDGE_FUNCTION_URL" utils/receiptValidator.ts

# 인증 설정 확인
grep -n "auth:" lib/supabase.ts
```

## 점검 항목

| 항목 | 확인 내용 |
|------|----------|
| URL | 하드코딩 vs 환경변수 |
| Anon Key | 하드코딩 vs 환경변수 |
| Auth | autoRefreshToken, persistSession |
| Edge Functions | health-check, verify-receipt |

## 보고 형식

| 설정 | 상태 | 값 |
|------|------|-----|
| SUPABASE_URL | ✅/❌ | https://xxx.supabase.co |
| SUPABASE_ANON_KEY | ✅/❌ | 설정됨/미설정 |
| Edge Function URL | ✅/❌ | /functions/v1/verify-receipt |
| 인증 설정 | ✅/❌ | AsyncStorage 사용 |

권장 조치사항이 있으면 함께 제공해주세요.
