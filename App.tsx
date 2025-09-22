import { StatusBar } from 'expo-status-bar';
import React, { useState, memo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { Icon } from './components/Icon';
import { SacredGeometryBackground } from './components/SacredGeometryBackground';
import { MysticalTexture } from './components/MysticalTexture';
import { preloadTarotImages, preloadCriticalImages } from './utils/imageCache';
import { TAROT_CARDS } from './utils/tarotData';
// 광고 시스템 비활성화 (iOS 빌드 최적화)
let BannerAd: any = null;
import { TarotProvider } from './contexts/TarotContext';
import { AuthProvider } from './contexts/AuthContext';
// 조건부 import - 알림 모듈 안전 로딩
let NotificationProvider: any = ({ children }: { children: React.ReactNode }) => children;
try {
  const notificationModule = require('./contexts/NotificationContext');
  NotificationProvider = notificationModule.NotificationProvider;
} catch (error) {
  console.warn('⚠️ NotificationProvider 로드 실패 (알림 비활성화):', error);
}
import { PremiumProvider } from './contexts/PremiumContext';
import { usePWA } from './hooks/usePWA';
// 광고 매니저 비활성화 (iOS 빌드 최적화)
let AdManager: any = { initialize: () => Promise.resolve(false), dispose: () => {} };
import IAPManager from './utils/iapManager';
import AnalyticsManager from './utils/analyticsManager';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from './components/DesignSystem';

// Initialize i18n
import './i18n/index';

// 직접 import로 탭 컴포넌트들 로드 (임시 수정)
import TimerTab from './components/tabs/TimerTab';
import SpreadTab from './components/tabs/SpreadTab';
import DailyTab from './components/tabs/DailyTab';
import SettingsTab from './components/tabs/SettingsTab';

// 로딩 컴포넌트 (최적화된)
const LoadingSpinner = memo(() => {
  const { t } = useTranslation();
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.brand.primary} />
      <Text style={styles.loadingText}>{t('common.loading')}</Text>
    </View>
  );
});

