# 🚀 타로 타이머 배포 가이드

## 📋 개요
이 문서는 타로 타이머 앱의 전체 배포 프로세스를 다룹니다. 개발부터 프로덕션까지의 완전한 워크플로우를 제공합니다.

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│  (Vercel)       │    │ (Railway/Heroku)│    │  (Supabase)     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React Native  │────│ • Node.js       │────│ • PostgreSQL    │
│ • Expo Web      │    │ • Express.js    │    │ • Realtime      │
│ • PWA           │    │ • TypeScript    │    │ • Auth          │
│ • i18n (5개언어)│    │ • WebSocket     │    │ • Row Level     │
│ • Service Worker│    │ • Redis Cache   │    │   Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 사전 준비 사항

### 필수 요구사항
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **Git**: 최신 버전
- **Expo CLI**: 최신 버전

### 외부 서비스 계정
- **Vercel**: 프론트엔드 배포
- **Railway** 또는 **Heroku**: 백엔드 배포
- **Supabase**: 데이터베이스 및 실시간 기능
- **GitHub**: 소스 코드 관리 및 CI/CD

## 📦 1단계: 로컬 환경 설정

### 1.1 저장소 클론
```bash
git clone https://github.com/your-username/tarot-timer-web.git
cd tarot-timer-web
```

### 1.2 의존성 설치
```bash
# Frontend 의존성
npm install

# Backend 의존성
cd backend
npm install
cd ..
```

### 1.3 환경 변수 설정
```bash
# 환경 변수 파일 생성
cp .env.example .env
cp backend/.env.example backend/.env

# .env 파일들을 편집하여 실제 값으로 설정
```

### 1.4 로컬 개발 서버 실행
```bash
# Backend 서버 시작 (터미널 1)
cd backend && npm run dev

# Frontend 서버 시작 (터미널 2)
npx expo start --web --port 8082

# 모바일 테스트 서버 (터미널 3)
npx expo start --tunnel
```

## 🗄️ 2단계: Supabase 데이터베이스 설정

### 2.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. 데이터베이스 비밀번호 설정

### 2.2 테이블 생성
```sql
-- Users 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Sessions 테이블
CREATE TABLE daily_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_date DATE NOT NULL,
  timer_duration INTEGER,
  cards_drawn JSONB,
  journal_entry TEXT,
  mood VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarot Spreads 테이블
CREATE TABLE tarot_spreads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  spread_type VARCHAR(100),
  cards JSONB,
  interpretation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Row Level Security 설정
```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_spreads ENABLE ROW LEVEL SECURITY;

-- 정책 설정
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own sessions" ON daily_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own spreads" ON tarot_spreads
  FOR ALL USING (auth.uid() = user_id);
```

### 2.4 실시간 구독 설정
```sql
-- 실시간 구독 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE daily_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE tarot_spreads;
```

## 🌐 3단계: 프론트엔드 배포 (Vercel)

### 3.1 Vercel 계정 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login
```

### 3.2 프로젝트 연결
```bash
# 프로젝트 초기화
vercel

# 환경 변수 설정
vercel env add EXPO_PUBLIC_API_URL
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 3.3 자동 배포 설정
1. Vercel 대시보드에서 프로젝트 선택
2. Settings > Git 연결
3. GitHub 저장소 연결
4. 자동 배포 활성화

### 3.4 도메인 설정
```bash
# 커스텀 도메인 추가
vercel domains add your-domain.com

# SSL 인증서 자동 설정됨
```

## 🔧 4단계: 백엔드 배포 (Railway/Heroku)

### 4.1 Railway 배포 (추천)
```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 생성 및 배포
cd backend
railway init
railway up
```

### 4.2 환경 변수 설정
```bash
# Railway 환경 변수 설정
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your-supabase-db-url
railway variables set JWT_SECRET=your-jwt-secret
railway variables set REDIS_URL=your-redis-url
```

### 4.3 Heroku 배포 (대안)
```bash
# Heroku CLI 설치 후
cd backend
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your-supabase-db-url
git push heroku main
```

## ⚙️ 5단계: CI/CD 파이프라인 설정

### 5.1 GitHub Secrets 설정
GitHub 저장소의 Settings > Secrets에서 다음 추가:

```
# Vercel 배포
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id

# Railway 배포
RAILWAY_TOKEN=your-railway-token

# 환경 변수
EXPO_PUBLIC_API_URL=https://your-backend.railway.app/api
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5.2 자동 배포 확인
1. `main` 브랜치에 커밋 푸시
2. GitHub Actions 워크플로우 실행 확인
3. Vercel과 Railway 배포 상태 확인

