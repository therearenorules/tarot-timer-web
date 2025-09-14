# 🔮 Tarot Timer Web - Backend Development PRD
# 🔮 타로 타이머 웹 - 백엔드 개발 제품 요구사항 문서

## 📋 Executive Summary
## 📋 요약

**Project Status**: 95% 완료된 프론트엔드를 가진 정교한 24시간 타로 타이머 애플리케이션의 **백엔드 시스템 구축**

**Current State**: React Native + Expo 기반의 완전히 작동하는 UI/UX 시스템 (인메모리 저장소 사용 중)

**Objective**: 기존 UI/UX 디자인을 **절대 건드리지 않고**, 강력한 백엔드 시스템을 구축하여 다음을 지원:
- 사용자 인증 및 구독 관리
- 데이터 지속성 및 클라우드 동기화
- 프리미엄 기능 관리 (7일 무료 체험 + 구독)
- 타로 카드 테마 시스템 및 인앱 구매
- 광고 시스템 통합

**Tech Philosophy**: 현재의 아름다운 프론트엔드를 보존하면서 견고한 백엔드 인프라로 확장

---

## 🏗️ Technical Architecture
## 🏗️ 기술 아키텍처

### **Backend Stack Recommendation**
### **백엔드 스택 권장사항**

```javascript
// Primary Backend Framework
Framework: Express.js + TypeScript
Database: PostgreSQL (primary) + Redis (caching/sessions)
ORM: Prisma (type-safe, matches frontend TypeScript)
Authentication: Supabase Auth (seamless integration)
File Storage: AWS S3 (card themes, assets)
Payment: Stripe (subscription management)
Push Notifications: Expo Notifications
Deployment: Railway/Vercel (easy deployment)
Monitoring: Sentry (error tracking)
```

### **Database Architecture**
### **데이터베이스 아키텍처**

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Subscription Status
  subscription_status VARCHAR(50) DEFAULT 'trial', -- 'trial', 'active', 'expired', 'cancelled'
  trial_start_date TIMESTAMP DEFAULT NOW(),
  trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  subscription_end_date TIMESTAMP,
  
  -- App Preferences
  language VARCHAR(10) DEFAULT 'ko', -- 'ko', 'en', 'ja'
  timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
  push_notifications BOOLEAN DEFAULT true,
  
  -- Theme & Customization
  active_card_theme_id UUID REFERENCES card_themes(id),
  owned_themes UUID[] DEFAULT '{}',
  
  -- Usage Analytics
  total_sessions INTEGER DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW()
);

-- Daily Tarot Sessions (24-hour system)
CREATE TABLE daily_tarot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cards JSONB NOT NULL, -- Array of 24 cards with hour indices
  memos JSONB DEFAULT '{}', -- Hour-indexed memos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date) -- One session per day per user
);

-- Spread Readings
CREATE TABLE spread_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  spread_type VARCHAR(50) NOT NULL, -- 'celtic_cross', 'three_card', etc.
  positions JSONB NOT NULL, -- Card positions with meanings
  insights TEXT,
  is_premium BOOLEAN DEFAULT false, -- Some spreads require premium
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX(user_id, created_at),
  INDEX(spread_type)
);

-- Card Themes (for monetization)
CREATE TABLE card_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  preview_images JSONB, -- Array of preview URLs
  asset_urls JSONB, -- All 78 card image URLs
  price DECIMAL(5,2) DEFAULT 0.00, -- $0.00 for default theme
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  creator VARCHAR(100),
  style_tags VARCHAR[] DEFAULT '{}', -- 'mystical', 'modern', 'vintage'
  download_count INTEGER DEFAULT 0
);

-- Purchases & Transactions
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  purchase_type VARCHAR(50) NOT NULL, -- 'subscription', 'theme', 'premium_feature'
  item_id UUID, -- References card_themes(id) or subscription plan
  amount DECIMAL(8,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX(user_id, created_at),
  INDEX(status)
);

-- App Analytics & Usage
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'daily_session_started', 'spread_completed', 'theme_purchased'
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX(user_id, timestamp),
  INDEX(event_type)
);

