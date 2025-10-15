# 📱 안드로이드 광고 수익 창출 완벽 가이드

**작성일**: 2025-10-15
**프로젝트**: 타로 타이머 (Tarot Timer)
**목표**: 무료 버전 사용자 대상 광고 수익 창출
**예상 월 수익**: $500 - $2,000 (MAU 1만 기준)

---

## 🎯 1. 현재 상태 분석

### ✅ **이미 구현된 사항**
```
✅ 광고 관리 시스템 (utils/adManager.ts)
✅ 배너 광고 컴포넌트 (components/ads/BannerAd.tsx)
✅ 프리미엄 사용자 광고 제외 로직
✅ 광고 배치 전략
✅ 수익 추적 시스템
```

### ⚠️ **업데이트 필요 사항**
```
❌ expo-ads-admob → react-native-google-mobile-ads 마이그레이션
❌ AdMob 계정 설정 (아직 안 함)
❌ 광고 단위 ID 설정
❌ app.json 광고 플러그인 설정
```

---

## 💰 2. 광고 수익 모델 전략

### **수익 구조**

#### **A. 광고 유형별 예상 수익**
```yaml
배너_광고:
  CPM: $0.50 - $2.00 (1000회 노출당)
  위치: 화면 하단 고정
  빈도: 상시 노출
  예상_일일_노출: 5,000회 (MAU 1만 기준)
  예상_월_수익: $75 - $300

전면_광고_Interstitial:
  CPM: $5.00 - $15.00
  빈도: 3번 액션마다 1회
  예상_일일_노출: 1,000회
  예상_월_수익: $150 - $450

보상형_광고_Rewarded:
  CPM: $10.00 - $30.00
  빈도: 사용자 선택 (프리미엄 기능 임시 해제)
  예상_일일_노출: 200회
  예상_월_수익: $60 - $180

총_예상_수익:
  최소: $285/월 (MAU 1만)
  평균: $500/월
  최대: $930/월

MAU_5만_기준:
  최소: $1,400/월
  평균: $2,500/월
  최대: $4,600/월
```

---

### **B. 광고 배치 전략**

#### **1. 배너 광고 (320x50)**
```typescript
위치_1: 메인_타이머_화면 (하단 고정)
  노출_빈도: 상시
  영향도: 낮음 (UI 방해 최소)
  예상_CTR: 0.5% - 1.0%

위치_2: 다이어리_리스트 (하단)
  노출_빈도: 다이어리 탭 진입 시
  영향도: 낮음
  예상_CTR: 0.3% - 0.8%

위치_3: 설정_화면 (하단)
  노출_빈도: 설정 진입 시
  영향도: 매우 낮음
  예상_CTR: 0.2% - 0.5%
```

#### **2. 전면 광고 (Interstitial)**
```typescript
시나리오_1: 24시간_카드_뽑기_완료_후
  빈도: 3번 카드 뽑기마다 1회
  타이밍: 카드 뽑기 후 2초 지연
  건너뛰기: 5초 후 가능

시나리오_2: 스프레드_완료_후
  빈도: 스프레드 2회 완료마다 1회
  타이밍: 스프레드 결과 확인 후
  건너뛰기: 5초 후 가능

제한:
  최소_간격: 3분 (쿨다운)
  일일_최대: 10회
  프리미엄_사용자: 표시 안 함
```

#### **3. 보상형 광고 (Rewarded)**
```typescript
보상_1: 프리미엄_기능_24시간_무료_체험
  혜택: 광고 제거 24시간
  버튼_위치: 설정 > 프리미엄 섹션
  제한: 1일 3회

보상_2: 추가_스프레드_잠금_해제
  혜택: 프리미엄 스프레드 1회 사용
  버튼_위치: 스프레드 선택 화면
  제한: 제한 없음

보상_3: 다이어리_백업_기능
  혜택: 다이어리 CSV 내보내기
  버튼_위치: 다이어리 > 더보기 메뉴
  제한: 1일 1회
```

---

## 🔧 3. Google AdMob 설정 (Step-by-Step)

### **Phase 1: AdMob 계정 생성 (15분)**

