/**
 * 글로벌 에러 경계 컴포넌트 (Android 크래시 방지 강화)
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from './DesignSystem';
import { Icon } from './Icon';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error);
    console.error('📍 Error Stack:', error.stack);
    console.error('🔍 Component Stack:', errorInfo.componentStack);

    // Android 크래시 리포팅
    if (Platform.OS === 'android') {
      console.error('🤖 Android Error Report:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }

    this.setState({ errorInfo });

    // 프로덕션 환경: Crash 리포팅 서비스로 전송
    // if (!__DEV__) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Icon name="help-circle" size={64} color="#ff4444" />

            <Text style={styles.title}>
              {this.props.fallbackTitle || '앱 오류가 발생했습니다'}
            </Text>

            <Text style={styles.message}>
              {this.props.fallbackMessage || '일시적인 문제가 발생했습니다.\n앱을 다시 시작해주세요.'}
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Only)</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack} numberOfLines={10}>
                    {this.state.error.stack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.resetButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4444',
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  errorStack: {
    fontSize: 10,
    color: Colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
