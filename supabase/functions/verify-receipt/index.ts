/**
 * Supabase Edge Function - 영수증 검증 API
 *
 * 엔드포인트: POST /verify-receipt
 *
 * 기능:
 * 1. Apple/Google 영수증 검증
 * 2. Supabase DB에 구독 정보 저장
 * 3. 클라이언트에 검증 결과 반환
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { AppleValidator } from './_shared/apple-validator.ts';
import { DatabaseHelper } from './_shared/database.ts';
import {
  ReceiptValidationRequest,
  ReceiptValidationResponse,
  ValidationError,
  AppleAPIError,
  DatabaseError,
} from './_shared/types.ts';

// ============================================================================
// CORS 설정
// ============================================================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// 환경 변수 검증
// ============================================================================
function validateEnvironment(): {
  supabaseUrl: string;
  serviceRoleKey: string;
  appleSharedSecret: string;
} {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const appleSharedSecret = Deno.env.get('APPLE_SHARED_SECRET');

  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!appleSharedSecret) missing.push('APPLE_SHARED_SECRET');

  if (missing.length > 0) {
    throw new ValidationError(
      `필수 환경 변수 누락: ${missing.join(', ')}`,
      'MISSING_ENV_VARS',
      500
    );
  }

  return {
    supabaseUrl: supabaseUrl!,
    serviceRoleKey: serviceRoleKey!,
    appleSharedSecret: appleSharedSecret!,
  };
}

// ============================================================================
// 요청 검증
// ✅ V2: receipt_data가 없으면 자동으로 lookup 모드로 전환
// ============================================================================
function validateRequest(body: any): ReceiptValidationRequest {
  const { receipt_data, transaction_id, product_id, platform, user_id, mode } = body;

  // ✅ 모드 결정: receipt_data가 없으면 자동으로 lookup 모드
  const effectiveMode = mode || (receipt_data ? 'verify' : 'lookup');

  const missingFields: string[] = [];
  // receipt_data는 lookup 모드에서는 필수가 아님
  if (effectiveMode === 'verify' && !receipt_data) missingFields.push('receipt_data');
  if (!transaction_id) missingFields.push('transaction_id');
  if (!product_id) missingFields.push('product_id');
  if (!platform) missingFields.push('platform');
  if (!user_id) missingFields.push('user_id');

  if (missingFields.length > 0) {
    throw new ValidationError(
      `필수 파라미터 누락: ${missingFields.join(', ')}`,
      'MISSING_PARAMS',
      400
    );
  }

  if (platform !== 'ios' && platform !== 'android') {
    throw new ValidationError(
      `지원하지 않는 플랫폼: ${platform}`,
      'UNSUPPORTED_PLATFORM',
      400
    );
  }

  console.log(`[Validate] 모드: ${effectiveMode}, receipt_data 존재: ${!!receipt_data}`);

  return {
    receipt_data: receipt_data || '',
    transaction_id,
    product_id,
    platform,
    user_id,
    mode: effectiveMode,
  };
}

// ============================================================================
// 에러 응답 생성
// ============================================================================
function createErrorResponse(error: any): Response {
  console.error('[Main] 오류 발생:', error);

  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let errorMessage = '영수증 검증 중 오류가 발생했습니다';

  if (error instanceof ValidationError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    errorMessage = error.message;
  } else if (error instanceof AppleAPIError) {
    statusCode = error.status >= 500 ? 502 : 400;
    errorCode = 'APPLE_API_ERROR';
    errorMessage = error.message;
  } else if (error instanceof DatabaseError) {
    statusCode = 500;
    errorCode = 'DATABASE_ERROR';
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const response: ReceiptValidationResponse = {
    success: false,
    is_active: false,
    error: errorMessage,
  };

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// 메인 핸들러
// ============================================================================
serve(async (req: Request) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // POST 메서드만 허용
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        is_active: false,
        error: 'POST 메서드만 지원합니다',
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('='.repeat(80));
    console.log('[Main] 영수증 검증 요청 시작');
    console.log('[Main] Timestamp:', new Date().toISOString());

    // 1. 환경 변수 검증
    const env = validateEnvironment();

    // 2. 요청 바디 파싱 및 검증
    const body = await req.json();
    const validatedRequest = validateRequest(body);

    console.log('[Main] 요청 정보:', {
      user_id: validatedRequest.user_id.substring(0, 8) + '...',
      product_id: validatedRequest.product_id,
      platform: validatedRequest.platform,
      transaction_id: validatedRequest.transaction_id.substring(0, 10) + '...',
    });

    // Database Helper 초기화 (모든 모드에서 필요)
    const dbHelper = new DatabaseHelper(env.supabaseUrl, env.serviceRoleKey);

    // ✅ V2: Lookup 모드 처리 (receipt 없이 DB에서 조회)
    if (validatedRequest.mode === 'lookup') {
      console.log('[Main] 🔍 Lookup 모드 - DB에서 구독 상태 조회');

      // user_id로 활성 구독 조회
      const existingSubscription = await dbHelper.getActiveSubscription(validatedRequest.user_id);

      if (existingSubscription) {
        // 만료일 확인
        const expiryDate = new Date(existingSubscription.expiry_date);
        const now = new Date();
        const isActive = expiryDate > now && existingSubscription.is_active;

        console.log('[Main] Lookup 결과:', {
          found: true,
          isActive,
          expiryDate: existingSubscription.expiry_date,
        });

        const response: ReceiptValidationResponse = {
          success: true,
          is_active: isActive,
          expiry_date: existingSubscription.expiry_date,
          purchase_date: existingSubscription.purchase_date,
          subscription_id: existingSubscription.id,
          environment: existingSubscription.environment as 'Sandbox' | 'Production',
        };

        console.log('[Main] ✅ Lookup 완료 - 구독 발견');
        console.log('='.repeat(80));

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log('[Main] Lookup 결과: 활성 구독 없음');

        const response: ReceiptValidationResponse = {
          success: true,
          is_active: false,
          error: '활성 구독을 찾을 수 없습니다',
        };

        console.log('[Main] ✅ Lookup 완료 - 구독 없음');
        console.log('='.repeat(80));

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 3. 플랫폼별 처리 (verify 모드)
    if (validatedRequest.platform === 'ios') {
      console.log('[Main] iOS 플랫폼 검증 시작 (verify 모드)');

      // Apple Validator 초기화
      const appleValidator = new AppleValidator(env.appleSharedSecret);

      // Apple Server 영수증 검증
      console.log('[Main] Step 1/3: Apple Server 검증 요청...');
      const appleResponse = await appleValidator.validate(validatedRequest.receipt_data!);

      console.log('[Main] Step 2/3: 구독 정보 파싱...');
      const subscriptionInfo = appleValidator.parseSubscriptionInfo(appleResponse);

      console.log('[Main] Apple 검증 완료:', {
        isValid: subscriptionInfo.isValid,
        isActive: subscriptionInfo.isActive,
        expiryDate: subscriptionInfo.expiryDate,
        environment: subscriptionInfo.environment,
      });

      // Supabase DB 저장
      console.log('[Main] Step 3/3: Supabase DB 저장...');
      const { subscription_id } = await dbHelper.upsertSubscription({
        user_id: validatedRequest.user_id,
        product_id: subscriptionInfo.productId,
        transaction_id: subscriptionInfo.transactionId,
        original_transaction_id: subscriptionInfo.originalTransactionId,
        is_active: subscriptionInfo.isActive,
        expiry_date: subscriptionInfo.expiryDate,
        purchase_date: subscriptionInfo.purchaseDate,
        platform: 'ios',
        environment: subscriptionInfo.environment,
        receipt_data: {
          transaction_id: subscriptionInfo.transactionId,
          original_transaction_id: subscriptionInfo.originalTransactionId,
          validated_at: new Date().toISOString(),
          cancellation_date: subscriptionInfo.cancellationDate,
        },
      });

      console.log('[Main] DB 저장 완료:', subscription_id);

      // 성공 응답
      const response: ReceiptValidationResponse = {
        success: true,
        is_active: subscriptionInfo.isActive,
        expiry_date: subscriptionInfo.expiryDate,
        purchase_date: subscriptionInfo.purchaseDate,
        subscription_id,
        environment: subscriptionInfo.environment,
      };

      console.log('[Main] ✅ 검증 완료 - 성공');
      console.log('='.repeat(80));

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (validatedRequest.platform === 'android') {
      // TODO: Google Play 검증 (향후 구현)
      throw new ValidationError(
        'Android 플랫폼은 아직 지원하지 않습니다',
        'ANDROID_NOT_SUPPORTED',
        501
      );
    } else {
      throw new ValidationError(
        `지원하지 않는 플랫폼: ${validatedRequest.platform}`,
        'UNSUPPORTED_PLATFORM',
        400
      );
    }

  } catch (error: any) {
    console.log('[Main] ❌ 검증 실패');
    console.log('='.repeat(80));
    return createErrorResponse(error);
  }
});

console.log('🚀 Edge Function 시작됨: verify-receipt');
console.log('📌 엔드포인트: POST /verify-receipt');
console.log('📌 지원 플랫폼: iOS (Android 향후 지원)');
