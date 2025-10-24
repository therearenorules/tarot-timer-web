# 🚀 Tarot Timer - Quick Reference Guide

**빠른 참조 가이드** - Claude Code 세션 시작 시 즉시 확인할 핵심 정보

---

## 📋 현재 상태 (2025-10-24)

### 프로젝트 상태
```
✅ Production Ready
✅ iOS Build 79 (v1.0.9)
✅ Android Build 57
✅ 모든 핵심 시스템 안정화 완료
```

### 최신 커밋
```
7c8d9f4 - build: Build 79 - LocalStorageManager 메서드명 수정 배포
```

---

## 🔧 개발 환경 빠른 시작

### 개발 서버 실행
```bash
npm start
# 또는
npx expo start --port 8083
```

### 서버 상태 확인
```bash
netstat -an | findstr 8083
```

### Git 상태 확인
```bash
git status
git log --oneline -5
```

---

## 🏗️ 핵심 아키텍처

### 주요 컴포넌트 위치
```
App.tsx                          → 메인 진입점
components/ErrorBoundary.tsx     → 에러 처리
contexts/PremiumContext.tsx      → 구독 관리
contexts/NotificationContext.tsx → 알림 시스템
utils/adManager.ts               → 광고 시스템
utils/iapManager.ts              → 인앱 결제
hooks/useTimer.ts                → 타이머 로직
```

### 탭 컴포넌트
```
components/tabs/TimerTab.tsx    → 메인 타이머
components/tabs/SpreadTab.tsx   → 스프레드
components/tabs/DailyTab.tsx    → 일일 기록
components/tabs/SettingsTab.tsx → 설정
```

---

## 🐛 최근 해결된 주요 버그

### Build 79 (최신)
- LocalStorageManager 메서드명 수정

### Build 76
- 광고 시스템 크래시 수정
- 이메일 충돌 보고 시스템 추가

### Build 73
- 자동 충돌 보고서 전송 시스템

### Build 72
- AsyncStorage 크래시 로그 수집

### Build 68
- Stale Closure 문제 해결
- AppState 핸들러 최신 함수 참조 유지

### Build 60-64
- IAP/광고 초기화 안전성 강화
- AppState 핸들러 안전성 완성

### Build 57
- PremiumContext 크래시 방어

### Build 56
- Supabase 환경변수 누락 시 크래시 방지

---

## 🔐 환경 변수

### 설정된 변수
```bash
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ APPLE_SHARED_SECRET
✅ EXPO_PUBLIC_API_URL
```

### 확인 방법
```bash
eas secret:list
```

---

## 📱 빌드 명령어

### ⚠️ CRITICAL: 빌드 전 필수 확인
```
사용자의 명시적 요청 없이 빌드 명령어 실행 금지!
"빌드해줘" 또는 "빌드 시작해줘" 명시적 요청 시에만 실행
```

### iOS 빌드
```bash
# Production
eas build --platform ios --profile production

# Preview
eas build --platform ios --profile preview
```

### Android 빌드
```bash
# Production
eas build --platform android --profile production

# Preview
eas build --platform android --profile preview
```

### 빌드 상태 확인
```bash
eas build:list
```

---

## 🧪 테스트 체크리스트

### Expo Go 테스트
```
✅ 앱 실행 (크래시 없음)
✅ 타로 카드 뽑기
✅ 프리미엄 상태 전환
✅ 탭 네비게이션
⚠️ 광고: 네이티브 모듈 필요
⚠️ IAP: 테스트 불가능
```

### Development Build 필요
```
- 실제 AdMob 광고
- 구독 결제 플로우
- 영수증 검증
```

---

## 📊 코드 품질 현황

### TypeScript 오류
```
현재: 235개
우선순위: Medium (점진적 수정)
```

### 주요 시스템 안정성
```
✅ ErrorBoundary: 고도로 안정화
✅ PremiumContext: 안정화 완료
✅ AdManager: 크래시 방지 완료
✅ IAPManager: 보안 강화 완료
✅ Timer: 안정화 완료
```

---

## 🎯 우선순위 작업

### P0 (즉시)
```
없음 - Production Ready 상태
```

### P1 (단기)
```
1. TypeScript 오류 수정
2. Android 빌드 테스트
3. Development Build 테스트
```

