# 타로 타이머 앱 - 3대 개선 계획
**작성일**: 2025-11-06
**목표**: 성능 최적화 + 코드 유지보수성 향상

---

## 📋 개선 항목 우선순위

1. **NotificationContext 리팩토링** (High Priority ⚠️)
2. **광고 시스템 단순화** (Medium Priority)
3. **번들 크기 최적화** (Medium Priority)

---

## 🎯 개선 1: NotificationContext 리팩토링

### 현재 상태 분석
```
파일: contexts/NotificationContext.tsx
라인: 1,216 라인 (너무 큼)

문제점:
❌ 단일 파일에 모든 로직 집중
❌ 권한 관리 + 스케줄링 + Context 혼재
❌ 유지보수 어려움
❌ 테스트 작성 어려움
```

### 개선 후 구조
```
contexts/
├── NotificationContext.tsx          (120 라인) - Context Provider만
├── notifications/
│   ├── NotificationPermissionManager.ts  (200 라인) - 권한 관리
│   ├── NotificationScheduler.ts          (300 라인) - 스케줄링
│   ├── NotificationTypes.ts              (50 라인)  - 타입 정의
│   └── index.ts                          (30 라인)  - Export
└── NotificationContext.web.tsx      (150 라인) - 웹 버전 (유지)
```

### 단계별 실행 계획

#### Phase 1: 타입 정의 분리 (10분)
```typescript
// contexts/notifications/NotificationTypes.ts
export interface NotificationPermission {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

export interface NotificationSchedule {
  id: string;
  hour: number;
  enabled: boolean;
}

export interface NotificationContextValue {
  hasPermission: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  scheduleHourlyNotifications: () => Promise<void>;
  cancelHourlyNotifications: () => void;
}
```

#### Phase 2: 권한 관리 모듈 분리 (30분)
```typescript
// contexts/notifications/NotificationPermissionManager.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationPermissionManager {
  private static permissionStatus: string | null = null;

  /**
   * 알림 권한 요청
   */
  static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        this.permissionStatus = status;
        return status === 'granted';
      }
      
      this.permissionStatus = existingStatus;
      return true;
    } catch (error) {
      console.error('권한 요청 실패:', error);
      return false;
    }
  }

  /**
   * 현재 권한 상태 확인
   */
  static async checkPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      const { status } = await Notifications.getPermissionsAsync();
      this.permissionStatus = status;
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * 권한 상태 초기화
   */
  static reset(): void {
    this.permissionStatus = null;
  }
}
```

#### Phase 3: 스케줄링 모듈 분리 (45분)
```typescript
// contexts/notifications/NotificationScheduler.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationScheduler {
  private static scheduledIds: string[] = [];

  /**
   * 시간별 알림 스케줄링 (24시간)
   */
  static async scheduleHourlyNotifications(
    cards: any[],
    currentHour: number
  ): Promise<string[]> {
    if (Platform.OS === 'web') return [];

    const ids: string[] = [];

    try {
      // 기존 알림 취소
      await this.cancelAll();

      // 24시간 알림 생성
      for (let hour = 0; hour < 24; hour++) {
        if (hour <= currentHour) continue; // 이미 지난 시간은 스킵

        const card = cards[hour];
        const id = await this.scheduleNotification({
          hour,
          title: `${hour}시 타로 카드`,
          body: card ? `${card.name} - 카드를 확인해보세요` : '새로운 카드가 준비되었습니다',
        });

        if (id) ids.push(id);
      }

      this.scheduledIds = ids;
      console.log(`✅ ${ids.length}개 알림 스케줄링 완료`);
      return ids;
    } catch (error) {
      console.error('❌ 알림 스케줄링 실패:', error);
      return [];
    }
  }

  /**
   * 단일 알림 스케줄링
   */
  private static async scheduleNotification(config: {
    hour: number;
    title: string;
    body: string;
  }): Promise<string | null> {
    try {
      const trigger = {
        hour: config.hour,
        minute: 0,
        repeats: true,
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          sound: true,
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error(`알림 생성 실패 (${config.hour}시):`, error);
      return null;
    }
  }

  /**
   * 8AM 리마인더 스케줄링
   */
  static async schedule8AMReminder(): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      await this.cancelAll();

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '타로 타이머',
          body: '오늘의 24시간 카드를 뽑아보세요!',
          sound: true,
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        },
      });

      this.scheduledIds = [id];
      console.log('✅ 8AM 리마인더 생성 완료');
      return id;
    } catch (error) {
      console.error('❌ 8AM 리마인더 생성 실패:', error);
      return null;
    }
  }

  /**
   * 모든 알림 취소
   */
  static async cancelAll(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledIds = [];
      console.log('🔕 모든 알림 취소 완료');
    } catch (error) {
      console.error('❌ 알림 취소 실패:', error);
    }
  }

  /**
   * 스케줄된 알림 ID 목록 가져오기
   */
  static getScheduledIds(): string[] {
    return [...this.scheduledIds];
  }
}
```

