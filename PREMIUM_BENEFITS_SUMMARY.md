# 프리미엄 혜택 현황 정리

**작성일**: 2025-10-16
**프로젝트**: 타로 타이머 웹앱

---

## 🎯 현재 설정된 프리미엄 혜택

### **코드에 정의된 프리미엄 기능** (4개)

**파일**: `contexts/PremiumContext.tsx` (33-37줄)

```typescript
export type PremiumFeature =
  | 'unlimited_storage'    // 무제한 저장소
  | 'ad_free'              // 광고 제거
  | 'premium_themes'       // 프리미엄 테마
  | 'priority_support';    // 우선 지원
```

---

## 📋 혜택별 상세 설명

### 1️⃣ **Unlimited Storage (무제한 저장소)**

**기능 ID**: `unlimited_storage`

**설명**:
```
무료 사용자: 최근 10개 타로 세션만 저장 가능
프리미엄 사용자: 무제한 타로 세션 저장
```

**적용 범위**:
- ✅ 타로 세션 저장 (TarotSession)
- ✅ 저널 항목 (JournalEntry)
- ✅ 카드 컬렉션 (CardCollection)
- ✅ 모든 히스토리 데이터

**구현 상태**:
- ✅ `localStorage.ts`에 데이터 구조 정의됨
- ✅ `PremiumContext`에서 기능 플래그 제공
- ⏸️ 실제 저장 제한 로직 구현 필요 (향후 작업)

**사용자 가치**:
- 📊 모든 타로 세션 영구 보관
- 📈 장기간 통계 분석 가능
- 💾 데이터 손실 걱정 없음

---

### 2️⃣ **Ad Free (광고 제거)**

**기능 ID**: `ad_free`

**설명**:
```
무료 사용자: 배너 광고 + 전면 광고 표시
프리미엄 사용자: 모든 광고 완전 제거
```

**적용 범위**:
- ✅ 배너 광고 (BannerAd 컴포넌트)
- ✅ 전면 광고 (InterstitialAd 컴포넌트)
- ✅ 보상형 광고 (RewardedAd 컴포넌트 - 선택적)

**구현 상태**:
- ✅ `AdManager.ts`에서 프리미엄 상태 체크
- ✅ 모든 광고 컴포넌트에서 `usePremium()` 훅 사용
- ✅ 프리미엄 사용자는 광고 로딩 자체를 건너뜀

**코드 예시**:
```typescript
// AdManager.ts (99-107줄)
await this.checkPremiumStatus();

if (this.isPremiumUser) {
  console.log('💎 프리미엄 사용자: 광고 시스템 비활성화');
  this.initialized = true;
  return true;
}
```

```typescript
// BannerAd.tsx (38-50줄)
const { isPremium, canAccessFeature } = usePremium();
const shouldShowAd = !isPremium && !canAccessFeature('ad_free');

if (!shouldShowAd) {
  console.log('💎 프리미엄 사용자: 배너 광고 비활성화');
  return;
}
```

**사용자 가치**:
- 🚫 방해 없는 순수한 타로 경험
- ⚡ 더 빠른 앱 성능 (광고 로딩 없음)
- 🎨 깨끗한 UI/UX

---

### 3️⃣ **Premium Themes (프리미엄 테마)**

**기능 ID**: `premium_themes`

**설명**:
```
무료 사용자: 기본 테마 1개만 사용 가능
프리미엄 사용자: 독점 프리미엄 테마 5개 이상 사용
```

**적용 범위**:
- 🎨 독점 미스틱 디자인 테마
- 🌈 다양한 컬러 팔레트
- ✨ 고급 애니메이션 효과
- 🌙 특별 배경 패턴

**구현 상태**:
- ⏸️ 테마 시스템 기본 구조 존재
- ⏸️ 프리미엄 테마 추가 디자인 필요 (향후 작업)
- ✅ `PremiumContext`에서 기능 플래그 제공

**향후 추가 예정 테마**:
1. **Mystic Gold** (신비의 골드)
2. **Cosmic Purple** (우주 퍼플)
3. **Emerald Forest** (에메랄드 숲)
4. **Ruby Sunset** (루비 석양)
5. **Sapphire Ocean** (사파이어 바다)

**사용자 가치**:
- 🎨 개성 있는 타로 경험
- 🌟 프리미엄 사용자만의 독점 디자인
- 🔄 기분에 따라 테마 변경 가능

---

### 4️⃣ **Priority Support (우선 지원)**

**기능 ID**: `priority_support`