#### **Step 1: Google AdMob 가입**
1. https://admob.google.com 접속
2. Google 계정으로 로그인
3. "시작하기" 클릭
4. 국가 선택: 대한민국
5. 결제 정보 입력 (수익 받을 계좌)
6. 세금 정보 입력 (W-8BEN 또는 사업자등록증)

#### **Step 2: 앱 등록**
```yaml
앱_이름: "Tarot Timer"
플랫폼: Android
패키지_이름: "com.tarottimer.app"
앱_스토어_URL: (Google Play 출시 후 입력)
```

#### **Step 3: 광고 단위 생성**
```yaml
# 1. 배너 광고
이름: "Tarot Timer - 메인 배너"
형식: 배너 광고
크기: 320x50 (표준 배너)
생성 후 → 광고 단위 ID 복사 (ca-app-pub-XXXXXXXXXX~YYYYYYYYYY)

# 2. 전면 광고
이름: "Tarot Timer - 전면 광고"
형식: 전면 광고
생성 후 → 광고 단위 ID 복사

# 3. 보상형 광고
이름: "Tarot Timer - 보상형 광고"
형식: 보상형 광고
보상_유형: "프리미엄 체험"
보상_수량: 1
생성 후 → 광고 단위 ID 복사
```

---

### **Phase 2: 프로젝트 설정 (30분)**

#### **Step 1: 패키지 설치**
```bash
# 1. 구버전 제거
npm uninstall expo-ads-admob

# 2. 신버전 설치
npx expo install react-native-google-mobile-ads

# 3. 추가 의존성
npm install @react-native-firebase/app
npx expo install expo-build-properties
```

#### **Step 2: app.json 설정**
```json
{
  "expo": {
    "android": {
      "package": "com.tarottimer.app",
      "googleServicesFile": "./google-services.json",
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXX~YYYYYYYYYY"
      }
    },
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXX~YYYYYYYYYY",
          "iosAppId": "ca-app-pub-XXXXXXXXXX~ZZZZZZZZZZ"
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 21,
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          }
        }
      ]
    ]
  }
}
```

#### **Step 3: google-services.json 다운로드**
```bash
# Firebase Console에서 다운로드
1. https://console.firebase.google.com 접속
2. 프로젝트 생성: "Tarot Timer"
3. Android 앱 추가: com.tarottimer.app
4. google-services.json 다운로드
5. 프로젝트 루트에 저장
```

#### **Step 4: 광고 설정 파일 생성**
```typescript
// utils/adConfig.ts
export const AD_UNITS = {
  // 개발용 (테스트 ID)
  DEV: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },

  // 프로덕션 (실제 AdMob ID로 교체 필요)
  PROD: {
    banner: 'ca-app-pub-XXXXXXXXXX/YYYYYYYYYY',      // 배너 광고 ID
    interstitial: 'ca-app-pub-XXXXXXXXXX/ZZZZZZZZZZ', // 전면 광고 ID
    rewarded: 'ca-app-pub-XXXXXXXXXX/WWWWWWWWWW',     // 보상형 광고 ID
  },
};

// 현재 환경에 따라 광고 단위 선택
export const getCurrentAdUnits = () => {
  return __DEV__ ? AD_UNITS.DEV : AD_UNITS.PROD;
};

export const AD_CONFIG = {
  // 광고 표시 조건
  conditions: {
    min_session_duration: 30000, // 30초 이상 세션
    max_daily_ads: {
      banner: 1000,
      interstitial: 10,
      rewarded: 3,
    },
  },

  // 광고 간격
  intervals: {
    interstitial_cooldown: 180000, // 3분
    rewarded_cooldown: 300000,     // 5분
    banner_refresh: 60000,         // 1분
  },

  // 광고 배치 설정
  placements: {
    main_screen: {
      banner: true,
      interstitial: false,
      rewarded: false,
    },
    card_drawn: {
      banner: false,
      interstitial: true, // 3번마다
      rewarded: false,
    },
    spread_complete: {
      banner: false,
      interstitial: true, // 2번마다
      rewarded: false,
    },
    settings: {
      banner: true,
      interstitial: false,
      rewarded: true, // 프리미엄 체험
    },
    diary: {
      banner: true,
      interstitial: false,
      rewarded: true, // CSV 내보내기
    },
  },
};
```