#### Phase 4: Context 단순화 (30분)
```typescript
// contexts/NotificationContext.tsx (120 라인으로 축소)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { NotificationPermissionManager } from './notifications/NotificationPermissionManager';
import { NotificationScheduler } from './notifications/NotificationScheduler';
import type { NotificationContextValue } from './notifications/NotificationTypes';

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 권한 확인
  useEffect(() => {
    checkInitialPermission();
  }, []);

  const checkInitialPermission = async () => {
    const granted = await NotificationPermissionManager.checkPermission();
    setHasPermission(granted);
    setIsLoading(false);
  };

  const requestPermission = useCallback(async () => {
    const granted = await NotificationPermissionManager.requestPermission();
    setHasPermission(granted);
    return granted;
  }, []);

  const scheduleHourlyNotifications = useCallback(async () => {
    // 카드 데이터 로드 로직
    // ...
    await NotificationScheduler.scheduleHourlyNotifications(cards, currentHour);
  }, []);

  const cancelHourlyNotifications = useCallback(() => {
    NotificationScheduler.cancelAll();
  }, []);

  const value: NotificationContextValue = {
    hasPermission,
    isLoading,
    requestPermission,
    scheduleHourlyNotifications,
    cancelHourlyNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
```

#### Phase 5: 테스트 및 검증 (30분)
```bash
# 1. 기존 기능 동작 확인
# 2. 리팩토링 후 동작 확인
# 3. 권한 요청 테스트
# 4. 알림 스케줄링 테스트
# 5. 8AM 리마인더 테스트
```

### 예상 소요 시간: **2시간 25분**

### 기대 효과
```
✅ 1,216 라인 → 약 600 라인으로 감소
✅ 모듈별 책임 명확히 분리
✅ 테스트 작성 용이
✅ 유지보수성 대폭 향상
✅ 재사용성 증가
```

---

## 🎯 개선 2: 광고 시스템 단순화

### 현재 상태 분석
```
파일 구조:
utils/adManager.ts              - 실제 Google Ads
components/ads/MockAdOverlay.tsx - Mock UI
utils/adMockEvents.ts           - Mock 이벤트

문제점:
❌ Mock과 실제 광고 로직 혼재
❌ 환경 분기 처리 복잡함
❌ adMockEvents.ts 별도 파일 관리
```

### 개선 후 구조
```
utils/ads/
├── AdManager.ts                  (100 라인) - 통합 인터페이스
├── RealAdManager.ts              (200 라인) - 실제 Google Ads
├── MockAdManager.ts              (150 라인) - Mock (개발용)
├── AdTypes.ts                    (30 라인)  - 타입 정의
└── index.ts                      (20 라인)  - 환경별 Export

components/ads/
└── (삭제 - MockAdOverlay.tsx 제거)

App.tsx 사용:
import AdManager from './utils/ads'; // 자동으로 환경 선택
```

### 단계별 실행 계획

#### Phase 1: 타입 정의 (10분)
```typescript
// utils/ads/AdTypes.ts
export interface AdConfig {
  unitId: string;
  testDeviceIds?: string[];
}

export interface AdManager {
  initialize(): Promise<void>;
  showInterstitial(): Promise<boolean>;
  isReady(): boolean;
}

export enum AdEvent {
  Loaded = 'loaded',
  Failed = 'failed',
  Shown = 'shown',
  Closed = 'closed',
}
```

#### Phase 2: 인터페이스 정의 (15분)
```typescript
// utils/ads/AdManager.ts
import type { AdManager as IAdManager, AdConfig } from './AdTypes';

export abstract class BaseAdManager implements IAdManager {
  protected initialized = false;
  protected config: AdConfig;

  constructor(config: AdConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract showInterstitial(): Promise<boolean>;
  abstract isReady(): boolean;
}
```

