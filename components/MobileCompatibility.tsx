/**
 * 모바일 디바이스 호환성 컴포넌트
 * iOS/Android 특화 호환성 개선사항을 포함
 */

import React, { useEffect, useState } from 'react';
import { useSafeState } from '../hooks/useSafeState';
import { Platform, Dimensions, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MobileCompatibilityProps {
  children: React.ReactNode;
}

const MobileCompatibility: React.FC<MobileCompatibilityProps> = ({ children }) => {
  const [isReady, setIsReady] = useSafeState(false);
  const [deviceInfo, setDeviceInfo] = useSafeState({
    platform: Platform.OS,
    version: Platform.Version,
    dimensions: Dimensions.get('window')
  });

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const initializeMobileCompatibility = async () => {
      try {
        // 디바이스 정보 수집
        const screenData = Dimensions.get('screen');
        const windowData = Dimensions.get('window');

        setDeviceInfo({
          platform: Platform.OS,
          version: Platform.Version,
          dimensions: windowData
        });

        // iOS 특화 설정
        if (Platform.OS === 'ios') {
          console.log('[MobileCompat] iOS 디바이스 감지');
          console.log('[MobileCompat] iOS 버전:', Platform.Version);
          console.log('[MobileCompat] 화면 크기:', windowData);
          console.log('[MobileCompat] Safe Area Insets:', insets);
        }

        // Android 특화 설정
        if (Platform.OS === 'android') {
          console.log('[MobileCompat] Android 디바이스 감지');
          console.log('[MobileCompat] API Level:', Platform.Version);
          console.log('[MobileCompat] 화면 크기:', windowData);
        }

        setIsReady(true);
        console.log('[MobileCompat] 모바일 호환성 초기화 완료');

      } catch (error) {
        console.error('[MobileCompat] 초기화 오류:', error);
        setIsReady(true); // 오류가 있어도 앱은 계속 실행
      }
    };

    initializeMobileCompatibility();
  }, [insets]);

  // 화면 회전 감지
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      setDeviceInfo(prev => ({
        ...prev,
        dimensions: window
      }));
      console.log('[MobileCompat] 화면 크기 변경:', window);
    });

    return () => subscription?.remove();
  }, []);

  // iOS Safe Area 스타일 계산
  const getSafeAreaStyle = () => {
    if (Platform.OS === 'ios') {
      return {
        paddingTop: Math.max(insets.top, 20),
        paddingBottom: Math.max(insets.bottom, 20),
        paddingLeft: insets.left,
        paddingRight: insets.right,
      };
    }
    return {
      paddingTop: 20,
      paddingBottom: 20,
    };
  };

  // 로딩 중 표시
  if (!isReady) {
    return (
      <View style={[styles.container, getSafeAreaStyle()]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>앱 초기화 중...</Text>
          <Text style={styles.deviceInfo}>
            {Platform.OS === 'ios' ? 'iOS' : 'Android'} {Platform.Version}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, getSafeAreaStyle()]}>
      {children}

      {/* 개발 모드에서만 디바이스 정보 표시 */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            {Platform.OS} {Platform.Version} | {deviceInfo.dimensions.width}x{deviceInfo.dimensions.height}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1625',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 12,
    color: '#d4b8ff',
  },
  debugInfo: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default MobileCompatibility;