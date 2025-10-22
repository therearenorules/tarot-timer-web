/**
 * 구독 관리 컴포넌트
 * 현재 구독 상태 확인, 취소, 변경 등의 기능 제공
 */

import React from 'react';
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
import { useTranslation } from 'react-i18next';
import { usePremium } from '../../contexts/PremiumContext';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from '../DesignSystem';
import { Icon } from '../Icon';
import { useSafeState } from '../../hooks/useSafeState';

interface SubscriptionManagementProps {
  onClose?: () => void;
  onUpgrade?: () => void;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  onClose,
  onUpgrade
}) => {
  const { t } = useTranslation();
  const [validating, setValidating] = useSafeState(false);

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
   * useSafeState를 사용하여 컴포넌트 언마운트 시 자동 보호
   */
  const handleRefreshStatus = async () => {
    try {
      setValidating(true);
      await validateSubscription();
      await refreshStatus();

      Alert.alert(
        t('settings.premium.management.refreshComplete'),
        t('settings.premium.management.refreshSuccess')
      );
    } catch (error) {
      Alert.alert(
        t('settings.premium.management.refreshError'),
        t('settings.premium.management.refreshErrorMessage')
      );
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
      t('settings.premium.management.cancelTitle'),
      t('settings.premium.management.cancelMessage'),
      [
        { text: t('settings.premium.management.cancelButton'), style: 'cancel' },
        {
          text: t('settings.premium.management.openStoreButton'),
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
      case 'monthly':
        return t('settings.premium.management.subscriptionType.monthly');
      case 'yearly':
        return t('settings.premium.management.subscriptionType.yearly');
      case 'trial':
        return t('settings.premium.management.subscriptionType.trial');
      default:
        return t('settings.premium.management.subscriptionType.unknown');
    }
  };

  /**
   * 구독 상태 표시명과 색상
   */
  const getSubscriptionStatusInfo = () => {
    if (!isPremium) {
      return {
        status: t('settings.premium.management.statusLabels.inactive'),
        color: Colors.text.secondary,
        icon: 'x-circle' as const
      };
    }

    if (!isSubscriptionActive) {
      return {
        status: t('settings.premium.management.statusLabels.expired'),
        color: Colors.state.warning,
        icon: 'alert-circle' as const
      };
    }

    return {
      status: t('settings.premium.management.statusLabels.active'),
      color: Colors.state.success,
      icon: 'check-circle' as const
    };
  };

  const statusInfo = getSubscriptionStatusInfo();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.premium.management.title')}</Text>
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
              <Text style={styles.statusLabel}>
                {t('settings.premium.management.detailLabels.subscriptionType')}
              </Text>
              <Text style={styles.statusValue}>
                {getSubscriptionTypeName(premiumStatus.subscription_type)}
              </Text>
            </View>

            {premiumStatus.purchase_date && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {t('settings.premium.management.detailLabels.purchaseDate')}
                </Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.purchase_date).toLocaleDateString()}
                </Text>
              </View>
            )}

            {premiumStatus.expiry_date && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {t('settings.premium.management.detailLabels.expiryDate')}
                </Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.expiry_date).toLocaleDateString()}
                </Text>
              </View>
            )}

            {daysUntilExpiry !== null && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {t('settings.premium.management.detailLabels.remainingDays')}
                </Text>
                <Text style={[
                  styles.statusValue,
                  daysUntilExpiry <= 7 && { color: Colors.state.warning }
                ]}>
                  {daysUntilExpiry > 0
                    ? t('settings.premium.management.detailLabels.daysRemaining', { days: daysUntilExpiry })
                    : t('settings.premium.management.detailLabels.expiredLabel')
                  }
                </Text>
              </View>
            )}

            {premiumStatus.last_validated && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {t('settings.premium.management.detailLabels.lastValidated')}
                </Text>
                <Text style={styles.statusValue}>
                  {new Date(premiumStatus.last_validated).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.inactiveInfo}>
            <Text style={styles.inactiveText}>
              {t('settings.premium.management.inactiveMessage')}
            </Text>
            <Text style={styles.inactiveSubtext}>
              {t('settings.premium.management.inactiveSubtext')}
            </Text>
          </View>
        )}
      </View>

      {/* 프리미엄 기능 상태 */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>
          {t('settings.premium.management.featuresTitle')}
        </Text>

        <View style={styles.featureRow}>
          <View style={styles.featureInfo}>
            <Icon name="infinity" size={20} color={Colors.brand.secondary} />
            <Text style={styles.featureText}>
              {t('settings.premium.management.featureNames.unlimitedStorage')}
            </Text>
          </View>
          <View style={[
            styles.featureStatus,
            premiumStatus.unlimited_storage && styles.featureActive
          ]}>
            <Text style={[
              styles.featureStatusText,
              premiumStatus.unlimited_storage && styles.featureActiveText
            ]}>
              {premiumStatus.unlimited_storage
                ? t('settings.premium.management.featureStatus.active')
                : t('settings.premium.management.featureStatus.inactive')
              }
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureInfo}>
            <Icon name="x-circle" size={20} color={Colors.brand.secondary} />
            <Text style={styles.featureText}>
              {t('settings.premium.management.featureNames.adFree')}
            </Text>
          </View>
          <View style={[
            styles.featureStatus,
            premiumStatus.ad_free && styles.featureActive
          ]}>
            <Text style={[
              styles.featureStatusText,
              premiumStatus.ad_free && styles.featureActiveText
            ]}>
              {premiumStatus.ad_free
                ? t('settings.premium.management.featureStatus.active')
                : t('settings.premium.management.featureStatus.inactive')
              }
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureInfo}>
            <Icon name="layout" size={20} color={Colors.brand.secondary} />
            <Text style={styles.featureText}>
              {t('settings.premium.management.featureNames.premiumSpreads')}
            </Text>
          </View>
          <View style={[
            styles.featureStatus,
            premiumStatus.premium_spreads && styles.featureActive
          ]}>
            <Text style={[
              styles.featureStatusText,
              premiumStatus.premium_spreads && styles.featureActiveText
            ]}>
              {premiumStatus.premium_spreads
                ? t('settings.premium.management.featureStatus.active')
                : t('settings.premium.management.featureStatus.inactive')
              }
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
            <Text style={styles.upgradeButtonText}>
              {t('settings.premium.management.actions.upgrade')}
            </Text>
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
                {t('settings.premium.management.actions.refresh')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
              activeOpacity={0.7}
            >
              <Icon name="external-link" size={20} color={Colors.state.error} />
              <Text style={styles.cancelButtonText}>
                {t('settings.premium.management.actions.cancel')}
              </Text>
            </TouchableOpacity>
          </>
        )}
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