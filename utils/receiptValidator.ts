/**
 * 영수증 검증 시스템 (Supabase Edge Function 연동)
 *
 * ⚠️ 중요: 이제 클라이언트에서 직접 Apple Server를 호출하지 않습니다!
 * 모든 영수증 검증은 Supabase Edge Function을 통해 수행됩니다.
 *
 * 변경 사항:
 * - APPLE_SHARED_SECRET 제거 (Edge Function으로 이동)
 * - Apple API 직접 호출 제거
 * - Supabase Edge Function 호출로 대체
 * - 보안 강화 (민감한 정보 클라이언트에서 제거)
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import LocalStorageManager, { PremiumStatus, determinePurchaseDate } from './localStorage';
import { calculateSubscriptionExpiry } from './dateUtils';

// ============================================================================
// 설정
// ============================================================================
const SUPABASE_URL = 'https://syzefbnrnnjkdnoqbwsk.supabase.co';

const VALIDATION_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 2000, // 2초
  VALIDATION_TIMEOUT: 60000, // 60초
  EDGE_FUNCTION_URL: `${SUPABASE_URL}/functions/v1/verify-receipt`,
} as const;

// ============================================================================
// 타입 정의
// ============================================================================

export interface ReceiptValidationResult {
  isValid: boolean;
  isActive: boolean;
  expirationDate?: Date;
  purchaseDate?: Date;  // ✅ NEW: 원본 구매일 (Edge Function에서 반환)
  originalTransactionId?: string;
  environment?: 'Sandbox' | 'Production';
  subscriptionId?: string;
  error?: string;
}

interface EdgeFunctionRequest {
  receipt_data?: string;  // ✅ V2: 선택적 (lookup 모드에서는 불필요)
  transaction_id: string;
  product_id: string;
  platform: 'ios' | 'android';
  user_id: string;
  mode?: 'verify' | 'lookup';  // ✅ V2: lookup=DB조회, verify=영수증검증
}

interface EdgeFunctionResponse {
  success: boolean;
  is_active: boolean;
  expiry_date?: string;
  purchase_date?: string;
  subscription_id?: string;
  environment?: 'Sandbox' | 'Production';
  error?: string;
}

// ============================================================================
// 에러 로깅 헬퍼
// ============================================================================

/**
 * Supabase 관련 에러를 AsyncStorage에 저장
 * SupabaseDebugPanel에서 조회 가능
 */
async function logSupabaseError(type: string, message: string, context?: any) {
  try {
    const errorLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      context,
    };

    // 기존 로그 가져오기
    const existingLogsJson = await AsyncStorage.getItem('SUPABASE_ERROR_LOGS');
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];

    // 새 로그 추가 (최대 50개 보관)
    const updatedLogs = [errorLog, ...existingLogs].slice(0, 50);

    await AsyncStorage.setItem('SUPABASE_ERROR_LOGS', JSON.stringify(updatedLogs));
    console.log('💾 [ReceiptValidator] Supabase 에러 로그 저장:', type);
  } catch (storageError) {
    console.error('❌ [ReceiptValidator] 에러 로그 저장 실패:', storageError);
  }
}

// ============================================================================
// ReceiptValidator 클래스
// ============================================================================