-- Ad Display Tracking (for free users)
CREATE TABLE ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ad_placement VARCHAR(50) NOT NULL, -- 'banner', 'interstitial', 'rewarded'
  ad_network VARCHAR(50), -- 'admob', 'meta', etc.
  revenue DECIMAL(6,4) DEFAULT 0.0000,
  displayed_at TIMESTAMP DEFAULT NOW(),
  
  INDEX(user_id, displayed_at)
);
```

---

## 🔐 User Authentication & Subscription System
## 🔐 사용자 인증 및 구독 시스템

### **Authentication Flow**
### **인증 흐름**

```typescript
// Authentication States
type UserAuthState = {
  isAuthenticated: boolean;
  user: User | null;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  trialDaysRemaining: number;
  canUsePremiumFeatures: boolean;
  canSaveUnlimited: boolean;
}

// Trial Logic
const TRIAL_DURATION_DAYS = 7;
const FREE_SAVE_LIMIT = 3; // 3 saves per week for free users
const AD_FREE_SESSIONS = 5; // 5 sessions before showing ads
```

### **Subscription Tiers**
### **구독 등급**

```javascript
// Subscription Plans
const SUBSCRIPTION_PLANS = {
  free_trial: {
    duration: 7, // days
    features: ['unlimited_saves', 'all_spreads', 'all_themes', 'no_ads'],
    price: 0
  },
  
  free: {
    features: ['basic_spreads', 'limited_saves', 'ads_enabled', 'default_theme_only'],
    limitations: {
      saves_per_week: 3,
      premium_spreads: false,
      custom_themes: false
    }
  },
  
  premium_monthly: {
    price: 4.99,
    features: ['unlimited_saves', 'all_spreads', 'all_themes', 'no_ads', 'cloud_sync'],
    stripe_price_id: 'price_premium_monthly'
  },
  
  premium_yearly: {
    price: 39.99,
    features: ['unlimited_saves', 'all_spreads', 'all_themes', 'no_ads', 'cloud_sync'],
    discount: '33%',
    stripe_price_id: 'price_premium_yearly'
  }
}
```

### **Feature Access Control**
### **기능 접근 제어**

```typescript
// Backend Middleware
const checkFeatureAccess = (feature: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    const canAccess = await canUserAccessFeature(user.id, feature);
    
    if (!canAccess) {
      return res.status(403).json({
        error: 'Premium feature required',
        message: 'This feature requires a premium subscription',
        upgradeUrl: '/subscription/upgrade'
      });
    }
    
    next();
  };
};

// Feature Gates
const FEATURE_GATES = {
  'unlimited_saves': (user) => user.subscriptionStatus === 'active' || isInTrial(user),
  'premium_spreads': (user) => user.subscriptionStatus === 'active' || isInTrial(user),
  'custom_themes': (user) => user.subscriptionStatus === 'active' || isInTrial(user),
  'ad_free': (user) => user.subscriptionStatus === 'active' || isInTrial(user)
}
```

---

## 🗄️ Data Persistence & API Design
## 🗄️ 데이터 지속성 및 API 설계

### **Core API Endpoints**
### **핵심 API 엔드포인트**

```typescript
// Authentication
POST /auth/register          // Email registration
POST /auth/login            // Email login  
POST /auth/logout           // Logout
GET  /auth/me              // Get current user
PUT  /auth/profile         // Update profile

// Daily Tarot Sessions (24-hour system)
GET    /api/daily-sessions                    // Get user's daily sessions
GET    /api/daily-sessions/:date             // Get specific date session
POST   /api/daily-sessions                   // Create/update daily session
PUT    /api/daily-sessions/:date/memos       // Update hourly memos
DELETE /api/daily-sessions/:date             // Delete session

// Tarot Spreads
GET    /api/spreads                          // Get user's spread readings
POST   /api/spreads                          // Save new spread reading
GET    /api/spreads/:id                      // Get specific spread
PUT    /api/spreads/:id                      // Update spread insights
DELETE /api/spreads/:id                      // Delete spread

// Card Themes (Monetization)
GET    /api/themes                           // Get available themes
GET    /api/themes/owned                     // Get user's owned themes
POST   /api/themes/:id/purchase              // Purchase theme
PUT    /api/themes/active                    // Set active theme

// Subscription Management
GET    /api/subscription/status              // Get subscription status
POST   /api/subscription/create              // Create subscription
POST   /api/subscription/cancel              // Cancel subscription
POST   /api/subscription/webhook             // Stripe webhooks

