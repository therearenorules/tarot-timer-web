import { StyleSheet } from 'react-native';

// 🌓 테마 시스템 - 다크/라이트 테마 지원

// 라이트 테마 색상
export const LightColors = {
  // 기본 브랜드 색상 (유지)
  brand: {
    primary: '#F59E0B',      // 황금색
    secondary: '#7C3AED',    // 보라색
    accent: '#D4AF37',       // 골드
    mystic: '#4A1A4F',       // 미스틱 퍼플
  },
  
  // 라이트 모드용 글래스모피즘 서피스
  glass: {
    primary: 'rgba(255, 255, 255, 0.9)',      // 주요 카드
    secondary: 'rgba(255, 255, 255, 0.7)',    // 보조 카드
    tertiary: 'rgba(255, 255, 255, 0.5)',     // 배경 요소
    overlay: 'rgba(0, 0, 0, 0.1)',            // 오버레이
  },
  
  // 라이트 모드 보더
  border: {
    subtle: 'rgba(0, 0, 0, 0.08)',
    soft: 'rgba(0, 0, 0, 0.15)',
    medium: 'rgba(212, 175, 55, 0.3)',
    focus: 'rgba(212, 175, 55, 0.7)',
    active: 'rgba(245, 158, 11, 0.9)',
  },
  
  // 라이트 모드 텍스트
  text: {
    hero: '#F59E0B',
    primary: 'rgba(0, 0, 0, 0.95)',
    secondary: 'rgba(0, 0, 0, 0.8)',
    tertiary: 'rgba(0, 0, 0, 0.7)',
    muted: 'rgba(0, 0, 0, 0.6)',
    caption: 'rgba(0, 0, 0, 0.5)',
  },
  
  // 배경색
  background: {
    primary: '#f8fafc',      // 메인 배경
    secondary: '#f1f5f9',    // 보조 배경
    elevated: '#ffffff',     // 카드 배경
  },
  
  // 상태별 색상
  state: {
    success: 'rgba(16, 185, 129, 0.7)',
    warning: 'rgba(245, 158, 11, 0.7)',
    error: 'rgba(239, 68, 68, 0.7)',
    info: 'rgba(59, 130, 246, 0.7)',
  },
};

// 다크 테마 색상 (기존)
export const DarkColors = {
  // 기본 브랜드 색상 (유지)
  brand: {
    primary: '#F59E0B',      // 황금색
    secondary: '#7C3AED',    // 보라색
    accent: '#D4AF37',       // 골드
    mystic: '#4A1A4F',       // 미스틱 퍼플
  },
  
  // 다크 모드 글래스모피즘 서피스
  glass: {
    primary: 'rgba(255, 255, 255, 0.08)',      // 주요 카드
    secondary: 'rgba(255, 255, 255, 0.04)',    // 보조 카드
    tertiary: 'rgba(255, 255, 255, 0.02)',     // 배경 요소
    overlay: 'rgba(0, 0, 0, 0.3)',             // 오버레이
  },
  
  // 다크 모드 보더
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    soft: 'rgba(255, 255, 255, 0.15)',
    medium: 'rgba(212, 175, 55, 0.2)',
    focus: 'rgba(212, 175, 55, 0.6)',
    active: 'rgba(245, 158, 11, 0.8)',
  },
  
  // 다크 모드 텍스트
  text: {
    hero: '#F59E0B',
    primary: 'rgba(255, 255, 255, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.8)',
    tertiary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.6)',
    caption: 'rgba(255, 255, 255, 0.5)',
  },
  
  // 배경색
  background: {
    primary: '#1a1625',      // 메인 배경
    secondary: '#2d1b47',    // 보조 배경
    elevated: '#3a2b5c',     // 카드 배경
  },
  
  // 상태별 색상
  state: {
    success: 'rgba(16, 185, 129, 0.5)',
    warning: 'rgba(245, 158, 11, 0.5)',
    error: 'rgba(239, 68, 68, 0.5)',
    info: 'rgba(59, 130, 246, 0.5)',
  },
};

