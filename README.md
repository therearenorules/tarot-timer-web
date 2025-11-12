# 🔮 Tarot Timer - Learn Card Meanings

React Native + Expo 기반의 24시간 타로 카드 학습 애플리케이션

[![Status](https://img.shields.io/badge/Status-90%25%20Complete-brightgreen.svg)](https://github.com/therearenorules/tarot-timer-web)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-blue.svg)](https://expo.dev)
[![Build](https://img.shields.io/badge/Build-121%20%7C%20v1.1.3-success.svg)](https://expo.dev)
[![iOS](https://img.shields.io/badge/iOS-TestFlight%20Review-blue.svg)](#ios-app-store-출시)
[![Android](https://img.shields.io/badge/Android-Phase%201%20Complete-orange.svg)](#android-개발-현황)

## ✨ 주요 기능

### 🎯 완성된 기능들 (v1.1.3, Build 121)
- **⏰ 24시간 타로 타이머**: 매 시간마다 다른 타로카드 with AsyncStorage 지속성
- **🎨 미스틱 UI 디자인**: 보라/골드 테마의 고품질 디자인 시스템
- **🔮 SVG 아이콘 시스템**: 25개+ 벡터 아이콘 (완전 크로스 플랫폼)
- **🏛️ 브랜드 로고**: 3장의 타로카드와 신비로운 요소
- **🌙 배경 패턴**: 신성한 기하학 패턴 텍스처
- **💫 그라데이션 버튼**: Primary/Secondary 스타일
- **💎 타로카드 컴포넌트**: 골드 테두리와 그림자 효과
- **📱 반응형 디자인**: 99% 안드로이드 기기 대응 (Phase 1 완료)
- **🌍 다국어 지원**: 한국어, 영어, 일본어 (i18next)
- **🔔 알림 시스템**: iOS 알림 8개 버그 수정 완료
- **💰 구독 시스템 V2**: $4.99/월, $34.99/년 (Product ID V2 마이그레이션 완료)
- **🛡️ 네트워크 복원력**: 30초 타임아웃 + 3회 재시도 메커니즘
- **🍎 iOS TestFlight**: Build 121 제출 완료 (Apple 심사 준비 중)
- **🤖 Android 개발**: Phase 1 완료 (반응형 개선, 99점 호환성)

### 🚧 개발 중인 기능들
- **🤖 Android Play Store**: Phase 2-7 진행 중 (법률 문서, 빌드, 테스트, 배포)
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
├── ANDROID_MASTER_PLAN.md      # 🤖 안드로이드 앱 구축 마스터 플랜 (7단계)
├── ANDROID_LAUNCH_CHECKLIST.md # ✅ Play Store 출시 체크리스트
├── ANDROID_RESPONSIVE_ANALYSIS.md # 📱 반응형 대응 분석 (85→99점)
├── ANDROID_SETUP_COMPLETE.md   # 🎉 Phase 1 완료 보고서
├── SUBSCRIPTION_EVALUATION_REPORT.md # 💰 구독 모델 평가
├── SUBSCRIPTION_UPDATES_CHANGELOG.md # 📝 구독 시스템 변경 로그
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
├── utils/networkHelpers.ts    # 네트워크 타임아웃/재시도 헬퍼 (NEW)
├── App.tsx                    # 메인 앱 컴포넌트
├── app.json                   # Expo 설정 (Build 121, v1.1.3)
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

## 📊 현재 프로젝트 현황 (2025-11-12)

**전체 진행률**: 90% ⭐

| 영역 | 완성도 | 상태 | 비고 |
|------|--------|------|------|
| **Frontend** | 95% | 🟢 | React Native + Expo, AsyncStorage 완성 |
| **iOS TestFlight** | 95% | 🔵 | Build 121 제출, Apple 심사 준비 중 |
| **구독 시스템 V2** | 95% | 🟢 | Product ID V2 마이그레이션 완료 |
| **네트워크 복원력** | 100% | ✅ | 30초 타임아웃 + 3회 재시도 완성 |
| **Android 개발** | 75% | 🟡 | Phase 1 완료 (반응형 99점), Phase 2-7 진행 예정 |
| **알림 시스템** | 100% | 🟢 | iOS 8개 버그 수정 완료 |
| **카드 데이터 지속성** | 100% | 🟢 | AsyncStorage 기반 완전 해결 |
| **관리자 대시보드** | 90% | 🟢 | Next.js 14, 실시간 데이터 연동 |
| **다국어 지원** | 95% | 🟢 | 한/영/일 교육용 콘텐츠 완성 |

## 🍎 iOS App Store 출시

### 🔵 Build 121 - TestFlight 심사 준비 중 (2025-11-12)
- **버전**: v1.1.3 (Build 121)
- **상태**: TestFlight 제출 완료, Apple 처리 중 (5-10분 예상)
- **주요 수정사항**:
  - ✅ **네트워크 복원력**: 30초 타임아웃 + 3회 재시도 (Apple 심사 요구사항 충족)
  - ✅ **V2 구독 시스템**: Product ID V2 마이그레이션 (tarot_timer_yearly_v2, tarot_timer_monthly_v2)
  - ✅ **V1 Product ID 버그 수정**: 모든 구독 기능에서 V2 ID 일관성 확보
  - ✅ **사용자 친화적 에러 메시지**: 7줄 → 3줄로 간결화
- **이전 버전**: v1.0.2 (Build 29) - App Store Live ✅

### 📄 관련 문서
- [Apple Review Bug Resolution](./APPLE_REVIEW_BUG_RESOLUTION_SUMMARY.md) - Build 121 수정 사항
- [App Store Connect V2 Checklist](./APP_STORE_CONNECT_V2_CHECKLIST.md) - V2 마이그레이션 체크리스트
- [App Store Connect 제출 가이드](./App-Store-Connect-Submission-Complete-Guide.md)
- [개인정보 처리방침](./public/privacy-policy.html)

---

## 🤖 Android 개발 현황

### ✅ Phase 1 완료 (2025-10-15)
**반응형 개선 및 호환성 향상**
- **호환성 점수**: 85/100 → **99/100** (+14점)
- **터치 타겟**: 48dp (Material Design 준수)
- **모달 높이**: 동적 계산 (21:9 화면 대응)
- **Safe Area**: 노치/펀치홀 디스플레이 대응
- **대응 기기**: Galaxy S23 Ultra, Pixel 7, Sony Xperia 등

### 🔄 진행 중 (Phase 2-7)
1. **Phase 2**: 법률 문서 준비 (개인정보 처리방침, 이용약관)
2. **Phase 3**: 첫 안드로이드 빌드 (APK/AAB)
3. **Phase 4**: Google Play Console 설정
4. **Phase 5**: 내부 테스트 트랙
5. **Phase 6**: 프로덕션 배포
6. **Phase 7**: Google Play 심사 (1~7일)

**예상 출시일**: 2025-10-30 (총 15일 소요)

### 📄 안드로이드 관련 문서
- [안드로이드 마스터 플랜](./ANDROID_MASTER_PLAN.md) - 7단계 통합 실행 계획
- [Play Store 출시 체크리스트](./ANDROID_LAUNCH_CHECKLIST.md)
- [반응형 대응 분석](./ANDROID_RESPONSIVE_ANALYSIS.md)
- [Phase 1 완료 보고서](./ANDROID_SETUP_COMPLETE.md)
- [구독 모델 평가](./SUBSCRIPTION_EVALUATION_REPORT.md)

## 🎯 다음 단계

### 즉시 처리 (1주 이내)
1. **Phase 2**: 법률 문서 작성 (개인정보 처리방침, 이용약관)
2. **Phase 3**: 안드로이드 첫 빌드 (APK/AAB 생성)
3. **Phase 4**: Google Play Console 설정 및 구독 상품 등록

### 단기 계획 (2주 이내)
1. **Phase 5-7**: 내부 테스트 → 프로덕션 배포 → Google Play 심사
2. **Android 앱 출시**: 2025-10-30 목표
3. **크로스 플랫폼 운영**: iOS + Android 동시 운영 시작

### 중기 계획 (1-2개월)
1. **AI 기반 타로 해석**: GPT 연동 스마트 해석
2. **사용자 맞춤 추천**: 개인별 최적 카드 추천
3. **소셜 공유**: SNS 연동 및 커뮤니티 기능
4. **광고 수익화**: AdMob 연동 (Android 우선)

## 📱 지원 플랫폼

- ✅ **웹 브라우저** (Chrome, Safari, Edge) - 개발/테스트 환경
- ✅ **iOS** (App Store 출시 완료 - v1.0.2)
- 🔄 **Android** (Phase 1 완료, Play Store 출시 준비 중)

## 🔗 관련 링크

- **GitHub**: [tarot-timer-web](https://github.com/therearenorules/tarot-timer-web)
- **Admin Dashboard**: [tarot-admin-dashboard](https://github.com/therearenorules/tarot-admin-dashboard)
- **iOS App Store**: v1.0.2 출시 완료 ✅
- **Android Play Store**: 출시 준비 중 (Phase 1/7 완료)
- **개인정보 처리방침**: https://api.tarottimer.app/privacy-policy.html

## 🤝 기여하기

이 프로젝트는 Claude Code와 함께 개발되었습니다. 개발 룰과 가이드라인은 [.claude/CLAUDE.md](.claude/CLAUDE.md)를 참조하세요.

---

**마지막 업데이트**: 2025-11-12
**현재 버전**: v1.1.3 (Build 121)
**iOS 상태**: 🔵 TestFlight 제출 완료 (Apple 처리 중)
**Android 상태**: 🔄 Phase 1 완료 (7단계 중 1단계)
**현재 서버**: http://localhost:8083

📊 **프로젝트 분석**: [analysis/](./analysis/) - 5개 종합 분석 보고서
📱 **Android 개발**: [ANDROID_MASTER_PLAN.md](./ANDROID_MASTER_PLAN.md) - 7단계 마스터 플랜
💰 **구독 시스템 V2**: $4.99/월, $34.99/년 (Product ID V2 마이그레이션 완료)
🛡️ **네트워크 복원력**: 30초 타임아웃 + 3회 재시도 (Apple 심사 대응)