// Analytics (Privacy-focused)
POST   /api/analytics/event                  // Track app usage
GET    /api/analytics/usage                  // Get usage stats
```

### **Data Synchronization Strategy**
### **데이터 동기화 전략**

```typescript
// Frontend Storage Upgrade Path
class DataManager {
  private localStorage: AsyncStorage;
  private cloudAPI: APIClient;
  private syncQueue: SyncOperation[];

  // Seamless transition from local to cloud storage
  async upgradeToCloudStorage(user: User) {
    // 1. Upload existing local data
    const localSessions = await this.getLocalSessions();
    const localSpreads = await this.getLocalSpreads();
    
    // 2. Batch upload to preserve user data
    await this.cloudAPI.batchUpload({
      sessions: localSessions,
      spreads: localSpreads,
      preserveTimestamps: true
    });
    
    // 3. Switch to cloud-first storage
    this.setStorageMode('cloud');
  }

  // Offline-first with sync
  async saveData(type: 'session' | 'spread', data: any) {
    // Always save locally first
    await this.localStorage.save(type, data);
    
    // Queue for cloud sync
    this.queueSync(type, data);
    
    // Attempt immediate sync if online
    if (this.isOnline()) {
      await this.syncToCloud();
    }
  }
}
```

---

## 💎 Theme System & Monetization
## 💎 테마 시스템 및 수익화

### **Card Theme Architecture**
### **카드 테마 아키텍처**

```typescript
// Theme Structure
interface CardTheme {
  id: string;
  name: string;
  description: string;
  price: number;
  previewImages: string[]; // 3-4 preview cards
  isDefault: boolean;
  isPremium: boolean;
  
  // Asset Management
  cardAssets: {
    [cardId: string]: {
      imageUrl: string;
      thumbnail: string;
      highRes?: string; // For premium themes
    }
  };
  
  // Theme Metadata
  style: 'mystical' | 'modern' | 'vintage' | 'minimalist' | 'artistic';
  artist?: string;
  description_kr: string;
  description_en: string;
  tags: string[];
}

// Theme Categories for Store
const THEME_CATEGORIES = {
  free: {
    name: 'Free Themes',
    themes: ['default', 'classic']
  },
  premium: {
    name: 'Premium Collection',
    price_range: [2.99, 9.99],
    themes: ['mystical_gold', 'modern_minimal', 'vintage_tarot', 'cosmic_dreams']
  },
  seasonal: {
    name: 'Seasonal Themes',
    themes: ['halloween', 'christmas', 'spring_awakening', 'summer_solstice']
  },
  artist_series: {
    name: 'Artist Collaborations',
    price_range: [4.99, 14.99],
    themes: ['artist_collaboration_1', 'artist_collaboration_2']
  }
}
```

### **Theme Purchase Flow**
### **테마 구매 흐름**

```typescript
// Purchase Process
const themePurchaseFlow = {
  1: 'User browses theme store',
  2: 'Preview theme with sample cards', 
  3: 'Initiate purchase via Stripe',
  4: 'Process payment',
  5: 'Add theme to user inventory',
  6: 'Download theme assets',
  7: 'Enable theme selection',
  8: 'Sync across devices'
}

