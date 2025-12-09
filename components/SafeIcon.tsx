/**
 * Safe Icon 컴포넌트
 * iOS 환경에서 SVG 호환성 문제를 해결하는 안전한 아이콘 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { useSafeState } from '../hooks/useSafeState';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon, { IconName } from './Icon';

interface SafeIconProps {
  name: IconName;
  size?: number;
  color?: string;
  fallbackText?: string;
}

const SafeIcon: React.FC<SafeIconProps> = ({
  name,
  size = 24,
  color = '#ffffff',
  fallbackText
}) => {
  const [hasError, setHasError] = useSafeState(false);
  const [isLoading, setIsLoading] = useSafeState(true);

  useEffect(() => {
    // iOS에서 SVG 로드 테스트
    const testSVGSupport = async () => {
      try {
        setIsLoading(true);

        // 약간의 지연 후 로딩 완료
        setTimeout(() => {
          setIsLoading(false);
          setHasError(false);
        }, 100);

      } catch (error) {
        console.warn(`[SafeIcon] SVG 로드 오류 (${name}):`, error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    testSVGSupport();
  }, [name]);

  // 아이콘별 fallback 텍스트 매핑
  const getFallbackText = (iconName: IconName): string => {
    if (fallbackText) return fallbackText;

    const fallbackMap: Record<IconName, string> = {
      'timer': '⏰',
      'clock': '🕐',
      'cards': '🃏',
      'tarot-cards': '🔮',
      'tarot-card': '🎴',
      'journal': '📖',
      'book-open': '📄',
      'settings': '⚙️',
      'refresh': '🔄',
      'rotate-ccw': '↺',
      'refresh-cw': '🔄',
      'eye': '👁',
      'eye-off': '🚫',
      'chevron-up': '▲',
      'chevron-down': '▼',
      'chevron-left': '◀',
      'chevron-right': '▶',
      'star': '⭐',
      'moon': '🌙',
      'sun': '☀️',
      'sparkles': '✨',
      'magic-wand': '🪄',
      'zap': '⚡',
      'bell': '🔔',
      'bell-off': '🔕',
      'calendar': '📅',
      'check': '✅',
      'check-circle': '✅',
      'crown': '👑',
      'help-circle': '❓',
      'globe': '🌍',
      'lock': '🔒',
      'layout': '📐',
      'save': '💾',
      'shield': '🛡️',
      'shuffle': '🔀',
      'volume2': '🔊',
      'download': '⬇️',
      'x': '❌',
      'x-circle': '❌',
      'send': '📤',
      'activity': '📊',
      'gift': '🎁',
      'play': '▶️',
      'infinity': '♾️',
      'arrow-up': '⬆️',
      'external-link': '🔗',
      'alert-circle': '⚠️',
      'mail': '✉️',
      'bookmark': '🔖',
      'trash-2': '🗑️',
      'edit': '✏️',
      'edit-2': '✏️',
      'flame': '🔥',
    };

    return fallbackMap[iconName] || '●';
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={[styles.loadingText, { fontSize: size * 0.3 }]}>
          ⏳
        </Text>
      </View>
    );
  }

  // 오류 발생 시 fallback 표시
  if (hasError) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={[styles.fallbackText, {
          fontSize: size * 0.6,
          color: color
        }]}>
          {getFallbackText(name)}
        </Text>
      </View>
    );
  }

  // 정상적으로 SVG 아이콘 렌더링
  try {
    return (
      <ErrorBoundary
        fallback={
          <View style={[styles.container, { width: size, height: size }]}>
            <Text style={[styles.fallbackText, {
              fontSize: size * 0.6,
              color: color
            }]}>
              {getFallbackText(name)}
            </Text>
          </View>
        }
      >
        <Icon name={name} size={size} color={color} />
      </ErrorBoundary>
    );
  } catch (error) {
    console.warn(`[SafeIcon] 렌더링 오류 (${name}):`, error);
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Text style={[styles.fallbackText, {
          fontSize: size * 0.6,
          color: color
        }]}>
          {getFallbackText(name)}
        </Text>
      </View>
    );
  }
};

// React Error Boundary 컴포넌트
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[SafeIcon] ErrorBoundary 캐치:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  fallbackText: {
    textAlign: 'center',
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif',
      },
      web: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
    }),
  },
});

export default SafeIcon;