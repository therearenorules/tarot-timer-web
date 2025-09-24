// Step 3: Test Icon component (SVG)
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
import { useTranslation } from 'react-i18next';
import { Icon } from './components/Icon';
import './i18n/index';

function StepThreeApp() {
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
        <Text style={styles.title}>Step 3: Icon Test</Text>
        <Text style={styles.subtitle}>SVG 아이콘 테스트</Text>

        <View style={styles.testSection}>
          <Text style={styles.testLabel}>Icon Components:</Text>
          <View style={styles.iconRow}>
            <Icon name="clock" size={24} color="#f4d03f" />
            <Text style={styles.iconText}>Clock</Text>
          </View>
          <View style={styles.iconRow}>
            <Icon name="tarot-cards" size={24} color="#d4b8ff" />
            <Text style={styles.iconText}>Tarot Cards</Text>
          </View>
          <View style={styles.iconRow}>
            <Icon name="book-open" size={24} color="#7b2cbf" />
            <Text style={styles.iconText}>Book Open</Text>
          </View>
          <View style={styles.iconRow}>
            <Icon name="settings" size={24} color="#fff" />
            <Text style={styles.iconText}>Settings</Text>
          </View>
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
    marginBottom: 15,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    justifyContent: 'flex-start',
  },
  iconText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#fff',
    marginLeft: 10,
  },
});

export default StepThreeApp;