/**
 * 위젯 컨테이너 컴포넌트
 * 플랫폼별 위젯을 통합 관리하는 컴포넌트
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSafeState } from '../hooks/useSafeState';
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
  const [isSupported, setIsSupported] = useSafeState(false);
  const [isInitialized, setIsInitialized] = useSafeState(false);

  // 위젯 지원 여부 확인 (현재는 플랫폼에 따라 항상 지원 가정)
  const checkWidgetSupport = useCallback(async () => {
    try {
      // 위젯 데이터가 있으면 지원하는 것으로 간주
      const widgetData = await WidgetManager.getWidgetData();
      setIsSupported(true); // 기본적으로 지원
    } catch (error) {
      console.error('위젯 지원 확인 오류:', error);
      setIsSupported(false);
    }
  }, []);

  // 위젯 초기화
  const initializeWidget = useCallback(async () => {
    try {
      // initialize() 호출 시 내부에서 자동으로 autoUpdate 시작
      await WidgetManager.initialize();
      setIsInitialized(true);
    } catch (error) {
      console.error('위젯 초기화 오류:', error);
    }
  }, []);

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