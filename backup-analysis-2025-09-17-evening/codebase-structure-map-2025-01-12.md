# 🗺️ 타로 타이머 웹앱 - 종합 코드베이스 구조 맵

**분석 일시**: 2025-01-12  
**분석 유형**: 아키텍처 구조 맵  
**분석 범위**: 전체 코드베이스  

---

## 📊 **프로젝트 개요 & 메트릭스**

### 📈 **코드베이스 통계**
```
📁 총 디렉토리: 19개
📄 총 소스 파일: 23개 (7,738 LOC)
🧩 컴포넌트: 15개
🔧 유틸리티: 1개
⚙️ 설정 파일: 5개
🎨 자산: 78개 타로카드 이미지
```

### 📏 **파일 크기 분포**
| 카테고리 | 파일 수 | 평균 LOC | 총 LOC | 비율 |
|----------|---------|----------|--------|------|
| **대형 컴포넌트** | 3개 | 1,279 | 3,837 | 49.6% |
| **중형 컴포넌트** | 4개 | 371 | 1,484 | 19.2% |
| **소형 컴포넌트** | 8개 | 161 | 1,288 | 16.6% |
| **메인 앱** | 1개 | 880 | 880 | 11.4% |
| **유틸리티** | 1개 | 560 | 560 | 7.2% |

---

## 🏗️ **아키텍처 구조도**

### 📂 **디렉토리 구조 트리**
```
tarot-timer-web/
├── 📱 App.tsx                     (880 LOC) # 메인 앱 엔트리포인트
├── 📁 components/                 (6,298 LOC) # UI 컴포넌트 라이브러리
│   ├── 🎨 Visual Effects/         (1,110 LOC)
│   │   ├── SacredGeometryBackground.tsx  (139)
│   │   ├── MysticalTexture.tsx           (165)
│   │   ├── FloatingParticles.tsx         (270)
│   │   ├── SparkleAnimation.tsx          (462)
│   │   └── BackgroundPattern.tsx         (74)
│   ├── 🧩 UI Components/          (2,134 LOC)
│   │   ├── Icon.tsx                      (287)
│   │   ├── GradientButton.tsx            (182)
│   │   ├── Logo.tsx                      (114)
│   │   ├── TarotCard.tsx                 (159)
│   │   ├── TarotCardBack.tsx             (154)
│   │   ├── TarotSpread.tsx              (1,342)
│   │   └── TarotJournal.tsx             (1,615)
│   ├── ⚙️ System/                 (1,335 LOC)
│   │   ├── DesignSystem.tsx              (337)
│   │   ├── AnimationUtils.tsx            (476)
│   │   └── TarotSettings.tsx             (522)
├── 📁 utils/                      (560 LOC) # 비즈니스 로직
│   └── tarotData.ts               (560) # 데이터 모델 & 유틸리티
├── 📁 public/assets/              # 정적 자산
│   └── tarot-cards/              (78개 JPG 이미지)
├── 📁 .claude/                    # 개발 도구
├── 📁 .expo/                      # Expo 빌드 캐시
├── 📁 analysis/                   # 분석 리포트
└── ⚙️ Configuration Files/        # 설정 파일들
    ├── package.json
    ├── metro.config.js
    ├── tsconfig.json
    └── app.json
```

---

## 🔗 **의존성 관계도 & 데이터 플로우**

### 📊 **컴포넌트 의존성 매트릭스**

#### **🎯 중앙 허브 컴포넌트들**
```
App.tsx (메인 앱) 
├── imports → DesignSystem.tsx
├── imports → Icon.tsx  
├── imports → utils/tarotData.ts
└── imports → 모든 Tab 컴포넌트들

Core System (기반 레이어)
├── DesignSystem.tsx (337 LOC) - 모든 컴포넌트에서 임포트
├── Icon.tsx (287 LOC) - UI 컴포넌트에서 임포트  
└── utils/tarotData.ts (560 LOC) - 데이터 컴포넌트에서 임포트

UI Components Layer (UI 레이어)
├── GradientButton.tsx (182 LOC)
├── TarotCard.tsx (159 LOC)
├── TarotSpread.tsx (1,342 LOC)
├── TarotJournal.tsx (1,615 LOC)
└── TarotSettings.tsx (522 LOC)

Visual Effects Layer (시각 효과 레이어)
├── SacredGeometryBackground (139 LOC)
├── MysticalTexture (165 LOC)
├── FloatingParticles (270 LOC)
└── SparkleAnimation (462 LOC)
```

#### **📈 의존성 분석**

**🔴 높은 의존성 (5+ 임포트)**
- `DesignSystem.tsx`: 모든 컴포넌트에서 임포트 (15회)
- `Icon.tsx`: UI 컴포넌트에서 임포트 (8회)  
- `utils/tarotData.ts`: 데이터 관련 컴포넌트에서 임포트 (5회)

