/**
 * Supabase Edge Function - 타입 정의
 * 영수증 검증 API 타입 시스템
 */

// ============================================================================
// 요청/응답 인터페이스
// ============================================================================

export interface ReceiptValidationRequest {
  receipt_data?: string;  // ✅ 선택적으로 변경 (DB lookup 모드용)
  transaction_id: string;
  product_id: string;
  platform: 'ios' | 'android';
  user_id: string;
  mode?: 'verify' | 'lookup';  // ✅ 모드 추가: verify=영수증검증, lookup=DB조회
}

export interface ReceiptValidationResponse {
  success: boolean;
  is_active: boolean;
  expiry_date?: string;
  purchase_date?: string;
  error?: string;
  subscription_id?: string;
  environment?: 'Sandbox' | 'Production';
}

// ============================================================================
// Apple 관련 타입
// ============================================================================

export interface AppleReceiptResponse {
  status: number;
  environment: 'Sandbox' | 'Production';
  receipt?: {
    bundle_id: string;
    application_version: string;
    in_app: Array<AppleInAppPurchase>;
  };
  latest_receipt_info?: Array<AppleLatestReceiptInfo>;
  pending_renewal_info?: Array<ApplePendingRenewalInfo>;
}

export interface AppleInAppPurchase {
  quantity: string;
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date: string;
  purchase_date_ms: string;
  expires_date?: string;
  expires_date_ms?: string;
  is_trial_period?: string;
  is_in_intro_offer_period?: string;
}

export interface AppleLatestReceiptInfo {
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date: string;
  purchase_date_ms: string;
  expires_date: string;
  expires_date_ms: string;
  cancellation_date?: string;
  cancellation_date_ms?: string;
  is_trial_period: string;
  is_in_intro_offer_period: string;
  subscription_group_identifier?: string;
}

export interface ApplePendingRenewalInfo {
  auto_renew_product_id: string;
  original_transaction_id: string;
  product_id: string;
  auto_renew_status: '0' | '1'; // 0=off, 1=on
  expiration_intent?: '1' | '2' | '3' | '4' | '5';
}

export interface ParsedSubscriptionInfo {
  isValid: boolean;
  isActive: boolean;
  expiryDate: string;
  purchaseDate: string;
  productId: string;
  transactionId: string;
  originalTransactionId: string;
  environment: 'Sandbox' | 'Production';
  cancellationDate?: string;
}

// ============================================================================
// Supabase DB 레코드 타입
// ============================================================================

export interface SubscriptionRecord {
  user_id: string;
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  is_active: boolean;
  expiry_date: string;
  purchase_date: string;
  platform: 'ios' | 'android';
  environment: 'Sandbox' | 'Production';
  receipt_data: {
    transaction_id: string;
    original_transaction_id: string;
    validated_at: string;
    cancellation_date?: string;
  };
}

export interface SubscriptionHistoryRecord {
  subscription_id: string;
  user_id: string;
  event_type: 'created' | 'renewed' | 'expired' | 'cancelled' | 'refunded' | 'updated';
  event_data: {
    timestamp: string;
    [key: string]: any;
  };
}

// ============================================================================
// 오류 타입
// ============================================================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AppleAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public originalResponse?: any
  ) {
    super(message);
    this.name = 'AppleAPIError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}