---

### **Phase 3: 광고 컴포넌트 업데이트 (1시간)**

#### **1. 배너 광고 컴포넌트 (react-native-google-mobile-ads)**
```typescript
// components/ads/BannerAd.tsx (업데이트)
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { usePremium } from '../../contexts/PremiumContext';
import { getCurrentAdUnits, AD_CONFIG } from '../../utils/adConfig';

interface BannerAdProps {
  placement: 'main_screen' | 'diary' | 'settings';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
}

const TarotBannerAd: React.FC<BannerAdProps> = ({
  placement,
  onAdLoaded,
  onAdFailedToLoad,
}) => {
  const { isPremium } = usePremium();
  const [adUnitId, setAdUnitId] = useState('');

  useEffect(() => {
    const adUnits = getCurrentAdUnits();
    setAdUnitId(__DEV__ ? TestIds.BANNER : adUnits.banner);
  }, []);

  // 프리미엄 사용자는 광고 표시 안 함
  if (isPremium || Platform.OS === 'web') {
    return null;
  }

  // 배치에서 배너 광고 비활성화된 경우
  if (!AD_CONFIG.placements[placement]?.banner) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('✅ 배너 광고 로드 완료:', placement);
          onAdLoaded?.();
        }}
        onAdFailedToLoad={(error) => {
          console.error('❌ 배너 광고 로드 실패:', placement, error);
          onAdFailedToLoad?.(error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1625',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 184, 255, 0.2)',
  },
});

export default TarotBannerAd;
```

#### **2. 전면 광고 Hook**
```typescript
// hooks/useInterstitialAd.ts (새 파일)
import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getCurrentAdUnits } from '../utils/adConfig';

export const useInterstitialAd = () => {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const adUnits = getCurrentAdUnits();
    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : adUnits.interstitial;

    const interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeLoaded = interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('✅ 전면 광고 로드 완료');
        setIsLoaded(true);
      }
    );

    const unsubscribeClosed = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('🔄 전면 광고 닫힘 - 재로딩');
        setIsLoaded(false);
        interstitialAd.load(); // 자동 재로딩
      }
    );

    // 초기 로드
    interstitialAd.load();
    setInterstitial(interstitialAd);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const showAd = async () => {
    if (isLoaded && interstitial) {
      try {
        await interstitial.show();
        console.log('📺 전면 광고 표시됨');
        return true;
      } catch (error) {
        console.error('❌ 전면 광고 표시 실패:', error);
        return false;
      }
    } else {
      console.warn('⚠️ 전면 광고 아직 로드 안 됨');
      return false;
    }
  };

  return { showAd, isLoaded };
};
```

#### **3. 보상형 광고 Hook**
```typescript
// hooks/useRewardedAd.ts (새 파일)
import { useEffect, useState } from 'react';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { getCurrentAdUnits } from '../utils/adConfig';

export const useRewardedAd = () => {
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reward, setReward] = useState<any>(null);

  useEffect(() => {
    const adUnits = getCurrentAdUnits();
    const adUnitId = __DEV__ ? TestIds.REWARDED : adUnits.rewarded;

    const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('✅ 보상형 광고 로드 완료');
        setIsLoaded(true);
      }
    );

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('🎁 보상 획득:', reward);
        setReward(reward);
      }
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      RewardedAdEventType.CLOSED,
      () => {
        console.log('🔄 보상형 광고 닫힘 - 재로딩');
        setIsLoaded(false);
        rewardedAd.load(); // 자동 재로딩
      }
    );

    // 초기 로드
    rewardedAd.load();
    setRewarded(rewardedAd);

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, []);

  const showAd = async () => {
    if (isLoaded && rewarded) {
      try {
        await rewarded.show();
        console.log('🎁 보상형 광고 표시됨');
        return reward;
      } catch (error) {
        console.error('❌ 보상형 광고 표시 실패:', error);
        return null;
      }
    } else {
      console.warn('⚠️ 보상형 광고 아직 로드 안 됨');
      return null;
    }
  };

  return { showAd, isLoaded, reward };
};
```

