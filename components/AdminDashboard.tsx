/**
 * 관리자 전용 대시보드 컴포넌트
 * 앱 사용 통계, 오류 로그, 사용자 피드백 관리
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, Typography } from './DesignSystem';
import AnalyticsManager, { AppUsageStats, AnalyticsEvent } from '../utils/analyticsManager';
import LocalDataManager from '../utils/localDataManager';

const { width } = Dimensions.get('window');

interface LocalDataStats {
  totalSessions: number;
  totalJournalEntries: number;
  storageUsed: number;
  lastBackupTime?: string;
}

interface DashboardData {
  usage_stats: AppUsageStats;
  local_data_stats: LocalDataStats;
  recent_events: AnalyticsEvent[];
  analytics_enabled: boolean;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminAccess, setAdminAccess] = useState(true); // 로컬 대시보드는 항상 접근 가능

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 로컬 분석 데이터 수집
      const [usageStats, localDataStats, recentEvents, analyticsEnabled] = await Promise.all([
        AnalyticsManager.generateUsageStats(),
        LocalDataManager.getLocalDataStatus(),
        AnalyticsManager.getStoredEvents(),
        AnalyticsManager.isAnalyticsEnabled()
      ]);

      const data: DashboardData = {
        usage_stats: usageStats,
        local_data_stats: localDataStats,
        recent_events: recentEvents.slice(-50), // 최근 50개 이벤트
        analytics_enabled: analyticsEnabled
      };

      setDashboardData(data);
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
      Alert.alert('오류', '대시보드 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const collectStats = async () => {
    try {
      // 오래된 이벤트 정리
      await AnalyticsManager.cleanupOldEvents();
      Alert.alert('완료', '분석 데이터가 정리되고 통계가 업데이트되었습니다.');
      loadDashboardData();
    } catch (error) {
      console.error('통계 수집 오류:', error);
      Alert.alert('오류', '통계 수집에 실패했습니다.');
    }
  };

  const toggleAnalytics = async () => {
    try {
      const currentStatus = await AnalyticsManager.isAnalyticsEnabled();
      await AnalyticsManager.setAnalyticsEnabled(!currentStatus);

      Alert.alert(
        '설정 변경',
        `분석 데이터 수집이 ${!currentStatus ? '활성화' : '비활성화'}되었습니다.`
      );

      loadDashboardData();
    } catch (error) {
      console.error('분석 설정 변경 오류:', error);
      Alert.alert('오류', '설정 변경에 실패했습니다.');
    }
  };

  const exportAnalyticsData = async () => {
    try {
      const data = await AnalyticsManager.prepareDataForAdmin();
      if (data) {
        // 실제로는 파일로 내보내기 또는 관리자 서버로 전송
        Alert.alert(
          '데이터 내보내기',
          `익명화된 분석 데이터가 준비되었습니다.\n이벤트 수: ${data.anonymized_events.length}\n수집 시간: ${new Date(data.collected_at).toLocaleString('ko-KR')}`
        );
      }
    } catch (error) {
      console.error('데이터 내보내기 오류:', error);
      Alert.alert('오류', '데이터 내보내기에 실패했습니다.');
    }
  };

  // 관리자 권한이 없는 경우
  if (!adminAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>🔒 접근 권한 없음</Text>
          <Text style={styles.accessDeniedText}>
            관리자만 접근할 수 있는 페이지입니다.
          </Text>
        </View>
      </View>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>📊 대시보드 로딩 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 관리자 대시보드</Text>
        <Text style={styles.headerSubtitle}>타로 타이머 웹앱 로컬 분석</Text>
      </View>

      {/* 분석 상태 및 제어 버튼 */}
      <View style={styles.controlSection}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>
            분석 수집: {dashboardData?.analytics_enabled ? '🟢 활성화' : '🔴 비활성화'}
          </Text>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleAnalytics}>
            <Text style={styles.toggleButtonText}>
              {dashboardData?.analytics_enabled ? '비활성화' : '활성화'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={collectStats}>
            <Text style={styles.actionButtonText}>🧹 데이터 정리</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={exportAnalyticsData}>
            <Text style={styles.actionButtonText}>📤 데이터 내보내기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 로컬 데이터 통계 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💾 로컬 데이터 현황</Text>
        {dashboardData?.local_data_stats ? (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 타로 세션</Text>
              <Text style={styles.statValue}>{dashboardData.local_data_stats.totalSessions}개</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 저널 엔트리</Text>
              <Text style={styles.statValue}>{dashboardData.local_data_stats.totalJournalEntries}개</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>저장소 사용량</Text>
              <Text style={styles.statValue}>{dashboardData.local_data_stats.storageUsed} KB</Text>
            </View>
            {dashboardData.local_data_stats.lastBackupTime && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>마지막 백업</Text>
                <Text style={styles.statValue}>
                  {new Date(dashboardData.local_data_stats.lastBackupTime).toLocaleString('ko-KR')}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>로컬 데이터 정보가 없습니다.</Text>
        )}
      </View>

      {/* 앱 사용 통계 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 사용 패턴 분석</Text>
        {dashboardData?.usage_stats ? (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 세션 수</Text>
              <Text style={styles.statValue}>{dashboardData.usage_stats.total_sessions}회</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>타로 세션 완료</Text>
              <Text style={styles.statValue}>{dashboardData.usage_stats.total_tarot_sessions}회</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>저널 엔트리</Text>
              <Text style={styles.statValue}>{dashboardData.usage_stats.total_journal_entries}개</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>평균 세션 시간</Text>
              <Text style={styles.statValue}>{dashboardData.usage_stats.avg_session_duration}분</Text>
            </View>
            {dashboardData.usage_stats.popular_cards.length > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>인기 카드</Text>
                <Text style={styles.statValue}>
                  {dashboardData.usage_stats.popular_cards.slice(0, 3).join(', ')}
                </Text>
              </View>
            )}
            {dashboardData.usage_stats.popular_spreads.length > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>인기 스프레드</Text>
                <Text style={styles.statValue}>
                  {dashboardData.usage_stats.popular_spreads.slice(0, 3).join(', ')}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>사용 통계가 없습니다.</Text>
        )}
      </View>

      {/* 최근 이벤트 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐 최근 이벤트 로그</Text>
        {dashboardData?.recent_events.length ? (
          <View style={styles.eventsContainer}>
            {dashboardData.recent_events.slice(-10).reverse().map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventType}>
                    {getEventTypeIcon(event.event_type)} {getEventTypeName(event.event_type)}
                  </Text>
                  <Text style={styles.eventTime}>
                    {new Date(event.timestamp).toLocaleString('ko-KR')}
                  </Text>
                </View>
                {Object.keys(event.event_data).length > 0 && (
                  <Text style={styles.eventData} numberOfLines={2}>
                    {formatEventData(event.event_data)}
                  </Text>
                )}
                <Text style={styles.eventDetails}>
                  {event.device_info.platform} | {event.device_info.app_version}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>최근 이벤트가 없습니다.</Text>
        )}
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  headerTitle: {
    ...Typography.title,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  collectButton: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.brand.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  collectButtonText: {
    ...Typography.button.primary,
    color: Colors.text.inverse,
  },
  section: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  sectionTitle: {
    ...Typography.header.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  statsContainer: {
    gap: Spacing.sm,
  },
  statItem: {
    padding: Spacing.sm,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.main,
  },
  statTime: {
    ...Typography.caption.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  statText: {
    ...Typography.body.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statNumbers: {
    ...Typography.body,
    color: Colors.text.accent,
  },
  logsContainer: {
    gap: Spacing.sm,
  },
  logItem: {
    padding: Spacing.sm,
    backgroundColor: '#2d1b2e',
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.error,
  },
  logTime: {
    ...Typography.caption.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  logMessage: {
    ...Typography.body.medium,
    color: Colors.status.error,
    marginBottom: Spacing.xs,
  },
  logDetails: {
    ...Typography.caption.regular,
    color: Colors.text.tertiary,
  },
  feedbackContainer: {
    gap: Spacing.sm,
  },
  feedbackItem: {
    padding: Spacing.sm,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary.main,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  feedbackType: {
    ...Typography.caption.medium,
    color: Colors.text.accent,
  },
  feedbackRating: {
    ...Typography.caption.regular,
  },
  feedbackMessage: {
    ...Typography.body.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  feedbackTime: {
    ...Typography.caption.regular,
    color: Colors.text.secondary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: Spacing.lg,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  accessDeniedTitle: {
    ...Typography.title,
    color: Colors.status.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  accessDeniedText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.text.secondary,
  },
  bottomPadding: {
    height: Spacing.xl,
  },
  controlSection: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusLabel: {
    ...Typography.body.medium,
    color: Colors.text.primary,
    flex: 1,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.accent.main,
    borderRadius: BorderRadius.sm,
  },
  toggleButtonText: {
    ...Typography.button.secondary,
    color: Colors.text.inverse,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.brand.secondary,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    ...Typography.button.secondary,
    color: Colors.text.primary,
  },
  eventsContainer: {
    gap: Spacing.sm,
  },
  eventItem: {
    padding: Spacing.sm,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brand.primary,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  eventType: {
    ...Typography.caption.medium,
    color: Colors.text.accent,
    flex: 1,
  },
  eventTime: {
    ...Typography.caption.regular,
    color: Colors.text.secondary,
  },
  eventData: {
    ...Typography.caption.regular,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  eventDetails: {
    ...Typography.caption.regular,
    color: Colors.text.tertiary,
  },
  statLabel: {
    ...Typography.caption.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.body.medium,
    color: Colors.text.accent,
  },
});

// Helper functions for event display
const getEventTypeIcon = (eventType: string): string => {
  const iconMap: Record<string, string> = {
    'app_launch': '🚀',
    'app_close': '🔚',
    'tarot_session_start': '🔮',
    'tarot_session_complete': '✨',
    'journal_entry_add': '📝',
    'premium_feature_use': '💎',
    'setting_change': '⚙️',
    'card_draw': '🃏',
    'spread_select': '🎴',
    'export_data': '📤',
    'import_data': '📥',
  };
  return iconMap[eventType] || '📊';
};

const getEventTypeName = (eventType: string): string => {
  const nameMap: Record<string, string> = {
    'app_launch': '앱 시작',
    'app_close': '앱 종료',
    'tarot_session_start': '타로 세션 시작',
    'tarot_session_complete': '타로 세션 완료',
    'journal_entry_add': '저널 작성',
    'premium_feature_use': '프리미엄 기능 사용',
    'setting_change': '설정 변경',
    'card_draw': '카드 뽑기',
    'spread_select': '스프레드 선택',
    'export_data': '데이터 내보내기',
    'import_data': '데이터 가져오기',
  };
  return nameMap[eventType] || eventType;
};

const formatEventData = (eventData: Record<string, any>): string => {
  if (!eventData || Object.keys(eventData).length === 0) {
    return '';
  }

  const formatValue = (key: string, value: any): string => {
    if (key === 'session_duration_minutes') {
      return `세션 시간: ${value}분`;
    }
    if (key === 'spread_type') {
      return `스프레드: ${value}`;
    }
    if (key === 'card_count') {
      return `카드 수: ${value}개`;
    }
    if (key === 'card_name') {
      return `카드: ${value}`;
    }
    if (key === 'is_reversed') {
      return value ? '역방향' : '정방향';
    }
    if (key === 'feature_name') {
      return `기능: ${value}`;
    }
    if (key === 'setting_name') {
      return `설정: ${value}`;
    }
    if (key === 'entry_length') {
      return `글자 수: ${value}`;
    }
    if (key === 'has_images') {
      return value ? '이미지 포함' : '텍스트만';
    }

    return `${key}: ${value}`;
  };

  return Object.entries(eventData)
    .slice(0, 3) // 최대 3개 항목만 표시
    .map(([key, value]) => formatValue(key, value))
    .join(' | ');
};

export default AdminDashboard;