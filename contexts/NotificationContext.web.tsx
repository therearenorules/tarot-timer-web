// Web-safe version of NotificationContext
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';

// 웹 환경에서는 모든 notification 기능을 mock으로 처리
const isWeb = Platform.OS === 'web';

// 알림 설정 인터페이스 (동일하게 유지)
interface NotificationSettings {
  hourlyEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  dailyReminderEnabled: boolean;
  midnightResetEnabled: boolean;
  notificationTypes: string[];
}

// 알림 컨텍스트 인터페이스 (동일하게 유지)
interface NotificationContextType {
  // 알림 권한 및 토큰
  expoPushToken: string | null;
  notification: any | null;
  hasPermission: boolean;

  // 알림 설정
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;

  // 알림 스케줄링
  scheduleHourlyNotifications: () => Promise<boolean>;
  cancelAllNotifications: () => Promise<void>;

  // 알림 상태 관리
  checkRealTimePermission: () => Promise<boolean>;
  verifyScheduledNotifications: () => Promise<number>;

  // 진단 정보 (웹에서는 mock)
  lastScheduleTime: Date | null;
  scheduleAttempts: number;
  isScheduling: boolean;
}

// 기본 설정
const defaultSettings: NotificationSettings = {
  hourlyEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  dailyReminderEnabled: true,
  midnightResetEnabled: true,
  notificationTypes: ['hourly', 'daily']
};

// 컨텍스트 생성
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 웹 전용 Provider
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastScheduleTime, setLastScheduleTime] = useState<Date | null>(null);
  const [scheduleAttempts, setScheduleAttempts] = useState(0);
  const [isScheduling, setIsScheduling] = useState(false);

  // 웹에서는 localStorage에 설정 저장
  useEffect(() => {
    if (isWeb && typeof localStorage !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
      } catch (error) {
        console.warn('Failed to load notification settings from localStorage:', error);
      }
    }
  }, []);

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (isWeb && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.warn('Failed to save notification settings to localStorage:', error);
      }
    }
  };

  const scheduleHourlyNotifications = async (): Promise<boolean> => {
    console.log('🌐 웹 환경: 알림 스케줄링 시뮬레이션');
    setIsScheduling(true);
    setScheduleAttempts(prev => prev + 1);

    // 시뮬레이션 딜레이
    await new Promise(resolve => setTimeout(resolve, 500));

    setLastScheduleTime(new Date());
    setIsScheduling(false);
    return true;
  };

  const cancelAllNotifications = async (): Promise<void> => {
    console.log('🌐 웹 환경: 알림 취소 시뮬레이션');
    setLastScheduleTime(null);
  };

  const checkRealTimePermission = async (): Promise<boolean> => {
    console.log('🌐 웹 환경: 권한 체크 시뮬레이션');
    return false; // 웹에서는 항상 false
  };

  const verifyScheduledNotifications = async (): Promise<number> => {
    console.log('🌐 웹 환경: 예약된 알림 확인 시뮬레이션');
    return 0; // 웹에서는 항상 0개
  };

  const contextValue: NotificationContextType = {
    expoPushToken: null,
    notification: null,
    hasPermission,
    settings,
    updateSettings,
    scheduleHourlyNotifications,
    cancelAllNotifications,
    checkRealTimePermission,
    verifyScheduledNotifications,
    lastScheduleTime,
    scheduleAttempts,
    isScheduling,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};