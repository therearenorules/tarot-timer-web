import Bull from 'bull';
let Redis: any = null;
try {
  Redis = require('redis');
} catch (e) {
  console.log('ℹ️ Redis module not found, running in mock mode');
}
import NotificationService from './NotificationService';
import TarotCardService from './TarotCardService';
import moment from 'moment-timezone';

// 작업 데이터 인터페이스
interface HourlyNotificationJob {
  userId: string;
  hour: number;
  timezone: string;
  cardData?: any;
}

interface MidnightResetJob {
  userId: string;
  timezone: string;
}

interface DailySaveReminderJob {
  userId: string;
  timezone: string;
}

// Queue Service 클래스
class QueueService {
  private redis: any;
  private notificationQueue: Bull.Queue<any> | any;
  private schedulingQueue: Bull.Queue<any> | any;

  private createMockQueues(): void {
    // Mock queue implementation
    this.notificationQueue = {
      process: () => console.log('📝 Mock queue: process called'),
      add: () => Promise.resolve({ id: 'mock-job' }),
      getWaiting: () => Promise.resolve([]),
      getActive: () => Promise.resolve([]),
      getCompleted: () => Promise.resolve([]),
      getFailed: () => Promise.resolve([]),
      getDelayed: () => Promise.resolve([]),
      getRepeatableJobs: () => Promise.resolve([]),
      removeRepeatableByKey: () => Promise.resolve(1),
      close: () => Promise.resolve(),
      on: () => {},
    } as any;

    this.schedulingQueue = {
      close: () => Promise.resolve(),
      on: () => {},
    } as any;

    console.log('✅ Mock queues initialized');
  }

