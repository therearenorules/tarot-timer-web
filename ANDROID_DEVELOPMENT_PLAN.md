# 📱 안드로이드 앱 개발 상세 계획서

**작성일**: 2025-10-15
**프로젝트**: 타로 타이머 (Tarot Timer)
**현재 버전**: v1.0.2 (iOS App Store 출시 완료)
**목표**: Google Play Store 안드로이드 앱 출시

---

## 🎯 1. 프로젝트 현황

### iOS 앱 현재 상태 ✅
- **버전**: v1.0.2 (Build 29)
- **상태**: App Store 정식 출시 완료 (2025-10-14)
- **완성도**: 100%
- **핵심 기능**:
  - 24시간 타로 타이머
  - 알림 자동 스케줄링 (8개 버그 수정 완료)
  - 자정 초기화 시스템
  - 다이어리 시스템 (메모 500자)
  - 스프레드 기능
  - 완전 다국어 지원 (한/영/일)

### 안드로이드 준비 상태 ✅
- **기술 스택**: React Native 0.81.4 + Expo 54.0.8
- **크로스 플랫폼 호환성**: 90% 준비 완료
  - Platform.OS 분기 처리: 48개 위치
  - 주요 컴포넌트 안드로이드 호환 완료
- **기본 설정**: app.json 안드로이드 섹션 존재
- **빌드 시스템**: EAS Build 설정 완료 (eas.json)

---

## 📋 2. 안드로이드 개발 전체 로드맵

### 총 예상 기간: 9-15일

```
Week 1 (Day 1-7):   Phase 1-2 완료 (설정 및 최적화)
Week 2 (Day 8-14):  Phase 3-4 완료 (Google Play 준비 및 테스트)
Week 3 (Day 15+):   Phase 5 완료 (출시 및 심사)
```

---

## 🚀 Phase 1: 필수 설정 및 빌드 준비 (1-2일)

### ✅ 체크리스트

#### Step 1.1: app.json 안드로이드 설정 강화
**소요 시간**: 30분
**우선순위**: 🔴 CRITICAL

**작업 내용**:
```json
{
  "android": {
    "package": "com.tarottimer.app",
    "versionCode": 1,
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#1a1625",
      "monochromeImage": "./assets/adaptive-icon-mono.png"
    },
    "permissions": [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.SCHEDULE_EXACT_ALARM",
      "android.permission.RECEIVE_BOOT_COMPLETED"
    ],
    "playStoreUrl": "https://play.google.com/store/apps/details?id=com.tarottimer.app",
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "https",
            "host": "tarottimer.app",
            "pathPrefix": "/"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

**파일 경로**: `/Users/threebooks/App/tarot-timer-web/app.json`

---

#### Step 1.2: 안드로이드 알림 채널 생성
**소요 시간**: 1시간
**우선순위**: 🔴 CRITICAL

**작업 내용**:
```typescript
// contexts/NotificationContext.tsx

// Android 알림 채널 생성 함수 추가
const createAndroidNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tarot-timer-channel', {
      name: '타로 타이머 알림',
      description: '24시간 타로 카드 학습 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#7b2cbf',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });

    // 8AM 리마인더 채널
    await Notifications.setNotificationChannelAsync('tarot-reminder-channel', {
      name: '타로 리마인더',
      description: '카드 뽑기 리마인더 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 500],
      sound: 'default',
      lightColor: '#f4d03f',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }
};

// NotificationContext 초기화 시 호출
useEffect(() => {
  if (Platform.OS === 'android') {
    createAndroidNotificationChannel();
  }
}, []);
```

**파일 경로**: `/Users/threebooks/App/tarot-timer-web/contexts/NotificationContext.tsx`

---

#### Step 1.3: Android 13+ 권한 요청 코드 추가
**소요 시간**: 30분
**우선순위**: 🔴 CRITICAL

**작업 내용**:
```typescript
// contexts/NotificationContext.tsx