**🟡 중간 의존성 (2-4 임포트)**
- `AnimationUtils.tsx`: 애니메이션 컴포넌트에서 임포트 (3회)
- `GradientButton.tsx`: UI 컴포넌트에서 임포트 (3회)
- `TarotCard.tsx`: 스프레드 컴포넌트에서 임포트 (2회)

**🟢 낮은 의존성 (1 임포트)**
- Visual Effects 컴포넌트들: 독립적 구조

---

## 🧩 **컴포넌트 분류 & 아키텍처 레이어**

### **Layer 1: 시스템 기반 (Foundation)**
| 컴포넌트 | LOC | 역할 | 의존성 |
|----------|-----|------|--------|
| `DesignSystem.tsx` | 337 | 중앙화된 스타일 시스템 | ❌ 없음 |
| `AnimationUtils.tsx` | 476 | 애니메이션 훅 시스템 | DesignSystem |
| `utils/tarotData.ts` | 560 | 데이터 모델 & 비즈니스 로직 | ❌ 없음 |

### **Layer 2: UI 기본 요소 (Components)**  
| 컴포넌트 | LOC | 역할 | 주요 의존성 |
|----------|-----|------|-------------|
| `Icon.tsx` | 287 | SVG 아이콘 시스템 (25개) | react-native-svg |
| `GradientButton.tsx` | 182 | 브랜드 일관성 버튼 | DesignSystem, Icon |
| `Logo.tsx` | 114 | 브랜드 로고 컴포넌트 | react-native-svg |
| `TarotCard.tsx` | 159 | 개별 타로카드 렌더링 | tarotData, Icon |
| `TarotCardBack.tsx` | 154 | 카드 뒷면 디자인 | ❌ 없음 |

### **Layer 3: 시각적 효과 (Visual Effects)**
| 컴포넌트 | LOC | 역할 | 특징 |
|----------|-----|------|------|
| `SacredGeometryBackground.tsx` | 139 | 신성 기하학 배경 | SVG 기반 |
| `MysticalTexture.tsx` | 165 | 미스틱 텍스처 효과 | 동적 렌더링 |
| `FloatingParticles.tsx` | 270 | 플로팅 파티클 시스템 | 애니메이션 |
| `SparkleAnimation.tsx` | 462 | 반짝임 효과 | 복잡한 애니메이션 |
| `BackgroundPattern.tsx` | 74 | 패턴 배경 | 단순 SVG |

### **Layer 4: 기능 컴포넌트 (Features)**
| 컴포넌트 | LOC | 역할 | 복잡도 |
|----------|-----|------|--------|
| `TarotSpread.tsx` | 1,342 | 타로카드 배치 시스템 | 🔴 높음 |
| `TarotJournal.tsx` | 1,615 | 일기/저널 기능 | 🔴 높음 |
| `TarotSettings.tsx` | 522 | 앱 설정 관리 | 🟡 중간 |

### **Layer 5: 애플리케이션 (Application)**
| 컴포넌트 | LOC | 역할 | 복잡도 |
|----------|-----|------|--------|
| `App.tsx` | 880 | 메인 앱, 라우팅, 상태 관리 | 🔴 높음 |

---

## 🌊 **데이터 플로우 아키텍처**

### **📊 상태 관리 흐름**
```
📱 App.tsx (State Owner)
├── currentTime: Date
├── dailyCards: TarotCard[]
├── selectedCardIndex: number | null
├── cardMemos: Record<number, string>
├── activeTab: string
└── 🔽 Props Drilling

📋 Tab Components (State Consumers)
├── TarotTimer (Timer Tab)
├── TarotSpread (Spread Tab)  
├── TarotJournal (Journal Tab)
└── TarotSettings (Settings Tab)

💾 Persistence Layer
├── simpleStorage.setItem()
├── simpleStorage.getItem()
└── localStorage (Web)
```

### **🔄 이벤트 플로우**
```
User Interaction → Component Handler → State Update → Re-render → Storage Save
     ↓               ↓                    ↓              ↓            ↓
  Touch/Click    → onPress/onChange   → setState      → UI Update  → Persist
```

---

## 📐 **아키텍처 패턴 분석**

### **🎯 사용된 패턴들**
1. **📦 Container/Presentation 패턴**
   - App.tsx: Container (상태 관리)
   - Tab 컴포넌트들: Presentation (UI 렌더링)

2. **🧩 Compound Components 패턴**
   - TarotCard + TarotCardBack
   - Icon + 개별 아이콘들

3. **🎨 Design System 패턴**
   - 중앙화된 DesignSystem.tsx
   - Composite Styles 사전 정의

4. **🔧 Custom Hooks 패턴**
   - AnimationUtils.tsx의 애니메이션 훅들
   - useFadeIn, useCardEntrance, usePulse

