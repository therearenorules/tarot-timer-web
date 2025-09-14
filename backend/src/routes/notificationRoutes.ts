import express from 'express';
import NotificationService from '../services/NotificationService';
// TODO: 실제 인증 미들웨어 import
// import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// 임시 인증 미들웨어 (실제로는 JWT 미들웨어 사용)
const authenticateUser = (req: any, res: any, next: any) => {
  // TODO: 실제 JWT 토큰 검증 로직
  req.user = { id: 'temp-user-id' }; // 임시 사용자 ID
  next();
};

/**
 * POST /api/notifications/register-token
 * Expo 푸시 토큰 등록
 */
router.post('/register-token', authenticateUser, async (req, res) => {
  try {
    const { expoPushToken, deviceInfo } = req.body;
    const userId = req.user.id;

    if (!expoPushToken) {
      return res.status(400).json({
        error: 'Missing expoPushToken',
        message: 'Expo push token is required'
      });
    }

    await NotificationService.registerDeviceToken(userId, expoPushToken, deviceInfo);

    res.status(200).json({
      message: 'Push token registered successfully',
      token: expoPushToken
    });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * DELETE /api/notifications/unregister-token
 * 푸시 토큰 제거
 */
router.delete('/unregister-token', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    await NotificationService.removeDeviceToken(userId);

    res.status(200).json({
      message: 'Push token unregistered successfully'
    });
  } catch (error) {
    console.error('Error unregistering push token:', error);
    res.status(500).json({
      error: 'Unregistration failed',
      message: error.message
    });
  }
});

/**
 * PUT /api/notifications/preferences
 * 알림 설정 업데이트
 */
router.put('/preferences', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // TODO: 데이터베이스에 알림 설정 저장
    console.log(`Updating notification preferences for user ${userId}:`, preferences);

    res.status(200).json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      error: 'Update failed',
      message: error.message
    });
  }
});

/**
 * GET /api/notifications/preferences
 * 현재 알림 설정 조회
 */
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: 데이터베이스에서 알림 설정 조회
    const preferences = {
      hourlyEnabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
      weekendEnabled: true,
      notificationTypes: ['hourly', 'daily_save', 'midnight_reset']
    };

    res.status(200).json({
      preferences
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      error: 'Get preferences failed',
      message: error.message
    });
  }
});

/**
 * POST /api/notifications/schedule-hourly
 * 시간별 알림 스케줄링 활성화
 */
router.post('/schedule-hourly', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Bull Queue에 시간별 알림 작업 추가
    console.log(`Scheduling hourly notifications for user ${userId}`);

    res.status(200).json({
      message: 'Hourly notifications scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling hourly notifications:', error);
    res.status(500).json({
      error: 'Scheduling failed',
      message: error.message
    });
  }
});

/**
 * DELETE /api/notifications/cancel-hourly
 * 시간별 알림 스케줄링 취소
 */
router.delete('/cancel-hourly', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Bull Queue에서 시간별 알림 작업 제거
    console.log(`Cancelling hourly notifications for user ${userId}`);

    res.status(200).json({
      message: 'Hourly notifications cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling hourly notifications:', error);
    res.status(500).json({
      error: 'Cancellation failed',
      message: error.message
    });
  }
});

/**
 * POST /api/notifications/test-send
 * 테스트 알림 전송 (개발용)
 */
router.post('/test-send', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'test' } = req.body;

    // 샘플 타로 카드 데이터
    const sampleCard = {
      id: '1',
      name: 'The Fool',
      nameKr: '바보',
      meaning: 'New beginnings, innocence, spontaneity',
      meaningKr: '새로운 시작, 순수함, 자발성'
    };

    let success = false;

    switch (type) {
      case 'hourly':
        success = await NotificationService.sendTarotCardNotification(
          userId,
          new Date().getHours(),
          sampleCard
        );
        break;

      case 'midnight':
        success = await NotificationService.sendMidnightResetNotification(userId);
        break;

      case 'save_reminder':
        success = await NotificationService.sendDailySaveReminder(userId);
        break;

      default:
        return res.status(400).json({
          error: 'Invalid notification type',
          message: 'Type must be one of: hourly, midnight, save_reminder'
        });
    }

    if (success) {
      res.status(200).json({
        message: `Test ${type} notification sent successfully`
      });
    } else {
      res.status(500).json({
        error: 'Test notification failed',
        message: 'Could not send test notification'
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      error: 'Test notification failed',
      message: error.message
    });
  }
});

/**
 * PUT /api/user/timezone
 * 사용자 시간대 설정
 */
router.put('/timezone', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timezone } = req.body;

    if (!timezone) {
      return res.status(400).json({
        error: 'Missing timezone',
        message: 'Timezone is required'
      });
    }

    // TODO: 데이터베이스에 시간대 저장
    console.log(`Setting timezone for user ${userId}: ${timezone}`);

    res.status(200).json({
      message: 'Timezone updated successfully',
      timezone
    });
  } catch (error) {
    console.error('Error updating timezone:', error);
    res.status(500).json({
      error: 'Timezone update failed',
      message: error.message
    });
  }
});

/**
 * GET /api/user/timezone
 * 현재 사용자 시간대 조회
 */
router.get('/timezone', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: 데이터베이스에서 시간대 조회
    const timezone = 'Asia/Seoul'; // 기본값

    res.status(200).json({
      timezone
    });
  } catch (error) {
    console.error('Error getting timezone:', error);
    res.status(500).json({
      error: 'Get timezone failed',
      message: error.message
    });
  }
});

/**
 * GET /api/notifications/status
 * 알림 시스템 상태 확인
 */
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: 사용자의 알림 상태 조회
    const status = {
      hasExpoPushToken: false, // DB에서 조회
      hourlyNotificationsEnabled: false, // Queue에서 조회
      lastNotificationSent: null, // DB에서 조회
      totalNotificationsSent: 0, // DB에서 조회
      failedNotifications: 0 // DB에서 조회
    };

    res.status(200).json({
      status
    });
  } catch (error) {
    console.error('Error getting notification status:', error);
    res.status(500).json({
      error: 'Get status failed',
      message: error.message
    });
  }
});

export default router;