### P2 (중기)
```
1. 성능 최적화
2. 추가 기능 구현
3. 사용자 피드백 반영
```

---

## 🚨 알려진 이슈

### 현재 알려진 이슈
```
없음 - 모든 크래시 해결됨
```

### 제한사항
```
- Expo Go: 네이티브 모듈 테스트 불가
- 웹: 일부 네이티브 기능 제한
- TypeScript 엄격 모드 미적용
```

---

## 🔍 디버깅 팁

### 크래시 로그 확인
```typescript
// AsyncStorage에서 크래시 로그 조회
await AsyncStorage.getItem('CRASH_LOGS')
```

### 콘솔 로그 패턴
```
🔴 에러 로그
✅ 성공 로그
⚠️ 경고 로그
🧪 테스트 로그
📱 플랫폼별 로그
```

### 주요 체크포인트
```typescript
// ErrorBoundary componentDidCatch
console.error('🔴 ErrorBoundary caught an error:', error);

// PremiumContext AppState 핸들러
console.log('🔄 포어그라운드 복귀 - 구독 상태 갱신');

// AdManager 광고 로드
console.log('📱 배너 광고 준비:', placement);
```

---

## 📚 주요 문서 위치

### 프로젝트 문서
```
.claude/CLAUDE.md              → 프로젝트 룰
.claude/PROJECT_STATUS.md      → 현황 보고서
.claude/QUICK_REFERENCE.md     → 본 문서
docs/2025-10-22-WORK-REPORT.md → 최근 작업 보고서
```

### 분석 보고서 (analysis/ 폴더)
```
00-comprehensive-analysis-summary.md    → 종합 요약
01-development-progress-report.md       → 개발 진행 현황
02-gaps-analysis-report.md             → 부족한 부분 분석
03-future-development-plan.md          → 향후 개발 계획
04-technical-recommendations-report.md → 기술적 권장사항
```

---

## 🔧 유용한 명령어

### 패키지 관리
```bash
npm list --depth=0           # 패키지 목록
npm outdated                 # 업데이트 가능 패키지
npm cache clean --force      # 캐시 정리
```

### Expo 관리
```bash
expo doctor                  # 건강 체크
expo r -c                    # 캐시 클리어 재시작
eas build:list               # 빌드 목록
eas secret:list              # 환경 변수 목록
```

### Git 관리
```bash
git log --oneline --graph -10  # 커밋 히스토리
git diff                      # 변경사항 확인
git stash                     # 임시 저장
git stash pop                 # 임시 저장 복원
```

---

## 🎨 디자인 시스템

### 색상 팔레트
```typescript
Primary: '#7b2cbf'     // 보라
Secondary: '#f4d03f'   // 골드
Accent: '#d4b8ff'      // 라이트 퍼플
Background: '#1a1625'  // 다크 퍼플
Surface: '#2d1b47'     // 미드 퍼플
```

### 주요 컴포넌트
```
Logo.tsx              → 브랜드 로고
SacredGeometryBackground.tsx → 배경 패턴
GradientButton.tsx    → 그라데이션 버튼
TarotCard.tsx         → 타로 카드
```

---

## 📞 빠른 문의

### GitHub Issues
```
https://github.com/therearenorules/tarot-timer-web/issues
```

### EAS 프로젝트
```
Project ID: 268f44c1-406f-4387-8589-e62144024eaa
```

### Play Store
```
https://play.google.com/store/apps/details?id=com.tarottimer.app
```

---

## 🎓 배운 교훈 요약

### 1. 안정성이 최우선
- Stale Closure 주의
- AppState 핸들러 안전성
- 다중 방어 시스템

### 2. 에러 처리 중요
- AsyncStorage 로그 수집
- 자동 충돌 보고
- 이메일 전송 시스템

### 3. 환경 변수 관리
- EAS Secret 활용
- 플랫폼별 분리
- 빌드 시 자동 주입

### 4. Expo Go 제한
- 네이티브 모듈 불가
- 조건부 import 필요
- Development Build 필수

---

**마지막 업데이트**: 2025-10-24
**버전**: v1.0.9 (Build 79)
**상태**: 🟢 Production Ready
