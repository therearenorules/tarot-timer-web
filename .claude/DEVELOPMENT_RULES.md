# 🔮 Tarot Timer Web - Development Rules & Guidelines
# 🔮 타로 타이머 웹 - 개발 규칙 및 가이드라인

## 🚨 CRITICAL: FRONTEND PRESERVATION RULES
## 🚨 중요: 프론트엔드 보존 규칙

### **ABSOLUTE PROHIBITION - 절대 금지사항**
```typescript
// ❌ NEVER MODIFY THESE COMPONENTS:
const PROTECTED_COMPONENTS = [
  'components/tabs/TimerTab.tsx',     // Perfect 24-hour system
  'components/TarotSpread.tsx',       // Sophisticated spread layouts  
  'components/TarotJournal.tsx',      // Beautiful diary system
  'components/TarotCard.tsx',         // Card rendering perfection
  'components/DesignSystem.tsx',      // Mystical theme system
  'components/Icon.tsx',              // 25+ custom SVG icons
  'App.tsx'                          // Main navigation structure
]

// ❌ NEVER CHANGE:
- UI/UX layouts, positioning, styling
- Animation systems and transitions  
- Glassmorphism effects and mystical theme
- Tab navigation structure
- Design tokens and color schemes
- Card size variants and aspect ratios
- Any existing component internal logic
```

### **REQUIRED INTEGRATION APPROACH - 필수 통합 방식**
```typescript
// ✅ CORRECT: Use providers and HOCs
const AppWithBackend = () => (
  <AuthProvider>
    <SubscriptionProvider>
      <ThemeProvider>
        <ExistingApp /> {/* App.tsx stays identical */}
      </ThemeProvider>
    </SubscriptionProvider>
  </AuthProvider>
);

// ✅ CORRECT: Add new props only
interface TimerTabProps {
  // existing props...
  user?: User;           // NEW: optional auth
  isOnline?: boolean;    // NEW: optional connectivity
}

// ❌ WRONG: Modifying internal component logic
```

## 🎯 APP CORE IDENTITY - 앱 핵심 정체성

### **Primary Purpose - 주요 목적**
- **24-Hour Tarot Timer**: 가장 중요한 메인 기능
- **Hourly Spiritual Guidance**: 시간당 영적 가이던스 제공
- **Daily Practice Tool**: 일일 영적 수행 도구
- **Personal Journey Tracking**: 개인 타로 여정 추적

### **Secondary Features - 보조 기능**
- **Tarot Spreads**: 경험 있는 타로 리더를 위한 도구
- **No Auto-Interpretation**: 자동 해석 기능 없음
- **Self-Reading Tools**: 스스로 타로를 읽는 도구만 제공

### **Multi-language Support - 다국어 지원**
- **Current**: Korean (KR) + English (EN)
- **Planned**: Japanese (JA) - 총 3개 언어 완전 지원

## 💾 DATA STRUCTURE PRESERVATION - 데이터 구조 보존

### **Existing Storage Interface - 기존 저장소 인터페이스**
```typescript
// 🚨 MUST MAINTAIN EXACT SAME INTERFACE
interface StorageInterface {
  getDailyTarotSave(date: string): Promise<DailyTarotSave | null>;
  saveDailyTarot(date: string, data: DailyTarotSave): Promise<void>;
  getSavedSpreads(): Promise<SavedSpread[]>;
  saveSpread(spread: SavedSpread): Promise<void>;
  deleteSavedSpread(id: string): Promise<void>;
  getDailyTarotMemos(date: string): Promise<Record<number, string>>;
  saveDailyTarotMemos(date: string, memos: Record<number, string>): Promise<void>;
}

// ✅ Backend implementation must use IDENTICAL interface
class CloudStorageAdapter implements StorageInterface {
  // Implement all methods with identical signatures
  // Add cloud sync behind the scenes
  // Maintain offline-first approach
}
```