**설명**:
```
무료 사용자: 일반 지원 (72시간 이내 응답)
프리미엄 사용자: 우선 지원 (24시간 이내 응답)
```

**적용 범위**:
- ✉️ 이메일 지원
- 💬 인앱 채팅 지원 (향후 추가)
- 🐛 버그 리포트 우선 처리
- 💡 기능 요청 우선 검토

**구현 상태**:
- ✅ `PremiumContext`에서 기능 플래그 제공
- ⏸️ 지원 시스템 구현 필요 (향후 작업)
- ⏸️ 이메일 또는 채팅 시스템 연동

**지원 채널**:
- 📧 이메일: support@tarottimer.com (프리미엄 전용)
- 💬 인앱 채팅: 향후 추가 예정
- 📞 전화 지원: 향후 VIP 플랜에서 고려

**사용자 가치**:
- 🚀 빠른 문제 해결
- 💬 전담 지원팀
- 🔧 버그 우선 수정

---

## 💰 구독 가격 및 혜택 비교

### **무료 버전**
```
가격: $0

기능:
✅ 24시간 타로 타이머 기본 기능
✅ 타로 세션 저장 (최근 10개)
✅ 기본 테마 1개
❌ 배너 광고 표시
❌ 전면 광고 표시 (세션 완료 시)
❌ 일반 지원 (72시간)
```

### **월간 프리미엄** ($4.99/월)
```
가격: $4.99/월 (₩6,600)
무료 체험: 7일 (권장)

프리미엄 혜택 4개 모두 제공:
✅ 광고 완전 제거 (ad_free)
✅ 무제한 저장소 (unlimited_storage)
✅ 프리미엄 테마 5개+ (premium_themes)
✅ 우선 지원 (priority_support)

추가 혜택:
✨ 새로운 기능 우선 제공
📊 고급 통계 분석 (향후 추가)
💎 프리미엄 배지 표시
```

### **연간 프리미엄** ($34.99/년)
```
가격: $34.99/년 (₩46,000)
월 환산: $2.92/월 (30% 할인)
무료 체험: 14일 (권장)

프리미엄 혜택 4개 모두 제공:
✅ 광고 완전 제거 (ad_free)
✅ 무제한 저장소 (unlimited_storage)
✅ 프리미엄 테마 5개+ (premium_themes)
✅ 우선 지원 (priority_support)

추가 혜택:
✨ 새로운 기능 우선 제공
📊 고급 통계 분석 (향후 추가)
💎 프리미엄 배지 표시
🎁 연간 구독자 전용 혜택:
   - 분기별 독점 테마 제공
   - 연말 특별 리딩 제공
   - 커뮤니티 VIP 배지
```

---

## 🔄 프리미엄 기능 확장 가능성 (향후 추가 고려)

### **추가 가능한 프리미엄 기능**

#### 1️⃣ **AI 카드 해석** (ai_interpretation)
```
무료: 기본 카드 설명
프리미엄: AI 기반 맞춤형 해석
```

#### 2️⃣ **전문가 상담 할인** (expert_consultation_discount)
```
무료: 정가 $50/회
프리미엄: 20% 할인 $40/회
```

#### 3️⃣ **고급 통계 분석** (advanced_analytics)
```
무료: 기본 통계
프리미엄: 심층 패턴 분석, 그래프, 리포트
```

#### 4️⃣ **클라우드 백업** (cloud_backup)
```
무료: 로컬 저장만
프리미엄: 클라우드 자동 백업, 멀티 디바이스 동기화
```

#### 5️⃣ **커스텀 카드 덱** (custom_card_decks)
```
무료: 기본 타로 덱 1개
프리미엄: 다양한 타로 덱 5개+, 커스텀 덱 생성
```

#### 6️⃣ **프라이빗 리딩** (private_readings)
```
무료: 공개 리딩만
프리미엄: 프라이빗 리딩, 비공개 저장
```

#### 7️⃣ **오프라인 모드 강화** (enhanced_offline_mode)
```
무료: 기본 오프라인 기능
프리미엄: 완전한 오프라인 모드, 오프라인 상태에서도 모든 기능 사용
```

---

## 📊 코드 구조

### **프리미엄 상태 데이터 구조**

**파일**: `utils/localStorage.ts` (88-102줄)

```typescript
export interface PremiumStatus {
  // 기본 구독 정보
  is_premium: boolean;
  subscription_type?: 'monthly' | 'yearly';
  purchase_date?: string;
  expiry_date?: string;
  store_transaction_id?: string;

  // 프리미엄 기능 플래그 (4개)
  unlimited_storage: boolean;
  ad_free: boolean;
  premium_themes: boolean;
  // priority_support는 is_premium으로 자동 판단

  // 영수증 검증 관련
  last_validated?: string;
  validation_environment?: 'Sandbox' | 'Production' | 'Unknown';
  receipt_data?: string;
  original_transaction_id?: string;
}
```

