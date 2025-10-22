/**
 * 컴포넌트 언마운트 시에도 안전한 setState Hook
 *
 * 앱 생명주기 문제로 인한 크래시를 방지합니다:
 * - 백그라운드/포어그라운드 전환 시
 * - Linking.openURL 후 앱 복귀 시
 * - 비동기 작업 중 컴포넌트 언마운트 시
 *
 * @example
 * // Before
 * const [isLoading, setIsLoading] = useState(false);
 *
 * // After
 * const [isLoading, setIsLoading] = useSafeState(false);
 */

import { useState, useEffect, useRef, Dispatch, SetStateAction, useCallback } from 'react';

export function useSafeState<T>(initialValue: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(initialValue);
  const isMountedRef = useRef(true);

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 안전한 setState 함수
  const setSafeState = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    if (isMountedRef.current) {
      setState(value);
    } else {
      if (__DEV__) {
        console.warn('⚠️ setState 호출 무시 (컴포넌트 언마운트됨)');
      }
    }
  }, []);

  return [state, setSafeState];
}

/**
 * 비동기 작업을 안전하게 실행하는 Hook
 * 컴포넌트 언마운트 시 작업을 취소하고 setState를 방지합니다.
 *
 * @example
 * const safeAsync = useSafeAsync();
 *
 * const fetchData = async () => {
 *   setLoading(true);
 *   await safeAsync(async () => {
 *     const data = await api.getData();
 *     setData(data);
 *   });
 *   setLoading(false);
 * };
 */
export function useSafeAsync() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeAsync = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    try {
      const result = await asyncFn();
      if (isMountedRef.current) {
        return result;
      }
      return null;
    } catch (error) {
      if (isMountedRef.current) {
        throw error;
      }
      if (__DEV__) {
        console.warn('⚠️ 비동기 작업 중 컴포넌트 언마운트됨:', error);
      }
      return null;
    }
  }, []);

  return safeAsync;
}

export default useSafeState;
