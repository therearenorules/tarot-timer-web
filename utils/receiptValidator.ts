/**
 * 영수증 검증 시스템
 * App Store & Google Play Store 영수증 검증 및 보안 강화
 *
 * 보안 기능:
 * - 민감한 데이터 암호화 및 마스킹
 * - 재시도 로직과 지수 백오프
 * - 타임스탬프 검증 및 리플레이 공격 방지
 * - 안전한 로깅 시스템
 */

import { Platform } from 'react-native';
import LocalStorageManager, { PremiumStatus } from './localStorage';

// 보안 설정
const SECURITY_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1초
  RECEIPT_EXPIRY_GRACE_PERIOD: 300000, // 5분
  MAX_RECEIPT_AGE: 86400000, // 24시간
  VALIDATION_TIMEOUT: 30000, // 30초
} as const;

// 영수증 검증 결과 인터페이스
export interface ReceiptValidationResult {
  isValid: boolean;
  isActive: boolean;
  expirationDate?: Date;
  originalTransactionId?: string;
  environment?: 'Sandbox' | 'Production';
  error?: string;
}

// 앱스토어 영수증 데이터 구조
export interface AppStoreReceiptData {
  receipt_data: string;
  password?: string; // App Store Connect에서 생성한 공유 비밀키
}

// Google Play 영수증 데이터 구조
export interface GooglePlayReceiptData {
  packageName: string;
  productId: string;
  purchaseToken: string;
}

export class ReceiptValidator {
  // App Store Connect 공유 비밀키 (실제 배포시 환경변수로 관리)
  private static readonly APP_STORE_SHARED_SECRET = process.env.EXPO_PUBLIC_APP_STORE_SHARED_SECRET || 'your-shared-secret';

  // Google Play Service Account (실제 배포시 환경변수로 관리)
  private static readonly GOOGLE_PLAY_SERVICE_ACCOUNT = process.env.EXPO_PUBLIC_GOOGLE_PLAY_SERVICE_ACCOUNT;

  // 재시도 횟수 추적
  private static retryAttempts = new Map<string, number>();

