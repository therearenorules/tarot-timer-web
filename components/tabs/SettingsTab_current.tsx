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
  Switch,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {
  Colors,
  TextStyles,
  GlassStyles,
  ShadowStyles,
  Spacing,
  BorderRadius
} from '../DesignSystem';
import LanguageSelector from '../LanguageSelector';
// import { useNotification } from '../../contexts/NotificationContext';
// import { usePremium } from '../../contexts/PremiumContext';

const SettingsTab: React.FC = () => {
  const { t } = useTranslation();
  // TODO: Re-enable after fixing web compatibility
  // const {
  //   settings,
  //   hasPermissions,
  //   pushToken,
  //   isLoading,
  //   requestPermissions,
  //   updateSettings,
  //   sendTestNotification,
  // } = useNotification();
  // const { subscriptionStatus } = usePremium();

  // Temporary mock data for testing
  const settings = {
    hourlyEnabled: true,
    midnightResetEnabled: true,
    saveReminderEnabled: true,
    weekendEnabled: true,
    timezone: 'Asia/Seoul',
    quietHoursStart: 22,
    quietHoursEnd: 8,
  };
  const hasPermissions = false;
  const pushToken = null;
  const isLoading = false;
  const requestPermissions = () => console.log('Request permissions');
  const updateSettings = (newSettings: any) => console.log('Update settings:', newSettings);
  const sendTestNotification = () => console.log('Send test notification');
  const subscriptionStatus = null;

  // 프리미엄 관련 상태
  const [isPremium, setIsPremium] = useState(false);

  // 화면 및 테마 설정
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  // 타로 카드 설정
  const [cardStyle, setCardStyle] = useState('classic');
  const [cardAnimation, setCardAnimation] = useState(true);

  // 데이터 관리 설정
  const [autoBackup, setAutoBackup] = useState(true);

  // 알림 설정 모달 상태
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(settings.timezone);
  const [tempQuietHours, setTempQuietHours] = useState({
    start: settings.quietHoursStart,
    end: settings.quietHoursEnd,
  });

  // 시간대 목록
  const timezones = [
    { value: 'Asia/Seoul', label: '서울 (KST)' },
    { value: 'America/New_York', label: '뉴욕 (EST/EDT)' },
    { value: 'America/Los_Angeles', label: '로스앤젤레스 (PST/PDT)' },
    { value: 'Europe/London', label: '런던 (GMT/BST)' },
    { value: 'Europe/Paris', label: '파리 (CET/CEST)' },
    { value: 'Asia/Tokyo', label: '도쿄 (JST)' },
    { value: 'Asia/Shanghai', label: '상하이 (CST)' },
    { value: 'Australia/Sydney', label: '시드니 (AEST/AEDT)' },
  ];

  const handleUpgradePremium = () => {
    Alert.alert(
      '프리미엄 업그레이드',
      '프리미엄 기능을 이용하시겠습니까?\n• 모든 스프레드 잠금 해제\n• 고급 분석 기능\n• 무제한 저장\n• 광고 제거',
      [
        { text: '취소', style: 'cancel' },
        { text: '업그레이드', onPress: () => setIsPremium(true) }
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert('데이터 내보내기', '모든 데이터를 내보내시겠습니까?');
  };

  const handleDataImport = () => {
    Alert.alert('데이터 가져오기', '백업 파일을 선택해주세요.');
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      '모든 데이터 삭제',
      '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => {
          Alert.alert('삭제 완료', '모든 데이터가 삭제되었습니다.');
        }}
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>⚙️</Text>
        </View>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
      </View>

      {/* 프리미엄 멤버십 섹션 */}
      <View style={styles.premiumSection}>
        <View style={styles.premiumHeader}>
          <View style={styles.crownIcon}>
            <Text style={styles.crownText}>👑</Text>
          </View>
          <Text style={styles.premiumTitle}>프리미엄 멤버십</Text>
          {isPremium ? (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>활성화</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.upgradeBadge}
              onPress={handleUpgradePremium}
            >
              <Text style={styles.upgradeBadgeText}>업그레이드</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.premiumFeatures}>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>프리미엄 스프레드 잠금 해제</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>광고 없는 경험</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>무제한 저장소</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={handleUpgradePremium}
        >
          <Text style={styles.premiumButtonText}>
            {isPremium ? '프리미엄 관리' : '프리미엄 업그레이드'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 화면 및 테마 설정 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>🎨</Text>
          </View>
          <Text style={styles.sectionTitle}>화면 및 테마</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>다크 모드</Text>
            <Text style={styles.settingSubtitle}>Always on for mystical experience</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, darkModeEnabled && styles.toggleButtonActive]}
            onPress={() => setDarkModeEnabled(!darkModeEnabled)}
          >
            <View style={[styles.toggleThumb, darkModeEnabled && styles.toggleThumbActive]}>
              <Text style={styles.toggleIcon}>{darkModeEnabled ? '🌙' : '☀️'}</Text>
            </View>
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
          <Text style={styles.sectionTitle}>알림 설정</Text>
          {subscriptionStatus && !subscriptionStatus.features.hasNotifications && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>

        {/* 알림 권한 상태 */}
        <View style={styles.permissionSection}>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>
              {hasPermissions ? '✅ 알림 권한 허용됨' : '⚠️ 알림 권한 필요'}
            </Text>
            <Text style={styles.permissionSubtitle}>
              {hasPermissions
                ? '푸시 알림을 받을 수 있습니다'
                : '알림을 받으려면 권한을 허용해주세요'
              }
            </Text>
            {pushToken && (
              <Text style={styles.tokenText} numberOfLines={1}>
                Token: {pushToken.substring(0, 20)}...
              </Text>
            )}
          </View>
          {!hasPermissions && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermissions}
            >
              <Text style={styles.permissionButtonText}>권한 요청</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 시간별 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>시간별 타로 알림</Text>
            <Text style={styles.settingSubtitle}>매 시간마다 타로 카드 알림 받기</Text>
          </View>
          <Switch
            value={settings.hourlyEnabled}
            onValueChange={(value) => updateSettings({ hourlyEnabled: value })}
            trackColor={{ false: '#4a4458', true: '#f4d03f' }}
            thumbColor={settings.hourlyEnabled ? '#7b2cbf' : '#9b8db8'}
            disabled={!hasPermissions}
          />
        </View>

        {/* 자정 리셋 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>자정 리셋 알림</Text>
            <Text style={styles.settingSubtitle}>새로운 하루 시작 시 알림</Text>
          </View>
          <Switch
            value={settings.midnightResetEnabled}
            onValueChange={(value) => updateSettings({ midnightResetEnabled: value })}
            trackColor={{ false: '#4a4458', true: '#f4d03f' }}
            thumbColor={settings.midnightResetEnabled ? '#7b2cbf' : '#9b8db8'}
            disabled={!hasPermissions}
          />
        </View>

        {/* 일기 저장 리마인더 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>일기 저장 리마인더</Text>
            <Text style={styles.settingSubtitle}>매일 저녁 일기 작성 알림</Text>
          </View>
          <Switch
            value={settings.saveReminderEnabled}
            onValueChange={(value) => updateSettings({ saveReminderEnabled: value })}
            trackColor={{ false: '#4a4458', true: '#f4d03f' }}
            thumbColor={settings.saveReminderEnabled ? '#7b2cbf' : '#9b8db8'}
            disabled={!hasPermissions}
          />
        </View>

        {/* 주말 알림 */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>주말 알림</Text>
            <Text style={styles.settingSubtitle}>주말에도 알림 받기</Text>
          </View>
          <Switch
            value={settings.weekendEnabled}
            onValueChange={(value) => updateSettings({ weekendEnabled: value })}
            trackColor={{ false: '#4a4458', true: '#f4d03f' }}
            thumbColor={settings.weekendEnabled ? '#7b2cbf' : '#9b8db8'}
            disabled={!hasPermissions || !settings.hourlyEnabled}
          />
        </View>

        {/* 시간대 설정 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowTimezoneModal(true)}
          disabled={!hasPermissions}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>시간대</Text>
            <Text style={styles.settingSubtitle}>
              {timezones.find(tz => tz.value === settings.timezone)?.label || settings.timezone}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* 조용한 시간 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowQuietHoursModal(true)}
          disabled={!hasPermissions || !settings.hourlyEnabled}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>조용한 시간</Text>
            <Text style={styles.settingSubtitle}>
              {String(settings.quietHoursStart).padStart(2, '0')}:00 - {String(settings.quietHoursEnd).padStart(2, '0')}:00
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* 테스트 알림 */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={sendTestNotification}
          disabled={!hasPermissions || isLoading}
        >
          <Text style={styles.testButtonText}>
            {isLoading ? '전송 중...' : '테스트 알림 보내기'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 타로 카드 설정 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>🃏</Text>
          </View>
          <Text style={styles.sectionTitle}>타로 카드</Text>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>카드 스타일</Text>
            <Text style={styles.settingSubtitle}>클래식 라이더-웨이트</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>카드 애니메이션</Text>
            <Text style={styles.settingSubtitle}>카드 뒤집기 효과</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, cardAnimation && styles.toggleButtonActive]}
            onPress={() => setCardAnimation(!cardAnimation)}
          >
            <View style={[styles.toggleThumb, cardAnimation && styles.toggleThumbActive]}>
              <Text style={styles.toggleIcon}>{cardAnimation ? '🃏' : '🎴'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>카드 의미 언어</Text>
            <Text style={styles.settingSubtitle}>한국어 + 영어</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 데이터 관리 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>💾</Text>
          </View>
          <Text style={styles.sectionTitle}>데이터 관리</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>자동 백업</Text>
            <Text style={styles.settingSubtitle}>클라우드 자동 저장</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleButton, autoBackup && styles.toggleButtonActive]}
            onPress={() => setAutoBackup(!autoBackup)}
          >
            <View style={[styles.toggleThumb, autoBackup && styles.toggleThumbActive]}>
              <Text style={styles.toggleIcon}>{autoBackup ? '☁️' : '💾'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={handleDataExport}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>데이터 내보내기</Text>
            <Text style={styles.settingSubtitle}>모든 리딩과 저널 백업</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleDataImport}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>데이터 가져오기</Text>
            <Text style={styles.settingSubtitle}>백업 파일에서 복원</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAllData}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, styles.dangerText]}>모든 데이터 삭제</Text>
            <Text style={styles.settingSubtitle}>되돌릴 수 없습니다</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 앱 정보 */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>ℹ️</Text>
          </View>
          <Text style={styles.sectionTitle}>앱 정보</Text>
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>버전 정보</Text>
            <Text style={styles.settingSubtitle}>v2.1.0 - Mystic Edition</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>개발자</Text>
            <Text style={styles.settingSubtitle}>Tarot Timer Team</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>개인정보 처리방침</Text>
            <Text style={styles.settingSubtitle}>데이터 보호 정책</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>오픈소스 라이센스</Text>
            <Text style={styles.settingSubtitle}>사용된 라이브러리</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomSpace} />

      {/* 시간대 선택 모달 */}
      <Modal
        visible={showTimezoneModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimezoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>시간대 선택</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTimezoneModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {timezones.map((timezone) => (
                <TouchableOpacity
                  key={timezone.value}
                  style={[
                    styles.timezoneOption,
                    selectedTimezone === timezone.value && styles.timezoneOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedTimezone(timezone.value);
                    updateSettings({ timezone: timezone.value });
                    setShowTimezoneModal(false);
                  }}
                >
                  <Text style={[
                    styles.timezoneOptionText,
                    selectedTimezone === timezone.value && styles.timezoneOptionTextSelected
                  ]}>
                    {timezone.label}
                  </Text>
                  {selectedTimezone === timezone.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.modalTitle}>조용한 시간 설정</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowQuietHoursModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.quietHoursDescription}>
                이 시간 동안에는 알림을 받지 않습니다
              </Text>

              <View style={styles.timePickerContainer}>
                <View style={styles.timePickerSection}>
                  <Text style={styles.timePickerLabel}>시작 시간</Text>
                  <View style={styles.timePickerRow}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.hourButton,
                          tempQuietHours.start === i && styles.hourButtonSelected
                        ]}
                        onPress={() => setTempQuietHours(prev => ({ ...prev, start: i }))}
                      >
                        <Text style={[
                          styles.hourButtonText,
                          tempQuietHours.start === i && styles.hourButtonTextSelected
                        ]}>
                          {String(i).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.timePickerSection}>
                  <Text style={styles.timePickerLabel}>종료 시간</Text>
                  <View style={styles.timePickerRow}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.hourButton,
                          tempQuietHours.end === i && styles.hourButtonSelected
                        ]}
                        onPress={() => setTempQuietHours(prev => ({ ...prev, end: i }))}
                      >
                        <Text style={[
                          styles.hourButtonText,
                          tempQuietHours.end === i && styles.hourButtonTextSelected
                        ]}>
                          {String(i).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowQuietHoursModal(false)}
                >
                  <Text style={styles.modalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => {
                    updateSettings({
                      quietHoursStart: tempQuietHours.start,
                      quietHoursEnd: tempQuietHours.end,
                    });
                    setShowQuietHoursModal(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                    저장
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
  
  // 프리미엄 섹션
  premiumSection: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.brand.accent,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  crownIcon: {
    marginRight: Spacing.sm,
  },
  crownText: {
    fontSize: 20,
  },
  premiumTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    fontFamily: 'NotoSansKR_700Bold',
  },
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
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
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
  languageButton: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'NotoSansKR_700Bold',
  },
  languageSelector: {
    flex: 1,
  },
  dangerText: {
    color: '#ef4444',
  },
  bottomSpace: {
    height: 100,
  },
  
  // 커스텀 토글 버튼
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

  // Notification-specific styles
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
  tokenText: {
    fontSize: 12,
    color: Colors.text.muted,
    fontFamily: 'Courier',
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface.secondary,
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

  // Timezone modal styles
  timezoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.1)',
  },
  timezoneOptionSelected: {
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    borderRadius: BorderRadius.md,
  },
  timezoneOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  timezoneOptionTextSelected: {
    color: Colors.brand.accent,
    fontWeight: '600',
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  checkmark: {
    fontSize: 18,
    color: Colors.brand.accent,
    fontWeight: 'bold',
  },

  // Quiet hours modal styles
  quietHoursDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: 'NotoSansKR_400Regular',
  },
  timePickerContainer: {
    marginBottom: Spacing.xl,
  },
  timePickerSection: {
    marginBottom: Spacing.lg,
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontFamily: 'NotoSansKR_600SemiBold',
  },
  timePickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(155, 141, 184, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(155, 141, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hourButtonSelected: {
    backgroundColor: Colors.brand.accent,
    borderColor: Colors.brand.accent,
  },
  hourButtonText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
    fontFamily: 'NotoSansKR_500Medium',
  },
  hourButtonTextSelected: {
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'NotoSansKR_700Bold',
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
});

export default SettingsTab;