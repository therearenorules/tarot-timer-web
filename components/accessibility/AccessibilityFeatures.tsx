import React, { createContext, useContext, useEffect } from 'react';
import { useSafeState } from '../../hooks/useSafeState';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// 접근성 설정 인터페이스
interface AccessibilitySettings {
  // 시각적 접근성
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  colorBlindFriendly: boolean;

  // 청각적 접근성
  enableVibration: boolean;
  enableSoundEffects: boolean;

  // 인지적 접근성
  slowAnimations: boolean;
  simplifiedInterface: boolean;
  confirmActions: boolean;

  // 모터 접근성
  largeButtons: boolean;
  gestureAlternatives: boolean;

  // 언어 접근성
  screenReaderOptimized: boolean;
  descriptiveLabels: boolean;
}

// 기본 설정
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  colorBlindFriendly: false,
  enableVibration: true,
  enableSoundEffects: true,
  slowAnimations: false,
  simplifiedInterface: false,
  confirmActions: false,
  largeButtons: false,
  gestureAlternatives: false,
  screenReaderOptimized: false,
  descriptiveLabels: false,
};

// 접근성 컨텍스트
const AccessibilityContext = createContext<{
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  resetSettings: () => void;
}>({
  settings: defaultSettings,
  updateSetting: () => {},
  resetSettings: () => {},
});

// 접근성 프로바이더
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useSafeState<AccessibilitySettings>(defaultSettings);

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('accessibility_settings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('접근성 설정 로드 실패:', error);
    }
  };

  const updateSetting = async (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await AsyncStorage.setItem('accessibility_settings', JSON.stringify(newSettings));

      // 햅틱 피드백
      if (newSettings.enableVibration) {
        Haptics.selectionAsync();
      }

      // 설정 변경에 대한 안내
      if (key === 'highContrast' && value) {
        Alert.alert('높은 대비 모드', '높은 대비 모드가 활성화되었습니다. 더 선명한 색상으로 표시됩니다.');
      }

    } catch (error) {
      console.error('접근성 설정 저장 실패:', error);
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    try {
      await AsyncStorage.removeItem('accessibility_settings');
      if (settings.enableVibration) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('설정 초기화', '접근성 설정이 초기화되었습니다.');
    } catch (error) {
      console.error('접근성 설정 초기화 실패:', error);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// 접근성 훅
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility는 AccessibilityProvider 내에서 사용해야 합니다.');
  }
  return context;
};

// 접근성 설정 컴포넌트
interface AccessibilityFeaturesProps {
  visible: boolean;
  onClose: () => void;
}

