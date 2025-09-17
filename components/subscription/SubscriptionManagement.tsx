/**
 * 구독 관리 컴포넌트
 * 현재 구독 상태 확인, 취소, 변경 등의 기능 제공
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking
} from 'react-native';
import { Platform } from 'react-native';
import { usePremium } from '../../contexts/PremiumContext';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from '../DesignSystem';
import { Icon } from '../Icon';

interface SubscriptionManagementProps {
  onClose?: () => void;
  onUpgrade?: () => void;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  onClose,
  onUpgrade
}) => {
  const [validating, setValidating] = useState(false);

  const {
    premiumStatus,
    isPremium,
    isSubscriptionActive,
    daysUntilExpiry,
    validateSubscription,
    refreshStatus
  } = usePremium();

  /**
   * 구독 상태 새로고침
   */
  const handleRefreshStatus = async () => {
    try {
      setValidating(true);
      await validateSubscription();
      await refreshStatus();
      Alert.alert('완료', '구독 상태가 새로고침되었습니다.');
    } catch (error) {
      Alert.alert('오류', '상태 새로고침 중 오류가 발생했습니다.');
    } finally {
      setValidating(false);
    }
  };

  /**
   * 구독 취소 안내
   */
  const handleCancelSubscription = () => {
    const cancelUrl = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
      default: 'https://support.apple.com/en-us/HT202039'
    });

    Alert.alert(
      '구독 취소',
      '구독 취소는 앱스토어에서 직접 관리할 수 있습니다.\n\n' +
      '취소하더라도 현재 구독 기간이 끝날 때까지는 프리미엄 기능을 계속 이용할 수 있습니다.',
      [
        { text: '닫기', style: 'cancel' },
        {
          text: '앱스토어 열기',
          onPress: () => Linking.openURL(cancelUrl!)
        }
      ]
    );
  };

  /**
   * 구독 타입 표시명
   */
  const getSubscriptionTypeName = (type?: string): string => {
    switch (type) {
      case 'monthly': return '월간 구독';
      case 'yearly': return '연간 구독';
      default: return '알 수 없음';
    }
  };

  /**
   * 구독 상태 표시명과 색상
   */
  const getSubscriptionStatusInfo = () => {
    if (!isPremium) {
      return {
        status: '비활성',
        color: Colors.text.secondary,
        icon: 'x-circle' as const
      };
    }

    if (!isSubscriptionActive) {
      return {
        status: '만료됨',
        color: Colors.state.warning,
        icon: 'alert-circle' as const
      };
    }

    return {
      status: '활성',
      color: Colors.state.success,
      icon: 'check-circle' as const
    };
  };

  const statusInfo = getSubscriptionStatusInfo();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>구독 관리</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 현재 구독 상태 */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Icon name={statusInfo.icon} size={24} color={statusInfo.color} />
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.status}
          </Text>
        </View>

        {isPremium ? (
          <View style={styles.statusDetails}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>구독 타입:</Text>
              <Text style={styles.statusValue}>
                {getSubscriptionTypeName(premiumStatus.subscription_type)}
              </Text>
            </View>

            {premiumStatus.purchase_date && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>구매일:</Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.purchase_date).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            )}

            {premiumStatus.expiry_date && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>만료일:</Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.expiry_date).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            )}

            {daysUntilExpiry !== null && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>남은 기간:</Text>
                <Text style={[
                  styles.statusValue,
                  daysUntilExpiry <= 7 && { color: Colors.state.warning }
                ]}>
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry}일` : '만료됨'}
                </Text>
              </View>
            )}

            {premiumStatus.last_validated && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>마지막 검증:</Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.last_validated).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.inactiveInfo}>
            <Text style={styles.inactiveText}>
              프리미엄 구독이 활성화되어 있지 않습니다.
            </Text>
            <Text style={styles.inactiveSubtext}>
              무제한 타로 세션과 광고 제거 혜택을 받으려면 구독을 시작해보세요.
            </Text>
          </View>
        )}
      </View>

      {/* 프리미엄 기능 상태 */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>프리미엄 기능 상태</Text>

        <View style={styles.featureRow}>
          <View style={styles.featureInfo}>
            <Icon name="infinity" size={20} color={Colors.brand.secondary} />
            <Text style={styles.featureText}>무제한 저장</Text>
          </View>
          <View style={[
            styles.featureStatus,
            premiumStatus.unlimited_storage && styles.featureActive
          ]}>
            <Text style={[
              styles.featureStatusText,
              premiumStatus.unlimited_storage && styles.featureActiveText
            ]}>
              {premiumStatus.unlimited_storage ? '활성' : '비활성'}
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureInfo}>
            <Icon name="x-circle" size={20} color={Colors.brand.secondary} />
            <Text style={styles.featureText}>광고 제거</Text>
          </View>
          <View style={[
            styles.featureStatus,
            premiumStatus.ad_free && styles.featureActive
          ]}>
            <Text style={[
              styles.featureStatusText,
              premiumStatus.ad_free && styles.featureActiveText
            ]}>
              {premiumStatus.ad_free ? '활성' : '비활성'}
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureInfo}>
            <Icon name="palette" size={20} color={Colors.brand.secondary} />
            <Text style={styles.featureText}>프리미엄 테마</Text>
          </View>
          <View style={[
            styles.featureStatus,
            premiumStatus.premium_themes && styles.featureActive
          ]}>
            <Text style={[
              styles.featureStatusText,
              premiumStatus.premium_themes && styles.featureActiveText
            ]}>
              {premiumStatus.premium_themes ? '활성' : '비활성'}
            </Text>
          </View>
        </View>
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.actionsContainer}>
        {!isPremium ? (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
            activeOpacity={0.7}
          >
            <Icon name="arrow-up" size={20} color={Colors.text.inverse} />
            <Text style={styles.upgradeButtonText}>프리미엄 구독하기</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshStatus}
              disabled={validating}
              activeOpacity={0.7}
            >
              <Icon
                name={validating ? "clock" : "refresh-cw"}
                size={20}
                color={Colors.brand.primary}
              />
              <Text style={styles.refreshButtonText}>
                {validating ? '검증 중...' : '상태 새로고침'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
              activeOpacity={0.7}
            >
              <Icon name="external-link" size={20} color={Colors.state.error} />
              <Text style={styles.cancelButtonText}>구독 관리 (앱스토어)</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 도움말 */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>도움말</Text>

        <View style={styles.helpItem}>
          <Icon name="info" size={16} color={Colors.text.secondary} />
          <Text style={styles.helpText}>
            구독은 자동으로 갱신되며, 갱신 24시간 전에 취소할 수 있습니다.
          </Text>
        </View>

        <View style={styles.helpItem}>
          <Icon name="shield" size={16} color={Colors.text.secondary} />
          <Text style={styles.helpText}>
            구독 취소 후에도 현재 구독 기간이 끝날 때까지 프리미엄 기능을 이용할 수 있습니다.
          </Text>
        </View>

        <View style={styles.helpItem}>
          <Icon name="smartphone" size={16} color={Colors.text.secondary} />
          <Text style={styles.helpText}>
            여러 기기에서 같은 Apple ID로 로그인하면 구독을 공유할 수 있습니다.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },

  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: 'bold',
    color: Colors.brand.secondary,
  },

  closeButton: {
    padding: Spacing.sm,
  },

  // 구독 상태
  statusContainer: {
    backgroundColor: Colors.glass.primary,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  statusTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginLeft: Spacing.md,
  },

  statusDetails: {
    marginTop: Spacing.sm,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },

  statusLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
  },

  statusValue: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    fontWeight: '500',
  },

  inactiveInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  inactiveText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  inactiveSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // 프리미엄 기능
  featuresContainer: {
    backgroundColor: Colors.glass.primary,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  featuresTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },

  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  featureText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },

  featureStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(155, 141, 184, 0.2)',
  },

  featureActive: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
  },

  featureStatusText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },

  featureActiveText: {
    color: Colors.state.success,
  },

  // 액션 버튼
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },

  upgradeButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },

  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  refreshButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: '500',
    color: Colors.brand.primary,
  },

  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },

  cancelButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.state.error,
    fontWeight: '500',
  },

  // 도움말
  helpContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  helpTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  helpText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});

export default SubscriptionManagement;