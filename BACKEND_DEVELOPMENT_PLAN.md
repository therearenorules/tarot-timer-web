# 🔮 Tarot Timer Backend Development Plan
# 🔮 타로 타이머 백엔드 개발 계획

## 📋 PRD Analysis Summary
## 📋 PRD 분석 요약

### **Current State - 현재 상태**
- ✅ **95% Complete Frontend**: 완벽한 UI/UX 시스템 구축됨
- ✅ **24-Hour Tarot Timer**: 메인 기능 완전 구현
- ✅ **7 Spread Types**: 모든 타로 스프레드 완성
- ✅ **Diary System**: 완전한 기록 시스템
- ❌ **In-Memory Storage**: 클라우드 백엔드 필요

### **Mission - 임무**
**PRESERVE EXISTING UI/UX 100% + BUILD ROBUST BACKEND**
**기존 UI/UX 100% 보존 + 견고한 백엔드 구축**

---

## 🎯 Development Phases - 개발 단계

### **Phase 1: Core Backend Infrastructure (Week 1-2)**
### **1단계: 핵심 백엔드 인프라 (1-2주차)**

#### **1.1 Project Setup & Architecture**
```bash
# Backend project structure
tarot-timer-backend/
├── src/
│   ├── controllers/     # API route handlers
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── models/         # Prisma schema and types
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── routes/         # API routes
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── tests/              # Unit and integration tests
└── docs/               # API documentation
```

#### **1.2 Tech Stack Implementation**
- **Express.js + TypeScript**: RESTful API server
- **Prisma + PostgreSQL**: Type-safe database access
- **Supabase Auth**: User authentication system
- **Redis**: Session storage and caching
- **Railway/Vercel**: Cloud deployment

#### **1.3 Database Schema Creation**
```sql
-- Priority tables for Phase 1
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_status VARCHAR(50) DEFAULT 'trial',
  trial_start_date TIMESTAMP DEFAULT NOW(),
  trial_end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  language VARCHAR(10) DEFAULT 'ko',
  timezone VARCHAR(50) DEFAULT 'Asia/Seoul'
);

CREATE TABLE daily_tarot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cards JSONB NOT NULL,
  memos JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE spread_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  spread_type VARCHAR(50) NOT NULL,
  positions JSONB NOT NULL,
  insights TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **1.4 Core API Endpoints**
```typescript
// Authentication
POST   /auth/register
POST   /auth/login  
POST   /auth/logout
GET    /auth/me

// Daily Sessions (24-hour system)
GET    /api/daily-sessions
GET    /api/daily-sessions/:date
POST   /api/daily-sessions
PUT    /api/daily-sessions/:date/memos

// Spread Readings
GET    /api/spreads
POST   /api/spreads
PUT    /api/spreads/:id
DELETE /api/spreads/:id
```

#### **1.5 Frontend Integration Strategy**
```typescript
// Create CloudStorageAdapter that implements existing interface
class CloudStorageAdapter implements StorageInterface {
  // Maintain exact same method signatures
  async getDailyTarotSave(date: string): Promise<DailyTarotSave | null>
  async saveDailyTarot(date: string, data: DailyTarotSave): Promise<void>
  // ... all other methods identical to current interface
}

