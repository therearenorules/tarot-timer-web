# 🔄 다른 환경에서 프로젝트 작업 재개 가이드

**프로젝트**: 타로 타이머 웹앱 (React Native + Expo)
**마지막 업데이트**: 2025-09-24
**현재 완성도**: 96%

## 📋 프로젝트 개요

### 핵심 기능
- ✅ **24시간 타로 카드 시스템** (자정 리셋)
- ✅ **고급 알림 시스템** (조용한 시간 완전 비활성화)
- ✅ **완전한 다국어 지원** (한국어/영어/일본어)
- ✅ **웹/모바일 크로스 플랫폼** 지원
- ✅ **SVG 아이콘 시스템** (25개+ 아이콘)
- ✅ **미스틱 UI/UX 디자인** (보라/골드 테마)

### 기술 스택
```
Frontend: React Native + Expo 54.0.8
Language: TypeScript
UI: 커스텀 미스틱 디자인 시스템
Font: Noto Sans KR
Icons: 커스텀 SVG 컴포넌트
i18n: react-i18next (한/영/일)
Storage: AsyncStorage (로컬)
Testing: Expo Go (모바일) + 웹 브라우저
```

## 🚀 새로운 환경에서 시작하기

### 1. 저장소 클론
```bash
git clone https://github.com/therearenorules/tarot-timer-web.git
cd tarot-timer-web
git checkout threebooks
```

### 2. 의존성 설치
```bash
# Node.js 18+ 필요
npm install

# iOS 시뮬레이터용 (macOS만)
npx pod-install ios
```

### 3. 개발 서버 실행
```bash
# Expo 개발 서버 시작 (포트 8083)
npx expo start --port 8083 --clear

# 또는 npm script 사용
npm run dev
```

### 4. 테스트 환경
```bash
# 웹 브라우저에서 테스트
open http://localhost:8083

# 모바일 테스트 (Expo Go 앱 필요)
# QR 코드 스캔하여 테스트
```

## 📊 현재 작업 상태 (2025-09-24 기준)

### ✅ 완료된 주요 기능
1. **알림 시스템 완성** (100%)
   - 조용한 시간 완전 비활성화 기능
   - 웹/모바일 환경 분리 (Platform.OS 기반)
   - NotificationContext.web.tsx 웹 시뮬레이션

2. **다국어 지원 완성** (98%)
   - 한국어/영어/일본어 번역 완료
   - 78개 새로운 번역 키 추가
   - 하드코딩 텍스트 완전 제거

3. **크로스 플랫폼 지원** (95%)
   - 웹 환경 완전 호환
   - react-native-svg-web 적용
   - Metro 번들러 최적화

### 🔄 진행 중인 작업
- **App Store 제출 준비**: 95% 완료
- **프리미엄 기능**: 75% 완료
- **백엔드 연동**: Supabase 연동 대기

## 📁 주요 파일 구조

```
tarot-timer-web/
├── analysis/                    # 📊 프로젝트 분석 보고서 (5개 파일)
├── components/                  # 🧩 React Native 컴포넌트
│   ├── Icon.tsx                 # SVG 아이콘 시스템
│   ├── tabs/                    # 4개 메인 탭
│   └── DesignSystem.tsx         # 미스틱 디자인 시스템
├── contexts/                    # 🔄 상태 관리
│   ├── NotificationContext.tsx  # 모바일 알림
│   ├── NotificationContext.web.tsx # 웹 알림 시뮬레이션
│   └── TarotContext.tsx         # 타로 카드 상태
├── i18n/                        # 🌐 다국어 지원
│   └── locales/                 # ko.json, en.json, ja.json
├── utils/                       # 🔧 유틸리티
└── App.tsx                      # 메인 앱 진입점
```

## 🔧 개발 환경 설정

### Claude Code 프로젝트 규칙
프로젝트 루트에 `.claude/CLAUDE.md` 파일에 상세한 개발 규칙이 정의되어 있습니다:

1. **오류 해결 우선순위**: 기능 제거보다 호환성 개선 우선
2. **기술 스택 보존**: SVG 아이콘, 미스틱 UI 디자인 유지
3. **분석 보고서 시스템**: analysis/ 폴더의 5개 핵심 보고서 활용

### 포트 설정
- **메인 앱**: 8083 (Expo 개발 서버)
- **관리자 대시보드**: 3005 (별도 프로젝트)
- **백엔드 API**: 3004 (Supabase 연동)

## 📱 테스트 방법

### 웹 테스트
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 확인
open http://localhost:8083
```

### 모바일 테스트
1. 스마트폰에 Expo Go 앱 설치
2. 터미널의 QR 코드 스캔
3. 실시간 Hot Reload 확인

### 주요 테스트 항목
- ✅ 폰트 로딩 (Noto Sans KR)
- ✅ SVG 아이콘 렌더링
- ✅ 다국어 전환 (설정 탭에서)
- ✅ 알림 권한 및 테스트 알림
- ✅ 타로 카드 뽑기 및 자정 리셋
- ✅ 다이어리 기록 저장/삭제

## 🚨 알려진 이슈 및 해결방법

### Metro 캐시 이슈
```bash
# 캐시 클리어 후 재시작
npx expo start --clear --port 8083
```

### 웹 알림 테스트
```javascript
// 웹 환경에서는 NotificationContext.web.tsx 사용
// 실제 알림 대신 시뮬레이션 모드로 동작
```

### iOS 빌드 이슈
```bash
# iOS 시뮬레이터에서 테스트 시
npx expo run:ios
```

## 📈 다음 단계 우선순위

### 1. 즉시 처리 필요 (High Priority)
- [ ] **App Store 제출 완료**: iPad 스크린샷 13개 촬영 필요
- [ ] **프리미엄 기능 완성**: 결제 연동 25% 남음

### 2. 중기 계획 (Medium Priority)
- [ ] **Supabase 백엔드 연동**: 클라우드 데이터 저장
- [ ] **사용자 인증 시스템**: 프로필 관리
- [ ] **성능 최적화**: 로딩 시간 1.5초 이하

### 3. 장기 계획 (Low Priority)
- [ ] **Android 앱 출시**: Google Play Store
- [ ] **프리미엄 콘텐츠 확장**: 추가 타로 덱
- [ ] **소셜 기능**: 커뮤니티 및 공유

## 💡 개발 팁

### 디버깅 방법
프로젝트에는 체계적인 디버깅 파일들이 포함되어 있습니다:
```
App.minimal.tsx    # 최소 기능 테스트
App.step1.tsx      # 폰트 테스트
App.step2.tsx      # i18n 테스트
App.step3.tsx      # SVG 아이콘 테스트
App.step4.tsx      # Context Provider 테스트
```

### 분석 보고서 활용
`analysis/` 폴더의 5개 보고서를 정기적으로 확인:
- `00-comprehensive-analysis-summary.md`: 종합 현황
- `01-development-progress-report.md`: 개발 진행 상황
- `02-gaps-analysis-report.md`: 부족한 부분 분석
- `03-future-development-plan.md`: 향후 계획
- `04-technical-recommendations-report.md`: 기술 권장사항

## 🔗 관련 링크

- **GitHub 저장소**: https://github.com/therearenorules/tarot-timer-web
- **활성 브랜치**: `threebooks`
- **Expo 프로젝트**: @threebooks/tarot-timer
- **관리자 대시보드**: 별도 저장소 (tarot-admin-dashboard)

---

**📝 마지막 업데이트**: 2025-09-24 22:53 KST
**📊 완성도**: 96% (알림 시스템 완성)
**🚀 다음 마일스톤**: App Store 제출 및 출시 준비