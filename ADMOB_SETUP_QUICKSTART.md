# 🚀 AdMob 계정 생성 및 광고 단위 ID 발급 빠른 가이드

**작성일**: 2025-10-16
**소요 시간**: 약 30분
**프로젝트**: 타로 타이머 (Tarot Timer)

---

## 📋 목차

1. [AdMob 계정 생성](#1-admob-계정-생성-5분)
2. [앱 등록](#2-앱-등록-5분)
3. [광고 단위 생성](#3-광고-단위-생성-15분)
4. [광고 단위 ID 복사](#4-광고-단위-id-복사-5분)
5. [코드에 적용](#5-코드에-적용)

---

## 1. AdMob 계정 생성 (5분)

### Step 1: AdMob 사이트 접속
```
🌐 https://admob.google.com
```

### Step 2: Google 계정으로 로그인
- 이미 사용 중인 Google 계정 사용
- 또는 새 계정 생성

### Step 3: 약관 동의
```yaml
✅ AdMob 이용약관 동의
✅ Google Payments 이용약관 동의
```

### Step 4: 국가 및 시간대 설정
```yaml
국가: 대한민국
시간대: (GMT+09:00) 서울
통화: USD (미국 달러) # 권장
```

### Step 5: 결제 정보 입력 (나중에 가능)
```yaml
수익_지급_계좌: 추후 설정 가능
세금_정보: 수익 $100 이상 시 필수
최소_지급_금액: $100
```

✅ **완료!** AdMob 계정 생성됨

---

## 2. 앱 등록 (5분)

### Step 1: "앱" 메뉴 클릭
```
AdMob 대시보드 → 왼쪽 메뉴 → 앱 → "앱 추가"
```

### Step 2: 앱이 이미 스토어에 등록되었는지 선택
```yaml
질문: "앱이 Google Play 또는 App Store에 등록되어 있습니까?"

선택: ❌ 아니요
이유: 아직 Google Play에 출시 전
```

### Step 3: 앱 정보 입력
```yaml
앱_이름: Tarot Timer
플랫폼: Android
```

### Step 4: 앱 설정
```yaml
COPPA_준수: ❌ 아니요 (13세 미만 타겟 아님)
광고_형식: 나중에 설정 가능
```

### Step 5: 앱 추가 완료
```
✅ 앱이 AdMob에 등록되었습니다!
```

### 📝 메모
```yaml
앱_ID: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
# ⚠️ 이 ID를 복사해서 app.json에 나중에 입력해야 합니다!
```

---

## 3. 광고 단위 생성 (15분)

### 광고 단위란?
앱 내 특정 위치에 표시될 광고를 식별하는 고유 ID

### 필요한 광고 단위 (총 3개)
1. **배너 광고** - 화면 하단 고정
2. **전면 광고** - 카드 뽑기 후 전체 화면
3. **보상형 광고** - 프리미엄 체험 제공

---

### 3-1. 배너 광고 단위 생성

#### Step 1: 광고 단위 메뉴
```
앱 선택 → "광고 단위" 탭 → "광고 단위 추가"
```

#### Step 2: 광고 형식 선택
```
✅ 배너
```

#### Step 3: 광고 단위 정보 입력
```yaml
광고_단위_이름: Tarot Timer - Main Banner
설명: 메인 화면 하단 배너 광고
```

#### Step 4: 고급 설정 (선택사항)
```yaml
광고_새로고침_빈도: 60초 (기본값 유지)
테스트_모드: ✅ 활성화 (개발 중)
```

#### Step 5: 생성 완료
```yaml
✅ 배너 광고 단위 생성 완료!

광고_단위_ID: ca-app-pub-XXXXXXXXXXXXXXXX/1111111111
```

**⚠️ 중요: 이 ID를 복사해서 메모장에 저장하세요!**

---

### 3-2. 전면 광고 단위 생성

#### Step 1: 광고 단위 추가
```
앱 선택 → "광고 단위" 탭 → "광고 단위 추가"
```

#### Step 2: 광고 형식 선택
```
✅ 전면 광고
```

#### Step 3: 광고 단위 정보 입력
```yaml
광고_단위_이름: Tarot Timer - Interstitial
설명: 카드 뽑기 3회마다 표시되는 전면 광고
```

#### Step 4: 고급 설정
```yaml
자동_닫기: ❌ 비활성화 (사용자가 직접 닫기)
최소_표시_시간: 5초
```

#### Step 5: 생성 완료
```yaml
✅ 전면 광고 단위 생성 완료!

광고_단위_ID: ca-app-pub-XXXXXXXXXXXXXXXX/2222222222
```

**⚠️ 중요: 이 ID를 복사해서 메모장에 저장하세요!**

---

### 3-3. 보상형 광고 단위 생성

#### Step 1: 광고 단위 추가
```
앱 선택 → "광고 단위" 탭 → "광고 단위 추가"
```

#### Step 2: 광고 형식 선택
```
✅ 보상형
```

#### Step 3: 광고 단위 정보 입력
```yaml
광고_단위_이름: Tarot Timer - Rewarded
설명: 프리미엄 24시간 체험 보상 광고
```

#### Step 4: 보상 설정
```yaml
보상_유형: Premium Trial (또는 프리미엄 체험)
보상_수량: 1
```

#### Step 5: 생성 완료
```yaml
✅ 보상형 광고 단위 생성 완료!

광고_단위_ID: ca-app-pub-XXXXXXXXXXXXXXXX/3333333333
```

**⚠️ 중요: 이 ID를 복사해서 메모장에 저장하세요!**

---

## 4. 광고 단위 ID 복사 (5분)

### 📝 생성된 광고 단위 ID 정리

```yaml
# AdMob 앱 ID
APP_ID: ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY

# 배너 광고 ID
BANNER_AD_ID: ca-app-pub-XXXXXXXXXXXXXXXX/1111111111

# 전면 광고 ID
INTERSTITIAL_AD_ID: ca-app-pub-XXXXXXXXXXXXXXXX/2222222222

# 보상형 광고 ID
REWARDED_AD_ID: ca-app-pub-XXXXXXXXXXXXXXXX/3333333333
```

### ⚠️ 중요 사항
```
✅ 이 ID들은 절대 노출되면 안 됩니다!
✅ 테스트 중에는 테스트 광고 ID 사용
✅ 프로덕션 빌드에만 실제 ID 적용
```

---

## 5. 코드에 적용

### Step 1: utils/adConfig.ts 수정

```typescript
// 프로덕션 광고 단위 ID (실제 AdMob에서 생성된 ID로 교체)
export const PRODUCTION_AD_UNITS = {
  // Android 프로덕션 광고 ID
  android: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/1111111111',        // 👈 배너 ID
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/2222222222',  // 👈 전면 ID
    rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/3333333333'       // 👈 보상형 ID
  }
};

// AdMob 앱 ID
export const ADMOB_CONFIG = {
  app_id: {
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY' // 👈 앱 ID
  }
};
```

### Step 2: app.json 수정

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
      }
    },
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
        }
      ]
    ]
  }
}
```

---

## 📊 광고 확인 방법

### 개발 중 테스트
```bash
# 개발 빌드에서는 자동으로 테스트 광고 표시
npx expo start
```

### 프로덕션 테스트
```bash
# EAS Build로 프로덕션 빌드 생성
npx eas build --platform android --profile production-android

