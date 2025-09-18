/**
 * 앱스토어 인앱결제 매니저
 * iOS App Store & Google Play Store 결제 처리
 */

import { Platform } from 'react-native';

// 웹 환경에서는 react-native-iap을 조건부로 import
let RNIap: any = null;
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

if (isMobile) {
  try {
    RNIap = require('react-native-iap');
    console.log('✅ react-native-iap 모듈 로드 성공');
  } catch (error) {
    console.warn('⚠️ react-native-iap not available:', error);
  }
} else {
  console.log('🌐 웹 환경: react-native-iap 비활성화');
}
import LocalStorageManager, { PremiumStatus } from './localStorage';
import ReceiptValidator from './receiptValidator';

// 구독 상품 ID 정의
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'tarot_timer_monthly',
    android: 'tarot_timer_monthly',
    default: 'tarot_timer_monthly'
  }),
  yearly: Platform.select({
    ios: 'tarot_timer_yearly',
    android: 'tarot_timer_yearly',
    default: 'tarot_timer_yearly'
  })
} as const;

export interface SubscriptionProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  localizedPrice: string;
  currency: string;
  type: 'monthly' | 'yearly';
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  purchaseDate?: string;
  error?: string;
}

export class IAPManager {
  private static initialized = false;
  private static products: SubscriptionProduct[] = [];

  /**
   * IAP 초기화
   */
  static async initialize(): Promise<boolean> {
    try {
      // 웹 환경에서는 IAP 비활성화
      if (!isMobile) {
        console.log('🌐 웹 환경: IAP 기능을 시뮬레이션 모드로 실행');
        this.initialized = true;
        return true;
      }

      // RNIap 모듈이 로드되지 않은 경우 처리
      if (!RNIap) {
        console.log('⚠️ react-native-iap 모듈을 사용할 수 없습니다. 시뮬레이션 모드로 전환합니다.');
        this.initialized = true;
        return true;
      }

      console.log('💳 IAP 매니저 초기화 시작...');

      // RNIap 초기화
      const isReady = await RNIap.initConnection();
      if (!isReady) {
        console.log('⚠️ IAP 연결 초기화 실패. 시뮬레이션 모드로 전환합니다.');
        this.initialized = true;
        return true;
      }

      // 구독 상품 정보 로드
      await this.loadProducts();

      // 구매 복원 처리 (앱 시작 시 자동 호출)
      await this.restorePurchases();

      // 구독 갱신 자동 처리 시작
      await this.processSubscriptionRenewal();

      // 주기적 갱신 모니터링 시작
      this.startPeriodicRenewalCheck();

      this.initialized = true;
      console.log('✅ IAP 매니저 초기화 완료');
      return true;

    } catch (error) {
      console.error('❌ IAP 초기화 오류:', error);
      return false;
    }
  }

  /**
   * 구독 상품 정보 로드
   */
  static async loadProducts(): Promise<SubscriptionProduct[]> {
    try {
      if (Platform.OS === 'web') {
        // 웹 환경용 시뮬레이션 데이터
        this.products = [
          {
            productId: SUBSCRIPTION_SKUS.monthly,
            title: '타로 타이머 월간 프리미엄',
            description: '무제한 세션 저장, 광고 제거, 프리미엄 테마',
            price: '3900',
            localizedPrice: '₩3,900',
            currency: 'KRW',
            type: 'monthly'
          },
          {
            productId: SUBSCRIPTION_SKUS.yearly,
            title: '타로 타이머 연간 프리미엄',
            description: '무제한 세션 저장, 광고 제거, 프리미엄 테마 (58% 할인)',
            price: '19900',
            localizedPrice: '₩19,900',
            currency: 'KRW',
            type: 'yearly'
          }
        ];
        return this.products;
      }

      const skus = Object.values(SUBSCRIPTION_SKUS);
      const subscriptions = await RNIap.getSubscriptions({ skus });

      this.products = subscriptions.map(sub => ({
        productId: sub.productId,
        title: sub.title || sub.productId,
        description: sub.description || '',
        price: sub.price,
        localizedPrice: sub.localizedPrice,
        currency: sub.currency,
        type: sub.productId.includes('yearly') ? 'yearly' : 'monthly'
      }));

      console.log('📦 구독 상품 로드 완료:', this.products.length);
      return this.products;

    } catch (error) {
      console.error('❌ 구독 상품 로드 오류:', error);
      return [];
    }
  }

