// components/GradientButton.tsx - 고급 그라데이션 버튼 컴포넌트
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Colors, ShadowStyles, BorderRadius, Spacing } from './DesignSystem';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  icon?: IconName;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  icon,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style
}) => {
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle: StyleProp<ViewStyle>[] = [styles.button];

    if (variant === 'primary') {
      baseStyle.push(styles.primaryButton);
    } else {
      baseStyle.push(styles.secondaryButton);
    }

    if (size === 'small') {
      baseStyle.push(styles.smallButton);
    } else if (size === 'large') {
      baseStyle.push(styles.largeButton);
    }

    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseStyle: StyleProp<TextStyle>[] = [styles.buttonText];

    // 크기별 텍스트 스타일
    if (size === 'small') {
      baseStyle.push(styles.smallButtonText);
    } else if (size === 'large') {
      baseStyle.push(styles.largeButtonText);
    }

    // 버튼 타입별 텍스트 스타일
    if (variant === 'primary') {
      baseStyle.push(styles.primaryButtonText);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryButtonText);
    }

    // 비활성화 상태 텍스트 스타일
    if (disabled) {
      baseStyle.push(styles.disabledButtonText);
    }

    return baseStyle;
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 20;
      default: return 16;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <Icon
            name={icon}
            size={getIconSize()}
            color="#fff"
          />
        )}
        <Text style={getTextStyle()}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border.soft,
    backgroundColor: Colors.glass.primary,
    // 고급스러운 그림자
    shadowColor: ShadowStyles.brandGlow.shadowColor,
    shadowOffset: ShadowStyles.brandGlow.shadowOffset,
    shadowOpacity: ShadowStyles.brandGlow.shadowOpacity,
    shadowRadius: ShadowStyles.brandGlow.shadowRadius,
    elevation: ShadowStyles.brandGlow.elevation,
    // 호버/터치 효과를 위한 오버레이 준비
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  primaryButton: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.border.focus,
  },
  secondaryButton: {
    backgroundColor: Colors.glass.primary,
    borderColor: Colors.brand.secondary,
    borderWidth: 2,
  },
  disabledButton: {
    backgroundColor: Colors.glass.tertiary,
    borderColor: Colors.border.subtle,
    opacity: 0.5,
    // 그림자 제거
    shadowOpacity: 0,
    elevation: 0,
  },
  smallButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  largeButton: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.xl,
  },
  buttonContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: Spacing.sm,
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowRadius: 3,
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  largeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  secondaryButtonText: {
    color: Colors.brand.secondary,
    fontWeight: '600' as const,
  },
  disabledButtonText: {
    color: Colors.text.muted,
  },
});

export default GradientButton;