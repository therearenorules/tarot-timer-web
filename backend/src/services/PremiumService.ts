import moment from 'moment';

// 구독 상태 enum
enum SubscriptionTier {
  FREE = 'free',
  TRIAL = 'trial',
  PREMIUM = 'premium'
}

// 스프레드 타입 enum
enum SpreadType {
  ONE_CARD = 'one_card',
  THREE_CARD = 'three_card',
  FOUR_CARD = 'four_card',
  FIVE_CARD_V = 'five_card_v',
  CELTIC_CROSS = 'celtic_cross',
  CUP_OF_RELATIONSHIP = 'cup_of_relationship',
  AB_CHOICE = 'ab_choice'
}

// 사용자 구독 정보 인터페이스
interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  trialStartDate?: Date;
  trialEndDate?: Date;
  premiumStartDate?: Date;
  premiumEndDate?: Date;
  isActive: boolean;
}

// 사용량 정보 인터페이스
interface UserUsage {
  userId: string;
  totalSaves: number;
  dailySaves: number;
  spreadSaves: number;
  lastSaveDate: Date;
  currentMonth: string;
}

/**
 * 프리미엄 기능 관리 서비스
 */
class PremiumService {
  // 저장 제한
  private readonly SAVE_LIMITS = {
    [SubscriptionTier.FREE]: 7,        // 무료: 7개 저장
    [SubscriptionTier.TRIAL]: 999,     // 체험: 무제한
    [SubscriptionTier.PREMIUM]: 999    // 프리미엄: 무제한
  };

  // 스프레드 접근 권한
  private readonly SPREAD_ACCESS = {
    [SubscriptionTier.FREE]: [
      SpreadType.ONE_CARD,
      SpreadType.THREE_CARD,
      SpreadType.FOUR_CARD,
      SpreadType.FIVE_CARD_V
    ],
    [SubscriptionTier.TRIAL]: Object.values(SpreadType), // 모든 스프레드
    [SubscriptionTier.PREMIUM]: Object.values(SpreadType) // 모든 스프레드
  };

  // 체험 기간 (일)
  private readonly TRIAL_PERIOD_DAYS = 7;

  constructor() {
    console.log('💎 PremiumService initialized');
  }

  /**
   * 사용자 구독 정보 조회
   */
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    try {
      // TODO: 실제 데이터베이스에서 구독 정보 조회
      // 임시로 무료 사용자 반환
      const subscription: UserSubscription = {
        id: `sub_${userId}`,
        userId,
        tier: SubscriptionTier.FREE,
        isActive: true,
        // 신규 사용자는 자동으로 7일 체험 시작
        trialStartDate: new Date(),
        trialEndDate: moment().add(this.TRIAL_PERIOD_DAYS, 'days').toDate()
      };

      // 체험 기간 확인
      const currentTier = this.determineCurrentTier(subscription);
      subscription.tier = currentTier;

      return subscription;
    } catch (error) {
      console.error(`❌ Error getting subscription for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 현재 구독 등급 결정
   */
  private determineCurrentTier(subscription: UserSubscription): SubscriptionTier {
    const now = new Date();

    // 프리미엄 구독 확인
    if (subscription.premiumStartDate && subscription.premiumEndDate) {
      if (now >= subscription.premiumStartDate && now <= subscription.premiumEndDate) {
        return SubscriptionTier.PREMIUM;
      }
    }

    // 체험 기간 확인
    if (subscription.trialStartDate && subscription.trialEndDate) {
      if (now >= subscription.trialStartDate && now <= subscription.trialEndDate) {
        return SubscriptionTier.TRIAL;
      }
    }

    return SubscriptionTier.FREE;
  }

  /**
   * 사용자 사용량 조회
   */
  async getUserUsage(userId: string): Promise<UserUsage> {
    try {
      // TODO: 실제 데이터베이스에서 사용량 조회
      // 임시 데이터 반환
      return {
        userId,
        totalSaves: 3,
        dailySaves: 1,
        spreadSaves: 2,
        lastSaveDate: new Date(),
        currentMonth: moment().format('YYYY-MM')
      };
    } catch (error) {
      console.error(`❌ Error getting usage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 저장 가능 여부 확인
   */
  async canUserSave(userId: string): Promise<{ canSave: boolean; reason?: string; usage?: any }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const usage = await this.getUserUsage(userId);
      const limit = this.SAVE_LIMITS[subscription.tier];

      if (usage.totalSaves >= limit) {
        return {
          canSave: false,
          reason: 'Save limit reached',
          usage: {
            current: usage.totalSaves,
            limit,
            tier: subscription.tier
          }
        };
      }

      return {
        canSave: true,
        usage: {
          current: usage.totalSaves,
          limit,
          tier: subscription.tier
        }
      };
    } catch (error) {
      console.error(`❌ Error checking save permission for user ${userId}:`, error);
      return { canSave: false, reason: 'System error' };
    }
  }