// Purchase API Implementation
app.post('/api/themes/:themeId/purchase', authenticateUser, async (req, res) => {
  const { themeId } = req.params;
  const userId = req.user.id;
  
  try {
    // Validate theme exists and user doesn't already own it
    const theme = await getThemeById(themeId);
    const alreadyOwned = await userOwnsTheme(userId, themeId);
    
    if (alreadyOwned) {
      return res.status(400).json({ error: 'Theme already owned' });
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: theme.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        themeId,
        type: 'theme_purchase'
      }
    });
    
    // Return client secret for frontend payment
    res.json({
      clientSecret: paymentIntent.client_secret,
      theme: theme
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});
```

---

## 📱 Ad Integration Strategy
## 📱 광고 통합 전략

### **Ad Placement Strategy**
### **광고 배치 전략**

```typescript
// Ad Configuration
const AD_CONFIG = {
  // When to show ads for free users
  triggers: {
    after_trial_expiry: true,
    every_n_sessions: 3, // Show ad every 3 tarot sessions
    before_premium_feature: true, // Show ad before premium spread
    daily_limit_reached: true // When save limit reached
  },
  
  // Ad Types
  placements: {
    banner: {
      position: 'bottom',
      show_on_tabs: ['timer', 'spread'],
      auto_hide_after: 30000 // 30 seconds
    },
    
    interstitial: {
      frequency: 'every_5_sessions',
      skip_after: 5000, // Allow skip after 5 seconds
      max_per_day: 3
    },
    
    rewarded: {
      reward_type: 'extra_save_slot',
      reward_duration: '24_hours',
      limit_per_day: 2
    }
  }
}

// Ad Display Logic
const shouldShowAd = (user: User, action: string): boolean => {
  // Never show ads to premium users
  if (user.subscriptionStatus === 'active') return false;
  
  // Never show ads during trial period
  if (isInTrial(user)) return false;
  
  // Check daily ad limits
  const todayAdCount = getUserAdCount(user.id, 'today');
  if (todayAdCount >= AD_CONFIG.max_ads_per_day) return false;
  
  // Action-specific logic
  switch (action) {
    case 'session_start':
      return user.sessionsToday % AD_CONFIG.triggers.every_n_sessions === 0;
    
    case 'premium_feature_attempt':
      return true;
    
    case 'save_limit_reached':
      return true;
      
    default:
      return false;
  }
}
```

---

## 🛡️ Security & Data Protection
## 🛡️ 보안 및 데이터 보호

### **Security Measures**
### **보안 조치**

```typescript
// Input Validation & Sanitization
const validateDailySession = (data: any) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    cards: Joi.array().items(
      Joi.object({
        id: Joi.number().min(0).max(77).required(),
        hour: Joi.number().min(0).max(23).required()
      })
    ).length(24).required(),
    memos: Joi.object().pattern(
      Joi.number().min(0).max(23), // hour key
      Joi.string().max(1000) // memo content
    )
  });
  
  return schema.validate(data);
};

// Rate Limiting
const rateLimitConfig = {
  api_calls: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each user to 100 requests per windowMs
  },
  
  theme_purchases: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // max 5 purchases per hour
  },
  
  data_saves: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // max 10 saves per minute
  }
}

// Data Encryption
const encryptSensitiveData = (data: string): string => {
  // Encrypt personal notes and insights
  return encrypt(data, process.env.ENCRYPTION_KEY);
};

// GDPR Compliance
const gdprCompliance = {
  data_retention: {
    inactive_users: '2 years', // Delete data after 2 years of inactivity
    deleted_accounts: '30 days', // Keep backup for 30 days after deletion
  },
  
  user_rights: {
    data_export: true, // Allow users to export all their data
    data_deletion: true, // Allow complete account deletion
    data_portability: true, // Standard JSON export format
  }
}
```

---

## 🚀 Deployment & DevOps
## 🚀 배포 및 데브옵스

### **Infrastructure Requirements**
### **인프라 요구사항**

```yaml
# Production Environment
production:
  backend:
    platform: Railway/Vercel
    instances: 2 (load balanced)
    memory: 1GB per instance
    
  database:
    postgresql: 
      version: 15
      storage: 20GB (auto-scaling)
      backups: daily, 7-day retention
      
    redis:
      memory: 512MB
      persistence: enabled
      
  storage:
    s3_bucket: tarot-timer-assets
    cdn: CloudFront
    regions: [us-east-1, ap-northeast-2] # US + Korea
    
  monitoring:
    error_tracking: Sentry
    uptime_monitoring: Pingdom
    performance: New Relic (optional)
```

### **Environment Configuration**
### **환경 설정**

```bash
# Backend Environment Variables
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="..."
ENCRYPTION_KEY="..."

# External Services
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="tarot-timer-assets"

# App Configuration
NODE_ENV="production"
PORT=3000
CORS_ORIGIN="https://tarot-timer.vercel.app"

