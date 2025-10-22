/**
 * 보상형 광고 컴포넌트
 * 사용자가 선택적으로 시청하여 보상을 받는 AdMob 보상형 광고
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { usePremium } from '../../contexts/PremiumContext';
import { useSafeState } from '../../hooks/useSafeState';
import AdManager from '../../utils/adManager';
import { Icon } from '../Icon';
import { Colors, Spacing, BorderRadius } from '../DesignSystem';

interface RewardedAdProps {
  onRewardEarned?: (rewardType: string, amount: number) => void;
  onAdFailed?: (error: string) => void;
  onAdClosed?: () => void;
  buttonText?: string;
  rewardDescription?: string;
  disabled?: boolean;
  style?: any;
}

const RewardedAd: React.FC<RewardedAdProps> = ({
  onRewardEarned,
  onAdFailed,
  onAdClosed,
  buttonText = '보상 받기',
  rewardDescription = '광고를 시청하고 보상을 받으세요',
  disabled = false,
  style
}) => {
  const { isPremium, premiumStatus, isLoading: premiumLoading } = usePremium();
  const [isLoading, setIsLoading] = useSafeState(false);
  const [lastWatched, setLastWatched] = useSafeState<number>(0);

  // 쿨다운 시간 (5분)
  const COOLDOWN_TIME = 5 * 60 * 1000;

  // 프리미엄 사용자는 보상형 광고 불필요 (무제한)
  const shouldShowRewardedAd = !premiumLoading && !isPremium && !premiumStatus.ad_free;

  /**
   * 쿨다운 확인
   */
  const isCooldownActive = useCallback(() => {
    const now = Date.now();
    return (now - lastWatched) < COOLDOWN_TIME;
  }, [lastWatched]);

  /**
   * 남은 쿨다운 시간 (분 단위)
   */
  const remainingCooldownMinutes = useCallback(() => {
    if (!isCooldownActive()) return 0;
    const remaining = COOLDOWN_TIME - (Date.now() - lastWatched);
    return Math.ceil(remaining / (60 * 1000));
  }, [lastWatched, isCooldownActive]);

  /**
   * 보상형 광고 시청
   */
  const watchRewardedAd = useCallback(async () => {
    if (isLoading || disabled || isCooldownActive()) {
      return;
    }

    try {
      setIsLoading(true);

      console.log('🎁 보상형 광고 시청 시작');

      const result = await AdManager.showRewarded(placement);

      if (result.success) {
        console.log('✅ 보상형 광고 시청 완료 - 보상 지급');

        // 보상 처리
        const rewardType = 'extra_session'; // 추가 타로 세션
        const rewardAmount = 1;

        onRewardEarned?.(rewardType, rewardAmount);
        setLastWatched(Date.now());

        // 웹 환경에서는 시뮬레이션 보상
        if (Platform.OS === 'web') {
          console.log('🌐 웹 환경: 보상형 광고 시뮬레이션 - 보상 지급');
        }

      } else {
        console.log('❌ 보상형 광고 시청 실패:', result.error);
        onAdFailed?.(result.error || '광고 시청에 실패했습니다.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '보상형 광고 오류';
      console.error('❌ 보상형 광고 오류:', errorMessage);
      onAdFailed?.(errorMessage);
    } finally {
      setIsLoading(false);
      onAdClosed?.();
    }
  }, [isLoading, disabled, isCooldownActive, onRewardEarned, onAdFailed, onAdClosed]);

  // 프리미엄 사용자는 보상형 광고 버튼을 다르게 표시
  // ✅ 버그 수정: 로딩 중일 때는 아무것도 표시하지 않음
  if (premiumLoading) {
    return null;
  }

  if (!shouldShowRewardedAd) {
    return (
      <View style={[styles.premiumContainer, style]}>
        <View style={styles.premiumBadge}>
          <Icon name="crown" size={16} color="#f4d03f" />
          <Text style={styles.premiumText}>프리미엄 사용자</Text>
        </View>
        <Text style={styles.premiumMessage}>
          광고 없이도 모든 기능을 이용하실 수 있습니다.
        </Text>
      </View>
    );
  }

  // 쿨다운 중일 때
  if (isCooldownActive()) {
    return (
      <View style={[styles.container, styles.cooldownContainer, style]}>
        <Icon name="clock" size={20} color={Colors.text.secondary} />
        <Text style={styles.cooldownText}>
          {remainingCooldownMinutes()}분 후 다시 시청 가능
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.rewardInfo}>
        <View style={styles.rewardIcon}>
          <Icon name="gift" size={24} color="#f4d03f" />
        </View>
        <View style={styles.rewardTextContainer}>
          <Text style={styles.rewardTitle}>추가 타로 세션</Text>
          <Text style={styles.rewardDescription}>{rewardDescription}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.rewardButton,
          isLoading && styles.loadingButton,
          disabled && styles.disabledButton
        ]}
        onPress={watchRewardedAd}
        disabled={isLoading || disabled}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {!isLoading && (
            <Icon name="play" size={16} color="#1a1625" />
          )}
          <Text style={[styles.buttonText, !isLoading && { marginLeft: 8 }]}>
            {isLoading ? '광고 로딩중...' : buttonText}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

/**
 * 보상형 광고 Hook
 */
export const useRewardedAd = () => {
  const [isAvailable, setIsAvailable] = useSafeState(true);
  const [isLoading, setIsLoading] = useSafeState(false);

  const showRewardedAd = useCallback(async (callbacks?: {
    onRewardEarned?: (rewardType: string, amount: number) => void;
    onFailed?: (error: string) => void;
    onClosed?: () => void;
  }) => {
    try {
      setIsLoading(true);

      const result = await AdManager.showRewarded(placement);

      if (result.success && result.rewardEarned) {
        console.log('✅ Hook: 보상형 광고 시청 완료');
        callbacks?.onRewardEarned?.('extra_session', 1);
      } else {
        console.log('❌ Hook: 보상형 광고 시청 실패:', result.error);
        callbacks?.onFailed?.(result.error || '광고 시청 실패');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '보상형 광고 오류';
      console.error('❌ Hook: 보상형 광고 오류:', errorMessage);
      callbacks?.onFailed?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      callbacks?.onClosed?.();
    }
  }, []);

  return {
    isAvailable,
    isLoading,
    showRewardedAd
  };
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    margin: Spacing.md,
  },
  premiumContainer: {
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.4)',
    margin: Spacing.md,
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4d03f',
    marginLeft: Spacing.xs,
  },
  premiumMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  cooldownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 12, 27, 0.5)',
    opacity: 0.7,
  },
  cooldownText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  rewardButton: {
    backgroundColor: '#f4d03f',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    shadowColor: '#f4d03f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingButton: {
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#666',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1625',
  },
});

export default RewardedAd;