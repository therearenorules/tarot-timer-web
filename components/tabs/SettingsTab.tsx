import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Switch
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  Spacing,
  BorderRadius
} from '../DesignSystem';
import LanguageSelector from '../LanguageSelector';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePremium } from '../../contexts/PremiumContext';
// 조건부 import - 보상형 광고 안전 로딩
let RewardedAd: any = null;
try {
  const rewardedAdModule = require('../ads/RewardedAd');
  RewardedAd = rewardedAdModule.default || rewardedAdModule;
} catch (error) {
  console.warn('⚠️ RewardedAd 컴포넌트 로드 실패 (보상형 광고 비활성화):', error);
}
// import SupabaseTest from '../SupabaseTest';
import HybridDataManager, { SyncStatus } from '../../utils/hybridDataManager';
import LocalStorageManager, { PremiumStatus } from '../../utils/localStorage';
// import { PremiumUpgrade } from '../PremiumUpgrade';
import PremiumTest from '../PremiumTest';
import AdminDashboard from '../AdminDashboard';
// 조건부 import - 모바일 환경에서 안전하게 로드
let SubscriptionPlans: any = null;
let SubscriptionManagement: any = null;

try {
  const subscriptionPlans = require('../subscription/SubscriptionPlans');
  const subscriptionManagement = require('../subscription/SubscriptionManagement');
  SubscriptionPlans = subscriptionPlans.default || subscriptionPlans.SubscriptionPlans;
  SubscriptionManagement = subscriptionManagement.default || subscriptionManagement.SubscriptionManagement;
} catch (error) {
  console.warn('⚠️ 구독 컴포넌트 로드 실패 (시뮬레이션 모드):', error);
}

