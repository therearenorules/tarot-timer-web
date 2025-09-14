import express from 'express';
import TarotCardService from '../services/TarotCardService';
import QueueService from '../services/QueueService';
import moment from 'moment-timezone';

const router = express.Router();

// 테스트용 사용자 ID 생성 유틸리티
const generateTestUserId = (req: express.Request): string => {
  return req.query.userId as string || req.body.userId || `test_user_${Date.now()}`;
};

/**
 * GET /api/tarot/daily-cards
 * 일일 카드 24장 조회
 */
router.get('/daily-cards', async (req: express.Request, res: express.Response) => {
  try {
    const userId = generateTestUserId(req);
    const date = req.query.date as string;
    const timezone = (req.query.timezone as string) || 'Asia/Seoul';

    console.log(`📖 Fetching daily cards for user ${userId}, date: ${date || 'today'}, timezone: ${timezone}`);

    const dailyCards = TarotCardService.generateDailyCards(userId, date);

    res.json({
      success: true,
      data: {
        userId,
        date: date || moment().tz(timezone).format('YYYY-MM-DD'),
        timezone,
        cards: dailyCards,
        cardCount: dailyCards.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching daily cards:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch daily cards'
    });
  }
});

/**
 * GET /api/tarot/hourly-card/:hour
 * 특정 시간의 카드 조회
 */
router.get('/hourly-card/:hour', async (req: express.Request, res: express.Response) => {
  try {
    const userId = generateTestUserId(req);
    const hour = parseInt(req.params.hour);
    const date = req.query.date as string;
    const timezone = (req.query.timezone as string) || 'Asia/Seoul';

    if (isNaN(hour) || hour < 0 || hour > 23) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hour. Must be between 0-23'
      });
    }

    console.log(`🔮 Fetching hourly card for user ${userId}, hour: ${hour}, date: ${date || 'today'}`);

    const card = TarotCardService.getHourlyCard(userId, hour, date);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: `No card found for hour ${hour}`
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        hour,
        hourFormatted: TarotCardService.formatHour(hour),
        date: date || moment().tz(timezone).format('YYYY-MM-DD'),
        timezone,
        card,
        cardSummary: TarotCardService.getCardSummary(card),
        fetchedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching hourly card:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch hourly card'
    });
  }
});

/**
 * POST /api/tarot/midnight-reset
 * 수동 자정 리셋 테스트
 */
router.post('/midnight-reset', async (req: express.Request, res: express.Response) => {
  try {
    const userId = generateTestUserId(req);
    const timezone = req.body.timezone || 'Asia/Seoul';

    console.log(`🌙 Manual midnight reset requested for user ${userId}, timezone: ${timezone}`);

    const resetResult = await TarotCardService.performMidnightReset(userId, timezone);

    if (!resetResult.success) {
      return res.status(500).json({
        success: false,
        error: resetResult.error || 'Midnight reset failed'
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        timezone,
        date: resetResult.date,
        newCards: resetResult.newCards,
        cardCount: resetResult.newCards?.length || 0,
        resetAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error during midnight reset:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform midnight reset'
    });
  }
});

/**
 * POST /api/tarot/schedule-notifications
 * 사용자의 알림 스케줄링 테스트
 */
router.post('/schedule-notifications', async (req: express.Request, res: express.Response) => {
  try {
    const userId = generateTestUserId(req);
    const timezone = req.body.timezone || 'Asia/Seoul';

    console.log(`⏰ Scheduling notifications for user ${userId}, timezone: ${timezone}`);

    // 시간별 알림 스케줄링
    await QueueService.scheduleHourlyNotificationsForUser(userId, timezone);

    // 자정 리셋 스케줄링
    await QueueService.scheduleMidnightResetForUser(userId, timezone);

    // 일기 저장 리마인더 스케줄링 (저녁 9시)
    await QueueService.scheduleDailySaveReminderForUser(userId, 21, timezone);

    res.json({
      success: true,
      data: {
        userId,
        timezone,
        scheduledAt: new Date().toISOString(),
        scheduledJobs: [
          '24 hourly notifications',
          'midnight reset',
          'daily save reminder at 9pm'
        ]
      }
    });
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule notifications'
    });
  }
});

/**
 * DELETE /api/tarot/cancel-notifications
 * 사용자의 알림 취소
 */
router.delete('/cancel-notifications', async (req: express.Request, res: express.Response) => {
  try {
    const userId = generateTestUserId(req);

    console.log(`🚫 Cancelling notifications for user ${userId}`);

    await QueueService.cancelHourlyNotificationsForUser(userId);

    res.json({
      success: true,
      data: {
        userId,
        cancelledAt: new Date().toISOString(),
        message: 'All notifications cancelled successfully'
      }
    });
  } catch (error) {
    console.error('Error cancelling notifications:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel notifications'
    });
  }
});

/**
 * GET /api/tarot/queue-status
 * Queue 상태 조회
 */
router.get('/queue-status', async (req: express.Request, res: express.Response) => {
  try {
    const queueStats = await QueueService.getQueueStats();

    res.json({
      success: true,
      data: {
        queueStats,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get queue status'
    });
  }
});

/**
 * GET /api/tarot/service-status
 * 타로 카드 서비스 상태 조회
 */
router.get('/service-status', async (req: express.Request, res: express.Response) => {
  try {
    const serviceStatus = TarotCardService.getServiceStatus();

    res.json({
      success: true,
      data: serviceStatus
    });
  } catch (error) {
    console.error('Error getting service status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get service status'
    });
  }
});

/**
 * POST /api/tarot/test-notification
 * 테스트 알림 즉시 발송
 */
router.post('/test-notification', async (req: express.Request, res: express.Response) => {
  try {
    const userId = generateTestUserId(req);
    const hour = parseInt(req.body.hour) || new Date().getHours();
    const timezone = req.body.timezone || 'Asia/Seoul';

    console.log(`📱 Sending test notification for user ${userId}, hour: ${hour}`);

    // 해당 시간의 카드 조회
    const card = TarotCardService.getHourlyCard(userId, hour);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: `No card found for hour ${hour}`
      });
    }

    // 테스트 알림 작업을 Queue에 추가
    // 실제로는 NotificationService를 통해 전송되지만 여기서는 시뮬레이션
    const testResult = {
      userId,
      hour,
      card,
      notificationSent: true,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: testResult,
      message: `Test notification prepared for ${TarotCardService.formatHour(hour)} - ${card.nameKr}`
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test notification'
    });
  }
});

export default router;