// Seamless replacement in frontend
// NO UI CHANGES REQUIRED!
```

---

### **Phase 2: Subscription & Payment System (Week 3)**
### **2단계: 구독 및 결제 시스템 (3주차)**

#### **2.1 Stripe Integration**
- Payment processing setup
- Subscription plan management
- Webhook handling for payment events
- Trial period logic implementation

#### **2.2 Feature Access Control**
```typescript
// Middleware for feature gating
const requireFeature = (feature: string) => {
  return async (req, res, next) => {
    const user = req.user;
    const hasAccess = await checkFeatureAccess(user.id, feature);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Premium feature required',
        upgradeUrl: '/subscription/upgrade'
      });
    }
    next();
  };
};
```

#### **2.3 Subscription Management API**
```typescript
GET    /api/subscription/status
POST   /api/subscription/create
POST   /api/subscription/cancel
POST   /api/subscription/webhook  // Stripe webhooks
```

---

### **Phase 3: Theme System & Asset Management (Week 4)**
### **3단계: 테마 시스템 및 자산 관리 (4주차)**

#### **3.1 Theme Store Infrastructure**
- AWS S3 setup for theme assets
- Card theme database structure
- Theme purchase flow implementation

#### **3.2 Theme Management API**
```typescript
GET    /api/themes              // Available themes
GET    /api/themes/owned        // User's owned themes
POST   /api/themes/:id/purchase // Purchase theme
PUT    /api/themes/active       // Set active theme
```

#### **3.3 Asset Delivery System**
- CDN configuration for fast theme loading
- Image optimization and compression
- Progressive loading for large theme packages

---

### **Phase 4: Ad Integration & Monetization (Week 5)**
### **4단계: 광고 통합 및 수익화 (5주차)**

#### **4.1 Ad Display Logic**
```typescript
const shouldShowAd = (user: User, action: string): boolean => {
  // Never show ads to premium users or during trial
  if (user.subscriptionStatus === 'active' || isInTrial(user)) {
    return false;
  }
  
  // Strategic ad placement logic
  // Maintain excellent UX even with ads
}
```

#### **4.2 Ad Network Integration**
- Google AdMob setup
- Rewarded video ads for extra features
- Banner ad placement optimization

---

### **Phase 5: Polish, Security & Launch (Week 6)**
### **5단계: 완성, 보안 및 런칭 (6주차)**

#### **5.1 Security Hardening**
- Input validation and sanitization
- Rate limiting implementation
- Security audit and penetration testing

#### **5.2 Performance Optimization**
- Database query optimization
- Caching strategy implementation
- Load testing and performance tuning

#### **5.3 Launch Preparation**
- Production deployment setup
- Monitoring and logging configuration
- App store submission preparation

---

## 🔧 Implementation Tasks Breakdown
## 🔧 구현 작업 분해

### **Week 1 Tasks - 1주차 작업**

#### **Day 1-2: Project Foundation**
- [ ] Initialize Express.js + TypeScript backend project
- [ ] Set up Prisma with PostgreSQL
- [ ] Configure development environment
- [ ] Create basic project structure
- [ ] Set up testing framework

#### **Day 3-4: Database & Auth**
- [ ] Design and implement database schema
- [ ] Set up Supabase authentication
- [ ] Create user registration/login endpoints
- [ ] Implement JWT token handling
- [ ] Add basic middleware (auth, CORS, etc.)

#### **Day 5-7: Core API Development**
- [ ] Implement daily sessions API
- [ ] Implement spread readings API
- [ ] Add data validation and error handling
- [ ] Create data migration utilities
- [ ] Test API endpoints thoroughly

### **Week 2 Tasks - 2주차 작업**

#### **Day 1-3: Frontend Integration**
- [ ] Create CloudStorageAdapter class
- [ ] Implement seamless storage interface replacement
- [ ] Add offline-first synchronization logic
- [ ] Test data migration from local to cloud
- [ ] Ensure zero UI changes required

#### **Day 4-5: Data Sync & Reliability**
- [ ] Implement conflict resolution for sync
- [ ] Add retry logic for failed requests
- [ ] Create offline queue management
- [ ] Add data integrity validation
- [ ] Performance testing and optimization

#### **Day 6-7: Phase 1 Completion**
- [ ] Integration testing with existing frontend
- [ ] Security review of authentication system
- [ ] Documentation and API specifications
- [ ] Deploy to staging environment
- [ ] User acceptance testing preparation

---

## 🛠️ Development Tools & Setup
## 🛠️ 개발 도구 및 설정

### **Required Development Environment**
```bash
# Backend dependencies
npm install express typescript prisma @supabase/supabase-js
npm install stripe redis joi helmet cors rate-limit
npm install @types/express @types/node nodemon ts-node

# Testing framework
npm install jest supertest @types/jest @types/supertest

# Development tools
npm install eslint prettier husky lint-staged
```

### **Environment Variables Setup**
```bash
# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# Authentication
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
JWT_SECRET="..."

# External Services
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="tarot-timer-assets"

# App Configuration
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:8082"
```

### **Deployment Configuration**
```yaml
# Railway deployment config
services:
  backend:
    build:
      dockerfile: Dockerfile
    env:
      NODE_ENV: production
    healthcheck:
      path: /health
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 📊 Success Metrics & Validation
## 📊 성공 지표 및 검증

### **Technical Validation Checklist**
- [ ] **Zero UI Changes**: Frontend renders identically
- [ ] **Data Integrity**: All existing data preserved during migration
- [ ] **Performance**: API response times under 200ms
- [ ] **Reliability**: 99.9% uptime with proper error handling
- [ ] **Security**: Pass security audit and penetration testing

### **Business Validation Checklist**
- [ ] **User Experience**: Seamless transition for existing users
- [ ] **Subscription Flow**: End-to-end payment processing works
- [ ] **Feature Access**: Premium features properly gated
- [ ] **Revenue Tracking**: Analytics and business metrics functional
- [ ] **Multi-language**: Korean/English support implemented

### **Testing Strategy**
```typescript
// Testing pyramid approach
const TESTING_LEVELS = {
  unit_tests: 'Individual functions and utilities',
  integration_tests: 'API endpoints and database operations', 
  e2e_tests: 'Complete user journeys (signup to purchase)',
  load_tests: 'Performance under realistic traffic',
  security_tests: 'Vulnerability scanning and penetration testing'
}
```

---

## 🚀 Next Steps - 다음 단계

### **Immediate Actions Required**
1. **Setup Development Environment**: Install tools and dependencies
2. **Create Backend Repository**: Initialize project structure
3. **Database Design Review**: Validate schema with stakeholders
4. **Authentication Setup**: Configure Supabase integration
5. **API Documentation**: Create comprehensive API specs

### **Ready to Start Phase 1?**
All architecture decisions have been made based on the PRD analysis. The development plan preserves the existing beautiful frontend while adding enterprise-grade backend infrastructure.

**Let's begin with Phase 1: Core Backend Infrastructure!**

**PRD 분석을 기반으로 모든 아키텍처 결정이 완료되었습니다. 개발 계획은 기존의 아름다운 프론트엔드를 보존하면서 엔터프라이즈급 백엔드 인프라를 추가합니다.**

**1단계: 핵심 백엔드 인프라부터 시작하겠습니다!**