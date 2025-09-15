# 타로 타이머 백엔드 알림 시스템 설계서

## 📋 개요

타로 타이머 앱의 백엔드 알림 시스템 설계 및 구현 가이드입니다.

## 🏗️ 시스템 아키텍처

### 1. 전체 구조

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PWA 클라이언트   │    │   백엔드 API 서버   │    │  알림 스케줄러    │
│                 │◄──►│                 │◄──►│                 │
│ - usePWA 훅      │    │ - Node.js/Deno  │    │ - Cron Jobs     │
│ - Service Worker│    │ - Push API      │    │ - Queue System  │
│ - Notification  │    │ - 사용자 관리     │    │ - 타이머 트리거  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                               │
                    ┌─────────────────┐
                    │  Firebase/      │
                    │  Supabase DB    │
                    │                 │
                    │ - 사용자 토큰     │
                    │ - 알림 설정      │
                    │ - 세션 데이터     │
                    └─────────────────┘
```

### 2. 기술 스택

**백엔드**:
- **Runtime**: Deno 2.0 (TypeScript 네이티브, 보안성)
- **API Framework**: Hono (경량, 빠른 성능)
- **Database**: Supabase (PostgreSQL + Real-time)
- **알림 서비스**: Web Push API + FCM
- **스케줄링**: Deno Cron + Temporal.io
- **배포**: Deno Deploy (serverless)

**인프라**:
- **CDN**: Cloudflare
- **모니터링**: Deno Deploy Analytics
- **로깅**: Structured JSON logs

## 🔔 알림 시스템 구성

### 1. 알림 유형

#### A. 타이머 알림 (Timer Notifications)
- **시간 알림**: 매시간 타로 카드 확인 알림
- **세션 시작**: 새로운 24시간 세션 시작 알림
- **세션 종료**: 24시간 세션 완료 알림
- **메모 리마인더**: 미완성 시간대 메모 작성 알림

#### B. 카드 알림 (Card Notifications)
- **일일 카드**: 오늘의 카드 추천
- **주간 스프레드**: 주간 타로 스프레드 추천
- **특별 이벤트**: 만월, 신월 등 특별한 날의 타로 추천

#### C. 시스템 알림 (System Notifications)
- **앱 업데이트**: 새 기능 및 업데이트 알림
- **백업 완료**: 데이터 백업 완료 알림
- **동기화**: 멀티 기기 동기화 알림

### 2. 알림 스케줄링

#### A. 사용자별 시간대 관리
```typescript
interface UserTimezone {
  userId: string;
  timezone: string; // IANA timezone (Asia/Seoul)
  quietHours: {
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  enabledNotifications: {
    hourly: boolean;
    daily: boolean;
    weekly: boolean;
    special: boolean;
  };
}
```

#### B. 조용한 시간 (Quiet Hours)
- 사용자 설정 기반 알림 차단
- 기본값: 22:00 ~ 08:00
- 긴급 알림은 예외 (앱 오류 등)

### 3. Push 토큰 관리

#### A. 토큰 등록 플로우
```
1. PWA 클라이언트에서 푸시 권한 요청
2. Service Worker에서 토큰 생성
3. 백엔드 API로 토큰 전송 및 저장
4. 사용자 ID와 토큰 매핑
5. 토큰 유효성 주기적 검증
```

#### B. 토큰 데이터베이스 스키마
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  token TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);
```

## 🚀 API 설계

### 1. 알림 등록 API

**POST /api/notifications/register**
```typescript
interface RegisterPushRequest {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent?: string;
}

interface RegisterPushResponse {
  success: boolean;
  tokenId: string;
  message: string;
}
```

### 2. 알림 설정 API

**PUT /api/notifications/settings**
```typescript
interface NotificationSettings {
  timezone: string;
  quietHours: {
    start: string;
    end: string;
  };
  enabled: {
    hourly: boolean;
    daily: boolean;
    weekly: boolean;
    special: boolean;
  };
  customSchedule?: {
    days: number[]; // 0=Sunday, 6=Saturday
    hours: number[]; // 0-23
  };
}
```

### 3. 즉시 알림 API

**POST /api/notifications/send**
```typescript
interface SendNotificationRequest {
  userId: string;
  type: 'timer' | 'card' | 'system';
  title: string;
  body: string;
  data?: {
    action?: string;
    url?: string;
    cardId?: string;
  };
  priority: 'low' | 'normal' | 'high';
}
```

## ⚙️ 백엔드 구현

### 1. Deno 서버 구조

```
/backend
├── main.ts                 # 진입점
├── routes/
│   ├── notifications.ts    # 알림 관련 라우트
│   ├── users.ts           # 사용자 관리
│   └── health.ts          # 헬스체크
├── services/
│   ├── push.ts            # Push 알림 서비스
│   ├── scheduler.ts       # 스케줄링 서비스
│   └── database.ts        # DB 연결
├── cron/
│   ├── hourly.ts          # 시간별 알림
│   ├── daily.ts           # 일별 알림
│   └── cleanup.ts         # 토큰 정리
├── utils/
│   ├── crypto.ts          # VAPID 키 관리
│   ├── timezone.ts        # 시간대 처리
│   └── validation.ts      # 입력 검증
└── types/
    └── notifications.ts    # 타입 정의
```

### 2. 핵심 서비스 구현

#### A. Push 알림 서비스 (services/push.ts)
```typescript
import { webpush } from "https://deno.land/x/webpush/mod.ts";

export class PushNotificationService {
  private vapidKeys: {
    publicKey: string;
    privateKey: string;
  };

  constructor() {
    this.vapidKeys = {
      publicKey: Deno.env.get("VAPID_PUBLIC_KEY")!,
      privateKey: Deno.env.get("VAPID_PRIVATE_KEY")!,
    };

    webpush.setVapidDetails(
      "mailto:noreply@tarot-timer.app",
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );
  }

  async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error("Push notification failed:", error);
      return false;
    }
  }

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    const tokens = await this.getUserTokens(userId);

    const promises = tokens.map(token =>
      this.sendNotification(token.subscription, payload)
    );

    await Promise.allSettled(promises);
  }
}
```

#### B. 스케줄러 서비스 (services/scheduler.ts)
```typescript
export class NotificationScheduler {
  async scheduleHourlyNotifications(): Promise<void> {
    const users = await this.getActiveUsers();

    for (const user of users) {
      if (!this.isQuietTime(user) && user.settings.hourly) {
        const card = await this.getHourlyCard(user.id);

        await this.pushService.sendToUser(user.id, {
          title: "타로 타이머",
          body: `${new Date().getHours()}시의 카드: ${card.name}`,
          data: {
            action: "view_card",
            cardId: card.id,
            url: "/timer"
          }
        });
      }
    }
  }

  private isQuietTime(user: User): boolean {
    const now = new Date();
    const userTime = new Date(now.toLocaleString("en-US", {
      timeZone: user.timezone
    }));

    const currentHour = userTime.getHours();
    const quietStart = parseInt(user.settings.quietHours.start.split(':')[0]);
    const quietEnd = parseInt(user.settings.quietHours.end.split(':')[0]);

    if (quietStart > quietEnd) {
      // 밤을 넘나드는 경우 (예: 22:00 ~ 08:00)
      return currentHour >= quietStart || currentHour < quietEnd;
    } else {
      // 같은 날 내의 경우 (예: 01:00 ~ 06:00)
      return currentHour >= quietStart && currentHour < quietEnd;
    }
  }
}
```

### 3. Cron Jobs 설정

#### A. 시간별 알림 (cron/hourly.ts)
```typescript
import { cron } from "https://deno.land/x/deno_cron/cron.ts";
import { NotificationScheduler } from "../services/scheduler.ts";

const scheduler = new NotificationScheduler();

// 매시간 정각에 실행
cron("0 * * * *", async () => {
  console.log("Running hourly notifications...");
  await scheduler.scheduleHourlyNotifications();
});
```

#### B. 토큰 정리 (cron/cleanup.ts)
```typescript
// 매일 03:00에 비활성 토큰 정리
cron("0 3 * * *", async () => {
  console.log("Cleaning up inactive tokens...");

  // 30일 이상 사용되지 않은 토큰 삭제
  await db.execute(`
    DELETE FROM push_tokens
    WHERE last_used < NOW() - INTERVAL '30 days'
  `);

  // 유효하지 않은 토큰 비활성화
  await scheduler.validateAllTokens();
});
```

## 🔒 보안 고려사항

### 1. VAPID 키 관리
- 환경변수로 안전하게 저장
- 정기적인 키 로테이션
- 개발/프로덕션 키 분리

### 2. 토큰 보안
- 토큰 암호화 저장
- 토큰 유효성 정기 검증
- 의심스러운 토큰 자동 차단

### 3. API 보안
- JWT 기반 인증
- Rate limiting 적용
- CORS 정책 설정

## 📊 모니터링 및 분석

### 1. 알림 성능 메트릭
- 전송 성공률
- 응답 시간
- 토큰 활성화율

### 2. 사용자 참여도
- 알림 클릭률
- 앱 재방문율
- 설정 변경 빈도

## 🚢 배포 전략

### 1. 단계별 배포
1. **Phase 1**: 기본 푸시 알림 (시간별)
2. **Phase 2**: 고급 스케줄링 (조용한 시간)
3. **Phase 3**: 개인화 알림 (AI 추천)

### 2. 모니터링 및 롤백
- Deno Deploy를 통한 무중단 배포
- 실시간 에러 모니터링
- 자동 롤백 시스템

## 📝 구현 체크리스트

### 백엔드 서버
- [ ] Deno + Hono 서버 설정
- [ ] Supabase 데이터베이스 연결
- [ ] VAPID 키 생성 및 설정
- [ ] Push 알림 서비스 구현
- [ ] Cron 스케줄러 설정

### API 엔드포인트
- [ ] /api/notifications/register
- [ ] /api/notifications/settings
- [ ] /api/notifications/send
- [ ] /api/notifications/unsubscribe

### 클라이언트 통합
- [ ] PWA에서 push 권한 요청
- [ ] Service Worker 푸시 이벤트 처리
- [ ] 설정 페이지 백엔드 연동

### 테스트 및 배포
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 실행
- [ ] 프로덕션 배포

---

**예상 구현 시간**: 3-4주
**필요 리소스**: 풀스택 개발자 1명, DevOps 0.5명
**예상 비용**: Deno Deploy (무료~$20/월), Supabase ($25/월)