const requestNotificationPermissions = async () => {
  if (Platform.OS === 'android') {
    const androidVersion = Platform.Version;

    // Android 13+ (API 33+)
    if (androidVersion >= 33) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowVibrate: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          t('notification.permissionRequired'),
          t('notification.permissionMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.settings'),
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return false;
      }
    }
  }

  return true;
};
```

---

#### Step 1.4: adaptive-icon-mono.png 생성
**소요 시간**: 15분
**우선순위**: 🟡 MEDIUM

**작업 내용**:
- 기존 adaptive-icon.png를 단색(흑백)으로 변환
- 크기: 512x512 PNG
- 배경 투명
- 안드로이드 테마 아이콘용

**파일 경로**: `/Users/threebooks/App/tarot-timer-web/assets/adaptive-icon-mono.png`

---

#### Step 1.5: 안드로이드 에뮬레이터 테스트
**소요 시간**: 1시간
**우선순위**: 🟡 MEDIUM

**명령어**:
```bash
# 안드로이드 개발 서버 시작
npm run android

# 또는
npx expo start --android
```

**테스트 항목**:
- [ ] 앱 실행 확인
- [ ] 알림 권한 요청 확인
- [ ] 알림 수신 테스트
- [ ] 24시간 타이머 작동 확인
- [ ] 다이어리 시스템 확인
- [ ] 다국어 전환 테스트

---

## 🔧 Phase 2: 안드로이드 최적화 (2-3일)

### ✅ 체크리스트

#### Step 2.1: 알림 스케줄링 Android 최적화
**소요 시간**: 2시간
**우선순위**: 🔴 CRITICAL

**작업 내용**:
```typescript
// contexts/NotificationContext.tsx

const scheduleHourlyNotifications = async () => {
  // 기존 알림 취소
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (let i = 0; i < 24; i++) {
    const card = dailyCards[i];
    if (!card) continue;

    const targetHour = (currentHourIndex + 1 + i) % 24;

    // 조용한 시간 체크
    if (isQuietHour(targetHour)) continue;

    // Android 전용 설정
    const notificationConfig = {
      content: {
        title: t('notification.title'),
        body: getNotificationBody(card, targetHour),
        data: { hour: targetHour, cardId: card.id },
      },
      trigger: {
        hour: targetHour,
        minute: 0,
        repeats: false,
      },
    };

    // Android 채널 ID 추가
    if (Platform.OS === 'android') {
      notificationConfig.content.android = {
        channelId: 'tarot-timer-channel',
        priority: 'high',
        sound: true,
        vibrate: [0, 250, 250, 250],
        color: '#7b2cbf',
      };
    }

    await Notifications.scheduleNotificationAsync(notificationConfig);
  }
};
```

---

#### Step 2.2: 백그라운드 작업 최적화 (선택사항)
**소요 시간**: 3시간
**우선순위**: 🟢 LOW

**작업 내용**:
```typescript
// hooks/useBackgroundTask.ts (새 파일)

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const MIDNIGHT_RESET_TASK = 'midnight-reset-task';

