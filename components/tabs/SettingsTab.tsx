import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  Spacing,
  BorderRadius
} from '../DesignSystem';
import LanguageSelector from '../LanguageSelector';

const SettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const [isPremium, setIsPremium] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  // Notification settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // 기본으로 활성화
  const [hourlyNotifications, setHourlyNotifications] = useState(true);
  const [midnightReset, setMidnightReset] = useState(true);
  const [saveReminders, setSaveReminders] = useState(true);
  const [weekendNotifications, setWeekendNotifications] = useState(true);
  const [dailyTaroReminder, setDailyTaroReminder] = useState(true); // Daily tarot reminder added
  const [quietHoursStart, setQuietHoursStart] = useState(22);
  const [quietHoursEnd, setQuietHoursEnd] = useState(8);

  // Modal state
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [tempQuietHours, setTempQuietHours] = useState({
    start: quietHoursStart,
    end: quietHoursEnd,
  });

  const handleUpgradePremium = () => {
    Alert.alert(
      t('settings.premium.upgradeTitle'),
      t('settings.premium.upgradeMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.premium.upgrade'), onPress: () => setIsPremium(true) }
      ]
    );
  };

  const handleRequestPermissions = () => {
    Alert.alert(
      t('settings.notifications.permissionTitle'),
      t('settings.notifications.permissionMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.notifications.allow'),
          onPress: () => {
            setNotificationsEnabled(true);
            Alert.alert(t('settings.notifications.permissionGranted'), t('settings.notifications.configureMessage'));
          }
        }
      ]
    );
  };

  const handleSendTestNotification = () => {
    if (!notificationsEnabled) {
      Alert.alert(t('settings.notifications.permissionRequired'), t('settings.notifications.permissionFirst'));
      return;
    }
    Alert.alert(t('settings.notifications.testTitle'), t('settings.notifications.testMessage'));
  };

  const handleSaveQuietHours = () => {
    setQuietHoursStart(tempQuietHours.start);
    setQuietHoursEnd(tempQuietHours.end);
    setShowQuietHoursModal(false);
    Alert.alert(t('settings.notifications.saveComplete'), t('settings.notifications.quietHoursSaved'));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* 프리미엄 멤버십 섹션 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>👑</Text>
          </View>
          <Text style={styles.sectionTitle}>{t('settings.premium.title')}</Text>
          {isPremium ? (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{t('settings.premium.active')}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.upgradeBadge}
              onPress={handleUpgradePremium}
            >
              <Text style={styles.upgradeBadgeText}>{t('settings.premium.upgrade')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.premiumFeatures}>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>{t('settings.premium.features.unlockSpreads')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>{t('settings.premium.features.adFree')}</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>{t('settings.premium.features.unlimitedStorage')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.premiumButton}
          onPress={handleUpgradePremium}
        >
          <Text style={styles.premiumButtonText}>
            {isPremium ? t('settings.premium.manage') : t('settings.premium.upgrade')}
          </Text>
        </TouchableOpacity>
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

        {/* 알림 권한 상태 */}
        <View style={styles.permissionSection}>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>
              {notificationsEnabled ? t('settings.notifications.permissionGranted') : t('settings.notifications.permissionRequired')}
            </Text>
            <Text style={styles.permissionSubtitle}>
              {notificationsEnabled
                ? t('settings.notifications.canReceive')
                : t('settings.notifications.needPermission')
              }
            </Text>
          </View>
          {!notificationsEnabled && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestPermissions}
            >
              <Text style={styles.permissionButtonText}>{t('settings.notifications.requestPermission')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 시간별 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.hourlyTarot')}</Text>
            <Text style={styles.settingSubtitle}>{t('settings.notifications.hourlyDescription')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, hourlyNotifications && notificationsEnabled && styles.toggleButtonActive]}
            onPress={() => setHourlyNotifications(!hourlyNotifications)}
            disabled={!notificationsEnabled}
          >
            <View style={[
              styles.toggleThumb,
              hourlyNotifications && notificationsEnabled && styles.toggleThumbActive
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
            style={[styles.toggleButton, midnightReset && notificationsEnabled && styles.toggleButtonActive]}
            onPress={() => setMidnightReset(!midnightReset)}
            disabled={!notificationsEnabled}
          >
            <View style={[
              styles.toggleThumb,
              midnightReset && notificationsEnabled && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>

        {/* 데일리 타로 일기 저장 리마인더 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.dailyReminder')}</Text>
            <Text style={styles.settingSubtitle}>{t('settings.notifications.dailyDescription')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, dailyTaroReminder && notificationsEnabled && styles.toggleButtonActive]}
            onPress={() => setDailyTaroReminder(!dailyTaroReminder)}
            disabled={!notificationsEnabled}
          >
            <View style={[
              styles.toggleThumb,
              dailyTaroReminder && notificationsEnabled && styles.toggleThumbActive
            ]} />
          </TouchableOpacity>
        </View>

        {/* 주말 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.notifications.weekend')}</Text>
            <Text style={styles.settingSubtitle}>{t('settings.notifications.weekendDescription')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleButton, weekendNotifications && notificationsEnabled && hourlyNotifications && styles.toggleButtonActive]}
            onPress={() => setWeekendNotifications(!weekendNotifications)}
            disabled={!notificationsEnabled || !hourlyNotifications}
          >
            <View style={[
              styles.toggleThumb,
              weekendNotifications && notificationsEnabled && hourlyNotifications && styles.toggleThumbActive
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
          disabled={!notificationsEnabled}
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

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{t('settings.about.developer')}</Text>
            <Text style={styles.settingSubtitle}>Tarot Timer Team</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />


      {/* 조용한 시간 설정 모달 */}
      <Modal
        visible={showQuietHoursModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuietHoursModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: Dimensions.get('window').height * 0.8 }]}>
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
  upgradeBadge: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  upgradeBadgeText: {
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
  premiumButton: {
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    borderWidth: 1,
    borderColor: Colors.brand.accent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    fontFamily: 'NotoSansKR_700Bold',
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'rgba(15, 12, 27, 0.95)',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
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
});

export default SettingsTab;