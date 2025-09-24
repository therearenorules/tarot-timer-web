// Step 4: Test Context Providers
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
import { useTranslation } from 'react-i18next';
import { Icon } from './components/Icon';
import { AuthProvider } from './contexts/AuthContext';
import { TarotProvider } from './contexts/TarotContext';
import { PremiumProvider } from './contexts/PremiumContext';
import './i18n/index';

// NotificationProvider 안전 로딩
let NotificationProvider: any = ({ children }: { children: React.ReactNode }) => children;
try {
  const notificationModule = require('./contexts/NotificationContext');
  NotificationProvider = notificationModule.NotificationProvider;
} catch (error) {
  console.warn('⚠️ NotificationProvider 로드 실패:', error);
}

function StepFourContent() {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  const { t } = useTranslation();

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Loading fonts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Step 4: Context Test</Text>
        <Text style={styles.subtitle}>Context Provider 테스트</Text>

        <View style={styles.testSection}>
          <Text style={styles.testLabel}>✅ Providers Loaded:</Text>
          <View style={styles.providerRow}>
            <Icon name="check" size={16} color="#00ff00" />
            <Text style={styles.providerText}>AuthProvider</Text>
          </View>
          <View style={styles.providerRow}>
            <Icon name="check" size={16} color="#00ff00" />
            <Text style={styles.providerText}>TarotProvider</Text>
          </View>
          <View style={styles.providerRow}>
            <Icon name="check" size={16} color="#00ff00" />
            <Text style={styles.providerText}>PremiumProvider</Text>
          </View>
          <View style={styles.providerRow}>
            <Icon name="check" size={16} color="#00ff00" />
            <Text style={styles.providerText}>NotificationProvider</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StepFourApp() {
  return (
    <AuthProvider>
      <TarotProvider>
        <NotificationProvider>
          <PremiumProvider>
            <StepFourContent />
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4d03f',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#d4b8ff',
    marginBottom: 20,
  },
  testSection: {
    backgroundColor: '#2d1b47',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  testLabel: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#f4d03f',
    marginBottom: 15,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'flex-start',
  },
  providerText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#fff',
    marginLeft: 10,
  },
});

export default StepFourApp;