// Minimal App for debugging web issues
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// Test basic functionality step by step
function MinimalApp() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tarot Timer - Minimal</Text>
        <Text style={styles.subtitle}>기본 컴포넌트 테스트</Text>

        {/* Test if Colors import works */}
        <View style={styles.testBox}>
          <Text style={styles.testText}>Color Test</Text>
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
  testBox: {
    backgroundColor: '#7b2cbf',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  testText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default MinimalApp;