// 테마별 스타일 생성 함수
export const createThemedStyles = (isDark: boolean) => {
  const colors = isDark ? DarkColors : LightColors;
  
  return StyleSheet.create({
    // 기본 컨테이너
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    
    // 글래스 카드들
    glassCard: {
      backgroundColor: colors.glass.primary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border.soft,
      padding: 20,
    },
    
    glassCardSecondary: {
      backgroundColor: colors.glass.secondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      padding: 16,
    },
    
    // 텍스트 스타일
    titleText: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    
    subtitleText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    
    bodyText: {
      fontSize: 16,
      color: colors.text.tertiary,
    },
    
    captionText: {
      fontSize: 12,
      color: colors.text.muted,
    },
    
    // 버튼 스타일
    primaryButton: {
      backgroundColor: colors.brand.primary,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
    },
    
    primaryButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    
    // 탭바
    tabBar: {
      backgroundColor: isDark 
        ? 'rgba(45, 27, 71, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      borderTopWidth: 1,
      borderTopColor: colors.border.soft,
    },
    
    // 선택된 탭
    activeTab: {
      backgroundColor: isDark
        ? 'rgba(123, 44, 191, 0.3)'
        : 'rgba(123, 44, 191, 0.2)',
      borderRadius: 12,
    },
    
    // 탭 텍스트
    tabText: {
      fontSize: 12,
      color: isDark ? '#9b8db8' : '#6b7280',
      fontWeight: '500',
    },
    
    activeTabText: {
      color: isDark ? '#ffffff' : colors.brand.primary,
      fontWeight: 'bold',
    },
    
    // 시간별 카드 그리드
    timeSlot: {
      backgroundColor: colors.glass.primary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    selectedTimeSlot: {
      borderColor: colors.brand.secondary,
      backgroundColor: colors.glass.secondary,
      borderWidth: 2,
    },
    
    currentTimeSlot: {
      borderColor: colors.brand.accent,
      backgroundColor: colors.brand.accent,
    },
    
    // 입력 필드
    textInput: {
      backgroundColor: colors.glass.primary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.soft,
      padding: 16,
      fontSize: 16,
      color: colors.text.primary,
      minHeight: 80,
    },
    
    // 헤더
    header: {
      backgroundColor: colors.background.primary,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    
    // 에러 스타일
    errorContainer: {
      backgroundColor: colors.glass.primary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.state.error,
      padding: 20,
      alignItems: 'center',
    },
    
    errorText: {
      fontSize: 16,
      color: colors.state.error,
      textAlign: 'center',
    },
    
    // 성공 스타일
    successContainer: {
      backgroundColor: colors.glass.primary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.state.success,
      padding: 16,
    },
    
    successText: {
      fontSize: 14,
      color: colors.state.success,
      textAlign: 'center',
    },
  });
};

// 테마 전환을 위한 커스텀 훅
import { useState, useEffect } from 'react';

export const useTheme = (initialTheme: 'dark' | 'light' = 'dark') => {
  const [theme, setTheme] = useState<'dark' | 'light'>(initialTheme);
  const [styles, setStyles] = useState(createThemedStyles(theme === 'dark'));
  const [colors, setColors] = useState(theme === 'dark' ? DarkColors : LightColors);
  
  useEffect(() => {
    const isDark = theme === 'dark';
    setStyles(createThemedStyles(isDark));
    setColors(isDark ? DarkColors : LightColors);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  const setDarkTheme = () => setTheme('dark');
  const setLightTheme = () => setTheme('light');
  
  return {
    theme,
    isDark: theme === 'dark',
    styles,
    colors,
    toggleTheme,
    setDarkTheme,
    setLightTheme,
  };
};

// 테마 상태를 저장하고 복원하는 유틸리티
export const ThemeStorage = {
  STORAGE_KEY: 'tarot_timer_theme',
  
  async saveTheme(theme: 'dark' | 'light') {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ThemeStorage.STORAGE_KEY, theme);
      }
    } catch (error) {
      console.log('Failed to save theme:', error);
    }
  },
  
  async loadTheme(): Promise<'dark' | 'light'> {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem(ThemeStorage.STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          return savedTheme;
        }
      }
    } catch (error) {
      console.log('Failed to load theme:', error);
    }
    return 'dark'; // 기본값
  },
  
  async clearTheme() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(ThemeStorage.STORAGE_KEY);
      }
    } catch (error) {
      console.log('Failed to clear theme:', error);
    }
  },
};

// 시스템 테마 감지 (다크모드 선호도)
export const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark'; // 기본값
};

// 시스템 테마 변화 감지
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(getSystemTheme());
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);
  
  return systemTheme;
};