import { useSafeState } from "./../hooks/useSafeState";
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
  const { premiumStatus, isPremium, isLoading } = usePremium();

  const [products, setProducts] = useSafeState<SubscriptionProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useSafeState(true);
  const [purchasing, setPurchasing] = useSafeState<string | null>(null);
  const [loadError, setLoadError] = useSafeState<string | null>(null);
  const [retryCount, setRetryCount] = useSafeState(0);

  useEffect(() => {
    loadSubscriptionProducts();
    setupPurchaseListeners();

    return () => {
      cleanupListeners();
    };
  }, []);

  /**
   * 구독 상품 로드
   * ✅ 에러 처리 및 폴백 UI 추가
   */
  const loadSubscriptionProducts = async () => {
    try {
      setLoadingProducts(true);
      setLoadError(null);

      if (Platform.OS === 'web') {
        // 웹 환경용 시뮬레이션 데이터 로드
        const webProducts = await IAPManager.loadProducts();
        setProducts(webProducts);
        setLoadingProducts(false);
        return;
      }

      // ✅ 초기화 시도 (실패해도 계속 진행)
      const initialized = await IAPManager.initialize();
      if (!initialized) {
        console.warn('⚠️ IAP 초기화 실패, 폴백 상품 표시');
        setProducts(getFallbackProducts());
        setLoadError('INIT_FAILED');
        setLoadingProducts(false);
        return;
      }

      const productList = await IAPManager.loadProducts();

      if (productList && productList.length > 0) {
        setProducts(productList);
        setLoadError(null);
      } else {
        // 상품이 없는 경우 폴백 데이터 사용
        console.warn('⚠️ 구독 상품을 불러올 수 없어 기본 정보를 표시합니다.');
        setProducts(getFallbackProducts());
        setLoadError('PRODUCTS_EMPTY');
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);

      // 에러 메시지 설정
      let errorMessage = 'LOAD_ERROR';
      if (error?.message === 'NETWORK_ERROR') {
        errorMessage = 'NETWORK_ERROR';
      } else if (error?.message === 'TIMEOUT_ERROR') {
        errorMessage = 'TIMEOUT_ERROR';
      } else if (error?.message === 'NO_SUBSCRIPTIONS_FOUND') {
        errorMessage = 'NO_SUBSCRIPTIONS_FOUND';
      }

      setLoadError(errorMessage);
      // 에러 시에도 폴백 상품 표시
      setProducts(getFallbackProducts());
    } finally {
      setLoadingProducts(false);
    }
  };

  /**
   * 폴백 상품 데이터 (네트워크 오류 시 표시)
   */
  const getFallbackProducts = (): SubscriptionProduct[] => {
    return [
      {
        productId: 'tarot_timer_monthly',
        title: t('settings.premium.plans.monthly.title', { defaultValue: 'Monthly Premium' }),
        description: t('settings.premium.plans.monthly.description', { defaultValue: 'Monthly subscription' }),
        price: '4900',
        localizedPrice: '₩4,900',
        currency: 'KRW',
        type: 'monthly'
      },
      {
        productId: 'tarot_timer_yearly',
        title: t('settings.premium.plans.yearly.title', { defaultValue: 'Yearly Premium' }),
        description: t('settings.premium.plans.yearly.description', { defaultValue: 'Yearly subscription - Save 50%' }),
        price: '29000',
        localizedPrice: '₩29,000',
        currency: 'KRW',
        type: 'yearly'
      }
    ];
  };

  /**
   * 상품 다시 로드
   */
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadSubscriptionProducts();
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
      t('settings.premium.purchaseSuccess.title'),
      t('settings.premium.purchaseSuccess.message'),
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
      t('settings.premium.purchaseError.title'),
      error.message || t('settings.premium.purchaseError.message'),
      [{ text: t('common.ok') }]
    );
  };

  /**
   * 구독 구매
   * ✅ 에러 처리 개선 및 사용자 친화적 메시지
   */
  const handlePurchase = async (productId: string) => {
    try {
      setPurchasing(productId);

      // 에러 상태가 있는 경우 먼저 재시도 권장
      if (loadError) {
        console.log('⚠️ 에러 상태에서 구매 시도, 상품 재로드 시도...');
      }

      const result = await IAPManager.purchaseSubscription(productId);

      if (!result.success && result.error) {
        throw new Error(result.error);
      }

      // 구매 성공 시 처리
      if (result.success) {
        setLoadError(null); // 성공 시 에러 상태 초기화
        if (onPurchaseComplete) {
          onPurchaseComplete();
        }
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setPurchasing(null);

      // 사용자 친화적 에러 메시지
      let errorMessage = error.message || t('settings.premium.purchaseError.message');

      // 네트워크 관련 에러 감지
      if (errorMessage.includes('네트워크') || errorMessage.includes('Network')) {
        errorMessage = t('settings.premium.error.network', {
          defaultValue: 'Network connection issue. Please check your connection and try again.'
        });
      }

      Alert.alert(
        t('settings.premium.purchaseError.title'),
        errorMessage,
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
          t('settings.premium.restore.success.title'),
          t('settings.premium.restore.success.message'),
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(
          t('settings.premium.restore.notFound.title'),
          t('settings.premium.restore.notFound.message'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert(
        t('settings.premium.restore.error.title'),
        t('settings.premium.restore.error.message'),
        [{ text: t('common.ok') }]
      );
    }
  };

  /**
   * 구독 관리 (앱스토어)
   */
  const handleManageSubscription = () => {
    Alert.alert(
      t('settings.premium.manage.title'),
      t('settings.premium.manage.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.premium.manage.openStore'),
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
  if (isPremium && premiumStatus.is_premium) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <Icon name="crown" size={24} color={Colors.brand.secondary} />
          <Text style={styles.statusTitle}>{t('settings.premium.status.active')}</Text>
          <Text style={styles.statusSubtitle}>{t('settings.premium.status.description')}</Text>
        </View>

        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleManageSubscription}
          activeOpacity={0.7}
        >
          <Text style={styles.manageButtonText}>{t('settings.premium.manage.button')}</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreButtonText}>{t('settings.premium.restore.button')}</Text>
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
        <Text style={styles.title}>{t('settings.premium.upgrade.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.premium.upgrade.subtitle')}</Text>
      </View>

      {/* 프리미엄 혜택 */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>{t('settings.premium.benefits.title')}</Text>

        <View style={styles.benefitItem}>
          <Icon name="check" size={16} color={Colors.state.success} />
          <Text style={styles.benefitText}>{t('settings.premium.benefits.unlimitedSaves')}</Text>
        </View>

        <View style={styles.benefitItem}>
          <Icon name="check" size={16} color={Colors.state.success} />
          <Text style={styles.benefitText}>{t('settings.premium.benefits.noAds')}</Text>
        </View>

        <View style={styles.benefitItem}>
          <Icon name="check" size={16} color={Colors.state.success} />
          <Text style={styles.benefitText}>{t('settings.premium.benefits.premiumSpreads')}</Text>
        </View>

      </View>

      {/* 구독 상품 */}
      {loadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>{t('settings.premium.loading')}</Text>
        </View>
      ) : (
        <View style={styles.productsContainer}>
          {/* 에러 상태 표시 및 재시도 버튼 */}
          {loadError && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={Colors.state.warning} />
              <Text style={styles.errorText}>
                {loadError === 'NETWORK_ERROR'
                  ? t('settings.premium.error.network', { defaultValue: 'Network connection issue. Showing default prices.' })
                  : loadError === 'TIMEOUT_ERROR'
                  ? t('settings.premium.error.timeout', { defaultValue: 'Connection timed out. Showing default prices.' })
                  : loadError === 'INIT_FAILED'
                  ? t('settings.premium.error.init', { defaultValue: 'Could not connect to App Store. Please try again.' })
                  : t('settings.premium.error.general', { defaultValue: 'Could not load latest prices. Showing default prices.' })}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.7}
              >
                <Icon name="refresh" size={14} color={Colors.brand.primary} />
                <Text style={styles.retryText}>{t('settings.premium.retry', { defaultValue: 'Retry' })}</Text>
              </TouchableOpacity>
            </View>
          )}

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
                  <Text style={styles.popularText}>{t('settings.premium.popular')}</Text>
                </View>
              )}

              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productPrice}>{product.localizedPrice}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>

              {purchasing === product.productId ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.selectText}>{t('settings.premium.select')}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 웹 플랫폼 안내 */}
      {Platform.OS === 'web' && (
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeText}>{t('settings.premium.webNotice')}</Text>
        </View>
      )}

      {/* 구매 복원 (iOS) */}
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          activeOpacity={0.7}
        >
          <Text style={styles.restoreButtonText}>{t('settings.premium.restore.button')}</Text>
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

  errorContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(123, 44, 191, 0.2)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },

  retryText: {
    fontSize: Typography.sizes.sm,
    color: Colors.brand.primary,
    fontWeight: '600',
  },
});