## 🔒 6단계: 보안 및 성능 최적화

### 6.1 보안 헤더 설정
```javascript
// vercel.json에 이미 설정됨
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}
      ]
    }
  ]
}
```

### 6.2 성능 모니터링 설정
```bash
# Lighthouse CI 설정 (이미 구성됨)
npm install -g @lhci/cli

# 성능 측정
lhci autorun
```

### 6.3 캐싱 전략 확인
- **Static 파일**: 1년 캐싱
- **Service Worker**: 캐싱 비활성화
- **API 응답**: Redis 캐싱
- **이미지**: CDN 캐싱

## 📱 7단계: PWA 및 모바일 최적화

### 7.1 PWA 아이콘 생성
```bash
# PWA 아이콘 생성 (이미 구성됨)
node scripts/generate-pwa-icons.js
```

### 7.2 Service Worker 등록 확인
- 브라우저 DevTools > Application > Service Workers
- 오프라인 기능 테스트
- 설치 프롬프트 테스트

### 7.3 모바일 테스트
- **Expo Go**: QR 코드로 테스트
- **PWA 설치**: 다양한 브라우저에서 테스트
- **오프라인 모드**: 네트워크 차단 후 테스트

## 🌍 8단계: 다국어 지원 확인

### 8.1 언어 파일 완성도 확인
```bash
# 번역 파일 위치
i18n/locales/ko.json  # 한국어 (기본)
i18n/locales/en.json  # 영어
i18n/locales/ja.json  # 일본어 (추가 작업 필요)

```

### 8.2 언어 전환 테스트
1. 언어 선택기에서 각 언어 선택
2. UI 텍스트 번역 확인
3. 날짜/시간 형식 확인
4. RTL 지원 (아랍어 등 추가 시)

## 📊 9단계: 모니터링 및 분석

### 9.1 성능 모니터링 확인
```bash
# 성능 대시보드 접속
curl https://your-backend.railway.app/api/performance/dashboard
```

### 9.2 분석 데이터 확인
- 사용자 세션 추적
- 페이지 뷰 분석
- 에러 추적
- A/B 테스트 결과

### 9.3 헬스 체크 설정
```bash
# 프론트엔드 헬스 체크
curl https://your-domain.vercel.app/

# 백엔드 헬스 체크
curl https://your-backend.railway.app/health

# 데이터베이스 헬스 체크
curl https://your-backend.railway.app/api/health
```

## 🚀 10단계: 프로덕션 런칭

### 10.1 최종 체크리스트
- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 스키마 최신화
- [ ] 보안 헤더 적용
- [ ] PWA 기능 정상 작동
- [ ] 다국어 지원 테스트 완료
- [ ] 성능 모니터링 활성화
- [ ] CI/CD 파이프라인 정상 작동
- [ ] 도메인 및 SSL 설정 완료

### 10.2 런칭 후 모니터링
```bash
# 실시간 로그 확인
railway logs

# Vercel 배포 로그 확인
vercel logs

# 성능 메트릭 확인
curl https://your-backend.railway.app/api/performance/metrics
```

### 10.3 사용자 피드백 수집
- PWA 설치율 모니터링
- 언어별 사용 통계 확인
- 성능 이슈 트래킹
- 사용자 만족도 조사

## 🔧 문제 해결 가이드

### 일반적인 문제들

#### 1. 환경 변수 오류
```bash
# 환경 변수 확인
vercel env ls
railway variables

# 로컬에서 테스트
npm run build && npm run start
```

#### 2. CORS 오류
```javascript
// backend/src/index.ts에서 CORS 설정 확인
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:8082',
  credentials: true
}));
```

#### 3. PWA 설치 오류
```bash
# HTTPS 확인 필요
# Service Worker 등록 확인
# Manifest.json 유효성 검사
```

#### 4. 성능 이슈
```bash
# 번들 사이즈 분석
npx expo export:web --analyze

# 캐시 상태 확인
curl https://your-backend.railway.app/api/cache/status
```

## 📚 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Supabase 문서](https://supabase.com/docs)
- [Expo 문서](https://docs.expo.dev)
- [React Native Web](https://necolas.github.io/react-native-web)

## 🎉 축하합니다!

타로 타이머 앱이 성공적으로 배포되었습니다! 🔮✨

- **Frontend**: https://your-domain.vercel.app
- **Backend**: https://your-backend.railway.app
- **성능 대시보드**: https://your-backend.railway.app/api/performance/dashboard
- **PWA**: 모바일에서 홈 화면에 추가 가능

---

**마지막 업데이트**: 2025-09-14
**버전**: 1.0.0
**지원**: threebooks@tarot-timer.com