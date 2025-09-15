import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';

// API URL 헬퍼 함수
const getApiUrl = (): string => {
  const apiUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  return apiUrl;
};

// 구독 등급 enum (백엔드와 동일)
export enum SubscriptionTier {
  FREE = 'free',
  TRIAL = 'trial',
  PREMIUM = 'premium'
}

// 스프레드 타입 enum (백엔드와 동일)
export enum SpreadType {
  ONE_CARD = 'one_card',
  THREE_CARD = 'three_card',
  FOUR_CARD = 'four_card',
  FIVE_CARD_V = 'five_card_v',
  CELTIC_CROSS = 'celtic_cross',
  CUP_OF_RELATIONSHIP = 'cup_of_relationship',
  AB_CHOICE = 'ab_choice'
}

// 구독 상태 인터페이스
interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;

  usage: {
    totalSaves: number;
    saveLimit: number;
    remainingSaves: number;
    dailySaves: number;
    spreadSaves: number;
  };

  features: {
    allowedSpreads: SpreadType[];
    hasUnlimitedSaves: boolean;
    hasNotifications: boolean;
    hasPremiumSpreads: boolean;
  };

  periods: {
    trialDaysLeft: number;
    premiumDaysLeft: number;
    isTrialActive: boolean;
    isPremiumActive: boolean;
  };
}

// 업그레이드 프롬프트 인터페이스
interface UpgradePrompt {
  title: string;
  message: string;
  features: string[];
  currentTier: SubscriptionTier;
  upgradeOptions: Array<{
    duration: string;
    price: string;
    savings: string | null;
  }>;
}

// 프리미엄 컨텍스트 인터페이스
interface PremiumContextType {
  // 구독 상태
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;

  // 권한 확인
  canSave: () => Promise<boolean>;
  canAccessSpread: (spreadType: SpreadType) => Promise<boolean>;
  getRemainingFeatures: () => any;

  // 사용량 관리
  incrementSaveUsage: (type: 'daily' | 'spread') => Promise<void>;
  refreshUsage: () => Promise<void>;

  // 업그레이드 관리
  showUpgradePrompt: (feature: string) => UpgradePrompt;
  startTrial: () => Promise<void>;
  upgradeToPremium: (durationMonths: number) => Promise<void>;

  // 상태 새로고침
  refreshSubscriptionStatus: () => Promise<void>;
}

// 기본값
const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  tier: SubscriptionTier.FREE,
  isActive: true,
  usage: {
    totalSaves: 0,
    saveLimit: 7,
    remainingSaves: 7,
    dailySaves: 0,
    spreadSaves: 0
  },
  features: {
    allowedSpreads: [
      SpreadType.ONE_CARD,
      SpreadType.THREE_CARD,
      SpreadType.FOUR_CARD,
      SpreadType.FIVE_CARD_V
    ],
    hasUnlimitedSaves: false,
    hasNotifications: true,
    hasPremiumSpreads: false
  },
  periods: {
    trialDaysLeft: 0,
    premiumDaysLeft: 0,
    isTrialActive: false,
    isPremiumActive: false
  }
};

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const usePremium = (): PremiumContextType => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

// 간편한 권한 체크 훅
export const usePremiumAccess = (feature: string): boolean => {
  const { subscriptionStatus } = usePremium();

  if (!subscriptionStatus) return false;

  switch (feature) {
    case 'unlimited_saves':
      return subscriptionStatus.features.hasUnlimitedSaves;
    case 'premium_spreads':
      return subscriptionStatus.features.hasPremiumSpreads;
    case 'notifications':
      return subscriptionStatus.features.hasNotifications;
    default:
      return false;
  }
};

