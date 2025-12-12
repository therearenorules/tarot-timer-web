/**
 * Supabase Debug Panel
 *
 * 프로덕션 앱에서 Supabase 연결 상태 및 에러 로그를 확인하기 위한 디버그 패널
 *
 * 활성화 방법: 설정 화면 타이틀을 5번 연속 탭
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, Typography } from './DesignSystem';
import { Icon } from './Icon';

interface ConnectionLog {
  timestamp: string;
  envVarsExist: boolean;
  envVarsValid: boolean;
  supabaseUrl: string;
  connectionSuccessful: boolean;
  error: string | null;
}

interface ErrorLog {
  timestamp: string;
  type: string;
  message: string;
  context?: any;
}

interface HealthLog {
  timestamp: string;
  edgeFunctionAvailable: boolean;
  responseTimeMs: number;
  status: 'ok' | 'error' | 'unknown';
  version: string | null;
  region: string | null;
  error: string | null;
}

export const SupabaseDebugPanel: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'connection' | 'errors' | 'health'>('connection');

  // 로그 불러오기
  useEffect(() => {
    if (visible) {
      loadLogs();
    }
  }, [visible]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Supabase 연결 로그
      const connectionLogsJson = await AsyncStorage.getItem('SUPABASE_CONNECTION_LOGS');
      if (connectionLogsJson) {
        setConnectionLogs(JSON.parse(connectionLogsJson));
      }

      // 에러 로그 (Supabase 관련)
      const errorLogsJson = await AsyncStorage.getItem('SUPABASE_ERROR_LOGS');
      if (errorLogsJson) {
        setErrorLogs(JSON.parse(errorLogsJson));
      }

      // Edge Function 헬스체크 로그
      const healthLogsJson = await AsyncStorage.getItem('EDGE_FUNCTION_HEALTH_LOGS');
      if (healthLogsJson) {
        setHealthLogs(JSON.parse(healthLogsJson));
      }
    } catch (error) {
      console.error('디버그 패널 로그 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      if (activeTab === 'connection') {
        await AsyncStorage.removeItem('SUPABASE_CONNECTION_LOGS');
        setConnectionLogs([]);
      } else if (activeTab === 'errors') {
        await AsyncStorage.removeItem('SUPABASE_ERROR_LOGS');
        setErrorLogs([]);
      } else {
        await AsyncStorage.removeItem('EDGE_FUNCTION_HEALTH_LOGS');
        setHealthLogs([]);
      }
      console.log(`✅ ${activeTab === 'connection' ? '연결' : activeTab === 'errors' ? '에러' : '헬스체크'} 로그 삭제 완료`);
    } catch (error) {
      console.error('로그 삭제 실패:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderConnectionLog = (log: ConnectionLog, index: number) => {
    const isSuccess = log.connectionSuccessful;
    const hasEnvVars = log.envVarsExist && log.envVarsValid;

    return (
      <View key={index} style={styles.logItem}>
        <View style={styles.logHeader}>
          <View style={[styles.statusDot, { backgroundColor: isSuccess ? '#4ade80' : '#f87171' }]} />
          <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
        </View>

        <View style={styles.logBody}>
          <View style={styles.logRow}>
            <Text style={styles.logLabel}>환경 변수:</Text>
            <Text style={[styles.logValue, { color: hasEnvVars ? '#4ade80' : '#f87171' }]}>
              {hasEnvVars ? '✅ 정상' : '❌ 없음/유효하지 않음'}
            </Text>
          </View>

          <View style={styles.logRow}>
            <Text style={styles.logLabel}>Supabase URL:</Text>
            <Text style={styles.logValue} numberOfLines={1} ellipsizeMode="middle">
              {log.supabaseUrl}
            </Text>
          </View>

          <View style={styles.logRow}>
            <Text style={styles.logLabel}>연결 상태:</Text>
            <Text style={[styles.logValue, { color: isSuccess ? '#4ade80' : '#f87171' }]}>
              {isSuccess ? '✅ 성공' : '❌ 실패'}
            </Text>
          </View>

          {log.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{log.error}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderErrorLog = (log: ErrorLog, index: number) => {
    return (
      <View key={index} style={styles.logItem}>
        <View style={styles.logHeader}>
          <View style={[styles.statusDot, { backgroundColor: '#f87171' }]} />
          <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
        </View>

        <View style={styles.logBody}>
          <View style={styles.logRow}>
            <Text style={styles.logLabel}>타입:</Text>
            <Text style={styles.logValue}>{log.type}</Text>
          </View>

          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{log.message}</Text>
          </View>

          {log.context && (
            <View style={styles.contextBox}>
              <Text style={styles.contextText}>{JSON.stringify(log.context, null, 2)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHealthLog = (log: HealthLog, index: number) => {
    const isHealthy = log.status === 'ok' && log.edgeFunctionAvailable;
    const statusColor = isHealthy ? '#4ade80' : log.status === 'error' ? '#f87171' : '#fbbf24';

    return (
      <View key={index} style={styles.logItem}>
        <View style={styles.logHeader}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
        </View>

        <View style={styles.logBody}>
          <View style={styles.logRow}>
            <Text style={styles.logLabel}>Edge Function:</Text>
            <Text style={[styles.logValue, { color: log.edgeFunctionAvailable ? '#4ade80' : '#f87171' }]}>
              {log.edgeFunctionAvailable ? '✅ 사용 가능' : '❌ 사용 불가'}
            </Text>
          </View>

          <View style={styles.logRow}>
            <Text style={styles.logLabel}>상태:</Text>
            <Text style={[styles.logValue, { color: statusColor }]}>
              {log.status === 'ok' ? '✅ 정상' : log.status === 'error' ? '❌ 에러' : '⚠️ 알 수 없음'}
            </Text>
          </View>

          <View style={styles.logRow}>
            <Text style={styles.logLabel}>응답 시간:</Text>
            <Text style={[styles.logValue, { color: log.responseTimeMs < 1000 ? '#4ade80' : '#fbbf24' }]}>
              {log.responseTimeMs}ms
            </Text>
          </View>

          {log.version && (
            <View style={styles.logRow}>
              <Text style={styles.logLabel}>버전:</Text>
              <Text style={styles.logValue}>{log.version}</Text>
            </View>
          )}

          {log.region && (
            <View style={styles.logRow}>
              <Text style={styles.logLabel}>리전:</Text>
              <Text style={styles.logValue}>{log.region}</Text>
            </View>
          )}

          {log.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{log.error}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔍 Supabase Debug</Text>
          <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
            <Icon name="trash-2" size={20} color="#f87171" />
          </TouchableOpacity>
        </View>

        {/* 탭 */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'connection' && styles.activeTab]}
            onPress={() => setActiveTab('connection')}
          >
            <Text style={[styles.tabText, activeTab === 'connection' && styles.activeTabText]}>
              연결 ({connectionLogs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'health' && styles.activeTab]}
            onPress={() => setActiveTab('health')}
          >
            <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
              헬스체크 ({healthLogs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'errors' && styles.activeTab]}
            onPress={() => setActiveTab('errors')}
          >
            <Text style={[styles.tabText, activeTab === 'errors' && styles.activeTabText]}>
              에러 ({errorLogs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 로그 목록 */}
        <ScrollView style={styles.logList} contentContainerStyle={styles.logListContent}>
          {loading ? (
            <Text style={styles.emptyText}>로딩 중...</Text>
          ) : activeTab === 'connection' ? (
            connectionLogs.length > 0 ? (
              connectionLogs.map((log, index) => renderConnectionLog(log, index))
            ) : (
              <Text style={styles.emptyText}>연결 로그가 없습니다.</Text>
            )
          ) : activeTab === 'health' ? (
            healthLogs.length > 0 ? (
              healthLogs.map((log, index) => renderHealthLog(log, index))
            ) : (
              <Text style={styles.emptyText}>헬스체크 로그가 없습니다.</Text>
            )
          ) : (
            errorLogs.length > 0 ? (
              errorLogs.map((log, index) => renderErrorLog(log, index))
            ) : (
              <Text style={styles.emptyText}>에러 로그가 없습니다.</Text>
            )
          )}
        </ScrollView>

        {/* 하단 정보 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            플랫폼: {Platform.OS} | 환경: {__DEV__ ? 'Development' : 'Production'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.xl + 20,
    backgroundColor: 'rgba(45, 27, 71, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 184, 255, 0.2)',
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4d03f',
  },
  clearButton: {
    padding: Spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(45, 27, 71, 0.6)',
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.brand.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logList: {
    flex: 1,
  },
  logListContent: {
    padding: Spacing.lg,
  },
  logItem: {
    backgroundColor: 'rgba(45, 27, 71, 0.4)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 184, 255, 0.2)',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  logTime: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  logBody: {
    marginTop: Spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  logLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  logValue: {
    fontSize: 13,
    color: '#fff',
    flex: 1,
    textAlign: 'right',
  },
  errorBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  errorText: {
    fontSize: 12,
    color: '#f87171',
  },
  contextBox: {
    backgroundColor: 'rgba(155, 141, 184, 0.1)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  contextText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(45, 27, 71, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 184, 255, 0.2)',
  },
  footerText: {
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