export const AccessibilityFeatures: React.FC<AccessibilityFeaturesProps> = ({
  visible,
  onClose
}) => {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  if (!visible) return null;

  // 아이콘 렌더링
  const renderIcon = (iconType: string, size: number = 24) => {
    const color = '#f4d03f';

    switch (iconType) {
      case 'eye':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
          </Svg>
        );
      case 'volume':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M11 5L6 9H2v6h4l5 4V5z" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'brain':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v15A2.5 2.5 0 0 0 9.5 22h5a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 14.5 2h-5z" stroke={color} strokeWidth="2" fill="none" />
            <Path d="M9 7h6M9 11h6M9 15h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'hand':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M18 11V8a2 2 0 0 0-4 0v3a2 2 0 0 0-4 0V8a2 2 0 0 0-4 0v8a6 6 0 0 0 12 0v-5z" stroke={color} strokeWidth="2" fill="none" />
          </Svg>
        );
      case 'message':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" fill="none" />
          </Svg>
        );
      case 'refresh':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M23 4v6h-6M1 20v-6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      default:
        return null;
    }
  };

  // 설정 섹션 컴포넌트
  const SettingSection: React.FC<{
    title: string;
    icon: string;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {renderIcon(icon, 20)}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  // 개별 설정 아이템
  const SettingItem: React.FC<{
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    accessibilityLabel?: string;
  }> = ({ title, description, value, onValueChange, accessibilityLabel }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#f4d03f' }}
        thumbColor={value ? '#7b2cbf' : '#f4f3f4'}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1625', '#2d1b47']}
        style={styles.gradientBackground}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>접근성 설정</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="접근성 설정 닫기"
            accessibilityRole="button"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* 시각적 접근성 */}
          <SettingSection title="시각적 접근성" icon="eye">
            <SettingItem
              title="높은 대비"
              description="색상 대비를 높여 가독성을 향상시킵니다"
              value={settings.highContrast}
              onValueChange={(value) => updateSetting('highContrast', value)}
              accessibilityLabel="높은 대비 모드 토글"
            />
            <SettingItem
              title="큰 텍스트"
              description="모든 텍스트를 더 크게 표시합니다"
              value={settings.largeText}
              onValueChange={(value) => updateSetting('largeText', value)}
            />
            <SettingItem
              title="움직임 줄이기"
              description="애니메이션과 전환 효과를 최소화합니다"
              value={settings.reduceMotion}
              onValueChange={(value) => updateSetting('reduceMotion', value)}
            />
            <SettingItem
              title="색맹 친화적"
              description="색맹 사용자를 위한 색상 조정을 적용합니다"
              value={settings.colorBlindFriendly}
              onValueChange={(value) => updateSetting('colorBlindFriendly', value)}
            />
          </SettingSection>

          {/* 청각적 접근성 */}
          <SettingSection title="청각적 접근성" icon="volume">
            <SettingItem
              title="진동 사용"
              description="터치 피드백을 위한 진동을 활성화합니다"
              value={settings.enableVibration}
              onValueChange={(value) => updateSetting('enableVibration', value)}
            />
            <SettingItem
              title="소리 효과"
              description="상호작용을 위한 소리 효과를 활성화합니다"
              value={settings.enableSoundEffects}
              onValueChange={(value) => updateSetting('enableSoundEffects', value)}
            />
          </SettingSection>

          {/* 인지적 접근성 */}
          <SettingSection title="인지적 접근성" icon="brain">
            <SettingItem
              title="느린 애니메이션"
              description="모든 애니메이션을 더 천천히 재생합니다"
              value={settings.slowAnimations}
              onValueChange={(value) => updateSetting('slowAnimations', value)}
            />
            <SettingItem
              title="단순한 인터페이스"
              description="복잡한 요소를 숨기고 핵심 기능만 표시합니다"
              value={settings.simplifiedInterface}
              onValueChange={(value) => updateSetting('simplifiedInterface', value)}
            />
            <SettingItem
              title="작업 확인"
              description="중요한 작업 전에 확인 메시지를 표시합니다"
              value={settings.confirmActions}
              onValueChange={(value) => updateSetting('confirmActions', value)}
            />
          </SettingSection>

          {/* 모터 접근성 */}
          <SettingSection title="모터 접근성" icon="hand">
            <SettingItem
              title="큰 버튼"
              description="모든 버튼을 더 크게 만들어 터치하기 쉽게 합니다"
              value={settings.largeButtons}
              onValueChange={(value) => updateSetting('largeButtons', value)}
            />
            <SettingItem
              title="제스처 대안"
              description="스와이프 제스처를 버튼으로 대체합니다"
              value={settings.gestureAlternatives}
              onValueChange={(value) => updateSetting('gestureAlternatives', value)}
            />
          </SettingSection>

          {/* 언어 접근성 */}
          <SettingSection title="언어 접근성" icon="message">
            <SettingItem
              title="스크린 리더 최적화"
              description="VoiceOver/TalkBack 사용에 최적화합니다"
              value={settings.screenReaderOptimized}
              onValueChange={(value) => updateSetting('screenReaderOptimized', value)}
            />
            <SettingItem
              title="자세한 라벨"
              description="UI 요소에 더 자세한 설명을 제공합니다"
              value={settings.descriptiveLabels}
              onValueChange={(value) => updateSetting('descriptiveLabels', value)}
            />
          </SettingSection>

          {/* 설정 초기화 */}
          <View style={styles.resetSection}>
            <TouchableOpacity
              onPress={resetSettings}
              style={styles.resetButton}
              accessibilityLabel="접근성 설정 초기화"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={['#7b2cbf', '#f4d03f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetButtonGradient}
              >
                {renderIcon('refresh', 20)}
                <Text style={styles.resetButtonText}>설정 초기화</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* 도움말 */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>접근성 도움말</Text>
            <Text style={styles.helpText}>
              이 설정들은 다양한 능력을 가진 사용자들이 앱을 더 쉽게 사용할 수 있도록 도와줍니다.
              각 설정을 활성화하면 즉시 적용되며, 언제든지 변경할 수 있습니다.
            </Text>
            <Text style={styles.helpText}>
              시각 장애가 있는 경우 '스크린 리더 최적화'와 '자세한 라벨'을 활성화하시기 바랍니다.
              운동 능력에 제한이 있는 경우 '큰 버튼'과 '제스처 대안'을 사용해보세요.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 184, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#f4d03f',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f4d03f',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(212, 184, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.2)',
  },
  settingContent: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#d4b8ff',
    lineHeight: 20,
  },
  resetSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  resetButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#7b2cbf',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  resetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpSection: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(123, 44, 191, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(123, 44, 191, 0.3)',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4d03f',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 14,
    color: '#d4b8ff',
    lineHeight: 20,
    marginBottom: 10,
  },
});

export default AccessibilityFeatures;