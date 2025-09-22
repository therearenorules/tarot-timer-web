import { Expo, ExpoPushMessage, ExpoPushToken } from 'expo-server-sdk';
import moment from 'moment-timezone';

// 타로 카드 인터페이스
interface TarotCard {
  id: string;
  name: string;
  nameKr: string;
  meaning: string;
  meaningKr: string;
  imageUrl?: string;
}

// 사용자 정보 인터페이스
interface User {
  id: string;
  expo_push_token?: string;
  timezone: string;
  notification_preferences: {
    hourlyEnabled: boolean;
    quietHoursStart: number;
    quietHoursEnd: number;
    weekendEnabled: boolean;
    notificationTypes: string[];
  };
}

// 알림 서비스 클래스
class NotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
      useFcmV1: true // Firebase Cloud Messaging v1 사용
    });
  }

  /**
   * Expo 푸시 토큰 등록
   */
  async registerDeviceToken(userId: string, expoPushToken: string, deviceInfo?: any): Promise<void> {
    try {
      // 토큰 유효성 검증
      if (!Expo.isExpoPushToken(expoPushToken)) {
        throw new Error(`Push token ${expoPushToken} is not a valid Expo push token`);
      }

      // 데이터베이스에 토큰 저장
      // TODO: Supabase 연동
      console.log(`Registering push token for user ${userId}: ${expoPushToken}`);

      // 토큰 등록 로그
      await this.logNotificationEvent(userId, 'token_registered', {
        token: expoPushToken,
        deviceInfo
      });

    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  }

  /**
   * 디바이스 토큰 제거
   */
  async removeDeviceToken(userId: string): Promise<void> {
    try {
      // TODO: Supabase에서 토큰 제거
      console.log(`Removing push token for user ${userId}`);

      await this.logNotificationEvent(userId, 'token_removed');
    } catch (error) {
      console.error('Error removing device token:', error);
      throw error;
    }
  }

  /**
   * 시간별 타로 카드 알림 전송
   */
  async sendTarotCardNotification(userId: string, hour: number, card: TarotCard): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user?.expo_push_token) {
        console.log(`No push token found for user ${userId}`);
        return false;
      }

      // 알림 발송 여부 체크
      if (!await this.shouldNotifyUser(user, hour)) {
        console.log(`Skipping notification for user ${userId} at hour ${hour}`);
        return false;
      }

      const message: ExpoPushMessage = {
        to: user.expo_push_token as ExpoPushToken,
        title: `🔮 ${hour}시 타로 카드`,
        body: `${card.nameKr} - ${this.truncateText(card.meaningKr, 80)}`,
        data: {
          type: 'hourly_card',
          userId,
          hour,
          cardId: card.id,
          cardName: card.name,
          cardNameKr: card.nameKr,
          cardMeaning: card.meaningKr,
          timestamp: Date.now()
        },
        sound: 'default',
        priority: 'default' as 'default' | 'normal' | 'high',
        channelId: 'tarot-hourly', // Android 전용
        categoryId: 'tarot_hourly', // iOS 전용
        badge: 1,
      };

      const success = await this.sendPushNotification([message]);

      if (success) {
        await this.logNotificationEvent(userId, 'hourly_sent', {
          hour,
          cardId: card.id,
          cardName: card.nameKr
        });
      }

      return success;
    } catch (error) {
      console.error(`Error sending tarot card notification to user ${userId}:`, error);
      await this.logNotificationEvent(userId, 'hourly_failed', {
        hour,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * 자정 카드 리셋 알림
   */
  async sendMidnightResetNotification(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user?.expo_push_token) {
        return false;
      }

      const message: ExpoPushMessage = {
        to: user.expo_push_token as ExpoPushToken,
        title: '🌙 새로운 24시간 카드 세트',
        body: '오늘의 새로운 타로 카드들이 준비되었습니다. 첫 번째 카드를 확인해보세요!',
        data: {
          type: 'midnight_reset',
          userId,
          timestamp: Date.now()
        },
        sound: 'default',
        priority: 'normal',
        channelId: 'tarot-midnight',
        categoryId: 'tarot_midnight',
        badge: 1,
      };

      const success = await this.sendPushNotification([message]);

      if (success) {
        await this.logNotificationEvent(userId, 'midnight_sent');
      }

      return success;
    } catch (error) {
      console.error(`Error sending midnight reset notification to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * 일기 저장 리마인더 알림
   */
  async sendDailySaveReminder(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user?.expo_push_token) {
        return false;
      }

      const message: ExpoPushMessage = {
        to: user.expo_push_token as ExpoPushToken,
        title: '📝 오늘의 타로 일기',
        body: '오늘의 타로 세션을 저장하는 것을 잊지 마세요. 소중한 통찰을 기록해보세요.',
        data: {
          type: 'daily_save_reminder',
          userId,
          timestamp: Date.now()
        },
        sound: 'default',
        priority: 'normal',
        channelId: 'tarot-save',
        categoryId: 'tarot_save',
      };

      const success = await this.sendPushNotification([message]);

      if (success) {
        await this.logNotificationEvent(userId, 'save_reminder_sent');
      }

      return success;
    } catch (error) {
      console.error(`Error sending daily save reminder to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * 복수 알림 일괄 전송
   */
  private async sendPushNotification(messages: ExpoPushMessage[]): Promise<boolean> {
    try {
      // 메시지를 청크로 나누어 전송 (최대 100개)
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
          return false;
        }
      }

      // 영수증 확인 (선택적)
      const receiptIds = tickets
        .filter(ticket => ticket.status === 'ok')
        .map(ticket => ticket.id);

      if (receiptIds.length > 0) {
        // 영수증 확인은 비동기로 처리
        setTimeout(async () => {
          await this.checkPushNotificationReceipts(receiptIds);
        }, 15 * 60 * 1000); // 15분 후 확인
      }

      return true;
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
      return false;
    }
  }

  /**
   * 푸시 알림 영수증 확인
   */
  private async checkPushNotificationReceipts(receiptIds: string[]): Promise<void> {
    try {
      const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);

      for (const chunk of receiptIdChunks) {
        const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);

        for (const receiptId in receipts) {
          const receipt = receipts[receiptId];

          if (receipt.status === 'error') {
            console.error(`Push notification error for receipt ${receiptId}:`, receipt.message);

            // 토큰이 무효하면 제거
            if (receipt.details?.error === 'DeviceNotRegistered') {
              // TODO: 해당 토큰을 데이터베이스에서 제거
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking push notification receipts:', error);
    }
  }

  /**
   * 사용자가 알림을 받을 수 있는지 확인
   */
  private async shouldNotifyUser(user: User, hour: number): Promise<boolean> {
    const prefs = user.notification_preferences;

    // 시간별 알림이 비활성화된 경우
    if (!prefs.hourlyEnabled) {
      return false;
    }

    // 조용한 시간 체크
    if (this.isQuietHour(hour, prefs.quietHoursStart, prefs.quietHoursEnd)) {
      return false;
    }

    // 주말 설정 체크
    if (!prefs.weekendEnabled && this.isWeekend(user.timezone)) {
      return false;
    }

    // 알림 타입 체크
    if (!prefs.notificationTypes.includes('hourly')) {
      return false;
    }

    return true;
  }

  /**
   * 조용한 시간인지 확인
   */
  private isQuietHour(hour: number, start: number, end: number): boolean {
    if (start <= end) {
      // 같은 날 범위 (예: 22시 ~ 8시)
      return hour >= start && hour <= end;
    } else {
      // 다음 날로 넘어가는 범위 (예: 22시 ~ 다음날 8시)
      return hour >= start || hour <= end;
    }
  }

  /**
   * 주말인지 확인 (사용자 시간대 기준)
   */
  private isWeekend(timezone: string): boolean {
    const now = moment().tz(timezone);
    const dayOfWeek = now.day(); // 0=일요일, 6=토요일
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  /**
   * 텍스트 자르기
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * 사용자 정보 조회 (Mock)
   */
  private async getUserById(userId: string): Promise<User | null> {
    // TODO: Supabase에서 사용자 정보 조회
    // 임시로 기본값 반환
    return {
      id: userId,
      expo_push_token: process.env.NODE_ENV === 'development' ? 'ExponentPushToken[test]' : undefined, // 실제로는 DB에서 조회
      timezone: 'Asia/Seoul',
      notification_preferences: {
        hourlyEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
        weekendEnabled: true,
        notificationTypes: ['hourly', 'daily_save', 'midnight_reset']
      }
    };
  }

  /**
   * 알림 이벤트 로그
   */
  private async logNotificationEvent(
    userId: string,
    eventType: string,
    metadata?: any
  ): Promise<void> {
    try {
      // TODO: Supabase notification_logs 테이블에 로그 저장
      console.log(`Notification event: ${eventType} for user ${userId}`, metadata);
    } catch (error) {
      console.error('Error logging notification event:', error);
    }
  }

  /**
   * Apple Watch 전용 알림 페이로드 생성
   */
  createWatchNotificationPayload(card: TarotCard, hour: number): any {
    return {
      title: `${hour}시 타로 카드`,
      body: `${card.nameKr} - ${this.truncateText(card.meaningKr, 50)}`,
      categoryId: 'tarot_hourly',
      customData: {
        cardName: card.name,
        cardNameKr: card.nameKr,
        cardMeaning: card.meaningKr,
        hour: hour,
        cardImageUrl: card.imageUrl
      },
      actions: [
        { id: 'view_card', title: '카드 보기', options: 'foreground' },
        { id: 'add_memo', title: '메모 추가', options: 'foreground' }
      ]
    };
  }
}

export default new NotificationService();