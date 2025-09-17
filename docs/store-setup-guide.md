# 📱 앱스토어 결제 시스템 설정 가이드

## 🎯 개요

타로 타이머 앱의 프리미엄 구독 결제 시스템을 App Store Connect와 Google Play Console에서 설정하는 상세 가이드입니다.

## 📋 목차

1. [App Store Connect 설정](#app-store-connect-설정)
2. [Google Play Console 설정](#google-play-console-설정)
3. [프로덕션 환경 설정](#프로덕션-환경-설정)
4. [테스트 가이드](#테스트-가이드)
5. [문제 해결](#문제-해결)

---

## 🍎 App Store Connect 설정

### 1단계: 앱 등록 및 기본 설정

```bash
# 앱 정보
App Name: 타로 타이머
Bundle ID: com.tarottimer.app
SKU: tarot-timer-ios
Primary Language: Korean (ko-KR)
```

#### 앱 카테고리 및 메타데이터
- **Primary Category**: Lifestyle
- **Secondary Category**: Entertainment
- **Content Rights**: Does Not Use Third-Party Content
- **Age Rating**: 4+ (모든 연령)

### 2단계: 인앱 구매 상품 설정

#### 월간 구독 상품
```
Product ID: tarot_timer_monthly
Reference Name: 타로 타이머 월간 프리미엄
Type: Auto-Renewable Subscription
Subscription Group: Tarot Timer Premium
```

**가격 및 지역:**
- 한국: ₩3,900 (Tier 39)
- 미국: $2.99
- 일본: ¥370
- 유럽: €2.99

**로컬라이제이션:**
```
한국어:
- 표시 이름: 타로 타이머 월간 프리미엄
- 설명: 무제한 타로 세션 저장, 광고 제거, 프리미엄 테마 및 고급 해석 가이드

영어:
- Display Name: Tarot Timer Monthly Premium
- Description: Unlimited tarot sessions, ad-free experience, premium themes and advanced interpretations
```

#### 연간 구독 상품
```
Product ID: tarot_timer_yearly
Reference Name: 타로 타이머 연간 프리미엄
Type: Auto-Renewable Subscription
Subscription Group: Tarot Timer Premium
```

**가격 및 지역:**
- 한국: ₩19,900 (연간, 월간 대비 33% 할인)
- 미국: $14.99
- 일본: ¥1,840
- 유럽: €14.99

### 3단계: 구독 그룹 설정

```
Subscription Group Name: Tarot Timer Premium
Local Name (Korean): 타로 타이머 프리미엄

Subscription Services Information:
- App Name: 타로 타이머
- Length: 최대 30자
```

#### 구독 혜택 설명
```
한국어:
✨ 무제한 타로 세션 저장
📖 무제한 저널 엔트리 작성
🎯 광고 완전 제거
🎨 프리미엄 테마 및 배경
☁️ 클라우드 백업 (선택사항)
🔮 고급 카드 해석 가이드

영어:
✨ Unlimited tarot session saves
📖 Unlimited journal entries
🎯 Complete ad removal
🎨 Premium themes and backgrounds
☁️ Cloud backup (optional)
🔮 Advanced card interpretation guide
```

### 4단계: 앱 심사 정보

#### 리뷰 정보
```
리뷰어 노트:
이 앱은 타로 카드 학습과 일기 작성을 위한 24시간 타이머 앱입니다.
구독 기능은 다음과 같은 프리미엄 기능을 제공합니다:
- 무제한 세션 저장 (무료: 10개 제한)
- 무제한 저널 엔트리 (무료: 20개 제한)
- 광고 제거
- 프리미엄 테마

테스트 계정:
Email: test@tarottimer.com
Password: TestPass123!
```

#### 스크린샷 요구사항
- **iPhone**: 6.7", 6.5", 5.5" 디스플레이용 스크린샷
- **iPad**: 12.9", 11" 디스플레이용 스크린샷
- **Apple TV**: 해당 없음
- **Apple Watch**: 해당 없음

---

## 🤖 Google Play Console 설정

### 1단계: 앱 등록

```bash
# 앱 정보
App Name: 타로 타이머
Package Name: com.tarottimer.app
Default Language: Korean (ko-KR)
```

#### 앱 카테고리
- **Category**: Lifestyle
- **Tags**: tarot, meditation, mindfulness, timer, journal
- **Content Rating**: Everyone
- **Target Audience**: 13+

### 2단계: 인앱 상품 설정

#### Google Play Billing 라이브러리 설정
```gradle
// app/build.gradle
dependencies {
    implementation 'com.android.billingclient:billing:5.0.0'
}
```

#### 관리형 상품 생성
```
월간 구독:
- Product ID: tarot_timer_monthly
- Name: 타로 타이머 월간 프리미엄
- Description: 무제한 타로 세션과 프리미엄 기능
- Price: ₩3,900

연간 구독:
- Product ID: tarot_timer_yearly
- Name: 타로 타이머 연간 프리미엄
- Description: 연간 구독으로 33% 할인 혜택
- Price: ₩19,900
```

#### 구독 혜택 및 기능
```
Base Plan: 월간/연간
Pricing Phase:
- 무료 체험: 7일
- 정기 요금: 월간 ₩3,900 / 연간 ₩19,900

Features:
- 무제한 세션 저장
- 무제한 저널 작성
- 광고 제거
- 프리미엄 테마
- 우선 고객 지원
```

### 3단계: 구글 플레이 서비스 계정 설정

#### Service Account 생성
1. Google Cloud Console에서 프로젝트 생성
2. Play Developer API 활성화
3. Service Account 키 생성 (JSON)

```json
// google-play-service-account.json (예시)
{
  "type": "service_account",
  "project_id": "tarot-timer-android",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@tarot-timer-android.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

---

## 🔧 프로덕션 환경 설정

### 환경 변수 설정

#### iOS (App Store)
```bash
# .env.production
EXPO_PUBLIC_APP_STORE_SHARED_SECRET=your-shared-secret-from-app-store-connect
EXPO_PUBLIC_APP_ENV=production
```

#### Android (Google Play)
```bash
# .env.production
EXPO_PUBLIC_GOOGLE_PLAY_SERVICE_ACCOUNT=path/to/service-account.json
EXPO_PUBLIC_APP_ENV=production
```

### EAS Build 설정

#### eas.json 구성
```json
{
  "build": {
    "production": {
      "env": {
        "NODE_ENV": "production",
        "EXPO_PUBLIC_APP_ENV": "production"
      },
      "ios": {
        "resourceClass": "m1-medium",
        "bundleIdentifier": "com.tarottimer.app",
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "app-bundle",
        "applicationId": "com.tarottimer.app"
      }
    }
  }
}
```

### app.json 프로덕션 설정
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tarottimer.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSUserTrackingUsageDescription": "개인화된 광고를 제공하기 위해 추적 권한이 필요합니다."
      }
    },
    "android": {
      "package": "com.tarottimer.app",
      "versionCode": 1,
      "permissions": [
        "com.google.android.gms.permission.AD_ID"
      ]
    }
  }
}
```

---

## 🧪 테스트 가이드

### 1단계: 샌드박스 테스트 (iOS)

#### 테스트 계정 생성
1. App Store Connect → 사용자 및 액세스 → Sandbox 테스터
2. 테스트 계정 추가:
   ```
   Email: sandbox-test@tarottimer.com
   Password: TestPass123!
   Country: South Korea
   ```

#### 테스트 시나리오
```bash
# 구매 테스트
1. 샌드박스 계정으로 로그인
2. 월간 구독 선택
3. Touch ID/Face ID로 구매 확인
4. 앱에서 프리미엄 상태 확인

# 복원 테스트
1. 앱 삭제 후 재설치
2. "구매 복원" 버튼 클릭
3. 프리미엄 상태 복원 확인
```

### 2단계: Internal Testing (Android)

#### 내부 테스트 설정
1. Google Play Console → 테스트 → 내부 테스트
2. 테스터 목록에 이메일 추가
3. APK/AAB 업로드

#### 라이선스 테스트
```bash
# 테스트 계정 설정
Gmail: android-test@tarottimer.com
License Test Response: RESPOND_NORMALLY

# 구매 플로우 테스트
1. Play Store에서 앱 다운로드
2. 구독 구매 시도
3. 결제 완료 후 상태 확인
```

### 3단계: 크로스 플랫폼 동기화 테스트

#### 영수증 검증 테스트
```typescript
// 테스트 스크립트 예시
const testReceiptValidation = async () => {
  // iOS 영수증 검증
  const iosReceipt = "base64-encoded-receipt";
  const iosResult = await ReceiptValidator.validateReceipt(iosReceipt, "ios-transaction-id");

  // Android 영수증 검증
  const androidReceipt = JSON.stringify({
    orderId: "android-order-id",
    packageName: "com.tarottimer.app",
    productId: "tarot_timer_monthly"
  });
  const androidResult = await ReceiptValidator.validateReceipt(androidReceipt, "android-transaction-id");

  console.log("iOS Validation:", iosResult);
  console.log("Android Validation:", androidResult);
};
```

---

## 🔧 문제 해결

### 일반적인 문제

#### 1. "Product not found" 오류
```typescript
// 해결책
await IAPManager.initialize();
await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
const products = await IAPManager.loadProducts();
```

#### 2. 영수증 검증 실패
```typescript
// App Store 환경 확인
if (error.code === 21007) {
  // Sandbox 환경에서 테스트
  console.log("Sandbox environment detected");
} else if (error.code === 21008) {
  // Production 환경에서 테스트
  console.log("Production environment detected");
}
```

#### 3. 구독 상태 동기화 문제
```typescript
// 강제 상태 갱신
await IAPManager.forceValidateSubscription();
await LocalStorageManager.clearValidationCache();
```

### 플랫폼별 문제

#### iOS 특이사항
- 샌드박스에서 구매 후 실제 청구되지 않음
- StoreKit 2.0 사용 시 더 안정적인 결제 플로우
- App Store Review Guidelines 준수 필요

#### Android 특이사항
- Google Play Billing Library 5.0+ 사용 권장
- ProGuard 설정으로 라이브러리 보호 필요
- 구독 업그레이드/다운그레이드 지원

### 보안 고려사항

#### 영수증 검증 보안
```typescript
// 서버 사이드 검증 권장
const validateOnServer = async (receipt: string) => {
  const response = await fetch('https://api.tarottimer.com/validate-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receipt })
  });
  return response.json();
};
```

#### 민감한 정보 보호
```typescript
// 로그에서 민감한 정보 마스킹
const maskSensitiveData = (data: string) => {
  return data.substring(0, 4) + '***' + data.substring(data.length - 4);
};
```

---

## 📊 모니터링 및 분석

### 주요 메트릭

#### 수익 지표
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Churn Rate (해지율)
- Lifetime Value (LTV)

#### 사용자 행동
- 구독 전환율
- 무료 체험 → 유료 전환율
- 구독 갱신율
- 구독 취소율

### 분석 도구 연동
```typescript
// Firebase Analytics 이벤트
const trackPurchase = (productId: string, revenue: number) => {
  analytics().logEvent('purchase', {
    transaction_id: Date.now().toString(),
    value: revenue,
    currency: 'KRW',
    items: [{
      item_id: productId,
      item_name: productId.includes('yearly') ? '연간 구독' : '월간 구독',
      category: 'subscription',
      quantity: 1,
      price: revenue
    }]
  });
};
```

---

## 📝 체크리스트

### 출시 전 최종 점검

#### App Store Connect
- [ ] 인앱 구매 상품 승인 완료
- [ ] 앱 심사 승인 완료
- [ ] 샌드박스 테스트 완료
- [ ] 프로덕션 빌드 업로드
- [ ] 가격 및 지역 설정 확인

#### Google Play Console
- [ ] 관리형 상품 활성화
- [ ] 내부 테스트 완료
- [ ] 프로덕션 트랙 설정
- [ ] 서비스 계정 권한 설정
- [ ] 라이선스 테스트 완료

#### 기술적 점검
- [ ] 영수증 검증 로직 테스트
- [ ] 구독 상태 동기화 확인
- [ ] 오프라인 모드 대응
- [ ] 에러 핸들링 점검
- [ ] 보안 감사 완료

---

## 🚀 출시 후 운영

### 1주차: 모니터링 집중
- 실시간 오류 추적
- 구매 플로우 성공률 모니터링
- 사용자 피드백 수집

### 1개월차: 최적화
- A/B 테스트로 가격 최적화
- 구독 해지 이유 분석
- 프리미엄 기능 사용률 분석

### 분기별: 전략 검토
- 경쟁사 가격 분석
- 새로운 구독 플랜 검토
- 프리미엄 기능 확장 계획

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-09-17
**작성자**: Claude Code AI Assistant