# 🔮 Tarot Timer - Learn Card Meanings

React Native + Expo 기반의 24시간 타로 카드 학습 애플리케이션

[![Status](https://img.shields.io/badge/Status-95%25%20Complete-brightgreen.svg)](https://github.com/therearenorules/tarot-timer-web)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-blue.svg)](https://expo.dev)
[![Build](https://img.shields.io/badge/Build-16%20%7C%20TestFlight-success.svg)](https://expo.dev)
[![App Store](https://img.shields.io/badge/App%20Store-Ready%20to%20Submit-orange.svg)](#app-store-제출-준비)

## ✨ 주요 기능

### 🎯 완성된 기능들 (Build 16)
- **⏰ 24시간 타로 타이머**: 매 시간마다 다른 타로카드 with AsyncStorage 지속성
- **🎨 미스틱 UI 디자인**: 보라/골드 테마의 고품질 디자인 시스템
- **🔮 SVG 아이콘 시스템**: 25개+ 벡터 아이콘 (완전 크로스 플랫폼)
- **🏛️ 브랜드 로고**: 3장의 타로카드와 신비로운 요소
- **🌙 배경 패턴**: 신성한 기하학 패턴 텍스처
- **💫 그라데이션 버튼**: Primary/Secondary 스타일
- **💎 타로카드 컴포넌트**: 골드 테두리와 그림자 효과
- **📱 반응형 디자인**: 모바일 최적화 인터페이스
- **🌍 다국어 지원**: 한국어, 영어, 일본어 (i18next)
- **🔔 알림 시스템**: TestFlight 호환 완료
- **🏪 App Store 준비**: 제출 가이드 및 개인정보 처리방침 완료

### 🚧 개발 중인 기능들
- **🃏 스프레드 탭**: 다양한 타로 스프레드 레이아웃
- **📖 저널 탭**: 일일 타로 리딩 기록
- **⚙️ 설정 탭**: 테마, 알림, 언어 설정 고도화

## 🚀 빠른 시작

### 개발 서버 시작
```bash
# 의존성 설치
npm install

# 개발 서버 시작 (포트 8083)
npm run dev

# 웹 브라우저에서 테스트
# http://localhost:8083
```

### 프로덕션 빌드
```bash
# App Store 준비 빌드
npm run app-store:prepare

# iOS 프로덕션 빌드
npm run build:prod:ios

# 빌드 상태 확인
npm run build:list
```

## 📁 프로젝트 구조

```
tarot-timer-web/
├── analysis/                   # 📊 프로젝트 분석 보고서 시스템
│   ├── 00-comprehensive-analysis-summary.md
│   ├── 01-development-progress-report.md
│   ├── 02-gaps-analysis-report.md
│   ├── 03-future-development-plan.md
│   └── 04-technical-recommendations-report.md
├── .claude/                    # Claude Code 프로젝트 설정
│   ├── CLAUDE.md              # 개발 룰 및 가이드라인
│   └── check-status.js        # 자동 상태 체크 스크립트
├── components/                 # React Native 컴포넌트
│   ├── Icon.tsx               # SVG 아이콘 시스템 (25개+ 아이콘)
│   ├── Logo.tsx               # 브랜드 로고
│   ├── BackgroundPattern.tsx  # 배경 패턴
│   ├── GradientButton.tsx     # 그라데이션 버튼
│   ├── DesignSystem.tsx       # 통합 디자인 시스템
│   └── tabs/                  # 탭 컴포넌트들
├── contexts/                   # React Context
│   ├── AuthContext.tsx        # 인증 컨텍스트
│   ├── NotificationContext.tsx # 알림 컨텍스트
│   ├── PremiumContext.tsx     # 프리미엄 컨텍스트
│   └── TarotContext.tsx       # 타로 컨텍스트
├── utils/                      # 유틸리티
│   ├── tarotData.ts           # 타로 데이터 관리 (78장)
│   ├── analyticsManager.ts    # 분석 매니저
│   ├── iapManager.ts          # 인앱 구매 매니저
│   └── supabase.ts            # Supabase 연동
├── i18n/                      # 국제화
│   └── locales/               # 언어 파일 (ko, en, ja)
├── assets/                    # 에셋
│   └── tarot-cards/           # 78장 타로카드 이미지
├── backend/                   # 백엔드 서버 (포트 3004)
├── tarot-admin-dashboard/     # 관리자 대시보드 (포트 3005)
├── docs/                      # 문서
├── public/                    # 공개 파일
│   └── privacy-policy.html    # 개인정보 처리방침
├── App.tsx                    # 메인 앱 컴포넌트
├── app.json                   # Expo 설정 (Build 19)
└── metro.config.js            # Metro 번들러 설정
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#7b2cbf` (보라)
- **Secondary**: `#f4d03f` (골드)
- **Accent**: `#d4b8ff` (라이트 퍼플)
- **Background**: `#1a1625` (다크 퍼플)
- **Surface**: `#2d1b47` (미드 퍼플)

### 아이콘 시스템
25개 이상의 SVG 아이콘이 포함되어 있습니다:
- ⏰ clock, 🃏 tarot-cards, 📖 book-open, ⚙️ settings
- 🔄 rotate-ccw, 👁️ eye/eye-off, ⭐ star, 🌙 moon
- ☀️ sun, ✨ sparkles, ⚡ zap, 🔔 bell, 🌍 globe 등

## 🔧 기술 스택

### Frontend
- **React Native**: 0.81.4
- **Expo**: 54.0.8
- **Graphics**: react-native-svg + react-native-svg-web
- **Language**: TypeScript
- **국제화**: i18next + react-i18next
- **상태관리**: React Context + AsyncStorage

### Backend & Infrastructure
- **Backend**: Node.js + Express (포트 3004)
- **Database**: Supabase PostgreSQL
- **Admin**: Next.js 14 대시보드 (포트 3005)
- **Analytics**: Custom Analytics Manager
- **IAP**: react-native-iap

### Development & Deployment
- **Build System**: EAS Build
- **Platform**: iOS (TestFlight), Android, Web
- **CI/CD**: GitHub Actions ready
- **Monitoring**: 실시간 시스템 헬스 체크

## 📊 현재 프로젝트 현황 (2025-09-23)

**전체 진행률**: 95% ⭐

| 영역 | 완성도 | 상태 | 비고 |
|------|--------|------|------|
| **Frontend** | 95% | 🟢 | React Native + Expo, AsyncStorage 완성 |
| **iOS 빌드 시스템** | 90% | 🟢 | Build 16 완료, TestFlight 배포 성공 |
| **알림 시스템** | 95% | 🟢 | TestFlight 호환, 자동 권한 요청 |
| **카드 데이터 지속성** | 100% | 🟢 | AsyncStorage 기반 완전 해결 |
| **App Store 제출 준비** | 90% | 🟢 | 가이드 완성, 스크린샷 촬영 대기 |
| **관리자 대시보드** | 90% | 🟢 | Next.js 14, 실시간 데이터 연동 |
| **다국어 지원** | 95% | 🟢 | 한/영/일 교육용 콘텐츠 완성 |

## 🏪 App Store 제출 준비

### ✅ 완료된 항목
- **Build 16 TestFlight 배포** 성공
- **개인정보 처리방침** 생성 (한글/영문)
- **App Store Connect 제출 가이드** 완성
- **NSUserTrackingUsageDescription** 추적 권한 설정
- **교육용 앱 포지셔닝** 완료

### ⏳ 남은 작업
- **iPad 스크린샷** 13개 촬영 (2048x2732 해상도)
- **실제 App Store 제출** 및 심사 대응

### 📄 관련 문서
- [App Store Connect 제출 가이드](./App-Store-Connect-Submission-Complete-Guide.md)
- [개인정보 처리방침](./public/privacy-policy.html)
- [심사 전략](./AppStore-Review-Strategy.md)

## 🎯 다음 단계

### 즉시 처리 (1주 이내)
1. **iPad 스크린샷 촬영**: 13개 필수 스크린샷
2. **App Store 실제 제출**: Build 16 기준
3. **심사 대응**: 24-48시간 내 승인 예상

### 단기 계획 (1-2주)
1. **AI 기반 타로 해석**: GPT 연동 스마트 해석
2. **사용자 맞춤 추천**: 개인별 최적 카드 추천
3. **소셜 공유**: SNS 연동 및 커뮤니티 기능

## 📱 지원 플랫폼

- ✅ **웹 브라우저** (Chrome, Safari, Edge)
- ✅ **iOS** (TestFlight 배포 완료, App Store 준비)
- ✅ **Android** (Expo Go, Play Store 준비)

## 🔗 관련 링크

- **GitHub**: [tarot-timer-web](https://github.com/therearenorules/tarot-timer-web)
- **Admin Dashboard**: [tarot-admin-dashboard](https://github.com/therearenorules/tarot-admin-dashboard)
- **TestFlight**: Build 16 배포 완료
- **개인정보 처리방침**: https://api.tarottimer.app/privacy-policy.html

## 🤝 기여하기

이 프로젝트는 Claude Code와 함께 개발되었습니다. 개발 룰과 가이드라인은 [.claude/CLAUDE.md](.claude/CLAUDE.md)를 참조하세요.

---

**마지막 업데이트**: 2025-09-23
**현재 빌드**: Build 16 (TestFlight)
**현재 서버**: http://localhost:8083
**상태**: 🟢 App Store 제출 준비 완료

📊 **분석 보고서**: [analysis/](./analysis/) 폴더에서 상세한 프로젝트 분석 확인 가능