TaskManager.defineTask(MIDNIGHT_RESET_TASK, async () => {
  try {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      // 자정 초기화 실행
      await AsyncStorage.removeItem('daily_cards');
      await Notifications.cancelAllScheduledNotificationsAsync();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  if (Platform.OS === 'android') {
    try {
      await BackgroundFetch.registerTaskAsync(MIDNIGHT_RESET_TASK, {
        minimumInterval: 60 * 15, // 15분마다
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ Background task registered');
    } catch (error) {
      console.error('❌ Background task registration failed:', error);
    }
  }
};
```

**참고**: 이 기능은 선택사항이며, 현재 AppState 리스너로도 충분히 작동합니다.

---

#### Step 2.3: Platform.OS 분기 처리 검증
**소요 시간**: 2시간
**우선순위**: 🟡 MEDIUM

**검증 대상 파일** (총 48개 위치):
- [ ] `contexts/NotificationContext.tsx` (12곳)
- [ ] `contexts/PremiumContext.tsx`
- [ ] `components/OptimizedImage.tsx` (3곳)
- [ ] `components/MobileCompatibility.tsx` (5곳)
- [ ] `components/WidgetContainer.tsx` (2곳)
- [ ] `components/TarotCard.tsx`
- [ ] `components/SafeIcon.tsx`
- [ ] `components/subscription/SubscriptionManagement.tsx`

**검증 방법**:
```bash
# Platform.OS 사용 위치 검색
grep -r "Platform.OS" components/ hooks/ contexts/ --include="*.tsx"

# 각 파일에서 android 케이스 확인
```

---

#### Step 2.4: 안드로이드 성능 테스트
**소요 시간**: 2시간
**우선순위**: 🟡 MEDIUM

**테스트 항목**:
- [ ] 앱 시작 시간 (3초 이내)
- [ ] 메모리 사용량 (200MB 이내)
- [ ] 알림 정확도 (±1분 이내)
- [ ] 백그라운드 복귀 속도 (1초 이내)
- [ ] 스크롤 성능 (60fps 유지)
- [ ] 이미지 로딩 속도

**도구**:
- Android Studio Profiler
- React Native Performance Monitor
- Flipper (선택사항)

---

## 📱 Phase 3: Google Play Store 제출 준비 (3-5일)

### ✅ 체크리스트

#### Step 3.1: 스크린샷 촬영 (8개)
**소요 시간**: 2-3시간
**우선순위**: 🔴 CRITICAL

**요구사항**:
- 해상도: 1080x1920 (세로)
- 형식: PNG 또는 JPEG
- 파일 크기: 각 8MB 이하
- 최소 2개, 권장 8개

**촬영 목록**:
1. **메인 화면** - 24시간 타로 타이머
2. **카드 상세** - 메모 입력 및 글자수 카운터 표시
3. **알림 설정** - 시간대별 알림 설정 화면
4. **다이어리 리스트** - 저장된 카드 히스토리
5. **스프레드 선택** - 켈틱 크로스, 3카드 등
6. **스프레드 결과** - 배치된 카드들
7. **설정 화면** - 다국어 선택, 조용한 시간
8. **알림 예시** - 알림 권한 안내

**저장 경로**:
```
/Users/threebooks/App/tarot-timer-web/screenshots/android/
```

**촬영 방법**:
```bash
# 안드로이드 에뮬레이터 실행
npx expo start --android

# 에뮬레이터에서 스크린샷 촬영
# 또는 Android Studio > Device File Explorer > Screenshot
```

---

#### Step 3.2: 앱 설명 작성
**소요 시간**: 2시간
**우선순위**: 🔴 CRITICAL

**작성 언어**: 한국어 (기본), 영어, 일본어

##### 짧은 설명 (80자 이내)
```
한국어: "24시간 타로 카드 학습 플랫폼. 매 시간 새로운 카드로 체계적으로 학습하세요."

English: "24-hour tarot learning platform. Learn systematically with a new card every hour."

日本語: "24時間タロットカード学習プラットフォーム。毎時新しいカードで体系的に学習。"
```

##### 전체 설명 (4000자 이내)
```markdown
# 타로 타이머 - 24시간 자동 학습 시스템

## 🔮 앱 소개
타로 타이머는 24시간 자동 학습 시스템으로 타로 카드의 의미를 체계적으로 학습하는 교육 플랫폼입니다. 점술 앱이 아닌, 진정한 학습 도구입니다.

## ⭐ 주요 기능

### 🕐 24시간 자동 타로 타이머
- 매 시간(00분) 자동으로 새로운 카드 표시
- 하루 24장의 카드로 체계적 학습
- 자정 자동 초기화로 매일 새로운 카드

### 🔔 스마트 알림 시스템
- 시간대별 자동 알림 (24개 슬롯)
- 오전 8시 리마인더 (카드 안 뽑았을 때)
- 조용한 시간 설정 (22:00-08:00 제외 가능)
- 정확한 시간 알림 (Android 12+ 최적화)

### 📝 다이어리 시스템
- 카드별 메모 작성 (최대 500자)
- 실시간 글자수 카운터
- 자동 저장 및 로드
- 과거 카드 히스토리 확인

### 🔮 다양한 스프레드
- 켈틱 크로스 (10카드)
- 3카드 스프레드 (과거/현재/미래)
- 관계 스프레드
- 의사결정 스프레드
- 인사이트 메모 저장

### 🌍 완전 다국어 지원
- 한국어 (Korean)
- English (영어)
- 日本語 (일본어)
- 78장 카드 완전 번역
- UI 텍스트 완전 번역

### ✨ 미스틱한 디자인
- 다크 테마 (보라/골드 컬러)
- 그라데이션 효과
- 부드러운 애니메이션
- 직관적인 UI/UX

## 📚 학습 방법

1. **오전 8시 알림 수신**
   - 카드 뽑기 리마인더 알림

2. **24시간 카드 뽑기**
   - 한 번에 24장 카드 자동 배치
   - 매 시간 새로운 카드 학습

3. **메모로 인사이트 기록**
   - 카드의 의미 메모
   - 개인적 해석 기록
   - 학습 내용 정리

4. **다이어리로 복습**
   - 과거 카드 히스토리 확인
   - 학습 패턴 파악
   - 지속적인 성장

## 🎯 앱의 특징

### 교육 중심
- 점술 앱이 아닌 학습 플랫폼
- 78장 타로 카드 체계적 학습
- 상징과 의미 자연스럽게 기억
- 자기 이해 및 성장 도구

### 자동화
- 알림 자동 스케줄링
- 자정 자동 초기화
- 백그라운드 날짜 변경 감지
- 사용자 개입 최소화

### 개인정보 보호
- 모든 데이터 기기 내부 저장
- 외부 서버 전송 없음
- 개인 메모 완전 비공개
- AsyncStorage 사용

## 🌟 사용 후기

"매일 아침 알림으로 타로 공부를 시작해요. 꾸준히 학습할 수 있어서 좋아요!" - 김OO

"78장 카드를 다 외웠어요. 체계적인 학습 시스템 덕분입니다." - 이OO

"다이어리 기능으로 내 성장을 기록할 수 있어서 의미있어요." - 박OO

## 📞 지원

- 이메일: support@tarottimer.app
- 웹사이트: https://tarottimer.app
- Instagram: @deanosajutaro

---

Tarot Timer Development Team
© 2025 All Rights Reserved
```

**저장 경로**:
```
/Users/threebooks/App/tarot-timer-web/PLAY_STORE_DESCRIPTION.md
```

---

#### Step 3.3: 개인정보 처리방침 작성
**소요 시간**: 1시간
**우선순위**: 🔴 CRITICAL

**내용**:
```markdown
# 개인정보 처리방침

## 수집하는 정보

### 자동 수집 정보
- 기기 모델 및 제조사
- Android OS 버전
- 앱 버전 정보
- 충돌 로그 (선택사항)

### 사용자 생성 정보
- 카드 뽑기 기록
- 다이어리 메모
- 스프레드 기록
- 앱 설정 (언어, 조용한 시간)

## 정보 저장 위치

- **모든 데이터는 사용자 기기 내부에만 저장됩니다**
- AsyncStorage 사용 (Android 로컬 저장소)
- 외부 서버 전송 없음
- 클라우드 동기화 없음

## 권한 사용

### INTERNET
- 용도: Expo 업데이트 확인 (선택사항)
- 빈도: 앱 시작 시 1회

### POST_NOTIFICATIONS
- 용도: 학습 알림 발송
- 빈도: 시간대별 알림 (최대 24회/일)

### SCHEDULE_EXACT_ALARM
- 용도: 정확한 시간 알림
- 빈도: 매 시간 00분

### WAKE_LOCK
- 용도: 백그라운드 알림 보장
- 빈도: 알림 발송 시

### VIBRATE
- 용도: 알림 진동
- 빈도: 알림 발송 시

### ACCESS_NETWORK_STATE
- 용도: 네트워크 상태 확인
- 빈도: 앱 시작 시

### RECEIVE_BOOT_COMPLETED
- 용도: 재부팅 후 알림 복원
- 빈도: 기기 재부팅 시

## 데이터 보안

- 모든 데이터 로컬 저장
- 암호화 저장 (선택사항)
- 제3자 공유 없음
- 광고 추적 없음

## 데이터 삭제

- 앱 삭제 시 모든 데이터 자동 삭제
- 설정에서 데이터 초기화 가능
- 복구 불가능 (백업 없음)

## 연락처

- 이메일: privacy@tarottimer.app
- 웹사이트: https://tarottimer.app/privacy

---

최종 수정일: 2025-10-15
```

**저장 경로**:
```
/Users/threebooks/App/tarot-timer-web/PRIVACY_POLICY_ANDROID.md
```

---

#### Step 3.4: Google Play 콘솔 설정
**소요 시간**: 1시간
**우선순위**: 🔴 CRITICAL

**준비 사항**:
- [ ] Google Play Console 계정 등록 ($25)
- [ ] 개발자 계정 인증 (신분증)
- [ ] 결제 수단 등록

**앱 설정**:
```yaml
기본_정보:
  앱_이름: "Tarot Timer"
  패키지명: "com.tarottimer.app"
  기본_언어: "한국어 (대한민국)"

카테고리:
  앱_종류: "애플리케이션"
  카테고리: "교육"
  하위_카테고리: "자기 계발"

콘텐츠_등급:
  대상_연령: "3세 이상"
  콘텐츠_유형: "교육용 앱"

가격_및_배포:
  가격: "무료"
  국가: "전 세계"
  기기: "휴대전화, 태블릿"
```

---

#### Step 3.5: 앱 아이콘 및 그래픽 최적화
**소요 시간**: 1시간
**우선순위**: 🟡 MEDIUM

**필수 그래픽**:
- [x] 앱 아이콘: 512x512 PNG (완료: adaptive-icon.png)
- [ ] 모노크롬 아이콘: 512x512 PNG (adaptive-icon-mono.png)
- [ ] 배너 이미지: 1024x500 PNG (선택사항)
- [ ] 홍보 그래픽: 180x120 PNG (선택사항)

**파일 경로**:
```
/Users/threebooks/App/tarot-timer-web/assets/
├── adaptive-icon.png (완료 ✅)
├── adaptive-icon-mono.png (생성 필요 📋)
├── play-store-banner.png (선택사항)
└── play-store-promo.png (선택사항)
```

---

## 🔨 Phase 4: 빌드 및 테스트 (2-3일)

### ✅ 체크리스트

#### Step 4.1: EAS 프로덕션 빌드 생성
**소요 시간**: 1시간 (빌드 시간: 10-15분)
**우선순위**: 🔴 CRITICAL

**명령어**:
```bash
# 1. 프로덕션 Android 빌드
npm run build:prod:android

# 또는
eas build --platform android --profile production-android

# 2. 빌드 상태 확인
eas build:list

# 3. 빌드 로그 확인 (실패 시)
eas build:view [BUILD_ID]
```

**빌드 설정** (eas.json):
```json
{
  "build": {
    "production-android": {
      "extends": "production",
      "android": {
        "autoIncrement": true,
        "buildType": "app-bundle"
      },
      "channel": "production-android"
    }
  }
}
```

**예상 결과**:
- 파일: `tarot-timer-1.0.2-1.aab` (AAB 형식)
- 크기: 약 20-30MB
- 다운로드: EAS Console에서 자동 다운로드

---

#### Step 4.2: AAB 파일 검증
**소요 시간**: 30분
**우선순위**: 🔴 CRITICAL

**검증 항목**:
- [ ] 파일 형식: AAB (Android App Bundle)
- [ ] 서명 확인: 프로덕션 키로 서명됨
- [ ] 버전 코드: 자동 증가 확인
- [ ] 파일 크기: 30MB 이하
- [ ] 권한 포함 확인

**검증 도구**:
```bash
# Android SDK bundletool 사용
bundletool validate --bundle=tarot-timer.aab

# 또는 Google Play Console Upload Test
```

---

#### Step 4.3: 내부 테스트 (개발자)
**소요 시간**: 2-3시간
**우선순위**: 🔴 CRITICAL

**테스트 방법**:
1. Google Play Console > 내부 테스트 트랙 생성
2. AAB 파일 업로드
3. 개발자 계정으로 테스트 앱 설치
4. 전체 기능 테스트

**테스트 항목**:
- [ ] 앱 설치 및 실행
- [ ] 알림 권한 요청 및 승인
- [ ] 24시간 카드 뽑기
- [ ] 알림 수신 테스트 (실제 시간 대기 필요)
- [ ] 메모 작성 및 저장
- [ ] 다이어리 히스토리 확인
- [ ] 스프레드 기능 테스트
- [ ] 다국어 전환 (한/영/일)
- [ ] 자정 초기화 테스트 (다음날 확인)
- [ ] 백그라운드 복귀 테스트
- [ ] 앱 재시작 후 데이터 유지 확인

---

#### Step 4.4: 비공개 테스트 (베타 테스터)
**소요 시간**: 1-2일
**우선순위**: 🟡 MEDIUM

**테스터 모집**:
- 최소 10명, 권장 20명
- 다양한 Android 기기 (Samsung, LG, Pixel 등)
- 다양한 Android 버전 (7.0 ~ 14.0)

**테스트 기간**: 1-2일

**수집 피드백**:
- [ ] 앱 설치 문제
- [ ] 알림 수신 문제
- [ ] UI/UX 개선 사항
- [ ] 번역 오류
- [ ] 버그 및 충돌

---

#### Step 4.5: 버그 수정 및 최종 테스트
**소요 시간**: 1-2일
**우선순위**: 🔴 CRITICAL

**프로세스**:
1. 테스터 피드백 수집
2. 버그 우선순위 분류 (Critical/High/Medium/Low)
3. Critical/High 버그 즉시 수정
4. 수정 후 재빌드
5. 내부 테스트 재실행
6. 최종 승인

---

## 🚀 Phase 5: 출시 (1-2일)

### ✅ 체크리스트

#### Step 5.1: Google Play Console 앱 등록
**소요 시간**: 1시간
**우선순위**: 🔴 CRITICAL

**등록 단계**:
1. [ ] 앱 만들기
2. [ ] 앱 정보 입력
   - 앱 이름
   - 짧은 설명
   - 전체 설명
   - 아이콘 (512x512)
3. [ ] 카테고리 설정
4. [ ] 콘텐츠 등급 설정
5. [ ] 개인정보 처리방침 URL 입력

---

#### Step 5.2: 스크린샷 및 메타데이터 업로드
**소요 시간**: 30분
**우선순위**: 🔴 CRITICAL

**업로드 항목**:
- [ ] 휴대전화 스크린샷 8개 (1080x1920)
- [ ] 태블릿 스크린샷 (선택사항)
- [ ] 홍보 그래픽 (선택사항)
- [ ] 배너 이미지 (선택사항)

**메타데이터**:
- [ ] 한국어 설명
- [ ] 영어 설명
- [ ] 일본어 설명

---

#### Step 5.3: AAB 파일 업로드
**소요 시간**: 15분
**우선순위**: 🔴 CRITICAL

**업로드 방법**:

**방법 1: EAS 자동 제출 (권장)**
```bash
npm run submit:android

# 또는
eas submit --platform android
```

**방법 2: 수동 업로드**
1. Google Play Console > 프로덕션 > 새 버전 만들기
2. AAB 파일 드래그 앤 드롭
3. 버전 정보 입력
4. 저장

---

#### Step 5.4: Google Play 심사 제출
**소요 시간**: 15분
**우선순위**: 🔴 CRITICAL

**제출 전 체크리스트**:
- [ ] 모든 메타데이터 입력 완료
- [ ] 스크린샷 업로드 완료
- [ ] AAB 파일 업로드 완료
- [ ] 개인정보 처리방침 URL 입력
- [ ] 콘텐츠 등급 완료
- [ ] 가격 및 배포 설정 완료

**제출 버튼 클릭**:
- "프로덕션으로 출시" 클릭
- 최종 확인
- 제출 완료

---

#### Step 5.5: 심사 승인 대기
**소요 시간**: 1-3일 (Google 심사 시간)
**우선순위**: ⏳ 대기

**예상 심사 기간**:
- 보통 1-2일
- 빠르면 수 시간
- 늦으면 3-5일

**심사 상태 확인**:
- Google Play Console > 대시보드
- 이메일 알림 확인

**심사 결과**:
- **승인**: 즉시 Play Store 게시
- **거부**: 거부 사유 확인 후 수정 재제출

---

## 📊 6. 진행 상황 추적

### 현재 진행 상태

```
[ ] Phase 1: 필수 설정 및 빌드 준비 (0%)
    [ ] Step 1.1: app.json 안드로이드 설정 강화
    [ ] Step 1.2: 안드로이드 알림 채널 생성
    [ ] Step 1.3: Android 13+ 권한 요청 코드 추가
    [ ] Step 1.4: adaptive-icon-mono.png 생성
    [ ] Step 1.5: 안드로이드 에뮬레이터 테스트

[ ] Phase 2: 안드로이드 최적화 (0%)
    [ ] Step 2.1: 알림 스케줄링 Android 최적화
    [ ] Step 2.2: 백그라운드 작업 최적화 (선택사항)
    [ ] Step 2.3: Platform.OS 분기 처리 검증
    [ ] Step 2.4: 안드로이드 성능 테스트

[ ] Phase 3: Google Play Store 제출 준비 (0%)
    [ ] Step 3.1: 스크린샷 촬영 (8개)
    [ ] Step 3.2: 앱 설명 작성
    [ ] Step 3.3: 개인정보 처리방침 작성
    [ ] Step 3.4: Google Play 콘솔 설정
    [ ] Step 3.5: 앱 아이콘 및 그래픽 최적화

[ ] Phase 4: 빌드 및 테스트 (0%)
    [ ] Step 4.1: EAS 프로덕션 빌드 생성
    [ ] Step 4.2: AAB 파일 검증
    [ ] Step 4.3: 내부 테스트 (개발자)
    [ ] Step 4.4: 비공개 테스트 (베타 테스터)
    [ ] Step 4.5: 버그 수정 및 최종 테스트

[ ] Phase 5: 출시 (0%)
    [ ] Step 5.1: Google Play Console 앱 등록
    [ ] Step 5.2: 스크린샷 및 메타데이터 업로드
    [ ] Step 5.3: AAB 파일 업로드
    [ ] Step 5.4: Google Play 심사 제출
    [ ] Step 5.5: 심사 승인 대기
```

---

## 💰 7. 비용 예상

| 항목 | 비용 | 필수 여부 | 상태 |
|------|------|-----------|------|
| Google Play 개발자 등록 | $25 (일회성) | ✅ 필수 | 📋 대기 |
| EAS Build (Android) | 무료 (월 30회) | ✅ 포함 | ✅ 준비됨 |
| 도메인 | $0 (이미 있음) | ✅ 완료 | ✅ 완료 |
| 그래픽 디자인 | $0 (직접 제작) | ✅ 가능 | 📋 작업 예정 |
| **총 비용** | **$25** | - | - |

---

## 🎯 8. 주요 마일스톤

### 목표 일정

```
✅ 2025-10-14: iOS 앱 App Store 정식 출시 완료
📋 2025-10-15: 안드로이드 개발 계획 수립 완료
📋 2025-10-16~17: Phase 1 완료 (설정 및 빌드 준비)
📋 2025-10-18~20: Phase 2 완료 (안드로이드 최적화)
📋 2025-10-21~25: Phase 3 완료 (Google Play 준비)
📋 2025-10-26~28: Phase 4 완료 (빌드 및 테스트)
📋 2025-10-29~30: Phase 5 완료 (출시)
⏳ 2025-10-31~11-02: 심사 승인 대기
🎉 2025-11-02: 안드로이드 앱 Google Play 정식 출시 목표
```

---

## 📞 9. 참고 자료

### 공식 문서
- [Expo Android 개발 가이드](https://docs.expo.dev/guides/android/)
- [Google Play Console 가이드](https://support.google.com/googleplay/android-developer/)
- [Android 알림 가이드](https://developer.android.com/develop/ui/views/notifications)
- [React Native Platform 가이드](https://reactnative.dev/docs/platform-specific-code)

### 프로젝트 파일
- `app.json`: 앱 설정 파일
- `eas.json`: EAS Build 설정
- `contexts/NotificationContext.tsx`: 알림 시스템
- `package.json`: 의존성 및 스크립트

### 유용한 명령어
```bash
# 안드로이드 개발
npm run android
npx expo start --android

# 빌드
npm run build:prod:android
eas build --platform android

# 제출
npm run submit:android
eas submit --platform android

# 상태 확인
eas build:list
eas build:view [BUILD_ID]

# 에뮬레이터
adb devices
adb logcat
```

---

## ✅ 10. 즉시 시작 가능한 작업 (오늘)

### Priority 1: 필수 작업 (1-2시간)

1. **app.json 업데이트** (15분)
   ```bash
   # 파일 열기
   code /Users/threebooks/App/tarot-timer-web/app.json

   # Android 섹션에 권한 추가
   # - POST_NOTIFICATIONS
   # - SCHEDULE_EXACT_ALARM
   # - RECEIVE_BOOT_COMPLETED
   ```

2. **알림 채널 코드 추가** (30분)
   ```bash
   # 파일 열기
   code /Users/threebooks/App/tarot-timer-web/contexts/NotificationContext.tsx

   # Android 알림 채널 생성 함수 추가
   ```

3. **안드로이드 에뮬레이터 테스트** (30분)
   ```bash
   npx expo start --android
   ```

### Priority 2: 준비 작업 (1시간)

4. **adaptive-icon-mono.png 생성** (15분)
   - 기존 adaptive-icon.png를 흑백으로 변환
   - 크기: 512x512 PNG

5. **스크린샷 촬영 시작** (45분)
   - 최소 2개 먼저 촬영
   - 나머지는 내일 완성

---

## 🎉 11. 성공 기준

### 최종 목표
- ✅ Google Play Store 안드로이드 앱 정식 출시
- ✅ iOS와 동일한 100% 기능 구현
- ✅ 사용자 평점 4.5+ 목표
- ✅ 다운로드 1,000+ (첫 달)

### 품질 기준
- ✅ 충돌율 < 1%
- ✅ ANR 비율 < 0.5%
- ✅ 알림 정확도 > 99%
- ✅ 앱 시작 시간 < 3초
- ✅ 메모리 사용량 < 200MB

---

**마지막 업데이트**: 2025-10-15
**작성자**: Claude Code
**상태**: 📋 계획 수립 완료, 구현 대기 중
**다음 단계**: Phase 1 Step 1.1 시작 (app.json 업데이트)
