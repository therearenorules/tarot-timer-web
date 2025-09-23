# 🔮 Tarot Timer - Learn Card Meanings

React Native + Expo 기반의 24시간 타로 카드 학습 애플리케이션

[![Status](https://img.shields.io/badge/Status-85%25%20Complete-green.svg)](https://github.com)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20iOS%20%7C%20Android-blue.svg)](https://expo.dev)
[![SVG Icons](https://img.shields.io/badge/Icons-25%2B%20SVG-gold.svg)](./components/Icon.tsx)

## ✨ 주요 기능

### 🎯 완성된 기능들
- **⏰ 24시간 타로 타이머**: 매 시간마다 다른 타로카드
- **🎨 미스틱 UI 디자인**: 보라/골드 테마의 고품질 디자인
- **🔮 SVG 아이콘 시스템**: 25개+ 벡터 아이콘 (크로스 플랫폼)
- **🏛️ 브랜드 로고**: 3장의 타로카드와 신비로운 요소
- **🌙 배경 패턴**: 신성한 기하학 패턴 텍스처
- **💫 그라데이션 버튼**: Primary/Secondary 스타일
- **💎 타로카드 컴포넌트**: 골드 테두리와 그림자 효과
- **📱 반응형 디자인**: 모바일 최적화 인터페이스

### 🚧 개발 중인 기능들
- **🃏 스프레드 탭**: 다양한 타로 스프레드 레이아웃
- **📖 저널 탭**: 일일 타로 리딩 기록
- **⚙️ 설정 탭**: 테마, 알림, 언어 설정

## 🚀 빠른 시작

### Claude Code 사용자를 위한 개발 워크플로우

#### 1. 프로젝트 상태 확인
```bash
# 프로젝트 진행률과 현재 상태 확인
npm run status
```

#### 2. 개발 서버 시작 (상태 체크 포함)
```bash
# 프로젝트 상태 확인 후 자동으로 서버 시작
npm run dev-check

# 또는 간단히 서버만 시작
npm run dev
```

#### 3. 앱 테스트
- **웹**: http://localhost:8083
- **모바일**: Expo Go 앱으로 QR 코드 스캔

### 일반 개발자를 위한 시작 방법

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 웹 브라우저에서 테스트
# http://localhost:8083
```

## 🔧 Claude Code 룰 및 워크플로우

### 개발 원칙
✅ **오류 발생 시**: 기능 유지하면서 호환성 개선 우선  
❌ **금지사항**: 기능 제거나 되돌리기로 문제 해결

### 세션 시작 체크리스트
1. `npm run status` 실행하여 프로젝트 현황 파악
2. 개발 서버 상태 확인 (localhost:8083)
3. 최근 변경사항 및 Git 상태 검토
4. 다음 우선순위 작업 확인

### 문제 해결 접근법
- SVG 호환성 → react-native-svg-web 추가
- 버전 충돌 → 호환 버전 조정
- 번들링 오류 → Metro 설정 개선
- UI 문제 → 컴포넌트 개선 (제거 금지)

## 📁 프로젝트 구조

```
tarot-timer-web/
├── .claude/                    # Claude Code 프로젝트 설정
│   ├── CLAUDE.md              # 개발 룰 및 가이드라인  
│   ├── PROJECT_PROGRESS.md    # 진행 현황 추적
│   └── check-status.js        # 자동 상태 체크 스크립트
├── components/                 # React Native 컴포넌트
│   ├── Icon.tsx               # SVG 아이콘 시스템 (25개+ 아이콘)
│   ├── Logo.tsx               # 브랜드 로고
│   ├── BackgroundPattern.tsx  # 배경 패턴
│   ├── GradientButton.tsx     # 그라데이션 버튼
│   └── TarotCard.tsx          # 타로카드 컴포넌트
├── utils/                     # 유틸리티
│   └── tarotData.ts           # 타로 데이터 관리
├── assets/                    # 에셋
│   └── tarot-cards/           # 78장 타로카드 이미지
├── App.tsx                    # 메인 앱 컴포넌트
└── metro.config.js            # Metro 번들러 설정 (웹 SVG 지원)
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
- ☀️ sun, ✨ sparkles, ⚡ zap 등

## 🔧 기술 스택

- **Frontend**: React Native 0.79.5
- **Framework**: Expo 53.0.22
- **Graphics**: react-native-svg + react-native-svg-web
- **Language**: TypeScript
- **Styling**: StyleSheet (미스틱 테마)
- **Storage**: Local Storage

## 📊 프로젝트 현황

**전체 진행률**: 85%

- ✅ **UI/UX 디자인 시스템**: 100%
- ✅ **기술적 구현**: 90%  
- ✅ **핵심 타로 기능**: 80%
- ✅ **사용자 인터페이스**: 85%
- 🚧 **고급 기능**: 15%

## 🎯 다음 단계

1. **스프레드 탭**: 3카드 스프레드 레이아웃 구현
2. **저널 탭**: 일일 메모 및 인사이트 저장
3. **설정 탭**: 테마/알림/언어 설정 완성

## 📱 지원 플랫폼

- ✅ **웹 브라우저** (Chrome, Safari, Edge)
- ✅ **iOS** (Expo Go)
- ✅ **Android** (Expo Go)

---

**마지막 업데이트**: 2025-09-10  
**현재 서버**: http://localhost:8083  
**상태**: 🟢 정상 동작

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
