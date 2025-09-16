/**
 * Supabase 연결 테스트 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { checkConnection } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ConnectionStatus {
  isConnected: boolean;
  error?: string;
  timestamp: string;
}

export const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    timestamp: '',
  });
  const [loading, setLoading] = useState(true);
  const { initialized, user, session } = useAuth();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const isConnected = await checkConnection();
      setStatus({
        isConnected,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>🔗 Supabase 연결 확인 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔮 Supabase 연결 상태</Text>

      <View style={styles.statusContainer}>
        <Text style={[styles.status, status.isConnected ? styles.success : styles.error]}>
          {status.isConnected ? '✅ 연결됨' : '❌ 연결 실패'}
        </Text>
        <Text style={styles.timestamp}>마지막 확인: {status.timestamp}</Text>
      </View>

      {status.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>오류: {status.error}</Text>
        </View>
      )}

      <View style={styles.authContainer}>
        <Text style={styles.subtitle}>인증 상태</Text>
        <Text style={styles.authStatus}>
          초기화: {initialized ? '✅' : '⏳'}
        </Text>
        <Text style={styles.authStatus}>
          로그인: {user ? `✅ ${user.email}` : '❌ 미로그인'}
        </Text>
        <Text style={styles.authStatus}>
          세션: {session ? '✅ 활성' : '❌ 없음'}
        </Text>
      </View>

      <View style={styles.envContainer}>
        <Text style={styles.subtitle}>환경 변수</Text>
        <Text style={styles.envText}>
          URL: {process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}
        </Text>
        <Text style={styles.envText}>
          KEY: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1625',
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#7b2cbf',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4d03f',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d4b8ff',
    marginBottom: 8,
    marginTop: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  success: {
    color: '#4caf50',
  },
  error: {
    color: '#f44336',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  loadingText: {
    fontSize: 16,
    color: '#f4d03f',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#2d1b1b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  authContainer: {
    backgroundColor: '#2d1b47',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  authStatus: {
    color: '#e0e0e0',
    fontSize: 14,
    marginBottom: 4,
  },
  envContainer: {
    backgroundColor: '#1b2d1b',
    padding: 12,
    borderRadius: 8,
  },
  envText: {
    color: '#e0e0e0',
    fontSize: 14,
    marginBottom: 4,
  },
});

export default SupabaseTest;