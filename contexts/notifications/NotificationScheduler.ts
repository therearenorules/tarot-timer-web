import i18next from 'i18next';
import { simpleStorage, STORAGE_KEYS, TarotCard, DailyTarotSave, TarotUtils } from '../../utils/tarotData';
import { Notifications, isMobileEnvironment, permissionManager } from './NotificationPermissionManager';
import { NotificationSettings, MultilingualMessage, TarotCardsResult } from './NotificationTypes';

/**
 * 알림 스케줄링 클래스
 * - 시간별 알림 생성
 * - 자정 리셋 알림
 * - 8AM 리마인더
 * - 조용한 시간 처리
 */
export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private isScheduling: boolean = false;
  private lastScheduleTime: number | null = null;

  private constructor() {}

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  /**
   * 메인 스케줄링 함수
   */
  async scheduleNotifications(
    settings: NotificationSettings,
    onSchedulingChange?: (isScheduling: boolean) => void,
    onScheduleTimeUpdate?: (time: number) => void
  ): Promise<boolean> {
    if (!Notifications) {
      console.log('Notifications module not available');
      return false;
    }

    // 중복 스케줄링 방지
    if (this.isScheduling) {
      console.log('⏳ 이미 스케줄링 진행 중 - 스킵');
      return false;
    }

    // 1초 이내 중복 호출 방지
    const now = Date.now();
    if (this.lastScheduleTime && (now - this.lastScheduleTime) < 1000) {
      console.log('⏳ 최근 1초 이내 스케줄링 완료 - 중복 호출 방지');
      return false;
    }

    try {
      this.isScheduling = true;
      onSchedulingChange?.(true);

      // 1. 실시간 권한 확인
      const hasPermission = await permissionManager.checkPermission();
      if (!hasPermission) {
        console.log('❌ 실시간 권한 없음 - 스케줄링 중단');
        this.isScheduling = false;
        onSchedulingChange?.(false);
        return false;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 강화된 알림 스케줄링 시작...');

      // 2. 타로 카드 데이터 로드
      const cardsResult = await this.getTodayTarotCards();
      console.log(`   • 타로 카드 데이터: ${cardsResult.isValid ? `${cardsResult.count}개` : '없음'}`);
      console.log(`   • 권한 상태: ${hasPermission ? '✅ 허용됨' : '❌ 거부됨'}`);
      console.log(`   • 시간별 알림: ${settings.hourlyEnabled ? '✅ 활성화' : '❌ 비활성화'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 기존 알림 모두 취소
      await permissionManager.cancelAllScheduledNotifications();

      let scheduledCount = 0;

      // 3. 카드 데이터가 없으면 8AM 리마인더만 생성
      if (!cardsResult.isValid) {
        console.log('⏸️ 카드를 아직 뽑지 않음 - 오전 8시 리마인더만 생성');
        await this.schedule8AMReminder(settings);
        this.isScheduling = false;
        this.lastScheduleTime = Date.now();
        onSchedulingChange?.(false);
        onScheduleTimeUpdate?.(this.lastScheduleTime);
        return true;
      }

      // 4. 시간별 알림 스케줄
      if (cardsResult.cards) {
        scheduledCount = await this.scheduleHourlyNotifications(cardsResult.cards, settings);
      }

      // 5. 자정 리셋 알림
      await this.scheduleMidnightReset();
      scheduledCount++;

      // 6. 최종 검증
      this.lastScheduleTime = Date.now();
      onScheduleTimeUpdate?.(this.lastScheduleTime);

      const actualScheduled = await permissionManager.getScheduledNotificationCount('hourly');

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎯 스케줄링 완료 요약`);
      console.log(`   • 예상 스케줄: ${scheduledCount}개`);
      console.log(`   • 실제 확인: ${actualScheduled}개`);
      console.log(`   • 시간별 알림 활성화: ${settings.hourlyEnabled ? '✅' : '❌'}`);
      console.log(`   • 조용한 시간 활성화: ${settings.quietHoursEnabled ? '✅' : '❌'}`);
      if (settings.quietHoursEnabled) {
        console.log(`   • 조용한 시간: ${settings.quietHoursStart}:00 ~ ${settings.quietHoursEnd}:00`);
      }
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      this.isScheduling = false;
      onSchedulingChange?.(false);
      return scheduledCount > 0;

    } catch (error) {
      console.error('❌ 알림 스케줄링 실패:', error);
      this.isScheduling = false;
      onSchedulingChange?.(false);
      return false;
    }
  }

  /**
   * 오늘의 타로 카드 가져오기
   */
  private async getTodayTarotCards(): Promise<TarotCardsResult> {
    try {
      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
      const savedData = await simpleStorage.getItem(storageKey);

      if (savedData) {
        const dailySave: DailyTarotSave = JSON.parse(savedData);
        const cards = dailySave.hourlyCards;

        if (cards && cards.length === 24) {
          return { cards, isValid: true, count: 24 };
        }

        console.warn(`⚠️ 비정상적인 카드 개수: ${cards?.length || 0}개 (24개 필요)`);
        return { cards: null, isValid: false, count: cards?.length || 0 };
      }

      return { cards: null, isValid: false, count: 0 };
    } catch (error) {
      console.error('❌ 타로 카드 데이터 로드 실패:', error);
      return { cards: null, isValid: false, count: 0 };
    }
  }

  /**
   * 시간별 알림 스케줄
   */
  private async scheduleHourlyNotifications(
    todayCards: TarotCard[],
    settings: NotificationSettings
  ): Promise<number> {
    const now = new Date();
    const currentHourIndex = now.getHours();
    const hoursRemainingToday = 23 - currentHourIndex;
    let scheduledCount = 0;
    const maxNotifications = 64; // iOS/Android 제한

    console.log(`⏰ 현재 시간: ${currentHourIndex}시, 오늘 남은 시간: ${hoursRemainingToday}시간`);

    for (let i = 0; i < hoursRemainingToday && scheduledCount < maxNotifications; i++) {
      const targetHour = currentHourIndex + 1 + i;
      const triggerDate = new Date(now);
      triggerDate.setHours(targetHour, 0, 0, 0);

      // 조용한 시간 체크
      const isQuietTime = this.isQuietHour(targetHour, settings);

      if (settings.hourlyEnabled && !isQuietTime) {
        // 카드 데이터 확인
        if (!todayCards[targetHour]) {
          console.log(`⏭️ ${targetHour}시 카드 없음 - 알림 스케줄 스킵`);
          continue;
        }

        // 알림 생성
        const card = todayCards[targetHour];
        const success = await this.scheduleHourlyNotification(targetHour, card, triggerDate);

        if (success) {
          scheduledCount++;
          console.log(`✅ [${scheduledCount}] ${targetHour}시 알림 스케줄 성공`);
        }
      } else {
        const reason = !settings.hourlyEnabled ? '시간별 알림 비활성화' : '조용한 시간';
        console.log(`⏭️ 스케줄 스킵: ${targetHour}시 (${reason})`);
      }
    }

    return scheduledCount;
  }

  /**
   * 단일 시간별 알림 스케줄
   */
  private async scheduleHourlyNotification(
    hour: number,
    card: TarotCard,
    triggerDate: Date
  ): Promise<boolean> {
    try {
      const cardName = this.getCardName(card);
      const cardMeaning = this.getCardMeaning(card);
      const hourDisplay = this.formatHour(hour);
      const notificationBody = `[${hourDisplay}] ${cardName} - ${cardMeaning}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔮 타로 타이머',
          body: notificationBody,
          data: {
            type: 'hourly',
            hour: hour,
            timestamp: triggerDate.getTime(),
            cardId: card.id || null
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
          categoryIdentifier: 'tarot-hourly',
        },
        trigger: triggerDate,
        identifier: `hourly-${triggerDate.getTime()}`,
      });

      return true;
    } catch (error) {
      console.error(`❌ ${hour}시 알림 스케줄 실패:`, error);
      return false;
    }
  }

  /**
   * 8AM 리마인더 스케줄
   */
  private async schedule8AMReminder(settings: NotificationSettings): Promise<void> {
    const currentLang = i18next.language || 'ko';
    const reminderMessages: MultilingualMessage = {
      ko: {
        title: '🌅 좋은 아침입니다!',
        body: '오늘 하루의 24시간 타로 카드를 뽑아보세요 🔮'
      },
      en: {
        title: '🌅 Good morning!',
        body: 'Draw your 24-hour tarot cards for today 🔮'
      },
      ja: {
        title: '🌅 おはようございます！',
        body: '今日の24時間タロットカードを引いてみましょう 🔮'
      }
    };

    const message = reminderMessages[currentLang as keyof typeof reminderMessages] || reminderMessages.ko;

    // 8AM 시간 계산 (조용한 시간 고려)
    let targetHour = 8;
    if (settings.quietHoursEnabled) {
      const quietEnd = settings.quietHoursEnd;
      if (settings.quietHoursStart > settings.quietHoursEnd && targetHour < quietEnd) {
        targetHour = quietEnd;
        console.log(`⏰ 8AM 리마인더가 조용한 시간과 충돌 → ${targetHour}시로 조정`);
      }
    }

    const reminder8AM = new Date();
    reminder8AM.setHours(targetHour, 0, 0, 0);

    // 현재 시간이 목표 시간 이후라면 내일로 설정
    const now = new Date();
    if (now.getHours() >= targetHour) {
      reminder8AM.setDate(reminder8AM.getDate() + 1);
    }

    console.log(`📅 리마인더 예정 시간: ${reminder8AM.toLocaleString('ko-KR')}`);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: {
            type: 'daily_reminder',
            timestamp: reminder8AM.getTime()
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
          categoryIdentifier: 'tarot-save',
        },
        trigger: reminder8AM,
        identifier: `daily-reminder-${reminder8AM.getTime()}`,
      });

      console.log('✅ 오전 8시 카드 뽑기 리마인더 생성 완료');
    } catch (error) {
      console.error('❌ 8AM 리마인더 생성 실패:', error);
    }
  }

  /**
   * 자정 리셋 알림 스케줄
   */
  private async scheduleMidnightReset(): Promise<void> {
    const currentLang = i18next.language || 'ko';
    const midnightMessages: MultilingualMessage = {
      ko: {
        title: '🌙 새로운 하루',
        body: '어제의 카드가 초기화되었습니다. 오늘의 24시간 카드를 새로 뽑아보세요!'
      },
      en: {
        title: '🌙 New Day',
        body: 'Yesterday\'s cards have been reset. Draw your new 24-hour cards for today!'
      },
      ja: {
        title: '🌙 新しい一日',
        body: '昨日のカードがリセットされました。今日の24時間カードを新しく引いてみましょう！'
      }
    };

    const message = midnightMessages[currentLang as keyof typeof midnightMessages] || midnightMessages.ko;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: {
            type: 'midnight_reset',
            timestamp: tomorrow.getTime()
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority?.DEFAULT || 'default',
          categoryIdentifier: 'tarot-midnight',
        },
        trigger: tomorrow,
        identifier: `midnight-${tomorrow.getTime()}`,
      });

      console.log('✅ 자정 리셋 알림 스케줄 성공');
    } catch (error) {
      console.error('❌ 자정 알림 스케줄 실패:', error);
    }
  }

  /**
   * 테스트 알림 발송
   */
  async sendTestNotification(): Promise<void> {
    if (!isMobileEnvironment || !Notifications) {
      console.log('Non-mobile platform: Test notification simulated');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔮 타로 타이머 테스트',
          body: '알림이 정상적으로 작동하고 있습니다!',
          data: {
            type: 'test',
            timestamp: Date.now()
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
          categoryIdentifier: 'tarot-hourly',
        },
        trigger: null, // 즉시 알림
        identifier: `test-${Date.now()}`,
      });
      console.log('Test notification scheduled successfully');
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  }

  // ============ Helper Methods ============

  /**
   * 조용한 시간 체크
   */
  private isQuietHour(hour: number, settings: NotificationSettings): boolean {
    if (!settings.quietHoursEnabled) {
      return false;
    }

    if (settings.quietHoursStart > settings.quietHoursEnd) {
      // 자정 걸침 (예: 22시 ~ 08시)
      return hour >= settings.quietHoursStart || hour < settings.quietHoursEnd;
    } else {
      // 자정 안 걸침 (예: 13시 ~ 14시)
      return hour >= settings.quietHoursStart && hour < settings.quietHoursEnd;
    }
  }

  /**
   * 카드 이름 가져오기 (다국어)
   */
  private getCardName(card: TarotCard): string {
    const currentLang = i18next.language || 'ko';

    if (currentLang === 'ja') {
      return card.nameJa || card.nameKr || card.name;
    } else if (currentLang === 'en') {
      return card.name;
    } else {
      return card.nameKr || card.name;
    }
  }

  /**
   * 카드 의미 가져오기 (다국어)
   */
  private getCardMeaning(card: TarotCard): string {
    const currentLang = i18next.language || 'ko';

    if (currentLang === 'ja') {
      return card.meaningJa || card.meaningKr || card.meaning;
    } else if (currentLang === 'en') {
      return card.meaning;
    } else {
      return card.meaningKr || card.meaning;
    }
  }

  /**
   * 시간 표시 형식 (다국어)
   */
  private formatHour(hour: number): string {
    const currentLang = i18next.language || 'ko';

    if (currentLang === 'ja') {
      return `${hour}時`;
    } else if (currentLang === 'en') {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${period}`;
    } else {
      return `${hour}시`;
    }
  }
}

// 싱글톤 인스턴스 export
export const notificationScheduler = NotificationScheduler.getInstance();