---

### **Phase 4: 광고 통합 (1시간)**

#### **1. App.tsx에서 초기화**
```typescript
// App.tsx
import React, { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';

export default function App() {
  useEffect(() => {
    // AdMob 초기화
    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        console.log('✅ AdMob 초기화 완료:', adapterStatuses);
      })
      .catch((error) => {
        console.error('❌ AdMob 초기화 실패:', error);
      });
  }, []);

  return (
    // 기존 앱 코드...
  );
}
```

#### **2. 메인 타이머 화면에 배너 추가**
```typescript
// components/tabs/TimerTab.tsx
import TarotBannerAd from '../ads/BannerAd';

const TimerTab = () => {
  return (
    <View style={styles.container}>
      {/* 기존 타이머 UI */}
      <View style={styles.timerContent}>
        {/* ... */}
      </View>

      {/* 배너 광고 (하단 고정) */}
      <TarotBannerAd
        placement="main_screen"
        onAdLoaded={() => console.log('메인 화면 광고 로드됨')}
      />
    </View>
  );
};
```

#### **3. 카드 뽑기 후 전면 광고**
```typescript
// hooks/useTarotCards.ts
import { useInterstitialAd } from './useInterstitialAd';

export const useTarotCards = () => {
  const { showAd: showInterstitial, isLoaded } = useInterstitialAd();
  const [cardDrawCount, setCardDrawCount] = useState(0);

  const drawDailyCards = async () => {
    // 카드 뽑기 로직
    const newCards = await performDrawDailyCards();

    // 카운트 증가
    setCardDrawCount((prev) => prev + 1);

    // 3번마다 전면 광고 표시
    if (cardDrawCount > 0 && cardDrawCount % 3 === 0) {
      setTimeout(() => {
        showInterstitial();
      }, 2000); // 2초 지연
    }

    return newCards;
  };

  return { drawDailyCards };
};
```

#### **4. 프리미엄 체험 보상형 광고**
```typescript
// components/tabs/SettingsTab.tsx
import { useRewardedAd } from '../../hooks/useRewardedAd';
import { usePremium } from '../../contexts/PremiumContext';

const SettingsTab = () => {
  const { showAd: showRewarded } = useRewardedAd();
  const { grantTemporaryPremium } = usePremium();

  const handleWatchAdForPremium = async () => {
    Alert.alert(
      '🎁 프리미엄 무료 체험',
      '광고를 시청하고 24시간 동안 프리미엄 기능을 무료로 이용하세요!',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '광고 시청',
          onPress: async () => {
            const reward = await showRewarded();
            if (reward) {
              // 24시간 프리미엄 부여
              await grantTemporaryPremium(24);
              Alert.alert('🎉 성공', '24시간 동안 프리미엄 기능을 이용하실 수 있습니다!');
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      {/* 프리미엄 섹션 */}
      <TouchableOpacity onPress={handleWatchAdForPremium}>
        <Text>🎁 광고 보고 24시간 무료 체험</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## 📊 4. 광고 성과 모니터링

### **AdMob 대시보드 확인 사항**
```yaml
일일_확인:
  - 노출수 (Impressions)
  - 클릭수 (Clicks)
  - CTR (Click-Through Rate)
  - RPM (1000회 노출당 수익)
  - 예상 수익 (Estimated Earnings)

주간_확인:
  - 광고 유형별 성과
  - 배치별 성과
  - 사용자 세그먼트별 성과
  - 충전률 (Fill Rate)

월간_확인:
  - 총 수익
  - 성장률
  - 이탈률 (광고로 인한)
  - 최적화 기회