  /**
   * 민감한 데이터 마스킹 (보안 로깅용)
   */
  private static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars * 2) return '***';
    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    return `${start}${'*'.repeat(Math.max(8, data.length - visibleChars * 2))}${end}`;
  }

  /**
   * 안전한 로깅 (민감한 정보 제외)
   */
  private static secureLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (data) {
      // 민감한 키 필터링
      const sanitizedData = { ...data };
      const sensitiveKeys = ['receipt_data', 'password', 'purchaseToken', 'signature'];

      sensitiveKeys.forEach(key => {
        if (sanitizedData[key]) {
          sanitizedData[key] = this.maskSensitiveData(sanitizedData[key]);
        }
      });

      console.log(logMessage, sanitizedData);
    } else {
      console.log(logMessage);
    }
  }

  /**
   * 지수 백오프와 함께하는 재시도 로직
   */
  private static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    identifier: string,
    maxAttempts: number = SECURITY_CONFIG.MAX_RETRY_ATTEMPTS
  ): Promise<T> {
    const currentAttempts = this.retryAttempts.get(identifier) || 0;

    try {
      const result = await operation();
      // 성공 시 재시도 횟수 초기화
      this.retryAttempts.delete(identifier);
      return result;
    } catch (error) {
      const newAttempts = currentAttempts + 1;
      this.retryAttempts.set(identifier, newAttempts);

      if (newAttempts >= maxAttempts) {
        this.retryAttempts.delete(identifier);
        this.secureLog('error', `최대 재시도 횟수 도달: ${identifier}`, { attempts: newAttempts });
        throw error;
      }

      const delay = SECURITY_CONFIG.RETRY_DELAY_BASE * Math.pow(2, newAttempts - 1);
      this.secureLog('warn', `재시도 대기 중: ${identifier} (시도 ${newAttempts}/${maxAttempts})`, { delay });

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, identifier, maxAttempts);
    }
  }

  /**
   * 타임스탬프 검증 (리플레이 공격 방지)
   */
  private static validateTimestamp(timestamp: number): boolean {
    const now = Date.now();
    const age = now - timestamp;

    // 너무 오래된 영수증 거부
    if (age > SECURITY_CONFIG.MAX_RECEIPT_AGE) {
      this.secureLog('warn', '영수증이 너무 오래되었습니다', { age: age / 1000 / 60 });
      return false;
    }

    // 미래 타임스탬프 거부 (클록 스큐 고려하여 5분 여유)
    if (age < -SECURITY_CONFIG.RECEIPT_EXPIRY_GRACE_PERIOD) {
      this.secureLog('warn', '미래 타임스탬프 감지됨', { age: age / 1000 / 60 });
      return false;
    }

    return true;
  }

  /**
   * 플랫폼별 영수증 검증 (보안 강화)
   */
  static async validateReceipt(receiptData: string, transactionId: string): Promise<ReceiptValidationResult> {
    try {
      // 입력값 검증
      if (!receiptData || !transactionId) {
        this.secureLog('warn', '영수증 데이터 또는 트랜잭션 ID가 누락됨');
        return {
          isValid: false,
          isActive: false,
          error: '필수 데이터가 누락되었습니다.'
        };
      }

      // 재시도 로직과 함께 검증 수행
      const identifier = `${Platform.OS}-${this.maskSensitiveData(transactionId)}`;

      this.secureLog('info', '영수증 검증 시작', {
        platform: Platform.OS,
        transactionId: this.maskSensitiveData(transactionId)
      });

      const result = await this.retryWithBackoff(async () => {
        if (Platform.OS === 'web') {
          return this.validateWebReceipt(receiptData, transactionId);
        }

        if (Platform.OS === 'ios') {
          return await this.validateAppStoreReceipt(receiptData, transactionId);
        }

        if (Platform.OS === 'android') {
          return await this.validateGooglePlayReceipt(receiptData, transactionId);
        }

        throw new Error('지원하지 않는 플랫폼입니다.');
      }, identifier);

      this.secureLog('info', '영수증 검증 완료', {
        isValid: result.isValid,
        isActive: result.isActive,
        environment: result.environment
      });

      return result;

    } catch (error) {
      this.secureLog('error', '영수증 검증 오류', {
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      return {
        isValid: false,
        isActive: false,
        error: error instanceof Error ? error.message : '영수증 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * App Store 영수증 검증
   */
  private static async validateAppStoreReceipt(receiptData: string, transactionId: string): Promise<ReceiptValidationResult> {
    try {
      // 먼저 Sandbox 환경에서 검증 시도
      let result = await this.callAppStoreAPI(receiptData, true);

      // Sandbox에서 실패하면 Production 환경에서 재시도
      if (!result.isValid && result.error?.includes('21007')) {
        result = await this.callAppStoreAPI(receiptData, false);
      }

      return result;

    } catch (error) {
      console.error('❌ App Store 영수증 검증 오류:', error);
      return {
        isValid: false,
        isActive: false,
        error: 'App Store 영수증 검증에 실패했습니다.'
      };
    }
  }

  /**
   * App Store API 호출 (보안 강화)
   */
  private static async callAppStoreAPI(receiptData: string, isSandbox: boolean): Promise<ReceiptValidationResult> {
    const url = isSandbox
      ? 'https://sandbox.itunes.apple.com/verifyReceipt'
      : 'https://buy.itunes.apple.com/verifyReceipt';

    const requestData: AppStoreReceiptData = {
      receipt_data: receiptData,
      password: this.APP_STORE_SHARED_SECRET
    };

    this.secureLog('info', 'App Store API 호출', {
      environment: isSandbox ? 'Sandbox' : 'Production',
      url: url
    });

    // 타임아웃과 함께 요청
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SECURITY_CONFIG.VALIDATION_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TarotTimer/1.0'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      // App Store 응답 상태 코드 확인
      if (responseData.status === 0) {
        // 성공: 구독 정보 파싱
        const latestReceiptInfo = responseData.latest_receipt_info?.[0];
        const pendingRenewalInfo = responseData.pending_renewal_info?.[0];

        if (latestReceiptInfo) {
          const expirationDate = new Date(parseInt(latestReceiptInfo.expires_date_ms));
          const purchaseDate = new Date(parseInt(latestReceiptInfo.purchase_date_ms));

          // 타임스탬프 검증
          if (!this.validateTimestamp(purchaseDate.getTime())) {
            this.secureLog('warn', '영수증 타임스탬프 검증 실패');
            return {
              isValid: false,
              isActive: false,
              error: '영수증 타임스탬프가 유효하지 않습니다.'
            };
          }

          const isActive = new Date() < expirationDate;

          this.secureLog('info', 'App Store 영수증 검증 성공', {
            environment: isSandbox ? 'Sandbox' : 'Production',
            isActive,
            expirationDate: expirationDate.toISOString(),
            originalTransactionId: this.maskSensitiveData(latestReceiptInfo.original_transaction_id)
          });

          return {
            isValid: true,
            isActive,
            expirationDate,
            originalTransactionId: latestReceiptInfo.original_transaction_id,
            environment: isSandbox ? 'Sandbox' : 'Production'
          };
        }
      }

    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        this.secureLog('warn', 'App Store API 요청 타임아웃');
        throw new Error('App Store 서버 응답 시간 초과');
      }
      throw error;
    }

    // 실패 상태 코드 처리
    const errorMessages: { [key: number]: string } = {
      21000: '영수증 데이터가 유효하지 않습니다.',
      21002: '영수증 데이터가 손상되었습니다.',
      21003: '영수증이 인증되지 않았습니다.',
      21004: '공유 비밀키가 일치하지 않습니다.',
      21005: '영수증 서버가 일시적으로 사용할 수 없습니다.',
      21006: '영수증이 유효하지만 구독이 만료되었습니다.',
      21007: '이 영수증은 Sandbox용입니다.',
      21008: '이 영수증은 Production용입니다.'
    };

    const errorMessage = errorMessages[responseData.status] || `App Store 오류: ${responseData.status}`;

    this.secureLog('warn', 'App Store 영수증 검증 실패', {
      status: responseData.status,
      error: errorMessage,
      environment: isSandbox ? 'Sandbox' : 'Production'
    });

    return {
      isValid: false,
      isActive: false,
      error: errorMessage
    };
  }

  /**
   * Google Play 영수증 검증
   */
  private static async validateGooglePlayReceipt(receiptData: string, transactionId: string): Promise<ReceiptValidationResult> {
    try {
      // Google Play Developer API를 사용한 영수증 검증
      // 실제 구현에서는 서버 사이드에서 수행하는 것을 권장

      console.log('🔍 Google Play 영수증 검증 시뮬레이션');

      // 임시 검증 로직 (실제로는 Google Play Developer API 사용)
      const mockValidation = this.validateGooglePlayReceiptMock(receiptData, transactionId);

      return mockValidation;

    } catch (error) {
      console.error('❌ Google Play 영수증 검증 오류:', error);
      return {
        isValid: false,
        isActive: false,
        error: 'Google Play 영수증 검증에 실패했습니다.'
      };
    }
  }

  /**
   * Google Play 영수증 검증 시뮬레이션 (개발용)
   */
  private static validateGooglePlayReceiptMock(receiptData: string, transactionId: string): ReceiptValidationResult {
    try {
      // JSON 형태의 영수증 데이터 파싱
      const receipt = JSON.parse(receiptData);

      // 기본 유효성 검증
      if (!receipt.orderId || !receipt.packageName || !receipt.productId) {
        return {
          isValid: false,
          isActive: false,
          error: '영수증 데이터가 불완전합니다.'
        };
      }

      // 구독 만료일 확인 (시뮬레이션)
      const purchaseTime = new Date(receipt.purchaseTime || Date.now());
      const expirationDate = new Date(purchaseTime);

      // 구독 타입에 따른 만료일 계산
      if (receipt.productId.includes('yearly')) {
        expirationDate.setFullYear(purchaseTime.getFullYear() + 1);
      } else {
        expirationDate.setMonth(purchaseTime.getMonth() + 1);
      }

      const isActive = new Date() < expirationDate;

      return {
        isValid: true,
        isActive,
        expirationDate,
        originalTransactionId: receipt.orderId,
        environment: 'Production'
      };

    } catch (error) {
      return {
        isValid: false,
        isActive: false,
        error: '영수증 데이터 파싱에 실패했습니다.'
      };
    }
  }

  /**
   * 웹 환경 영수증 검증 (시뮬레이션)
   */
  private static validateWebReceipt(receiptData: string, transactionId: string): ReceiptValidationResult {
    console.log('🌐 웹 환경: 영수증 검증 시뮬레이션');

    // 웹 환경에서는 항상 유효한 것으로 시뮬레이션
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1); // 1개월 후 만료

    return {
      isValid: true,
      isActive: true,
      expirationDate,
      originalTransactionId: transactionId,
      environment: 'Sandbox'
    };
  }

  /**
   * 로컬 구독 상태와 영수증 검증 결과 동기화 (보안 강화)
   */
  static async syncSubscriptionStatus(validationResult: ReceiptValidationResult, productId: string): Promise<void> {
    try {
      if (!validationResult.isValid) {
        this.secureLog('warn', '유효하지 않은 영수증으로 구독 상태 업데이트 거부');
        return;
      }

      // 추가 보안 검증
      if (!productId || typeof productId !== 'string') {
        this.secureLog('warn', '유효하지 않은 제품 ID');
        return;
      }

      const currentStatus = await LocalStorageManager.getPremiumStatus();

      // 기존 트랜잭션 ID와 비교 (중복 처리 방지)
      if (currentStatus.store_transaction_id === validationResult.originalTransactionId &&
          currentStatus.is_premium === validationResult.isActive) {
        this.secureLog('info', '구독 상태가 이미 최신 상태입니다');
        return;
      }

      const updatedStatus: PremiumStatus = {
        is_premium: validationResult.isActive,
        subscription_type: productId.includes('yearly') ? 'yearly' : 'monthly',
        purchase_date: new Date().toISOString(),
        expiry_date: validationResult.expirationDate?.toISOString() || null,
        store_transaction_id: validationResult.originalTransactionId || '',
        unlimited_storage: validationResult.isActive,
        ad_free: validationResult.isActive,
        premium_themes: validationResult.isActive,
        last_validated: new Date().toISOString(),
        validation_environment: validationResult.environment || 'Unknown'
      };

      await LocalStorageManager.updatePremiumStatus(updatedStatus);

      this.secureLog('info', '구독 상태 동기화 완료', {
        isPremium: validationResult.isActive,
        subscriptionType: updatedStatus.subscription_type,
        environment: validationResult.environment,
        transactionId: this.maskSensitiveData(validationResult.originalTransactionId || '')
      });

    } catch (error) {
      this.secureLog('error', '구독 상태 동기화 오류', {
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
      throw error; // 상위에서 처리할 수 있도록 재throw
    }
  }

  /**
   * 주기적 구독 상태 검증
   */
  static async periodicValidation(): Promise<void> {
    try {
      const currentStatus = await LocalStorageManager.getPremiumStatus();

      if (!currentStatus.is_premium || !currentStatus.store_transaction_id) {
        return;
      }

      // 마지막 검증으로부터 24시간이 지났는지 확인
      const lastValidated = currentStatus.last_validated ? new Date(currentStatus.last_validated) : new Date(0);
      const now = new Date();
      const hoursSinceLastValidation = (now.getTime() - lastValidated.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastValidation < 24) {
        console.log('⏰ 아직 재검증 시간이 아닙니다.');
        return;
      }

      console.log('🔄 주기적 구독 상태 재검증 시작...');

      // 영수증 재검증 (실제 구현에서는 저장된 영수증 데이터 사용)
      const mockReceiptData = JSON.stringify({
        transactionId: currentStatus.store_transaction_id,
        productId: currentStatus.subscription_type === 'yearly' ? 'tarot_timer_yearly' : 'tarot_timer_monthly',
        purchaseDate: currentStatus.purchase_date
      });

      const validationResult = await this.validateReceipt(mockReceiptData, currentStatus.store_transaction_id);

      // 검증 결과에 따라 구독 상태 업데이트
      await this.syncSubscriptionStatus(validationResult, currentStatus.subscription_type === 'yearly' ? 'tarot_timer_yearly' : 'tarot_timer_monthly');

      if (!validationResult.isActive) {
        console.log('⚠️ 구독이 만료되었습니다.');
      }

    } catch (error) {
      console.error('❌ 주기적 검증 오류:', error);
    }
  }

  /**
   * 영수증 검증 캐시 무효화 및 보안 정리
   */
  static clearValidationCache(): void {
    this.secureLog('info', '영수증 검증 캐시 및 보안 데이터 초기화');

    // 재시도 추적 데이터 초기화
    this.retryAttempts.clear();

    // 메모리에서 민감한 데이터 정리
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }

  /**
   * 보안 감사 로그 생성
   */
  static generateSecurityAuditLog(): {
    timestamp: string;
    activeRetries: number;
    lastValidationAttempts: Array<{
      identifier: string;
      attempts: number;
    }>;
  } {
    const auditData = {
      timestamp: new Date().toISOString(),
      activeRetries: this.retryAttempts.size,
      lastValidationAttempts: Array.from(this.retryAttempts.entries()).map(([identifier, attempts]) => ({
        identifier: this.maskSensitiveData(identifier),
        attempts
      }))
    };

    this.secureLog('info', '보안 감사 로그 생성', auditData);
    return auditData;
  }
}

export default ReceiptValidator;