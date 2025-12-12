import React, { useEffect } from 'react';
import { useSafeState } from '../../hooks/useSafeState';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Switch,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  Spacing,
  BorderRadius
} from '../DesignSystem';
import LanguageSelector from '../LanguageSelector';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePremium } from '../../contexts/PremiumContext';
import LocalDataManager, { LocalDataStatus } from '../../utils/localDataManager';
import LocalStorageManager, { PremiumStatus } from '../../utils/localStorage';
import PremiumTest from '../PremiumTest';
// BannerAd 제거: 전면광고만 사용으로 unitId 크래시 방지
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseDebugPanel } from '../SupabaseDebugPanel';
import PromoCodeSection from '../PromoCodeSection';
// 조건부 import - 모바일 환경에서만 로드
let SubscriptionPlans: any = null;
let SubscriptionManagement: any = null;

if (Platform.OS !== 'web') {
  try {
    const subscriptionPlans = require('../subscription/SubscriptionPlans');
    const subscriptionManagement = require('../subscription/SubscriptionManagement');
    SubscriptionPlans = subscriptionPlans.default || subscriptionPlans.SubscriptionPlans;
    SubscriptionManagement = subscriptionManagement.default || subscriptionManagement.SubscriptionManagement;
    console.log('✅ 구독 컴포넌트 로드 성공');
  } catch (error) {
    console.error('❌ 구독 컴포넌트 로드 실패:', error);
    // 사용자에게 알림 표시
    Alert.alert(
      '오류',
      '구독 기능을 불러오는데 실패했습니다. 앱을 다시 시작해주세요.',
      [{ text: '확인' }]
    );
  }
}

