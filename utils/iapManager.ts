/**
 * 앱스토어 인앱결제 매니저
 * iOS App Store & Google Play Store 결제 처리
 */

import { Platform } from 'react-native';

// 초기화 시작 로그 (가장 먼저 실행)
console.log('🚀 iapManager.ts 모듈 초기화 시작');
console.log('📱 Platform.OS:', Platform.OS);

// react-native-iap을 static import로 변경 (Expo autolinking 활용)
import * as RNIapModule from 'react-native-iap';

console.log('📦 RNIapModule import 완료');

const RNIap = Platform.OS === 'web' ? null : RNIapModule;
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

console.log('🔍 최종 RNIap:', RNIap ? 'Loaded' : 'Null (Web)');

import LocalStorageManager, { PremiumStatus } from './localStorage';
import { ReceiptValidator } from './receiptValidator';

// 구독 상품 ID 정의
// Subscription Group: Tarot Timer Premium (App Store Connect에 등록된 ID)
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
  subscriptionOfferDetails?: any[]; // Android Offer Token용
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  purchaseDate?: string;
  error?: string;
}

class IAPManager {
  private static initialized = false;
  private static products: SubscriptionProduct[] = [];
  private static purchaseUpdateSubscription: any = null;
  private static purchaseErrorSubscription: any = null;
  private static purchaseTimeouts = new Map<string, NodeJS.Timeout>();
  private static pendingPurchaseResolvers = new Map<string, { resolve: (value: PurchaseResult) => void, reject: (reason?: any) => void }>();
  private static renewalCheckInterval: ReturnType<typeof setInterval> | null = null;
  private static activePurchases = new Set<string>();

