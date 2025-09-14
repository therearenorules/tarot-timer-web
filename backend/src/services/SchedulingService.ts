import cron from 'node-cron';
import moment from 'moment-timezone';
import QueueService from './QueueService';

// 사용자 정보 인터페이스
interface User {
  id: string;
  timezone: string;
  notification_preferences: {
    hourlyEnabled: boolean;
    quietHoursStart: number;
    quietHoursEnd: number;
    weekendEnabled: boolean;
  };
  expo_push_token?: string;
}

/**
 * 스케줄링 서비스 클래스
 * Cron 작업을 통해 전역적인 알림 관리
 */
class SchedulingService {
  private cronJobs: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    console.log('🕒 SchedulingService initialized');
  }

  /**
   * 스케줄링 서비스 시작
   */
  async start(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ SchedulingService already initialized');
      return;
    }

    console.log('🚀 Starting SchedulingService...');

    // 글로벌 크론 작업들 시작
    this.setupGlobalCronJobs();

    this.isInitialized = true;
    console.log('✅ SchedulingService started successfully');
  }

  /**
   * 글로벌 크론 작업 설정
   */
  private setupGlobalCronJobs(): void {
    // 1. 매시간 정각에 시간별 알림 트리거 확인 (매분 체크)
    const hourlyCheckJob = cron.schedule('0 * * * *', async () => {
      await this.processHourlyNotifications();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // 2. 매일 자정마다 자정 리셋 확인 (5분마다 체크)
    const midnightCheckJob = cron.schedule('*/5 * * * *', async () => {
      await this.processMidnightResets();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // 3. 일일 저장 리마인더 확인 (매시간 체크)
    const dailySaveCheckJob = cron.schedule('0 * * * *', async () => {
      await this.processDailySaveReminders();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // 4. 시스템 정리 및 유지보수 (매일 새벽 3시)
    const maintenanceJob = cron.schedule('0 3 * * *', async () => {
      await this.performMaintenance();
    }, {
      scheduled: false,
      timezone: 'UTC'
    });

    // 크론 작업 저장
    this.cronJobs.set('hourly-check', hourlyCheckJob);
    this.cronJobs.set('midnight-check', midnightCheckJob);
    this.cronJobs.set('daily-save-check', dailySaveCheckJob);
    this.cronJobs.set('maintenance', maintenanceJob);

    // 모든 작업 시작
    hourlyCheckJob.start();
    midnightCheckJob.start();
    dailySaveCheckJob.start();
    maintenanceJob.start();

    console.log('✅ Global cron jobs initialized and started');
  }

  /**
   * 시간별 알림 처리
   * 매시간 정각에 모든 사용자의 알림 조건 확인
   */
  private async processHourlyNotifications(): Promise<void> {
    try {
      console.log('📱 Processing hourly notifications...');

      // 활성화된 모든 사용자 조회
      const users = await this.getActiveUsers();
      const currentUTC = moment.utc();

      let processedCount = 0;
      let skippedCount = 0;

      for (const user of users) {
        try {
          // 사용자 현지 시간 계산
          const userTime = currentUTC.clone().tz(user.timezone);
          const userHour = userTime.hour();
          const userMinute = userTime.minute();

          // 정각(분이 0-5분 사이)인지 확인
          if (userMinute > 5) {
            continue;
          }

          // 알림 조건 확인
          if (await this.shouldSendHourlyNotification(user, userHour)) {
            // Queue에 시간별 알림 작업 추가
            await QueueService.scheduleHourlyNotificationsForUser(user.id, user.timezone);
            processedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing hourly notification for user ${user.id}:`, error);
        }
      }

      console.log(`✅ Hourly notifications processed: ${processedCount} sent, ${skippedCount} skipped`);
    } catch (error) {
      console.error('❌ Error in processHourlyNotifications:', error);
    }
  }

  /**
   * 자정 리셋 처리
   * 각 사용자의 시간대별로 자정 체크
   */
  private async processMidnightResets(): Promise<void> {
    try {
      console.log('🌙 Processing midnight resets...');

      const users = await this.getActiveUsers();
      const currentUTC = moment.utc();

      let resetCount = 0;

      for (const user of users) {
        try {
          const userTime = currentUTC.clone().tz(user.timezone);
          const isNearMidnight = this.isNearMidnight(userTime);

          if (isNearMidnight && await this.shouldPerformMidnightReset(user)) {
            // Queue에 자정 리셋 작업 추가
            await QueueService.scheduleMidnightResetForUser(user.id, user.timezone);
            resetCount++;

            console.log(`🌙 Scheduled midnight reset for user ${user.id} (${user.timezone})`);
          }
        } catch (error) {
          console.error(`❌ Error processing midnight reset for user ${user.id}:`, error);
        }
      }

      if (resetCount > 0) {
        console.log(`✅ Midnight resets scheduled: ${resetCount}`);
      }
    } catch (error) {
      console.error('❌ Error in processMidnightResets:', error);
    }
  }

  /**
   * 일일 저장 리마인더 처리
   */
  private async processDailySaveReminders(): Promise<void> {
    try {
      console.log('📝 Processing daily save reminders...');

      const users = await this.getActiveUsers();
      const currentUTC = moment.utc();

      let reminderCount = 0;

      for (const user of users) {
        try {
          const userTime = currentUTC.clone().tz(user.timezone);
          const userHour = userTime.hour();

          // 저녁 9시(21시)에 리마인더 전송
          if (userHour === 21 && userTime.minute() <= 5) {
            // 오늘 세션이 저장되지 않은 사용자에게만 전송
            if (await this.needsDailySaveReminder(user)) {
              await QueueService.scheduleDailySaveReminderForUser(
                user.id,
                21,
                user.timezone
              );
              reminderCount++;
            }
          }
        } catch (error) {
          console.error(`❌ Error processing daily save reminder for user ${user.id}:`, error);
        }
      }

      if (reminderCount > 0) {
        console.log(`✅ Daily save reminders scheduled: ${reminderCount}`);
      }
    } catch (error) {
      console.error('❌ Error in processDailySaveReminders:', error);
    }
  }

  /**
   * 시스템 유지보수 작업
   */
  private async performMaintenance(): Promise<void> {
    try {
      console.log('🧹 Performing system maintenance...');

      // 1. 오래된 알림 로그 정리 (30일 이상)
      await this.cleanupOldNotificationLogs();

      // 2. 실패한 Queue 작업 정리
      await this.cleanupFailedQueueJobs();

      // 3. 비활성 사용자의 스케줄링 정리
      await this.cleanupInactiveUserSchedules();

      // 4. Queue 상태 체크 및 로그
      const queueStats = await QueueService.getQueueStats();
      console.log('📊 Queue stats:', queueStats);

      console.log('✅ System maintenance completed');
    } catch (error) {
      console.error('❌ Error during system maintenance:', error);
    }
  }

  /**
   * 시간별 알림 전송 여부 확인
   */
  private async shouldSendHourlyNotification(user: User, hour: number): Promise<boolean> {
    const prefs = user.notification_preferences;

    // 시간별 알림이 비활성화된 경우
    if (!prefs.hourlyEnabled) {
      return false;
    }

    // 푸시 토큰이 없는 경우
    if (!user.expo_push_token) {
      return false;
    }

    // 조용한 시간 확인
    if (this.isQuietHour(hour, prefs.quietHoursStart, prefs.quietHoursEnd)) {
      return false;
    }

    // 주말 설정 확인
    if (!prefs.weekendEnabled && this.isWeekend(user.timezone)) {
      return false;
    }

    return true;
  }

  /**
   * 자정 근처인지 확인 (±5분)
   */
  private isNearMidnight(userTime: moment.Moment): boolean {
    const hour = userTime.hour();
    const minute = userTime.minute();

    // 23:55 ~ 00:05 사이
    return (hour === 23 && minute >= 55) || (hour === 0 && minute <= 5);
  }

  /**
   * 자정 리셋 수행 여부 확인
   */
  private async shouldPerformMidnightReset(user: User): Promise<boolean> {
    // TODO: 실제로는 이미 오늘 리셋을 수행했는지 DB에서 확인
    // 임시로 true 반환
    return true;
  }

  /**
   * 일일 저장 리마인더가 필요한지 확인
   */
  private async needsDailySaveReminder(user: User): Promise<boolean> {
    // TODO: 실제로는 오늘 세션이 저장되었는지 DB에서 확인
    // 임시로 true 반환
    return true;
  }

  /**
   * 조용한 시간인지 확인
   */
  private isQuietHour(hour: number, start: number, end: number): boolean {
    if (start <= end) {
      return hour >= start && hour <= end;
    } else {
      return hour >= start || hour <= end;
    }
  }

  /**
   * 주말인지 확인
   */
  private isWeekend(timezone: string): boolean {
    const now = moment().tz(timezone);
    const dayOfWeek = now.day();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  /**
   * 활성 사용자 목록 조회 (Mock)
   */
  private async getActiveUsers(): Promise<User[]> {
    // TODO: 실제 데이터베이스에서 활성 사용자 조회
    // 임시로 샘플 사용자 반환
    return [
      {
        id: 'user1',
        timezone: 'Asia/Seoul',
        notification_preferences: {
          hourlyEnabled: true,
          quietHoursStart: 22,
          quietHoursEnd: 8,
          weekendEnabled: true,
        },
        expo_push_token: 'ExponentPushToken[sample-token]'
      },
      {
        id: 'user2',
        timezone: 'America/New_York',
        notification_preferences: {
          hourlyEnabled: true,
          quietHoursStart: 23,
          quietHoursEnd: 7,
          weekendEnabled: false,
        },
        expo_push_token: 'ExponentPushToken[sample-token-2]'
      },
    ];
  }

  /**
   * 오래된 알림 로그 정리
   */
  private async cleanupOldNotificationLogs(): Promise<void> {
    try {
      // TODO: 30일 이상된 notification_logs 삭제
      console.log('🧹 Cleaned up old notification logs');
    } catch (error) {
      console.error('❌ Error cleaning up old notification logs:', error);
    }
  }

  /**
   * 실패한 Queue 작업 정리
   */
  private async cleanupFailedQueueJobs(): Promise<void> {
    try {
      // TODO: Bull Queue의 실패한 작업들 정리
      console.log('🧹 Cleaned up failed queue jobs');
    } catch (error) {
      console.error('❌ Error cleaning up failed queue jobs:', error);
    }
  }

  /**
   * 비활성 사용자 스케줄 정리
   */
  private async cleanupInactiveUserSchedules(): Promise<void> {
    try {
      // TODO: 30일 이상 비활성 사용자의 스케줄링된 작업 제거
      console.log('🧹 Cleaned up inactive user schedules');
    } catch (error) {
      console.error('❌ Error cleaning up inactive user schedules:', error);
    }
  }

  /**
   * 특정 사용자의 모든 알림 활성화
   */
  async enableNotificationsForUser(userId: string, timezone: string): Promise<void> {
    try {
      console.log(`🔔 Enabling notifications for user ${userId}`);

      // 시간별 알림 스케줄링
      await QueueService.scheduleHourlyNotificationsForUser(userId, timezone);

      // 자정 리셋 스케줄링
      await QueueService.scheduleMidnightResetForUser(userId, timezone);

      // 일일 저장 리마인더 스케줄링
      await QueueService.scheduleDailySaveReminderForUser(userId, 21, timezone);

      console.log(`✅ Notifications enabled for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error enabling notifications for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 특정 사용자의 모든 알림 비활성화
   */
  async disableNotificationsForUser(userId: string): Promise<void> {
    try {
      console.log(`🔕 Disabling notifications for user ${userId}`);

      // 시간별 알림 취소
      await QueueService.cancelHourlyNotificationsForUser(userId);

      // TODO: 자정 리셋 및 일일 저장 리마인더도 취소

      console.log(`✅ Notifications disabled for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error disabling notifications for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 스케줄링 서비스 상태 조회
   */
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      activeCronJobs: Array.from(this.cronJobs.keys()),
      cronJobsStatus: Array.from(this.cronJobs.entries()).map(([name, job]) => ({
        name,
        running: job.running || false,
        scheduled: job.scheduled || false,
      })),
    };
  }

  /**
   * 스케줄링 서비스 종료
   */
  async stop(): Promise<void> {
    try {
      console.log('🛑 Stopping SchedulingService...');

      // 모든 크론 작업 중지
      for (const [name, job] of this.cronJobs) {
        job.stop();
        console.log(`🛑 Stopped cron job: ${name}`);
      }

      this.cronJobs.clear();
      this.isInitialized = false;

      console.log('✅ SchedulingService stopped');
    } catch (error) {
      console.error('❌ Error stopping SchedulingService:', error);
    }
  }
}

export default new SchedulingService();