# Feature Flags
ENABLE_ADS=true
ENABLE_SUBSCRIPTIONS=true
ENABLE_THEME_STORE=true
TRIAL_DURATION_DAYS=7
```

---

## 📊 Analytics & Business Intelligence
## 📊 분석 및 비즈니스 인텔리전스

### **Key Metrics to Track**
### **추적할 핵심 지표**

```typescript
// User Engagement Metrics
const engagementMetrics = {
  daily_active_users: 'COUNT(DISTINCT user_id) WHERE last_active >= today',
  session_duration: 'AVG(session_end - session_start)',
  feature_usage: {
    timer_usage: 'Daily timer sessions started',
    spread_usage: 'Spread readings completed', 
    diary_usage: 'Diary entries viewed',
    theme_changes: 'Theme switches per user'
  }
}

// Revenue Metrics  
const revenueMetrics = {
  subscription_conversion: 'Trial to paid conversion rate',
  theme_sales: 'Theme purchase revenue',
  ad_revenue: 'Revenue from ad impressions',
  churn_rate: 'Subscription cancellation rate',
  lifetime_value: 'Average revenue per user'
}

// Privacy-Focused Analytics
const privacyAnalytics = {
  // No personal data collection
  // Only anonymized usage patterns
  // User can opt-out completely
  data_collection: 'anonymized',
  retention_policy: '90_days_max',
  user_consent: 'explicit_opt_in'
}
```

---

## 🎯 Migration & Compatibility Plan
## 🎯 마이그레이션 및 호환성 계획

### **Seamless Frontend Integration**
### **원활한 프론트엔드 통합**

```typescript
// Current Frontend Storage Interface (DO NOT CHANGE)
interface StorageInterface {
  getDailyTarotSave(date: string): Promise<DailyTarotSave | null>;
  saveDailyTarot(date: string, data: DailyTarotSave): Promise<void>;
  getSavedSpreads(): Promise<SavedSpread[]>;
  saveSpread(spread: SavedSpread): Promise<void>;
  deleteSavedSpread(id: string): Promise<void>;
  getDailyTarotMemos(date: string): Promise<Record<number, string>>;
  saveDailyTarotMemos(date: string, memos: Record<number, string>): Promise<void>;
}

// New Backend-Integrated Storage (SAME INTERFACE)
class CloudStorageAdapter implements StorageInterface {
  private apiClient: APIClient;
  private localStorage: AsyncStorage; // Fallback
  
  // Implement exact same methods with cloud backend
  async getDailyTarotSave(date: string): Promise<DailyTarotSave | null> {
    try {
      // Try cloud first
      const response = await this.apiClient.get(`/api/daily-sessions/${date}`);
      return response.data;
    } catch (error) {
      // Fallback to local storage
      return await this.localStorage.getDailyTarotSave(date);
    }
  }
  
  // ... implement all other methods identically
}

// Frontend Migration Strategy
const migrateToBackend = async () => {
  // 1. Keep existing UI exactly as is
  // 2. Swap storage implementation
  // 3. Add authentication layer
  // 4. Enable premium features
  // 5. No UI changes required!
}
```

---

## 🏁 Implementation Roadmap
## 🏁 구현 로드맵

### **Phase 1: Core Backend (Week 1-2)**
### **1단계: 핵심 백엔드 (1-2주차)**
- ✅ Set up Express.js + TypeScript + Prisma
- ✅ Implement user authentication (Supabase)
- ✅ Create database schema and migrations
- ✅ Build core API endpoints (sessions, spreads)
- ✅ Test data persistence and sync

### **Phase 2: Subscription System (Week 3)**
### **2단계: 구독 시스템 (3주차)**
- ✅ Integrate Stripe payments
- ✅ Implement trial period logic
- ✅ Add feature access control
- ✅ Build subscription management UI
- ✅ Test payment flows

### **Phase 3: Theme Store (Week 4)**
### **3단계: 테마 스토어 (4주차)**
- ✅ Build theme management system
- ✅ Implement theme purchase flow
- ✅ Set up asset storage (S3)
- ✅ Create theme store UI
- ✅ Add theme switching functionality

### **Phase 4: Ad Integration (Week 5)**
### **4단계: 광고 통합 (5주차)**
- ✅ Integrate ad networks (AdMob)
- ✅ Implement ad display logic
- ✅ Add rewarded video functionality
- ✅ Test ad frequency and UX
- ✅ Optimize ad revenue

### **Phase 5: Polish & Launch (Week 6)**
### **5단계: 완성 및 런칭 (6주차)**
- ✅ Performance optimization
- ✅ Security audit
- ✅ App store submission
- ✅ Analytics setup
- ✅ Launch preparation

---

## 🎨 CRITICAL: UI/UX Preservation
## 🎨 중요: UI/UX 보존

### **ABSOLUTE REQUIREMENTS**
### **절대 요구사항**

```typescript
// NEVER CHANGE THESE FRONTEND COMPONENTS:
const PROTECTED_COMPONENTS = [
  'components/tabs/TimerTab.tsx',     // Perfect 24-hour system
  'components/TarotSpread.tsx',       // Sophisticated spread layouts  
  'components/TarotJournal.tsx',      // Beautiful diary system
  'components/TarotCard.tsx',         // Card rendering perfection
  'components/DesignSystem.tsx',      // Mystical theme system
  'components/Icon.tsx'               // 25+ custom SVG icons
]

