import { StyleSheet, Platform } from 'react-native';

// 🎨 디자인 시스템 v2.0
// 미니멀 럭셔리 스타일 + 글래스모피즘

// 색상 시스템 업그레이드
export const Colors = {
  // 기본 브랜드 색상 (유지)
  brand: {
    primary: '#F59E0B',      // 황금색 (더 따뜻한 톤)
    secondary: '#7C3AED',    // 보라색 (더 선명한 톤)
    accent: '#D4AF37',       // 기존 골드
    mystic: '#4A1A4F',       // 미스틱 퍼플
  },
  
  // 글래스모피즘 서피스
  glass: {
    primary: 'rgba(255, 255, 255, 0.08)',      // 주요 카드
    secondary: 'rgba(255, 255, 255, 0.04)',    // 보조 카드
    tertiary: 'rgba(255, 255, 255, 0.02)',     // 배경 요소
    overlay: 'rgba(0, 0, 0, 0.3)',             // 오버레이
  },
  
  // 세밀한 보더 시스템
  border: {
    primary: 'rgba(212, 175, 55, 0.4)',       // 주요 보더 (호환성)
    secondary: 'rgba(124, 58, 237, 0.3)',     // 보조 보더 (호환성)
    subtle: 'rgba(255, 255, 255, 0.08)',      // 거의 보이지 않는
    soft: 'rgba(255, 255, 255, 0.15)',        // 은은한
    medium: 'rgba(212, 175, 55, 0.2)',        // 중간
    focus: 'rgba(212, 175, 55, 0.6)',         // 포커스
    active: 'rgba(245, 158, 11, 0.8)',        // 액티브
  },
  
  // 텍스트 위계 시스템
  text: {
    hero: '#F59E0B',                           // 메인 제목
    primary: 'rgba(255, 255, 255, 0.95)',     // 주요 텍스트
    secondary: 'rgba(255, 255, 255, 0.8)',    // 보조 텍스트
    tertiary: 'rgba(255, 255, 255, 0.7)',     // 본문 텍스트
    muted: 'rgba(255, 255, 255, 0.6)',        // 비활성 텍스트
    caption: 'rgba(255, 255, 255, 0.5)',      // 캡션
    accent: '#D4AF37',                         // 악센트 텍스트
    disabled: 'rgba(255, 255, 255, 0.4)',     // 비활성 텍스트
    inverse: '#000000',                        // 역 색상 텍스트 (검은 배경에 대한)
  },
  
  // 배경 색상 시스템
  background: {
    primary: '#1a1625',                         // 주요 배경
    secondary: '#2d1b47',                       // 보조 배경
    tertiary: '#3d2a5a',                        // 삼차 배경
    surface: '#3d2a5a',                         // 서피스 배경
    overlay: 'rgba(0, 0, 0, 0.8)',            // 오버레이 배경
  },

  // 서피스 색상 시스템 (호환성)
  surface: {
    primary: '#2d1b47',                         // 주요 서피스
    secondary: '#3d2a5a',                       // 보조 서피스
    tertiary: '#1a1625',                        // 삼차 서피스
  },

  // 상태별 색상
  state: {
    success: 'rgba(16, 185, 129, 0.5)',
    warning: 'rgba(245, 158, 11, 0.5)',
    error: 'rgba(239, 68, 68, 0.5)',
    info: 'rgba(59, 130, 246, 0.5)',
  },

  // 상태별 색상 (호환성)
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Feedback 색상 (status와 동일, 호환성)
  feedback: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // 레거시 컬러 구조 (호환성)
  primary: {
    main: '#F59E0B',                            // 주요 색상 (호환성)
  },
  secondary: {
    main: '#7C3AED',                            // 보조 색상 (호환성)
  },
  accent: {
    main: '#D4AF37',                            // 악센트 색상 (호환성)
  },
};

// 🌟 글래스모피즘 카드 스타일
export const GlassStyles = StyleSheet.create({
  // 기본 글래스 카드
  card: {
    backgroundColor: Colors.glass.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.soft,
    padding: 20,
  },
  
  // 보조 글래스 카드 (더 은은함)
  cardSecondary: {
    backgroundColor: Colors.glass.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 16,
  },
  
  // 인터랙티브 카드 (터치 가능)
  cardInteractive: {
    backgroundColor: Colors.glass.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    padding: 16,
  },
  
  // 엘레베이션 카드 (중요한 요소)
  cardElevated: {
    backgroundColor: Colors.glass.primary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.focus,
    padding: 24,
  },
  
  // 세밀한 카드 (작은 요소용)
  cardCompact: {
    backgroundColor: Colors.glass.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 8,
  },
});