#### Phase 3: 실제 광고 구현 (30분)
```typescript
// utils/ads/RealAdManager.ts
import { BaseAdManager } from './AdManager';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

export class RealAdManager extends BaseAdManager {
  private interstitial: InterstitialAd | null = null;

  async initialize(): Promise<void> {
    try {
      this.interstitial = InterstitialAd.createForAdRequest(this.config.unitId);
      
      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ 광고 로드 완료');
      });

      await this.interstitial.load();
      this.initialized = true;
    } catch (error) {
      console.error('❌ 광고 초기화 실패:', error);
    }
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.interstitial || !this.isReady()) {
      console.warn('⚠️ 광고가 준비되지 않음');
      return false;
    }

    try {
      await this.interstitial.show();
      return true;
    } catch (error) {
      console.error('❌ 광고 표시 실패:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.initialized && this.interstitial?.loaded === true;
  }
}
```

#### Phase 4: Mock 광고 구현 (20분)
```typescript
// utils/ads/MockAdManager.ts
import { BaseAdManager } from './AdManager';
import { Alert } from 'react-native';

export class MockAdManager extends BaseAdManager {
  async initialize(): Promise<void> {
    console.log('🎭 Mock 광고 매니저 초기화');
    this.initialized = true;
  }

  async showInterstitial(): Promise<boolean> {
    console.log('🎭 Mock 전면 광고 표시');
    
    return new Promise((resolve) => {
      Alert.alert(
        '🎭 Mock 광고',
        '개발 환경에서는 실제 광고가 표시되지 않습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              console.log('🎭 Mock 광고 닫힘');
              resolve(true);
            },
          },
        ]
      );
    });
  }

  isReady(): boolean {
    return this.initialized;
  }
}
```

#### Phase 5: 환경별 Export (10분)
```typescript
// utils/ads/index.ts
import { Platform } from 'react-native';
import { RealAdManager } from './RealAdManager';
import { MockAdManager } from './MockAdManager';
import type { AdConfig } from './AdTypes';

const AD_CONFIG: AdConfig = {
  unitId: Platform.select({
    ios: 'ca-app-pub-XXXX/YYYY',
    android: 'ca-app-pub-XXXX/ZZZZ',
    default: 'ca-app-pub-test',
  }) as string,
};

// 환경에 따라 자동 선택
const AdManager = __DEV__ 
  ? new MockAdManager(AD_CONFIG)
  : new RealAdManager(AD_CONFIG);

export default AdManager;
```

#### Phase 6: 기존 코드 정리 (20분)
```bash
# 삭제할 파일:
- components/ads/MockAdOverlay.tsx
- utils/adMockEvents.ts

# 수정할 파일:
- App.tsx (import 경로 변경)
- hooks/useTarotCards.ts (광고 호출 단순화)
```

### 예상 소요 시간: **1시간 45분**

### 기대 효과
```
✅ 3개 파일 → 5개 파일로 정리 (모듈화)
✅ Mock과 실제 완전 분리
✅ 환경 분기 자동화
✅ 코드 복잡도 대폭 감소
✅ 테스트 작성 용이
```

---

## 🎯 개선 3: 번들 크기 최적화

### 현재 상태 분석
```
주요 의존성:
- expo: 54.0.20 (큼)
- @supabase/supabase-js: 2.57.4
- react-native-google-mobile-ads: 15.8.1
- react-native-iap: 14.4.23

문제점:
⚠️ 사용하지 않는 Supabase 기능 포함
⚠️ 이미지 최적화 부족
⚠️ 동적 import 미사용
```

### 개선 전략

#### Strategy 1: 조건부 Import (30분)
```typescript
// Before (App.tsx)
import { SupabaseTest } from './components/SupabaseTest';
import { PremiumTest } from './components/PremiumTest';

// After
const SupabaseTest = __DEV__
  ? require('./components/SupabaseTest').SupabaseTest
  : null;

const PremiumTest = __DEV__
  ? require('./components/PremiumTest').PremiumTest
  : null;
```

#### Strategy 2: React.lazy() 적용 (45분)
```typescript
// 현재: 모든 탭 동기 로드
import TimerTab from './components/tabs/TimerTab';
import SpreadTab from './components/tabs/SpreadTab';
import DailyTab from './components/tabs/DailyTab';
import SettingsTab from './components/tabs/SettingsTab';

// 개선: 동적 로딩
const TimerTab = React.lazy(() => import('./components/tabs/TimerTab'));
const SpreadTab = React.lazy(() => import('./components/tabs/SpreadTab'));
const DailyTab = React.lazy(() => import('./components/tabs/DailyTab'));
const SettingsTab = React.lazy(() => import('./components/tabs/SettingsTab'));

// Suspense로 감싸기
<Suspense fallback={<LoadingSpinner />}>
  <TimerTab />
</Suspense>
```