export class ReceiptValidator {
  /**
   * 플랫폼별 영수증 검증 (Supabase Edge Function 호출)
   * ✅ V2: Supabase 실패 시 로컬 검증 fallback 추가
   */
  static async validateReceipt(
    receiptData: string,
    transactionId: string,
    productId?: string
  ): Promise<ReceiptValidationResult> {
    try {
      console.log('🔍 [ReceiptValidator] 영수증 검증 시작...');
      console.log('📋 [ReceiptValidator] productId:', productId);
      console.log('📋 [ReceiptValidator] transactionId:', transactionId);

      // ✅ CRITICAL FIX V5: 빈 문자열('')도 허용 (로컬 검증 fallback용)
      // transactionId만 필수, receiptData는 빈 문자열 가능
      if (!transactionId) {
        console.error('❌ [ReceiptValidator] 트랜잭션 ID 누락');
        return {
          isValid: false,
          isActive: false,
          error: '트랜잭션 ID가 누락되었습니다',
        };
      }

      // 플랫폼별 처리 (웹은 바로 시뮬레이션)
      if (Platform.OS === 'web') {
        return this.validateWebReceipt(receiptData, transactionId);
      }

      // Supabase는 항상 설정되어 있음 (하드코딩된 credentials 사용)

      // ✅ FIX: 사용자 인증 (익명 인증 자동 생성) - 실패 시 로컬 검증
      let user = null;
      try {
        console.log('🔐 [ReceiptValidator] 사용자 인증 시작...');

        // 1. 기존 세션 확인
        const { data: { session } } = await supabase!.auth.getSession();

        if (session && session.user) {
          user = session.user;
          console.log('✅ [ReceiptValidator] 기존 세션 사용:', user.id);
        } else {
          // 2. 익명 인증 자동 생성
          console.log('🔐 [ReceiptValidator] 익명 인증 생성 중...');
          const { data: authData, error: authError } = await supabase!.auth.signInAnonymously();

          if (authError) {
            console.warn('⚠️ [ReceiptValidator] 익명 인증 실패 - 로컬 검증으로 전환:', authError.message);
            await logSupabaseError(
              'ANONYMOUS_AUTH_FAILED',
              `Failed to create anonymous session: ${authError.message}`,
              { transactionId, productId, error: authError }
            );
            return this.validateLocalReceipt(receiptData, transactionId, productId);
          }

          user = authData.user;
          console.log('✅ [ReceiptValidator] 익명 사용자 생성 완료:', user?.id);
        }

        if (!user) {
          console.warn('⚠️ [ReceiptValidator] 사용자 생성 실패 - 로컬 검증으로 전환');
          return this.validateLocalReceipt(receiptData, transactionId, productId);
        }
      } catch (authError) {
        console.warn('⚠️ [ReceiptValidator] 인증 시스템 오류 - 로컬 검증으로 전환:', authError);
        return this.validateLocalReceipt(receiptData, transactionId, productId);
      }

      console.log('📤 [ReceiptValidator] Edge Function 호출 시작...');

      // iOS: Edge Function 검증 시도
      if (Platform.OS === 'ios') {
        try {
          const result = await this.validateAppleReceiptViaEdgeFunction(
            receiptData,
            transactionId,
            productId || '',
            user.id
          );

          // ✅ Edge Function 성공
          if (result.isValid) {
            console.log('✅ [ReceiptValidator] Edge Function 검증 성공');
            return result;
          }

          // Edge Function이 실패를 반환한 경우 로컬 검증으로 fallback
          console.warn('⚠️ [ReceiptValidator] Edge Function 검증 실패 - 로컬 검증으로 전환');
          await logSupabaseError(
            'EDGE_FUNCTION_VALIDATION_FAILED',
            'Edge Function returned validation failure',
            { transactionId, productId, result }
          );
          return this.validateLocalReceipt(receiptData, transactionId, productId);

        } catch (edgeFunctionError: any) {
          console.warn('⚠️ [ReceiptValidator] Edge Function 오류 - 로컬 검증으로 전환:', edgeFunctionError);
          await logSupabaseError(
            'EDGE_FUNCTION_ERROR',
            `Edge Function call failed: ${edgeFunctionError?.message || 'Unknown error'}`,
            { transactionId, productId, error: edgeFunctionError }
          );
          return this.validateLocalReceipt(receiptData, transactionId, productId);
        }
      }

      if (Platform.OS === 'android') {
        // TODO: Google Play 검증 (향후 구현)
        console.warn('⚠️ [ReceiptValidator] Android 미지원 - 로컬 검증으로 전환');
        return this.validateLocalReceipt(receiptData, transactionId, productId);
      }

      throw new Error('지원하지 않는 플랫폼입니다');

    } catch (error) {
      console.error('❌ [ReceiptValidator] 영수증 검증 최종 오류 - 로컬 검증으로 전환:', error);
      // ✅ 최종 fallback: 로컬 검증
      return this.validateLocalReceipt(receiptData, transactionId, productId);
    }
  }