### **Data Migration Strategy - 데이터 마이그레이션 전략**
```typescript
// ✅ REQUIRED: Preserve all existing user data
const migrateUserData = async (user: User) => {
  // 1. Extract all local storage data
  const localSessions = await getAllLocalSessions();
  const localSpreads = await getAllLocalSpreads();
  const localMemos = await getAllLocalMemos();
  
  // 2. Upload to cloud with original timestamps
  await batchUploadToCloud({
    sessions: localSessions,
    spreads: localSpreads, 
    memos: localMemos,
    preserveTimestamps: true
  });
  
  // 3. Verify data integrity
  await validateDataMigration(user.id);
};
```

## 🏗️ BACKEND ARCHITECTURE RULES - 백엔드 아키텍처 규칙

### **Tech Stack Requirements - 기술 스택 요구사항**
```typescript
// ✅ REQUIRED STACK:
const BACKEND_STACK = {
  framework: 'Express.js + TypeScript',
  database: 'PostgreSQL + Redis',
  orm: 'Prisma',
  auth: 'Supabase Auth', 
  payments: 'Stripe',
  storage: 'AWS S3',
  deployment: 'Railway/Vercel',
  monitoring: 'Sentry'
}
```

### **Database Schema Rules - 데이터베이스 스키마 규칙**
```sql
-- ✅ REQUIRED: User table structure
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_status VARCHAR(50) DEFAULT 'trial',
  trial_start_date TIMESTAMP DEFAULT NOW(),
  trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  language VARCHAR(10) DEFAULT 'ko',
  active_card_theme_id UUID REFERENCES card_themes(id)
);

-- ✅ REQUIRED: Daily sessions with exact current structure
CREATE TABLE daily_tarot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cards JSONB NOT NULL, -- Maintain current 24-card structure
  memos JSONB DEFAULT '{}', -- Hour-indexed memos
  UNIQUE(user_id, date)
);
```

## 💰 MONETIZATION STRATEGY - 수익화 전략

### **Subscription Model - 구독 모델**
```typescript
const SUBSCRIPTION_TIERS = {
  free_trial: {
    duration: 7, // days
    features: ['unlimited_saves', 'all_spreads', 'all_themes', 'no_ads'],
    price: 0
  },
  free: {
    limitations: {
      saves_per_week: 3,
      ads_enabled: true,
      default_theme_only: true
    }
  },
  premium_monthly: { price: 4.99 },
  premium_yearly: { price: 39.99, discount: '33%' }
}
```

### **Feature Access Control - 기능 접근 제어**
```typescript
// ✅ REQUIRED: Feature gate system
const FEATURE_GATES = {
  'unlimited_saves': (user) => user.subscriptionStatus === 'active' || isInTrial(user),
  'custom_themes': (user) => user.subscriptionStatus === 'active' || isInTrial(user),
  'ad_free': (user) => user.subscriptionStatus === 'active' || isInTrial(user)
}
```

## 🛡️ SECURITY & PRIVACY RULES - 보안 및 개인정보 규칙

### **Data Protection - 데이터 보호**
```typescript
// ✅ REQUIRED: Privacy-first approach
const PRIVACY_RULES = {
  data_collection: 'minimal_required_only',
  user_memos: 'encrypted_at_rest',
  analytics: 'anonymized_only',
  retention: '2_years_inactive_users',
  gdpr_compliance: 'full_support'
}
```

### **Rate Limiting - 속도 제한**
```typescript
const RATE_LIMITS = {
  api_calls: { windowMs: 15 * 60 * 1000, max: 100 },
  theme_purchases: { windowMs: 60 * 60 * 1000, max: 5 },
  data_saves: { windowMs: 60 * 1000, max: 10 }
}
```

## 🎨 THEME SYSTEM RULES - 테마 시스템 규칙

### **Theme Structure - 테마 구조**
```typescript
interface CardTheme {
  id: string;
  name: string;
  price: number;
  cardAssets: {
    [cardId: string]: {
      imageUrl: string;
      thumbnail: string;
      highRes?: string;
    }
  };
  style: 'mystical' | 'modern' | 'vintage' | 'minimalist' | 'artistic';
  description_kr: string;
  description_en: string;
  description_ja?: string; // Future Japanese support
}
```

## 📱 AD INTEGRATION RULES - 광고 통합 규칙

