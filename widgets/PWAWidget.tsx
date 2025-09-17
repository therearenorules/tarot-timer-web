/**
 * PWA 위젯 컴포넌트
 * 웹 브라우저에서 홈스크린에 추가된 PWA 위젯 기능 제공
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { WidgetManager, WidgetData } from '../utils/widgetManager';
import Icon from '../components/Icon';

interface PWAWidgetProps {
  size?: 'small' | 'medium' | 'large';
  onNavigate?: (route: string) => void;
}

const PWAWidget: React.FC<PWAWidgetProps> = ({
  size = 'medium',
  onNavigate
}) => {
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // 위젯 데이터 로드
  const loadWidgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await WidgetManager.getWidgetData();
      setWidgetData(data);
      setLastUpdate(new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch (error) {
      console.error('PWA 위젯 데이터 로드 오류:', error);
      // 기본 데이터 설정
      setWidgetData({
        cardName: '오늘의 카드',
        progressText: '0/24 완료',
        progressPercent: 0,
        timeRemaining: '24시간 남음',
        streakText: '0일 연속',
        lastUpdate: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 새로고침 핸들러
  const handleRefresh = useCallback(async () => {
    await WidgetManager.updateWidgetData();
    await loadWidgetData();
  }, [loadWidgetData]);

  // 앱 열기 핸들러
  const handleOpenApp = useCallback(() => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      // PWA 환경에서 메인 화면으로 이동
      window.location.href = '/';
    }
  }, [onNavigate]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadWidgetData();
  }, [loadWidgetData]);

  // 자동 새로고침 설정 (5분마다)
  useEffect(() => {
    const interval = setInterval(loadWidgetData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWidgetData]);

  if (isLoading) {
    return <LoadingWidget size={size} />;
  }

  if (!widgetData) {
    return <ErrorWidget size={size} onRefresh={handleRefresh} />;
  }

  switch (size) {
    case 'small':
      return <SmallPWAWidget data={widgetData} onOpen={handleOpenApp} />;
    case 'large':
      return <LargePWAWidget
        data={widgetData}
        onOpen={handleOpenApp}
        onRefresh={handleRefresh}
        lastUpdate={lastUpdate}
      />;
    default:
      return <MediumPWAWidget
        data={widgetData}
        onOpen={handleOpenApp}
        onRefresh={handleRefresh}
      />;
  }
};

// 소형 PWA 위젯 (2x1)
const SmallPWAWidget: React.FC<{
  data: WidgetData;
  onOpen: () => void;
}> = ({ data, onOpen }) => (
  <TouchableOpacity onPress={onOpen} style={styles.smallContainer}>
    <LinearGradient
      colors={['#1a1625', '#2d1b47']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.smallGradient}
    >
      <View style={styles.smallContent}>
        <Icon name="sparkles" size={20} color="#f4d03f" />
        <Text style={styles.smallCardName} numberOfLines={2}>
          {data.cardName}
        </Text>
        <Text style={styles.smallProgress}>
          {data.progressText}
        </Text>
        <View style={styles.smallStreakContainer}>
          <Icon name="flame" size={12} color="#ff7f50" />
          <Text style={styles.smallStreak}>
            {data.streakText}
          </Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// 중형 PWA 위젯 (3x2)
const MediumPWAWidget: React.FC<{
  data: WidgetData;
  onOpen: () => void;
  onRefresh: () => void;
}> = ({ data, onOpen, onRefresh }) => (
  <View style={styles.mediumContainer}>
    <LinearGradient
      colors={['#1a1625', '#2d1b47']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.mediumGradient}
    >
      <TouchableOpacity onPress={onOpen} style={styles.mediumMainArea}>
        <View style={styles.mediumLeftSection}>
          <View style={styles.mediumHeader}>
            <Icon name="sparkles" size={16} color="#f4d03f" />
            <Text style={styles.mediumLabel}>오늘의 카드</Text>
          </View>
          <Text style={styles.mediumCardName} numberOfLines={2}>
            {data.cardName}
          </Text>
          <View style={styles.mediumStreakContainer}>
            <Icon name="flame" size={14} color="#ff7f50" />
            <Text style={styles.mediumStreak}>
              {data.streakText}
            </Text>
          </View>
        </View>

        <View style={styles.mediumRightSection}>
          <View style={styles.progressCircle}>
            <View style={[
              styles.progressCircleInner,
              {
                backgroundColor: `rgba(244, 208, 63, ${data.progressPercent / 100})`,
                transform: [{
                  rotate: `${(data.progressPercent / 100) * 360}deg`
                }]
              }
            ]} />
            <View style={styles.progressText}>
              <Text style={styles.progressNumber}>
                {data.progressText.split('/')[0]}
              </Text>
              <Text style={styles.progressTotal}>
                /{data.progressText.split('/')[1]?.replace(' 완료', '')}
              </Text>
            </View>
          </View>
          <Text style={styles.timeRemaining}>
            {data.timeRemaining}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
        <Icon name="refresh" size={16} color="#d4b8ff" />
      </TouchableOpacity>
    </LinearGradient>
  </View>
);

// 대형 PWA 위젯 (4x3)
const LargePWAWidget: React.FC<{
  data: WidgetData;
  onOpen: () => void;
  onRefresh: () => void;
  lastUpdate: string;
}> = ({ data, onOpen, onRefresh, lastUpdate }) => (
  <View style={styles.largeContainer}>
    <LinearGradient
      colors={['#1a1625', '#2d1b47']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.largeGradient}
    >
      <TouchableOpacity onPress={onOpen} style={styles.largeMainArea}>
        <View style={styles.largeHeader}>
          <View style={styles.largeTitleContainer}>
            <Icon name="sparkles" size={20} color="#f4d03f" />
            <Text style={styles.largeTitle}>타로 타이머</Text>
          </View>
          <View style={styles.largeStreakContainer}>
            <Icon name="flame" size={16} color="#ff7f50" />
            <Text style={styles.largeStreak}>
              {data.streakText}
            </Text>
          </View>
        </View>

        <View style={styles.largeCardSection}>
          <Text style={styles.largeCardLabel}>오늘의 카드</Text>
          <Text style={styles.largeCardName}>
            {data.cardName}
          </Text>
          <View style={styles.cardVisual}>
            <Icon name="cards" size={32} color="#7b2cbf" />
          </View>
        </View>

        <View style={styles.largeProgressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>오늘의 진행률</Text>
            <Text style={styles.progressValue}>{data.progressText}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${data.progressPercent}%` }
              ]}
            />
          </View>
          <View style={styles.timeSection}>
            <Text style={styles.timeLabel}>자정까지</Text>
            <Text style={styles.timeValue}>{data.timeRemaining}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.largeFooter}>
        <Text style={styles.updateTime}>
          업데이트: {lastUpdate}
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={16} color="#d4b8ff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </View>
);

// 로딩 위젯
const LoadingWidget: React.FC<{ size: string }> = ({ size }) => (
  <View style={[styles.loadingContainer, size === 'small' && styles.smallContainer]}>
    <LinearGradient
      colors={['#1a1625', '#2d1b47']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.loadingGradient}
    >
      <Icon name="loader" size={24} color="#f4d03f" />
      <Text style={styles.loadingText}>로딩 중...</Text>
    </LinearGradient>
  </View>
);

// 오류 위젯
const ErrorWidget: React.FC<{
  size: string;
  onRefresh: () => void;
}> = ({ size, onRefresh }) => (
  <View style={[styles.errorContainer, size === 'small' && styles.smallContainer]}>
    <LinearGradient
      colors={['#1a1625', '#2d1b47']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.errorGradient}
    >
      <Icon name="exclamation-triangle" size={24} color="#ff6b6b" />
      <Text style={styles.errorText}>
        타로 타이머{'\n'}데이터를 불러올 수 없습니다
      </Text>
      <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
        <Text style={styles.retryText}>다시 시도</Text>
      </TouchableOpacity>
    </LinearGradient>
  </View>
);

const { width: screenWidth } = Dimensions.get('window');
const widgetWidth = Math.min(screenWidth - 40, 350);

const styles = StyleSheet.create({
  // 소형 위젯 스타일
  smallContainer: {
    width: widgetWidth * 0.6,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  smallGradient: {
    flex: 1,
    padding: 12,
  },
  smallContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  smallCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  smallProgress: {
    fontSize: 10,
    color: '#d4b8ff',
  },
  smallStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallStreak: {
    fontSize: 10,
    color: '#ff7f50',
  },

  // 중형 위젯 스타일
  mediumContainer: {
    width: widgetWidth,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  mediumGradient: {
    flex: 1,
    flexDirection: 'row',
  },
  mediumMainArea: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  mediumLeftSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mediumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediumLabel: {
    fontSize: 12,
    color: '#d4b8ff',
  },
  mediumCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 8,
  },
  mediumStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediumStreak: {
    fontSize: 12,
    color: '#ff7f50',
  },
  mediumRightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  progressCircleInner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  progressText: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressTotal: {
    fontSize: 10,
    color: '#d4b8ff',
  },
  timeRemaining: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 대형 위젯 스타일
  largeContainer: {
    width: widgetWidth,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  largeGradient: {
    flex: 1,
  },
  largeMainArea: {
    flex: 1,
    padding: 16,
  },
  largeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  largeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  largeStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  largeStreak: {
    fontSize: 12,
    color: '#ff7f50',
  },
  largeCardSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  largeCardLabel: {
    fontSize: 12,
    color: '#d4b8ff',
    marginBottom: 4,
  },
  largeCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardVisual: {
    width: 40,
    height: 24,
    backgroundColor: '#7b2cbf',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeProgressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#d4b8ff',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f4d03f',
    borderRadius: 3,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    color: '#d4b8ff',
  },
  timeValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  largeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  updateTime: {
    fontSize: 10,
    color: '#888888',
  },

  // 로딩 스타일
  loadingContainer: {
    width: widgetWidth,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#ffffff',
  },

  // 오류 스타일
  errorContainer: {
    width: widgetWidth,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 16,
  },
  retryButton: {
    backgroundColor: '#f4d03f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1625',
  },
});

export default PWAWidget;