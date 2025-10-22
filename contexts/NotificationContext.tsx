import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { simpleStorage, STORAGE_KEYS, TarotCard, DailyTarotSave, TarotUtils } from '../utils/tarotData';
import i18next from 'i18next';
import { useSafeState } from '../hooks/useSafeState';

// expo-notifications를 조건부로 import
let Notifications: any = null;
let Device: any = null;
let Constants: any = null;

// 모바일 환경에서만 expo 모듈들을 로드
const isMobileEnvironment = Platform.OS === 'ios' || Platform.OS === 'android';

if (isMobileEnvironment) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    Constants = require('expo-constants');
    console.log('✅ Expo notification 모듈 로드 성공');
  } catch (error) {
    console.warn('⚠️ Expo notification modules not available:', error);
  }
} else {
  console.log('🌐 웹 환경: Expo notification 모듈 비활성화');
}

// API URL 헬퍼 함수
const getApiUrl = (): string => {
  const apiUrl = Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  return apiUrl;
};

// 알림 설정 인터페이스
interface NotificationSettings {
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
interface NotificationContextType {
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
const DEFAULT_SETTINGS: NotificationSettings = {
  hourlyEnabled: true, // 시간별 타로 알림 초기값 ON
  quietHoursEnabled: true, // 조용한 시간 기능 초기값 ON
  quietHoursStart: 22, // 22:00 (오후 10시)
  quietHoursEnd: 8,    // 08:00 (오전 8시)
  dailyReminderEnabled: true, // 데일리 타로 일기 저장 리마인더 초기값 ON
  midnightResetEnabled: true, // 자정 리셋 알림 초기값 ON
  notificationTypes: ['hourly', 'daily_save', 'midnight_reset']
};

// 알림 동작 설정 (모바일 환경에서만)
if (Notifications && isMobileEnvironment) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
      }),
    });
  } catch (error) {
    console.warn('⚠️ Failed to set notification handler:', error);
  }
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Expo Push Token 등록 함수
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  // 웹에서는 푸시 알림 지원하지 않음
  if (!isMobileEnvironment) {
    console.log('Push notifications are not supported on web/non-mobile platforms');
    return null;
  }

  // Notifications 모듈이 없으면 null 반환
  if (!Notifications || !Device) {
    console.log('Notification modules not available');
    return null;
  }

  try {
    // 실제 디바이스에서만 푸시 알림 작동
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          console.warn('No projectId found in Constants, skipping push token generation');
          return null;
        }

        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
          })
        ).data;
        console.log('Expo push token:', token);
      } catch (error) {
        console.error('Error getting Expo push token:', error);
        return null;
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    // Android 알림 채널 설정
    if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
      try {
        await Notifications.setNotificationChannelAsync('tarot-hourly', {
          name: '시간별 타로 알림',
          description: '매시간 새로운 타로 카드 알림',
          importance: Notifications.AndroidImportance?.HIGH || 'high',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7b2cbf',
        });

        await Notifications.setNotificationChannelAsync('tarot-midnight', {
          name: '자정 카드 리셋',
          description: '자정에 새로운 24시간 카드 세트 알림',
          importance: Notifications.AndroidImportance?.DEFAULT || 'default',
          vibrationPattern: [0, 1000],
          lightColor: '#f4d03f',
        });

        await Notifications.setNotificationChannelAsync('tarot-save', {
          name: '일기 저장 알림',
          description: '일일 타로 세션 저장 알림',
          importance: Notifications.AndroidImportance?.LOW || 'low',
          lightColor: '#d4b8ff',
        });
      } catch (error) {
        console.warn('Failed to set notification channels:', error);
      }
    }
  } catch (error) {
    console.error('Error in registerForPushNotificationsAsync:', error);
    return null;
  }

  return token;
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useSafeState<string | null>(null);
  const [notification, setNotification] = useSafeState<any | null>(null);
  const [hasPermission, setHasPermission] = useSafeState(Platform.OS === 'web' ? false : false);
  const [settings, setSettings] = useSafeState<NotificationSettings>(DEFAULT_SETTINGS);

  // 알림 상태 추적을 위한 추가 상태 (useSafeState 적용)
  const [lastScheduleTime, setLastScheduleTime] = useSafeState<number | null>(null);
  const [scheduleAttempts, setScheduleAttempts] = useSafeState<number>(0);
  const [isScheduling, setIsScheduling] = useSafeState<boolean>(false);

  // ✅ FIX: hasPermission ref로 관리 (AppState 리스너 재생성 방지)
  const hasPermissionRef = useRef(Platform.OS === 'web' ? false : false);

  // 실시간 권한 상태 체크 함수 (useCallback으로 메모이제이션)
  const checkRealTimePermission = useCallback(async (): Promise<boolean> => {
    if (!isMobileEnvironment || !Notifications) {
      return false;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      const actualPermission = status === 'granted';

      // ✅ FIX: ref를 사용하여 최신 값 비교 (의존성 배열에서 제거)
      // Context 상태와 실제 권한이 다르면 동기화
      if (hasPermissionRef.current !== actualPermission) {
        console.log(`🔄 권한 상태 불일치 감지: Context=${hasPermissionRef.current}, 실제=${actualPermission}`);
        hasPermissionRef.current = actualPermission;
        setHasPermission(actualPermission);

        // 권한이 꺼진 경우 스케줄된 알림 정리
        if (!actualPermission) {
          console.log('📵 권한 상실 감지 - 스케줄된 알림 정리');
          try {
            await Notifications.cancelAllScheduledNotificationsAsync();
          } catch (cancelError) {
            console.warn('⚠️ 알림 취소 실패 (무시 가능):', cancelError);
          }
        }
      }

      return actualPermission;
    } catch (error) {
      console.error('❌ 실시간 권한 체크 실패:', error);
      return false;
    }
  }, []); // ✅ FIX: 빈 의존성 배열 - ref 사용으로 hasPermission 제거

  // 앱 상태 변화 감지 및 권한 재확인
  useEffect(() => {
    if (!isMobileEnvironment || !Notifications) return;

    let appStateSubscription: any = null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      const { AppState } = require('react-native');

      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
          console.log('📱 앱 포어그라운드 복귀 - 권한 상태 재확인');

          // ✅ setTimeout을 저장하고 cleanup에서 clear (메모리 누수 방지)
          timeoutId = setTimeout(() => {
            // ✅ try-catch로 감싸서 안전하게 호출
            checkRealTimePermission().catch((error) => {
              console.warn('⚠️ 포어그라운드 복귀 시 권한 체크 실패:', error);
            });
          }, 1000);
        }
      };

      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
      console.log('✅ NotificationContext AppState 리스너 설정 완료');
    } catch (error) {
      console.warn('⚠️ NotificationContext AppState 리스너 설정 실패:', error);
    }

    return () => {
      // ✅ cleanup: timeout과 subscription 모두 정리
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (appStateSubscription?.remove) {
        appStateSubscription.remove();
        console.log('🧹 NotificationContext AppState 리스너 정리 완료');
      }
    };
  }, []); // ✅ FIX: 빈 의존성 배열 - 리스너는 마운트 시 한 번만 생성

  // 컴포넌트 마운트 시 초기 설정
  useEffect(() => {
    // 웹 환경에서는 푸시 토큰 등록을 스킵
    if (!isMobileEnvironment) {
      console.log('Non-mobile platform detected, skipping push token registration');
      // 웹 환경에서는 설정만 로드
      loadNotificationSettings();
      return;
    }

    // Notifications 모듈이 없으면 설정만 로드하고 리턴
    if (!Notifications) {
      console.log('Notifications module not available, loading settings only');
      loadNotificationSettings();
      return;
    }

    // 초기화: 권한 체크와 토큰 등록을 분리
    const initializeNotifications = async () => {
      try {
        // 1. 먼저 권한 체크
        const { status } = await Notifications.getPermissionsAsync();
        const hasNotificationPermission = status === 'granted';

        console.log('🔔 알림 권한 상태:', status, hasNotificationPermission ? '✅ 권한 있음' : '❌ 권한 없음');
        setHasPermission(hasNotificationPermission);

        // 2. 권한이 있으면 토큰 등록 시도
        if (hasNotificationPermission) {
          const token = await registerForPushNotificationsAsync();
          setExpoPushToken(token);

          if (token) {
            console.log('🔔 토큰 등록 완료 - 자동 알림 스케줄링 시작');
            // 설정 로드 후 알림 스케줄링 (약간의 지연)
            setTimeout(async () => {
              try {
                const savedSettings = await loadNotificationSettingsSync();
                if (savedSettings.hourlyEnabled) {
                  await scheduleHourlyNotificationsWithSettings(savedSettings);
                  console.log('✅ 자동 알림 스케줄링 완료');
                }
              } catch (error) {
                console.error('❌ 자동 알림 스케줄링 실패:', error);
              }
            }, 1000);
          } else {
            console.warn('⚠️ 권한은 있지만 토큰 생성 실패');
          }
        }

        // 3. 설정 로드는 권한과 무관하게 실행
        await loadNotificationSettings();
      } catch (error) {
        console.error('❌ 알림 초기화 실패:', error);
        await loadNotificationSettings();
      }
    };

    initializeNotifications()
      .catch(error => {
        console.error('Error registering for push notifications:', error);
      });

    // 모바일 환경에서만 알림 리스너 설정
    let notificationListener: any = null;
    let responseListener: any = null;

    try {
      if (Notifications.addNotificationReceivedListener && Notifications.addNotificationResponseReceivedListener) {
        notificationListener = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
          setNotification(notification);
        });

        responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          // 알림 클릭 시 특정 화면으로 네비게이션 가능
        });
      }
    } catch (error) {
      console.warn('Failed to set up notification listeners:', error);
    }

    // 저장된 설정 로드
    loadNotificationSettings();

    return () => {
      // 리스너 정리 - 안전하게 체크
      try {
        if (Notifications?.removeNotificationSubscription) {
          if (notificationListener) {
            Notifications.removeNotificationSubscription(notificationListener);
          }
          if (responseListener) {
            Notifications.removeNotificationSubscription(responseListener);
          }
        }
      } catch (error) {
        console.warn('Failed to remove notification listeners:', error);
      }
    };
  }, []);

  // 저장된 알림 설정 로드
  const loadNotificationSettings = async () => {
    try {
      // 웹 환경에서는 localStorage 사용
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
          console.log('✅ 저장된 알림 설정 로드 성공:', parsedSettings);
        } else {
          console.log('📱 기본 알림 설정 사용:', DEFAULT_SETTINGS);
        }
      }
      // TODO: 모바일에서는 AsyncStorage 사용
      // const savedSettings = await AsyncStorage.getItem('notificationSettings');
      // if (savedSettings) {
      //   setSettings(JSON.parse(savedSettings));
      // }
    } catch (error) {
      console.error('❌ 알림 설정 로드 오류:', error);
    }
  };

  // 동기적으로 설정을 로드하는 함수 (자동 스케줄링용)
  const loadNotificationSettingsSync = async (): Promise<NotificationSettings> => {
    try {
      // 웹 환경에서는 localStorage 사용
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          return { ...DEFAULT_SETTINGS, ...parsedSettings };
        }
      }
      // TODO: 모바일에서는 AsyncStorage 사용
      // const savedSettings = await AsyncStorage.getItem('notificationSettings');
      // if (savedSettings) {
      //   return JSON.parse(savedSettings);
      // }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('❌ 알림 설정 동기 로드 오류:', error);
      return DEFAULT_SETTINGS;
    }
  };

  // 스케줄된 알림 상태 확인 함수
  const verifyScheduledNotifications = async (): Promise<number> => {
    if (!isMobileEnvironment || !Notifications) {
      return 0;
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const hourlyNotifications = scheduledNotifications.filter(n =>
        n.content.data?.type === 'hourly'
      );

      console.log(`📊 현재 스케줄된 시간별 알림: ${hourlyNotifications.length}개`);
      return hourlyNotifications.length;
    } catch (error) {
      console.error('❌ 스케줄된 알림 확인 실패:', error);
      return 0;
    }
  };

  // 알림 설정 업데이트
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    console.log('NotificationContext updateSettings 호출:', {
      이전설정: settings,
      새설정: newSettings,
      병합후설정: { ...settings, ...newSettings }
    });

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    console.log('상태 업데이트 완료:', updatedSettings);

    // 웹 환경에서는 localStorage에 설정 저장
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
        console.log('✅ localStorage에 알림 설정 저장 완료');
      }
      // TODO: 모바일에서는 AsyncStorage에 설정 저장
      // await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('❌ 알림 설정 저장 오류:', error);
    }

    // 🔄 설정 변경 시 알림 자동 재스케줄링
    if (hasPermission && isMobileEnvironment && Notifications) {
      try {
        // 시간별 알림 활성화/비활성화 또는 조용한 시간 변경 시 재스케줄링
        if ('hourlyEnabled' in newSettings || 'quietHoursStart' in newSettings || 'quietHoursEnd' in newSettings) {
          console.log('알림 설정 변경됨 - 자동 재스케줄링 시작');

          // 기존 알림 취소 후 새 설정으로 재스케줄
          await Notifications.cancelAllScheduledNotificationsAsync();

          // 시간별 알림이 활성화된 경우에만 재스케줄
          if (updatedSettings.hourlyEnabled) {
            // 새 설정을 사용하여 알림 스케줄링
            await scheduleHourlyNotificationsWithSettings(updatedSettings);
          }

          console.log('✅ 알림 재스케줄링 완료');
        }
      } catch (error) {
        console.error('❌ 알림 재스케줄링 오류:', error);
      }
    }

    // 백엔드에 설정 동기화 (인증된 사용자만)
    if (expoPushToken && isAuthenticated) {
      try {
        await fetch(`${getApiUrl()}/api/notifications/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(updatedSettings),
        });
      } catch (error) {
        console.error('Failed to sync notification settings:', error);
      }
    }
  };

  // 알림 권한 요청
  const requestPermission = async (): Promise<boolean> => {
    if (!isMobileEnvironment) {
      console.log('Non-mobile platform: Push notifications not supported');
      return false;
    }

    if (!Notifications) {
      console.log('Notifications module not available');
      return false;
    }

    try {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
      const granted = !!token;
      setHasPermission(granted);

      // 권한 획득 시 자동으로 알림 스케줄링
      if (granted) {
        console.log('🔔 수동 권한 요청 성공 - 자동 알림 스케줄링 시작');
        setTimeout(async () => {
          try {
            const savedSettings = await loadNotificationSettingsSync();
            if (savedSettings.hourlyEnabled) {
              await scheduleHourlyNotificationsWithSettings(savedSettings);
              console.log('✅ 수동 권한 후 자동 알림 스케줄링 완료');
            }
          } catch (error) {
            console.error('❌ 수동 권한 후 자동 알림 스케줄링 실패:', error);
          }
        }, 500);
      }

      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // 테스트 알림 발송
  const sendTestNotification = async () => {
    if (!isMobileEnvironment) {
      console.log('Non-mobile platform: Test notification simulated');
      return;
    }

    if (!Notifications) {
      console.log('Notifications module not available');
      return;
    }

    // 권한이 없으면 먼저 권한 요청
    if (!hasPermission) {
      console.log('No notification permission, requesting permission...');
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        console.log('Permission denied, cannot send test notification');
        return;
      }
    }

    try {
      console.log('Sending test notification...');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔮 타로 타이머 테스트',
          body: '알림이 정상적으로 작동하고 있습니다!',
          data: {
            type: 'test',
            timestamp: Date.now()
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
          categoryIdentifier: 'tarot-hourly',
        },
        trigger: null, // 즉시 알림
        identifier: `test-${Date.now()}`,
      });
      console.log('Test notification scheduled successfully');
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  // 오늘의 24시간 타로 카드 가져오기 헬퍼 함수
  const getTodayTarotCards = async (): Promise<TarotCard[] | null> => {
    try {
      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
      const savedData = await simpleStorage.getItem(storageKey);

      if (savedData) {
        const dailySave: DailyTarotSave = JSON.parse(savedData);
        return dailySave.hourlyCards;
      }
      return null;
    } catch (error) {
      console.error('❌ 타로 카드 데이터 로드 실패:', error);
      return null;
    }
  };

  // 카드 이름 가져오기 (현재 언어 반영)
  const getCardNameForNotification = (card: TarotCard): string => {
    const currentLang = i18next.language || 'ko';

    if (currentLang === 'ja') {
      return card.nameJa || card.nameKr || card.name;
    } else if (currentLang === 'en') {
      return card.name;
    } else {
      // 기본 한국어
      return card.nameKr || card.name;
    }
  };

  // 카드 의미 가져오기 (현재 언어 반영)
  const getCardMeaningForNotification = (card: TarotCard): string => {
    const currentLang = i18next.language || 'ko';

    if (currentLang === 'ja') {
      return card.meaningJa || card.meaningKr || card.meaning;
    } else if (currentLang === 'en') {
      return card.meaning;
    } else {
      // 기본 한국어
      return card.meaningKr || card.meaning;
    }
  };

  // 시간 표시 형식 (언어별)
  const formatHourForNotification = (hour: number): string => {
    const currentLang = i18next.language || 'ko';

    if (currentLang === 'ja') {
      return `${hour}時`;
    } else if (currentLang === 'en') {
      // 12시간 형식
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}${period}`;
    } else {
      // 한국어 기본
      return `${hour}시`;
    }
  };

  // 설정을 받아 알림을 스케줄링하는 헬퍼 함수 (강화된 버전)
  const scheduleHourlyNotificationsWithSettings = async (settingsToUse: NotificationSettings): Promise<boolean> => {
    if (!Notifications) {
      console.log('Notifications module not available');
      return false;
    }

    // 중복 스케줄링 방지 (강화)
    if (isScheduling) {
      console.log('⏳ 이미 스케줄링 진행 중 - 스킵');
      return false;
    }

    // ✅ 추가: 마지막 스케줄 시간 체크 (1초 이내 중복 호출 방지)
    const now = Date.now();
    if (lastScheduleTime && (now - lastScheduleTime) < 1000) {
      console.log('⏳ 최근 1초 이내 스케줄링 완료 - 중복 호출 방지');
      return false;
    }

    try {
      // useSafeState를 사용하여 컴포넌트 언마운트 시 자동 보호
      setIsScheduling(true);
      setScheduleAttempts(prev => prev + 1);
      // 1. 실시간 권한 확인
      const hasRealPermission = await checkRealTimePermission();
      if (!hasRealPermission) {
        console.log('❌ 실시간 권한 없음 - 스케줄링 중단');
        setIsScheduling(false);
        return false;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 강화된 알림 스케줄링 시작...');

      // 2. 오늘의 24시간 타로 카드 데이터 로드
      const todayCards = await getTodayTarotCards();
      console.log(`   • 타로 카드 데이터: ${todayCards ? `${todayCards.length}개` : '없음'}`);
      console.log(`   • 권한 상태: ${hasRealPermission ? '✅ 허용됨' : '❌ 거부됨'}`);
      console.log(`   • 시간별 알림: ${settingsToUse.hourlyEnabled ? '✅ 활성화' : '❌ 비활성화'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // ✅ 카드 데이터가 없으면 오전 8시 리마인더만 생성
      if (!todayCards || todayCards.length === 0) {
        console.log('⏸️ 카드를 아직 뽑지 않음 - 오전 8시 리마인더만 생성');
        console.log('   ℹ️  카드 데이터: null 또는 빈 배열');

        // 기존 알림 모두 취소 (깨끗한 상태에서 시작)
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('🗑️ 기존 알림 모두 취소 완료');

        // 오전 8시 리마인더 알림 생성 (다국어)
        const currentLang = i18next.language || 'ko';
        const reminderMessages = {
          ko: {
            title: '🌅 좋은 아침입니다!',
            body: '오늘 하루의 24시간 타로 카드를 뽑아보세요 🔮'
          },
          en: {
            title: '🌅 Good morning!',
            body: 'Draw your 24-hour tarot cards for today 🔮'
          },
          ja: {
            title: '🌅 おはようございます！',
            body: '今日の24時間タロットカードを引いてみましょう 🔮'
          }
        };

        const message = reminderMessages[currentLang as keyof typeof reminderMessages] || reminderMessages['ko'];

        // 오전 8시 리마인더 시간 계산 (오늘 또는 내일)
        const reminder8AM = new Date();
        let targetHour = 8; // 기본 8AM

        // ✅ 조용한 시간과 충돌 시 조정 (조용한 시간 종료 직후로 변경)
        // settingsToUse 파라미터 사용 (중복 로드 방지)
        if (settingsToUse.quietHoursEnabled) {
          const quietEnd = settingsToUse.quietHoursEnd;

          // 조용한 시간이 8AM을 포함하는지 확인
          // 예: quietHoursStart=22, quietHoursEnd=9 → 8AM이 조용한 시간에 포함됨
          if (settingsToUse.quietHoursStart > settingsToUse.quietHoursEnd) {
            // 자정 걸침 (예: 22시 ~ 9시)
            if (targetHour < quietEnd) {
              targetHour = quietEnd; // 8 → 9시로 조정
              console.log(`⏰ 8AM 리마인더가 조용한 시간과 충돌 → ${targetHour}시로 조정`);
            }
          } else {
            // 자정 안 걸침 (예: 23시 ~ 1시)
            if (targetHour >= settingsToUse.quietHoursStart && targetHour < quietEnd) {
              targetHour = quietEnd;
              console.log(`⏰ 8AM 리마인더가 조용한 시간과 충돌 → ${targetHour}시로 조정`);
            }
          }
        }

        reminder8AM.setHours(targetHour, 0, 0, 0);

        // 현재 시간이 목표 시간 이후라면 내일로 설정
        const nowTime = new Date();
        if (nowTime.getHours() >= targetHour) {
          reminder8AM.setDate(reminder8AM.getDate() + 1);
        }

        console.log(`📅 리마인더 예정 시간: ${reminder8AM.toLocaleString('ko-KR')}`);

        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: message.title,
              body: message.body,
              data: {
                type: 'daily_reminder',
                timestamp: reminder8AM.getTime()
              },
              sound: true,
              priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
              categoryIdentifier: 'tarot-save',
            },
            trigger: reminder8AM,
            identifier: `daily-reminder-${reminder8AM.getTime()}`,
          });

          console.log('✅ 오전 8시 카드 뽑기 리마인더 생성 완료');
          console.log('💡 24시간 카드를 뽑으면 자동으로 시간대별 알림이 생성됩니다.');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } catch (reminderError) {
          console.error('❌ 8AM 리마인더 생성 실패:', reminderError);
        }

        setIsScheduling(false);
        setLastScheduleTime(Date.now()); // ✅ 추가: 스케줄 시간 기록
        return true; // 리마인더는 생성함
      }

      // ✅ 추가 검증: 카드가 24개가 아니면 비정상 상태
      if (todayCards.length !== 24) {
        console.error(`❌ 비정상적인 카드 개수: ${todayCards.length}개 (24개 필요)`);
        console.error('   ℹ️  알림 스케줄링 중단 - 카드 데이터 재생성 필요');
        setIsScheduling(false);
        return false;
      }

      console.log('✅ 카드 데이터 검증 완료: 24개 카드 확인됨');

      // 3. 기존 알림 모두 취소 (안전한 정리)
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ 기존 알림 모두 취소 완료');

      // 4. 다국어 지원 준비
      const currentLang = i18next.language || 'ko';

      let scheduledCount = 0;
      const maxNotifications = 64; // iOS/Android 제한 완화 (최대 64개)
      const now = new Date();

      console.log(`🕐 현재 시각: ${now.getHours()}:${now.getMinutes()}, 조용한 시간: ${settingsToUse.quietHoursStart}:00 - ${settingsToUse.quietHoursEnd}:00`);

      // 5. 오늘 하루의 남은 시간 범위 계산
      // 현재 시간이 14:30이면 → 15시부터 오늘 23시까지만 (오늘 하루만 커버)
      // 자정(00:00)에는 리셋 알림이 뜨고, 사용자가 새 카드를 뽑으면 다시 스케줄링
      const currentHourIndex = now.getHours();
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0); // 다음 정각 (분, 초, 밀리초를 0으로)

      // 오늘 남은 시간 계산 (현재 시간부터 23시까지)
      const hoursRemainingToday = 23 - currentHourIndex;
      console.log(`⏰ 현재 시간: ${currentHourIndex}시, 다음 정각: ${nextHour.getHours()}시`);
      console.log(`📅 오늘 남은 시간: ${hoursRemainingToday}시간 (${nextHour.getHours()}시 ~ 23시)`);

      // 6. 다음 정각부터 오늘 23시까지만 스케줄 (오늘 하루만)
      // 예: 현재 14시 → 15시부터 23시까지만 (15, 16, 17, 18, 19, 20, 21, 22, 23)
      for (let i = 0; i < hoursRemainingToday && scheduledCount < maxNotifications; i++) {
        const targetHour = currentHourIndex + 1 + i; // 다음 시간부터 오늘 23시까지
        const triggerDate = new Date(nextHour.getTime() + (i * 60 * 60 * 1000));
        const hour = targetHour;

        // 조용한 시간 체크 (조용한 시간 기능이 활성화된 경우에만)
        let isQuietTime = false;
        if (settingsToUse.quietHoursEnabled) {
          if (settingsToUse.quietHoursStart > settingsToUse.quietHoursEnd) {
            // 예: 22시 ~ 08시 (자정 걸침)
            isQuietTime = (hour >= settingsToUse.quietHoursStart || hour < settingsToUse.quietHoursEnd);
          } else {
            // 예: 13시 ~ 14시 (자정 안 걸침)
            isQuietTime = (hour >= settingsToUse.quietHoursStart && hour < settingsToUse.quietHoursEnd);
          }
        }

        if (settingsToUse.hourlyEnabled && !isQuietTime) {
          // ✅ 카드 데이터 확인 (카드 데이터가 있을 때만 알림 생성)
          if (!todayCards[hour]) {
            console.log(`⏭️ ${hour}시 카드 없음 - 알림 스케줄 스킵`);
            continue; // 카드가 없으면 해당 시간대 알림 건너뛰기
          }

          // 알림 메시지 생성 (카드 정보 포함)
          const card = todayCards[hour];
          const cardName = getCardNameForNotification(card);
          const cardMeaning = getCardMeaningForNotification(card);
          const hourDisplay = formatHourForNotification(hour);

          // 카드 정보로 알림 메시지 생성:
          // 한국어: "[14시] 여교황 - 직관과 내면의 지혜"
          // 영어: "[2PM] The High Priestess - Intuition and inner wisdom"
          // 일본어: "[14時] 女教皇 - 直感と内なる知恵"
          const notificationBody = `[${hourDisplay}] ${cardName} - ${cardMeaning}`;
          console.log(`📋 ${hour}시 알림 메시지: ${cardName}`);

          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: '🔮 타로 타이머',
                body: notificationBody,
                data: {
                  type: 'hourly',
                  hour: hour,
                  timestamp: triggerDate.getTime(),
                  cardId: todayCards?.[hour]?.id || null
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority?.HIGH || 'high',
                categoryIdentifier: 'tarot-hourly',
              },
              trigger: triggerDate,
              identifier: `hourly-${triggerDate.getTime()}`, // 고유 식별자 추가
            });
            scheduledCount++;

            // 상세 로그 추가
            const triggerTime = `${triggerDate.getFullYear()}-${(triggerDate.getMonth()+1).toString().padStart(2,'0')}-${triggerDate.getDate().toString().padStart(2,'0')} ${hour.toString().padStart(2,'0')}:00`;
            console.log(`✅ [${scheduledCount}] ${hour}시 알림 스케줄 성공 (발송 예정: ${triggerTime})`);
          } catch (scheduleError) {
            console.error(`❌ 알림 스케줄 실패: ${hour}시`, scheduleError);
            // 개별 스케줄 실패는 전체를 중단하지 않음
          }
        } else {
          const reason = !settingsToUse.hourlyEnabled ? '시간별 알림 비활성화' : '조용한 시간';
          console.log(`⏭️ 스케줄 스킵: ${hour}시 (${reason})`);
        }
      }

      // 4. 자정 리셋 알림 (내일 자정) - 다국어 지원
      if (scheduledCount < maxNotifications) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // 다국어 메시지
        const midnightMessages = {
          ko: {
            title: '🌙 새로운 하루',
            body: '어제의 카드가 초기화되었습니다. 오늘의 24시간 카드를 새로 뽑아보세요!'
          },
          en: {
            title: '🌙 New Day',
            body: 'Yesterday\'s cards have been reset. Draw your new 24-hour cards for today!'
          },
          ja: {
            title: '🌙 新しい一日',
            body: '昨日のカードがリセットされました。今日の24時間カードを新しく引いてみましょう！'
          }
        };

        const message = midnightMessages[currentLang as keyof typeof midnightMessages] || midnightMessages.ko;

        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: message.title,
              body: message.body,
              data: {
                type: 'midnight_reset',
                timestamp: tomorrow.getTime()
              },
              sound: true,
              priority: Notifications.AndroidNotificationPriority?.DEFAULT || 'default',
              categoryIdentifier: 'tarot-midnight',
            },
            trigger: tomorrow,
            identifier: `midnight-${tomorrow.getTime()}`,
          });
          scheduledCount++;
          console.log('✅ 자정 리셋 알림 스케줄 성공');
        } catch (midnightError) {
          console.error('❌ 자정 알림 스케줄 실패:', midnightError);
        }
      }

      // 5. 최종 검증 및 상태 업데이트
      setLastScheduleTime(Date.now());

      // 실제 스케줄된 알림 개수 확인
      const actualScheduled = await verifyScheduledNotifications();

      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎯 스케줄링 완료 요약`);
      console.log(`   • 예상 스케줄: ${scheduledCount}개`);
      console.log(`   • 실제 확인: ${actualScheduled}개`);
      console.log(`   • 시간별 알림 활성화: ${settingsToUse.hourlyEnabled ? '✅' : '❌'}`);
      console.log(`   • 조용한 시간 활성화: ${settingsToUse.quietHoursEnabled ? '✅' : '❌'}`);
      if (settingsToUse.quietHoursEnabled) {
        console.log(`   • 조용한 시간: ${settingsToUse.quietHoursStart}:00 ~ ${settingsToUse.quietHoursEnd}:00`);
      }
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      setIsScheduling(false);
      return scheduledCount > 0;

    } catch (error) {
      console.error('❌ 강화된 알림 스케줄링 실패:', error);
      setIsScheduling(false);
      return false;
    }
  };

  // 시간별 알림 스케줄링 (로컬 + 백엔드)
  const scheduleHourlyNotifications = async () => {
    if (!hasPermission) {
      console.log('Cannot schedule notifications: no permission');
      return;
    }

    if (!Notifications) {
      console.log('Notifications module not available');
      return;
    }

    try {
      // 1. 기존 알림 모두 취소
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all existing notifications');

      // 2. 현재 설정으로 알림 스케줄
      await scheduleHourlyNotificationsWithSettings(settings);

      // 3. 백엔드 연동 (있다면)
      if (isAuthenticated && expoPushToken) {
        try {
          await fetch(`${getApiUrl()}/api/notifications/schedule-hourly`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
          });
          console.log('Backend notification scheduling also requested');
        } catch (error) {
          console.log('Backend not available, using local notifications only');
        }
      }

    } catch (error) {
      console.error('Failed to schedule hourly notifications:', error);
    }
  };

  // 시간별 알림 취소 (로컬 + 백엔드)
  const cancelHourlyNotifications = async () => {
    try {
      // 1. 로컬 알림 모두 취소
      if (Notifications) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All local notifications cancelled');
      }

      // 2. 백엔드 알림 취소 (있다면)
      if (isAuthenticated) {
        try {
          await fetch(`${getApiUrl()}/api/notifications/cancel-hourly`, {
            method: 'DELETE',
            headers: {
              ...getAuthHeaders(),
            },
          });
          console.log('Backend notifications also cancelled');
        } catch (error) {
          console.log('Backend not available, local notifications cancelled');
        }
      }
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  };

  // 백엔드에 토큰 등록
  const registerTokenWithBackend = async () => {
    if (!expoPushToken) {
      console.log('No push token to register');
      return;
    }

    if (!isAuthenticated) {
      console.log('User not authenticated, skipping token registration');
      return;
    }

    try {
      await fetch(`${getApiUrl()}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          expoPushToken,
          deviceInfo: {
            platform: Platform.OS,
            deviceType: Device?.deviceType || 'unknown',
            deviceName: Device?.deviceName || 'unknown',
          }
        }),
      });
      console.log('Push token registered with backend');
    } catch (error) {
      console.error('Failed to register push token with backend:', error);
    }
  };

  // 백엔드에서 토큰 제거
  const unregisterTokenFromBackend = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping token unregistration');
      return;
    }

    try {
      await fetch(`${getApiUrl()}/api/notifications/unregister-token`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });
      console.log('Push token unregistered from backend');
    } catch (error) {
      console.error('Failed to unregister push token from backend:', error);
    }
  };

  const contextValue: NotificationContextType = {
    expoPushToken,
    notification,
    hasPermission,
    settings,
    updateSettings,
    requestPermission,
    sendTestNotification,
    scheduleHourlyNotifications,
    cancelHourlyNotifications,
    registerTokenWithBackend,
    unregisterTokenFromBackend,
    // 고급 진단 기능
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

export default NotificationProvider;