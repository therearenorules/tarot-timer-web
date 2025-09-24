// Step 5: Test NotificationProvider specifically
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
import { useTranslation } from 'react-i18next';
import { Icon } from './components/Icon';
import { AuthProvider } from './contexts/AuthContext';
import './i18n/index';

// Test NotificationProvider specifically
let NotificationProvider: any = ({ children }: { children: React.ReactNode }) => children;
try {
  const notificationModule = require('./contexts/NotificationContext');
  NotificationProvider = notificationModule.NotificationProvider;
  console.log('✅ NotificationProvider loaded successfully');
} catch (error) {
  console.error('❌ NotificationProvider loading failed:', error);
}

function StepFiveContent() {
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
        <Text style={styles.title}>Step 5: NotificationProvider Test</Text>
        <Text style={styles.subtitle}>NotificationProvider 격리 테스트</Text>

        <View style={styles.testSection}>
          <Text style={styles.testLabel}>✅ Testing:</Text>
          <View style={styles.providerRow}>
            <Icon name="check" size={16} color="#00ff00" />
            <Text style={styles.providerText}>AuthProvider ✓</Text>
          </View>
          <View style={styles.providerRow}>
            <Icon name="bell" size={16} color="#ffaa00" />
            <Text style={styles.providerText}>NotificationProvider (Testing)</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StepFiveApp() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <StepFiveContent />
      </NotificationProvider>
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

export default StepFiveApp;