// 에러 경계 컴포넌트
class TabErrorBoundary extends React.Component<
  { children: React.ReactNode; tabName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; tabName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.tabName} tab:`, error, errorInfo);
    // 개발 환경에서 더 자세한 오류 정보 출력
    if (__DEV__) {
      console.log('Error Stack:', error.stack);
      console.log('Component Stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{i18next.t('errors.tabLoadError')}</Text>
          <Text style={styles.errorMessage}>
            {i18next.t('errors.tabLoadMessage', { tabName: this.props.tabName })}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            <Text style={styles.retryButtonText}>{i18next.t('errors.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// 탭바 컴포넌트 (최적화된)
const TabBar = memo(({
  activeTab,
  onTabChange
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'timer', name: t('navigation.timer'), icon: 'clock' as const },
    { id: 'spread', name: t('navigation.spread'), icon: 'tarot-cards' as const },
    { id: 'journal', name: t('navigation.journal'), icon: 'book-open' as const },
    { id: 'settings', name: t('navigation.settings'), icon: 'settings' as const }
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
          activeOpacity={0.7}
        >
          <Icon 
            name={tab.icon} 
            size={20} 
            color={activeTab === tab.id ? '#fff' : '#9b8db8'} 
          />
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// 헤더 컴포넌트 (최적화된)
const AppHeader = memo(({ activeTab }: { activeTab: string }) => {
  const { t } = useTranslation();

  const getTabTitle = useCallback((tab: string) => {
    // 현재 언어에 맞는 타이틀 반환
    switch (tab) {
      case 'timer': return t('timer.title');
      case 'spread': return t('spread.title');
      case 'journal': return 'Tarot Daily';
      case 'settings': return t('settings.title');
      default: return t('timer.title');
    }
  }, [t]);

  const getTabSubtitle = useCallback((tab: string) => {
    // 현재 언어에 맞는 서브타이틀 반환
    switch (tab) {
      case 'timer': return t('timer.subtitle');
      case 'spread': return t('spread.subtitle');
      case 'journal': return t('journal.subtitle');
      case 'settings': return t('settings.subtitle');
      default: return t('timer.subtitle');
    }
  }, [t]);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{getTabTitle(activeTab)}</Text>
      <Text style={styles.subtitle}>{getTabSubtitle(activeTab)}</Text>
    </View>
  );
});

// PWA 상태 표시 컴포넌트 (오프라인 표시 비활성화)
const PWAStatus = memo(() => {
  const { isOnline, isInstallable, installApp, shareApp } = usePWA();
  const { t } = useTranslation();

  return (
    <View style={styles.pwaStatus}>
      {/* 오프라인 표시 숨김 처리 */}
      {false && !isOnline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>{t('pwa.offline')}</Text>
        </View>
      )}
      {isInstallable && (
        <TouchableOpacity
          style={styles.installButton}
          onPress={installApp}
          activeOpacity={0.7}
        >
          <Icon name="download" size={16} color="#fff" />
          <Text style={styles.installText}>{t('pwa.install')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

// 메인 앱 컴포넌트
function AppContent() {
  const [activeTab, setActiveTab] = useState('timer');
  const pwa = usePWA();

  // Noto Sans KR 폰트 로드
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  // 광고 시스템 및 IAP 초기화
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        console.log('📱 시스템 초기화 시작...');

        // 이미지 캐시 및 프리로딩 시스템 초기화 (가장 먼저)
        console.log('🖼️ 이미지 캐시 시스템 초기화 시작...');
        try {
          await preloadCriticalImages();
          console.log('✅ 중요 이미지 프리로드 완료');

          // 타로 카드 이미지 백그라운드 프리로딩
          preloadTarotImages(TAROT_CARDS)
            .then(() => console.log('✅ 타로 카드 이미지 프리로드 완료'))
            .catch(error => console.warn('⚠️ 타로 카드 이미지 프리로드 일부 실패:', error));
        } catch (error) {
          console.warn('⚠️ 이미지 캐시 시스템 초기화 실패:', error);
        }

        // IAP 시스템 초기화 (광고보다 먼저)
        console.log('💳 IAP 시스템 초기화 시작...');
        const iapSuccess = await IAPManager.initialize();
        if (iapSuccess) {
          console.log('✅ IAP 시스템 초기화 완료');
        } else {
          console.log('⚠️ IAP 시스템 초기화 실패');
        }

        // 분석 시스템 초기화
        console.log('📊 분석 시스템 초기화 시작...');
        try {
          await AnalyticsManager.startSession();
          console.log('✅ 분석 시스템 초기화 완료');
        } catch (error) {
          console.warn('⚠️ 분석 시스템 초기화 실패:', error);
        }

        // 광고 시스템 초기화
        console.log('📱 광고 시스템 초기화 시작...');
        const adSuccess = await AdManager.initialize();
        if (adSuccess) {
          console.log('✅ 광고 시스템 초기화 완료');
        } else {
          console.log('⚠️ 광고 시스템 초기화 실패 (프리미엄 사용자일 수 있음)');
        }
      } catch (error) {
        console.error('❌ 시스템 초기화 오류:', error);
      }
    };

    initializeSystems();

    // 컴포넌트 언마운트 시 정리
    return () => {
      AnalyticsManager.endSession();
      AdManager.dispose();
      IAPManager.dispose();
    };
  }, []);

  const renderContent = useCallback(() => {
    const tabComponents = {
      timer: (
        <TabErrorBoundary tabName={i18next.t('navigation.timer')}>
          <TimerTab />
        </TabErrorBoundary>
      ),
      spread: (
        <TabErrorBoundary tabName={i18next.t('navigation.spread')}>
          <SpreadTab />
        </TabErrorBoundary>
      ),
      journal: (
        <TabErrorBoundary tabName={i18next.t('navigation.journal')}>
          <DailyTab />
        </TabErrorBoundary>
      ),
      settings: (
        <TabErrorBoundary tabName={i18next.t('navigation.settings')}>
          <SettingsTab />
        </TabErrorBoundary>
      ),
    };

    return tabComponents[activeTab as keyof typeof tabComponents] || tabComponents.timer;
  }, [activeTab]);

  // 폰트가 로딩중일 때
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading fonts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 고급 배경 시스템 */}
      <SacredGeometryBackground opacity={0.15} />
      <MysticalTexture opacity={0.1} />
      
      <AppHeader activeTab={activeTab} />
      <PWAStatus />

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      {/* 배너 광고 */}
      {BannerAd && (
        <BannerAd
          placement="main_screen"
          onAdLoaded={() => console.log('✅ 배너 광고 로드됨')}
          onAdFailedToLoad={(error) => console.log('❌ 배너 광고 로드 실패:', error)}
          onAdClicked={() => console.log('🔍 배너 광고 클릭됨')}
        />
      )}

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <StatusBar style="light" backgroundColor="#1a1625" />
    </SafeAreaView>
  );
}

// 간단한 AppContent 테스트 버전
function SimpleAppContent() {
  const [activeTab, setActiveTab] = useState('timer');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>타로 타이머</Text>
        <Text style={styles.subtitle}>24시간 미스틱 가이던스</Text>
      </View>

      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#f4d03f', fontSize: 18, marginBottom: 10 }}>현재 탭: {activeTab}</Text>
          <Text style={{ color: '#d4b8ff', fontSize: 14, textAlign: 'center' }}>
            앱이 정상적으로 로딩되었습니다. 탭 네비게이션을 테스트해보세요.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {['timer', 'spread', 'journal', 'settings'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <StatusBar style="light" backgroundColor="#1a1625" />
    </SafeAreaView>
  );
}

// 전역 에러 경계가 있는 최상위 컴포넌트
export default function App() {
  return (
    <AuthProvider>
      <TarotProvider>
        <NotificationProvider>
          <PremiumProvider>
            <TabErrorBoundary tabName="Tarot Timer">
              <AppContent />
            </TabErrorBoundary>
          </PremiumProvider>
        </NotificationProvider>
      </TarotProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    // 고급스러운 헤더 배경 효과
    backgroundColor: 'rgba(45, 27, 71, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.3)',
    // 미묘한 그라데이션 오버레이
    shadowColor: '#7b2cbf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    // 웹용 추가 스타일
    ...(typeof window !== 'undefined' && {
      background: 'linear-gradient(180deg, rgba(45, 27, 71, 0.6) 0%, rgba(26, 22, 37, 0.4) 100%)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderImage: 'linear-gradient(90deg, rgba(244, 208, 63, 0.5), rgba(212, 184, 255, 0.3), rgba(244, 208, 63, 0.5)) 1',
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'NotoSansKR_700Bold',
    color: '#f4d03f', // 골드 색상으로 통일
    marginBottom: Spacing.xs,
    // 고급스러운 골드 그림자 효과
    textShadowColor: 'rgba(244, 208, 63, 0.8)', // 골드 그림자
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 1.2,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text.secondary,
    opacity: 0.9,
    // 서브타이틀 그림자 효과
    textShadowColor: 'rgba(212, 184, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.8,
    lineHeight: 20,
    textAlign: 'center',
  },
  main: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(45, 27, 71, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 184, 255, 0.2)',
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  activeTab: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#9b8db8',
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: 'bold',
  },
  
  // 로딩 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glass.primary,
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  
  // 에러 스타일
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.glass.primary,
    padding: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: 'bold',
    color: Colors.state.error,
    marginBottom: Spacing.md,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: 'bold',
    color: '#fff',
  },

  // PWA 스타일
  pwaStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  offlineIndicator: {
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  offlineText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#fff',
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  installText: {
    fontSize: 12,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#fff',
  },
});

AppContent.displayName = 'AppContent';
TabBar.displayName = 'TabBar';
AppHeader.displayName = 'AppHeader';
LoadingSpinner.displayName = 'LoadingSpinner';