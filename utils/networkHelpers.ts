/**
 * 네트워크 요청 헬퍼 함수
 * 타임아웃, 재시도, 네트워크 상태 체크 제공
 */

/**
 * Promise에 타임아웃 적용
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'TIMEOUT'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

/**
 * Exponential Backoff를 사용한 재시도 로직
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, delay: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 마지막 시도였으면 에러 던지기
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff 계산 (2^attempt * baseDelay)
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      );

      console.log(`⏳ 재시도 ${attempt + 1}/${maxRetries}, ${delay}ms 대기 중...`);
      console.log(`📌 이전 에러:`, lastError.message);

      // 재시도 콜백 호출
      if (onRetry) {
        onRetry(attempt + 1, delay, lastError);
      }

      // 대기
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * 타임아웃 + 재시도를 결합한 헬퍼
 */
export async function fetchWithTimeoutAndRetry<T>(
  fn: () => Promise<T>,
  options: {
    timeoutMs?: number;
    maxRetries?: number;
    baseDelay?: number;
    onRetry?: (attempt: number, delay: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    timeoutMs = 30000, // 30초 기본 타임아웃
    ...retryOptions
  } = options;

  return retryWithBackoff(
    () => withTimeout(fn(), timeoutMs, 'REQUEST_TIMEOUT'),
    retryOptions
  );
}

/**
 * 네트워크 연결 상태 확인
 * @react-native-community/netinfo 필요 시 사용
 */
export async function checkNetworkConnection(): Promise<{
  isConnected: boolean;
  type: string;
}> {
  try {
    // NetInfo 사용 가능 시
    const NetInfo = require('@react-native-community/netinfo');
    const state = await NetInfo.fetch();

    return {
      isConnected: state.isConnected ?? false,
      type: state.type
    };
  } catch (error) {
    // NetInfo 없으면 기본값 반환
    console.warn('⚠️ NetInfo 사용 불가, 연결 상태 확인 생략');
    return {
      isConnected: true, // 보수적으로 연결됨으로 가정
      type: 'unknown'
    };
  }
}

/**
 * 에러 타입 판별
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;

  const errorString = error.toString().toLowerCase();
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  return (
    errorCode === 'e_network_error' ||
    errorString.includes('network') ||
    errorString.includes('timeout') ||
    errorString.includes('connection') ||
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection')
  );
}

/**
 * 사용자 취소 에러 판별
 */
export function isUserCancelled(error: any): boolean {
  if (!error) return false;

  const errorCode = error.code?.toLowerCase() || '';
  const errorMessage = error.message?.toLowerCase() || '';

  return (
    errorCode === 'e_user_cancelled' ||
    errorMessage.includes('user cancelled') ||
    errorMessage.includes('user canceled')
  );
}
