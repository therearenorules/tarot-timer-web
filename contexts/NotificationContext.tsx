import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 알림 설정 인터페이스
interface NotificationSettings {
  hourlyEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
  weekendEnabled: boolean;
  notificationTypes: string[];
}

// 알림 컨텍스트 인터페이스
interface NotificationContextType {
  // 알림 권한 및 토큰
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
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
}

// 기본 알림 설정
const DEFAULT_SETTINGS: NotificationSettings = {
  hourlyEnabled: false,
  quietHoursStart: 22, // 22:00 (오후 10시)
  quietHoursEnd: 8,    // 08:00 (오전 8시)
  weekendEnabled: true,
  notificationTypes: ['hourly', 'daily_save', 'midnight_reset']
};

// 알림 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

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
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

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
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
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
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tarot-hourly', {
      name: '시간별 타로 알림',
      description: '매시간 새로운 타로 카드 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7b2cbf',
    });

    await Notifications.setNotificationChannelAsync('tarot-midnight', {
      name: '자정 카드 리셋',
      description: '자정에 새로운 24시간 카드 세트 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 1000],
      lightColor: '#f4d03f',
    });

    await Notifications.setNotificationChannelAsync('tarot-save', {
      name: '일기 저장 알림',
      description: '일일 타로 세션 저장 알림',
      importance: Notifications.AndroidImportance.LOW,
      lightColor: '#d4b8ff',
    });
  }

  return token;
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  // 컴포넌트 마운트 시 초기 설정
  useEffect(() => {
    // 푸시 토큰 등록
    registerForPushNotificationsAsync()
      .then(token => {
        setExpoPushToken(token);
        setHasPermission(!!token);
      })
      .catch(error => {
        console.error('Error registering for push notifications:', error);
      });

    // 알림 리스너 설정
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // 알림 클릭 시 특정 화면으로 네비게이션 가능
    });

    // 저장된 설정 로드
    loadNotificationSettings();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // 저장된 알림 설정 로드
  const loadNotificationSettings = async () => {
    // TODO: AsyncStorage에서 설정 로드
    // const savedSettings = await AsyncStorage.getItem('notificationSettings');
    // if (savedSettings) {
    //   setSettings(JSON.parse(savedSettings));
    // }
  };

  // 알림 설정 업데이트
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // TODO: AsyncStorage에 설정 저장
    // await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));

    // 백엔드에 설정 동기화
    if (expoPushToken) {
      try {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            // TODO: JWT 토큰 추가
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
    try {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
      const granted = !!token;
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // 테스트 알림 발송
  const sendTestNotification = async () => {
    if (!hasPermission) {
      console.log('No notification permission');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔮 타로 타이머 테스트',
        body: '알림이 정상적으로 작동하고 있습니다!',
        data: {
          type: 'test',
          timestamp: Date.now()
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { seconds: 1 },
    });
  };

  // 시간별 알림 스케줄링
  const scheduleHourlyNotifications = async () => {
    if (!hasPermission || !expoPushToken) {
      console.log('Cannot schedule notifications: no permission or token');
      return;
    }

    // 로컬 스케줄링은 제한적이므로 백엔드에 요청
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/schedule-hourly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: JWT 토큰 추가
        },
      });
      console.log('Hourly notifications scheduled via backend');
    } catch (error) {
      console.error('Failed to schedule hourly notifications:', error);
    }
  };

  // 시간별 알림 취소
  const cancelHourlyNotifications = async () => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/cancel-hourly`, {
        method: 'DELETE',
        headers: {
          // TODO: JWT 토큰 추가
        },
      });
      console.log('Hourly notifications cancelled via backend');
    } catch (error) {
      console.error('Failed to cancel hourly notifications:', error);
    }
  };

  // 백엔드에 토큰 등록
  const registerTokenWithBackend = async () => {
    if (!expoPushToken) {
      console.log('No push token to register');
      return;
    }

    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: JWT 토큰 추가
        },
        body: JSON.stringify({
          expoPushToken,
          deviceInfo: {
            platform: Platform.OS,
            deviceType: Device.deviceType,
            deviceName: Device.deviceName,
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
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/unregister-token`, {
        method: 'DELETE',
        headers: {
          // TODO: JWT 토큰 추가
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
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;