// BACKEND INTEGRATION RULES:
const INTEGRATION_RULES = {
  1: 'Add new props to existing components, never modify internal logic',
  2: 'Use HOCs or providers for authentication state',
  3: 'Preserve all animations and transitions',
  4: 'Keep glassmorphism and mystical theme intact',
  5: 'Maintain tab navigation structure exactly',
  6: 'Do not modify any design tokens or color schemes'
}

// EXAMPLE: Correct way to add backend integration
const TimerTabWithAuth = withAuth(TimerTab); // ✅ Correct
// const ModifiedTimerTab = ... // ❌ Never do this

// Authentication should be invisible to existing components
const AppWithBackend = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ThemeProvider>
          <ExistingApp /> {/* App.tsx stays exactly the same */}
        </ThemeProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
};
```

---

## 📝 Backend Development Prompt for Claude Code
## 📝 클로드 코드를 위한 백엔드 개발 프롬프트

```
I have a fully functional 95% complete React Native + Expo tarot timer app with beautiful UI/UX. 

CRITICAL: The frontend UI/UX is perfect and must NEVER be modified. I need you to build a complete backend system that integrates seamlessly without changing any existing components.

Current Frontend Status:
- 24-hour tarot timer system (fully working)
- 7 different tarot spread types (fully working) 
- Diary system with history (fully working)
- Sophisticated glassmorphism design system
- All data currently stored in-memory (needs cloud backend)

Backend Requirements:
1. **User Authentication**: 7-day free trial, then subscription required
2. **Subscription Management**: Stripe integration, premium features
3. **Theme Store**: Purchasable tarot card themes
4. **Ad Integration**: For non-premium users
5. **Cloud Data Sync**: Preserve all existing data structures
6. **API Design**: Match current storage interface exactly

Tech Stack:
- Backend: Express.js + TypeScript + Prisma + PostgreSQL
- Auth: Supabase 
- Payments: Stripe
- Storage: AWS S3 (for theme assets)
- Deploy: Railway/Vercel

The existing app works perfectly - I need backend infrastructure that powers it without any UI changes. Build a production-ready backend that handles user accounts, subscriptions, theme purchases, and ads while preserving the beautiful frontend exactly as it is.

Start with the database schema and core authentication system.
```

---

## 📌 Summary
## 📌 요약

This PRD outlines a comprehensive backend development plan for the Tarot Timer Web application that:

이 PRD는 다음을 수행하는 타로 타이머 웹 애플리케이션을 위한 포괄적인 백엔드 개발 계획을 설명합니다:

- **Preserves** the existing 95% complete, beautiful frontend
- **기존의** 95% 완료된 아름다운 프론트엔드 보존
- **Adds** robust backend infrastructure for user management, subscriptions, and monetization  
- 사용자 관리, 구독, 수익화를 위한 **견고한 백엔드 인프라 추가**
- **Implements** a 7-day free trial with premium subscription model
- 프리미엄 구독 모델과 함께 **7일 무료 체험 구현**
- **Includes** theme store for additional revenue streams
- 추가 수익 스트림을 위한 **테마 스토어 포함**
- **Maintains** data integrity and user experience throughout migration
- 마이그레이션 전반에 걸쳐 **데이터 무결성과 사용자 경험 유지**

**Result**: A production-ready tarot timer application with enterprise-grade backend infrastructure and multiple revenue streams.

**결과**: 엔터프라이즈급 백엔드 인프라와 다중 수익 스트림을 갖춘 상용화 준비 완료된 타로 타이머 애플리케이션.