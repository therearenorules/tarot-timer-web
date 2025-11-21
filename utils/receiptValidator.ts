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
import { supabase } from './supabase';
import LocalStorageManager, { PremiumStatus } from './localStorage';

// ============================================================================
// 설정
// ============================================================================
const VALIDATION_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 2000, // 2초
  VALIDATION_TIMEOUT: 60000, // 60초
  EDGE_FUNCTION_URL: process.env.EXPO_PUBLIC_SUPABASE_URL
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/verify-receipt`
    : null,
} as const;

// ============================================================================
// 타입 정의
// ============================================================================

export interface ReceiptValidationResult {
  isValid: boolean;
  isActive: boolean;
  expirationDate?: Date;
  originalTransactionId?: string;
  environment?: 'Sandbox' | 'Production';
  subscriptionId?: string;
  error?: string;
}

interface EdgeFunctionRequest {
  receipt_data: string;
  transaction_id: string;
  product_id: string;
  platform: 'ios' | 'android';
  user_id: string;
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
// ReceiptValidator 클래스
// ============================================================================

export class ReceiptValidator {
  /**
   * 플랫폼별 영수증 검증 (Supabase Edge Function 호출)
   */
  static async validateReceipt(
    receiptData: string,
    transactionId: string,
    productId?: string
  ): Promise<ReceiptValidationResult> {
    try {
      console.log('🔍 [ReceiptValidator] 영수증 검증 시작...');

      // 입력 검증
      if (!receiptData || !transactionId) {
        console.error('❌ [ReceiptValidator] 필수 데이터 누락');
        return {
          isValid: false,
          isActive: false,
          error: '영수증 데이터 또는 트랜잭션 ID가 누락되었습니다',
        };
      }

      // Supabase 설정 확인
      if (!supabase) {
        console.error('❌ [ReceiptValidator] Supabase가 설정되지 않았습니다');
        return {
          isValid: false,
          isActive: false,
          error: 'Supabase 연결이 설정되지 않았습니다',
        };
      }

      // Edge Function URL 확인
      if (!VALIDATION_CONFIG.EDGE_FUNCTION_URL) {
        console.error('❌ [ReceiptValidator] Edge Function URL 없음');
        return {
          isValid: false,
          isActive: false,
          error: 'Edge Function URL이 설정되지 않았습니다',
        };
      }

      // 현재 사용자 가져오기
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('❌ [ReceiptValidator] 사용자 인증 실패:', authError);
        return {
          isValid: false,
          isActive: false,
          error: '사용자 인증이 필요합니다',
        };
      }

      console.log('📤 [ReceiptValidator] Edge Function 호출 시작...');

      // 플랫폼별 처리
      if (Platform.OS === 'web') {
        return this.validateWebReceipt(receiptData, transactionId);
      }

      if (Platform.OS === 'ios') {
        return await this.validateAppleReceiptViaEdgeFunction(
          receiptData,
          transactionId,
          productId || '',
          user.id
        );
      }

      if (Platform.OS === 'android') {
        // TODO: Google Play 검증 (향후 구현)
        throw new Error('Android 플랫폼은 아직 지원하지 않습니다');
      }

      throw new Error('지원하지 않는 플랫폼입니다');
    } catch (error) {
      console.error('❌ [ReceiptValidator] 영수증 검증 오류:', error);
      return {
        isValid: false,
        isActive: false,
        error: error instanceof Error ? error.message : '영수증 검증 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Apple 영수증 검증 (Supabase Edge Function 호출)
   */
  private static async validateAppleReceiptViaEdgeFunction(
    receiptData: string,
    transactionId: string,
    productId: string,
    userId: string
  ): Promise<ReceiptValidationResult> {
    console.log('🍎 [Apple] Edge Function 검증 시작...');

    // 재시도 로직
    let lastError: any = null;
    let retries = VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS;

    while (retries > 0) {
      try {
        const attempt = VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS - retries + 1;
        console.log(`🔄 [Apple] 검증 시도 ${attempt}/${VALIDATION_CONFIG.MAX_RETRY_ATTEMPTS}`);

        // Edge Function 요청 데이터
        const requestData: EdgeFunctionRequest = {
          receipt_data: receiptData,
          transaction_id: transactionId,
          product_id: productId,
          platform: 'ios',
          user_id: userId,
        };

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
        return {
          isValid: true,
          isActive: data.is_active,
          expirationDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
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
      const expiryDate = validationResult.expirationDate || new Date();

      // LocalStorage에 프리미엄 상태 저장
      const premiumStatus: PremiumStatus = {
        is_premium: validationResult.isActive,
        subscription_type: isYearly ? 'yearly' : 'monthly',
        purchase_date: new Date().toISOString(),
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
        console.log('ℹ️ [Periodic] 활성 구독 없음');

        // 프리미엄 상태 비활성화
        const currentStatus = await LocalStorageManager.getPremiumStatus();
        if (currentStatus.is_premium) {
          await LocalStorageManager.updatePremiumStatus({
            ...currentStatus,
            is_premium: false,
          });
          console.log('✅ [Periodic] 프리미엄 상태 비활성화 완료');
        }
      }
    } catch (error) {
      console.error('❌ [Periodic] 주기적 검증 오류:', error);
    }
  }
}
