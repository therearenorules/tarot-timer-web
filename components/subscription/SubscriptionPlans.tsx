/**
 * 구독 요금제 선택 컴포넌트
 * 앱스토어 결제 시스템과 연동된 프리미엄 구독 화면
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Linking
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePremium } from '../../contexts/PremiumContext';
import IAPManager, { SubscriptionProduct } from '../../utils/iapManager';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from '../DesignSystem';
import { Icon } from '../Icon';

// 법률 문서 URL
const PRIVACY_POLICY_URL = 'https://therearenorules.github.io/tarot-timer-landing/privacy.html';
const TERMS_OF_SERVICE_URL = 'https://therearenorules.github.io/tarot-timer-landing/terms.html';

interface SubscriptionPlansProps {
  onClose?: () => void;
  onSubscriptionSuccess?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onClose,
  onSubscriptionSuccess
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const {
    premiumStatus,
    purchaseSubscription,
    restorePurchases,
    isPremium,
    isLoading: premiumLoading
  } = usePremium();

  useEffect(() => {
    loadSubscriptionProducts();
  }, []);

  /**
   * 구독 상품 로드
   */
  const loadSubscriptionProducts = async () => {
    try {
      setLoading(true);
      const availableProducts = await IAPManager.loadProducts();
      setProducts(availableProducts);

      // 기본적으로 월간 구독 선택
      const monthlyProduct = availableProducts.find(p => p.type === 'monthly');
      if (monthlyProduct) {
        setSelectedPlan(monthlyProduct.productId);
      }

      console.log('✅ 구독 상품 로드 완료:', availableProducts.length);
    } catch (error) {
      console.error('❌ 구독 상품 로드 오류:', error);
      Alert.alert(t('settings.premium.plans.loadError'), t('settings.premium.plans.loadErrorMessage'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 구독 구매 처리
   */
  const handlePurchase = async () => {
    if (!selectedPlan) {
      Alert.alert(t('settings.premium.plans.selectPlanPrompt'), t('settings.premium.plans.selectPlanMessage'));
      return;
    }

    try {
      setPurchasing(true);
      console.log('💳 구독 구매 시작:', selectedPlan);

      const success = await purchaseSubscription(selectedPlan);

      if (success) {
        Alert.alert(
          t('settings.premium.plans.purchaseSuccess'),
          t('settings.premium.plans.purchaseSuccessMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                onSubscriptionSuccess?.();
                onClose?.();
              }
            }
          ]
        );
      } else {
        Alert.alert(t('settings.premium.plans.purchaseFailed'), t('settings.premium.plans.purchaseFailedMessage'));
      }

    } catch (error) {
      console.error('❌ 구독 구매 오류:', error);
      Alert.alert('구매 오류', error instanceof Error ? error.message : '구매 처리 중 오류가 발생했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  /**
   * 구매 복원 처리
   */
  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      console.log('🔄 구매 복원 시작...');

      const success = await restorePurchases();

      if (success) {
        Alert.alert(
          t('settings.premium.restore.success.title'),
          t('settings.premium.restore.success.message'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                onSubscriptionSuccess?.();
                onClose?.();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t('settings.premium.restore.notFound.title'),
          t('settings.premium.restore.notFound.message')
        );
      }

    } catch (error) {
      console.error('❌ 구매 복원 오류:', error);
      Alert.alert(
        t('settings.premium.restore.error.title'),
        t('settings.premium.restore.error.message')
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * 할인율 계산
   */
  const calculateDiscount = (monthlyPrice: number, yearlyPrice: number): number => {
    const monthlyTotal = monthlyPrice * 12;
    const discount = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
    return Math.round(discount);
  };

  /**
   * 외부 링크 열기
   */
  const openURL = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t('common.error'), `${title} 페이지를 열 수 없습니다.`);
      }
    } catch (error) {
      console.error('❌ URL 열기 오류:', error);
      Alert.alert(t('common.error'), `${title} 페이지를 여는 중 오류가 발생했습니다.`);
    }
  };

  /**
   * 요금제 카드 렌더링
   */
  const renderPlanCard = (product: SubscriptionProduct) => {
    const isSelected = selectedPlan === product.productId;
    const isYearly = product.type === 'yearly';

    // 할인 정보 계산
    let discountInfo = null;
    if (isYearly && products.length === 2) {
      const monthlyProduct = products.find(p => p.type === 'monthly');
      if (monthlyProduct) {
        const monthlyPrice = parseInt(monthlyProduct.price);
        const yearlyPrice = parseInt(product.price);
        const discount = calculateDiscount(monthlyPrice, yearlyPrice);
        discountInfo = t('settings.premium.plans.discount', { percent: discount });
      }
    }

    return (
      <TouchableOpacity
        key={product.productId}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard
        ]}
        onPress={() => setSelectedPlan(product.productId)}
        activeOpacity={0.7}
      >
        {/* 할인 배지 */}
        {discountInfo && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountInfo}</Text>
          </View>
        )}

        {/* 선택 표시 */}
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planTitle}>{product.title}</Text>
            <Text style={styles.planDescription}>{product.description}</Text>
          </View>

          <View style={[
            styles.radioButton,
            isSelected && styles.selectedRadioButton
          ]}>
            {isSelected && <Icon name="check" size={16} color={Colors.text.inverse} />}
          </View>
        </View>

        {/* 가격 정보 */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.localizedPrice}</Text>
          <Text style={styles.priceUnit}>
            {isYearly ? t('settings.premium.plans.perYear') : t('settings.premium.plans.perMonth')}
          </Text>
        </View>

        {/* 월별 가격 (연간 구독인 경우) */}
        {isYearly && (
          <Text style={styles.monthlyEquivalent}>
            {t('settings.premium.plans.monthlyEquivalent', {
              price: Math.round(parseInt(product.price) / 12).toLocaleString()
            })}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // 이미 프리미엄 사용자인 경우
  if (isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.premium.plans.premiumActiveTitle')}</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.premiumActiveContainer}>
          <Icon name="check-circle" size={64} color={Colors.state.success} />
          <Text style={styles.premiumActiveTitle}>{t('settings.premium.plans.premiumActiveMessage')}</Text>
          <Text style={styles.premiumActiveDescription}>
            {t('settings.premium.plans.premiumActiveDescription')}
          </Text>

          {premiumStatus.expiry_date && (
            <Text style={styles.expiryInfo}>
              {t('settings.premium.plans.nextRenewal', {
                date: new Date(premiumStatus.expiry_date).toLocaleDateString()
              })}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.premium.plans.title')}</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 프리미엄 기능 소개 */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>{t('settings.premium.plans.featuresTitle')}</Text>

        <View style={styles.featureItem}>
          <Icon name="infinity" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>{t('settings.premium.benefits.unlimitedSaves')}</Text>
        </View>

        <View style={styles.featureItem}>
          <Icon name="star" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>{t('settings.premium.benefits.premiumSpreads')}</Text>
        </View>

        <View style={styles.featureItem}>
          <Icon name="x-circle" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>{t('settings.premium.benefits.noAds')}</Text>
        </View>

        <View style={styles.featureItem}>
          <Icon name="zap" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>{t('settings.premium.benefits.futureFeatures')}</Text>
        </View>
      </View>

      {/* 로딩 상태 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>{t('settings.premium.plans.loadingText')}</Text>
        </View>
      ) : (
        <>
          {/* 구독 요금제 */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>{t('settings.premium.plans.selectPlan')}</Text>
            {products.map(renderPlanCard)}
          </View>

          {/* 구매 버튼 */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (!selectedPlan || purchasing) && styles.disabledButton
              ]}
              onPress={handlePurchase}
              disabled={!selectedPlan || purchasing}
              activeOpacity={0.7}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <Icon name="credit-card" size={20} color={Colors.text.inverse} />
              )}
              <Text style={styles.purchaseButtonText}>
                {purchasing ? t('settings.premium.plans.purchasing') : t('settings.premium.plans.startSubscription')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon name="refresh-cw" size={16} color={Colors.brand.primary} />
              <Text style={styles.restoreButtonText}>{t('settings.premium.restore.button')}</Text>
            </TouchableOpacity>
          </View>

          {/* 약관 안내 */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              • {t('settings.premium.plans.disclaimer')}
            </Text>
            {Platform.OS === 'ios' && (
              <>
                <Text style={styles.disclaimerText}>
                  • {t('settings.premium.plans.iosDisclaimer1')}
                </Text>
                <Text style={styles.disclaimerText}>
                  • {t('settings.premium.plans.iosDisclaimer2')}
                </Text>
                <Text style={styles.disclaimerText}>
                  • {t('settings.premium.plans.iosDisclaimer3')}
                </Text>
              </>
            )}
            {Platform.OS === 'android' && (
              <>
                <Text style={styles.disclaimerText}>
                  • {t('settings.premium.plans.androidDisclaimer1')}
                </Text>
                <Text style={styles.disclaimerText}>
                  • {t('settings.premium.plans.androidDisclaimer2')}
                </Text>
                <Text style={styles.disclaimerText}>
                  • {t('settings.premium.plans.androidDisclaimer3')}
                </Text>
              </>
            )}
            {Platform.OS === 'web' && (
              <>
                <Text style={styles.disclaimerText}>
                  • {t('settings.premium.plans.webDisclaimer')}
                </Text>
              </>
            )}
            <Text style={styles.disclaimerText}>
              • {t('settings.premium.plans.freeTrial')}
            </Text>

            {/* 법률 문서 링크 */}
            <View style={styles.legalLinksContainer}>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => openURL(PRIVACY_POLICY_URL, t('settings.premium.plans.privacyPolicy'))}
              >
                <Text style={styles.legalLinkText}>{t('settings.premium.plans.privacyPolicy')}</Text>
              </TouchableOpacity>

              <Text style={styles.legalDivider}>|</Text>

              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => openURL(TERMS_OF_SERVICE_URL, t('settings.premium.plans.termsOfService'))}
              >
                <Text style={styles.legalLinkText}>{t('settings.premium.plans.termsOfService')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.disclaimerText, styles.legalNotice]}>
              {t('settings.premium.plans.agreementText')}
            </Text>
          </View>
        </>
      )}
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

  // 프리미엄 활성 상태
  premiumActiveContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },

  premiumActiveTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.state.success,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  premiumActiveDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },

  expiryInfo: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // 기능 소개
  featuresContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  featuresTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },

  featureText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
    flex: 1,
  },

  // 요금제
  plansContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  plansTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },

  planCard: {
    backgroundColor: Colors.glass.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },

  selectedPlanCard: {
    borderColor: Colors.brand.primary,
    backgroundColor: 'rgba(123, 44, 191, 0.1)',
  },

  discountBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.lg,
    backgroundColor: Colors.state.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  discountText: {
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },

  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  planTitleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },

  planTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  planDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedRadioButton: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  price: {
    fontSize: Typography.sizes.xxl,
    fontWeight: 'bold',
    color: Colors.brand.secondary,
  },

  priceUnit: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },

  monthlyEquivalent: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },

  // 액션 버튼
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  disabledButton: {
    backgroundColor: Colors.text.secondary,
    opacity: 0.6,
  },

  purchaseButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },

  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },

  restoreButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.brand.primary,
    fontWeight: '500',
  },

  // 로딩
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },

  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },

  // 약관
  disclaimerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  disclaimerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },

  // 법률 문서 링크
  legalLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  legalLink: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },

  legalLinkText: {
    fontSize: Typography.sizes.xs,
    color: Colors.brand.primary,
    textDecorationLine: 'underline',
  },

  legalDivider: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.sm,
  },

  legalNotice: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
});

export default SubscriptionPlans;