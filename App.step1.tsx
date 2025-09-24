// Step 1: Test fonts
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';

function StepOneApp() {
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

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
        <Text style={styles.title}>Step 1: Font Test</Text>
        <Text style={styles.subtitle}>폰트 로딩 성공!</Text>
        <Text style={styles.regularText}>Regular 폰트 테스트</Text>
        <Text style={styles.mediumText}>Medium 폰트 테스트</Text>
        <Text style={styles.boldText}>Bold 폰트 테스트</Text>
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
  regularText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: '#fff',
    marginBottom: 10,
  },
  mediumText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: '#fff',
    marginBottom: 10,
  },
  boldText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    color: '#fff',
    marginBottom: 10,
  },
});

export default StepOneApp;