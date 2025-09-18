import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle } from 'react-native-svg';

// 테마 타입 정의
export type ThemeMode = 'light' | 'dark' | 'auto' | 'mystic';

// 색상 팔레트 정의
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// 테마별 색상 정의
const themes: Record<ThemeMode, ColorPalette> = {
  // 라이트 모드
  light: {
    primary: '#7b2cbf',
    secondary: '#f4d03f',
    accent: '#d4b8ff',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#2d1b47',
    textSecondary: '#6c757d',
    border: '#e9ecef',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },

  // 다크 모드 (기존 미스틱 테마)
  dark: {
    primary: '#7b2cbf',
    secondary: '#f4d03f',
    accent: '#d4b8ff',
    background: '#1a1625',
    surface: '#2d1b47',
    text: '#ffffff',
    textSecondary: '#d4b8ff',
    border: 'rgba(212, 184, 255, 0.2)',
    success: '#20c997',
    warning: '#ffc107',
    error: '#e74c3c',
    info: '#3498db',
  },

  // 자동 모드 (시스템 설정 따름, 기본은 다크)
  auto: {
    primary: '#7b2cbf',
    secondary: '#f4d03f',
    accent: '#d4b8ff',
    background: '#1a1625',
    surface: '#2d1b47',
    text: '#ffffff',
    textSecondary: '#d4b8ff',
    border: 'rgba(212, 184, 255, 0.2)',
    success: '#20c997',
    warning: '#ffc107',
    error: '#e74c3c',
    info: '#3498db',
  },

  // 미스틱 모드 (기존 기본 테마)
  mystic: {
    primary: '#7b2cbf',
    secondary: '#f4d03f',
    accent: '#d4b8ff',
    background: '#1a1625',
    surface: '#2d1b47',
    text: '#ffffff',
    textSecondary: '#d4b8ff',
    border: 'rgba(212, 184, 255, 0.2)',
    success: '#20c997',
    warning: '#ffc107',
    error: '#e74c3c',
    info: '#3498db',
  },
};

// 테마 컨텍스트
interface ThemeContextType {
  mode: ThemeMode;
  colors: ColorPalette;
  toggleTheme: (mode?: ThemeMode) => void;
  isDark: boolean;
  isAnimating: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'mystic',
  colors: themes.mystic,
  toggleTheme: () => {},
  isDark: true,
  isAnimating: false,
});

// 테마 프로바이더
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('mystic');
  const [isAnimating, setIsAnimating] = useState(false);
  const animationValue = new Animated.Value(0);

  // 다크 모드 여부 계산
  const isDark = mode === 'dark' || mode === 'mystic' || mode === 'auto';
  const colors = themes[mode];

  // 설정 로드
  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('theme_mode');
      if (savedMode && Object.keys(themes).includes(savedMode)) {
        setMode(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('테마 설정 로드 실패:', error);
    }
  };

  const toggleTheme = async (newMode?: ThemeMode) => {
    if (isAnimating) return;

    setIsAnimating(true);

    // 다음 테마 결정
    const nextMode = newMode || getNextTheme(mode);

    // 애니메이션 시작
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start(async () => {
      // 테마 변경
      setMode(nextMode);

      // 설정 저장
      try {
        await AsyncStorage.setItem('theme_mode', nextMode);
      } catch (error) {
        console.error('테마 설정 저장 실패:', error);
      }

      // 애니메이션 완료
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const getNextTheme = (currentMode: ThemeMode): ThemeMode => {
    const modes: ThemeMode[] = ['mystic', 'dark', 'light', 'auto'];
    const currentIndex = modes.indexOf(currentMode);
    return modes[(currentIndex + 1) % modes.length];
  };

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, isDark, isAnimating }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme은 ThemeProvider 내에서 사용해야 합니다.');
  }
  return context;
};

// 다크모드 토글 컴포넌트
interface DarkModeToggleProps {
  style?: any;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  style,
  showLabel = true,
  size = 'medium'
}) => {
  const { mode, toggleTheme, isDark, isAnimating } = useTheme();
  const [rotateAnim] = useState(new Animated.Value(0));

  // 크기별 설정
  const sizeConfig = {
    small: { width: 60, height: 30, iconSize: 16 },
    medium: { width: 80, height: 40, iconSize: 20 },
    large: { width: 100, height: 50, iconSize: 24 },
  };

  const { width, height, iconSize } = sizeConfig[size];

  // 테마 변경 시 회전 애니메이션
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: mode === 'light' ? 0 : 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [mode]);

  // 아이콘 렌더링
  const renderIcon = (iconType: 'sun' | 'moon' | 'auto' | 'mystic', size: number) => {
    const iconColor = isDark ? '#f4d03f' : '#7b2cbf';

    switch (iconType) {
      case 'sun':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="5" stroke={iconColor} strokeWidth="2" fill={iconColor} />
            <Path d="m12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={iconColor} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'moon':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={iconColor} strokeWidth="2" fill={iconColor} />
          </Svg>
        );
      case 'auto':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M12 3a9 9 0 1 0 9 9c0-.5-.04-1-.09-1.49A7 7 0 1 1 10.51 3.09C11 3.04 11.5 3 12 3z" stroke={iconColor} strokeWidth="2" fill="none" />
            <Circle cx="12" cy="12" r="2" fill={iconColor} />
          </Svg>
        );
      case 'mystic':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={iconColor} strokeWidth="2" fill={iconColor} />
          </Svg>
        );
      default:
        return null;
    }
  };

  // 현재 테마에 따른 아이콘 선택
  const getCurrentIcon = () => {
    switch (mode) {
      case 'light': return 'sun';
      case 'dark': return 'moon';
      case 'auto': return 'auto';
      case 'mystic': return 'mystic';
      default: return 'mystic';
    }
  };

  // 테마 이름 가져오기
  const getThemeName = () => {
    switch (mode) {
      case 'light': return '라이트';
      case 'dark': return '다크';
      case 'auto': return '자동';
      case 'mystic': return '미스틱';
      default: return '미스틱';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => toggleTheme()}
        style={[styles.toggleButton, { width, height }]}
        activeOpacity={0.8}
        disabled={isAnimating}
        accessibilityLabel={`테마 변경: 현재 ${getThemeName()} 모드`}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={isDark ? ['#2d1b47', '#1a1625'] : ['#f8f9fa', '#ffffff']}
          style={[styles.toggleGradient, { width, height }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* 배경 슬라이더 */}
          <View style={[styles.slider, { width: width - 4, height: height - 4 }]}>
            <LinearGradient
              colors={isDark ? ['#7b2cbf', '#f4d03f'] : ['#e9ecef', '#dee2e6']}
              style={styles.sliderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>

          {/* 토글 핸들 */}
          <Animated.View
            style={[
              styles.handle,
              {
                transform: [
                  {
                    translateX: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, width - height + 2],
                    }),
                  },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
                width: height - 8,
                height: height - 8,
              },
            ]}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.handleGradient}
            >
              {renderIcon(getCurrentIcon(), iconSize)}
            </LinearGradient>
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>

      {showLabel && (
        <Text style={[styles.label, { color: isDark ? '#d4b8ff' : '#6c757d' }]}>
          {getThemeName()} 모드
        </Text>
      )}
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toggleButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toggleGradient: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  slider: {
    position: 'absolute',
    borderRadius: 23,
    overflow: 'hidden',
  },
  sliderGradient: {
    flex: 1,
    borderRadius: 23,
  },
  handle: {
    position: 'absolute',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  handleGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DarkModeToggle;