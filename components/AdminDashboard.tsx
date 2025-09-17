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
import {
  adminSupabase,
  isAdmin,
  getAdminDashboardData,
  collectAppUsageStats,
  AppUsageStats,
  ErrorLog,
  UserFeedback
} from '../utils/adminSupabase';

const { width } = Dimensions.get('window');

interface DashboardData {
  usage_stats: AppUsageStats[];
  error_logs: ErrorLog[];
  user_feedback: UserFeedback[];
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const hasAccess = await isAdmin();
      setAdminAccess(hasAccess);

      if (hasAccess) {
        await loadDashboardData();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('관리자 권한 확인 오류:', error);
      setAdminAccess(false);
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboardData();
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
      await collectAppUsageStats();
      Alert.alert('완료', '사용 통계가 수집되었습니다.');
      loadDashboardData();
    } catch (error) {
      console.error('통계 수집 오류:', error);
      Alert.alert('오류', '통계 수집에 실패했습니다.');
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
        <Text style={styles.headerSubtitle}>타로 타이머 웹앱 관리</Text>
      </View>

      {/* 통계 수집 버튼 */}
      <TouchableOpacity style={styles.collectButton} onPress={collectStats}>
        <Text style={styles.collectButtonText}>📈 통계 수집</Text>
      </TouchableOpacity>

      {/* 사용 통계 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 앱 사용 통계</Text>
        {dashboardData?.usage_stats.length ? (
          <View style={styles.statsContainer}>
            {dashboardData.usage_stats.slice(0, 5).map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statTime}>
                  {new Date(stat.timestamp).toLocaleString('ko-KR')}
                </Text>
                <Text style={styles.statText}>
                  버전: {stat.app_version} | 플랫폼: {stat.platform}
                </Text>
                <Text style={styles.statNumbers}>
                  예상 사용자: {stat.user_count_estimate} | 세션: {stat.session_count_estimate}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>수집된 통계가 없습니다.</Text>
        )}
      </View>

      {/* 오류 로그 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚨 오류 로그</Text>
        {dashboardData?.error_logs.length ? (
          <View style={styles.logsContainer}>
            {dashboardData.error_logs.slice(0, 5).map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleString('ko-KR')}
                </Text>
                <Text style={styles.logMessage} numberOfLines={2}>
                  {log.error_message}
                </Text>
                <Text style={styles.logDetails}>
                  {log.app_version} | {log.platform}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>오류 로그가 없습니다.</Text>
        )}
      </View>

      {/* 사용자 피드백 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💭 사용자 피드백</Text>
        {dashboardData?.user_feedback.length ? (
          <View style={styles.feedbackContainer}>
            {dashboardData.user_feedback.slice(0, 5).map((feedback, index) => (
              <View key={index} style={styles.feedbackItem}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackType}>
                    {feedback.feedback_type === 'bug' ? '🐛 버그' :
                     feedback.feedback_type === 'feature' ? '✨ 기능 요청' : '💬 일반'}
                  </Text>
                  {feedback.rating && (
                    <Text style={styles.feedbackRating}>
                      {'⭐'.repeat(feedback.rating)}
                    </Text>
                  )}
                </View>
                <Text style={styles.feedbackMessage} numberOfLines={3}>
                  {feedback.message}
                </Text>
                <Text style={styles.feedbackTime}>
                  {new Date(feedback.timestamp).toLocaleString('ko-KR')}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>피드백이 없습니다.</Text>
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
});

export default AdminDashboard;