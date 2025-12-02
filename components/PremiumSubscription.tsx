/**
 * 프리미엄 구독 컴포넌트
 * 앱스토어 결제 UI 및 구독 관리
 */

import React, { useState, useEffect } from 'react';
import { useSafeState } from '../hooks/useSafeState';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IAPManager, { SubscriptionProduct, PurchaseResult } from '../utils/iapManager';
import { PremiumStatus } from '../utils/localStorage';

const { width } = Dimensions.get('window');

interface PremiumSubscriptionProps {
  onClose?: () => void;
  onPurchaseSuccess?: (productId: string) => void;
}

export default function PremiumSubscription({
  onClose,
  onPurchaseSuccess
}: PremiumSubscriptionProps) {
  const [products, setProducts] = useSafeState<SubscriptionProduct[]>([]);
  const [premiumStatus, setPremiumStatus] = useSafeState<PremiumStatus | null>(null);
  const [loading, setLoading] = useSafeState(true);
  const [purchasing, setPurchasing] = useSafeState<string | null>(null);

  useEffect(() => {
    initializeIAP();
  }, []);

  const initializeIAP = async () => {
    try {
      setLoading(true);
      console.log('🔄 [UI] IAP 초기화 시작...');

      // ✅ FIX: Alert 제거 - 조용한 로딩으로 변경 (App Review 대응)
      // IAP 초기화 (내부 재시도 로직 포함)
      const initialized = await IAPManager.initialize();
      if (!initialized) {
        console.error('❌ [UI] IAP 초기화 실패 - 재시도 로직이 내부적으로 동작했습니다');
        // Alert 제거: 사용자에게 에러 표시하지 않음 (오프라인 모드로 동작)
        setLoading(false);
        return;
      }

      console.log('✅ [UI] IAP 초기화 성공 - 상품 로드 시작');

      // ✅ FIX: 구독 상품 로드 (타임아웃 + 재시도 적용됨)
      const availableProducts = await IAPManager.loadProducts();

      if (availableProducts.length === 0) {
        console.warn('⚠️ [UI] 상품 로드 실패 또는 상품 없음 - 재시도 로직이 내부적으로 동작했습니다');
        // Alert 제거: 사용자에게 에러 표시하지 않음 (빈 상태로 표시)
        setLoading(false);
        return;
      }

      console.log(`✅ [UI] 상품 로드 성공: ${availableProducts.length}개`);
      setProducts(availableProducts);

      // 현재 구독 상태 확인 (LocalStorageManager 사용)
      const { LocalStorageManager } = await import('../utils/localStorage');
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      setPremiumStatus(currentStatus);

      console.log('✅ [UI] IAP 초기화 완료');

    } catch (error: any) {
      console.error('❌ [UI] IAP 초기화 오류:', error);
      console.error('📌 에러 상세:', JSON.stringify(error, null, 2));

      // ✅ FIX: Alert 제거 - 조용한 에러 처리 (App Review 대응)
      // 사용자에게 에러 표시하지 않고 로그만 남김
      // 재시도 로직은 IAPManager 내부에서 자동으로 처리됨
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    try {
      setPurchasing(productId);
      console.log('💳 [UI] 구매 프로세스 시작:', productId);

      const result: PurchaseResult = await IAPManager.purchaseSubscription(productId);

      if (result.success) {
        console.log('✅ [UI] 구매 성공 - 사용자 알림 표시');
        Alert.alert(
          '구독 완료! 🎉',
          '프리미엄 구독이 성공적으로 활성화되었습니다.\n\n모든 프리미엄 기능을 이용하실 수 있습니다.',
          [
            {
              text: '확인',
              onPress: async () => {
                console.log('✅ [UI] 구매 완료 확인 - 상태 새로고침');
                onPurchaseSuccess?.(productId);
                await initializeIAP(); // 상태 새로고침
              }
            }
          ]
        );
      } else {
        // ✅ FIX: 에러 타입별 상세 메시지 표시
        console.error('❌ [UI] 구매 실패:', result.error);

        if (result.error && !result.error.includes('취소')) {
          let errorTitle = '구독 실패';
          let errorMessage = result.error;

          // 에러 메시지 개선
          if (result.error.includes('네트워크')) {
            errorTitle = '네트워크 오류';
          } else if (result.error.includes('이미 구매')) {
            errorTitle = '이미 구독 중';
            errorMessage = result.error + '\n\n"구매 복원" 버튼을 눌러주세요.';
          } else if (result.error.includes('상품')) {
            errorTitle = '상품 오류';
          }

          Alert.alert(errorTitle, errorMessage, [{ text: '확인' }]);
        } else if (result.error?.includes('취소')) {
          console.log('ℹ️ [UI] 사용자 구매 취소');
        }
      }

    } catch (error: any) {
      console.error('❌ [UI] 구매 처리 예외:', error);
      console.error('  - Error Message:', error?.message);
      console.error('  - Error Stack:', error?.stack);

      Alert.alert(
        '구독 처리 오류',
        error?.message || '구매 처리 중 오류가 발생했습니다.\n\n잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const restored = await IAPManager.restorePurchases();

      if (restored) {
        Alert.alert(
          '복원 완료',
          '이전 구매가 성공적으로 복원되었습니다! 🎉',
          [
            {
              text: '확인',
              onPress: async () => {
                await initializeIAP(); // 상태 새로고침
              }
            }
          ]
        );
      } else {
        Alert.alert(
          '복원할 구매 내역이 없습니다',
          '이미 구독 중이시라면 App Store 또는 Play Store에서 구독 상태를 확인해주세요.\n\n구독 관리:\n• iOS: 설정 → [사용자 이름] → 구독\n• Android: Play Store → 프로필 → 결제 및 정기 결제',
          [{ text: '확인' }]
        );
      }
    } catch (error: any) {
      console.error('구매 복원 오류:', error);

      let errorMessage = '구매 복원 중 오류가 발생했습니다.';

      if (error.message === 'IAP_MODULE_NOT_AVAILABLE' || error.message === 'IAP_API_NOT_AVAILABLE') {
        errorMessage = '앱 내 구매 기능을 사용할 수 없습니다.\n\n해결 방법:\n• 앱을 최신 버전으로 업데이트해주세요\n• 앱을 재설치해주세요\n• 문제가 지속되면 고객센터로 문의해주세요';
      }

      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPremiumFeatures = () => (
    <View style={styles.featuresContainer}>
      <Text style={styles.featuresTitle}>✨ 프리미엄 기능</Text>

      <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>🚀</Text>
        <Text style={styles.featureText}>무제한 타로 세션 저장</Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>📖</Text>
        <Text style={styles.featureText}>무제한 저널 엔트리</Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>🎯</Text>
        <Text style={styles.featureText}>광고 완전 제거</Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>🎨</Text>
        <Text style={styles.featureText}>프리미엄 테마 및 배경</Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>☁️</Text>
        <Text style={styles.featureText}>클라우드 백업 (선택사항)</Text>
      </View>

      <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>🔮</Text>
        <Text style={styles.featureText}>고급 카드 해석 가이드</Text>
      </View>
    </View>
  );

  const renderCurrentSubscription = () => {
    if (!premiumStatus?.is_premium) return null;

    const expiryDate = premiumStatus.expiry_date
      ? new Date(premiumStatus.expiry_date).toLocaleDateString('ko-KR')
      : '알 수 없음';

    return (
      <View style={styles.currentSubscriptionContainer}>
        <LinearGradient
          colors={['#7b2cbf', '#9b59b6']}
          style={styles.currentSubscriptionGradient}
        >
          <Text style={styles.currentSubscriptionTitle}>🌟 활성 구독</Text>
          <Text style={styles.currentSubscriptionType}>
            {premiumStatus.subscription_type === 'yearly' ? '연간 구독' : '월간 구독'}
          </Text>
          <Text style={styles.currentSubscriptionExpiry}>
            만료일: {expiryDate}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  /**
   * 연간 구독 할인율 자동 계산
   * 월간 가격 × 12 대비 연간 가격 할인율
   */
  const calculateDiscount = (): number | null => {
    const monthlyProduct = products.find(p => p.type === 'monthly');
    const yearlyProduct = products.find(p => p.type === 'yearly');

    if (!monthlyProduct || !yearlyProduct) return null;

    // price는 숫자형 가격 (예: "9900")
    const monthlyPrice = parseFloat(monthlyProduct.price);
    const yearlyPrice = parseFloat(yearlyProduct.price);

    if (isNaN(monthlyPrice) || isNaN(yearlyPrice) || monthlyPrice === 0) return null;

    // 할인율 계산: (1 - 연간가격 / (월간가격 × 12)) × 100
    const discount = ((1 - (yearlyPrice / (monthlyPrice * 12))) * 100);
    return Math.round(discount); // 소수점 반올림
  };

  /**
   * 연간 구독의 월 환산 가격 계산
   * 연간 가격 / 12개월 = 월 상당 가격
   */
  const calculateMonthlyEquivalent = (product: SubscriptionProduct): string | null => {
    if (product.type !== 'yearly') return null;

    const yearlyPrice = parseFloat(product.price);
    if (isNaN(yearlyPrice)) return null;

    const monthlyEquivalent = yearlyPrice / 12;

    // 통화 기호 추출 (localizedPrice에서)
    const currencyMatch = product.localizedPrice.match(/[^\d.,\s]+/);
    const currencySymbol = currencyMatch ? currencyMatch[0] : '';

    // 숫자 포맷팅 (천 단위 콤마)
    const formattedPrice = Math.round(monthlyEquivalent).toLocaleString();

    return `${currencySymbol}${formattedPrice}`;
  };

  const renderSubscriptionCard = (product: SubscriptionProduct) => {
    const isYearly = product.type === 'yearly';
    const isPurchasing = purchasing === product.productId;
    const discountRate = calculateDiscount();
    const monthlyEquivalent = calculateMonthlyEquivalent(product);

    return (
      <TouchableOpacity
        key={product.productId}
        style={[
          styles.subscriptionCard,
          isYearly && styles.popularCard
        ]}
        onPress={() => handlePurchase(product.productId)}
        disabled={isPurchasing || loading}
      >
        <LinearGradient
          colors={isYearly ? ['#f4d03f', '#f7dc6f'] : ['#8e44ad', '#9b59b6']}
          style={styles.cardGradient}
        >
          {isYearly && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>인기</Text>
            </View>
          )}

          <Text style={[styles.cardTitle, isYearly && styles.popularCardTitle]}>
            {product.title}
          </Text>

          <Text style={[styles.cardPrice, isYearly && styles.popularCardPrice]}>
            {product.localizedPrice}
          </Text>

          {isYearly && monthlyEquivalent && (
            <Text style={styles.monthlyEquivalentText}>
              월 {monthlyEquivalent} 상당
            </Text>
          )}

          <Text style={[styles.cardPeriod, isYearly && styles.popularCardPeriod]}>
            {isYearly ? '연간' : '월간'}
          </Text>

          {isYearly && discountRate && discountRate > 0 && (
            <Text style={styles.discountText}>
              💰 월간 대비 {discountRate}% 할인!
            </Text>
          )}

          <Text style={[styles.cardDescription, isYearly && styles.popularCardDescription]}>
            {product.description}
          </Text>

          {isPurchasing ? (
            <ActivityIndicator
              size="small"
              color={isYearly ? '#8e44ad' : '#f4d03f'}
            />
          ) : (
            <Text style={[styles.purchaseButton, isYearly && styles.popularPurchaseButton]}>
              구독하기
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7b2cbf" />
        <Text style={styles.loadingText}>프리미엄 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1a1625', '#2d1b47']}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>🔮 타로 타이머 프리미엄</Text>
        <Text style={styles.subtitle}>더 풍부한 타로 경험을 시작하세요</Text>
      </LinearGradient>

      {renderCurrentSubscription()}
      {renderPremiumFeatures()}

      <View style={styles.subscriptionsContainer}>
        <Text style={styles.subscriptionsTitle}>구독 플랜 선택</Text>

        {products.length > 0 ? (
          products.map(renderSubscriptionCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>현재 구매 가능한 상품이 없습니다.</Text>
            <Text style={styles.emptySubText}>잠시 후 다시 시도해주세요.</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          disabled={loading}
        >
          <Text style={styles.restoreButtonText}>구매 복원</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          구독하면 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.{'\n'}
          구독은 각 플랫폼의 앱스토어에서 관리할 수 있습니다.
        </Text>
      </View>

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1625',
  },
  loadingText: {
    color: '#d4b8ff',
    fontSize: 16,
    marginTop: 16,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f4d03f',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d4b8ff',
    textAlign: 'center',
  },
  currentSubscriptionContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentSubscriptionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  currentSubscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  currentSubscriptionType: {
    fontSize: 16,
    color: '#f4d03f',
    marginBottom: 4,
  },
  currentSubscriptionExpiry: {
    fontSize: 14,
    color: '#d4b8ff',
  },
  featuresContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: '#2d1b47',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7b2cbf',
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4d03f',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    fontSize: 16,
    color: '#d4b8ff',
    flex: 1,
  },
  subscriptionsContainer: {
    padding: 16,
  },
  subscriptionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f4d03f',
    textAlign: 'center',
    marginBottom: 20,
  },
  subscriptionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#f4d03f',
  },
  cardGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  popularCardTitle: {
    color: '#8e44ad',
  },
  cardPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4d03f',
    marginBottom: 4,
  },
  popularCardPrice: {
    color: '#8e44ad',
  },
  monthlyEquivalentText: {
    fontSize: 12,
    color: '#8e44ad',
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.9,
  },
  cardPeriod: {
    fontSize: 14,
    color: '#d4b8ff',
    marginBottom: 8,
  },
  popularCardPeriod: {
    color: '#8e44ad',
  },
  discountText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#d4b8ff',
    marginBottom: 16,
    lineHeight: 20,
  },
  popularCardDescription: {
    color: '#8e44ad',
  },
  purchaseButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4d03f',
    textAlign: 'center',
    paddingVertical: 8,
  },
  popularPurchaseButton: {
    color: '#8e44ad',
  },
  restoreButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#2d1b47',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7b2cbf',
  },
  restoreButtonText: {
    color: '#d4b8ff',
    fontSize: 16,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#8e44ad',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  closeButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#8e44ad',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d1b47',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7b2cbf',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f4d03f',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#d4b8ff',
    textAlign: 'center',
  },
});