#### Strategy 3: Supabase Tree-shaking (20분)
```typescript
// Before
import { createClient } from '@supabase/supabase-js';

// After (필요한 것만 import)
import { SupabaseClient } from '@supabase/supabase-js/dist/module/SupabaseClient';
```

#### Strategy 4: 이미지 최적화 (30분)
```typescript
// utils/imageCache.ts 개선
export const OPTIMIZED_IMAGE_CONFIG = {
  quality: 0.8,           // 80% 품질
  maxWidth: 800,          // 최대 너비
  maxHeight: 1200,        // 최대 높이
  format: 'webp',         // WebP 포맷 사용
};

// Expo Image 활용
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  contentFit="contain"
  transition={200}
  cachePolicy="memory-disk" // 캐싱 전략
/>
```

#### Strategy 5: Metro 번들러 최적화 (15분)
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
      },
    },
  },
  resolver: {
    // 불필요한 확장자 제외
    sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json'],
  },
};
```

### 예상 소요 시간: **2시간 20분**

### 기대 효과
```
✅ 번들 크기 15-20% 감소
✅ 초기 로딩 속도 향상
✅ 메모리 사용량 감소
✅ 앱 반응성 향상
```

---

## 📊 전체 실행 계획 요약

### 우선순위별 실행 순서

**Phase 1 (High Priority): NotificationContext 리팩토링**
- 예상 시간: 2시간 25분
- 난이도: 중
- 영향도: 높음
- **권장: 먼저 실행**

**Phase 2 (Medium Priority): 광고 시스템 단순화**
- 예상 시간: 1시간 45분
- 난이도: 중
- 영향도: 중간
- **권장: 두 번째 실행**

**Phase 3 (Medium Priority): 번들 크기 최적화**
- 예상 시간: 2시간 20분
- 난이도: 중-고
- 영향도: 중간
- **권장: 세 번째 실행**

### 총 예상 소요 시간: **6시간 30분**

### 단계별 검증
```
각 Phase 완료 후:
1. ✅ 기존 기능 정상 동작 확인
2. ✅ 테스트 실행
3. ✅ 빌드 확인
4. ✅ 커밋 및 푸시
```

---

## 🎯 실행 방법

### Option A: 순차적 실행 (권장)
```
Day 1: NotificationContext 리팩토링
Day 2: 광고 시스템 단순화
Day 3: 번들 크기 최적화
```

### Option B: 병렬 실행 (빠름, 위험)
```
동시에 3개 작업 진행
주의: 충돌 가능성 있음
```

### Option C: 단계적 실행 (안전)
```
Week 1: NotificationContext만
Week 2: 광고 시스템만
Week 3: 번들 최적화만
```

---

## ✅ 체크리스트

### 작업 전 준비
- [ ] 현재 코드 백업
- [ ] Git 브랜치 생성 (refactor/improvements)
- [ ] 테스트 환경 준비
- [ ] 개발 서버 실행 확인

### 작업 중
- [ ] Phase 1: NotificationContext 리팩토링
- [ ] Phase 2: 광고 시스템 단순화
- [ ] Phase 3: 번들 크기 최적화

### 작업 후
- [ ] 전체 기능 테스트
- [ ] 빌드 테스트
- [ ] TestFlight 배포
- [ ] 사용자 피드백 수집

---

## 🎯 기대 효과 (전체)

### 코드 품질
```
Before:
- NotificationContext: 1,216 라인
- 광고 시스템: 3개 파일 혼재
- 번들 크기: 최적화 안 됨

After:
- NotificationContext: ~600 라인 (모듈화)
- 광고 시스템: 깔끔한 5개 파일
- 번들 크기: 15-20% 감소
```

### 유지보수성
```
✅ 모듈별 책임 명확
✅ 테스트 작성 용이
✅ 코드 가독성 향상
✅ 신규 개발자 온보딩 쉬움
```

### 성능
```
✅ 초기 로딩 속도 향상
✅ 메모리 사용량 감소
✅ 번들 크기 감소
✅ 앱 반응성 향상
```

---

**작성자**: Claude Code
**계획 완료**: 2025-11-06
**실행 준비**: ✅ Ready to Start