  constructor() {
    // Redis 연결 설정
    const redisConfig = {
      port: parseInt(process.env.REDIS_PORT || '6379'),
      host: process.env.REDIS_HOST || 'localhost',
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    try {
      if (Redis && typeof Redis.createClient === 'function') {
        this.redis = Redis.createClient(redisConfig);
        console.log('✅ Redis client connected successfully');
      } else {
        console.log('ℹ️ Redis module not available, using mock mode');
        this.createMockQueues();
        return;
      }
    } catch (error) {
      console.log('ℹ️ Redis connection failed, using mock mode:', error instanceof Error ? error.message : 'Unknown error');
      // 개발 환경에서는 Redis 없이도 작동하도록 Mock 처리
      this.redis = {
        on: () => {},
        quit: () => {},
      };
    }

    // Bull Queue 초기화 (Redis가 사용 가능한 경우에만)
    if (Redis && typeof Redis.createClient === 'function') {
      try {
        this.notificationQueue = new Bull('notification processing', {
          redis: redisConfig,
          defaultJobOptions: {
            removeOnComplete: 50,  // 완료된 작업 50개까지 보관
            removeOnFail: 100,     // 실패한 작업 100개까지 보관
            attempts: 3,           // 최대 3회 재시도
            backoff: {
              type: 'exponential',
              delay: 5000,         // 5초부터 시작해서 지수적 증가
            },
          },
        });

        this.schedulingQueue = new Bull('scheduling management', {
          redis: redisConfig,
          defaultJobOptions: {
            removeOnComplete: 10,
            removeOnFail: 50,
            attempts: 2,
          },
        });
      } catch (error) {
        console.log('ℹ️ Bull Queue initialization failed, using mock queues');
        this.createMockQueues();
      }
    } else {
      console.log('ℹ️ Redis not available, using mock queues');
      this.createMockQueues();
    }

    this.setupQueueProcessors();
    this.setupQueueEvents();
  }

  /**
   * Queue 작업 처리기 설정
   */
  private setupQueueProcessors(): void {
    // 시간별 알림 처리
    this.notificationQueue.process('send-hourly-notification', 10, async (job) => {
      const { userId, hour, timezone, cardData }: HourlyNotificationJob = job.data;

      console.log(`📱 Processing hourly notification for user ${userId} at hour ${hour}`);

      try {
        // 현재 시간이 정말 알림 시간인지 확인
        const userTime = moment().tz(timezone);
        const currentHour = userTime.hour();

        if (Math.abs(currentHour - hour) > 1) {
          console.log(`⏰ Skipping notification: current hour ${currentHour} != target hour ${hour}`);
          return { skipped: true, reason: 'Time mismatch' };
        }

        // 타로 카드 데이터 가져오기 (cardData가 없으면 현재 시간 카드 조회)
        const card = cardData || TarotCardService.getHourlyCard(userId, hour);

        if (!card) {
          console.log(`🔮 No card found for user ${userId} at hour ${hour}`);
          return { skipped: true, reason: 'No card available' };
        }

        // 알림 전송
        const success = await NotificationService.sendTarotCardNotification(userId, hour, card);

        return {
          success,
          userId,
          hour,
          cardName: card.nameKr,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error(`❌ Error processing hourly notification:`, error);
        throw error;
      }
    });

    // 자정 리셋 처리
    this.notificationQueue.process('midnight-reset', 5, async (job) => {
      const { userId, timezone }: MidnightResetJob = job.data;

      console.log(`🌙 Processing midnight reset for user ${userId} (timezone: ${timezone})`);

      try {
        // 새로운 24시간 카드 세트 생성
        const resetResult = await TarotCardService.performMidnightReset(userId, timezone);

        if (!resetResult.success) {
          throw new Error(resetResult.error || 'Failed to generate daily cards');
        }

        const newCards = resetResult.newCards;

        // 자정 알림 전송
        const success = await NotificationService.sendMidnightResetNotification(userId);

        // 당일 시간별 알림 스케줄링
        if (success) {
          await this.scheduleHourlyNotificationsForUser(userId, timezone);
        }

        return {
          success,
          userId,
          cardsGenerated: newCards?.length || 0,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error(`❌ Error processing midnight reset:`, error);
        throw error;
      }
    });

    // 일기 저장 리마인더 처리
    this.notificationQueue.process('daily-save-reminder', 10, async (job) => {
      const { userId, timezone }: DailySaveReminderJob = job.data;

      console.log(`📝 Processing daily save reminder for user ${userId}`);

      try {
        const success = await NotificationService.sendDailySaveReminder(userId);

        return {
          success,
          userId,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error(`❌ Error processing daily save reminder:`, error);
        throw error;
      }
    });

    console.log('✅ Queue processors initialized');
  }

  /**
   * Queue 이벤트 리스너 설정
   */
  private setupQueueEvents(): void {
    // 작업 완료 이벤트
    this.notificationQueue.on('completed', (job, result) => {
      console.log(`✅ Job ${job.id} completed:`, result);
    });

    // 작업 실패 이벤트
    this.notificationQueue.on('failed', (job, error) => {
      console.error(`❌ Job ${job.id} failed:`, error.message);
    });

    // Queue 정지 이벤트
    this.notificationQueue.on('stalled', (job) => {
      console.warn(`⚠️ Job ${job.id} stalled and will be retried`);
    });

    // 진행률 업데이트 이벤트
    this.notificationQueue.on('progress', (job, progress) => {
      console.log(`📊 Job ${job.id} progress: ${progress}%`);
    });
  }

  /**
   * 사용자의 시간별 알림 스케줄링
   */
  async scheduleHourlyNotificationsForUser(userId: string, timezone: string = 'Asia/Seoul'): Promise<void> {
    try {
      console.log(`⏰ Scheduling hourly notifications for user ${userId} (timezone: ${timezone})`);

      // 기존 스케줄된 작업 제거
      await this.cancelHourlyNotificationsForUser(userId);

      // 24시간 동안 각 시간별로 알림 스케줄링
      for (let hour = 0; hour < 24; hour++) {
        const jobId = `hourly-${userId}-${hour}`;

        await this.notificationQueue.add(
          'send-hourly-notification',
          {
            userId,
            hour,
            timezone,
          },
          {
            jobId,
            repeat: {
              cron: `0 ${hour} * * *`, // 매일 해당 시간 정각에
              tz: timezone,           // 사용자 시간대 적용
            },
            delay: 0,
          }
        );
      }

      console.log(`✅ Scheduled 24 hourly notifications for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error scheduling hourly notifications for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 사용자의 시간별 알림 취소
   */
  async cancelHourlyNotificationsForUser(userId: string): Promise<void> {
    try {
      console.log(`🚫 Cancelling hourly notifications for user ${userId}`);

      // 반복 작업 제거
      for (let hour = 0; hour < 24; hour++) {
        const jobId = `hourly-${userId}-${hour}`;

        // 특정 ID의 반복 작업 제거
        const repeatableJobs = await this.notificationQueue.getRepeatableJobs();
        const targetJob = repeatableJobs.find(job =>
          job.id === jobId || job.cron === `0 ${hour} * * *`
        );

        if (targetJob) {
          await this.notificationQueue.removeRepeatableByKey(targetJob.key);
        }
      }

      console.log(`✅ Cancelled hourly notifications for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error cancelling hourly notifications for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 자정 리셋 스케줄링
   */
  async scheduleMidnightResetForUser(userId: string, timezone: string = 'Asia/Seoul'): Promise<void> {
    try {
      console.log(`🌙 Scheduling midnight reset for user ${userId} (timezone: ${timezone})`);

      const jobId = `midnight-reset-${userId}`;

      await this.notificationQueue.add(
        'midnight-reset',
        {
          userId,
          timezone,
        },
        {
          jobId,
          repeat: {
            cron: '0 0 * * *', // 매일 자정
            tz: timezone,
          },
        }
      );

      console.log(`✅ Scheduled midnight reset for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error scheduling midnight reset for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 일기 저장 리마인더 스케줄링
   */
  async scheduleDailySaveReminderForUser(
    userId: string,
    hour: number = 21, // 오후 9시 기본값
    timezone: string = 'Asia/Seoul'
  ): Promise<void> {
    try {
      console.log(`📝 Scheduling daily save reminder for user ${userId} at ${hour}:00 (timezone: ${timezone})`);

      const jobId = `save-reminder-${userId}`;

      await this.notificationQueue.add(
        'daily-save-reminder',
        {
          userId,
          timezone,
        },
        {
          jobId,
          repeat: {
            cron: `0 ${hour} * * *`, // 매일 지정된 시간
            tz: timezone,
          },
        }
      );

      console.log(`✅ Scheduled daily save reminder for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error scheduling daily save reminder for user ${userId}:`, error);
      throw error;
    }
  }


  /**
   * Queue 상태 조회
   */
  async getQueueStats(): Promise<any> {
    try {
      const waiting = await this.notificationQueue.getWaiting();
      const active = await this.notificationQueue.getActive();
      const completed = await this.notificationQueue.getCompleted();
      const failed = await this.notificationQueue.getFailed();
      const delayed = await this.notificationQueue.getDelayed();
      const repeatableJobs = await this.notificationQueue.getRepeatableJobs();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        repeatable: repeatableJobs.length,
        repeatableJobs: repeatableJobs.map(job => ({
          id: job.id,
          cron: job.cron,
          tz: job.tz,
          next: job.next,
        })),
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Queue 정리 (서버 종료 시 호출)
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up queue service...');

      await this.notificationQueue.close();
      await this.schedulingQueue.close();

      if (this.redis && typeof this.redis.quit === 'function') {
        await this.redis.quit();
      }

      console.log('✅ Queue service cleanup completed');
    } catch (error) {
      console.error('❌ Error during queue cleanup:', error);
    }
  }
}

export default new QueueService();