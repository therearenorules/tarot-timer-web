import { TarotCard } from '../../utils/tarotData';

// 알림 설정 인터페이스
export interface NotificationSettings {
  hourlyEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  dailyReminderEnabled: boolean;
  midnightResetEnabled: boolean;
  notificationTypes: string[];
  weekendEnabled?: boolean; // 주말 알림 설정 추가
}

// 알림 컨텍스트 인터페이스
export interface NotificationContextType {
  // 알림 권한 및 토큰
  expoPushToken: string | null;
  notification: any | null; // Notifications.Notification 대신 any 사용
  hasPermission: boolean;

  // 알림 설정
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;

  // 알림 제어
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  scheduleHourlyNotifications: () => Promise<void>;
  cancelHourlyNotifications: () => Promise<void>;

  // 백엔드 연동
  registerTokenWithBackend: () => Promise<void>;
  unregisterTokenFromBackend: () => Promise<void>;

  // 고급 진단 및 상태 관리
  checkRealTimePermission: () => Promise<boolean>;
  verifyScheduledNotifications: () => Promise<number>;
  lastScheduleTime: number | null;
  scheduleAttempts: number;
  isScheduling: boolean;
}

// 기본 알림 설정
export const DEFAULT_SETTINGS: NotificationSettings = {
  hourlyEnabled: true, // 시간별 타로 알림 초기값 ON
  quietHoursEnabled: true, // 조용한 시간 기능 초기값 ON
  quietHoursStart: 22, // 22:00 (오후 10시)
  quietHoursEnd: 8,    // 08:00 (오전 8시)
  dailyReminderEnabled: true, // 데일리 타로 일기 저장 리마인더 초기값 ON
  midnightResetEnabled: true, // 자정 리셋 알림 초기값 ON
  notificationTypes: ['hourly', 'daily_save', 'midnight_reset']
};

// 다국어 메시지 타입
export interface MultilingualMessage {
  ko: { title: string; body: string };
  en: { title: string; body: string };
  ja: { title: string; body: string };
}

// 알림 데이터 타입
export interface NotificationData {
  type: string;
  hour?: number;
  timestamp: number;
  cardId?: number | null;
}

// 타로 카드 헬퍼 결과
export interface TarotCardsResult {
  cards: TarotCard[] | null;
  isValid: boolean;
  count: number;
}
