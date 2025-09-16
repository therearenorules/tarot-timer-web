# 🔮 타로 타이머 - Supabase 설정 가이드

## 📋 완료된 작업

✅ **Supabase 클라이언트 라이브러리 설치**
✅ **환경 변수 파일 준비** (.env, .env.example)
✅ **Supabase 유틸리티 함수 생성** (utils/supabase.ts)
✅ **인증 컨텍스트 Supabase 연동** (contexts/AuthContext.tsx)
✅ **데이터베이스 스키마 설계** (supabase/schema.sql)

---

## 🚀 다음 단계: Supabase 프로젝트 설정

### 1. Supabase 웹 콘솔에서 프로젝트 생성

1. **https://supabase.com** 접속
2. **"New Project" 클릭**
3. **프로젝트 정보 입력**:
   - Project name: `tarot-timer-web`
   - Database password: **강력한 패스워드 생성** (기록 필수)
   - Region: `Northeast Asia (ap-northeast-1)` 또는 가장 가까운 지역

### 2. API 키 및 URL 확인

프로젝트 생성 완료 후:

1. **Dashboard > Settings > API** 이동
2. 다음 정보 복사:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public 키**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 환경 변수 설정

`.env` 파일에서 다음 값들을 교체:

```env
# 실제 Supabase 정보로 교체
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 데이터베이스 스키마 생성

1. **Supabase Dashboard > SQL Editor** 이동
2. **"New query" 클릭**
3. `supabase/schema.sql` 파일 내용 전체 복사 & 붙여넣기
4. **"Run" 버튼 클릭**

이렇게 하면 다음 테이블들이 생성됩니다:
- `profiles` (사용자 프로필)
- `tarot_sessions` (타로 세션)
- `journal_entries` (저널 엔트리)
- `user_card_collections` (카드 컬렉션)
- `notification_settings` (알림 설정)
- `usage_statistics` (사용 통계)

### 5. 인증 설정

1. **Dashboard > Authentication > Settings** 이동
2. **Site URL 설정**:
   - `http://localhost:8083` (개발용)
   - 나중에 실제 도메인으로 변경
3. **Email Templates 확인** (필요시 커스터마이징)

---

## 🔧 설정 완료 후 테스트

### 1. 개발 서버 재시작

```bash
# 현재 서버 종료 후
npx expo start --port 8083
```

### 2. 연결 테스트

브라우저에서 `http://localhost:8083` 접속 후:
- 콘솔에서 Supabase 연결 관련 오류 확인
- 인증 UI가 정상적으로 로드되는지 확인

### 3. 회원가입/로그인 테스트

1. **회원가입 시도**
2. **이메일 확인** (Supabase에서 발송)
3. **로그인 테스트**
4. **프로필 정보 확인**

---

## 📊 데이터베이스 구조

### 핵심 테이블 설명

- **`profiles`**: 사용자 기본 정보 (Supabase Auth 확장)
- **`tarot_sessions`**: 타로 세션 데이터 (카드, 노트, 지속시간)
- **`journal_entries`**: 사용자 저널 및 일기
- **`user_card_collections`**: 개인화된 카드 컬렉션
- **`notification_settings`**: 알림 설정
- **`usage_statistics`**: 앱 사용 통계

### 보안 특징

- **Row Level Security (RLS)** 활성화
- **사용자별 데이터 격리** 보장
- **자동 프로필 생성** (회원가입 시)
- **실시간 구독** 지원

---

## 🛠 문제 해결

### 일반적인 오류들

1. **"Invalid API key"**
   - `.env` 파일의 API 키 확인
   - 개발 서버 재시작

2. **"Row Level Security 정책 오류"**
   - 스키마 SQL이 완전히 실행되었는지 확인
   - 테이블별 RLS 정책 확인

3. **"프로필 생성 실패"**
   - `handle_new_user()` 함수 실행 확인
   - 트리거 설정 확인

### 디버깅 도구

```javascript
// 연결 상태 확인
import { checkConnection } from './utils/supabase';
const isConnected = await checkConnection();
console.log('Supabase 연결:', isConnected);

// 현재 사용자 확인
import { getCurrentUser } from './utils/supabase';
const user = await getCurrentUser();
console.log('현재 사용자:', user);
```

---

## 📈 다음 단계 (설정 완료 후)

1. **인증 UI 컴포넌트 생성**
2. **타로 세션 데이터 연동**
3. **저널 기능 Supabase 연결**
4. **실시간 동기화 구현**
5. **푸시 알림 연동**

---

## 📝 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [React Native 가이드](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**🔮 설정이 완료되면 타로 타이머가 클라우드 기반으로 업그레이드됩니다!**