# 생성된 APK/AAB 다운로드 후 실제 디바이스에 설치
# 실제 광고가 표시되는지 확인
```

### AdMob 대시보드 확인
```
AdMob → 앱 선택 → 광고 단위 → 각 광고 단위 클릭
→ 노출수, 클릭수, 수익 확인
```

---

## 🚨 주의사항

### 1. 테스트 광고 vs 실제 광고
```yaml
개발_환경: 테스트 광고 ID 사용 (자동)
프로덕션: 실제 광고 ID 사용

⚠️ 자기 광고 클릭 금지!
이유: AdMob 정책 위반 → 계정 정지 위험
```

### 2. 광고 정책 준수
```yaml
✅ 광고와 콘텐츠 명확히 구분
✅ 실수 클릭 유도 금지
✅ 과도한 광고 표시 금지 (일일 10회 이하 권장)
✅ 광고 위치 투명하게 표시
```

### 3. 수익 지급 조건
```yaml
최소_지급_금액: $100
지급_주기: 매월 21일
지급_방법: 은행 계좌 이체
세금_정보: $100 이상 시 필수
```

---

## 🎯 다음 단계

### 1. Firebase 프로젝트 생성
```
📁 FIREBASE_SETUP_GUIDE.md 참고
→ google-services.json 다운로드 필요
```

### 2. AdMob + Firebase 연동
```
AdMob 앱 ID를 Firebase와 연결
→ 통합 분석 및 수익 추적
```

### 3. 테스트 광고로 개발 테스트
```bash
npm start
# 모든 광고가 정상 표시되는지 확인
```

### 4. 실제 광고 ID 적용 후 프로덕션 빌드
```bash
npx eas build --platform android --profile production-android
```

### 5. Google Play Console 광고 설정
```
앱 콘텐츠 → 광고 → "예, 앱에 광고가 표시됩니다" 선택
```

---

## 📞 참고 자료

### 공식 문서
- [Google AdMob 시작하기](https://admob.google.com/home/)
- [AdMob 정책](https://support.google.com/admob/answer/6128543)
- [react-native-google-mobile-ads](https://docs.page/invertase/react-native-google-mobile-ads)

### 프로젝트 파일
- `utils/adConfig.ts` - 광고 설정
- `utils/adManager.ts` - 광고 관리 시스템
- `ANDROID_AD_MONETIZATION_GUIDE.md` - 상세 구현 가이드

---

## ✅ 체크리스트

### AdMob 계정 생성
- [ ] AdMob 사이트 접속
- [ ] Google 계정 로그인
- [ ] 약관 동의
- [ ] 국가 및 시간대 설정
- [ ] 결제 정보 입력 (선택)

### 앱 등록
- [ ] 앱 추가
- [ ] 앱 이름 입력: Tarot Timer
- [ ] 플랫폼 선택: Android
- [ ] 앱 ID 복사 및 저장

### 광고 단위 생성
- [ ] 배너 광고 단위 생성
- [ ] 전면 광고 단위 생성
- [ ] 보상형 광고 단위 생성
- [ ] 모든 광고 단위 ID 복사

### 코드 적용
- [ ] utils/adConfig.ts 수정
- [ ] app.json 수정
- [ ] 테스트 광고로 개발 테스트
- [ ] 프로덕션 빌드 전 실제 ID 적용

---

**마지막 업데이트**: 2025-10-16
**예상 소요 시간**: 30분
**난이도**: ⭐⭐☆☆☆ (초보자도 가능)
**다음 단계**: Firebase 프로젝트 생성 및 google-services.json 다운로드
