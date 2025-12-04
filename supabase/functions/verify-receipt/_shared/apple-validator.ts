/**
 * Apple Server 영수증 검증 로직
 * App Store Server API와 통신하여 영수증 유효성 검증
 */

import {
  AppleReceiptResponse,
  ParsedSubscriptionInfo,
  AppleAPIError,
  ValidationError,
} from './types.ts';

const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const REQUEST_TIMEOUT_MS = 30000; // 30초

export class AppleValidator {
  private sharedSecret: string;

  constructor(sharedSecret: string) {
    if (!sharedSecret || sharedSecret.length === 0) {
      throw new ValidationError(
        'APPLE_SHARED_SECRET is required',
        'MISSING_SECRET',
        500
      );
    }
    this.sharedSecret = sharedSecret;
  }

  /**
   * Apple Server에 영수증 검증 요청
   */
  async validate(receiptData: string): Promise<AppleReceiptResponse> {
    console.log('[Apple] 영수증 검증 시작...');

    // 입력 검증
    if (!receiptData || receiptData.length === 0) {
      throw new ValidationError(
        '영수증 데이터가 비어있습니다',
        'EMPTY_RECEIPT',
        400
      );
    }

    // 먼저 Sandbox에서 시도 (TestFlight 환경)
    let response = await this.callAppleAPI(receiptData, true);

    // 21007 에러 = Sandbox 영수증을 Production으로 검증 시도
    if (response.status === 21007) {
      console.log('[Apple] Sandbox 영수증 감지');
      // Sandbox 재시도 (이미 Sandbox였으므로 정상)
      response.environment = 'Sandbox';
      return response;
    }

    // 21008 에러 = Production 영수증을 Sandbox로 검증 시도
    if (response.status === 21008) {
      console.log('[Apple] Production 영수증 감지 → Production으로 재시도');
      response = await this.callAppleAPI(receiptData, false);
    }

    // 21005 에러 = 서버 일시적 장애 → 재시도
    if (response.status === 21005) {
      console.log('[Apple] 서버 일시적 장애 → 3초 후 재시도...');
      await this.delay(3000);
      response = await this.callAppleAPI(receiptData, response.environment === 'Production');
    }

    return response;
  }

  /**
   * Apple API 호출 (내부)
   */
  private async callAppleAPI(
    receiptData: string,
    isSandbox: boolean
  ): Promise<AppleReceiptResponse> {
    const url = isSandbox ? APPLE_SANDBOX_URL : APPLE_PRODUCTION_URL;
    const environment = isSandbox ? 'Sandbox' : 'Production';

    console.log(`[Apple] API 호출: ${environment}`);
    console.log(`[Apple] URL: ${url}`);

    const requestBody = {
      'receipt-data': receiptData,
      password: this.sharedSecret,
      'exclude-old-transactions': true, // 성능 최적화: 최신 트랜잭션만 반환
    };

    // 타임아웃 컨트롤러
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('[Apple] 요청 타임아웃 (30초 초과)');
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TarotTimer-Server/1.0',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new AppleAPIError(
          `Apple API HTTP 오류: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();

      // 환경 정보 추가
      data.environment = environment;

      console.log(`[Apple] API 응답 상태: ${data.status}`);

      return data as AppleReceiptResponse;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new AppleAPIError('Apple API 요청 타임아웃', 408);
      }

      if (error instanceof AppleAPIError) {
        throw error;
      }

      throw new AppleAPIError(
        `Apple API 호출 실패: ${error.message}`,
        500,
        error
      );
    }
  }

  /**
   * 영수증 응답 파싱 (구독 정보 추출)
   */
  parseSubscriptionInfo(response: AppleReceiptResponse): ParsedSubscriptionInfo {
    console.log('[Apple] 구독 정보 파싱 시작...');

    // 상태 코드 검증
    if (response.status !== 0) {
      const errorMessage = this.getErrorMessage(response.status);
      console.error(`[Apple] 검증 실패: ${errorMessage} (status: ${response.status})`);
      throw new AppleAPIError(errorMessage, response.status, response);
    }

    // latest_receipt_info에서 구독 정보 추출
    const latestInfo = response.latest_receipt_info?.[0];

    if (!latestInfo) {
      console.error('[Apple] latest_receipt_info 없음');
      throw new ValidationError(
        '영수증에서 구독 정보를 찾을 수 없습니다',
        'NO_SUBSCRIPTION_INFO',
        400
      );
    }

    // 날짜 파싱
    const expiryDate = new Date(parseInt(latestInfo.expires_date_ms));
    // ✅ FIX: original_purchase_date_ms 사용 (최초 구매일, 불변)
    // purchase_date_ms는 갱신일이므로 사용자가 본 날짜와 다를 수 있음
    const purchaseDate = new Date(parseInt(latestInfo.original_purchase_date_ms || latestInfo.purchase_date_ms));
    const now = new Date();

    // 활성 상태 확인
    const isActive = expiryDate > now && !latestInfo.cancellation_date_ms;

    // 취소된 구독 확인
    let cancellationDate: string | undefined;
    if (latestInfo.cancellation_date_ms) {
      cancellationDate = new Date(parseInt(latestInfo.cancellation_date_ms)).toISOString();
      console.log(`[Apple] 취소된 구독 감지: ${cancellationDate}`);
    }

    const result: ParsedSubscriptionInfo = {
      isValid: true,
      isActive,
      expiryDate: expiryDate.toISOString(),
      purchaseDate: purchaseDate.toISOString(),
      productId: latestInfo.product_id,
      transactionId: latestInfo.transaction_id,
      originalTransactionId: latestInfo.original_transaction_id,
      environment: response.environment,
      cancellationDate,
    };

    console.log('[Apple] 파싱 완료:', {
      isActive: result.isActive,
      expiryDate: result.expiryDate,
      productId: result.productId,
      environment: result.environment,
    });

    return result;
  }

  /**
   * Apple 오류 코드 메시지 변환
   */
  private getErrorMessage(status: number): string {
    const errorMessages: Record<number, string> = {
      21000: '영수증 데이터가 유효하지 않습니다',
      21002: '영수증 데이터가 손상되었습니다',
      21003: '영수증을 인증할 수 없습니다',
      21004: 'Shared Secret이 일치하지 않습니다',
      21005: '영수증 서버가 일시적으로 사용할 수 없습니다 (재시도 필요)',
      21006: '구독이 만료되었지만 영수증은 유효합니다',
      21007: '이 영수증은 Sandbox 환경용입니다',
      21008: '이 영수증은 Production 환경용입니다',
      21009: '내부 데이터 접근 오류',
      21010: '사용자 계정을 찾을 수 없습니다',
    };

    return errorMessages[status] || `알 수 없는 Apple 오류: ${status}`;
  }

  /**
   * 딜레이 헬퍼
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