5. **📂 Feature-based 구조**
   - 기능별 컴포넌트 분리
   - Tarot 접두사로 네임스페이스

---

## ⚠️ **아키텍처 문제점 & 개선사항**

### **🔴 긴급 개선 필요**

#### **1. 거대 컴포넌트 문제**
```typescript
// 문제: 과도하게 큰 컴포넌트들
TarotJournal.tsx    - 1,615 LOC  ❌
TarotSpread.tsx     - 1,342 LOC  ❌
App.tsx             - 880 LOC    ❌

// 권장: 기능별 분리
TarotJournal/
├── JournalList.tsx      (500 LOC)
├── JournalDetail.tsx    (400 LOC)
├── JournalEditor.tsx    (300 LOC)
└── index.tsx           (100 LOC)
```

#### **2. Props Drilling 문제**
```typescript
// 현재: 깊은 Props 전달
App → TabComponent → SubComponent → DeepComponent

// 권장: Context API
const TarotContext = createContext();
const TarotProvider = ({ children }) => { /* ... */ };
```

### **🟡 중간 우선순위**

#### **3. 의존성 순환 위험**
```typescript
// 잠재적 문제: 컴포넌트 간 상호 의존성
TarotSpread ↔ TarotCard ↔ AnimationUtils

// 권장: 단방향 의존성 강화
```

#### **4. 타입 정의 분산**
```typescript
// 현재: utils/tarotData.ts에 모든 타입
// 권장: 도메인별 타입 분리
types/
├── tarot.ts        # 타로 관련 타입
├── ui.ts          # UI 관련 타입
└── storage.ts     # 스토리지 관련 타입
```

---

## 📊 **컴포넌트 복잡도 분석**

### **🔍 복잡도 기준**
- **🔴 높음 (800+ LOC)**: 즉시 리팩토링 필요
- **🟡 중간 (300-799 LOC)**: 모니터링 필요
- **🟢 낮음 (<300 LOC)**: 적절한 크기

### **📈 복잡도 분포**
```
🔴 높음 (4개): App.tsx, TarotJournal.tsx, TarotSpread.tsx, AnimationUtils.tsx
🟡 중간 (3개): TarotSettings.tsx, DesignSystem.tsx, Icon.tsx  
🟢 낮음 (16개): 나머지 모든 컴포넌트들
```

### **⚡ 리팩토링 우선순위**
1. **TarotJournal.tsx** (1,615 LOC) - 가장 큰 컴포넌트
2. **TarotSpread.tsx** (1,342 LOC) - 복잡한 로직
3. **App.tsx** (880 LOC) - 중앙 상태 관리
4. **AnimationUtils.tsx** (476 LOC) - 훅 분리

---

## 🎯 **최종 구조 평가**

### **📊 아키텍처 점수표**
| 영역 | 현재 상태 | 점수 | 권장 개선 |
|------|-----------|------|-----------|
| **모듈화** | 우수한 컴포넌트 분리 | 9/10 | 거대 컴포넌트 분할 |
| **의존성 관리** | 명확한 계층 구조 | 8/10 | 순환 의존성 방지 |
| **재사용성** | 좋은 공통 컴포넌트 | 8/10 | 더 많은 추상화 |
| **확장성** | Props Drilling 문제 | 6/10 | Context API 도입 |
| **유지보수성** | 일부 거대 파일 | 7/10 | 파일 크기 최적화 |
| **테스트 용이성** | 순수 컴포넌트 구조 | 8/10 | 의존성 주입 개선 |

### **🏆 종합 평가: 7.7/10 (양호)**

**타로 타이머 웹앱은 전반적으로 잘 구성된 아키텍처를 가지고 있습니다. 특히 레이어별 분리와 디자인 시스템의 중앙화가 우수합니다. 몇 가지 거대 컴포넌트 분할과 상태 관리 개선을 통해 완벽한 구조로 발전할 수 있습니다.**

---

## 🎯 **개선 로드맵**

### **🚀 Phase 1 (즉시 - 1주)**
1. **App.tsx 분할**: TarotTimer 컴포넌트 추출
2. **TarotJournal 분할**: 3개 서브컴포넌트로 분리
3. **에러 바운더리 추가**: 앱 안정성 향상

### **🔧 Phase 2 (1-2주)**
4. **Context API 도입**: 전역 상태 관리
5. **TarotSpread 분할**: 스프레드 로직 분리
6. **커스텀 훅 추출**: 비즈니스 로직 분리

### **📈 Phase 3 (2-4주)**
7. **타입 시스템 개선**: 도메인별 타입 분리
8. **테스트 아키텍처**: 단위 테스트 인프라
9. **성능 최적화**: React.memo, useMemo 적용

---

**분석 완료일**: 2025-01-12  
**다음 구조 리뷰**: 2025-04-12 (Phase 1-2 완료 후)