  /**
   * IAP 초기화
   * ✅ FIX: 재시도 로직 추가 (App Review 환경 대응)
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      console.log('✅ IAPManager 이미 초기화됨');
      return true;
    }

    if (Platform.OS === 'web') {
      this.initialized = true;
      return true;
    }

    if (!RNIap) {
      console.warn('⚠️ RNIap 모듈이 로드되지 않았습니다.');
      return false;
    }

    // ✅ FIX: 재시도 로직 (최대 3회, 2초 간격)
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        console.log(`🔄 IAPManager 초기화 시도 (${4 - retries}/3)...`);

        // 연결 초기화
        await RNIap.initConnection();
        this.initialized = true;
        console.log('✅ RNIap 연결 성공');

        // 리스너 설정
        await this.setupPurchaseListeners();

        // 상품 로드 (비동기) - await 없이 실행하여 초기화 지연 방지
        this.loadProducts().catch(e => console.warn('⚠️ 초기 상품 로드 실패:', e));

        console.log(`✅ IAPManager 초기화 완료 (시도 ${4 - retries}/3)`);
        return true;

      } catch (error) {
        lastError = error;
        console.error(`❌ IAPManager 초기화 실패 (시도 ${4 - retries}/3):`, error);

        if (retries > 1) {
          console.log(`⏳ 2초 후 재시도... (남은 시도: ${retries - 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        retries--;
      }
    }

    console.error('❌ IAPManager 초기화 최종 실패 (3회 시도 모두 실패):', lastError);
    return false;
  }

  /**
   * 구매 리스너 설정
   */
  static async setupPurchaseListeners() {
    if (Platform.OS === 'web' || !RNIap) return;

    try {
      // 기존 리스너 제거
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      // 구매 업데이트 리스너
      this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
        console.log('💳 [1/5] 구매 업데이트 수신:', purchase.productId);

        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            console.log('💳 [2/5] 영수증 확인 완료');

            // ✅ FIX: finishTransaction 호출
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            console.log('💳 [3/5] 결제 승인(finishTransaction) 완료');

            // ✅ FIX: Sandbox 환경 대응 - 2초 딜레이 (영수증 전파 대기)
            console.log('⏳ Sandbox 영수증 전파 대기 중... (2초)');
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('💳 [4/5] 영수증 전파 대기 완료');

            // 성공 처리
            await this.processPurchaseSuccess(purchase.productId, purchase.transactionId || '', receipt);
            console.log('💳 [5/5] 구독 처리 완료');

            // Pending Promise 해결
            const resolver = this.pendingPurchaseResolvers.get(purchase.productId);
            if (resolver) {
              resolver.resolve({
                success: true,
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                purchaseDate: new Date(purchase.transactionDate).toISOString()
              });
              this.pendingPurchaseResolvers.delete(purchase.productId);
            }
          } catch (ackErr) {
            console.error('❌ 결제 승인 실패 [상세]:', ackErr);
            const resolver = this.pendingPurchaseResolvers.get(purchase.productId);
            if (resolver) {
              resolver.reject(ackErr);
              this.pendingPurchaseResolvers.delete(purchase.productId);
            }
          }
        }
      });

      // 구매 에러 리스너
      this.purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
        console.error('❌ [IAP Error Listener] 구매 에러 발생:');
        console.error('  - Error Code:', (error as any)?.code);
        console.error('  - Error Message:', (error as any)?.message);
        console.error('  - Error Details:', JSON.stringify(error, null, 2));

        // ✅ FIX: 에러 타입별 상세 메시지
        let userFriendlyMessage = '구매 처리 중 오류가 발생했습니다.';

        const errorCode = (error as any)?.code;
        if (errorCode === 'E_USER_CANCELLED') {
          userFriendlyMessage = '사용자가 구매를 취소했습니다.';
          console.log('ℹ️ 사용자 취소 - 정상 동작');
        } else if (errorCode === 'E_NETWORK_ERROR') {
          userFriendlyMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
        } else if (errorCode === 'E_ITEM_UNAVAILABLE') {
          userFriendlyMessage = '구매할 수 없는 상품입니다.';
        } else if (errorCode === 'E_ALREADY_OWNED') {
          userFriendlyMessage = '이미 구매한 상품입니다. 구매 복원을 시도해주세요.';
        } else if (errorCode === 'E_UNKNOWN') {
          userFriendlyMessage = '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }

        // Pending Promise 거부
        const errorWithMessage = new Error(userFriendlyMessage);
        (errorWithMessage as any).originalError = error;

        this.pendingPurchaseResolvers.forEach((resolver, key) => {
          resolver.reject(errorWithMessage);
          this.pendingPurchaseResolvers.delete(key);
        });
      });

      console.log('✅ 구매 리스너 설정 완료');
    } catch (error) {
      console.error('❌ 리스너 설정 실패:', error);
    }
  }

  /**
   * 상품 목록 로드
   * ✅ FIX: v14.x 규격 준수 + 재시도 로직 추가 (App Review 환경 대응)
   */
  static async loadProducts(): Promise<SubscriptionProduct[]> {
    if (Platform.OS === 'web') return [];

    if (!RNIap) {
      console.warn('⚠️ RNIap 모듈이 로드되지 않았습니다.');
      return [];
    }

    if (!this.initialized) await this.initialize();

    const skus = Object.values(SUBSCRIPTION_SKUS).filter(id => id !== 'default');
    console.log('🔄 구독 상품 정보 요청:', skus);

    // ✅ FIX: 재시도 로직 (최대 3회, 2초 간격)
    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        console.log(`📦 상품 로드 시도 (${4 - retries}/3)...`);

        // ✅ FIX: getProducts 사용 및 type: 'subs' 명시
        const products = await RNIap.getProducts({ skus, type: 'subs' } as any);

        if (products && products.length > 0) {
          console.log(`✅ 상품 로드 성공: ${products.length}개 (시도 ${4 - retries}/3)`);

          this.products = products.map(p => ({
            productId: p.productId,
            title: p.title,
            description: p.description,
            price: p.price,
            localizedPrice: p.localizedPrice,
            currency: p.currency,
            type: p.productId.includes('yearly') ? 'yearly' : 'monthly',
            // ✅ Android Offer Token 저장
            subscriptionOfferDetails: (p as any).subscriptionOfferDetails
          }));

          return this.products;
        }

        // 상품이 없는 경우 재시도
        console.warn(`⚠️ 상품 로드 결과 없음 (시도 ${4 - retries}/3)`);
        if (retries > 1) {
          console.log(`⏳ 2초 후 재시도... (남은 시도: ${retries - 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        lastError = error;
        console.error(`❌ 상품 로드 실패 (시도 ${4 - retries}/3):`, error);

        if (retries > 1) {
          console.log(`⏳ 2초 후 재시도... (남은 시도: ${retries - 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      retries--;
    }

    console.error('❌ 상품 로드 최종 실패 (3회 시도 모두 실패):', lastError);
    return [];
  }

  /**
   * 구독 구매 요청
   * ✅ FIX: RNIap v14.x API 규격 준수
   */
  static async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    if (Platform.OS === 'web') return this.simulateWebPurchase(productId);

    try {
      if (!this.initialized) await this.initialize();

      console.log('💳 구매 요청 시작:', productId);

      if (!RNIap) {
        return { success: false, error: 'IAP 모듈이 초기화되지 않았습니다.' };
      }

      // 중복 구매 방지
      if (this.activePurchases.has(productId)) {
        return { success: false, error: '이미 구매가 진행 중입니다.' };
      }
      this.activePurchases.add(productId);

      // Promise 생성
      return new Promise<PurchaseResult>(async (resolve, reject) => {
        // 타임아웃 설정 (30초)
        const timeoutId = setTimeout(() => {
          this.pendingPurchaseResolvers.delete(productId);
          this.activePurchases.delete(productId);
          reject(new Error('TIMEOUT_ERROR'));
        }, 30000);
        this.purchaseTimeouts.set(productId, timeoutId);

        this.pendingPurchaseResolvers.set(productId, {
          resolve: (val) => {
            clearTimeout(timeoutId);
            this.purchaseTimeouts.delete(productId);
            this.activePurchases.delete(productId);
            resolve(val);
          },
          reject: (err) => {
            clearTimeout(timeoutId);
            this.purchaseTimeouts.delete(productId);
            this.activePurchases.delete(productId);
            reject(err);
          }
        });

        try {
          // ✅ FIX: v14.x requestPurchase 파라미터 구조 수정 (type: 'subs' 추가 및 Android 구조 변경)
          if (Platform.OS === 'ios') {
            await RNIap.requestPurchase({
              type: 'subs', // ✅ 필수
              andDangerouslyFinishTransactionAutomaticallyIOS: false,
              request: {
                ios: {
                  sku: productId
                }
              }
            } as any);
          } else if (Platform.OS === 'android') {
            // Android: Offer Token 찾기
            const product = this.products.find(p => p.productId === productId);
            const offerToken = (product as any)?.subscriptionOfferDetails?.[0]?.offerToken;

            if (!offerToken) {
              throw new Error('Android Offer Token을 찾을 수 없습니다.');
            }

            await RNIap.requestPurchase({
              type: 'subs', // ✅ 필수
              andDangerouslyFinishTransactionAutomaticallyIOS: false,
              request: {
                android: {
                  skus: [productId], // ✅ skus 배열로 변경
                  subscriptionOffers: [{
                    sku: productId,
                    offerToken: offerToken
                  }]
                }
              }
            } as any);
          }
        } catch (err) {
          this.pendingPurchaseResolvers.get(productId)?.reject(err);
        }
      });

    } catch (error: any) {
      console.error('❌ 구매 요청 실패:', error);
      this.activePurchases.delete(productId);
      return { success: false, error: error.message || '구매 요청 실패' };
    }
  }

  /**
   * 구매 복원
   * ✅ FIX: 재시도 로직 추가 (Sandbox 환경 대응)
   */
  static async restorePurchases(): Promise<boolean> {
    if (Platform.OS === 'web' || !RNIap) {
      console.log('📌 실제 기기에서만 구매 복원이 가능합니다.');
      return false;
    }

    try {
      console.log('🔄 [1/4] 구매 복원 시작...');

      // ✅ FIX: 재시도 로직 (최대 3회, 1초 간격)
      let purchases: any[] = [];
      let retries = 3;

      while (retries > 0) {
        try {
          purchases = await RNIap.getAvailablePurchases();
          console.log(`📦 [2/4] 복원된 구매 내역: ${purchases.length}개 (시도: ${4 - retries}/3)`);

          if (purchases && purchases.length > 0) {
            break; // 성공
          }

          if (retries > 1) {
            console.log(`⏳ 구매 내역 없음 - 1초 후 재시도... (남은 시도: ${retries - 1})`);
            await new Promise(r => setTimeout(r, 1000));
          }
        } catch (err) {
          console.error(`❌ getAvailablePurchases 오류 (시도 ${4 - retries}/3):`, err);
          if (retries > 1) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        retries--;
      }

      if (!purchases || purchases.length === 0) {
        console.log('⚠️ [3/4] 복원할 구매 내역이 없습니다.');
        return false;
      }

      console.log(`🔍 [3/4] 구독 내역 처리 중... (${purchases.length}개)`);
      let restoredCount = 0;

      for (const purchase of purchases) {
        if (Object.values(SUBSCRIPTION_SKUS).includes(purchase.productId)) {
          const receiptData = JSON.stringify({
            transactionId: purchase.transactionId,
            productId: purchase.productId,
            purchaseDate: purchase.transactionDate
          });

          await this.processPurchaseSuccess(purchase.productId, purchase.transactionId || '', receiptData);
          restoredCount++;
          console.log(`✅ 구독 복원 완료: ${purchase.productId}`);
        }
      }

      console.log(`✅ [4/4] 구매 복원 완료 (${restoredCount}개)`);
      return restoredCount > 0;

    } catch (error) {
      console.error('❌ 구매 복원 최종 오류:', error);
      return false;
    }
  }

  /**
   * 구매 성공 처리 (프리미엄 상태 업데이트)
   */
  private static async processPurchaseSuccess(productId: string, transactionId: string, receiptData?: string): Promise<void> {
    try {
      console.log('🔍 구매 성공 처리 및 영수증 검증 시작...');

      if (Platform.OS !== 'web' && !receiptData) {
        throw new Error('영수증 데이터가 필요합니다');
      }

      if (receiptData) {
        const validationResult = await ReceiptValidator.validateReceipt(receiptData, transactionId);
        if (!validationResult.isValid) throw new Error('영수증 검증 실패: ' + validationResult.error);
        if (!validationResult.isActive) throw new Error('구독이 활성 상태가 아닙니다');

        await ReceiptValidator.syncSubscriptionStatus(validationResult, productId);
        console.log('✅ 영수증 검증 및 동기화 완료');
        return;
      }

      // Web Simulation
      const isYearly = productId.includes('yearly');
      const currentDate = new Date();
      const expiryDate = new Date(currentDate);
      if (isYearly) expiryDate.setFullYear(currentDate.getFullYear() + 1);
      else expiryDate.setMonth(currentDate.getMonth() + 1);

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
      throw error;
    }
  }

  /**
   * 웹 환경용 구매 시뮬레이션
   */
  private static async simulateWebPurchase(productId: string): Promise<PurchaseResult> {
    return new Promise((resolve) => {
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
    if (currentStatus.is_premium) {
      await ReceiptValidator.periodicValidation();
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
      if (!currentStatus.is_premium || !currentStatus.store_transaction_id) return false;

      console.log('🔄 강제 구독 검증 시작...');
      const receiptData = currentStatus.receipt_data || JSON.stringify({
        transactionId: currentStatus.store_transaction_id,
        productId: currentStatus.subscription_type === 'yearly' ? SUBSCRIPTION_SKUS.yearly : SUBSCRIPTION_SKUS.monthly,
        purchaseDate: currentStatus.purchase_date
      });

      const validationResult = await ReceiptValidator.validateReceipt(receiptData, currentStatus.store_transaction_id);
      const productId = currentStatus.subscription_type === 'yearly' ? SUBSCRIPTION_SKUS.yearly : SUBSCRIPTION_SKUS.monthly;
      await ReceiptValidator.syncSubscriptionStatus(validationResult, productId);

      return validationResult.isActive;
    } catch (error) {
      console.error('❌ 강제 구독 검증 오류:', error);
      return false;
    }
  }

  /**
   * 구독 갱신 자동 처리 로직
   */
  static async processSubscriptionRenewal(): Promise<boolean> {
    try {
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      if (!currentStatus.is_premium) return false;

      if (currentStatus.expiry_date) {
        const now = new Date();
        const expiryDate = new Date(currentStatus.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 0) {
          const latestPurchases = await this.restorePurchases();
          if (latestPurchases) return true;

          await this.deactivatePremiumStatus();
          return false;
        }

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
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
   * 구독 갱신 상태 확인
   */
  private static async checkRenewalStatus(): Promise<void> {
    try {
      if (Platform.OS === 'web' || !RNIap) return;

      const purchases = await RNIap.getAvailablePurchases();
      const currentStatus = await LocalStorageManager.getPremiumStatus();

      for (const purchase of purchases) {
        if (Object.values(SUBSCRIPTION_SKUS).includes(purchase.productId)) {
          if (purchase.transactionId && purchase.transactionId !== currentStatus.store_transaction_id) {
            const receiptData = JSON.stringify(purchase || {});
            await this.processPurchaseSuccess(purchase.productId, purchase.transactionId, receiptData);
            break;
          }
        }
      }
    } catch (error) {
      console.error('❌ 갱신 상태 확인 오류:', error);
    }
  }

  /**
   * 프리미엄 상태 비활성화
   */
  private static async deactivatePremiumStatus(): Promise<void> {
    try {
      const deactivatedStatus: PremiumStatus = {
        is_premium: false,
        unlimited_storage: false,
        ad_free: false,
        premium_spreads: false,
        last_validated: new Date().toISOString(),
        validation_environment: Platform.OS === 'web' ? 'Sandbox' : 'Production'
      };
      await LocalStorageManager.updatePremiumStatus(deactivatedStatus);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('premiumStatusChanged', { detail: { isPremium: false } }));
      }
    } catch (error) {
      console.error('❌ 프리미엄 상태 비활성화 오류:', error);
    }
  }

  /**
   * 구독 갱신 실패 처리
   */
  static async handleRenewalFailure(reason: string): Promise<void> {
    try {
      console.log('❌ 구독 갱신 실패:', reason);
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      const gracePeriodEnd = new Date();
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

      const gracePeriodStatus: PremiumStatus = {
        ...currentStatus,
        expiry_date: gracePeriodEnd.toISOString(),
        validation_environment: 'Sandbox',
        last_validated: new Date().toISOString()
      };
      await LocalStorageManager.updatePremiumStatus(gracePeriodStatus);
    } catch (error) {
      console.error('❌ 갱신 실패 처리 오류:', error);
    }
  }

  /**
   * 주기적 구독 상태 모니터링 시작
   */
  static startPeriodicRenewalCheck(): void {
    if (this.renewalCheckInterval) clearInterval(this.renewalCheckInterval);
    this.renewalCheckInterval = setInterval(async () => {
      await this.processSubscriptionRenewal();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * 주기적 구독 상태 모니터링 중지
   */
  static stopPeriodicRenewalCheck(): void {
    if (this.renewalCheckInterval) {
      clearInterval(this.renewalCheckInterval);
      this.renewalCheckInterval = null;
    }
  }

  /**
   * 네트워크 오류 시 복구 로직
   */
  static async retryWithExponentialBackoff<T>(operation: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries - 1) break;
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
      }
    }
    throw lastError!;
  }

  /**
   * 중복 결제 방지 메커니즘
   */
  static async purchaseWithDuplicateProtection(productId: string): Promise<PurchaseResult> {
    if (this.activePurchases.has(productId)) {
      return { success: false, error: '이미 결제가 진행 중입니다.' };
    }
    try {
      this.activePurchases.add(productId);
      return await this.purchaseSubscription(productId);
    } finally {
      this.activePurchases.delete(productId);
    }
  }

  /**
   * 결제 중단 시 상태 롤백
   */
  static async rollbackFailedPurchase(productId: string, transactionId?: string): Promise<void> {
    try {
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      if (currentStatus.store_transaction_id === transactionId && transactionId) {
        await this.deactivatePremiumStatus();
      }
      this.activePurchases.delete(productId);
    } catch (error) {
      console.error('❌ 결제 롤백 오류:', error);
    }
  }

  /**
   * 환불 처리 자동화
   */
  static async handleRefund(transactionId: string): Promise<void> {
    try {
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      if (currentStatus.store_transaction_id === transactionId) {
        await this.deactivatePremiumStatus();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('subscriptionRefunded', { detail: { transactionId } }));
        }
      }
    } catch (error) {
      console.error('❌ 환불 처리 오류:', error);
    }
  }

  /**
   * 구독 취소
   */
  static async cancelSubscription(): Promise<void> {
    const cancelUrl = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
      default: 'https://support.apple.com/en-us/HT202039'
    });
    console.log('📱 구독 취소 URL:', cancelUrl);
  }

  /**
   * 프리미엄 상태 시뮬레이션
   */
  static async simulatePremiumStatusChange(isPremium: boolean): Promise<void> {
    if (!__DEV__) throw new Error('Simulation mode is only available in development');

    const mockStatus: PremiumStatus = {
      is_premium: isPremium,
      subscription_type: isPremium ? 'monthly' : undefined,
      purchase_date: isPremium ? new Date().toISOString() : undefined,
      expiry_date: isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      store_transaction_id: isPremium ? `sim-${Date.now()}` : undefined,
      unlimited_storage: isPremium,
      ad_free: isPremium,
      premium_spreads: isPremium,
      last_validated: new Date().toISOString(),
      validation_environment: 'Simulation',
      is_simulation: true
    };

    await LocalStorageManager.updatePremiumStatus(mockStatus);

    try {
      const AdManager = require('./adManager').default;
      AdManager.setPremiumStatus(isPremium);
    } catch (e) { }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('premiumStatusChanged', { detail: { isPremium } }));
    } else if (Platform.OS !== 'web') {
      try {
        const { DeviceEventEmitter } = require('react-native');
        DeviceEventEmitter.emit('premiumStatusChanged', { isPremium });
      } catch (e) { }
    }
  }

  /**
   * IAP 연결 해제
   */
  static async dispose(): Promise<void> {
    try {
      this.stopPeriodicRenewalCheck();

      for (const [productId, timeoutId] of this.purchaseTimeouts.entries()) {
        clearTimeout(timeoutId);
      }
      this.purchaseTimeouts.clear();

      for (const resolver of this.pendingPurchaseResolvers.values()) {
        resolver.reject(new Error('IAP_DISPOSED'));
      }
      this.pendingPurchaseResolvers.clear();

      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
        this.purchaseUpdateSubscription = null;
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
        this.purchaseErrorSubscription = null;
      }

      this.activePurchases.clear();

      if (Platform.OS !== 'web' && this.initialized && RNIap) {
        await RNIap.endConnection();
        this.initialized = false;
      }
    } catch (error) {
      console.error('❌ IAP 연결 해제 오류:', error);
    }
  }
}

export default IAPManager;