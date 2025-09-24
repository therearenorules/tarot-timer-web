// Step 2: Test i18n
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
import { useTranslation } from 'react-i18next';
import './i18n/index';

function StepTwoApp() {
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
        <Text style={styles.title}>Step 2: i18n Test</Text>
        <Text style={styles.subtitle}>i18n 시스템 테스트</Text>

        <View style={styles.testSection}>
          <Text style={styles.testLabel}>Translation Test:</Text>
          <Text style={styles.testText}>{t('navigation.timer')}</Text>
          <Text style={styles.testText}>{t('navigation.spread')}</Text>
          <Text style={styles.testText}>{t('navigation.journal')}</Text>
          <Text style={styles.testText}>{t('navigation.settings')}</Text>
        </View>
      </View>
    </SafeAreaView>
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
    marginBottom: 10,
  },
  testText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#fff',
    marginBottom: 5,
  },
});

export default StepTwoApp;