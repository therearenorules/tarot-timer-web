/**
 * 프리미엄 구독 컴포넌트
 * 앱스토어 결제 UI 및 구독 관리
 */

import React, { useState, useEffect } from 'react';
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
import IAPManager, { SubscriptionProduct, PurchaseResult } from '../utils/IAPManager';
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
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    initializeIAP();
  }, []);

  const initializeIAP = async () => {
    try {
      setLoading(true);

      // IAP 초기화
      const initialized = await IAPManager.initialize();
      if (!initialized) {
        Alert.alert('오류', 'IAP 시스템을 초기화할 수 없습니다.');
        return;
      }

      // 구독 상품 로드
      const availableProducts = await IAPManager.loadProducts();
      setProducts(availableProducts);

      // 현재 구독 상태 확인
      const currentStatus = await IAPManager.getCurrentSubscriptionStatus();
      setPremiumStatus(currentStatus);

    } catch (error) {
      console.error('IAP 초기화 오류:', error);
      Alert.alert('오류', 'IAP 시스템 초기화 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    try {
      setPurchasing(productId);

      const result: PurchaseResult = await IAPManager.purchaseSubscription(productId);

      if (result.success) {
        Alert.alert(
          '구매 완료',
          '프리미엄 구독이 활성화되었습니다! 🎉',
          [
            {
              text: '확인',
              onPress: () => {
                onPurchaseSuccess?.(productId);
                initializeIAP(); // 상태 새로고침
              }
            }
          ]
        );
      } else {
        if (result.error && !result.error.includes('취소')) {
          Alert.alert('구매 실패', result.error);
        }
      }

    } catch (error) {
      console.error('구매 처리 오류:', error);
      Alert.alert('오류', '구매 처리 중 오류가 발생했습니다.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const restored = await IAPManager.restorePurchases();

      if (restored) {
        Alert.alert('복원 완료', '구매가 복원되었습니다.');
        await initializeIAP(); // 상태 새로고침
      } else {
        Alert.alert('복원 실패', '복원할 구매 내역이 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '구매 복원 중 오류가 발생했습니다.');
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

  const renderSubscriptionCard = (product: SubscriptionProduct) => {
    const isYearly = product.type === 'yearly';
    const isPurchasing = purchasing === product.productId;

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

          <Text style={[styles.cardPeriod, isYearly && styles.popularCardPeriod]}>
            {isYearly ? '연간' : '월간'}
          </Text>

          {isYearly && (
            <Text style={styles.discountText}>
              💰 월간 대비 33% 할인!
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

        {products.map(renderSubscriptionCard)}

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
});