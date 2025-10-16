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
  ActivityIndicator
} from 'react-native';
import { usePremium } from '../../contexts/PremiumContext';
import IAPManager, { SubscriptionProduct } from '../../utils/IAPManager';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from '../DesignSystem';
import { Icon } from '../Icon';

interface SubscriptionPlansProps {
  onClose?: () => void;
  onSubscriptionSuccess?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onClose,
  onSubscriptionSuccess
}) => {
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
      Alert.alert('오류', '구독 상품을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 구독 구매 처리
   */
  const handlePurchase = async () => {
    if (!selectedPlan) {
      Alert.alert('알림', '구독 요금제를 선택해주세요.');
      return;
    }

    try {
      setPurchasing(true);
      console.log('💳 구독 구매 시작:', selectedPlan);

      const success = await purchaseSubscription(selectedPlan);

      if (success) {
        Alert.alert(
          '구독 완료!',
          '프리미엄 구독이 활성화되었습니다. 무제한으로 타로 세션을 즐기세요!',
          [
            {
              text: '확인',
              onPress: () => {
                onSubscriptionSuccess?.();
                onClose?.();
              }
            }
          ]
        );
      } else {
        Alert.alert('구매 실패', '구독 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
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
          '복원 완료',
          '이전 구매가 성공적으로 복원되었습니다!',
          [
            {
              text: '확인',
              onPress: () => {
                onSubscriptionSuccess?.();
                onClose?.();
              }
            }
          ]
        );
      } else {
        Alert.alert('복원 실패', '복원할 구매 내역을 찾을 수 없습니다.');
      }

    } catch (error) {
      console.error('❌ 구매 복원 오류:', error);
      Alert.alert('복원 오류', '구매 복원 중 오류가 발생했습니다.');
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
        discountInfo = `${discount}% 할인`;
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
            {isYearly ? '/ 년' : '/ 월'}
          </Text>
        </View>

        {/* 월별 가격 (연간 구독인 경우) */}
        {isYearly && (
          <Text style={styles.monthlyEquivalent}>
            월 {Math.round(parseInt(product.price) / 12).toLocaleString()}원 상당
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
          <Text style={styles.title}>프리미엄 활성</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.premiumActiveContainer}>
          <Icon name="check-circle" size={64} color={Colors.state.success} />
          <Text style={styles.premiumActiveTitle}>프리미엄 구독 활성!</Text>
          <Text style={styles.premiumActiveDescription}>
            무제한 타로 세션과 프리미엄 기능을 마음껏 이용하세요.
          </Text>

          {premiumStatus.expiry_date && (
            <Text style={styles.expiryInfo}>
              다음 갱신일: {new Date(premiumStatus.expiry_date).toLocaleDateString('ko-KR')}
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
        <Text style={styles.title}>프리미엄 구독</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 프리미엄 기능 소개 */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>프리미엄으로 업그레이드</Text>

        <View style={styles.featureItem}>
          <Icon name="infinity" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>무제한 타로 세션 저장</Text>
        </View>

        <View style={styles.featureItem}>
          <Icon name="x-circle" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>광고 제거</Text>
        </View>

        <View style={styles.featureItem}>
          <Icon name="palette" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>프리미엄 테마</Text>
        </View>

        <View style={styles.featureItem}>
          <Icon name="headphones" size={20} color={Colors.brand.secondary} />
          <Text style={styles.featureText}>우선 고객 지원</Text>
        </View>
      </View>

      {/* 로딩 상태 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>구독 옵션을 불러오는 중...</Text>
        </View>
      ) : (
        <>
          {/* 구독 요금제 */}
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>요금제 선택</Text>
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
                {purchasing ? '구매 처리 중...' : '구독 시작'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon name="refresh-cw" size={16} color={Colors.brand.primary} />
              <Text style={styles.restoreButtonText}>구매 복원</Text>
            </TouchableOpacity>
          </View>

          {/* 약관 안내 */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              • 구독은 자동 갱신되며 언제든지 취소할 수 있습니다.
            </Text>
            <Text style={styles.disclaimerText}>
              • 결제는 iTunes 계정 또는 Google Play를 통해 처리됩니다.
            </Text>
            <Text style={styles.disclaimerText}>
              • 무료 체험 기간 중에도 취소 가능합니다.
            </Text>

            {/* 법률 문서 링크 */}
            <View style={styles.legalLinksContainer}>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => {
                  // TODO: 개인정보 처리방침 URL로 이동
                  console.log('개인정보 처리방침 열기');
                  // Linking.openURL('https://tarottimer.com/privacy');
                }}
              >
                <Text style={styles.legalLinkText}>개인정보 처리방침</Text>
              </TouchableOpacity>

              <Text style={styles.legalDivider}>|</Text>

              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => {
                  // TODO: 이용약관 URL로 이동
                  console.log('이용약관 열기');
                  // Linking.openURL('https://tarottimer.com/terms');
                }}
              >
                <Text style={styles.legalLinkText}>이용약관</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.disclaimerText, styles.legalNotice]}>
              구독을 진행하면 위 약관에 동의하는 것으로 간주됩니다.
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