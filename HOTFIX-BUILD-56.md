# 🔴 CRITICAL HOTFIX - Build 56

## 문제 상황
- **증상**: TestFlight 빌드에서 앱 실행 즉시 크래시 발생
- **ErrorBoundary**: 작동하지만 상세 오류 메시지 표시 안됨
- **Expo Go**: 정상 작동 (환경변수가 로컬에 있음)
- **TestFlight**: 크래시 (환경변수가 빌드에 포함되지 않음)

## 근본 원인
1. **Supabase 환경변수 누락**: `app.json`에 `supabaseUrl`, `supabaseAnonKey` 미설정
2. **null 참조 크래시**: `lib/supabase.ts`에서 환경변수 없으면 `supabase = null` 반환
3. **AuthContext 크래시**: null인 supabase를 사용하려다 크래시 발생

## 수정 내역 (Build 56)

### 1. lib/supabase.ts - CRITICAL FIX
**변경 전**:
```typescript
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, { ... })
  : null; // ❌ null 반환 → AuthContext 크래시
```

**변경 후**:
```typescript
// 환경변수 누락 시 더미 URL/키로 클라이언트 생성 (크래시 방지)
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const finalUrl = supabaseUrl || FALLBACK_URL;
const finalKey = supabaseKey || FALLBACK_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 CRITICAL: Supabase 환경변수가 설정되지 않았습니다!');
  console.error('📌 앱은 오프라인 모드로 실행됩니다.');
}

// Supabase 클라이언트 항상 생성 (null 반환 방지)
export const supabase: SupabaseClient = createClient(finalUrl, finalKey, { ... });
```

### 2. contexts/AuthContext.tsx - 안전성 강화
```typescript
// ✅ CRITICAL FIX: Supabase가 사용 불가능하면 초기화 건너뛰기
if (!isSupabaseAvailable()) {
  console.error('🔴 CRITICAL: Supabase 환경변수가 설정되지 않았습니다!');
  console.log('📌 오프라인 모드로 실행 - 인증 기능 비활성화');
  if (isMounted) {
    setAuthState(prev => ({ ...prev, isLoading: false, initialized: true }));
  }
  return;
}
```

### 3. app.json - 환경변수 추가
```json
"extra": {
  "EXPO_PUBLIC_API_URL": "https://api.tarottimer.app",
  "APPLE_SHARED_SECRET": "${APPLE_SHARED_SECRET}",
  "supabaseUrl": "${SUPABASE_URL}",
  "supabaseAnonKey": "${SUPABASE_ANON_KEY}",
  "eas": {
    "projectId": "268f44c1-406f-4387-8589-e62144024eaa"
  }
}
```

### 4. 인증 함수 추가
- `signInWithEmail()`
- `signUpWithEmail()`
- `signOut()`
- `resetPassword()`
- `updateProfile()`

모두 `isSupabaseAvailable()` 체크 포함

## 빌드 전 필수 작업

### EAS Secret 설정 (중요!)
```bash
# Supabase URL 설정 (실제 값으로 교체 필요)
eas secret:create --scope project --name SUPABASE_URL --value "https://your-project.supabase.co"

# Supabase Anon Key 설정 (실제 값으로 교체 필요)
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-anon-key-here"

# 확인
eas env:list
```

## 테스트 시나리오

### 로컬 테스트
```bash
# 1. 개발 서버 시작
npm start

# 2. 브라우저에서 확인
# http://localhost:8090

# 3. 콘솔 로그 확인
# - "🔴 CRITICAL: Supabase 환경변수가 설정되지 않았습니다!" 표시되어야 함
# - 앱은 정상 작동해야 함 (오프라인 모드)
```

### TestFlight 빌드 후 확인 사항
1. ✅ 앱이 크래시 없이 실행됨
2. ✅ ErrorBoundary가 표시되지 않음
3. ✅ 타이머 탭이 정상 작동
4. ✅ 오프라인 모드 메시지 확인 가능

## 빌드 명령어
```bash
# iOS 빌드
eas build --platform ios --profile production

# 빌드 상태 확인
eas build:list
```

## 향후 작업
1. **실제 Supabase 프로젝트 생성**
   - https://supabase.com 에서 프로젝트 생성
   - URL과 Anon Key 확보

2. **EAS Secret 업데이트**
   - 실제 Supabase 값으로 교체

3. **인증 UI 구현**
   - 로그인/회원가입 화면
   - 프로필 관리

## 체크리스트
- [x] lib/supabase.ts 수정 (null 방지)
- [x] AuthContext.tsx 안전성 강화
- [x] app.json 환경변수 추가
- [x] 인증 함수 추가
- [x] 빌드 번호 증가 (55 → 56)
- [ ] EAS Secret 설정 (실제 Supabase 값)
- [ ] TestFlight 빌드
- [ ] 크래시 해결 확인

---

**작성일**: 2025-10-23
**빌드 버전**: iOS 56 / Android 56
**심각도**: 🔴 CRITICAL
**예상 소요 시간**: 빌드 20분 + TestFlight 검토 1시간