  /**
   * 구독 상품 목록 조회
   */
  static getProducts(): SubscriptionProduct[] {
    return this.products;
  }

  /**
   * 구독 구매 처리
   */
  static async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    try {
      if (!this.initialized) {
        throw new Error('IAP 매니저가 초기화되지 않았습니다.');
      }

      console.log('💳 구독 구매 시작:', productId);

      if (Platform.OS === 'web') {
        // 웹 환경용 시뮬레이션
        const result = await this.simulateWebPurchase(productId);
        if (result.success) {
          await this.processPurchaseSuccess(productId, 'web_simulation_' + Date.now());
        }
        return result;
      }

      // 실제 구매 처리 (네트워크 재시도 적용)
      const purchase = await this.retryWithExponentialBackoff(async () => {
        return await RNIap.requestSubscription({
          sku: productId,
          ...(Platform.OS === 'android' && {
            subscriptionOffers: [
              {
                sku: productId,
                offerToken: 'default_offer_token'
              }
            ]
          })
        });
      });

      if (purchase && purchase.transactionId) {
        await this.processPurchaseSuccess(productId, purchase.transactionId);

        // 구매 확인 (중요: 앱스토어에 구매 완료 알림)
        await RNIap.finishTransaction({
          purchase,
          isConsumable: false
        });

        return {
          success: true,
          productId,
          transactionId: purchase.transactionId,
          purchaseDate: purchase.transactionDate.toString()
        };
      }

      throw new Error('구매 처리에 실패했습니다.');

    } catch (error: any) {
      console.error('❌ 구매 오류:', error);

      // 사용자가 취소한 경우
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: '사용자가 구매를 취소했습니다.'
        };
      }

      return {
        success: false,
        error: error.message || '구매 처리 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 구매 복원 처리
   */
  static async restorePurchases(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경: 구매 복원 시뮬레이션');
        return true;
      }

      console.log('🔄 구매 복원 시작...');

      const purchases = await RNIap.getAvailablePurchases();

      for (const purchase of purchases) {
        if (Object.values(SUBSCRIPTION_SKUS).includes(purchase.productId)) {
          // 구매 복원 시에도 영수증 검증 수행
          const receiptData = purchase.transactionReceipt ||
                              JSON.stringify({
                                transactionId: purchase.transactionId,
                                productId: purchase.productId,
                                purchaseDate: purchase.transactionDate
                              });

          await this.processPurchaseSuccess(purchase.productId, purchase.transactionId, receiptData);
          console.log('✅ 구독 복원 및 검증 완료:', purchase.productId);
        }
      }

      console.log('✅ 구매 복원 완료');
      return true;

    } catch (error) {
      console.error('❌ 구매 복원 오류:', error);
      return false;
    }
  }

  /**
   * 구매 성공 처리 (프리미엄 상태 업데이트)
   */
  private static async processPurchaseSuccess(productId: string, transactionId: string, receiptData?: string): Promise<void> {
    try {
      console.log('🔍 구매 성공 처리 및 영수증 검증 시작...');

      // 영수증 검증 수행
      if (receiptData) {
        const validationResult = await ReceiptValidator.validateReceipt(receiptData, transactionId);

        if (!validationResult.isValid) {
          console.error('❌ 영수증 검증 실패:', validationResult.error);
          throw new Error('영수증 검증에 실패했습니다: ' + validationResult.error);
        }

        if (!validationResult.isActive) {
          console.error('❌ 구독이 활성 상태가 아닙니다');
          throw new Error('구독이 활성 상태가 아닙니다');
        }

        // 검증된 영수증 데이터로 구독 상태 동기화
        await ReceiptValidator.syncSubscriptionStatus(validationResult, productId);
        console.log('✅ 영수증 검증 및 동기화 완료');
        return;
      }

      // 영수증 데이터가 없는 경우 기본 처리 (웹 환경 등)
      const isYearly = productId.includes('yearly');
      const currentDate = new Date();
      const expiryDate = new Date(currentDate);

      // 만료일 계산
      if (isYearly) {
        expiryDate.setFullYear(currentDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(currentDate.getMonth() + 1);
      }

      const premiumStatus: PremiumStatus = {
        is_premium: true,
        subscription_type: isYearly ? 'yearly' : 'monthly',
        purchase_date: currentDate.toISOString(),
        expiry_date: expiryDate.toISOString(),
        store_transaction_id: transactionId,
        unlimited_storage: true,
        ad_free: true,
        premium_themes: true,
        last_validated: currentDate.toISOString(),
        validation_environment: Platform.OS === 'web' ? 'Sandbox' : 'Production'
      };

      await LocalStorageManager.updatePremiumStatus(premiumStatus);
      console.log('✅ 프리미엄 상태 업데이트 완료');

    } catch (error) {
      console.error('❌ 구매 성공 처리 오류:', error);
      throw error; // 에러를 다시 던져서 상위에서 처리하도록 함
    }
  }

  /**
   * 웹 환경용 구매 시뮬레이션
   */
  private static async simulateWebPurchase(productId: string): Promise<PurchaseResult> {
    return new Promise((resolve) => {
      // 2초 후 성공으로 시뮬레이션
      setTimeout(() => {
        resolve({
          success: true,
          productId,
          transactionId: `web_sim_${Date.now()}`,
          purchaseDate: new Date().toISOString()
        });
      }, 2000);
    });
  }

  /**
   * 현재 구독 상태 확인
   */
  static async getCurrentSubscriptionStatus(): Promise<PremiumStatus> {
    const currentStatus = await LocalStorageManager.getPremiumStatus();

    // 주기적 영수증 검증 수행
    if (currentStatus.is_premium) {
      await ReceiptValidator.periodicValidation();
      // 검증 후 업데이트된 상태 반환
      return await LocalStorageManager.getPremiumStatus();
    }

    return currentStatus;
  }

  /**
   * 강제 구독 상태 검증 및 갱신
   */
  static async forceValidateSubscription(): Promise<boolean> {
    try {
      const currentStatus = await LocalStorageManager.getPremiumStatus();

      if (!currentStatus.is_premium || !currentStatus.store_transaction_id) {
        console.log('⚠️ 검증할 구독이 없습니다.');
        return false;
      }

      console.log('🔄 강제 구독 검증 시작...');

      // 영수증 데이터 준비
      const receiptData = currentStatus.receipt_data || JSON.stringify({
        transactionId: currentStatus.store_transaction_id,
        productId: currentStatus.subscription_type === 'yearly' ? 'tarot_timer_yearly' : 'tarot_timer_monthly',
        purchaseDate: currentStatus.purchase_date
      });

      // 영수증 검증 수행
      const validationResult = await ReceiptValidator.validateReceipt(receiptData, currentStatus.store_transaction_id);

      // 검증 결과에 따라 구독 상태 업데이트
      const productId = currentStatus.subscription_type === 'yearly' ? 'tarot_timer_yearly' : 'tarot_timer_monthly';
      await ReceiptValidator.syncSubscriptionStatus(validationResult, productId);

      console.log('✅ 강제 구독 검증 완료:', validationResult.isActive ? '활성' : '비활성');
      return validationResult.isActive;

    } catch (error) {
      console.error('❌ 강제 구독 검증 오류:', error);
      return false;
    }
  }

  /**
   * 구독 갱신 자동 처리 로직 (NEW)
   * 앱 시작 시 및 주기적으로 호출되어 구독 상태를 자동 갱신
   */
  static async processSubscriptionRenewal(): Promise<boolean> {
    try {
      const currentStatus = await LocalStorageManager.getPremiumStatus();

      if (!currentStatus.is_premium) {
        console.log('⚠️ 프리미엄 구독이 없어 갱신 처리 건너뜀');
        return false;
      }

      console.log('🔄 구독 갱신 자동 처리 시작...');

      // 만료일 확인
      if (currentStatus.expiry_date) {
        const now = new Date();
        const expiryDate = new Date(currentStatus.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`📅 구독 만료까지 ${daysUntilExpiry}일 남음`);

        // 만료된 경우 상태 업데이트
        if (daysUntilExpiry <= 0) {
          console.log('⏰ 구독이 만료되었습니다. 상태를 확인합니다...');

          // 앱스토어에서 최신 구매 정보 확인
          const latestPurchases = await this.restorePurchases();

          if (latestPurchases) {
            console.log('✅ 구독 갱신이 확인되었습니다.');
            return true;
          } else {
            console.log('❌ 구독 갱신이 확인되지 않았습니다. 프리미엄 상태를 해제합니다.');
            await this.deactivatePremiumStatus();
            return false;
          }
        }

        // 만료 7일 전부터 알림 대상으로 표시
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          console.log('⚠️ 구독 만료 임박: 갱신 확인을 권장합니다.');

          // 갱신 상태 미리 확인
          await this.checkRenewalStatus();
        }
      }

      return true;
    } catch (error) {
      console.error('❌ 구독 갱신 처리 오류:', error);
      return false;
    }
  }

  /**
   * 구독 갱신 상태 확인 (NEW)
   */
  private static async checkRenewalStatus(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경: 갱신 상태 확인 건너뜀');
        return;
      }

      // 최신 구매 내역에서 갱신된 구독 찾기
      const purchases = await RNIap.getAvailablePurchases();
      const currentStatus = await LocalStorageManager.getPremiumStatus();

      for (const purchase of purchases) {
        if (Object.values(SUBSCRIPTION_SKUS).includes(purchase.productId)) {
          // 기존 거래 ID와 다른 새로운 거래가 있는지 확인
          if (purchase.transactionId !== currentStatus.store_transaction_id) {
            console.log('🔄 새로운 구독 갱신이 감지되었습니다:', purchase.transactionId);

            // 새로운 구독 정보로 업데이트
            await this.processPurchaseSuccess(purchase.productId, purchase.transactionId, purchase.transactionReceipt);
            break;
          }
        }
      }
    } catch (error) {
      console.error('❌ 갱신 상태 확인 오류:', error);
    }
  }

  /**
   * 프리미엄 상태 비활성화 (NEW)
   */
  private static async deactivatePremiumStatus(): Promise<void> {
    try {
      const deactivatedStatus: PremiumStatus = {
        is_premium: false,
        subscription_type: undefined,
        purchase_date: undefined,
        expiry_date: undefined,
        store_transaction_id: undefined,
        unlimited_storage: false,
        ad_free: false,
        premium_themes: false,
        last_validated: new Date().toISOString(),
        validation_environment: Platform.OS === 'web' ? 'Sandbox' : 'Production'
      };

      await LocalStorageManager.updatePremiumStatus(deactivatedStatus);

      // 프리미엄 상태 변경 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('premiumStatusChanged', {
          detail: { isPremium: false }
        }));
      }

      console.log('✅ 프리미엄 상태가 비활성화되었습니다.');
    } catch (error) {
      console.error('❌ 프리미엄 상태 비활성화 오류:', error);
      throw error;
    }
  }

  /**
   * 구독 갱신 실패 처리 (NEW)
   */
  static async handleRenewalFailure(reason: string): Promise<void> {
    try {
      console.log('❌ 구독 갱신 실패:', reason);

      const currentStatus = await LocalStorageManager.getPremiumStatus();

      // 유예 기간 설정 (7일)
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

      const gracePeriodStatus: PremiumStatus = {
        ...currentStatus,
        expiry_date: gracePeriodEnd.toISOString(),
        validation_environment: 'GracePeriod',
        last_validated: new Date().toISOString()
      };

      await LocalStorageManager.updatePremiumStatus(gracePeriodStatus);

      console.log('⏳ 구독 갱신 유예 기간이 설정되었습니다 (7일)');
    } catch (error) {
      console.error('❌ 갱신 실패 처리 오류:', error);
    }
  }

  /**
   * 주기적 구독 상태 모니터링 시작 (NEW)
   */
  static startPeriodicRenewalCheck(): void {
    // 기존 타이머가 있으면 제거
    if (this.renewalCheckInterval) {
      clearInterval(this.renewalCheckInterval);
    }

    // 24시간마다 갱신 상태 확인
    this.renewalCheckInterval = setInterval(async () => {
      console.log('🔄 주기적 구독 갱신 확인 시작...');
      await this.processSubscriptionRenewal();
    }, 24 * 60 * 60 * 1000); // 24시간

    console.log('✅ 주기적 구독 갱신 모니터링이 시작되었습니다.');
  }

  /**
   * 주기적 구독 상태 모니터링 중지 (NEW)
   */
  static stopPeriodicRenewalCheck(): void {
    if (this.renewalCheckInterval) {
      clearInterval(this.renewalCheckInterval);
      this.renewalCheckInterval = null;
      console.log('✅ 주기적 구독 갱신 모니터링이 중지되었습니다.');
    }
  }

  // 클래스 정적 변수 추가
  private static renewalCheckInterval: NodeJS.Timeout | null = null;

  /**
   * 네트워크 오류 시 복구 로직 (NEW)
   */
  static async retryWithExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ 작업 실패 (시도 ${i + 1}/${maxRetries}):`, error);

        if (i === maxRetries - 1) {
          break; // 마지막 재시도
        }

        // 지수 백오프 대기
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * 중복 결제 방지 메커니즘 (NEW)
   */
  private static activePurchases = new Set<string>();

  static async purchaseWithDuplicateProtection(productId: string): Promise<PurchaseResult> {
    if (this.activePurchases.has(productId)) {
      return {
        success: false,
        error: '이미 해당 상품의 결제가 진행 중입니다. 잠시 후 다시 시도해주세요.'
      };
    }

    try {
      this.activePurchases.add(productId);
      return await this.purchaseSubscription(productId);
    } finally {
      this.activePurchases.delete(productId);
    }
  }

  /**
   * 결제 중단 시 상태 롤백 (NEW)
   */
  static async rollbackFailedPurchase(productId: string, transactionId?: string): Promise<void> {
    try {
      console.log('🔄 실패한 결제 상태 롤백 시작:', productId);

      // 부분적으로 저장된 프리미엄 상태가 있다면 제거
      const currentStatus = await LocalStorageManager.getPremiumStatus();

      if (currentStatus.store_transaction_id === transactionId && transactionId) {
        console.log('⚠️ 실패한 거래의 프리미엄 상태를 제거합니다.');
        await this.deactivatePremiumStatus();
      }

      // 활성 결제 목록에서 제거
      this.activePurchases.delete(productId);

      console.log('✅ 결제 상태 롤백 완료');
    } catch (error) {
      console.error('❌ 결제 롤백 오류:', error);
    }
  }

  /**
   * 환불 처리 자동화 (NEW)
   */
  static async handleRefund(transactionId: string): Promise<void> {
    try {
      console.log('💰 환불 처리 시작:', transactionId);

      const currentStatus = await LocalStorageManager.getPremiumStatus();

      // 해당 거래 ID와 일치하는 경우 프리미엄 상태 해제
      if (currentStatus.store_transaction_id === transactionId) {
        await this.deactivatePremiumStatus();

        // 환불 알림 이벤트 발생
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('subscriptionRefunded', {
            detail: { transactionId }
          }));
        }

        console.log('✅ 환불로 인한 프리미엄 상태 해제 완료');
      } else {
        console.log('⚠️ 현재 활성 구독과 다른 거래 ID입니다.');
      }
    } catch (error) {
      console.error('❌ 환불 처리 오류:', error);
    }
  }

  /**
   * 구독 취소 (앱스토어에서 수동으로 처리)
   */
  static async cancelSubscription(): Promise<void> {
    // 실제 취소는 앱스토어에서 사용자가 직접 처리
    // 여기서는 UI 안내만 제공
    const cancelUrl = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
      default: 'https://support.apple.com/en-us/HT202039'
    });

    console.log('📱 구독 취소 URL:', cancelUrl);
    // 실제 앱에서는 Linking.openURL(cancelUrl) 사용
  }

  /**
   * 프리미엄 상태 시뮬레이션 (테스트용)
   */
  static async simulatePremiumStatusChange(isPremium: boolean): Promise<void> {
    try {
      const mockStatus: PremiumStatus = {
        is_premium: isPremium,
        subscription_type: isPremium ? 'monthly' : undefined,
        purchase_date: isPremium ? new Date().toISOString() : undefined,
        expiry_date: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined, // 30일 후
        store_transaction_id: isPremium ? `sim-${Date.now()}` : undefined,
        unlimited_storage: isPremium,
        ad_free: isPremium,
        premium_themes: isPremium,
        last_validated: new Date().toISOString(),
        validation_environment: 'Simulation'
      };

      await LocalStorageManager.updatePremiumStatus(mockStatus);

      // 프리미엄 상태 변경 이벤트 발생
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('premiumStatusChanged', {
          detail: { isPremium }
        }));
      }

      console.log('🔄 프리미엄 상태 시뮬레이션:', isPremium ? '활성화' : '비활성화');
    } catch (error) {
      console.error('❌ 프리미엄 상태 시뮬레이션 오류:', error);
      throw error;
    }
  }

  /**
   * IAP 연결 해제
   */
  static async dispose(): Promise<void> {
    try {
      // 주기적 갱신 모니터링 중지
      this.stopPeriodicRenewalCheck();

      if (Platform.OS !== 'web' && this.initialized) {
        await RNIap.endConnection();
        this.initialized = false;
        console.log('✅ IAP 연결 해제 완료');
      }
    } catch (error) {
      console.error('❌ IAP 연결 해제 오류:', error);
    }
  }
}

export default IAPManager;