### **기본값 설정**

**파일**: `contexts/PremiumContext.tsx` (40-45줄)

```typescript
const defaultPremiumStatus: PremiumStatus = {
  is_premium: false,
  unlimited_storage: false,  // 무료: 최근 10개만
  ad_free: false,            // 무료: 광고 표시
  premium_themes: false      // 무료: 기본 테마만
};
```

### **프리미엄 기능 체크 함수**

**파일**: `contexts/PremiumContext.tsx`

```typescript
// 사용 예시
const { isPremium, canAccessFeature } = usePremium();

// 무제한 저장소 체크
if (canAccessFeature('unlimited_storage')) {
  // 무제한 저장 가능
} else {
  // 최근 10개만 저장
}

// 광고 제거 체크
if (canAccessFeature('ad_free')) {
  // 광고 숨김
} else {
  // 광고 표시
}

// 프리미엄 테마 체크
if (canAccessFeature('premium_themes')) {
  // 프리미엄 테마 사용 가능
} else {
  // 기본 테마만 사용
}
```

---

## ✅ 프리미엄 혜택 적용 상태

### **구현 완료** ✅
- [x] `ad_free` - 광고 제거 (100% 구현)
  - AdManager.ts에서 프리미엄 체크
  - BannerAd, InterstitialAd, RewardedAd 모두 적용
  - 프리미엄 사용자는 광고 로딩 자체를 건너뜀

- [x] 구독 시스템 인프라 (100% 구현)
  - IAP 관리 시스템 (iapManager.ts)
  - 프리미엄 컨텍스트 (PremiumContext.tsx)
  - 영수증 검증 시스템 (receiptValidator.ts)

### **부분 구현** 🔄
- [ ] `unlimited_storage` - 무제한 저장소 (30% 구현)
  - 데이터 구조 정의됨
  - 실제 저장 제한 로직 필요

- [ ] `premium_themes` - 프리미엄 테마 (20% 구현)
  - 테마 시스템 기본 구조 존재
  - 프리미엄 테마 디자인 및 추가 필요

### **향후 구현** ⏸️
- [ ] `priority_support` - 우선 지원 (0% 구현)
  - 지원 시스템 구축 필요
  - 이메일 또는 채팅 시스템 연동 필요

---

## 🎯 프리미엄 혜택 마케팅 메시지

### **Google Play 스토어 설명**
```
✨ 프리미엄 구독 혜택:

🚫 광고 완전 제거
방해 없는 순수한 타로 경험을 즐기세요.

💾 무제한 저장 공간
모든 타로 세션을 영구 보관하고 언제든 다시 확인하세요.

🎨 독점 프리미엄 테마
5개 이상의 아름다운 미스틱 테마로 개성을 표현하세요.

🌟 우선 고객 지원
24시간 이내 빠른 응답으로 문제를 해결해드립니다.
```

### **앱 내 프로모션 메시지**
```
💎 프리미엄으로 업그레이드하고
   더 나은 타로 경험을 시작하세요!

지금 구독하면:
✨ 모든 광고 제거
✨ 무제한 세션 저장
✨ 프리미엄 테마 잠금 해제
✨ 우선 지원 혜택

월 $4.99 또는 연간 $34.99 (30% 할인)
7일 무료 체험 제공!
```

---

## 📋 요약

### **현재 프리미엄 혜택 4개**
1. ✅ **ad_free** (광고 제거) - 100% 구현 완료
2. 🔄 **unlimited_storage** (무제한 저장소) - 30% 구현
3. 🔄 **premium_themes** (프리미엄 테마) - 20% 구현
4. ⏸️ **priority_support** (우선 지원) - 향후 구현

### **구독 가격**
- 월간: $4.99/월 (7일 무료 체험)
- 연간: $34.99/년 (14일 무료 체험, 30% 할인)

### **향후 확장 가능 기능 7개**
- AI 카드 해석
- 전문가 상담 할인
- 고급 통계 분석
- 클라우드 백업
- 커스텀 카드 덱
- 프라이빗 리딩
- 오프라인 모드 강화

---

**작성일**: 2025-10-16
**마지막 업데이트**: 2025-10-16
**상태**: ✅ 프리미엄 혜택 정의 완료 / 🔄 부분 구현 중
