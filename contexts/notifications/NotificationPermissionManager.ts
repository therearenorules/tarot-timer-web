import { Platform } from 'react-native';

// Expo 모듈 동적 로드
let Notifications: any = null;
let Device: any = null;
let Constants: any = null;
let SchedulableTriggerInputTypes: any = null;
let AndroidImportance: any = null;

const isMobileEnvironment = Platform.OS === 'ios' || Platform.OS === 'android';

if (isMobileEnvironment) {
  try {
    Notifications = require('expo-notifications');
    Device = require('expo-device');
    Constants = require('expo-constants');
    // ✅ FIX: SchedulableTriggerInputTypes 명시적 로드
    SchedulableTriggerInputTypes = Notifications.SchedulableTriggerInputTypes;
    AndroidImportance = Notifications.AndroidImportance;
    console.log('✅ Expo notification 모듈 로드 성공');
    console.log(`   • SchedulableTriggerInputTypes: ${SchedulableTriggerInputTypes ? '✅' : '❌'}`);
  } catch (error) {
    console.warn('⚠️ Expo notification modules not available:', error);
  }
} else {
  console.log('🌐 웹 환경: Expo notification 모듈 비활성화');
}

/**
 * 알림 권한 관리 클래스
 * - 권한 요청
 * - 푸시 토큰 등록
 * - Android 채널 설정
 */
export class NotificationPermissionManager {
  private static instance: NotificationPermissionManager;

  private constructor() {}

  static getInstance(): NotificationPermissionManager {
    if (!NotificationPermissionManager.instance) {
      NotificationPermissionManager.instance = new NotificationPermissionManager();
    }
    return NotificationPermissionManager.instance;
  }

  /**
   * 알림 권한 확인 (실시간)
   */
  async checkPermission(): Promise<boolean> {
    if (!isMobileEnvironment || !Notifications) {
      return false;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ 권한 확인 실패:', error);
      return false;
    }
  }

  /**
   * Expo Push Token 등록
   */
  async registerForPushNotifications(): Promise<string | null> {
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
        await this.setupAndroidChannels();
      }
    } catch (error) {
      console.error('Error in registerForPushNotificationsAsync:', error);
      return null;
    }

    return token;
  }

  /**
   * Android 알림 채널 설정
   */
  private async setupAndroidChannels(): Promise<void> {
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

  /**
   * 모든 스케줄된 알림 취소
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    if (!Notifications) {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ 모든 스케줄된 알림 취소 완료');
    } catch (error) {
      console.warn('⚠️ 알림 취소 실패:', error);
    }
  }

  /**
   * 스케줄된 알림 개수 확인
   */
  async getScheduledNotificationCount(type?: string): Promise<number> {
    if (!isMobileEnvironment || !Notifications) {
      return 0;
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      if (!type) {
        return scheduledNotifications.length;
      }

      const filtered = scheduledNotifications.filter((n: any) =>
        n.content.data?.type === type
      );
      return filtered.length;
    } catch (error) {
      console.error('❌ 스케줄된 알림 확인 실패:', error);
      return 0;
    }
  }
}

// 싱글톤 인스턴스 export
export const permissionManager = NotificationPermissionManager.getInstance();

// Notifications 모듈 export (다른 파일에서 사용)
export { Notifications, isMobileEnvironment, SchedulableTriggerInputTypes, AndroidImportance };
