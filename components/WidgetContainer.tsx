/**
 * 위젯 컨테이너 컴포넌트
 * 플랫폼별 위젯을 통합 관리하는 컴포넌트
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import PWAWidget from '../widgets/PWAWidget';
import { WidgetManager } from '../utils/widgetManager';

interface WidgetContainerProps {
  size?: 'small' | 'medium' | 'large';
  onNavigate?: (route: string) => void;
  autoUpdate?: boolean;
  updateInterval?: number; // minutes
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  size = 'medium',
  onNavigate,
  autoUpdate = true,
  updateInterval = 5
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 위젯 지원 여부 확인
  const checkWidgetSupport = useCallback(async () => {
    try {
      const supported = await WidgetManager.isWidgetSupported();
      setIsSupported(supported);
    } catch (error) {
      console.error('위젯 지원 확인 오류:', error);
      setIsSupported(false);
    }
  }, []);

  // 위젯 초기화
  const initializeWidget = useCallback(async () => {
    try {
      await WidgetManager.initialize();
      if (autoUpdate) {
        await WidgetManager.startAutoUpdate(updateInterval);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('위젯 초기화 오류:', error);
    }
  }, [autoUpdate, updateInterval]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const init = async () => {
      await checkWidgetSupport();
      await initializeWidget();
    };
    init();
  }, [checkWidgetSupport, initializeWidget]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (autoUpdate) {
        WidgetManager.stopAutoUpdate();
      }
    };
  }, [autoUpdate]);

  // 위젯이 지원되지 않는 경우
  if (!isSupported || !isInitialized) {
    return null;
  }

  // 플랫폼별 위젯 렌더링
  const renderWidget = () => {
    switch (Platform.OS) {
      case 'web':
        return (
          <PWAWidget
            size={size}
            onNavigate={onNavigate}
          />
        );

      case 'ios':
        // iOS에서는 네이티브 위젯이 별도 앱으로 실행되므로
        // 여기서는 PWA 스타일 위젯을 표시
        return (
          <PWAWidget
            size={size}
            onNavigate={onNavigate}
          />
        );

      case 'android':
        // Android에서도 네이티브 위젯이 별도로 실행되므로
        // 여기서는 PWA 스타일 위젯을 표시
        return (
          <PWAWidget
            size={size}
            onNavigate={onNavigate}
          />
        );

      default:
        return (
          <PWAWidget
            size={size}
            onNavigate={onNavigate}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderWidget()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WidgetContainer;