  /**
   * 스프레드 접근 권한 확인
   */
  async canAccessSpread(userId: string, spreadType: SpreadType): Promise<{ canAccess: boolean; reason?: string; tier?: SubscriptionTier }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const allowedSpreads = this.SPREAD_ACCESS[subscription.tier];

      if (!allowedSpreads.includes(spreadType)) {
        return {
          canAccess: false,
          reason: 'Premium spread required',
          tier: subscription.tier
        };
      }

      return {
        canAccess: true,
        tier: subscription.tier
      };
    } catch (error) {
      console.error(`❌ Error checking spread access for user ${userId}:`, error);
      return { canAccess: false, reason: 'System error' };
    }
  }

  /**
   * 저장 사용량 증가
   */
  async incrementSaveUsage(userId: string, type: 'daily' | 'spread'): Promise<void> {
    try {
      // TODO: 데이터베이스에서 사용량 증가
      console.log(`📈 Incrementing ${type} save usage for user ${userId}`);

      // 사용량 로그 기록
      await this.logUsage(userId, type);
    } catch (error) {
      console.error(`❌ Error incrementing save usage for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 체험 기간 시작
   */
  async startTrial(userId: string): Promise<UserSubscription> {
    try {
      console.log(`🆓 Starting trial for user ${userId}`);

      const subscription: UserSubscription = {
        id: `sub_${userId}`,
        userId,
        tier: SubscriptionTier.TRIAL,
        isActive: true,
        trialStartDate: new Date(),
        trialEndDate: moment().add(this.TRIAL_PERIOD_DAYS, 'days').toDate()
      };

      // TODO: 데이터베이스에 저장

      return subscription;
    } catch (error) {
      console.error(`❌ Error starting trial for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 프리미엄 구독 시작
   */
  async startPremiumSubscription(
    userId: string,
    durationMonths: number = 1
  ): Promise<UserSubscription> {
    try {
      console.log(`💎 Starting premium subscription for user ${userId} (${durationMonths} months)`);

      const subscription: UserSubscription = {
        id: `sub_${userId}`,
        userId,
        tier: SubscriptionTier.PREMIUM,
        isActive: true,
        premiumStartDate: new Date(),
        premiumEndDate: moment().add(durationMonths, 'months').toDate()
      };

      // TODO: 데이터베이스에 저장

      return subscription;
    } catch (error) {
      console.error(`❌ Error starting premium subscription for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 구독 상태 정보 조회
   */
  async getSubscriptionStatus(userId: string): Promise<any> {
    try {
      const subscription = await this.getUserSubscription(userId);
      const usage = await this.getUserUsage(userId);
      const saveLimit = this.SAVE_LIMITS[subscription.tier];
      const allowedSpreads = this.SPREAD_ACCESS[subscription.tier];

      // 체험 기간 남은 일수 계산
      let trialDaysLeft = 0;
      if (subscription.tier === SubscriptionTier.TRIAL && subscription.trialEndDate) {
        trialDaysLeft = moment(subscription.trialEndDate).diff(moment(), 'days');
      }

      // 프리미엄 기간 남은 일수 계산
      let premiumDaysLeft = 0;
      if (subscription.tier === SubscriptionTier.PREMIUM && subscription.premiumEndDate) {
        premiumDaysLeft = moment(subscription.premiumEndDate).diff(moment(), 'days');
      }

      return {
        tier: subscription.tier,
        isActive: subscription.isActive,

        // 사용량 정보
        usage: {
          totalSaves: usage.totalSaves,
          saveLimit,
          remainingSaves: Math.max(0, saveLimit - usage.totalSaves),
          dailySaves: usage.dailySaves,
          spreadSaves: usage.spreadSaves
        },

        // 기능 접근 권한
        features: {
          allowedSpreads,
          hasUnlimitedSaves: subscription.tier !== SubscriptionTier.FREE,
          hasNotifications: true, // 모든 사용자 알림 가능
          hasPremiumSpreads: subscription.tier !== SubscriptionTier.FREE
        },

        // 기간 정보
        periods: {
          trialDaysLeft: Math.max(0, trialDaysLeft),
          premiumDaysLeft: Math.max(0, premiumDaysLeft),
          isTrialActive: subscription.tier === SubscriptionTier.TRIAL,
          isPremiumActive: subscription.tier === SubscriptionTier.PREMIUM
        }
      };
    } catch (error) {
      console.error(`❌ Error getting subscription status for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 프리미엄 기능 프롬프트 정보 생성
   */
  generateUpgradePrompt(feature: string, currentTier: SubscriptionTier): any {
    const prompts = {
      premium_spreads: {
        title: '🔮 프리미엄 스프레드',
        message: '더 깊이 있는 통찰을 위한 고급 스프레드를 경험해보세요.',
        features: [
          '✨ 켈틱 크로스 스프레드',
          '💕 관계의 컵 스프레드',
          '⚖️ A/B 선택 스프레드',
          '🎯 전문가급 해석 가이드'
        ]
      },
      unlimited_saves: {
        title: '💾 무제한 저장',
        message: '소중한 타로 세션을 무제한으로 저장하고 기록해보세요.',
        features: [
          '📚 무제한 일기 저장',
          '🔍 고급 검색 및 필터',
          '📊 개인 성장 분석',
          '☁️ 클라우드 백업'
        ]
      }
    };

    const basePrompt = prompts[feature] || prompts.unlimited_saves;

    return {
      ...basePrompt,
      currentTier,
      upgradeOptions: [
        {
          duration: '1 month',
          price: '$4.99',
          savings: null
        },
        {
          duration: '6 months',
          price: '$24.99',
          savings: '17%'
        },
        {
          duration: '1 year',
          price: '$39.99',
          savings: '33%'
        }
      ]
    };
  }

  /**
   * 사용량 로그 기록
   */
  private async logUsage(userId: string, type: string): Promise<void> {
    try {
      // TODO: 데이터베이스에 사용량 로그 저장
      console.log(`📝 Usage logged: ${type} for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error logging usage:`, error);
    }
  }

  /**
   * 구독 만료 처리
   */
  async handleSubscriptionExpiry(userId: string): Promise<void> {
    try {
      console.log(`⏰ Handling subscription expiry for user ${userId}`);

      const subscription = await this.getUserSubscription(userId);

      // 프리미엄에서 무료로 다운그레이드
      if (subscription.tier === SubscriptionTier.PREMIUM) {
        // TODO: 데이터베이스에서 구독 상태 업데이트
        console.log(`⬇️ Downgrading user ${userId} from premium to free`);
      }

      // 체험에서 무료로 다운그레이드
      if (subscription.tier === SubscriptionTier.TRIAL) {
        // TODO: 데이터베이스에서 구독 상태 업데이트
        console.log(`⬇️ Downgrading user ${userId} from trial to free`);
      }

      // 만료 알림 전송 (선택사항)
      // await NotificationService.sendSubscriptionExpiryNotification(userId);

    } catch (error) {
      console.error(`❌ Error handling subscription expiry for user ${userId}:`, error);
    }
  }

  /**
   * 일일 사용량 리셋
   */
  async resetDailyUsage(): Promise<void> {
    try {
      console.log('🔄 Resetting daily usage for all users');

      // TODO: 모든 사용자의 dailySaves를 0으로 리셋

      console.log('✅ Daily usage reset completed');
    } catch (error) {
      console.error('❌ Error resetting daily usage:', error);
    }
  }
}

export default new PremiumService();
export { SubscriptionTier, SpreadType };