// 알림 진단 컴포넌트 (개발 모드 전용)
const NotificationDiagnostics: React.FC = () => {
  const {
    hasPermission,
    lastScheduleTime,
    scheduleAttempts,
    isScheduling,
    checkRealTimePermission,
    verifyScheduledNotifications,
    expoPushToken
  } = useNotifications();

  const [diagnostics, setDiagnostics] = useSafeState({
    realTimePermission: null as boolean | null,
    scheduledCount: null as number | null,
    checking: false
  });

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, checking: true }));

    try {
      const realPermission = await checkRealTimePermission();
      const scheduledCount = await verifyScheduledNotifications();

      setDiagnostics({
        realTimePermission: realPermission,
        scheduledCount: scheduledCount,
        checking: false
      });
    } catch (error) {
      console.error('진단 실패:', error);
      setDiagnostics(prev => ({ ...prev, checking: false }));
    }
  };

  return (
    <View style={[styles.settingItem, { borderTopWidth: 2, borderTopColor: '#ff6b6b' }]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: '#ff6b6b' }]}>🔧 알림 진단 (개발용)</Text>
        <Text style={styles.settingSubtitle}>
          권한: {hasPermission ? '✅' : '❌'} |
          실제: {diagnostics.realTimePermission === null ? '?' : (diagnostics.realTimePermission ? '✅' : '❌')} |
          스케줄됨: {diagnostics.scheduledCount ?? '?'}개{'\n'}
          토큰: {expoPushToken ? '✅' : '❌'} |
          시도: {scheduleAttempts}회 |
          진행중: {isScheduling ? '⏳' : '⭕'}{'\n'}
          마지막: {lastScheduleTime ? new Date(lastScheduleTime).toLocaleTimeString() : '없음'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.testButton, { marginTop: 0 }]}
        onPress={runDiagnostics}
        disabled={diagnostics.checking}
      >
        <Text style={styles.testButtonText}>
          {diagnostics.checking ? '검사중...' : '진단 실행'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const SettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Context hooks
  const {
    settings: notificationSettings,
    hasPermission,
    requestPermission,
    sendTestNotification,
    updateSettings: updateNotificationSettings
  } = useNotifications();
  const {
    premiumStatus,
    isPremium,
    isSubscriptionActive,
    daysUntilExpiry,
    isLoading: premiumLoading,
    refreshStatus
  } = usePremium();

  const [localDataStatus, setLocalDataStatus] = useSafeState<LocalDataStatus>({
    totalSessions: 0,
    totalJournalEntries: 0,
    storageUsed: 0
  });
  const [cloudBackupEnabled, setCloudBackupEnabled] = useSafeState(false);
  const [syncStatus, setSyncStatus] = useSafeState({
    lastSyncTime: null as number | null,
    pendingChanges: 0,
    syncInProgress: false,
    lastError: null as string | null
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useSafeState(false);
  const [showManagementModal, setShowManagementModal] = useSafeState(false);
  const [adminClickCount, setAdminClickCount] = useSafeState(0);
  const [showCrashLogs, setShowCrashLogs] = useSafeState(false);
  const [crashLogs, setCrashLogs] = useSafeState<any[]>([]);
  const [debugTapCount, setDebugTapCount] = useSafeState(0);
  const [showDebugPanel, setShowDebugPanel] = useSafeState(false);

  // Context에서 가져온 값들을 로컬 상태 대신 사용
  const notificationsEnabled = hasPermission;
  const hourlyNotifications = notificationSettings?.hourlyEnabled ?? true;
  const dailyTaroReminder = notificationSettings?.dailyReminderEnabled ?? true;
  const midnightReset = notificationSettings?.midnightResetEnabled ?? true;
  const quietHoursEnabled = notificationSettings?.quietHoursEnabled ?? true;
  const quietHoursStart = notificationSettings?.quietHoursStart ?? 22;
  const quietHoursEnd = notificationSettings?.quietHoursEnd ?? 8;

  // 로컬 상태는 Context에 없는 항목들만 유지
  const [saveReminders, setSaveReminders] = useSafeState(true);

  // Modal state
  const [showQuietHoursModal, setShowQuietHoursModal] = useSafeState(false);
  const [tempQuietHours, setTempQuietHours] = useSafeState({
    start: quietHoursStart,
    end: quietHoursEnd,
  });

  // 로컬 데이터 상태 로드
  useEffect(() => {
    loadLocalDataStatus();
  }, []);

  const loadLocalDataStatus = async () => {
    try {
      const status = await LocalDataManager.getLocalDataStatus();
      setLocalDataStatus(status);
      setCloudBackupEnabled(false); // 로컬 전용으로 변경
    } catch (error) {
      console.error('로컬 데이터 상태 로드 오류:', error);
    }
  };

  const loadCrashLogs = async () => {
    try {
      const logsJson = await AsyncStorage.getItem('CRASH_LOGS');
      const logs = logsJson ? JSON.parse(logsJson) : [];
      setCrashLogs(logs);
    } catch (error) {
      console.error('크래시 로그 로드 실패:', error);
      setCrashLogs([]);
    }
  };

  const clearCrashLogs = async () => {
    try {
      await AsyncStorage.removeItem('CRASH_LOGS');
      setCrashLogs([]);
      Alert.alert('완료', '크래시 로그가 삭제되었습니다.');
    } catch (error) {
      console.error('크래시 로그 삭제 실패:', error);
      Alert.alert('오류', '크래시 로그 삭제에 실패했습니다.');
    }
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionModal(false);
    Alert.alert(
      t('settings.premium.subscriptionCompleteTitle'),
      t('settings.premium.subscriptionCompleteMessage'),
      [{ text: t('common.ok') }]
    );
  };

  const handleRequestPermissions = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        Alert.alert(t('settings.notifications.permissionGranted'), t('settings.notifications.configureMessage'));
      } else {
        Alert.alert(t('settings.notifications.permissionDenied'));
      }
    } catch (error) {
      Alert.alert(t('settings.notifications.permissionError'));
    }
  };

  const handleSendTestNotification = async () => {
    try {
      console.log('테스트 알림 버튼 클릭됨', { hasPermission, notificationsEnabled });

      // 권한이 없으면 먼저 권한 요청
      if (!notificationsEnabled) {
        console.log('권한이 없어서 권한 요청 중...');
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(t('settings.notifications.permissionRequired'), t('settings.notifications.permissionFirst'));
          return;
        }
        console.log('권한 획득 성공');
      }

      await sendTestNotification();
      Alert.alert(t('settings.notifications.testTitle'), t('settings.notifications.testMessage'));
      console.log('테스트 알림 발송 성공');
    } catch (error) {
      console.error('테스트 알림 실패:', error);
      Alert.alert(t('settings.notifications.testError'));
    }
  };

  const handleSaveQuietHours = async () => {
    try {
      await updateNotificationSettings({
        quietHoursStart: tempQuietHours.start,
        quietHoursEnd: tempQuietHours.end
      });
      setShowQuietHoursModal(false);
      Alert.alert(t('settings.notifications.saveComplete'), t('settings.notifications.quietHoursSaved'));
    } catch (error) {
      Alert.alert(t('settings.notifications.saveError'));
    }
  };

  const handleToggleCloudBackup = async (enabled: boolean) => {
    // 로컬 전용 모드에서는 클라우드 백업 비활성화
    Alert.alert(
      '로컬 저장 전용',
      '현재 앱은 로컬 저장 전용으로 설정되어 있습니다. 모든 데이터는 기기에만 저장됩니다.',
      [{ text: '확인' }]
    );
  };

  const handleManualSync = async () => {
    // 로컬 전용 모드에서는 동기화 불가
    Alert.alert(
      '로컬 저장 전용',
      '현재 앱은 로컬 저장만 사용합니다. 데이터 백업은 내보내기 기능을 이용해주세요.',
      [{ text: '확인' }]
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = await LocalDataManager.exportData();
      // 실제 구현에서는 파일 공유 API 사용
      Alert.alert(
        '데이터 내보내기',
        '데이터를 성공적으로 내보냈습니다. (개발 중: 파일 저장 기능)'
      );
    } catch (error) {
      console.error('데이터 내보내기 오류:', error);
      Alert.alert('오류', '데이터 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleImportData = () => {
    Alert.alert(
      '데이터 가져오기',
      '백업 파일에서 데이터를 가져오시겠습니까? 현재 데이터는 백업 데이터로 덮어씌워집니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '가져오기',
          onPress: () => {
            // 실제 구현에서는 파일 선택 API 사용
            Alert.alert('개발 중', '파일 선택 기능을 개발 중입니다.');
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom
      }}
      showsVerticalScrollIndicator={false}
    >

      {/* 프리미엄 구독 관리 섹션 - Android에서 활성화 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>👑</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('settings.premium.title')}</Text>
          {/* Android: 준비중 배지 제거, 웹: 준비중 표시 */}
          {Platform.OS === 'web' && (
            <View style={[styles.comingSoonBadge]}>
              <Text style={styles.comingSoonText}>{t('common.comingSoon')}</Text>
            </View>
          )}
          {/* iOS/Android: 프리미엄 활성 상태 표시 */}
          {Platform.OS !== 'web' && isPremium && (
            <View style={[styles.activeBadge, { backgroundColor: '#4caf50' }]}>
              <Text style={styles.activeBadgeText}>{t('settings.premium.active')}</Text>
            </View>
          )}
        </View>

        {/* 안드로이드 베타 테스터 배너 */}
        {Platform.OS === 'android' && (
          <View style={styles.betaTesterBanner}>
            <Text style={styles.betaTesterTitle}>{t('settings.betaTester.title')}</Text>
            <Text style={styles.betaTesterMessage}>{t('settings.betaTester.message')}</Text>
          </View>
        )}

        {/* 프리미엄 사용자면 구독 관리, 아니면 업그레이드 */}
        {isPremium ? (
          // 프리미엄 활성 사용자 - 구독 관리
          <View style={styles.premiumStatusContainer}>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumStatusTitle}>{t('settings.premium.subscriptionStatus')}</Text>
              <Text style={styles.premiumStatusValue}>
                {isSubscriptionActive ? t('settings.premium.active') : t('settings.premium.expired')}
              </Text>
            </View>
            {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumStatusTitle}>{t('settings.premium.remainingPeriod')}</Text>
                <Text style={styles.premiumStatusValue}>
                  {t('settings.premium.daysRemaining', { days: daysUntilExpiry })}
                </Text>
              </View>
            )}
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.manageSubscriptionButton}
                onPress={() => setShowManagementModal(true)}
              >
                <Text style={styles.manageSubscriptionButtonText}>
                  {t('settings.premium.manageSubscription')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // 비프리미엄 사용자 - 업그레이드 안내
          <View style={styles.premiumFeatures}>
            <View style={styles.featureRow}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('settings.premium.features.unlimitedTarotStorage')}</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('settings.premium.features.removeAds')}</Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('settings.premium.features.premiumSpreads')}</Text>
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                if (Platform.OS === 'web') {
                  Alert.alert(
                    t('settings.premium.comingSoonTitle'),
                    t('settings.premium.comingSoonDesc'),
                    [{ text: t('common.ok') }]
                  );
                } else {
                  setShowSubscriptionModal(true);
                }
              }}
            >
              <Text style={styles.upgradeButtonText}>
                {Platform.OS === 'web' ? t('settings.premium.comingSoon') : t('settings.premium.upgradeButton')}
              </Text>
            </TouchableOpacity>

            {/* 프로모션 코드 입력 섹션 */}
            <PromoCodeSection onApplySuccess={refreshStatus} />
          </View>
        )}
      </View>

      {/* 화면 및 테마 설정 */}
      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => {
            const newCount = debugTapCount + 1;
            setDebugTapCount(newCount);

            if (newCount >= 5) {
              setShowDebugPanel(true);
              setDebugTapCount(0);
              console.log('🔍 Supabase Debug Panel 활성화!');
            }

            // 2초 후 카운트 리셋
            setTimeout(() => setDebugTapCount(0), 2000);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>🎨</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('settings.display.title')}</Text>
        </TouchableOpacity>

        {/* 타로 덱 테마 선택 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.display.tarotDeckTheme')}</Text>
            <Text style={styles.settingSubtitle}>{t('settings.display.tarotDeckThemeDescription')}</Text>
          </View>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>{t('common.comingSoon')}</Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <LanguageSelector
            compact={false}
            showLabel={false}
            style={styles.languageSelector}
          />
        </View>
      </View>

      {/* 알림 설정 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>🔔</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('settings.notifications.title')}</Text>
        </View>


        {/* 시간별 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.hourlyTarot')}</Text>
            <Text style={styles.settingSubtitle}>{t('settings.notifications.hourlyDescription')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, hourlyNotifications && styles.toggleButtonActive]}
            onPress={async () => {
              try {
                await updateNotificationSettings({
                  hourlyEnabled: !hourlyNotifications
                });
              } catch (error) {
                Alert.alert(t('settings.notifications.updateError'));
              }
            }}
          >
            <View style={[
              styles.toggleThumb,
              hourlyNotifications && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>

        {/* 자정 리셋 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.midnightReset')}</Text>
            <Text style={styles.settingSubtitle}>{t('settings.notifications.midnightDescription')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, midnightReset && styles.toggleButtonActive]}
            onPress={async () => {
              console.log('🔄 자정 리셋 알림 토글 클릭', {
                현재값: midnightReset,
                새값: !midnightReset,
                알림권한: notificationsEnabled
              });

              await updateNotificationSettings({
                midnightResetEnabled: !midnightReset
              });

              console.log('✅ 자정 리셋 알림 설정 업데이트 완료');

              // 권한이 없는 경우 안내 메시지
              if (!notificationsEnabled) {
                console.log('⚠️ 알림 권한이 없어 실제 알림은 전송되지 않습니다.');
              }
            }}
          >
            <View style={[
              styles.toggleThumb,
              midnightReset && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>

        {/* 데일리 타로 일기 저장 리마인더 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.dailyReminder')}</Text>
            <Text style={styles.settingSubtitle}>
              {notificationsEnabled
                ? t('settings.notifications.dailyDescription')
                : '20시 자동 알림'
              }
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, dailyTaroReminder && styles.toggleButtonActive]}
            onPress={async () => {
              try {
                console.log('🔄 데일리 리마인더 토글 클릭:', {
                  현재값: dailyTaroReminder,
                  새값: !dailyTaroReminder,
                  알림권한: notificationsEnabled
                });

                await updateNotificationSettings({
                  dailyReminderEnabled: !dailyTaroReminder
                });

                console.log('✅ 데일리 리마인더 설정 업데이트 완료');

                // 권한이 없는 경우 안내 메시지
                if (!notificationsEnabled) {
                  Alert.alert(
                    '설정 저장 완료',
                    '설정이 저장되었습니다. 실제 알림을 받으려면 알림 권한을 허용해주세요.',
                    [{ text: '확인' }]
                  );
                }
              } catch (error) {
                console.error('❌ 데일리 리마인더 설정 오류:', error);
                Alert.alert('오류', '설정을 저장하는 중 문제가 발생했습니다.');
              }
            }}
          >
            <View style={[
              styles.toggleThumb,
              dailyTaroReminder && styles.toggleThumbActive,
              !notificationsEnabled && styles.toggleThumbDisabled
            ]} />
          </TouchableOpacity>
        </View>



        {/* 조용한 시간 활성화/비활성화 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.quietHours')}</Text>
            <Text style={styles.settingSubtitle}>
              {quietHoursEnabled
                ? `${String(quietHoursStart).padStart(2, '0')}:00 - ${String(quietHoursEnd).padStart(2, '0')}:00`
                : t('settings.notifications.disabled')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, quietHoursEnabled && styles.toggleButtonActive]}
            onPress={async () => {
              try {
                await updateNotificationSettings({
                  quietHoursEnabled: !quietHoursEnabled
                });
              } catch (error) {
                Alert.alert(t('settings.notifications.updateError'));
              }
            }}
          >
            <View style={[
              styles.toggleThumb,
              quietHoursEnabled && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>

        {/* 조용한 시간 설정 (활성화된 경우에만 표시) */}
        {quietHoursEnabled && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setTempQuietHours({ start: quietHoursStart, end: quietHoursEnd });
              setShowQuietHoursModal(true);
            }}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('settings.notifications.timeSettings')}</Text>
              <Text style={styles.settingSubtitle}>
                {t('settings.notifications.timeSettingsDescription')}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        {/* 테스트 알림 - 모바일 환경에서만 표시 */}
        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleSendTestNotification}
          >
            <Text style={styles.testButtonText}>{t('settings.notifications.sendTest')}</Text>
          </TouchableOpacity>
        )}

        {/* 알림 진단 도구 - 개발 모드에서만 표시 */}
        {__DEV__ && Platform.OS !== 'web' && (
          <NotificationDiagnostics />
        )}
      </View>


      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />

      {/* 구독 선택 모달 - 모바일만 */}
      {Platform.OS !== 'web' && SubscriptionPlans && (
        <Modal
          visible={showSubscriptionModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSubscriptionModal(false)}
        >
          <SubscriptionPlans
            onClose={() => setShowSubscriptionModal(false)}
            onSubscriptionSuccess={handleSubscriptionSuccess}
          />
        </Modal>
      )}

      {/* 구독 관리 모달 - 모바일만 */}
      {Platform.OS !== 'web' && SubscriptionManagement && (
        <Modal
          visible={showManagementModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowManagementModal(false)}
        >
          <SubscriptionManagement
            onClose={() => setShowManagementModal(false)}
            onUpgrade={() => {
              setShowManagementModal(false);
              setShowSubscriptionModal(true);
            }}
          />
        </Modal>
      )}

      {/* 조용한 시간 설정 모달 */}
      <Modal
        visible={showQuietHoursModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuietHoursModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.notifications.quietHoursSettings')}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowQuietHoursModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.quietHoursDescription}>
                {quietHoursEnabled
                  ? t('settings.notifications.quietHoursDescription')
                  : '조용한 시간이 비활성화되어 있습니다. 설정에서 활성화 후 시간을 조정하세요.'
                }
              </Text>

              {/* 시간 정보 표시 */}
              <View style={styles.timeInfoContainer}>
                <Text style={styles.timeInfoText}>
                  {t('settings.notifications.quietHoursTime', { start: String(tempQuietHours.start).padStart(2, '0'), end: String(tempQuietHours.end).padStart(2, '0') })}
                </Text>
              </View>

              {/* 24시간 가로 바 */}
              <View style={styles.timeBarContainer}>
                <Text style={styles.timeBarLabel}>{t('settings.notifications.timeline24h')}</Text>
                <View style={styles.timeBarWrapper}>
                  <View style={styles.timeBar}>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const isQuietHour = (tempQuietHours.start <= tempQuietHours.end) 
                        ? (hour >= tempQuietHours.start && hour < tempQuietHours.end)
                        : (hour >= tempQuietHours.start || hour < tempQuietHours.end);
                      
                      return (
                        <TouchableOpacity
                          key={hour}
                          style={[
                            styles.hourSlot,
                            isQuietHour && styles.hourSlotQuiet
                          ]}
                          onPress={() => {
                            // 시작 시간이나 종료 시간을 설정하는 로직
                            const startDistance = Math.abs(hour - tempQuietHours.start);
                            const endDistance = Math.abs(hour - tempQuietHours.end);
                            
                            if (startDistance <= endDistance) {
                              setTempQuietHours(prev => ({ ...prev, start: hour }));
                            } else {
                              setTempQuietHours(prev => ({ ...prev, end: hour }));
                            }
                          }}
                        >
                          <Text style={[
                            styles.hourSlotText,
                            isQuietHour && styles.hourSlotTextQuiet
                          ]}>
                            {hour}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 시간 라벨 */}
                <View style={styles.timeLabelContainer}>
                  <Text style={styles.timeLabel}>00</Text>
                  <Text style={styles.timeLabel}>06</Text>
                  <Text style={styles.timeLabel}>12</Text>
                  <Text style={styles.timeLabel}>18</Text>
                  <Text style={styles.timeLabel}>24</Text>
                </View>
              </View>

              {/* 개별 시간 설정 */}
              <View style={styles.timeInputContainer}>
                <View style={styles.timeInputRow}>
                  <Text style={styles.timeInputLabel}>{t('settings.notifications.start')}:</Text>
                  <TouchableOpacity 
                    style={styles.timeInputButton}
                    onPress={() => {
                      const newStart = (tempQuietHours.start + 1) % 24;
                      setTempQuietHours(prev => ({ ...prev, start: newStart }));
                    }}
                  >
                    <Text style={styles.timeInputText}>
                      {String(tempQuietHours.start).padStart(2, '0')}:00
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.timeInputRow}>
                  <Text style={styles.timeInputLabel}>{t('settings.notifications.end')}:</Text>
                  <TouchableOpacity 
                    style={styles.timeInputButton}
                    onPress={() => {
                      const newEnd = (tempQuietHours.end + 1) % 24;
                      setTempQuietHours(prev => ({ ...prev, end: newEnd }));
                    }}
                  >
                    <Text style={styles.timeInputText}>
                      {String(tempQuietHours.end).padStart(2, '0')}:00
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 조용한 시간 끄기 버튼 */}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDisable]}
                onPress={async () => {
                  try {
                    await updateNotificationSettings({
                      quietHoursEnabled: false
                    });
                    setShowQuietHoursModal(false);
                    Alert.alert(t('settings.notifications.settingsComplete'), t('settings.notifications.quietHoursDisabled'));
                  } catch (error) {
                    Alert.alert(t('settings.notifications.updateError'));
                  }
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextDisable]}>
                  {t('settings.notifications.disableQuietHours')}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowQuietHoursModal(false)}
                >
                  <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleSaveQuietHours}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                    {t('common.save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 클라우드 백업 및 동기화 섹션 - 임시 숨김 */}
      {false && (
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>☁️</Text>
            </View>
            <Text style={styles.sectionTitle}>클라우드 백업 & 동기화</Text>
            {cloudBackupEnabled && (
              <View style={[styles.activeBadge, { backgroundColor: '#4caf50' }]}>
                <Text style={styles.activeBadgeText}>{t('settings.premium.active')}</Text>
              </View>
            )}
          </View>

          <View style={styles.sectionContent}>
            {/* 로컬 저장 우선 안내 */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>📱 로컬 저장 우선</Text>
              <Text style={styles.infoText}>
                모든 데이터는 기본적으로 기기에 저장됩니다.{'\n'}
                클라우드 백업은 선택사항이며 로그인이 필요합니다.
              </Text>
            </View>

            {/* 클라우드 백업 토글 */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>클라우드 백업</Text>
                <Text style={styles.settingDescription}>
                  {cloudBackupEnabled
                    ? '데이터가 클라우드에 자동 백업됩니다'
                    : '로컬 저장만 사용 중 (권장)'}
                </Text>
              </View>
              <Switch
                value={cloudBackupEnabled}
                onValueChange={handleToggleCloudBackup}
                trackColor={{ false: '#404040', true: Colors.brand.primary }}
                thumbColor={cloudBackupEnabled ? '#f4d03f' : '#d4b8ff'}
              />
            </View>

            {/* 동기화 상태 표시 */}
            {cloudBackupEnabled && (
              <View style={styles.syncStatusContainer}>
                <Text style={styles.settingLabel}>동기화 상태</Text>

                <View style={styles.syncInfoRow}>
                  <Text style={styles.syncLabel}>마지막 동기화:</Text>
                  <Text style={styles.syncValue}>
                    {syncStatus.lastSyncTime !== null
                      ? new Date(syncStatus.lastSyncTime as number).toLocaleString(undefined, {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '없음'}
                  </Text>
                </View>

                <View style={styles.syncInfoRow}>
                  <Text style={styles.syncLabel}>대기 중인 변경사항:</Text>
                  <Text style={styles.syncValue}>{syncStatus.pendingChanges}개</Text>
                </View>

                {syncStatus.syncInProgress && (
                  <View style={styles.syncInfoRow}>
                    <Text style={[styles.syncLabel, { color: Colors.brand.primary }]}>
                      🔄 동기화 진행 중...
                    </Text>
                  </View>
                )}

                {syncStatus.lastError && (
                  <View style={styles.syncInfoRow}>
                    <Text style={[styles.syncLabel, { color: Colors.state.error }]}>
                      ⚠️ 오류: {syncStatus.lastError}
                    </Text>
                  </View>
                )}

                {/* 수동 동기화 버튼 */}
                <TouchableOpacity
                  style={[styles.settingButton, { marginTop: 12 }]}
                  onPress={handleManualSync}
                  disabled={syncStatus.syncInProgress}
                >
                  <Text style={styles.settingButtonText}>
                    {syncStatus.syncInProgress ? '동기화 중...' : '지금 동기화'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 데이터 관리 섹션 */}
            <View style={styles.dataManagementSection}>
              <Text style={styles.settingLabel}>데이터 관리</Text>

              <TouchableOpacity style={styles.settingButton} onPress={handleExportData}>
                <Text style={styles.settingButtonText}>📤 데이터 내보내기 (백업)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingButton, { backgroundColor: 'rgba(255, 152, 0, 0.2)' }]}
                onPress={handleImportData}
              >
                <Text style={[styles.settingButtonText, { color: '#ff9800' }]}>
                  📥 데이터 가져오기 (복원)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


      {/* Supabase 연결 테스트 (개발용) - 임시 비활성화 */}
      {/* {false && <SupabaseTest />} */}

      {/* 보상형 광고 제거: 전면광고만 사용 */}

      {/* 프리미엄 기능 통합 테스트 (개발용) */}
      {__DEV__ && (
        <View style={styles.settingsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>🧪</Text>
            </View>
            <Text style={styles.sectionTitle}>개발자 테스트</Text>
          </View>
          <PremiumTest />
        </View>
      )}

      {/* 앱 정보 섹션 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>ℹ️</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setAdminClickCount(prev => {
                const newCount = prev + 1;
                if (newCount >= 7) {
                  loadCrashLogs();
                  setShowCrashLogs(true);
                  setAdminClickCount(0);
                }
                return newCount;
              });
            }}
          >
            <Text style={styles.sectionTitle}>{t('settings.about.title')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.about.version')}</Text>
            <Text style={styles.settingSubtitle}>v2.1.0 - Mystic Edition</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            // 인스타그램 링크 열기
            const instagramUrl = 'https://www.instagram.com/deanosajutaro/';
            if (typeof window !== 'undefined' && window.open) {
              // 웹 환경
              window.open(instagramUrl, '_blank');
            } else {
              // 모바일 환경
              try {
                const { Linking } = require('react-native');
                Linking.openURL(instagramUrl).catch(() => {
                  Alert.alert('오류', '링크를 열 수 없습니다.');
                });
              } catch (error) {
                console.warn('Linking 모듈 사용 불가:', error);
              }
            }
          }}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.about.developer')}</Text>
            <Text style={styles.settingSubtitle}>@deanosajutaro</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>


      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />

      {/* 베너 광고 제거: 전면광고만 사용으로 unitId 크래시 방지 */}

      {/* 크래시 로그 모달 */}
      <Modal
        visible={showCrashLogs}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCrashLogs(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔧 크래시 로그</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={clearCrashLogs}
                style={[styles.modalButton, { backgroundColor: '#ff6b6b' }]}
              >
                <Text style={styles.modalButtonText}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCrashLogs(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.modalContent}>
            {crashLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>크래시 로그가 없습니다.</Text>
              </View>
            ) : (
              crashLogs.map((log, index) => (
                <View key={index} style={styles.crashLogItem}>
                  <Text style={styles.crashLogTimestamp}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                  <Text style={styles.crashLogTab}>
                    탭: {log.tabName || '알 수 없음'}
                  </Text>
                  <Text style={styles.crashLogError}>
                    에러: {log.error}
                  </Text>
                  <Text style={styles.crashLogMessage}>
                    {log.errorInfo?.componentStack?.split('\n').slice(0, 3).join('\n') || '상세 정보 없음'}
                  </Text>
                  <Text style={styles.crashLogBuildType}>
                    빌드: {log.buildType || '알 수 없음'}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Supabase Debug Panel */}
      <SupabaseDebugPanel
        visible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.glass.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: Colors.brand.accent,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  headerIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: 'NotoSansKR_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontFamily: 'NotoSansKR_400Regular',
  },

  // 설정 섹션
  settingsSection: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionIcon: {
    marginRight: Spacing.sm,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    fontFamily: 'NotoSansKR_700Bold',
  },

  // 프리미엄 관련
  activeBadge: {
    backgroundColor: '#4ade80',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'NotoSansKR_700Bold',
  },
  // 베타 테스터 배너
  betaTesterBanner: {
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(244, 208, 63, 0.5)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  betaTesterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brand.secondary,
    marginBottom: Spacing.xs,
    fontFamily: 'NotoSansKR_700Bold',
  },
  betaTesterMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    fontFamily: 'NotoSansKR_400Regular',
  },
  premiumFeatures: {
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  featureBullet: {
    color: Colors.brand.accent,
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  upgradeButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    fontFamily: 'NotoSansKR_700Bold',
  },

  // 프리미엄 상태 표시
  premiumStatusContainer: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.3)',
  },
  premiumInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  premiumStatusTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontFamily: 'NotoSansKR_500Medium',
  },
  premiumStatusValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: 'bold',
    fontFamily: 'NotoSansKR_700Bold',
  },
  manageSubscriptionButton: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    borderWidth: 1,
    borderColor: Colors.state.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  manageSubscriptionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.state.success,
    fontFamily: 'NotoSansKR_700Bold',
  },

  // 프리미엄 사용자용 특별 스타일
  premiumSettingsSection: {
    borderWidth: 2,
    borderColor: Colors.brand.accent,
    shadowColor: Colors.brand.accent,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    backgroundColor: 'rgba(244, 208, 63, 0.05)',
  },

  // 설정 항목
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.1)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
    fontFamily: 'NotoSansKR_500Medium',
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  chevron: {
    fontSize: 20,
    color: Colors.text.muted,
    marginLeft: Spacing.sm,
  },
  languageSelector: {
    flex: 1,
  },

  // 토글 버튼
  toggleButton: {
    width: 60,
    height: 32,
    backgroundColor: 'rgba(74, 68, 88, 0.8)',
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(155, 141, 184, 0.3)',
    // 터치 영역 개선
    minHeight: 44,
    minWidth: 60,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(244, 208, 63, 0.3)',
    borderColor: Colors.brand.accent,
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: 'rgba(155, 141, 184, 0.8)',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbActive: {
    backgroundColor: Colors.brand.accent,
    shadowColor: Colors.brand.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleThumbDisabled: {
    backgroundColor: 'rgba(155, 141, 184, 0.4)',
    opacity: 0.6,
  },
  toggleIcon: {
    fontSize: 12,
    textAlign: 'center',
  },

  // 알림 관련 스타일
  permissionSection: {
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  permissionSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontFamily: 'NotoSansKR_400Regular',
  },
  permissionButton: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'NotoSansKR_700Bold',
  },
  premiumBadge: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: Spacing.sm,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'NotoSansKR_700Bold',
  },
  testButton: {
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    borderWidth: 1,
    borderColor: Colors.brand.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    fontFamily: 'NotoSansKR_700Bold',
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  modalContainer: {
    backgroundColor: 'rgba(15, 12, 27, 0.95)',
    borderRadius: BorderRadius.xl,
    maxHeight: '100%',
    width: '95%',
    maxWidth: 500,
    minHeight: 400,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    fontFamily: 'NotoSansKR_700Bold',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: Colors.brand.accent,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 300,
  },


  // 조용한 시간 모달 스타일
  quietHoursDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: 'NotoSansKR_400Regular',
  },
  timeInfoContainer: {
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  timeInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.accent,
    textAlign: 'center',
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  timeBarContainer: {
    marginBottom: Spacing.xl,
  },
  timeBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: 'NotoSansKR_500Medium',
  },
  timeBarWrapper: {
    backgroundColor: 'rgba(74, 68, 88, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  timeBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  hourSlot: {
    flex: 1,
    backgroundColor: 'rgba(155, 141, 184, 0.2)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(155, 141, 184, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hourSlotQuiet: {
    backgroundColor: 'rgba(244, 208, 63, 0.4)',
  },
  hourSlotText: {
    fontSize: 8,
    color: Colors.text.muted,
    fontFamily: 'NotoSansKR_400Regular',
  },
  hourSlotTextQuiet: {
    color: Colors.brand.accent,
    fontWeight: 'bold',
    fontFamily: 'NotoSansKR_700Bold',
  },
  timeLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  timeLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    backgroundColor: 'rgba(155, 141, 184, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  timeInputRow: {
    alignItems: 'center',
  },
  timeInputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontFamily: 'NotoSansKR_400Regular',
  },
  timeInputButton: {
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    borderWidth: 1,
    borderColor: Colors.brand.accent,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  timeInputText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.accent,
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(155, 141, 184, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(155, 141, 184, 0.3)',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.brand.accent,
    borderColor: Colors.brand.accent,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  modalButtonTextPrimary: {
    color: '#000',
    fontFamily: 'NotoSansKR_700Bold',
  },
  modalButtonDisable: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: 'rgba(255, 107, 107, 0.5)',
    marginBottom: Spacing.lg,
  },
  modalButtonTextDisable: {
    color: '#ff6b6b',
    fontFamily: 'NotoSansKR_600SemiBold',
  },

  bottomSpace: {
    height: 100,
  },

  // 기본 섹션 스타일
  section: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },

  // 클라우드 백업 관련 스타일
  sectionContent: {
    paddingTop: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
  },
  infoBox: {
    backgroundColor: 'rgba(123, 44, 191, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.3)',
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#f4d03f',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  syncStatusContainer: {
    backgroundColor: 'rgba(45, 27, 71, 0.4)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.2)',
  },
  syncInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  syncLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text.secondary,
    flex: 1,
  },
  syncValue: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#f4d03f',
    textAlign: 'right',
  },
  dataManagementSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 184, 255, 0.2)',
  },
  settingButton: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.3)',
    alignItems: 'center',
  },
  settingButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#d4b8ff',
  },

  // 준비중 배지 스타일
  comingSoonBadge: {
    backgroundColor: 'rgba(123, 44, 191, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#7b2cbf',
  },
  comingSoonText: {
    color: '#7b2cbf',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'NotoSansKR_600SemiBold',
  },

  // 크래시 로그 모달 스타일 (modalButton, modalButtonText는 위에 이미 정의됨)
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  crashLogItem: {
    backgroundColor: 'rgba(74, 68, 88, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  crashLogTimestamp: {
    fontSize: 12,
    color: Colors.brand.accent,
    marginBottom: 4,
    fontFamily: 'NotoSansKR_400Regular',
  },
  crashLogTab: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'NotoSansKR_700Bold',
  },
  crashLogError: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 8,
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  crashLogMessage: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontFamily: 'Courier New',
    marginBottom: 8,
  },
  crashLogBuildType: {
    fontSize: 11,
    color: Colors.text.muted,
    fontFamily: 'NotoSansKR_400Regular',
  },
});

export default SettingsTab;