### **Ad Display Strategy - 광고 표시 전략**
```typescript
const AD_STRATEGY = {
  // ✅ NEVER show ads to premium users or during trial
  never_show_if: ['premium_user', 'trial_active'],
  
  // ✅ Show ads strategically for free users
  triggers: {
    after_trial_expiry: true,
    every_n_sessions: 3,
    save_limit_reached: true
  },
  
  // ✅ Maintain good UX even with ads
  placement_rules: {
    no_interruption_during_reading: true,
    skippable_after_5_seconds: true,
    max_per_day: 3
  }
}
```

## 🔄 DEVELOPMENT WORKFLOW - 개발 워크플로우

### **Phase-Based Development - 단계별 개발**
```typescript
const DEVELOPMENT_PHASES = {
  phase_1: 'Core Backend (Express + Auth + Database)',
  phase_2: 'Subscription System (Stripe + Trial Logic)',
  phase_3: 'Theme Store (Purchase Flow + S3 Assets)',
  phase_4: 'Ad Integration (AdMob + Display Logic)',
  phase_5: 'Polish & Launch (Security + Performance)'
}
```

### **Testing Requirements - 테스트 요구사항**
```typescript
const TESTING_RULES = {
  // ✅ REQUIRED: Comprehensive testing
  unit_tests: 'All business logic functions',
  integration_tests: 'All API endpoints',
  e2e_tests: 'Critical user flows (signup, purchase, sync)',
  
  // ✅ REQUIRED: Data integrity validation
  migration_tests: 'Local to cloud data migration',
  sync_tests: 'Offline/online data synchronization',
  subscription_tests: 'Trial expiry and feature access'
}
```

## 📊 ANALYTICS RULES - 분석 규칙

### **Privacy-First Analytics - 개인정보 우선 분석**
```typescript
const ANALYTICS_POLICY = {
  data_collection: 'anonymized_only',
  user_consent: 'explicit_opt_in',
  retention_period: '90_days_max',
  
  // ✅ Track business metrics only
  allowed_metrics: [
    'daily_active_users',
    'session_duration', 
    'feature_usage_counts',
    'subscription_conversion_rates',
    'theme_purchase_revenue'
  ],
  
  // ❌ Never track personal content
  forbidden_tracking: [
    'user_memos_content',
    'personal_insights',
    'individual_card_meanings'
  ]
}
```

## 🌍 INTERNATIONALIZATION RULES - 국제화 규칙

### **Multi-language Support - 다국어 지원**
```typescript
const LANGUAGE_SUPPORT = {
  current: ['ko', 'en'],
  planned: ['ko', 'en', 'ja'], // Korean, English, Japanese
  
  // ✅ REQUIRED: Full localization
  backend_messages: 'All error messages and responses',
  payment_flow: 'Stripe localization',
  email_templates: 'Auth and subscription emails',
  
  // ✅ Database schema support
  localized_fields: {
    theme_descriptions: ['description_kr', 'description_en', 'description_ja'],
    error_messages: 'JSON object with language keys'
  }
}
```

---

## 🎯 CRITICAL SUCCESS CRITERIA - 중요한 성공 기준

### **MUST ACHIEVE - 반드시 달성해야 함**
1. **Zero UI Changes**: Existing frontend stays 100% identical
2. **Seamless Migration**: All user data preserved during migration  
3. **Offline-First**: App works without internet, syncs when online
4. **Performance**: No degradation in app responsiveness
5. **Data Integrity**: Zero data loss during any operation

### **VALIDATION CHECKLIST - 검증 체크리스트**
- [ ] All existing components render identically
- [ ] All animations and transitions preserved
- [ ] Local storage data successfully migrated
- [ ] Subscription flow works end-to-end
- [ ] Theme purchase and activation works
- [ ] Ad display follows UX guidelines
- [ ] Multi-language support implemented
- [ ] Security audit passed
- [ ] Performance benchmarks met

---

**이 규칙들은 프로젝트의 무결성과 연속성을 보장하기 위해 모든 개발 세션에서 반드시 준수되어야 합니다.**

**These rules must be followed in every development session to ensure project integrity and continuity.**