const SettingsTab: React.FC = () => {
  const { t } = useTranslation();

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
    isLoading: premiumLoading
  } = usePremium();

  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isEnabled: false,
    pendingChanges: 0,
    syncInProgress: false
  });
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  // Context에서 가져온 값들을 로컬 상태 대신 사용
  const notificationsEnabled = hasPermission;
  const hourlyNotifications = notificationSettings?.hourlyEnabled ?? true;
  const dailyTaroReminder = notificationSettings?.dailyReminderEnabled ?? true;
  const quietHoursStart = notificationSettings?.quietHoursStart ?? 22;
  const quietHoursEnd = notificationSettings?.quietHoursEnd ?? 8;

  // 로컬 상태는 Context에 없는 항목들만 유지
  const [midnightReset, setMidnightReset] = useState(true);
  const [saveReminders, setSaveReminders] = useState(true);

  // Modal state
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [tempQuietHours, setTempQuietHours] = useState({
    start: quietHoursStart,
    end: quietHoursEnd,
  });

  // 동기화 상태 로드
  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await HybridDataManager.getSyncStatus();
      setSyncStatus(status);
      setCloudBackupEnabled(status.isEnabled);
    } catch (error) {
      console.error('동기화 상태 로드 오류:', error);
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

  const handleUpgradePress = () => {
    // 구독 기능 준비 중 알림
    Alert.alert(
      t('settings.premium.comingSoonTitle'),
      t('settings.premium.comingSoonDesc'),
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
    if (!notificationsEnabled) {
      Alert.alert(t('settings.notifications.permissionRequired'), t('settings.notifications.permissionFirst'));
      return;
    }
    try {
      await sendTestNotification();
      Alert.alert(t('settings.notifications.testTitle'), t('settings.notifications.testMessage'));
    } catch (error) {
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
    try {
      if (enabled) {
        const result = await HybridDataManager.enableCloudBackup();
        if (result.success) {
          setCloudBackupEnabled(true);
          Alert.alert('클라우드 백업 활성화', result.message);
          loadSyncStatus();
        } else {
          Alert.alert('클라우드 백업 오류', result.message);
        }
      } else {
        Alert.alert(
          '클라우드 백업 비활성화',
          '클라우드 백업을 비활성화하시겠습니까? 로컬 데이터는 유지되며 클라우드 동기화만 중단됩니다.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '비활성화',
              style: 'destructive',
              onPress: async () => {
                await HybridDataManager.disableCloudBackup();
                setCloudBackupEnabled(false);
                loadSyncStatus();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('클라우드 백업 토글 오류:', error);
      Alert.alert('오류', '클라우드 백업 설정 중 오류가 발생했습니다.');
    }
  };

  const handleManualSync = async () => {
    try {
      const result = await HybridDataManager.manualSync();
      Alert.alert(
        result.success ? '동기화 완료' : '동기화 오류',
        result.message
      );
      loadSyncStatus();
    } catch (error) {
      console.error('수동 동기화 오류:', error);
      Alert.alert('오류', '동기화 중 오류가 발생했습니다.');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await HybridDataManager.exportData();
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* 프리미엄 구독 관리 섹션 */}
      <View style={[styles.settingsSection, isPremium && styles.premiumSettingsSection]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>👑</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('settings.premium.title')}</Text>
          {isPremium ? (
            <View style={[styles.activeBadge, { backgroundColor: Colors.state.success }]}>
              <Text style={styles.activeBadgeText}>{t('settings.premium.active')}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.activeBadge, { backgroundColor: Colors.brand.accent }]}
              onPress={handleUpgradePress}
            >
              <Text style={[styles.activeBadgeText, { color: '#000' }]}>{t('settings.premium.upgrade')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isPremium ? (
          // 프리미엄 사용자 - 구독 상태 표시
          <View style={styles.premiumStatusContainer}>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumStatusTitle}>{t('settings.premium.subscriptionStatus')}</Text>
              <Text style={styles.premiumStatusValue}>
                {isSubscriptionActive ? t('settings.premium.active') : t('settings.premium.expired')}
              </Text>
            </View>

            {premiumStatus.subscription_type && (
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumStatusTitle}>{t('settings.premium.subscriptionType')}</Text>
                <Text style={styles.premiumStatusValue}>
                  {premiumStatus.subscription_type === 'monthly' ? t('settings.premium.monthly') : t('settings.premium.yearly')} {t('settings.premium.subscription')}
                </Text>
              </View>
            )}

            {daysUntilExpiry !== null && (
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumStatusTitle}>{t('settings.premium.remainingPeriod')}</Text>
                <Text style={[
                  styles.premiumStatusValue,
                  daysUntilExpiry <= 7 && { color: Colors.state.warning }
                ]}>
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry}${t('settings.premium.days')}` : t('settings.premium.expired')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.manageSubscriptionButton}
              onPress={() => setShowManagementModal(true)}
            >
              <Text style={styles.manageSubscriptionButtonText}>{t('settings.premium.manage')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // 일반 사용자 - 프리미엄 기능 소개
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
            <View style={styles.featureRow}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>{t('settings.premium.features.premiumThemes')}</Text>
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradePress}
            >
              <Text style={styles.upgradeButtonText}>{t('settings.premium.comingSoon')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 화면 및 테마 설정 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>🎨</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('settings.display.title')}</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.display.darkMode')}</Text>
            <Text style={styles.settingSubtitle}>{t('settings.display.alwaysOn')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, darkModeEnabled && styles.toggleButtonActive]}
            onPress={() => setDarkModeEnabled(!darkModeEnabled)}
          >
            <View style={[styles.toggleThumb, darkModeEnabled && styles.toggleThumbActive]} />
          </TouchableOpacity>
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
            onPress={() => setMidnightReset(!midnightReset)}
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
                : '알림 권한 없음 - 설정만 저장됩니다'
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



        {/* 조용한 시간 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            setTempQuietHours({ start: quietHoursStart, end: quietHoursEnd });
            setShowQuietHoursModal(true);
          }}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.quietHours')}</Text>
            <Text style={styles.settingSubtitle}>
              {String(quietHoursStart).padStart(2, '0')}:00 - {String(quietHoursEnd).padStart(2, '0')}:00
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* 테스트 알림 */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleSendTestNotification}
          disabled={!notificationsEnabled}
        >
          <Text style={styles.testButtonText}>{t('settings.notifications.sendTest')}</Text>
        </TouchableOpacity>
      </View>

      {/* 앱 정보 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>ℹ️</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('settings.about.title')}</Text>
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
            const instagramUrl = 'https://www.instagram.com/selfish_saju/';
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
            <Text style={styles.settingSubtitle}>데아노</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />

      {/* 구독 선택 모달 */}
      {SubscriptionPlans && (
        <Modal
          visible={showSubscriptionModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSubscriptionModal(false)}
        >
          <SubscriptionPlans
            onClose={() => setShowSubscriptionModal(false)}
            onPurchaseSuccess={handleSubscriptionSuccess}
          />
        </Modal>
      )}

      {/* 구독 관리 모달 */}
      {SubscriptionManagement && (
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
                {t('settings.notifications.quietHoursDescription')}
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
                    {syncStatus.lastSyncTime
                      ? new Date(syncStatus.lastSyncTime).toLocaleString('ko-KR')
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

      {/* 보상형 광고 섹션 - 구독 시스템 업데이트 시까지 숨김 */}
      {false && RewardedAd && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추가 기능</Text>
          <RewardedAd
            buttonText="보상 광고 시청하기"
            rewardDescription="광고를 시청하고 추가 타로 세션을 받으세요"
            onRewardEarned={(rewardType, amount) => {
              console.log('🎁 보상 받음:', rewardType, amount);
              Alert.alert(
                '보상 받기 완료!',
                `${amount}개의 추가 타로 세션을 받았습니다.`,
                [{ text: '확인', style: 'default' }]
              );
            }}
            onAdFailed={(error) => {
              console.log('❌ 보상형 광고 실패:', error);
              Alert.alert(
                '광고 시청 실패',
                '잠시 후 다시 시도해주세요.',
                [{ text: '확인', style: 'default' }]
              );
            }}
          />
        </View>
      )}

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

      {/* 숨겨진 관리자 진입점 - 앱 정보 섹션 */}
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
                  setShowAdminDashboard(true);
                  setAdminClickCount(0);
                }
                return newCount;
              });
            }}
          >
            <Text style={styles.sectionTitle}>앱 정보</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>버전</Text>
            <Text style={styles.settingSubtitle}>1.0.0</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            // 인스타그램 링크 열기
            const instagramUrl = 'https://www.instagram.com/selfish_saju/';
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
            <Text style={styles.settingTitle}>개발자</Text>
            <Text style={styles.settingSubtitle}>데아노</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 관리자 대시보드 모달 */}
      <Modal
        visible={showAdminDashboard}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>관리자 대시보드</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowAdminDashboard(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <AdminDashboard />
        </View>
      </Modal>

      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />
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
});

export default SettingsTab;