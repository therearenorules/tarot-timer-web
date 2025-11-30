/**
 * 앱스토어 인앱결제 매니저
 * iOS App Store & Google Play Store 결제 처리
 */

import { Platform } from 'react-native';

// 초기화 시작 로그 (가장 먼저 실행)
console.log('🚀 iapManager.ts 모듈 초기화 시작');
console.log('📱 Platform.OS:', Platform.OS);

// react-native-iap named imports
import {
  initConnection,
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  setup, // ✅ CRITICAL FIX V3: StoreKit 1 모드 강제 설정용
} from 'react-native-iap';

console.log('📦 RNIapModule import 완료');

// Web 환경 대응을 위한 RNIap 객체 구성
const RNIap = Platform.OS === 'web' ? null : {
  initConnection,
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  setup, // ✅ CRITICAL FIX V3: StoreKit 1 모드 강제 설정용
};

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
  // ✅ v12.x: subscriptionOfferDetails 불필요 (v14.x 전용)
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

    // ✅ CRITICAL FIX V4: StoreKit 1 모드 설정을 initConnection() 이전에 명확히 분리
    // 문제: setup()과 initConnection()이 같은 try 블록에 있으면 설정 적용 전에 초기화될 수 있음
    // 해결: setup()을 완전히 분리하고 100ms 대기로 설정 적용 보장
    if (Platform.OS === 'ios' && RNIap) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🍎 iOS: StoreKit 1 모드 강제 설정 (최우선)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      try {
        // StoreKit 1 모드 강제 설정
        RNIap.setup({ storekitMode: 'STOREKIT1_MODE' });
        console.log('✅ StoreKit 1 모드 설정 완료 (Legacy Receipt 사용)');

        // ✅ 설정 적용 대기 (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ StoreKit 1 모드 적용 대기 완료');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } catch (setupError) {
        console.warn('⚠️ StoreKit 모드 설정 실패 (계속 진행):', setupError);
        console.warn('   → 이 경우 transactionReceipt가 비어있을 수 있음');
        console.warn('   → 로컬 검증 fallback으로 구독 활성화 시도\n');
      }
    }

    while (retries > 0) {
      try {
        console.log(`🔄 IAPManager 초기화 시도 (${4 - retries}/3)...`);
        console.log('📋 RNIap.initConnection 호출 전 상태:');
        console.log('  - Platform:', Platform.OS);
        console.log('  - RNIap 존재:', !!RNIap);
        console.log('  - initialized:', this.initialized);

        // ✅ FIX: initConnection에 5초 타임아웃 적용 (v14.x StoreKit 2.0 대응)
        // 문제: v14.x의 initConnection()이 20초 이상 걸리는 경우 있음
        // 해결: 5초 안에 완료되지 않으면 재시도 (최대 3회)
        const connectionResult = await Promise.race([
          RNIap.initConnection(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('initConnection timeout after 5s')), 5000)
          )
        ]);
        console.log('📋 RNIap.initConnection 결과:', connectionResult);

        this.initialized = true;
        console.log('✅ RNIap 연결 성공');

        // 리스너 설정
        await this.setupPurchaseListeners();

        // ✅ FIX: StoreKit 완전 초기화 대기 (1초)
        // 이유: initConnection()이 반환되어도 StoreKit의 transaction queue와
        // product catalog가 완전히 준비되려면 추가 시간 필요
        // 이 딜레이 없이 fetchProducts()를 즉시 호출하면
        // "Connection not initialized" 오류 발생 가능
        console.log('⏳ StoreKit 완전 초기화 대기 중... (1초)');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ StoreKit 준비 완료');

        console.log(`✅ IAPManager 초기화 완료 (시도 ${4 - retries}/3)`);
        return true;

      } catch (error) {
        lastError = error;
        // ✅ 자세한 오류 정보 출력
        console.error(`❌ IAPManager 초기화 실패 (시도 ${4 - retries}/3):`);
        console.error('📋 오류 타입:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('📋 오류 메시지:', error instanceof Error ? error.message : String(error));
        console.error('📋 오류 코드:', (error as any)?.code);
        console.error('📋 전체 오류 객체:', JSON.stringify(error, null, 2));

        if (retries > 1) {
          console.log(`⏳ 2초 후 재시도... (남은 시도: ${retries - 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        retries--;
      }
    }

    console.error('❌ IAPManager 초기화 최종 실패 (3회 시도 모두 실패):');
    console.error('📋 최종 오류 타입:', lastError instanceof Error ? lastError.constructor.name : typeof lastError);
    console.error('📋 최종 오류 메시지:', lastError instanceof Error ? lastError.message : String(lastError));
    console.error('📋 최종 오류 코드:', (lastError as any)?.code);
    console.error('📋 최종 오류 전체:', JSON.stringify(lastError, null, 2));
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
      // ✅ V2: 검증 먼저 수행 → 성공 시 finishTransaction
      this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
        console.log('💳 [1/7] 구매 업데이트 수신:', purchase.productId);
        console.log('📋 [Purchase] 전체 객체:', JSON.stringify(purchase, null, 2));
        console.log('📋 [Purchase] transactionId:', purchase.transactionId);
        console.log('📋 [Purchase] transactionReceipt:', purchase.transactionReceipt ? `${purchase.transactionReceipt.substring(0, 50)}...` : 'EMPTY');
        console.log('📋 [Purchase] verificationResultIOS:', purchase.verificationResultIOS ? `${purchase.verificationResultIOS.substring(0, 50)}...` : 'null');
        console.log('📋 [Purchase] purchaseToken:', purchase.purchaseToken ? `${purchase.purchaseToken.substring(0, 50)}...` : 'null');
        console.log('📋 [Purchase] productId:', purchase.productId);

        // ✅ CRITICAL FIX V2: Supabase Edge Function은 Legacy Receipt만 지원
        // iOS: transactionReceipt (legacy) 우선 → Edge Function 호환
        //      verificationResultIOS는 StoreKit 2 JWT지만 Edge Function 미지원
        // Android: purchaseToken
        const receipt = Platform.OS === 'ios'
          ? (purchase.transactionReceipt || '')
          : (purchase.purchaseToken || '');

        const transactionId = purchase.transactionId || purchase.originalTransactionIdentifierIOS || '';

        console.log('📋 [Receipt] 사용할 영수증 타입:', Platform.OS === 'ios' ? 'Legacy Receipt (Edge Function 호환)' : 'Android Token');
        console.log('📋 [Receipt] 영수증 존재 여부:', !!receipt);
        console.log('📋 [Receipt] 영수증 길이:', receipt ? receipt.length : 0);
        console.log('📋 [Transaction] 사용할 트랜잭션 ID:', transactionId);

        // ✅ CRITICAL FIX V4: 영수증이 없어도 transactionId가 있으면 로컬 검증 시도
        if (!transactionId) {
          console.error('❌ [1/7] 트랜잭션 ID 없음 (치명적)');
          const resolver = this.pendingPurchaseResolvers.get(purchase.productId);
          if (resolver) {
            resolver.reject(new Error('트랜잭션 ID가 누락되었습니다'));
            this.pendingPurchaseResolvers.delete(purchase.productId);
          }
          return;
        }

        if (!receipt) {
          console.warn('⚠️ [1/7] 영수증 없음 - 로컬 검증 모드로 전환');
          console.warn('📋 [Fallback] transactionId만으로 구독 활성화 시도');
          console.warn('📋 [Fallback] productId:', purchase.productId);

          // ✅ 영수증 없이 transactionId만으로 로컬 검증 시도
          // 빈 문자열로 receipt 전달하면 ReceiptValidator가 로컬 검증으로 fallback함
          try {
            await this.processPurchaseSuccess(purchase.productId, transactionId, '');
            console.log('✅ [Fallback] 로컬 검증으로 구독 활성화 성공');

            // finishTransaction 호출
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            console.log('✅ [7/7] finishTransaction 완료');

            const resolver = this.pendingPurchaseResolvers.get(purchase.productId);
            if (resolver) {
              resolver.resolve({ success: true, productId: purchase.productId, transactionId });
              this.pendingPurchaseResolvers.delete(purchase.productId);
            }
            return;
          } catch (fallbackError) {
            console.error('❌ [Fallback] 로컬 검증 실패:', fallbackError);
            const resolver = this.pendingPurchaseResolvers.get(purchase.productId);
            if (resolver) {
              resolver.reject(fallbackError);
              this.pendingPurchaseResolvers.delete(purchase.productId);
            }
            return;
          }
        }

        try {
          console.log('💳 [2/7] 영수증 확인 완료');
          console.log('📋 [Receipt] 길이:', receipt.length);

          // ✅ FIX: 검증 먼저 수행 (finishTransaction 전에)
          console.log('💳 [3/7] 영수증 검증 시작...');
          console.log('📋 [Validation Input] receipt:', receipt.substring(0, 100));
          console.log('📋 [Validation Input] transactionId:', transactionId);
          console.log('📋 [Validation Input] productId:', purchase.productId);

          const validationResult = await ReceiptValidator.validateReceipt(
            receipt,
            transactionId,
            purchase.productId
          );

          console.log('📋 [Validation] isValid:', validationResult.isValid);
          console.log('📋 [Validation] isActive:', validationResult.isActive);
          console.log('📋 [Validation] environment:', validationResult.environment);

          if (!validationResult.isValid) {
            console.error('❌ [3/7] 영수증 검증 실패:', validationResult.error);
            throw new Error(validationResult.error || '영수증 검증에 실패했습니다');
          }

          console.log('✅ [3/7] 영수증 검증 성공');

          // ✅ 검증 성공 후에만 finishTransaction 호출
          console.log('💳 [4/7] 결제 승인(finishTransaction) 시작...');
          await RNIap.finishTransaction({ purchase, isConsumable: false });
          console.log('✅ [4/7] 결제 승인(finishTransaction) 완료');

          // ✅ FIX: Sandbox 환경 대응 - 2초 딜레이 (영수증 전파 대기)
          console.log('⏳ [5/7] Sandbox 영수증 전파 대기 중... (2초)');
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('✅ [5/7] 영수증 전파 대기 완료');

          // ✅ 상태 동기화
          console.log('💳 [6/7] 구독 상태 동기화 시작...');
          await ReceiptValidator.syncSubscriptionStatus(validationResult, purchase.productId);
          console.log('✅ [6/7] 구독 상태 동기화 완료');

          console.log('✅ [7/7] 구독 처리 완료');

          // Pending Promise 해결
          const resolver = this.pendingPurchaseResolvers.get(purchase.productId);
          if (resolver) {
            resolver.resolve({
              success: true,
              productId: purchase.productId,
              transactionId: transactionId,
              purchaseDate: new Date(purchase.transactionDate || Date.now()).toISOString()
            });
            this.pendingPurchaseResolvers.delete(purchase.productId);
          }

        } catch (ackErr) {
          console.error('❌ 결제 처리 실패 [상세]:', ackErr);
          console.error('📋 [Error] 타입:', ackErr instanceof Error ? ackErr.constructor.name : typeof ackErr);
          console.error('📋 [Error] 메시지:', ackErr instanceof Error ? ackErr.message : String(ackErr));

          // ✅ 사용자 친화적 오류 메시지
          let userMessage = '구독 처리 중 오류가 발생했습니다.';
          if (ackErr instanceof Error) {
            if (ackErr.message.includes('영수증')) {
              userMessage = '영수증 검증에 실패했습니다. 잠시 후 다시 시도해주세요.';
            } else if (ackErr.message.includes('네트워크') || ackErr.message.includes('인증')) {
              userMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
            } else {
              userMessage = ackErr.message;
            }
          }

          const resolver = this.pendingPurchaseResolvers.get(purchase.productId);
          if (resolver) {
            resolver.reject(new Error(userMessage));
            this.pendingPurchaseResolvers.delete(purchase.productId);
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
        // v14.x에서는 'user-cancelled' 또는 'E_USER_CANCELLED' 모두 체크
        if (errorCode === 'E_USER_CANCELLED' || errorCode === 'user-cancelled') {
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
   * ✅ FIX: v14.x API 사용 (fetchProducts)
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
        console.log('📋 fetchProducts 호출 전 상태:');
        console.log('  - initialized:', this.initialized);
        console.log('  - Platform:', Platform.OS);
        console.log('  - RNIap 존재:', !!RNIap);
        console.log('  - SKUs:', skus);

        // ✅ V2: fetchProducts 타임아웃 10초로 증가 (5초 → 10초)
        console.log('📋 RNIap.fetchProducts 호출 중...');

        const result = await Promise.race([
          RNIap.fetchProducts({ skus, type: 'subs' }),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 10000) // ✅ 10초로 증가
          )
        ]);

        const products = (result || []) as any[];
        console.log('📋 RNIap.fetchProducts 완료:', products?.length, '개');

        if (products && products.length > 0) {
          console.log(`✅ 상품 로드 성공: ${products.length}개 (시도 ${4 - retries}/3)`);
          console.log('📊 상품 원본 데이터:', JSON.stringify(products, null, 2));

          // ✅ V2: 통화 기호 자동 매핑 추가
          this.products = products.map((p: any) => {
            const currency = p.currency || 'KRW';
            const rawPrice = p.price || '0';
            const displayPrice = p.displayPrice || '';

            console.log(`📋 [Product ${p.id}] currency: ${currency}, rawPrice: ${rawPrice}, displayPrice: ${displayPrice}`);

            // ✅ displayPrice가 없거나 잘못된 경우 통화 기호 자동 추가
            let formattedPrice = displayPrice;
            if (!displayPrice || displayPrice === '0' || displayPrice === rawPrice) {
              const currencySymbol = this.getCurrencySymbol(currency);
              formattedPrice = `${currencySymbol}${this.formatPrice(rawPrice, currency)}`;
              console.log(`📋 [Product ${p.id}] displayPrice 없음 - 자동 포맷: ${formattedPrice}`);
            }

            return {
              productId: p.id,  // ✅ 공식 타입: 'id'
              title: p.title || '',
              description: p.description || '',
              price: String(rawPrice),
              localizedPrice: formattedPrice,
              currency: currency,
              type: p.id === SUBSCRIPTION_SKUS.yearly ? 'yearly' : 'monthly'  // ✅ 'id' 사용
            };
          });

          console.log('📊 변환된 상품 데이터:', JSON.stringify(this.products, null, 2));
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
        // ✅ 자세한 오류 정보 출력
        console.error(`❌ 상품 로드 실패 (시도 ${4 - retries}/3):`);
        console.error('📋 오류 타입:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('📋 오류 메시지:', error instanceof Error ? error.message : String(error));
        console.error('📋 오류 코드:', (error as any)?.code);
        console.error('📋 전체 오류 객체:', JSON.stringify(error, null, 2));
        console.error('📋 initialized 상태:', this.initialized);
        console.error('📋 RNIap 존재 여부:', !!RNIap);

        if (retries > 1) {
          console.log(`⏳ 2초 후 재시도... (남은 시도: ${retries - 1})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      retries--;
    }

    console.error('❌ 상품 로드 최종 실패 (3회 시도 모두 실패):');
    console.error('📋 최종 오류 타입:', lastError instanceof Error ? lastError.constructor.name : typeof lastError);
    console.error('📋 최종 오류 메시지:', lastError instanceof Error ? lastError.message : String(lastError));
    console.error('📋 최종 오류 코드:', (lastError as any)?.code);
    console.error('📋 최종 오류 전체:', JSON.stringify(lastError, null, 2));
    console.error('📋 최종 initialized 상태:', this.initialized);
    return [];
  }

  /**
   * 구독 구매 요청
   * ✅ FIX: v12.x API 사용 (requestSubscription)
   */
  static async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    if (Platform.OS === 'web') return this.simulateWebPurchase(productId);

    try {
      if (!this.initialized) {
        const initSuccess = await this.initialize();
        if (!initSuccess) {
          return { success: false, error: '결제 시스템 초기화에 실패했습니다.' };
        }
      }

      console.log('💳 구매 요청 시작:', productId);

      if (!RNIap) {
        return { success: false, error: 'IAP 모듈을 사용할 수 없습니다.' };
      }

      // 중복 구매 방지
      if (this.activePurchases.has(productId)) {
        console.warn('⚠️ 이미 구매 진행 중인 상품:', productId);
        return { success: false, error: '이미 구매가 진행 중입니다. 잠시만 기다려주세요.' };
      }
      this.activePurchases.add(productId);

      // Promise 생성
      return new Promise<PurchaseResult>(async (resolve, reject) => {
        // 타임아웃 설정 (30초)
        const timeoutId = setTimeout(() => {
          this.pendingPurchaseResolvers.delete(productId);
          this.activePurchases.delete(productId);
          resolve({ success: false, error: '구매 요청 시간이 초과되었습니다.' });
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
            const errorMsg = err instanceof Error ? err.message : String(err);
            resolve({ success: false, error: errorMsg });
          }
        });

        try {
          // ✅ FIX: v14.x Nitro API - requestPurchase (구독 타입)
          console.log('📞 RNIap.requestPurchase 호출:', productId);
          await RNIap.requestPurchase({
            request: {
              ios: { sku: productId },
              android: { skus: [productId] }
            },
            type: 'subs'  // 구독 상품
          });
          console.log('✅ requestPurchase 호출 성공 - 결제 시트 표시됨');
        } catch (err) {
          console.error('❌ requestPurchase 호출 실패:', err);
          const resolver = this.pendingPurchaseResolvers.get(productId);
          if (resolver) {
            resolver.reject(err);
          } else {
            this.activePurchases.delete(productId);
          }
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
          console.log(`🔍 구독 복원 처리 중: ${purchase.productId}`);
          console.log(`📋 [Restore] transactionId: ${purchase.transactionId}`);
          console.log(`📋 [Restore] verificationResultIOS: ${purchase.verificationResultIOS ? 'exists' : 'null'}`);
          console.log(`📋 [Restore] transactionReceipt: ${purchase.transactionReceipt ? 'exists' : 'null'}`);

          // ✅ CRITICAL FIX: Legacy Receipt 사용 (Edge Function 호환)
          const receiptData = Platform.OS === 'ios'
            ? (purchase.transactionReceipt || '')
            : (purchase.purchaseToken || '');

          // ✅ FIX: 영수증이 없어도 transactionId가 있으면 복원 시도 (로컬 검증 Fallback)
          if (!receiptData) {
            console.warn(`⚠️ 영수증 없음 - transactionId로 복원 시도: ${purchase.productId}`);
            // continue; // ❌ 기존: 건너뛰기 -> ✅ 수정: 계속 진행
          }

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
   * ✅ FIX: receiptData가 없으면 LocalStorage에서 기존 영수증 사용
   */
  private static async processPurchaseSuccess(productId: string, transactionId: string, receiptData?: string): Promise<void> {
    try {
      console.log('🔍 구매 성공 처리 및 영수증 검증 시작...');
      console.log('📋 [ProcessPurchase] productId:', productId);
      console.log('📋 [ProcessPurchase] transactionId:', transactionId);
      console.log('📋 [ProcessPurchase] receiptData 존재:', !!receiptData, '길이:', receiptData?.length || 0);

      // ✅ FIX: receiptData가 없으면 LocalStorage에서 기존 영수증 가져오기
      let effectiveReceipt = receiptData;
      if (!effectiveReceipt && Platform.OS !== 'web') {
        console.log('⚠️ [ProcessPurchase] receiptData 없음 - LocalStorage에서 기존 영수증 확인...');
        const currentStatus = await LocalStorageManager.getPremiumStatus();
        if (currentStatus.receipt_data) {
          effectiveReceipt = currentStatus.receipt_data;
          console.log('✅ [ProcessPurchase] LocalStorage 영수증 발견, 길이:', effectiveReceipt.length);
        } else {
          console.warn('⚠️ [ProcessPurchase] LocalStorage에도 영수증 없음');
        }
      }

      if (effectiveReceipt) {
        // ✅ FIX: productId 파라미터 추가 (Supabase Edge Function 연동)
        console.log('🔄 [ProcessPurchase] Edge Function 호출 시작...');
        const validationResult = await ReceiptValidator.validateReceipt(effectiveReceipt, transactionId, productId);
        if (!validationResult.isValid) throw new Error('영수증 검증 실패: ' + validationResult.error);
        if (!validationResult.isActive) throw new Error('구독이 활성 상태가 아닙니다');

        await ReceiptValidator.syncSubscriptionStatus(validationResult, productId);
        console.log('✅ 영수증 검증 및 동기화 완료');
        return;
      }

      // Web Simulation 또는 영수증 없는 경우 LocalStorage만 업데이트
      console.log('⚠️ [ProcessPurchase] 영수증 없음 - LocalStorage만 업데이트');
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
      console.log('✅ 프리미엄 상태 업데이트 완료 (LocalStorage only)');

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
   * ✅ FIX: receipt_data가 없으면 LocalStorage 만료일 기준으로 검증
   */
  static async forceValidateSubscription(): Promise<boolean> {
    try {
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      if (!currentStatus.is_premium) {
        console.log('ℹ️ 강제 검증: 프리미엄 상태 아님');
        return false;
      }

      console.log('🔄 강제 구독 검증 시작...');

      // ✅ FIX: receipt_data가 없으면 LocalStorage 만료일 기준으로 검증 (Edge Function 미연동 대응)
      if (!currentStatus.receipt_data && !currentStatus.store_transaction_id) {
        console.log('ℹ️ 강제 검증: 영수증 데이터 없음 - LocalStorage 만료일 기준 검증');

        if (currentStatus.expiry_date) {
          const expiryDate = new Date(currentStatus.expiry_date);
          const now = new Date();
          const isActive = now < expiryDate;

          console.log(`✅ 강제 검증 완료 (LocalStorage): ${isActive ? '유효' : '만료'} (만료일: ${currentStatus.expiry_date})`);
          return isActive;
        }

        console.warn('⚠️ 강제 검증: 만료일 없음 - 무효 처리');
        return false;
      }

      const productId = currentStatus.subscription_type === 'yearly' ? SUBSCRIPTION_SKUS.yearly : SUBSCRIPTION_SKUS.monthly;

      // ✅ FIX: 실제 영수증이 있을 때만 서버 검증 시도
      if (currentStatus.receipt_data) {
        const validationResult = await ReceiptValidator.validateReceipt(
          currentStatus.receipt_data,
          currentStatus.store_transaction_id || '',
          productId
        );
        await ReceiptValidator.syncSubscriptionStatus(validationResult, productId);
        return validationResult.isActive;
      }

      // store_transaction_id만 있는 경우: LocalStorage 만료일 기준 검증
      if (currentStatus.expiry_date) {
        const expiryDate = new Date(currentStatus.expiry_date);
        const now = new Date();
        const isActive = now < expiryDate;

        console.log(`✅ 강제 검증 완료 (만료일 기준): ${isActive ? '유효' : '만료'}`);
        return isActive;
      }

      return false;
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
   * ✅ NEW: 통화 기호 매핑
   */
  private static getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'KRW': '₩',
      'USD': '$',
      'EUR': '€',
      'JPY': '¥',
      'CNY': '¥',
      'GBP': '£',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'CHF ',
      'HKD': 'HK$',
      'SGD': 'S$',
      'INR': '₹',
      'RUB': '₽',
      'BRL': 'R$',
      'MXN': 'MX$',
      'TWD': 'NT$',
      'THB': '฿',
      'VND': '₫',
    };
    return symbols[currency] || `${currency} `;
  }

  /**
   * ✅ NEW: 가격 포맷팅 (천 단위 콤마 추가)
   */
  private static formatPrice(price: string | number, currency: string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    // 원화는 소수점 없이 표시
    if (currency === 'KRW' || currency === 'JPY') {
      return Math.floor(numPrice).toLocaleString('ko-KR');
    }

    // 기타 통화는 소수점 2자리
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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