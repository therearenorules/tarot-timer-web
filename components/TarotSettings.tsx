import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Icon } from './Icon';
import { GradientButton } from './GradientButton';
import { 
  Colors, 
  GlassStyles, 
  ShadowStyles, 
  TextStyles, 
  CompositeStyles,
  Spacing,
  BorderRadius 
} from './DesignSystem';
import { useTheme, ThemeStorage } from './ThemeSystem';
import { soundManager, TarotFeedback } from '../utils/SoundEffects';

// Settings 저장 키
const SETTINGS_STORAGE_KEYS = {
  PREMIUM_STATUS: '@tarot_premium_status',
  LANGUAGE: '@tarot_language',
  NOTIFICATIONS_SPREAD: '@tarot_notifications_spread',
  SOUND_EFFECTS: '@tarot_sound_effects',
  HAPTIC_FEEDBACK: '@tarot_haptic_feedback',
  SOUND_VOLUME: '@tarot_sound_volume',
};

// Settings 상태 타입
interface SettingsState {
  isPremium: boolean;
  language: 'ko' | 'en';
  notificationsSpread: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  soundVolume: number;
}

// 간단한 스토리지 (AsyncStorage 대신)
const settingsStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Settings save failed:', error);
    }
  },
};

export function TarotSettings() {
  const { theme, isDark, toggleTheme, setDarkTheme, setLightTheme, colors, styles: themeStyles } = useTheme('dark');
  
  const [settings, setSettings] = useState<SettingsState>({
    isPremium: false,
    language: 'ko',
    notificationsSpread: false,
    soundEffects: true,
    hapticFeedback: true,
    soundVolume: 0.7,
  });

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings: SettingsState = {
        isPremium: (await settingsStorage.getItem(SETTINGS_STORAGE_KEYS.PREMIUM_STATUS)) === 'true',
        language: ((await settingsStorage.getItem(SETTINGS_STORAGE_KEYS.LANGUAGE)) as 'ko' | 'en') || 'ko',
        notificationsSpread: (await settingsStorage.getItem(SETTINGS_STORAGE_KEYS.NOTIFICATIONS_SPREAD)) === 'true',
        soundEffects: (await settingsStorage.getItem(SETTINGS_STORAGE_KEYS.SOUND_EFFECTS)) !== 'false', // 기본 true
        hapticFeedback: (await settingsStorage.getItem(SETTINGS_STORAGE_KEYS.HAPTIC_FEEDBACK)) !== 'false', // 기본 true
        soundVolume: parseFloat((await settingsStorage.getItem(SETTINGS_STORAGE_KEYS.SOUND_VOLUME)) || '0.7'),
      };
      setSettings(loadedSettings);
      
      // 사운드 매니저 초기 설정
      soundManager.setSoundEnabled(loadedSettings.soundEffects);
      soundManager.setHapticEnabled(loadedSettings.hapticFeedback);
      soundManager.setVolume(loadedSettings.soundVolume);
    } catch (error) {
      console.error('Settings load failed:', error);
    }
  };

  const updateSetting = async <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // 사운드 매니저 업데이트
    if (key === 'soundEffects') {
      soundManager.setSoundEnabled(value as boolean);
      if (value) {
        TarotFeedback.cardSelect(); // 테스트 사운드 재생
      }
    } else if (key === 'hapticFeedback') {
      soundManager.setHapticEnabled(value as boolean);
      if (value) {
        TarotFeedback.cardSelect(); // 테스트 햅틱 재생
      }
    } else if (key === 'soundVolume') {
      soundManager.setVolume(value as number);
      TarotFeedback.cardSelect(); // 볼륨 테스트
    }
    
    // 저장
    try {
      const storageKey = SETTINGS_STORAGE_KEYS[key.toUpperCase() as keyof typeof SETTINGS_STORAGE_KEYS];
      if (storageKey) {
        await settingsStorage.setItem(storageKey, String(value));
      }
    } catch (error) {
      console.error('Setting save failed:', error);
    }
  };

  // 테마 변경 핸들러
  const handleThemeToggle = async () => {
    toggleTheme();
    await ThemeStorage.saveTheme(isDark ? 'light' : 'dark');
    TarotFeedback.cardSelect();
    Alert.alert(
      '🌓 테마 변경',
      `테마가 ${isDark ? '라이트' : '다크'} 모드로 변경되었습니다.`,
      [{ text: '확인' }]
    );
  };

  // 프리미엄 관리 버튼 핸들러
  const handlePremiumManagement = () => {
    Alert.alert(
      '👑 프리미엄 멤버십',
      settings.isPremium 
        ? '프리미엄 기능을 이용 중입니다.\n\n• 프리미엄 스프레드 이용 가능\n• 광고 없는 경험\n• 무제한 저장 공간'
        : '프리미엄 멤버십으로 업그레이드하시겠습니까?\n\n🌟 프리미엄 혜택:\n• 프리미엄 스프레드 이용 가능\n• 광고 없는 경험\n• 무제한 저장 공간',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: settings.isPremium ? '관리' : '업그레이드', 
          onPress: () => {
            // 데모용: 프리미엄 상태 토글
            updateSetting('isPremium', !settings.isPremium);
            Alert.alert(
              settings.isPremium ? '프리미엄 해제' : '프리미엄 활성화',
              settings.isPremium ? '프리미엄 기능이 해제되었습니다.' : '프리미엄 기능이 활성화되었습니다!',
              [{ text: '확인' }]
            );
          }
        }
      ]
    );
  };

  // 언어 변경 핸들러
  const handleLanguageChange = () => {
    const newLanguage = settings.language === 'ko' ? 'en' : 'ko';
    updateSetting('language', newLanguage);
    Alert.alert(
      '언어 변경',
      `언어가 ${newLanguage === 'ko' ? '한국어' : 'English'}로 변경되었습니다.\n\n완전한 적용을 위해 앱을 다시 시작해주세요.`,
      [{ text: '확인' }]
    );
  };

  // 개인정보 처리방침
  const handlePrivacyPolicy = () => {
    Alert.alert(
      '🛡️ 개인정보 처리방침',
      '개인정보 처리방침 페이지로 이동하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '이동', 
          onPress: () => {
            // 실제 앱에서는 웹뷰나 외부 링크로 연결
            Alert.alert('알림', '개인정보 처리방침 페이지는 준비 중입니다.');
          }
        }
      ]
    );
  };

  // 데이터 관리
  const handleDataManagement = () => {
    Alert.alert(
      '📊 데이터 관리',
      '저장된 타로 데이터를 관리하시겠습니까?\n\n• 데이터 내보내기\n• 데이터 초기화\n• 백업 및 복원',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '데이터 초기화', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '⚠️ 데이터 초기화',
              '모든 타로 데이터가 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.\n\n정말 진행하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '초기화',
                  style: 'destructive',
                  onPress: () => {
                    // 실제 데이터 초기화 로직
                    Alert.alert('완료', '모든 데이터가 초기화되었습니다.');
                  }
                }
              ]
            );
          }
        },
        { text: '데이터 내보내기', onPress: () => Alert.alert('알림', '데이터 내보내기 기능은 준비 중입니다.') }
      ]
    );
  };

  // 도움말 & FAQ
  const handleHelp = () => {
    Alert.alert(
      '❓ 도움말 & FAQ',
      '도움이 필요하신가요?\n\n자주 묻는 질문과 사용법을 확인하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: 'FAQ 보기', onPress: () => Alert.alert('알림', 'FAQ 페이지는 준비 중입니다.') }
      ]
    );
  };

  // 개발자 지원
  const handleDeveloperSupport = () => {
    Alert.alert(
      '💝 개발자 지원하기',
      '이 앱이 도움이 되셨나요?\n개발자를 지원해주세요!\n\n• ⭐ 리뷰 작성\n• 💌 피드백 보내기\n• ☕ 커피 한 잔 사기',
      [
        { text: '취소', style: 'cancel' },
        { text: '리뷰 작성', onPress: () => Alert.alert('감사합니다!', '리뷰 페이지로 이동합니다.') },
        { text: '피드백 보내기', onPress: () => Alert.alert('감사합니다!', '피드백 페이지로 이동합니다.') }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.hero }]}>⚙️ 설정</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>당신만의 신비로운 경험을 조정하세요</Text>
      </View>

      {/* 프리미엄 멤버십 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👑 프리미엄 멤버십</Text>
        <View style={styles.premiumCard}>
          <View style={styles.premiumStatus}>
            <View style={[styles.premiumIndicator, settings.isPremium && styles.premiumIndicatorActive]}>
              <Icon 
                name="star" 
                size={16} 
                color={settings.isPremium ? '#f4d03f' : '#666'} 
              />
            </View>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumText}>
                🌟 프리미엄 기능 {settings.isPremium ? '[활성화]' : '[비활성화]'}
              </Text>
              <Text style={styles.premiumFeatures}>
                • 프리미엄 스프레드 이용 가능{'\n'}
                • 광고 없는 경험{'\n'}
                • 무제한 저장 공간
              </Text>
            </View>
          </View>
          <GradientButton
            onPress={handlePremiumManagement}
            title="프리미엄 관리"
            size="small"
            variant="outline"
          />
        </View>
      </View>

      {/* 디스플레이 & 테마 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.brand.accent }]}>🌓 디스플레이 & 테마</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.glass.primary, borderColor: colors.border.soft }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name={isDark ? "moon" : "sun"} size={18} color={colors.brand.accent} />
              <Text style={[styles.settingLabel, { color: colors.text.primary }]}>테마 모드</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.text.tertiary }]}>
                {isDark ? '[●○] 다크' : '[○●] 라이트'}
              </Text>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border.medium, true: colors.brand.secondary }}
                thumbColor={isDark ? colors.brand.accent : colors.text.muted}
              />
            </View>
          </View>
          <View style={[styles.settingDivider, { backgroundColor: colors.border.soft }]} />
          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name="globe" size={18} color={colors.brand.accent} />
              <Text style={[styles.settingLabel, { color: colors.text.primary }]}>언어</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.text.tertiary }]}>
                {settings.language === 'ko' ? '한국어' : 'English'} 
                <Text style={[styles.languageToggle, { color: colors.brand.accent }]}> [🌍 {settings.language === 'ko' ? 'EN' : 'KO'}]</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 알림 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 알림</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>스프레드 완료 알림</Text>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>
                {settings.notificationsSpread ? '[●○]' : '[○●]'}
              </Text>
              <Switch
                value={settings.notificationsSpread}
                onValueChange={(value) => updateSetting('notificationsSpread', value)}
                trackColor={{ false: '#333', true: '#7b2cbf' }}
                thumbColor={settings.notificationsSpread ? '#f4d03f' : '#999'}
              />
            </View>
          </View>
        </View>
      </View>

      {/* 사운드 & 햅틱 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.brand.accent }]}>🔊 사운드 & 햅틱</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.glass.primary, borderColor: colors.border.soft }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name={settings.soundEffects ? "volume2" : "volume-x"} size={18} color={colors.brand.accent} />
              <Text style={[styles.settingLabel, { color: colors.text.primary }]}>사운드 이펙트</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.text.tertiary }]}>
                {settings.soundEffects ? '[●○] ON' : '[○●] OFF'}
              </Text>
              <Switch
                value={settings.soundEffects}
                onValueChange={(value) => updateSetting('soundEffects', value)}
                trackColor={{ false: colors.border.medium, true: colors.brand.secondary }}
                thumbColor={settings.soundEffects ? colors.brand.accent : colors.text.muted}
              />
            </View>
          </View>
          
          {/* 볼륨 컨트롤 */}
          {settings.soundEffects && (
            <>
              <View style={[styles.settingDivider, { backgroundColor: colors.border.soft }]} />
              <View style={styles.settingItem}>
                <View style={styles.settingLabelWithIcon}>
                  <Icon name="volume2" size={18} color={colors.brand.accent} />
                  <Text style={[styles.settingLabel, { color: colors.text.primary }]}>볼륨</Text>
                </View>
                <View style={styles.volumeControl}>
                  <Text style={[styles.volumeText, { color: colors.text.tertiary }]}>
                    {Math.round(settings.soundVolume * 100)}%
                  </Text>
                  <View style={styles.volumeButtons}>
                    <TouchableOpacity 
                      style={[styles.volumeButton, { borderColor: colors.border.soft }]}
                      onPress={() => {
                        const newVolume = Math.max(0, settings.soundVolume - 0.2);
                        updateSetting('soundVolume', newVolume);
                      }}
                    >
                      <Text style={[styles.volumeButtonText, { color: colors.text.primary }]}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.volumeButton, { borderColor: colors.border.soft }]}
                      onPress={() => {
                        const newVolume = Math.min(1, settings.soundVolume + 0.2);
                        updateSetting('soundVolume', newVolume);
                      }}
                    >
                      <Text style={[styles.volumeButtonText, { color: colors.text.primary }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
          
          <View style={[styles.settingDivider, { backgroundColor: colors.border.soft }]} />
          <View style={styles.settingItem}>
            <View style={styles.settingLabelWithIcon}>
              <Icon name={settings.hapticFeedback ? "zap" : "zap-off"} size={18} color={colors.brand.accent} />
              <Text style={[styles.settingLabel, { color: colors.text.primary }]}>햅틱 피드백</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.text.tertiary }]}>
                {settings.hapticFeedback ? '[●○] ON' : '[○●] OFF'}
              </Text>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => updateSetting('hapticFeedback', value)}
                trackColor={{ false: colors.border.medium, true: colors.brand.secondary }}
                thumbColor={settings.hapticFeedback ? colors.brand.accent : colors.text.muted}
              />
            </View>
          </View>
          
          {/* 사운드 테스트 버튼 */}
          <View style={[styles.settingDivider, { backgroundColor: colors.border.soft }]} />
          <TouchableOpacity 
            style={styles.testSoundButton} 
            onPress={() => {
              TarotFeedback.mysticalMoment();
            }}
          >
            <Icon name="play" size={18} color={colors.brand.accent} />
            <Text style={[styles.testSoundText, { color: colors.text.primary }]}>사운드 테스트</Text>
            <Text style={[styles.testSoundSubtext, { color: colors.text.tertiary }]}>미스틱한 차임 소리</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 개인정보 & 보안 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛡️ 개인정보 & 보안</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
            <Icon name="shield" size={18} color="#d4b8ff" />
            <Text style={styles.menuText}>[개인정보 처리방침]</Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
          <View style={styles.settingDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleDataManagement}>
            <Icon name="database" size={18} color="#d4b8ff" />
            <Text style={styles.menuText}>[데이터 관리]</Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 지원 & 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ 지원 & 정보</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
            <Icon name="help-circle" size={18} color="#d4b8ff" />
            <Text style={styles.menuText}>[도움말 & FAQ]</Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
          <View style={styles.settingDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleDeveloperSupport}>
            <Icon name="heart" size={18} color="#d4b8ff" />
            <Text style={styles.menuText}>[개발자 지원하기]</Text>
            <Icon name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 앱 정보 */}
      <View style={styles.appInfo}>
        <Text style={styles.versionText}>버전 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 Mystical Tarot</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Spacing.lg,
  },
  
  // Header styles
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    ...TextStyles.goldTitle,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    ...TextStyles.subtitle,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Section styles
  section: {
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...TextStyles.title,
    marginBottom: Spacing.md,
  },
  
  // Premium card styles
  premiumCard: {
    ...GlassStyles.cardElevated,
    ...ShadowStyles.brandGlow,
  },
  premiumStatus: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  premiumIndicator: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.glass.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  premiumIndicatorActive: {
    backgroundColor: Colors.brand.accent + '33',
    borderColor: Colors.border.focus,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumText: {
    ...TextStyles.headline,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  premiumFeatures: {
    ...TextStyles.body,
    color: Colors.text.tertiary,
    lineHeight: 20,
  },
  
  // Setting card styles
  settingCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  
  // 새로운 스타일: 아이콘과 레이블 그룹
  settingLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    ...TextStyles.headline,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingValueText: {
    ...TextStyles.body,
    fontWeight: '600',
  },
  languageToggle: {
    fontWeight: 'bold',
  },
  settingDivider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  
  // 볼륨 컨트롤 스타일
  volumeControl: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: 120,
  },
  volumeText: {
    ...TextStyles.caption,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  volumeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  volumeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  volumeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // 사운드 테스트 버튼
  testSoundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  testSoundText: {
    ...TextStyles.headline,
    flex: 1,
  },
  testSoundSubtext: {
    ...TextStyles.caption,
    fontStyle: 'italic',
  },
  
  // Menu item styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  menuText: {
    flex: 1,
    ...TextStyles.headline,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  
  // App info styles
  appInfo: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  versionText: {
    ...TextStyles.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  copyrightText: {
    ...TextStyles.caption,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});