export const PremiumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getAuthHeaders, isAuthenticated, user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 변화 시 구독 상태 로드
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscriptionStatus();
    } else {
      // 비인증 사용자는 기본 FREE 구독으로 설정
      setSubscriptionStatus(DEFAULT_SUBSCRIPTION);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // 구독 상태 로드
  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);

      // TODO: JWT 토큰 추가 필요
      const response = await fetch(`${getApiUrl()}/api/subscription/status`, {
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const status = await response.json();
        setSubscriptionStatus(status);
      } else {
        console.log('Using default subscription status');
        setSubscriptionStatus(DEFAULT_SUBSCRIPTION);
      }
    } catch (error) {
      console.error('Error loading subscription status:', error);
      setSubscriptionStatus(DEFAULT_SUBSCRIPTION);
    } finally {
      setIsLoading(false);
    }
  };

  // 저장 가능 여부 확인
  const canSave = async (): Promise<boolean> => {
    try {
      // TODO: JWT 토큰 추가 필요
      const response = await fetch(`${getApiUrl()}/api/subscription/can-save`, {
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.canSave;
      }

      // 로컬 상태로 폴백
      if (subscriptionStatus) {
        return subscriptionStatus.usage.remainingSaves > 0;
      }

      return false;
    } catch (error) {
      console.error('Error checking save permission:', error);
      return false;
    }
  };

  // 스프레드 접근 권한 확인
  const canAccessSpread = async (spreadType: SpreadType): Promise<boolean> => {
    try {
      // TODO: JWT 토큰 추가 필요
      const response = await fetch(`${getApiUrl()}/api/subscription/can-access-spread`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ spreadType }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.canAccess;
      }

      // 로컬 상태로 폴백
      if (subscriptionStatus) {
        return subscriptionStatus.features.allowedSpreads.includes(spreadType);
      }

      return false;
    } catch (error) {
      console.error('Error checking spread access:', error);
      return false;
    }
  };

  // 남은 기능 정보 조회
  const getRemainingFeatures = () => {
    if (!subscriptionStatus) return null;

    return {
      saves: {
        remaining: subscriptionStatus.usage.remainingSaves,
        total: subscriptionStatus.usage.saveLimit,
        percentage: (subscriptionStatus.usage.remainingSaves / subscriptionStatus.usage.saveLimit) * 100
      },
      spreads: {
        available: subscriptionStatus.features.allowedSpreads.length,
        premium: Object.values(SpreadType).length - subscriptionStatus.features.allowedSpreads.length
      },
      trial: {
        active: subscriptionStatus.periods.isTrialActive,
        daysLeft: subscriptionStatus.periods.trialDaysLeft
      },
      premium: {
        active: subscriptionStatus.periods.isPremiumActive,
        daysLeft: subscriptionStatus.periods.premiumDaysLeft
      }
    };
  };

  // 사용량 증가
  const incrementSaveUsage = async (type: 'daily' | 'spread'): Promise<void> => {
    try {
      // TODO: JWT 토큰 추가 필요
      await fetch(`${getApiUrl()}/api/subscription/increment-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });

      // 로컬 상태 업데이트
      if (subscriptionStatus) {
        const updatedStatus = { ...subscriptionStatus };
        updatedStatus.usage.totalSaves += 1;
        updatedStatus.usage.remainingSaves = Math.max(0, updatedStatus.usage.remainingSaves - 1);

        if (type === 'daily') {
          updatedStatus.usage.dailySaves += 1;
        } else {
          updatedStatus.usage.spreadSaves += 1;
        }

        setSubscriptionStatus(updatedStatus);
      }
    } catch (error) {
      console.error('Error incrementing save usage:', error);
    }
  };

  // 사용량 새로고침
  const refreshUsage = async (): Promise<void> => {
    await loadSubscriptionStatus();
  };

  // 업그레이드 프롬프트 표시
  const showUpgradePrompt = (feature: string): UpgradePrompt => {
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
      currentTier: subscriptionStatus?.tier || SubscriptionTier.FREE,
      upgradeOptions: [
        {
          duration: '1개월',
          price: '₩5,900',
          savings: null
        },
        {
          duration: '6개월',
          price: '₩29,900',
          savings: '15%'
        },
        {
          duration: '1년',
          price: '₩49,900',
          savings: '30%'
        }
      ]
    };
  };

  // 체험 시작
  const startTrial = async (): Promise<void> => {
    try {
      // TODO: JWT 토큰 추가 필요
      const response = await fetch(`${getApiUrl()}/api/subscription/start-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await refreshSubscriptionStatus();
        console.log('✅ Trial started successfully');
      } else {
        throw new Error('Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  };

  // 프리미엄 업그레이드
  const upgradeToPremium = async (durationMonths: number): Promise<void> => {
    try {
      if (!isAuthenticated) {
        throw new Error('Authentication required for premium upgrade');
      }

      // TODO: 실제 결제 처리
      console.log(`💎 Upgrading to premium for ${durationMonths} months`);

      const response = await fetch(`${getApiUrl()}/api/subscription/upgrade-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ durationMonths }),
      });

      if (response.ok) {
        await refreshSubscriptionStatus();
        console.log('✅ Premium upgrade successful');
      } else {
        throw new Error('Failed to upgrade to premium');
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      throw error;
    }
  };

  // 구독 상태 새로고침
  const refreshSubscriptionStatus = async (): Promise<void> => {
    await loadSubscriptionStatus();
  };

  const contextValue: PremiumContextType = {
    subscriptionStatus,
    isLoading,
    canSave,
    canAccessSpread,
    getRemainingFeatures,
    incrementSaveUsage,
    refreshUsage,
    showUpgradePrompt,
    startTrial,
    upgradeToPremium,
    refreshSubscriptionStatus,
  };

  return (
    <PremiumContext.Provider value={contextValue}>
      {children}
    </PremiumContext.Provider>
  );
};

export default PremiumProvider;