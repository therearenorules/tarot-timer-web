import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// 날짜 문자열 가져오기 헬퍼 (YYYY-MM-DD 형식, 로컬 시간대 기준)
const getDateString = (): string => {
  // ✅ 로컬 시간대 기준으로 날짜 생성 (UTC 버그 수정)
  // 이유: toISOString()은 UTC 기준이므로 시간대에 따라 전날로 인식되는 버그 발생
  // 예: 한국 2025-10-21 00:30 → UTC 2025-10-20 15:30 → "2025-10-20" (잘못됨)
  // 수정: 디바이스 로컬 시간 기준으로 날짜 생성
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface UseTimerReturn {
  currentTime: Date;
  currentHour: number;
  formattedTime: string;
  onSessionComplete: (callback: () => void) => void;
  removeSessionCompleteCallback: (callback: () => void) => void;
  onMidnightReset: (callback: () => void) => void;
  removeMidnightResetCallback: (callback: () => void) => void;
}

export function useTimer(): UseTimerReturn {
  const [currentTime, setCurrentTime] = useState(new Date());
  const lastHour = useRef<number>(new Date().getHours());
  const lastDate = useRef<string>(getDateString());
  const sessionCompleteCallbacks = useRef<Set<() => void>>(new Set());
  const midnightResetCallbacks = useRef<Set<() => void>>(new Set());

  // 자정 초기화 트리거 함수
  const triggerMidnightReset = useCallback(() => {
    console.log('🌙 자정 감지 - 24시간 카드 초기화 시작');

    // 모든 자정 리셋 콜백 실행
    midnightResetCallbacks.current.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ 자정 리셋 콜백 오류:', error);
      }
    });
  }, []);

  // 타이머 (1분마다 체크)
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      const newHour = newTime.getHours();
      const newDate = getDateString();

      // 날짜가 바뀌었을 때 (자정 초기화)
      if (lastDate.current !== newDate) {
        console.log(`🌙 자정 감지: ${lastDate.current} → ${newDate}`);
        triggerMidnightReset();
        lastDate.current = newDate;
      }

      // 시간이 바뀌었을 때 (세션 완료)
      if (lastHour.current !== newHour) {
        console.log(`🕒 타로 세션 완료: ${lastHour.current}시 → ${newHour}시`);

        // 모든 세션 완료 콜백 실행
        sessionCompleteCallbacks.current.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('❌ 세션 완료 콜백 오류:', error);
          }
        });

        lastHour.current = newHour;
      }

      setCurrentTime(newTime);
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, [triggerMidnightReset]);

  // AppState 리스너 (포어그라운드 복귀 시 날짜 체크)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const currentDate = getDateString();

        // 앱이 백그라운드에 있는 동안 날짜가 바뀌었는지 체크
        if (lastDate.current !== currentDate) {
          console.log(`📱 앱 복귀 시 날짜 변경 감지: ${lastDate.current} → ${currentDate}`);

          // ✅ FIX: triggerMidnightReset() 직접 호출 대신 콜백 직접 실행
          // 이유: 의존성 배열에서 triggerMidnightReset 제거하기 위함
          console.log('🌙 자정 감지 - 24시간 카드 초기화 시작');
          midnightResetCallbacks.current.forEach(callback => {
            try {
              callback();
            } catch (error) {
              console.error('❌ 자정 리셋 콜백 오류:', error);
            }
          });

          lastDate.current = currentDate;

          // 시간도 업데이트
          const newTime = new Date();
          setCurrentTime(newTime);
          lastHour.current = newTime.getHours();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    console.log('✅ useTimer AppState 리스너 설정 완료');

    return () => {
      subscription?.remove();
      console.log('🧹 useTimer AppState 리스너 정리 완료');
    };
  }, []); // ✅ FIX: 빈 의존성 배열 - 리스너는 마운트 시 한 번만 생성

  const onSessionComplete = useCallback((callback: () => void) => {
    sessionCompleteCallbacks.current.add(callback);
  }, []);

  const removeSessionCompleteCallback = useCallback((callback: () => void) => {
    sessionCompleteCallbacks.current.delete(callback);
  }, []);

  const onMidnightReset = useCallback((callback: () => void) => {
    midnightResetCallbacks.current.add(callback);
  }, []);

  const removeMidnightResetCallback = useCallback((callback: () => void) => {
    midnightResetCallbacks.current.delete(callback);
  }, []);

  const currentHour = currentTime.getHours();
  const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

  return {
    currentTime,
    currentHour,
    formattedTime,
    onSessionComplete,
    removeSessionCompleteCallback,
    onMidnightReset,
    removeMidnightResetCallback,
  };
}