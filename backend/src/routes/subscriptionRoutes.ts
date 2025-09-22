import express from 'express';
import PremiumService, { SubscriptionTier, SpreadType } from '../services/PremiumService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/subscription/status
 * 사용자 구독 상태 조회
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const userId = (req as any).user.id;
    const status = await PremiumService.getSubscriptionStatus(userId);

    res.json(status);
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      error: 'Failed to get subscription status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/subscription/can-save
 * 저장 가능 여부 확인
 */
router.get('/can-save', authenticateToken, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const userId = (req as any).user.id;
    const result = await PremiumService.canUserSave(userId);

    res.json(result);
  } catch (error) {
    console.error('Error checking save permission:', error);
    res.status(500).json({
      error: 'Failed to check save permission',
      message: error instanceof Error ? error.message : 'Unknown error',
      canSave: false
    });
  }
});

/**
 * POST /api/subscription/can-access-spread
 * 스프레드 접근 권한 확인
 */
router.post('/can-access-spread', authenticateToken, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const userId = (req as any).user.id;
    const { spreadType } = req.body;

    if (!spreadType) {
      return res.status(400).json({
        error: 'Missing spreadType',
        message: 'spreadType is required'
      });
    }

    // SpreadType enum 검증
    if (!Object.values(SpreadType).includes(spreadType)) {
      return res.status(400).json({
        error: 'Invalid spreadType',
        message: 'spreadType must be a valid SpreadType value'
      });
    }

    const result = await PremiumService.canAccessSpread(userId, spreadType);

    res.json(result);
  } catch (error) {
    console.error('Error checking spread access:', error);
    res.status(500).json({
      error: 'Failed to check spread access',
      message: error instanceof Error ? error.message : 'Unknown error',
      canAccess: false
    });
  }
});

/**
 * POST /api/subscription/increment-usage
 * 사용량 증가
 */
router.post('/increment-usage', authenticateToken, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const userId = (req as any).user.id;
    const { type } = req.body;

    if (!type || !['daily', 'spread'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type',
        message: 'type must be either "daily" or "spread"'
      });
    }

    await PremiumService.incrementSaveUsage(userId, type);

    res.json({
      message: 'Usage incremented successfully',
      type
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    res.status(500).json({
      error: 'Failed to increment usage',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/subscription/start-trial
 * 체험 기간 시작
 */
router.post('/start-trial', authenticateToken, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const userId = (req as any).user.id;
    const subscription = await PremiumService.startTrial(userId);

    res.json({
      message: 'Trial started successfully',
      subscription: {
        tier: subscription.tier,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        isActive: subscription.isActive
      }
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({
      error: 'Failed to start trial',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/subscription/upgrade-premium
 * 프리미엄 구독 업그레이드
 */
router.post('/upgrade-premium', authenticateToken, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const userId = (req as any).user.id;
    const { durationMonths = 1 } = req.body;

    // 유효한 기간인지 확인
    if (!Number.isInteger(durationMonths) || durationMonths < 1 || durationMonths > 12) {
      return res.status(400).json({
        error: 'Invalid duration',
        message: 'durationMonths must be an integer between 1 and 12'
      });
    }

    const subscription = await PremiumService.startPremiumSubscription(userId, durationMonths);

    res.json({
      message: 'Premium subscription started successfully',
      subscription: {
        tier: subscription.tier,
        premiumStartDate: subscription.premiumStartDate,
        premiumEndDate: subscription.premiumEndDate,
        isActive: subscription.isActive,
        durationMonths
      }
    });
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    res.status(500).json({
      error: 'Failed to upgrade to premium',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/subscription/upgrade-prompt/:feature
 * 업그레이드 프롬프트 정보 조회
 */
router.get('/upgrade-prompt/:feature', authenticateToken, async (req, res) => {
  try {
    if (!(req as any).user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication required'
      });
    }

    const userId = (req as any).user.id;
    const { feature } = req.params;

    // 현재 구독 상태 조회
    const subscription = await PremiumService.getUserSubscription(userId);

    // 업그레이드 프롬프트 생성
    const prompt = PremiumService.generateUpgradePrompt(feature, subscription.tier);

    res.json(prompt);
  } catch (error) {
    console.error('Error getting upgrade prompt:', error);
    res.status(500).json({
      error: 'Failed to get upgrade prompt',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/subscription/health
 * 구독 서비스 상태 확인
 */
router.get('/health', (req, res) => {
  res.json({
    service: 'Subscription',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      subscriptionTiers: Object.values(SubscriptionTier),
      spreadTypes: Object.values(SpreadType),
      trialPeriod: '7 days',
      premiumFeatures: true
    }
  });
});

export default router;