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
// Subscription Group: Tarot Timer Premium V2 (ID: 21820675)
export const SUBSCRIPTION_SKUS = {
  monthly: Platform.select({
    ios: 'tarot_timer_monthly_v2', // Apple ID: 6754749911
    android: 'tarot_timer_monthly_v2',
    default: 'tarot_timer_monthly_v2'
  }),
  yearly: Platform.select({
    ios: 'tarot_timer_yearly_v2', // Apple ID: 6755033513
    android: 'tarot_timer_yearly_v2',
    default: 'tarot_timer_yearly_v2'
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
   * ✅ 완전 재작성: 실패 시 명확히 false 반환, 모바일에서 시뮬레이션 모드 차단
   */
  static async initialize(): Promise<boolean> {
    try {
      // 🌐 웹 환경에서만 시뮬레이션 허용
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경: IAP 기능 비활성화 (정상)');
        this.initialized = true;
        return true;
      }

      // 📱 모바일 환경에서는 반드시 RNIap 모듈 필요
      if (!RNIap) {
        console.error('❌ CRITICAL: react-native-iap 모듈을 로드할 수 없습니다.');
        console.error('📌 원인: 네이티브 모듈이 빌드에 포함되지 않음');
        console.error('📌 해결: npx expo prebuild --clean 후 재빌드 필요');
        throw new Error('IAP_MODULE_NOT_LOADED');
      }

      // ✅ RNIap API 메서드 존재 확인
      if (typeof RNIap.initConnection !== 'function') {
        console.error('❌ CRITICAL: react-native-iap API를 사용할 수 없습니다.');
        console.error('📌 원인: Expo Go 또는 개발 빌드 사용 중');
        console.error('📌 해결: Production 빌드 필요');
        throw new Error('IAP_API_NOT_AVAILABLE');
      }

      console.log('💳 IAP 매니저 초기화 시작...');
      console.log('📱 플랫폼:', Platform.OS);
      console.log('📱 iOS 버전:', Platform.Version);
      console.log('🔧 react-native-iap 버전: 14.4.23');

      // RNIap 초기화 (라이브러리 기본 설정 사용)
      // v14.x는 자동으로 최적의 StoreKit 버전 선택
      const isReady = await RNIap.initConnection();
      if (!isReady) {
        console.error('❌ IAP 연결 초기화 실패');
        console.error('📌 네트워크 연결을 확인하고 다시 시도해주세요.');
        throw new Error('IAP_CONNECTION_FAILED');
      }

      console.log('✅ IAP 연결 초기화 성공');

      // 구독 상품 로드 (필수)
      const products = await this.loadProducts();
      if (products.length === 0) {
        console.error('❌ 구독 상품을 로드할 수 없습니다.');
        console.error('📌 App Store Connect에서 상품 설정 확인 필요');
        throw new Error('NO_PRODUCTS_AVAILABLE');
      }

      console.log(`✅ 구독 상품 ${products.length}개 로드 완료`);

      // 구매 복원 시도 (선택적 - 실패해도 계속 진행)
      try {
        await this.restorePurchases();
      } catch (error) {
        console.warn('⚠️ 구매 복원 실패 (무시하고 계속):', error);
      }

      // 주기적 갱신 모니터링 시작
      this.startPeriodicRenewalCheck();

      this.initialized = true;
      console.log('✅ IAP 매니저 초기화 완료');
      return true;

    } catch (error: any) {
      console.error('❌ IAP 초기화 실패:', error);
      this.initialized = false;
      return false; // ✅ 명확히 실패 반환
    }
  }

  /**
   * 구독 상품 정보 로드
   * ✅ 완전 재작성: 실제 상품만 로드, 시뮬레이션 데이터 제거
   */
  static async loadProducts(): Promise<SubscriptionProduct[]> {
    try {
      // 웹 환경에서는 빈 배열 반환
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경: 구독 상품 로드 불가');
        this.products = [];
        return [];
      }

      // RNIap 모듈 필수 확인
      if (!RNIap || typeof RNIap.getSubscriptions !== 'function') {
        console.error('❌ 구독 상품 API를 사용할 수 없습니다.');
        throw new Error('SUBSCRIPTIONS_API_NOT_AVAILABLE');
      }

      const skus = Object.values(SUBSCRIPTION_SKUS);
      console.log('📦 구독 상품 로드 시도:', skus);
      console.log('📱 플랫폼:', Platform.OS);
      console.log('📱 iOS 버전:', Platform.Version);
      console.log('🔧 Bundle ID: com.tarottimer.app');
      console.log('🔧 App ID: 6752687014');

      // 실제 App Store/Play Store에서 상품 정보 가져오기
      let subscriptions;
      try {
        console.log('🔄 RNIap.getSubscriptions() 호출 중...');
        subscriptions = await RNIap.getSubscriptions({ skus });
        console.log('✅ getSubscriptions 응답 받음');
        console.log('📦 응답 타입:', typeof subscriptions);
        console.log('📦 응답 길이:', subscriptions?.length);
        console.log('📦 응답 내용:', JSON.stringify(subscriptions, null, 2));
      } catch (getSubError: any) {
        console.error('❌ getSubscriptions 호출 실패:', getSubError);
        console.error('📌 에러 타입:', typeof getSubError);
        console.error('📌 에러 메시지:', getSubError?.message);
        console.error('📌 에러 코드:', getSubError?.code);
        console.error('📌 에러 스택:', getSubError?.stack);
        console.error('📌 전체 에러 객체:', JSON.stringify(getSubError, null, 2));
        throw getSubError;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.error('❌ 구독 상품을 찾을 수 없습니다.');
        console.error('📌 확인된 SKUs:', skus);
        console.error('📌 App Store Connect 상태: 승인됨');
        console.error('📌 Product IDs:');
        console.error('   - tarot_timer_monthly');
        console.error('   - tarot_timer_yearly');
        console.error('📌 가능한 원인:');
        console.error('   1. Sandbox 계정으로 로그인되지 않음');
        console.error('   2. App Store Connect 동기화 대기 중 (최대 24시간)');
        console.error('   3. 구독 그룹이 활성화되지 않음');
        throw new Error('NO_SUBSCRIPTIONS_FOUND');
      }

      // 상품 데이터 매핑
      this.products = subscriptions.map(sub => ({
        productId: sub.productId,
        title: sub.title || sub.productId,
        description: sub.description || '',
        price: sub.price,
        localizedPrice: sub.localizedPrice,
        currency: sub.currency,
        type: sub.productId.includes('yearly') ? 'yearly' : 'monthly'
      }));

      console.log('✅ 구독 상품 로드 완료:', this.products);
      return this.products;

    } catch (error) {
      console.error('❌ 구독 상품 로드 오류:', error);
      this.products = [];
      throw error; // ✅ 오류를 상위로 전파
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
   * ✅ 완전 재작성: 실제 구매만 처리, 시뮬레이션 제거
   */
  static async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    try {
      // 초기화 확인
      if (!this.initialized) {
        throw new Error('IAP_NOT_INITIALIZED');
      }

      // 웹 환경에서는 구매 불가
      if (Platform.OS === 'web') {
        return {
          success: false,
          error: '웹 환경에서는 구독을 구매할 수 없습니다.\n앱을 다운로드해주세요.'
        };
      }

      // RNIap 모듈 필수 확인
      if (!RNIap || typeof RNIap.requestSubscription !== 'function') {
        console.error('❌ CRITICAL: 구매 API를 사용할 수 없습니다.');
        throw new Error('PURCHASE_API_NOT_AVAILABLE');
      }

      console.log('💳 구독 구매 시작:', productId);

      // 중복 구매 방지
      if (this.activePurchases.has(productId)) {
        return {
          success: false,
          error: '이미 해당 상품의 결제가 진행 중입니다.'
        };
      }

      this.activePurchases.add(productId);

      try {
        // ✅ 실제 Apple/Google 결제 처리
        const purchase = await RNIap.requestSubscription({
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

        console.log('✅ 구매 완료:', purchase);

        if (purchase && purchase.transactionId) {
          // 영수증 검증 및 프리미엄 상태 업데이트
          const receiptData = purchase.transactionReceipt ||
                              JSON.stringify(purchase);

          await this.processPurchaseSuccess(
            productId,
            purchase.transactionId,
            receiptData
          );

          // 구매 확인 (중요!)
          await RNIap.finishTransaction({
            purchase,
            isConsumable: false
          });

          console.log('✅ 구매 처리 완료');

          return {
            success: true,
            productId,
            transactionId: purchase.transactionId,
            purchaseDate: purchase.transactionDate?.toString()
          };
        }

        throw new Error('INVALID_PURCHASE_RESPONSE');

      } finally {
        this.activePurchases.delete(productId);
      }

    } catch (error: any) {
      console.error('❌ 구매 오류:', error);

      // 사용자 취소
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: '구매를 취소했습니다.'
        };
      }

      // 네트워크 오류
      if (error.code === 'E_NETWORK_ERROR') {
        return {
          success: false,
          error: '네트워크 연결을 확인하고 다시 시도해주세요.'
        };
      }

      // 기타 오류
      let errorMessage = '구매 처리 중 오류가 발생했습니다.';

      if (error.message === 'IAP_NOT_INITIALIZED') {
        errorMessage = '구독 시스템이 초기화되지 않았습니다.\n앱을 재시작해주세요.';
      } else if (error.message === 'PURCHASE_API_NOT_AVAILABLE') {
        errorMessage = '앱 내 구매 기능을 사용할 수 없습니다.\n앱을 최신 버전으로 업데이트해주세요.';
      } else if (error.code === 'E_SERVICE_ERROR') {
        errorMessage = '앱스토어 서비스에 일시적인 문제가 있습니다.\n잠시 후 다시 시도해주세요.';
      } else if (error.code === 'E_RECEIPT_FAILED') {
        errorMessage = '영수증 검증에 실패했습니다.\n고객센터로 문의해주세요.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 구매 복원 처리
   * ✅ FIX: 실제 복원된 항목 수를 기반으로 정확한 결과 반환
   */
  static async restorePurchases(): Promise<boolean> {
    try {
      // 웹 환경 또는 RNIap 모듈이 없는 경우
      if (!isMobile || !RNIap || typeof RNIap.getAvailablePurchases !== 'function') {
        console.log('🌐 시뮬레이션 모드: 구매 복원 불가');
        console.log('📌 실제 기기에서만 구매 복원이 가능합니다.');
        return false; // ✅ 수정: 시뮬레이션에서는 false 반환
      }

      console.log('🔄 구매 복원 시작...');

      const purchases = await RNIap.getAvailablePurchases();
      console.log(`📦 앱스토어 구매 내역: ${purchases.length}개`);

      let restoredCount = 0;

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
          restoredCount++;
        }
      }

      console.log(`✅ 구매 복원 완료: ${restoredCount}개 복원됨`);
      return restoredCount > 0; // ✅ 수정: 실제 복원된 항목이 있을 때만 true

    } catch (error) {
      console.error('❌ 구매 복원 오류:', error);
      return false;
    }
  }

  /**
   * 구매 성공 처리 (프리미엄 상태 업데이트)
   * ✅ 보안 강화: 모바일에서 영수증 필수
   */
  private static async processPurchaseSuccess(productId: string, transactionId: string, receiptData?: string): Promise<void> {
    try {
      console.log('🔍 구매 성공 처리 및 영수증 검증 시작...');

      // 📱 모바일 환경에서는 영수증 필수
      if (Platform.OS !== 'web' && !receiptData) {
        console.error('❌ CRITICAL: 모바일에서 영수증 데이터 누락');
        throw new Error('영수증 데이터가 필요합니다');
      }

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

      // 🌐 웹 환경에서만 영수증 없이 처리 허용 (시뮬레이션)
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
        premium_spreads: true,
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
      if (Platform.OS === 'web' || !RNIap || typeof RNIap.getAvailablePurchases !== 'function') {
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
        premium_spreads: false,
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
  private static renewalCheckInterval: ReturnType<typeof setInterval> | null = null;

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
   * ✅ FIX: AdManager와 동기화하여 광고 표시 상태도 즉시 변경
   * 🔒 SECURITY: 프로덕션에서는 차단
   */
  static async simulatePremiumStatusChange(isPremium: boolean): Promise<void> {
    // 🔒 프로덕션에서는 시뮬레이션 차단
    if (!__DEV__) {
      console.error('🚫 프로덕션에서 시뮬레이션 모드 사용 불가');
      throw new Error('Simulation mode is only available in development');
    }

    try {
      const mockStatus: PremiumStatus = {
        is_premium: isPremium,
        subscription_type: isPremium ? 'monthly' : undefined,
        purchase_date: isPremium ? new Date().toISOString() : undefined,
        expiry_date: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined, // 30일 후
        store_transaction_id: isPremium ? `sim-${Date.now()}` : undefined,
        unlimited_storage: isPremium,
        ad_free: isPremium,
        premium_spreads: isPremium,
        last_validated: new Date().toISOString(),
        validation_environment: 'Simulation',
        is_simulation: true // ✅ FIX: 시뮬레이션 플래그 추가
      };

      await LocalStorageManager.updatePremiumStatus(mockStatus);

      // ✅ FIX: AdManager와 즉시 동기화
      try {
        const AdManager = require('./adManager').default;
        AdManager.setPremiumStatus(isPremium);
        console.log(`🔄 AdManager 동기화 완료: ${isPremium ? '프리미엄 활성' : '무료 버전'}`);
      } catch (error) {
        console.warn('⚠️ AdManager 동기화 실패:', error);
      }

      // 프리미엄 상태 변경 이벤트 발생
      // 웹 환경
      if (Platform.OS === 'web') {
        try {
          if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
            window.dispatchEvent(new CustomEvent('premiumStatusChanged', {
              detail: { isPremium }
            }));
          }
        } catch (error) {
          console.warn('⚠️ CustomEvent 사용 불가:', error);
        }
      }

      // 모바일 환경 (React Native)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          const { DeviceEventEmitter } = require('react-native');
          DeviceEventEmitter.emit('premiumStatusChanged', { isPremium });
        } catch (error) {
          console.warn('⚠️ DeviceEventEmitter 사용 불가:', error);
        }
      }

      console.log('✅ 프리미엄 상태 시뮬레이션 완료:', isPremium ? '활성화' : '비활성화');
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

      if (Platform.OS !== 'web' && this.initialized && RNIap && typeof RNIap.endConnection === 'function') {
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