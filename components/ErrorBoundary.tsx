/**
 * 글로벌 에러 경계 컴포넌트 (Android 크래시 방지 강화 + 로그 수집)
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from './DesignSystem';
import { Icon } from './Icon';

// AsyncStorage 동적 로드 (웹/모바일 호환)
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (error) {
    console.warn('⚠️ AsyncStorage not available');
  }
}

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

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error);
    console.error('📍 Error Stack:', error.stack);
    console.error('🔍 Component Stack:', errorInfo.componentStack);

    // ✅ CRITICAL: 에러 로그를 AsyncStorage에 저장 (TestFlight 디버깅용)
    const crashLog = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      buildType: __DEV__ ? 'development' : 'production',
    };

    console.error('💾 저장할 크래시 로그:', crashLog);

    // AsyncStorage에 크래시 로그 저장
    if (AsyncStorage) {
      try {
        // 기존 로그 가져오기
        const existingLogsJson = await AsyncStorage.getItem('CRASH_LOGS');
        const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];

        // 새 로그 추가 (최대 10개 유지)
        const updatedLogs = [crashLog, ...existingLogs].slice(0, 10);

        await AsyncStorage.setItem('CRASH_LOGS', JSON.stringify(updatedLogs));
        console.log('✅ 크래시 로그 AsyncStorage에 저장 완료');
      } catch (storageError) {
        console.error('❌ 크래시 로그 저장 실패:', storageError);
      }
    }

    // Android 크래시 리포팅
    if (Platform.OS === 'android') {
      console.error('🤖 Android Error Report:', crashLog);
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

            {this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>오류 상세 정보</Text>

                {/* 오류 메시지 */}
                <Text style={styles.errorLabel}>메시지:</Text>
                <Text style={styles.errorText}>{this.state.error.message || '알 수 없는 오류'}</Text>

                {/* 오류 이름 */}
                {this.state.error.name && (
                  <>
                    <Text style={styles.errorLabel}>타입:</Text>
                    <Text style={styles.errorText}>{this.state.error.name}</Text>
                  </>
                )}

                {/* 스택 트레이스 (항상 표시) */}
                {this.state.error.stack && (
                  <>
                    <Text style={styles.errorLabel}>스택:</Text>
                    <Text style={styles.errorStack} numberOfLines={15}>
                      {this.state.error.stack}
                    </Text>
                  </>
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
    maxHeight: 300,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  errorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f4d03f',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
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
