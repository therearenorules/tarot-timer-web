import React, { memo, useState, useCallback } from 'react';
import { useSafeState } from '../hooks/useSafeState';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext';
import { usePremium } from '../contexts/PremiumContext';
import { Colors, Spacing, BorderRadius, Typography } from './DesignSystem';
import { Icon } from './Icon';

// 시간대 선택 옵션
const TIMEZONE_OPTIONS = [
  { label: '서울 (UTC+9)', value: 'Asia/Seoul' },
  { label: '도쿄 (UTC+9)', value: 'Asia/Tokyo' },
  { label: '뉴욕 (UTC-5)', value: 'America/New_York' },
  { label: '런던 (UTC+0)', value: 'Europe/London' },
  { label: '파리 (UTC+1)', value: 'Europe/Paris' },
  { label: '베이징 (UTC+8)', value: 'Asia/Shanghai' },
];

// 시간 선택을 위한 시간 배열
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, '0')}:00`,
  value: i
}));

const NotificationSettings: React.FC = memo(() => {
  const { t } = useTranslation();
  const {
    hasPermission,
    settings,
    updateSettings,
    requestPermission,
    sendTestNotification,
    scheduleHourlyNotifications,
    cancelHourlyNotifications,
    verifyScheduledNotifications,
    checkRealTimePermission,
    lastScheduleTime,
    scheduleAttempts,
  } = useNotifications();

  const { premiumStatus, isPremium } = usePremium();

  const [showTimezoneModal, setShowTimezoneModal] = useSafeState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useSafeState(false);
  const [tempQuietStart, setTempQuietStart] = useSafeState(settings.quietHoursStart);
  const [tempQuietEnd, setTempQuietEnd] = useSafeState(settings.quietHoursEnd);

  // 알림 권한 요청
  const handleRequestPermission = useCallback(async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        Alert.alert(
          '✅ 알림 권한 허용됨',
          '이제 타로 타이머 알림을 받을 수 있습니다.',
          [{ text: '확인' }]
        );
      } else {
        Alert.alert(
          '❌ 알림 권한 거부됨',
          '설정 앱에서 직접 알림 권한을 허용해주세요.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  }, [requestPermission]);

  // 테스트 알림 전송
  const handleTestNotification = useCallback(async () => {
    try {
      await sendTestNotification();
      Alert.alert(
        '🔮 테스트 알림 전송',
        '잠시 후 테스트 알림이 도착할 예정입니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert(
        '❌ 알림 전송 실패',
        '테스트 알림을 전송할 수 없습니다.',
        [{ text: '확인' }]
      );
    }
  }, [sendTestNotification]);

  // 알림 진단 기능
  const handleDiagnoseNotifications = useCallback(async () => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 알림 시스템 진단 시작...');

      // 1. 실시간 권한 확인
      const hasRealPermission = await checkRealTimePermission();
      console.log(`   1️⃣ 알림 권한: ${hasRealPermission ? '✅ 허용됨' : '❌ 거부됨'}`);

      // 2. 현재 설정 확인
      console.log(`   2️⃣ 시간별 알림 활성화: ${settings.hourlyEnabled ? '✅' : '❌'}`);
      console.log(`   3️⃣ 조용한 시간 활성화: ${settings.quietHoursEnabled ? '✅' : '❌'}`);
      if (settings.quietHoursEnabled) {
        console.log(`      → 조용한 시간: ${settings.quietHoursStart}:00 ~ ${settings.quietHoursEnd}:00`);
      }

      // 3. 스케줄된 알림 개수 확인
      const scheduledCount = await verifyScheduledNotifications();
      console.log(`   4️⃣ 현재 스케줄된 알림: ${scheduledCount}개`);

      // 4. 마지막 스케줄링 시간
      if (lastScheduleTime) {
        const lastTime = new Date(lastScheduleTime);
        console.log(`   5️⃣ 마지막 스케줄링: ${lastTime.toLocaleString('ko-KR')}`);
      } else {
        console.log(`   5️⃣ 마지막 스케줄링: 없음`);
      }

      console.log(`   6️⃣ 스케줄링 시도 횟수: ${scheduleAttempts}회`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 진단 결과 알림
      let diagnosisMessage = `권한: ${hasRealPermission ? '✅' : '❌'}\n`;
      diagnosisMessage += `시간별 알림: ${settings.hourlyEnabled ? '활성화' : '비활성화'}\n`;
      diagnosisMessage += `스케줄된 알림: ${scheduledCount}개\n`;

      if (scheduledCount === 0 && settings.hourlyEnabled && hasRealPermission) {
        diagnosisMessage += '\n⚠️ 알림이 스케줄되지 않았습니다.\n아래 "알림 재설정" 버튼을 눌러주세요.';
      }

      Alert.alert('📊 알림 시스템 진단', diagnosisMessage, [{ text: '확인' }]);
    } catch (error) {
      console.error('❌ 알림 진단 실패:', error);
      Alert.alert('❌ 진단 실패', '알림 시스템 진단 중 오류가 발생했습니다.', [{ text: '확인' }]);
    }
  }, [checkRealTimePermission, verifyScheduledNotifications, settings, lastScheduleTime, scheduleAttempts]);

  // 알림 재설정 (강제 재스케줄링)
  const handleResetNotifications = useCallback(async () => {
    try {
      console.log('🔄 알림 재설정 시작...');

      await cancelHourlyNotifications();
      console.log('   1️⃣ 기존 알림 모두 취소 완료');

      await scheduleHourlyNotifications();
      console.log('   2️⃣ 새로운 알림 스케줄링 완료');

      const newCount = await verifyScheduledNotifications();
      console.log(`   3️⃣ 스케줄된 알림 확인: ${newCount}개`);

      Alert.alert(
        '✅ 알림 재설정 완료',
        `${newCount}개의 시간별 알림이 새로 설정되었습니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('❌ 알림 재설정 실패:', error);
      Alert.alert('❌ 재설정 실패', '알림 재설정 중 오류가 발생했습니다.', [{ text: '확인' }]);
    }
  }, [cancelHourlyNotifications, scheduleHourlyNotifications, verifyScheduledNotifications]);

  // 시간별 알림 토글
  const handleHourlyToggle = useCallback(async (enabled: boolean) => {
    try {
      await updateSettings({ hourlyEnabled: enabled });

      if (enabled) {
        await scheduleHourlyNotifications();
        Alert.alert(
          '✅ 시간별 알림 활성화',
          '매시간 새로운 타로 카드 알림을 받게 됩니다.',
          [{ text: '확인' }]
        );
      } else {
        await cancelHourlyNotifications();
        Alert.alert(
          '🔕 시간별 알림 비활성화',
          '시간별 타로 카드 알림이 중단되었습니다.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('Error toggling hourly notifications:', error);
    }
  }, [updateSettings, scheduleHourlyNotifications, cancelHourlyNotifications]);

  // 조용한 시간 설정 저장
  const handleSaveQuietHours = useCallback(async () => {
    try {
      await updateSettings({
        quietHoursStart: tempQuietStart,
        quietHoursEnd: tempQuietEnd
      });
      setShowQuietHoursModal(false);

      Alert.alert(
        '✅ 조용한 시간 설정됨',
        `${tempQuietStart}:00 - ${tempQuietEnd}:00 동안 알림이 중단됩니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('Error updating quiet hours:', error);
    }
  }, [tempQuietStart, tempQuietEnd, updateSettings]);

  // 시간대 설정
  const handleTimezoneSelect = useCallback(async (timezone: string) => {
    try {
      // TODO: 백엔드 API 호출로 시간대 업데이트
      setShowTimezoneModal(false);

      Alert.alert(
        '✅ 시간대 변경됨',
        `시간대가 ${timezone}로 변경되었습니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  }, []);

  // 권한 상태에 따른 UI
  if (!hasPermission) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconContainer}>
            <Icon name="bell-off" size={64} color={Colors.text.secondary} />
          </View>

          <Text style={styles.permissionTitle}>
            알림 권한이 필요합니다
          </Text>

          <Text style={styles.permissionDescription}>
            타로 타이머의 시간별 알림과 자정 리셋 알림을 받으려면 알림 권한을 허용해주세요.
          </Text>

          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleRequestPermission}
            activeOpacity={0.8}
          >
            <Icon name="bell" size={20} color="#fff" />
            <Text style={styles.permissionButtonText}>
              알림 권한 허용하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 알림 설정 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="bell" size={20} color={Colors.brand.primary} />
          <Text style={styles.sectionTitle}>알림 설정</Text>
        </View>

        {/* 시간별 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>시간별 타로 알림</Text>
            <Text style={styles.settingDescription}>
              매시간 새로운 타로 카드 알림 받기
            </Text>
          </View>
          <Switch
            value={settings.hourlyEnabled}
            onValueChange={handleHourlyToggle}
            trackColor={{ false: Colors.surface.secondary, true: Colors.brand.accent }}
            thumbColor={settings.hourlyEnabled ? Colors.brand.primary : Colors.text.secondary}
          />
        </View>

        {/* 주말 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>주말 알림</Text>
            <Text style={styles.settingDescription}>
              주말에도 알림 받기
            </Text>
          </View>
          <Switch
            value={settings.weekendEnabled}
            onValueChange={(enabled) => updateSettings({ weekendEnabled: enabled })}
            trackColor={{ false: Colors.surface.secondary, true: Colors.brand.accent }}
            thumbColor={settings.weekendEnabled ? Colors.brand.primary : Colors.text.secondary}
          />
        </View>

        {/* 조용한 시간 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowQuietHoursModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>조용한 시간</Text>
            <Text style={styles.settingDescription}>
              {settings.quietHoursStart}:00 - {settings.quietHoursEnd}:00
            </Text>
          </View>
          <Icon name="chevron-right" size={16} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* 시간대 설정 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="clock" size={20} color={Colors.brand.primary} />
          <Text style={styles.sectionTitle}>시간대 설정</Text>
        </View>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowTimezoneModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>시간대</Text>
            <Text style={styles.settingDescription}>
              서울 (UTC+9)
            </Text>
          </View>
          <Icon name="chevron-right" size={16} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* 테스트 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="settings" size={20} color={Colors.brand.primary} />
          <Text style={styles.sectionTitle}>테스트 & 진단</Text>
        </View>

        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestNotification}
          activeOpacity={0.8}
        >
          <Icon name="send" size={20} color={Colors.brand.primary} />
          <Text style={styles.testButtonText}>테스트 알림 전송</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { marginTop: Spacing.sm }]}
          onPress={handleDiagnoseNotifications}
          activeOpacity={0.8}
        >
          <Icon name="activity" size={20} color={Colors.brand.accent} />
          <Text style={[styles.testButtonText, { color: Colors.brand.accent }]}>
            알림 시스템 진단
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { marginTop: Spacing.sm }]}
          onPress={handleResetNotifications}
          activeOpacity={0.8}
        >
          <Icon name="refresh-cw" size={20} color={Colors.feedback.warning} />
          <Text style={[styles.testButtonText, { color: Colors.feedback.warning }]}>
            알림 재설정
          </Text>
        </TouchableOpacity>
      </View>

      {/* 구독 상태 (프리미엄 컨텍스트 연동) */}
      {isPremium && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="crown" size={20} color={Colors.brand.accent} />
            <Text style={styles.sectionTitle}>구독 상태</Text>
          </View>

          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Text style={styles.subscriptionTier}>
                {premiumStatus.is_premium ? '프리미엄' : '무료'}
              </Text>
            </View>

            <Text style={styles.subscriptionFeatures}>
              {premiumStatus.ad_free && '✓ 광고 없음\n'}
              {premiumStatus.unlimited_storage && '✓ 무제한 저장\n'}
              {premiumStatus.premium_spreads && '✓ 프리미엄 스프레드'}
            </Text>
          </View>
        </View>
      )}

      {/* 조용한 시간 설정 모달 */}
      <Modal
        visible={showQuietHoursModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuietHoursModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>조용한 시간 설정</Text>
              <TouchableOpacity
                onPress={() => setShowQuietHoursModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="x" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              이 시간 동안에는 알림이 전송되지 않습니다.
            </Text>

            <View style={styles.timeSelectors}>
              <View style={styles.timeSelector}>
                <Text style={styles.timeSelectorLabel}>시작 시간</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {HOUR_OPTIONS.map((hour) => (
                    <TouchableOpacity
                      key={hour.value}
                      style={[
                        styles.timeOption,
                        tempQuietStart === hour.value && styles.timeOptionSelected
                      ]}
                      onPress={() => setTempQuietStart(hour.value)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        tempQuietStart === hour.value && styles.timeOptionTextSelected
                      ]}>
                        {hour.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.timeSelector}>
                <Text style={styles.timeSelectorLabel}>종료 시간</Text>
                <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                  {HOUR_OPTIONS.map((hour) => (
                    <TouchableOpacity
                      key={hour.value}
                      style={[
                        styles.timeOption,
                        tempQuietEnd === hour.value && styles.timeOptionSelected
                      ]}
                      onPress={() => setTempQuietEnd(hour.value)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        tempQuietEnd === hour.value && styles.timeOptionTextSelected
                      ]}>
                        {hour.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveQuietHours}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSaveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 시간대 선택 모달 */}
      <Modal
        visible={showTimezoneModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimezoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>시간대 선택</Text>
              <TouchableOpacity
                onPress={() => setShowTimezoneModal(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="x" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.timezoneList} showsVerticalScrollIndicator={false}>
              {TIMEZONE_OPTIONS.map((timezone) => (
                <TouchableOpacity
                  key={timezone.value}
                  style={styles.timezoneOption}
                  onPress={() => handleTimezoneSelect(timezone.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timezoneOptionText}>
                    {timezone.label}
                  </Text>
                  <Icon name="chevron-right" size={16} color={Colors.text.secondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // 권한 요청 UI
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionIconContainer: {
    marginBottom: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  permissionDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // 섹션 스타일
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  // 설정 항목
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  settingLeft: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  // 테스트 버튼
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.primary,
  },

  // 구독 상태
  subscriptionCard: {
    backgroundColor: Colors.surface.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  subscriptionTier: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  trialBadge: {
    fontSize: 12,
    color: Colors.brand.accent,
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  subscriptionUsage: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  subscriptionFeatures: {
    fontSize: 14,
    color: Colors.text.secondary,
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },

  // 시간 선택기
  timeSelectors: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  timeSelector: {
    flex: 1,
  },
  timeSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  timePickerScroll: {
    maxHeight: 200,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
  },
  timeOption: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: Colors.brand.primary,
  },
  timeOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  timeOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // 시간대 선택
  timezoneList: {
    maxHeight: 400,
  },
  timezoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  timezoneOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },

  // 저장 버튼
  modalSaveButton: {
    backgroundColor: Colors.brand.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

NotificationSettings.displayName = 'NotificationSettings';

export default NotificationSettings;