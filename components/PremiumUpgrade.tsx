/**
 * 프리미엄 업그레이드 컴포넌트
 * 설정탭에서 사용되는 구독 관리 인터페이스
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from './DesignSystem';
import { Icon } from './Icon';
import IAPManager, { SubscriptionProduct } from '../utils/iapManager';
import { usePremium } from '../contexts/PremiumContext';

interface PremiumUpgradeProps {
  onPurchaseComplete?: () => void;
}

export const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({
  onPurchaseComplete
}) => {
  const { t } = useTranslation();
  const { subscriptionStatus, isLoading } = usePremium();

  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionProducts();
    setupPurchaseListeners();

    return () => {
      cleanupListeners();
    };
  }, []);

  /**
   * 구독 상품 로드
   */
  const loadSubscriptionProducts = async () => {
    try {
      if (Platform.OS === 'web') {
        // 웹 환경용 시뮬레이션 데이터 로드
        const webProducts = await IAPManager.loadProducts();
        setProducts(webProducts);
        setLoadingProducts(false);
        return;
      }

      await IAPManager.initialize();
      const productList = await IAPManager.loadProducts();
      setProducts(productList);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  /**
   * 구매 이벤트 리스너 설정
   */
  const setupPurchaseListeners = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('premiumStatusChanged', handlePremiumStatusChange);
      window.addEventListener('purchaseError', handlePurchaseError);
    }
  };

  /**
   * 리스너 정리
   */
  const cleanupListeners = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('premiumStatusChanged', handlePremiumStatusChange);
      window.removeEventListener('purchaseError', handlePurchaseError);
    }
  };

  /**
   * 프리미엄 상태 변경 처리
   */
  const handlePremiumStatusChange = (event: any) => {
    const { isPremium } = event.detail;
    setPurchasing(null);

    if (isPremium && onPurchaseComplete) {
      onPurchaseComplete();
    }

    Alert.alert(
      t('premium.purchaseSuccess.title'),
      t('premium.purchaseSuccess.message'),
      [{ text: t('common.ok') }]
    );
  };

  /**
   * 구매 에러 처리
   */
  const handlePurchaseError = (event: any) => {
    const { error } = event.detail;
    setPurchasing(null);

    Alert.alert(
      t('premium.purchaseError.title'),
      error.message || t('premium.purchaseError.message'),
      [{ text: t('common.ok') }]
    );
  };

  /**
   * 구독 구매
   */
  const handlePurchase = async (productId: string) => {
    try {
      setPurchasing(productId);
      const result = await IAPManager.purchaseSubscription(productId);

      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      // 구매 성공 시 처리
      if (result.success && onPurchaseComplete) {
        onPurchaseComplete();
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setPurchasing(null);

      Alert.alert(
        t('premium.purchaseError.title'),
        error.message || t('premium.purchaseError.message'),
        [{ text: t('common.ok') }]
      );
    }
  };

  /**
   * 구매 복원 (iOS)
   */
  const handleRestorePurchases = async () => {
    try {
      const success = await IAPManager.restorePurchases();

      if (success) {
        Alert.alert(
          t('premium.restore.success.title'),
          t('premium.restore.success.message'),
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(
          t('premium.restore.notFound.title'),
          t('premium.restore.notFound.message'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert(
        t('premium.restore.error.title'),
        t('premium.restore.error.message'),
        [{ text: t('common.ok') }]
      );
    }
  };

  /**
   * 구독 관리 (앱스토어)
   */
  const handleManageSubscription = () => {
    Alert.alert(
      t('premium.manage.title'),
      t('premium.manage.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('premium.manage.openStore'),
          onPress: () => {
            // 앱스토어 구독 관리 페이지로 이동
            // 실제 구현에서는 Linking API 사용
            console.log('Open app store subscription management');
          }
        }
      ]
    );
  };

  // 현재 프리미엄 사용자인 경우
  if (subscriptionStatus.isActive && subscriptionStatus.tier === 'premium') {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <Icon name="crown" size={24} color={Colors.brand.secondary} />
          <Text style={styles.statusTitle}>{t('premium.status.active')}</Text>
          <Text style={styles.statusSubtitle}>{t('premium.status.description')}</Text>
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleManageSubscription}
          activeOpacity={0.7}
        >
          <Text style={styles.manageButtonText}>{t('premium.manage.button')}</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreButtonText}>{t('premium.restore.button')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // 무료 사용자 - 업그레이드 옵션 표시
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="sparkles" size={24} color={Colors.brand.secondary} />
        <Text style={styles.title}>{t('premium.upgrade.title')}</Text>
        <Text style={styles.subtitle}>{t('premium.upgrade.subtitle')}</Text>
      </View>

      {/* 프리미엄 혜택 */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>{t('premium.benefits.title')}</Text>

        <View style={styles.benefitItem}>
          <Icon name="check" size={16} color={Colors.state.success} />
          <Text style={styles.benefitText}>{t('premium.benefits.unlimitedSaves')}</Text>
        </View>

        <View style={styles.benefitItem}>
          <Icon name="check" size={16} color={Colors.state.success} />
          <Text style={styles.benefitText}>{t('premium.benefits.noAds')}</Text>
        </View>

        <View style={styles.benefitItem}>
          <Icon name="check" size={16} color={Colors.state.success} />
          <Text style={styles.benefitText}>{t('premium.benefits.premiumSpreads')}</Text>
        </View>

      </View>

      {/* 구독 상품 */}
      {loadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>{t('premium.loading')}</Text>
        </View>
      ) : (
        <View style={styles.productsContainer}>
          {products.map((product) => (
            <TouchableOpacity
              key={product.productId}
              style={[
                styles.productCard,
                product.productId.includes('yearly') && styles.popularCard
              ]}
              onPress={() => handlePurchase(product.productId)}
              disabled={purchasing !== null}
              activeOpacity={0.7}
            >
              {product.productId.includes('yearly') && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>{t('premium.popular')}</Text>
                </View>
              )}

              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productPrice}>{product.localizedPrice}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>

              {purchasing === product.productId ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.selectText}>{t('premium.select')}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 웹 플랫폼 안내 */}
      {Platform.OS === 'web' && (
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeText}>{t('premium.webNotice')}</Text>
        </View>
      )}

      {/* 구매 복원 (iOS) */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          activeOpacity={0.7}
        >
          <Text style={styles.restoreButtonText}>{t('premium.restore.button')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.glass.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.brand.secondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  benefitsContainer: {
    marginBottom: Spacing.lg,
  },

  benefitsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  benefitText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },

  productsContainer: {
    gap: Spacing.md,
  },

  productCard: {
    backgroundColor: Colors.glass.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },

  popularCard: {
    borderColor: Colors.brand.secondary,
    borderWidth: 2,
  },

  popularBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: Colors.brand.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  popularText: {
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },

  productTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  productPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.brand.secondary,
    marginBottom: Spacing.sm,
  },

  productDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },

  selectText: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },

  statusContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
  },

  statusTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.brand.secondary,
    marginTop: Spacing.sm,
  },

  statusSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  manageButton: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },

  manageButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.text.inverse,
    textAlign: 'center',
  },

  restoreButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  restoreButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },

  webNotice: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },

  webNoticeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});