// 🎭 그림자 시스템 (계층별)
export const ShadowStyles = StyleSheet.create({
  // 기본 그림자 (낮은 엘레베이션)
  low: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // 소프트 그림자 (부드러운 떠오름)
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // 중간 그림자 (일반적인 카드)
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // 높은 그림자 (중요한 요소)
  high: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // 극도 그림자 (모달, 최상위 요소)
  extreme: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  
  // 브랜드 글로우 (황금색 발광)
  brandGlow: {
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // 미스틱 글로우 (보라색 발광)
  mysticGlow: {
    shadowColor: Colors.brand.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
});

// 📝 텍스트 위계 시스템
export const TextStyles = StyleSheet.create({
  // 히어로 텍스트 (메인 제목)
  hero: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '700',
    color: Colors.text.hero,
    letterSpacing: -0.5,
    textAlign: 'center' as const,
  },

  // 골드 타이틀 (메인 타이틀용 골드 효과)
  goldTitle: {
    fontSize: 28,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '800',
    color: Colors.brand.accent,      // 골드 색상
    letterSpacing: 1,
    textAlign: 'center' as const,
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // 골드 서브타이틀 (서브타이틀용 골드 효과)
  goldSubtitle: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    fontWeight: '500',
    color: Colors.brand.primary,     // 밝은 골드
    letterSpacing: 0.5,
    textAlign: 'center' as const,
    fontStyle: 'italic',
    textShadowColor: 'rgba(245, 158, 11, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  
  // 타이틀 (섹션 제목)
  title: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  
  // 서브타이틀 (부제목)
  subtitle: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_500Medium',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: -0.1,
  },
  
  // 헤드라인 (카드 제목)
  headline: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  // 본문 (일반 텍스트)
  body: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    fontWeight: '400',
    color: Colors.text.tertiary,
    lineHeight: 20,
  },
  
  // 캡션 (작은 설명 텍스트)
  caption: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_400Regular',
    fontWeight: '400',
    color: Colors.text.muted,
    lineHeight: 16,
  },
  
  // 라벨 (입력 필드 라벨 등)
  label: {
    fontSize: 13,
    fontFamily: 'NotoSansKR_500Medium',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.2,
  },
  
  // 오버라인 (상단 작은 텍스트)
  overline: {
    fontSize: 11,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: Colors.text.caption,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  // H3 헤딩 (섹션 소제목)
  h3: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  // H4 헤딩 (카드 제목)
  h4: {
    fontSize: 18,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },

  // H5 헤딩 (작은 제목)
  h5: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_500Medium',
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },

  // 버튼 텍스트
  buttonText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center' as const,
  },

  // 링크 텍스트
  link: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    fontWeight: '500',
    color: Colors.brand.primary,
    textDecorationLine: 'underline' as const,
  },
});

// 📝 Typography 별칭 (호환성을 위한)
export const Typography = {
  ...TextStyles,
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    hero: 28,
  },
  // 버튼 타이포그래피 (호환성)
  button: {
    primary: {
      fontSize: 16,
      fontFamily: 'NotoSansKR_700Bold',
      fontWeight: '600',
      color: '#fff',
      textAlign: 'center' as const,
    }
  },
  // 헤더 타이포그래피 (호환성)
  header: {
    h2: {
      fontSize: 22,
      fontFamily: 'NotoSansKR_700Bold',
      fontWeight: '600',
      color: '#fff',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      fontFamily: 'NotoSansKR_700Bold',
      fontWeight: '600',
      color: '#fff',
      marginBottom: 12,
      letterSpacing: -0.2,
    }
  },
  // 바디 타이포그래피 (호환성)
  body: {
    regular: {
      fontSize: 14,
      fontFamily: 'NotoSansKR_400Regular',
      fontWeight: '400',
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 20,
    },
    medium: {
      fontSize: 14,
      fontFamily: 'NotoSansKR_500Medium',
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 20,
    }
  },
  // 캡션 타이포그래피 (호환성)
  caption: {
    regular: {
      fontSize: 12,
      fontFamily: 'NotoSansKR_400Regular',
      fontWeight: '400',
      color: 'rgba(255, 255, 255, 0.6)',
      lineHeight: 16,
    },
    medium: {
      fontSize: 12,
      fontFamily: 'NotoSansKR_500Medium',
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 16,
    }
  }
};

// 🎯 조합형 스타일 (자주 사용되는 조합들)
export const CompositeStyles = StyleSheet.create({
  // 기본 글래스 카드 + 소프트 그림자
  glassCardSoft: {
    ...GlassStyles.card,
    ...ShadowStyles.soft,
  },
  
  // 인터랙티브 카드 + 중간 그림자
  interactiveCard: {
    ...GlassStyles.cardInteractive,
    ...ShadowStyles.medium,
  },
  
  // 엘레베이션 카드 + 높은 그림자 + 브랜드 글로우
  elevatedCardBrand: {
    ...GlassStyles.cardElevated,
    ...ShadowStyles.high,
    ...ShadowStyles.brandGlow,
  },
  
  // 컴팩트 카드 + 낮은 그림자
  compactCard: {
    ...GlassStyles.cardCompact,
    ...ShadowStyles.low,
  },
  
  // 현재 선택된 카드 (브랜드 테두리 + 글로우)
  selectedCard: {
    ...GlassStyles.cardInteractive,
    ...ShadowStyles.brandGlow,
    borderColor: Colors.border.active,
    borderWidth: 2,
  },
  
  // 프리미엄 카드 (미스틱 글로우)
  premiumCard: {
    ...GlassStyles.cardElevated,
    ...ShadowStyles.mysticGlow,
    borderColor: Colors.brand.secondary,
  },

  // 정보 카드
  infoCard: {
    ...GlassStyles.cardSecondary,
    ...ShadowStyles.soft,
    padding: 20,
  },

  // 텍스트 입력 스타일
  textInput: {
    ...GlassStyles.cardSecondary,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: Colors.border.soft,
    padding: 12,
    color: Colors.text.primary,
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    fontWeight: '400',
    minHeight: 44,
  },
});

// 📏 간격 시스템
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

// 📐 보더 반지름 시스템
export const BorderRadius = {
  small: 8,
  sm: 8,
  medium: 12,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

// 🎛️ 애니메이션 지속시간
export const AnimationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

// 📱 반응형 크기
export const Layout = {
  touchTarget: Platform.select({
    ios: 44,      // iOS: 44pt (Human Interface Guidelines)
    android: 48,  // Android: 48dp (Material Design)
    default: 48   // 기본값: Android 표준
  }),
  cardWidth: 280,       // 기본 카드 너비
  cardHeight: 160,      // 기본 카드 높이
  maxWidth: 400,        // 최대 컨테이너 너비
};