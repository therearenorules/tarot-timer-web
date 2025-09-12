import { useState, useEffect } from 'react';

export interface UseTimerReturn {
  currentTime: Date;
  currentHour: number;
  formattedTime: string;
}

export function useTimer(): UseTimerReturn {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

  return {
    currentTime,
    currentHour,
    formattedTime,
  };
}