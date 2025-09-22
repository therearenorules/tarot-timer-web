# Supabase 관리자 인프라 설정 가이드

## 🎯 개요

타로 타이머 웹앱의 **로컬 우선 아키텍처**에서 Supabase는 다음 용도로만 사용됩니다:

1. **익명 분석 데이터 수집** - 사용자 개인정보 없는 통계
2. **관리자 대시보드** - 앱 사용 현황 모니터링
3. **미래 커뮤니티 기능** - 게시판, 카드 해석 공유 등

> ⚠️ **중요**: 사용자의 개인 데이터(타로 세션, 저널 등)는 **절대 Supabase에 저장되지 않습니다**. 모든 개인 데이터는 사용자 디바이스에만 로컬 저장됩니다.

## 🏗️ 아키텍처 구조

```
사용자 데이터 (로컬 저장)          관리자/커뮤니티 데이터 (Supabase)
├── 타로 세션                    ├── 익명 분석 이벤트
├── 저널 엔트리                  ├── 앱 사용 통계
├── 사용자 설정                  ├── 오류 로그
├── 프리미엄 상태                ├── 사용자 피드백
└── 개인 분석 데이터              ├── 커뮤니티 게시글 (미래)
                                └── 카드 해석 DB (미래)
```

## 📋 Supabase 프로젝트 설정

### 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. 프로젝트 이름: `tarot-timer-admin`
3. 데이터베이스 비밀번호 설정
4. 리전 선택: `Northeast Asia (Seoul)` 권장

### 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수 추가:

```env
# Supabase 관리자 설정 (선택사항)
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SUPABASE_SERVICE_KEY=your-service-role-key
EXPO_PUBLIC_ADMIN_KEY=your-admin-secret-key

# 개발 환경에서는 설정하지 않아도 앱이 정상 동작함
```

### 3. 데이터베이스 스키마 설정

Supabase SQL 에디터에서 다음 파일을 실행:

```sql
-- 파일: supabase/admin-schema.sql 실행
```

이 스키마는 다음을 포함합니다:
- 익명 분석 데이터 테이블
- 관리자 전용 테이블
- 미래 커뮤니티 기능 테이블
- Row Level Security 정책
- 성능 최적화 인덱스

## 🔐 보안 설정

### Row Level Security (RLS) 정책

1. **익명 분석 데이터**: 서비스 키로만 접근 가능
2. **피드백 데이터**: 익명 삽입 허용, 조회는 관리자만
3. **커뮤니티 데이터**: 승인된 게시글만 공개 조회 가능

### 환경별 보안 수준

- **개발 환경**: Supabase 없이도 정상 동작
- **운영 환경**: 서비스 키 필수, 관리자 인증 강화 필요

## 📊 데이터 수집 흐름

### 익명 분석 데이터 수집

```typescript
// 1. 로컬에서 이벤트 수집
AnalyticsManager.trackEvent('tarot_session_complete', {
  spread_type: 'three_card',
  session_duration_minutes: 15
});

// 2. 배치로 Supabase 동기화 (선택적)
syncAnalyticsToSupabase(); // 관리자 대시보드에서 실행
```

### 데이터 익명화 프로세스

1. **세션 ID**: 해시화하여 개인 식별 불가
2. **이벤트 ID**: 해시화하여 개인 식별 불가
3. **디바이스 정보**: IP 주소, 디바이스 ID 제거
4. **개인정보**: 이름, 이메일 등 절대 수집 안함

## 🎛️ 관리자 대시보드 기능

### 로컬 분석 (항상 사용 가능)

- 앱 사용 통계
- 세션 패턴 분석
- 인기 카드/스프레드
- 기능 사용 현황

### Supabase 통합 분석 (선택적)

- 여러 디바이스 통합 통계
- 장기간 트렌드 분석
- 오류 발생 패턴
- 사용자 피드백 분석

## 🔮 미래 커뮤니티 기능

### 계획된 기능들

1. **타로 커뮤니티 게시판**
   - 경험 공유
   - 질문과 답변
   - 카드 해석 토론

2. **카드 해석 데이터베이스**
   - 커뮤니티 기여 해석
   - 다양한 관점의 해석
   - 투표 기반 품질 관리

3. **익명 토론 시스템**
   - 닉네임 기반 참여
   - 개인정보 보호 우선
   - 관리자 승인 시스템

## 🚀 배포 설정

### Vercel 환경 변수

Vercel 대시보드에서 다음 환경 변수 설정:

```env
EXPO_PUBLIC_SUPABASE_URL=your-production-url
EXPO_PUBLIC_SUPABASE_SERVICE_KEY=your-service-key
EXPO_PUBLIC_ADMIN_KEY=your-strong-admin-key
```

### 운영 환경 보안 강화

1. **관리자 키**: 강력한 랜덤 키 사용
2. **IP 제한**: 관리자 접근 IP 화이트리스트
3. **HTTPS 강제**: 모든 통신 암호화
4. **정기 키 교체**: 보안 키 정기적 변경

## 📈 모니터링 및 분석

### 성능 모니터링

- Supabase 대시보드에서 쿼리 성능 모니터링
- 느린 쿼리 최적화
- 인덱스 성능 검토

### 데이터 관리

- 30일 이상 된 분석 데이터 자동 정리
- 스토리지 사용량 모니터링
- 백업 정책 수립

## 🛠️ 트러블슈팅

### 일반적인 문제들

1. **Supabase 연결 실패**
   - 환경 변수 확인
   - 네트워크 연결 상태 확인
   - 앱은 로컬 모드로 계속 동작

2. **RLS 정책 오류**
   - 서비스 키 권한 확인
   - 정책 설정 재검토

3. **성능 이슈**
   - 인덱스 추가 필요
   - 쿼리 최적화 검토

### 디버깅 팁

```typescript
// 관리자 기능 테스트
import { isAdmin, syncAnalyticsToSupabase } from './utils/adminSupabase';

console.log('관리자 권한:', await isAdmin());
console.log('동기화 결과:', await syncAnalyticsToSupabase());
```

## 📋 체크리스트

### 초기 설정

- [ ] Supabase 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] admin-schema.sql 실행
- [ ] RLS 정책 확인
- [ ] 관리자 키 설정

### 배포 전 확인

- [ ] 운영 환경 변수 설정
- [ ] 보안 설정 검토
- [ ] 성능 테스트 완료
- [ ] 백업 정책 수립
- [ ] 모니터링 설정

### 정기 점검

- [ ] 데이터 정리 상태 확인
- [ ] 보안 키 교체
- [ ] 성능 지표 검토
- [ ] 사용자 피드백 검토

---

## 📞 지원 및 문의

이 설정에 문제가 있거나 추가 기능이 필요한 경우:

1. GitHub Issues에 문제 보고
2. 관리자 대시보드에서 피드백 전송
3. 개발 문서 확인

**중요**: 사용자 개인정보와 관련된 문제는 즉시 보고해 주시기 바랍니다.