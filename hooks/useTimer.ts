import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTimerReturn {
  currentTime: Date;
  currentHour: number;
  formattedTime: string;
  onSessionComplete: (callback: () => void) => void;
  removeSessionCompleteCallback: (callback: () => void) => void;
}

export function useTimer(): UseTimerReturn {
  const [currentTime, setCurrentTime] = useState(new Date());
  const lastHour = useRef<number>(new Date().getHours());
  const sessionCompleteCallbacks = useRef<Set<() => void>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      const newHour = newTime.getHours();

      // 시간이 바뀌었을 때 (세션 완료)
      if (lastHour.current !== newHour) {
        console.log(`🕒 타로 세션 완료: ${lastHour.current}시 → ${newHour}시`);

        // 모든 콜백 실행
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
  }, []);

  const onSessionComplete = useCallback((callback: () => void) => {
    sessionCompleteCallbacks.current.add(callback);
  }, []);

  const removeSessionCompleteCallback = useCallback((callback: () => void) => {
    sessionCompleteCallbacks.current.delete(callback);
  }, []);

  const currentHour = currentTime.getHours();
  const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

  return {
    currentTime,
    currentHour,
    formattedTime,
    onSessionComplete,
    removeSessionCompleteCallback,
  };
}