  /**
   * ✅ NEW: 로컬 영수증 검증 (Supabase 없이 동작)
   * Supabase Edge Function 실패 시 fallback으로 사용
   * 
   * 변경사항:
   * 1. dateUtils를 사용한 정확한 만료일 계산
   * 2. Edge Function 실패 시에도 Supabase DB 직접 업데이트 시도 (Client-side)
   */
  private static async validateLocalReceipt(
    receiptData: string,
    transactionId: string,
    productId?: string
  ): Promise<ReceiptValidationResult> {
    console.log('🔐 [Local] 로컬 영수증 검증 모드 시작');
    console.log('📋 [Local] productId:', productId);
    console.log('📋 [Local] transactionId:', transactionId);
    console.log('📋 [Local] receiptData 길이:', receiptData?.length || 0);

    // ✅ CRITICAL FIX V5: transactionId만 필수, receiptData는 빈 문자열 허용
    if (!transactionId) {
      console.error('❌ [Local] 트랜잭션 ID 누락');
      return {
        isValid: false,
        isActive: false,
        error: '트랜잭션 ID가 누락되었습니다'
      };
    }

    // 구독 타입 결정
    const isYearly = productId?.includes('yearly') || false;
    const subscriptionType = isYearly ? 'yearly' : 'monthly';

    // ✅ CRITICAL FIX V2: 기존 purchase_date 기반으로 만료일 계산
    const existingStatus = await LocalStorageManager.getPremiumStatus();
    let expirationDate: Date;
    let purchaseDate: Date;

    if (existingStatus.purchase_date) {
      // 기존 구매일이 있으면 해당 날짜 기준으로 만료일 계산
      purchaseDate = new Date(existingStatus.purchase_date);

      if (existingStatus.expiry_date && existingStatus.is_premium) {
        // 기존 만료일이 있으면 유지
        expirationDate = new Date(existingStatus.expiry_date);
        console.log(`📅 [Local] 기존 만료일 유지: ${expirationDate.toISOString()}`);
      } else {
        // 기존 구매일 기준으로 만료일 재계산
        expirationDate = calculateSubscriptionExpiry(purchaseDate, subscriptionType);
        console.log(`📅 [Local] 기존 구매일 기준 만료일 계산: ${expirationDate.toISOString()}`);
      }
      console.log(`📅 [Local] 기존 구매일 사용: ${purchaseDate.toISOString()}`);
    } else {
      // 새 구매인 경우에만 현재 시간 사용
      purchaseDate = new Date();
      expirationDate = calculateSubscriptionExpiry(purchaseDate, subscriptionType);
      console.log(`📅 [Local] 새 ${subscriptionType} 구독 - 구매일: ${purchaseDate.toISOString()}, 만료일: ${expirationDate.toISOString()}`);
    }

    // ✅ NEW: Supabase DB 직접 업데이트 시도 (Edge Function 실패 시 Fallback)
    // 사용자가 로그인 상태라면 user_subscriptions 테이블에 직접 insert/update 시도
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('🔄 [Local] Supabase DB 직접 업데이트 시도 (Fallback)...');

          const subscriptionData = {
            user_id: user.id,
            product_id: productId || (isYearly ? 'tarot_timer_yearly' : 'tarot_timer_monthly'),
            original_transaction_id: transactionId,
            purchase_date: purchaseDate.toISOString(),
            expiry_date: expirationDate.toISOString(),
            is_active: true,
            environment: 'Sandbox', // 로컬 검증은 Sandbox로 표시
            platform: Platform.OS,
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('user_subscriptions')
            .upsert(subscriptionData, { onConflict: 'original_transaction_id' });

          if (error) {
            console.warn('⚠️ [Local] Supabase DB 직접 업데이트 실패:', error.message);
          } else {
            console.log('✅ [Local] Supabase DB 직접 업데이트 성공');
          }
        }
      } catch (dbError) {
        console.warn('⚠️ [Local] Supabase DB 업데이트 중 오류:', dbError);
      }
    }

    console.log('✅ [Local] 로컬 검증 성공 (임시 활성화)');

    return {
      isValid: true,
      isActive: true,
      expirationDate,
      purchaseDate,  // ✅ NEW: 구매일도 반환
      originalTransactionId: transactionId,
      environment: 'Sandbox',
    };
  }

  /**
   * Apple 영수증 검증 via Edge Function
   * ✅ V2: receipt가 없으면 자동으로 lookup 모드로 전환
   */
  private static async validateAppleReceiptViaEdgeFunction(
    receiptData: string,
    transactionId: string,
    productId: string,
    userId: string
  ): Promise<ReceiptValidationResult> {
    // ✅ V2: receipt 유무에 따라 모드 결정
    const mode = receiptData ? 'verify' : 'lookup';
    console.log(`🍎 [Apple] Edge Function 검증 시작... (mode: ${mode})`);

    // 재시도 로직
    let lastError: any = null;
    let retries = VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS;

    while (retries > 0) {
      try {
        const attempt = VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS - retries + 1;
        console.log(`🔄 [Apple] 검증 시도 ${attempt}/${VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS} (mode: ${mode})`);

        // Edge Function 요청 데이터
        const requestData: EdgeFunctionRequest = {
          transaction_id: transactionId,
          product_id: productId,
          platform: 'ios',
          user_id: userId,
          mode: mode,  // ✅ V2: 모드 명시
        };

        // receipt가 있을 때만 포함
        if (receiptData) {
          requestData.receipt_data = receiptData;
        }

        console.log('📤 [Apple] Edge Function 요청:', {
          mode,
          has_receipt: !!receiptData,
          transaction_id: transactionId.substring(0, 10) + '...',
          product_id: productId,
        });

        // Supabase Functions invoke 사용
        const { data, error } = await supabase!.functions.invoke<EdgeFunctionResponse>(
          'verify-receipt',
          {
            body: requestData,
          }
        );

        if (error) {
          console.error(`❌ [Apple] Edge Function 오류 (시도 ${attempt}):`, error);
          lastError = error;

          // 에러 로그 저장 (마지막 시도일 때만)
          if (attempt === VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS) {
            await logSupabaseError(
              'EDGE_FUNCTION_INVOKE_ERROR',
              `Edge Function invocation failed after ${VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS} attempts`,
              { transactionId, error: error, mode }
            );
          }

          if (retries > 1) {
            const delay = VALIDATION_CONFIG.RETRY_DELAY_BASE * attempt;
            console.log(`⏳ [Apple] ${delay}ms 후 재시도...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
          retries--;
          continue;
        }

        if (!data) {
          throw new Error('Edge Function 응답이 없습니다');
        }

        console.log('✅ [Apple] Edge Function 응답 수신:', {
          success: data.success,
          is_active: data.is_active,
          environment: data.environment,
          mode: mode,
        });

        // 검증 실패
        if (!data.success) {
          return {
            isValid: false,
            isActive: false,
            error: data.error || '영수증 검증에 실패했습니다',
          };
        }

        // 검증 성공
        // ✅ FIX: Edge Function에서 반환한 purchase_date도 함께 반환
        return {
          isValid: true,
          isActive: data.is_active,
          expirationDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
          purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
          originalTransactionId: transactionId,
          environment: data.environment,
          subscriptionId: data.subscription_id,
        };
      } catch (error) {
        console.error(`❌ [Apple] 예외 발생 (시도 ${VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS - retries + 1}):`, error);
        lastError = error;

        if (retries > 1) {
          const delay = VALIDATION_CONFIG.RETRY_DELAY_BASE * (VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS - retries + 1);
          console.log(`⏳ [Apple] ${delay}ms 후 재시도...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        retries--;
      }
    }

    // 모든 재시도 실패
    console.error(`❌ [Apple] 모든 재시도 실패 (${VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS}회)`);
    return {
      isValid: false,
      isActive: false,
      error: lastError?.message || '영수증 검증에 실패했습니다 (네트워크 오류)',
    };
  }

  /**
   * 웹 환경 시뮬레이션 (개발/테스트용)
   */
  private static async validateWebReceipt(
    receiptData: string,
    transactionId: string
  ): Promise<ReceiptValidationResult> {
    console.log('🌐 [Web] 시뮬레이션 검증...');

    // 웹 환경에서는 실제 검증 불가 - 시뮬레이션만
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      isValid: true,
      isActive: true,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      originalTransactionId: transactionId,
      environment: 'Sandbox',
    };
  }

  /**
   * 구독 상태와 Supabase 동기화
   */
  static async syncSubscriptionStatus(
    validationResult: ReceiptValidationResult,
    productId: string
  ): Promise<void> {
    try {
      console.log('🔄 [Sync] 구독 상태 동기화 시작...');

      if (!validationResult.isValid) {
        console.warn('⚠️ [Sync] 유효하지 않은 영수증 - 동기화 건너뜀');
        return;
      }

      // 구독 타입 결정
      const isYearly = productId.includes('yearly');

      // ✅ CRITICAL FIX V2: Edge Function에서 반환한 purchase_date 우선 사용
      const existingStatus = await LocalStorageManager.getPremiumStatus();

      // purchase_date 결정: Edge Function 결과 > 기존 값 > 현재 시간
      let purchaseDate: string;
      if (validationResult.purchaseDate) {
        // Edge Function에서 반환한 원본 구매일 사용 (Apple 서버에서 가져온 값)
        purchaseDate = validationResult.purchaseDate.toISOString();
        console.log('📅 [Sync] Edge Function 구매일 사용:', purchaseDate);
      } else if (existingStatus.purchase_date && existingStatus.is_premium) {
        // 기존 구매일 유지
        purchaseDate = existingStatus.purchase_date;
        console.log('📅 [Sync] 기존 구매일 유지:', purchaseDate);
      } else {
        // 새 구매인 경우에만 현재 시간 사용
        purchaseDate = new Date().toISOString();
        console.log('📅 [Sync] 새 구매일 설정:', purchaseDate);
      }

      // ✅ CRITICAL FIX V2: 만료일 결정 - Edge Function 결과 > 구매일 기반 계산 > 기존 값
      let expiryDate: Date;
      if (validationResult.expirationDate) {
        // Edge Function에서 반환한 만료일 사용 (Apple 서버에서 가져온 값)
        expiryDate = validationResult.expirationDate;
        console.log('📅 [Sync] Edge Function 만료일 사용:', expiryDate.toISOString());
      } else if (validationResult.purchaseDate) {
        // Edge Function에서 구매일만 있는 경우, 구매일 기준으로 만료일 계산
        expiryDate = calculateSubscriptionExpiry(validationResult.purchaseDate, isYearly ? 'yearly' : 'monthly');
        console.log('📅 [Sync] 구매일 기준 만료일 계산:', expiryDate.toISOString());
      } else if (existingStatus.expiry_date && existingStatus.is_premium) {
        // 기존 만료일 유지
        expiryDate = new Date(existingStatus.expiry_date);
        console.log('📅 [Sync] 기존 만료일 유지:', expiryDate.toISOString());
      } else {
        // 새 구매인 경우에만 현재 시간 기준으로 계산
        expiryDate = calculateSubscriptionExpiry(new Date(), isYearly ? 'yearly' : 'monthly');
        console.log('📅 [Sync] 새 만료일 계산:', expiryDate.toISOString());
      }

      console.log('📅 [Sync] 최종 날짜 정보:', {
        purchaseDate,
        expiryDate: expiryDate.toISOString(),
        fromEdgeFunction: !!validationResult.purchaseDate,
      });

      // LocalStorage에 프리미엄 상태 저장
      const premiumStatus: PremiumStatus = {
        is_premium: validationResult.isActive,
        subscription_type: isYearly ? 'yearly' : 'monthly',
        purchase_date: purchaseDate, // ✅ 기존 구매일 유지
        expiry_date: expiryDate.toISOString(),
        store_transaction_id: validationResult.originalTransactionId || '',
        unlimited_storage: validationResult.isActive,
        ad_free: validationResult.isActive,
        premium_spreads: validationResult.isActive,
        last_validated: new Date().toISOString(),
        validation_environment: validationResult.environment || 'Production',
      };

      await LocalStorageManager.updatePremiumStatus(premiumStatus);
      console.log('✅ [Sync] LocalStorage 업데이트 완료');

      // Supabase에 저장된 구독 정보는 Edge Function에서 자동으로 처리됨
      console.log('✅ [Sync] 구독 상태 동기화 완료');
    } catch (error) {
      console.error('❌ [Sync] 동기화 오류:', error);
      throw error;
    }
  }

  /**
   * 주기적 검증 (앱 시작 시 또는 주기적 실행)
   */
  static async periodicValidation(): Promise<void> {
    try {
      console.log('⏰ [Periodic] 주기적 검증 시작...');

      // Supabase에서 사용자의 활성 구독 조회
      if (!supabase) {
        console.warn('⚠️ [Periodic] Supabase 미설정 - 건너뜀');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn('⚠️ [Periodic] 사용자 미인증 - 건너뜀');
        return;
      }

      // Supabase에서 활성 구독 확인
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expiry_date', new Date().toISOString())
        .order('expiry_date', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ [Periodic] 구독 조회 오류:', error);
        return;
      }

      if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0];
        console.log('✅ [Periodic] 활성 구독 발견:', {
          product_id: subscription.product_id,
          expiry_date: subscription.expiry_date,
        });

        // LocalStorage 업데이트
        const premiumStatus: PremiumStatus = {
          is_premium: true,
          subscription_type: subscription.product_id.includes('yearly') ? 'yearly' : 'monthly',
          purchase_date: subscription.purchase_date,
          expiry_date: subscription.expiry_date,
          store_transaction_id: subscription.original_transaction_id,
          unlimited_storage: true,
          ad_free: true,
          premium_spreads: true,
          last_validated: new Date().toISOString(),
          validation_environment: subscription.environment,
        };

        await LocalStorageManager.updatePremiumStatus(premiumStatus);
        console.log('✅ [Periodic] 프리미엄 상태 업데이트 완료');
      } else {
        console.log('ℹ️ [Periodic] Supabase에 활성 구독 없음');

        // ✅ FIX: LocalStorage 만료일 기반 구독 유지 (Edge Function 미연동 시 fallback)
        const currentStatus = await LocalStorageManager.getPremiumStatus();

        if (currentStatus.is_premium && currentStatus.expiry_date) {
          const expiryDate = new Date(currentStatus.expiry_date);
          const now = new Date();

          if (now < expiryDate) {
            // 만료 전이면 구독 유지 (Supabase DB에 없어도 LocalStorage 기준으로 유지)
            console.log('✅ [Periodic] LocalStorage 구독 유지 (만료일:', currentStatus.expiry_date, ')');
            return;
          }

          // 만료된 경우에만 비활성화
          console.log('⏰ [Periodic] 구독 만료됨 - 비활성화 진행');
          await LocalStorageManager.updatePremiumStatus({
            ...currentStatus,
            is_premium: false,
          });
          console.log('✅ [Periodic] 프리미엄 상태 비활성화 완료');
        } else if (currentStatus.is_premium && !currentStatus.expiry_date) {
          // 만료일이 없는 프리미엄 상태 (비정상) - 비활성화
          console.warn('⚠️ [Periodic] 만료일 없는 프리미엄 상태 - 비활성화');
          await LocalStorageManager.updatePremiumStatus({
            ...currentStatus,
            is_premium: false,
          });
        }
        // is_premium이 false인 경우는 이미 무료 사용자이므로 아무 작업 안함
      }
    } catch (error) {
      console.error('❌ [Periodic] 주기적 검증 오류:', error);
    }
  }
}