```

### **최적화 전략**
```typescript
// 광고 성과 로깅
const logAdPerformance = (adType: string, placement: string, revenue: number) => {
  // Supabase 또는 Analytics에 기록
  supabase.from('ad_performance').insert({
    ad_type: adType,
    placement: placement,
    revenue: revenue,
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
};

// A/B 테스트
const testAdPlacement = () => {
  const variant = Math.random() < 0.5 ? 'A' : 'B';

  if (variant === 'A') {
    // 배너 하단 고정
    return { position: 'bottom', color: '#1a1625' };
  } else {
    // 배너 상단 고정 (테스트)
    return { position: 'top', color: '#2d1b47' };
  }
};
```

---

## 💡 5. 사용자 경험 최적화

### **광고 UX 가이드라인**

#### **✅ 해야 할 것**
```yaml
1. 광고_위치:
   - 콘텐츠 방해 최소화
   - 자연스러운 배치
   - 명확한 광고 표시 (Ad 레이블)

2. 광고_빈도:
   - 적절한 간격 유지 (3분 쿨다운)
   - 일일 제한 설정 (10회 이하)
   - 사용자 피드백 반영

3. 프리미엄_전환:
   - 광고 제거 옵션 명확히 제시
   - 가격 합리적 설정 ($2.99/월)
   - 보상형 광고로 맛보기 제공

4. 성능:
   - 광고 사전 로딩
   - 로딩 실패 시 대체 UI
   - 앱 성능 저하 방지
```

#### **❌ 하지 말아야 할 것**
```yaml
1. 과도한_광고:
   - 1분마다 전면 광고 ❌
   - 화면을 덮는 배너 ❌
   - 닫기 버튼 없는 광고 ❌

2. 사용자_기만:
   - 가짜 닫기 버튼 ❌
   - 오해의 소지가 있는 광고 ❌
   - 콘텐츠와 광고 구분 불가 ❌

3. 성능_저하:
   - 광고로 인한 크래시 ❌
   - 과도한 메모리 사용 ❌
   - 배터리 과다 소모 ❌
```

---

## 🔐 6. 개인정보 보호 및 GDPR

### **필수 설정**

#### **1. 개인정보 처리방침 업데이트**
```markdown
# 광고 관련 추가 내용

## 광고 서비스
본 앱은 Google AdMob을 통해 광고를 표시합니다.

### 수집되는 정보
- 광고 ID (Android Advertising ID)
- 기기 정보 (모델, OS 버전)
- 위치 정보 (선택사항, 타겟 광고용)
- 앱 사용 통계

### 정보 사용 목적
- 맞춤형 광고 표시
- 광고 성과 측정
- 사기 방지

### 정보 공유
- Google AdMob과 공유
- 제3자 광고 네트워크와 공유 가능

### 사용자 권리
- 맞춤형 광고 거부 가능 (설정 > 개인정보 > 광고 설정)
- 데이터 삭제 요청 가능

자세한 내용: https://policies.google.com/privacy
```

#### **2. GDPR 동의 (EU 사용자)**
```typescript
// utils/consentManager.ts
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

export const requestConsent = async () => {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate();

    if (consentInfo.status === AdsConsentStatus.REQUIRED) {
      const { status } = await AdsConsent.showForm();

      if (status === AdsConsentStatus.OBTAINED) {
        console.log('✅ 광고 동의 획득');
        return true;
      } else {
        console.log('❌ 광고 동의 거부');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ 동의 요청 실패:', error);
    return false;
  }
};

// App.tsx에서 호출
useEffect(() => {
  requestConsent();
}, []);
```

---

## 📋 7. 체크리스트

### **✅ AdMob 설정**
- [ ] AdMob 계정 생성
- [ ] 앱 등록
- [ ] 배너 광고 단위 생성
- [ ] 전면 광고 단위 생성
- [ ] 보상형 광고 단위 생성
- [ ] 광고 단위 ID 복사
- [ ] 결제 정보 입력
- [ ] 세금 정보 입력

### **✅ Firebase 설정**
- [ ] Firebase 프로젝트 생성
- [ ] Android 앱 추가
- [ ] google-services.json 다운로드
- [ ] 프로젝트 루트에 파일 배치

### **✅ 코드 설정**
- [ ] react-native-google-mobile-ads 설치
- [ ] app.json 플러그인 추가
- [ ] adConfig.ts 생성 및 ID 입력
- [ ] BannerAd 컴포넌트 업데이트
- [ ] useInterstitialAd Hook 생성
- [ ] useRewardedAd Hook 생성
- [ ] App.tsx에서 AdMob 초기화

### **✅ 광고 통합**
- [ ] 메인 화면에 배너 추가
- [ ] 다이어리에 배너 추가
- [ ] 카드 뽑기 후 전면 광고
- [ ] 스프레드 완료 후 전면 광고
- [ ] 프리미엄 체험 보상형 광고
- [ ] 광고 성과 로깅

### **✅ 테스트**
- [ ] 테스트 광고 ID로 개발 테스트
- [ ] 배너 광고 표시 확인
- [ ] 전면 광고 표시 확인
- [ ] 보상형 광고 표시 확인
- [ ] 프리미엄 사용자 광고 제외 확인
- [ ] 광고 쿨다운 테스트
- [ ] 일일 제한 테스트

### **✅ 출시 준비**
- [ ] 프로덕션 광고 단위 ID로 교체
- [ ] 개인정보 처리방침 업데이트
- [ ] GDPR 동의 구현 (EU 대상)
- [ ] Google Play 정책 준수 확인
- [ ] 광고 배치 최종 검토

---

## 💰 8. 예상 수익 시뮬레이션

### **시나리오 분석**

```yaml
시나리오_1_보수적: (MAU 1만)
  일일_활성_사용자: 3,000명
  배너_노출: 15,000회/일
  전면_광고: 1,000회/일
  보상형_광고: 100회/일

  월간_수익:
    배너: $225 (CPM $0.50)
    전면: $150 (CPM $5.00)
    보상형: $30 (CPM $10.00)
    총액: $405/월

시나리오_2_평균적: (MAU 3만)
  일일_활성_사용자: 10,000명
  배너_노출: 50,000회/일
  전면_광고: 3,000회/일
  보상형_광고: 300회/일

  월간_수익:
    배너: $1,500 (CPM $1.00)
    전면: $900 (CPM $10.00)
    보상형: $180 (CPM $20.00)
    총액: $2,580/월

시나리오_3_낙관적: (MAU 10만)
  일일_활성_사용자: 30,000명
  배너_노출: 150,000회/일
  전면_광고: 9,000회/일
  보상형_광고: 900회/일

  월간_수익:
    배너: $6,750 (CPM $1.50)
    전면: $4,050 (CPM $15.00)
    보상형: $810 (CPM $30.00)
    총액: $11,610/월
```

---

## 🚀 9. 다음 단계

### **즉시 시작 (오늘)**
1. AdMob 계정 생성 (15분)
2. 앱 등록 및 광고 단위 생성 (30분)
3. Firebase 프로젝트 생성 (15분)
4. google-services.json 다운로드 (5분)

### **내일**
1. 패키지 설치 및 설정 (30분)
2. 코드 업데이트 (1-2시간)
3. 테스트 광고로 개발 테스트 (1시간)

### **다음 주**
1. 프로덕션 광고 단위 ID 적용
2. Android 빌드 및 내부 테스트
3. 광고 성과 모니터링 시작
4. 최적화 및 A/B 테스트

---

## 📞 참고 자료

### **공식 문서**
- [Google AdMob 공식 가이드](https://admob.google.com/home/)
- [react-native-google-mobile-ads](https://docs.page/invertase/react-native-google-mobile-ads)
- [Expo AdMob 가이드](https://docs.expo.dev/versions/latest/sdk/admob/)
- [Google Play 광고 정책](https://support.google.com/googleplay/android-developer/answer/9857753)

### **프로젝트 파일**
- `utils/adManager.ts`: 광고 관리 시스템
- `utils/adConfig.ts`: 광고 설정 (생성 필요)
- `components/ads/BannerAd.tsx`: 배너 광고 컴포넌트
- `hooks/useInterstitialAd.ts`: 전면 광고 Hook (생성 필요)
- `hooks/useRewardedAd.ts`: 보상형 광고 Hook (생성 필요)

---

**마지막 업데이트**: 2025-10-15
**작성자**: Claude Code
**상태**: 📋 설정 가이드 작성 완료
**다음 단계**: AdMob 계정 생성 및 앱 등록
**예상 작업 시간**: 3-5시간 (설정 + 코드 + 테스트)
**예상 월 수익**: $500 - $2,500 (MAU 1-5만 기준)
