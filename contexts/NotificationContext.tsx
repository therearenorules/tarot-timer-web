import React, { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { useSafeState } from '../hooks/useSafeState';
import {
  NotificationSettings,
  NotificationContextType,
  DEFAULT_SETTINGS,
  permissionManager,
  notificationScheduler,
  Notifications,
  isMobileEnvironment
} from './notifications';

// API URL 헬퍼 함수
const getApiUrl = (): string => {
  let Constants: any = null;
  try {
    Constants = require('expo-constants');
  } catch (e) {
    console.warn('expo-constants not available');
  }
  const apiUrl = Constants?.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  return apiUrl;
};

// 알림 동작 설정 (모바일 환경에서만)
if (Notifications && isMobileEnvironment) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority?.HIGH,
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

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const [expoPushToken, setExpoPushToken] = useSafeState<string | null>(null);
  const [notification, setNotification] = useSafeState<any | null>(null);
  const [hasPermission, setHasPermission] = useSafeState(Platform.OS === 'web' ? false : false);
  const [settings, setSettings] = useSafeState<NotificationSettings>(DEFAULT_SETTINGS);

  // 알림 상태 추적
  const [lastScheduleTime, setLastScheduleTime] = useSafeState<number | null>(null);
  const [scheduleAttempts, setScheduleAttempts] = useSafeState<number>(0);
  const [isScheduling, setIsScheduling] = useSafeState<boolean>(false);

  // hasPermission ref로 관리 (AppState 리스너 재생성 방지)
  const hasPermissionRef = useRef<boolean>(Platform.OS === 'web' ? false : false);
  const checkRealTimePermissionRef = useRef<() => Promise<boolean>>(undefined);

  // ============ 권한 관리 ============

  /**
   * 실시간 권한 상태 체크
   */
  const checkRealTimePermission = useCallback(async (): Promise<boolean> => {
    const actualPermission = await permissionManager.checkPermission();

    // Context 상태와 실제 권한이 다르면 동기화
    if (hasPermissionRef.current !== actualPermission) {
      console.log(`🔄 권한 상태 불일치 감지: Context=${hasPermissionRef.current}, 실제=${actualPermission}`);
      hasPermissionRef.current = actualPermission;
      setHasPermission(actualPermission);

      // 권한이 꺼진 경우 스케줄된 알림 정리
      if (!actualPermission) {
        console.log('📵 권한 상실 감지 - 스케줄된 알림 정리');
        await permissionManager.cancelAllScheduledNotifications();
      }
    }

    return actualPermission;
  }, [setHasPermission]);

  /**
   * 알림 권한 요청
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isMobileEnvironment) {
      console.log('Non-mobile platform: Push notifications not supported');
      return false;
    }

    try {
      const token = await permissionManager.registerForPushNotifications();
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
              await scheduleHourlyNotificationsInternal(savedSettings);
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

  // ============ 설정 관리 ============

  /**
   * 저장된 알림 설정 로드
   */
  const loadNotificationSettings = async () => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
          console.log('✅ 저장된 알림 설정 로드 성공 (localStorage):', parsedSettings);
        }
      } else if (isMobileEnvironment) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
          console.log('✅ 저장된 알림 설정 로드 성공 (AsyncStorage):', parsedSettings);
        }
      }
    } catch (error) {
      console.error('❌ 알림 설정 로드 오류:', error);
    }
  };

  /**
   * 동기적으로 설정 로드 (자동 스케줄링용)
   */
  const loadNotificationSettingsSync = async (): Promise<NotificationSettings> => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          return { ...DEFAULT_SETTINGS, ...parsedSettings };
        }
      } else if (isMobileEnvironment) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          return { ...DEFAULT_SETTINGS, ...parsedSettings };
        }
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('❌ 알림 설정 동기 로드 오류:', error);
      return DEFAULT_SETTINGS;
    }
  };

  /**
   * 알림 설정 업데이트
   */
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // 설정 저장
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
        console.log('✅ localStorage에 알림 설정 저장 완료');
      } else if (isMobileEnvironment) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
        console.log('✅ AsyncStorage에 알림 설정 저장 완료');
      }
    } catch (error) {
      console.error('❌ 알림 설정 저장 오류:', error);
    }

    // 설정 변경 시 알림 자동 재스케줄링
    if (hasPermission && isMobileEnvironment && Notifications) {
      try {
        if ('hourlyEnabled' in newSettings ||
            'quietHoursEnabled' in newSettings ||
            'quietHoursStart' in newSettings ||
            'quietHoursEnd' in newSettings) {
          console.log('알림 설정 변경됨 - 자동 재스케줄링 시작');

          await permissionManager.cancelAllScheduledNotifications();

          if (updatedSettings.hourlyEnabled) {
            await scheduleHourlyNotificationsInternal(updatedSettings);
          }

          console.log('✅ 알림 재스케줄링 완료');
        }
      } catch (error) {
        console.error('❌ 알림 재스케줄링 오류:', error);
      }
    }

    // 백엔드에 설정 동기화
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

  // ============ 알림 스케줄링 ============

  /**
   * 내부 스케줄링 헬퍼
   */
  const scheduleHourlyNotificationsInternal = async (settingsToUse: NotificationSettings): Promise<boolean> => {
    return await notificationScheduler.scheduleNotifications(
      settingsToUse,
      setIsScheduling,
      setLastScheduleTime
    );
  };

  /**
   * 시간별 알림 스케줄링 (공개 API)
   */
  const scheduleHourlyNotifications = async () => {
    if (!hasPermission || !Notifications) {
      console.log('Cannot schedule notifications: no permission or module unavailable');
      return;
    }

    try {
      setScheduleAttempts(prev => prev + 1);
      await scheduleHourlyNotificationsInternal(settings);

      // 백엔드 연동
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

  /**
   * 시간별 알림 취소
   */
  const cancelHourlyNotifications = async () => {
    try {
      await permissionManager.cancelAllScheduledNotifications();

      // 백엔드 알림 취소
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

  /**
   * 테스트 알림 발송
   */
  const sendTestNotification = async () => {
    // 권한이 없으면 먼저 권한 요청
    if (!hasPermission) {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        console.log('Permission denied, cannot send test notification');
        return;
      }
    }

    await notificationScheduler.sendTestNotification();
  };

  /**
   * 스케줄된 알림 상태 확인
   */
  const verifyScheduledNotifications = async (): Promise<number> => {
    return await permissionManager.getScheduledNotificationCount('hourly');
  };

  // ============ 백엔드 연동 ============

  /**
   * 백엔드에 토큰 등록
   */
  const registerTokenWithBackend = async () => {
    if (!expoPushToken || !isAuthenticated) {
      console.log('No push token or not authenticated');
      return;
    }

    try {
      let Device: any = null;
      try {
        Device = require('expo-device');
      } catch (e) {
        console.warn('expo-device not available');
      }

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

  /**
   * 백엔드에서 토큰 제거
   */
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

  // ============ Effect Hooks ============

  // checkRealTimePermission ref 업데이트
  useEffect(() => {
    checkRealTimePermissionRef.current = checkRealTimePermission;
  }, [checkRealTimePermission]);

  // 앱 상태 변화 감지 및 권한 재확인
  useEffect(() => {
    if (!isMobileEnvironment || !Notifications) return;

    let appStateSubscription: any = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    try {
      const { AppState } = require('react-native');

      const handleAppStateChange = (nextAppState: string) => {
        try {
          if (nextAppState === 'active') {
            console.log('📱 앱 포어그라운드 복귀 - 권한 상태 재확인');

            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }

            timeoutId = setTimeout(() => {
              if (!isMounted) {
                console.log('⚠️ 컴포넌트 언마운트됨 - 권한 체크 스킵');
                return;
              }

              if (checkRealTimePermissionRef.current) {
                checkRealTimePermissionRef.current().catch((error) => {
                  if (isMounted) {
                    console.warn('⚠️ 포어그라운드 복귀 시 권한 체크 실패:', error);
                  }
                });
              }
            }, 1000);
          }
        } catch (error) {
          console.error('❌ AppState 핸들러 에러:', error);
        }
      };

      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
      console.log('✅ NotificationContext AppState 리스너 설정 완료');
    } catch (error) {
      console.warn('⚠️ NotificationContext AppState 리스너 설정 실패:', error);
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (appStateSubscription?.remove) {
        appStateSubscription.remove();
        console.log('🧹 NotificationContext AppState 리스너 정리 완료');
      }
    };
  }, []);

  // 컴포넌트 마운트 시 초기 설정
  useEffect(() => {
    const safeInitialize = async () => {
      try {
        // 웹 환경에서는 설정만 로드
        if (!isMobileEnvironment) {
          console.log('Non-mobile platform detected, skipping push token registration');
          await loadNotificationSettings().catch(err => {
            console.error('❌ 설정 로드 실패 (무시):', err);
          });
          return;
        }

        // Notifications 모듈이 없으면 설정만 로드
        if (!Notifications) {
          console.log('Notifications module not available, loading settings only');
          await loadNotificationSettings().catch(err => {
            console.error('❌ 설정 로드 실패 (무시):', err);
          });
          return;
        }

        // 초기화: 권한 체크와 토큰 등록
        const initializeNotifications = async () => {
          try {
            // 1. 권한 체크
            const { status } = await Notifications.getPermissionsAsync();
            const hasNotificationPermission = status === 'granted';

            console.log('🔔 알림 권한 상태:', status, hasNotificationPermission ? '✅ 권한 있음' : '❌ 권한 없음');
            setHasPermission(hasNotificationPermission);

            // 2. 권한이 있으면 토큰 등록 시도
            if (hasNotificationPermission) {
              try {
                const token = await permissionManager.registerForPushNotifications();
                setExpoPushToken(token);

                if (token) {
                  console.log('🔔 토큰 등록 완료 - 자동 알림 스케줄링 시작');
                  setTimeout(async () => {
                    try {
                      const savedSettings = await loadNotificationSettingsSync();
                      if (savedSettings.hourlyEnabled) {
                        await scheduleHourlyNotificationsInternal(savedSettings);
                        console.log('✅ 자동 알림 스케줄링 완료');
                      }
                    } catch (error) {
                      console.error('❌ 자동 알림 스케줄링 실패 (무시):', error);
                    }
                  }, 1000);
                }
              } catch (tokenError) {
                console.error('❌ 토큰 등록 오류 (무시):', tokenError);
              }
            }

            // 3. 설정 로드
            await loadNotificationSettings().catch(err => {
              console.error('❌ 설정 로드 실패 (무시):', err);
            });
          } catch (error) {
            console.error('❌ 알림 초기화 실패 (무시):', error);
            await loadNotificationSettings().catch(err => {
              console.error('❌ 설정 로드 실패 (무시):', err);
            });
          }
        };

        await initializeNotifications();
      } catch (outerError) {
        console.error('❌ NotificationContext 초기화 최상위 오류 (무시):', outerError);
      }
    };

    safeInitialize();

    // 알림 리스너 설정
    let notificationListener: any = null;
    let responseListener: any = null;

    try {
      if (Notifications?.addNotificationReceivedListener && Notifications?.addNotificationResponseReceivedListener) {
        notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
          console.log('Notification received:', notification);
          setNotification(notification);
        });

        responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
          console.log('Notification response:', response);
        });
      }
    } catch (error) {
      console.warn('Failed to set up notification listeners:', error);
    }

    // 저장된 설정 로드
    loadNotificationSettings();

    return () => {
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

  // ============ Context Value ============

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
