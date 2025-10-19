/**
 * 프리미엄 기능 통합 테스트 컴포넌트
 * 모든 프리미엄 기능과 연동이 올바르게 작동하는지 확인
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { usePremium, usePremiumFeature, usePremiumStatus } from '../contexts/PremiumContext';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography
} from './DesignSystem';
import { Icon } from './Icon';

// 조건부 import - 모바일 환경에서 안전하게 로드
let IAPManager: any = null;
let AdManager: any = null;
let ReceiptValidator: any = null;

try {
  IAPManager = require('../utils/iapManager').default;
} catch (error) {
  console.warn('⚠️ IAPManager 로드 실패 (IAP 비활성화):', error);
}

try {
  AdManager = require('../utils/adManager').default;
} catch (error) {
  console.warn('⚠️ AdManager 로드 실패 (광고 비활성화):', error);
}

try {
  ReceiptValidator = require('../utils/receiptValidator').default;
} catch (error) {
  console.warn('⚠️ ReceiptValidator 로드 실패 (영수증 검증 비활성화):', error);
}

export const PremiumTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    status: 'pending' | 'success' | 'error';
    message: string;
  }>>([]);

  const [isRunning, setIsRunning] = useState(false);

  // 프리미엄 상태 훅들
  const {
    premiumStatus,
    isLoading,
    lastError,
    refreshStatus,
    validateSubscription,
    canAccessFeature
  } = usePremium();

  const { isPremium, isActive, daysLeft, subscriptionType } = usePremiumStatus();
  const hasAdFree = usePremiumFeature('ad_free');
  const hasUnlimitedStorage = usePremiumFeature('unlimited_storage');
  const hasPremiumSpreads = usePremiumFeature('premium_spreads');

  /**
   * 테스트 로그 추가
   */
  const addTestResult = (name: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { name, status, message }]);
  };

  /**
   * 종합 테스트 실행
   */
  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // 1. IAPManager 초기화 테스트
      addTestResult('IAPManager 초기화', 'pending', '테스트 중...');
      try {
        if (IAPManager) {
          await IAPManager.initialize();
          addTestResult('IAPManager 초기화', 'success', '초기화 완료');
        } else {
          addTestResult('IAPManager 초기화', 'error', 'IAPManager 모듈을 로드할 수 없습니다');
        }
      } catch (error) {
        addTestResult('IAPManager 초기화', 'error', error instanceof Error ? error.message : '초기화 실패');
      }

      // 2. AdManager 초기화 테스트
      addTestResult('AdManager 초기화', 'pending', '테스트 중...');
      try {
        if (AdManager) {
          await AdManager.initialize();
          addTestResult('AdManager 초기화', 'success', '초기화 완료');
        } else {
          addTestResult('AdManager 초기화', 'error', 'AdManager 모듈을 로드할 수 없습니다');
        }
      } catch (error) {
        addTestResult('AdManager 초기화', 'error', error instanceof Error ? error.message : '초기화 실패');
      }

      // 3. 구독 상품 로드 테스트
      addTestResult('구독 상품 로드', 'pending', '테스트 중...');
      try {
        if (IAPManager) {
          const products = await IAPManager.loadProducts();
          addTestResult('구독 상품 로드', 'success', `${products.length}개 상품 로드됨`);
        } else {
          addTestResult('구독 상품 로드', 'error', 'IAPManager를 사용할 수 없습니다');
        }
      } catch (error) {
        addTestResult('구독 상품 로드', 'error', error instanceof Error ? error.message : '로드 실패');
      }

      // 4. 프리미엄 상태 조회 테스트
      addTestResult('프리미엄 상태 조회', 'pending', '테스트 중...');
      try {
        if (IAPManager) {
          const status = await IAPManager.getCurrentSubscriptionStatus();
          addTestResult('프리미엄 상태 조회', 'success', `프리미엄: ${status.is_premium}, 광고 없음: ${status.ad_free}`);
        } else {
          addTestResult('프리미엄 상태 조회', 'error', 'IAPManager를 사용할 수 없습니다');
        }
      } catch (error) {
        addTestResult('프리미엄 상태 조회', 'error', error instanceof Error ? error.message : '조회 실패');
      }

      // 5. 광고 표시 조건 테스트
      addTestResult('광고 표시 조건', 'pending', '테스트 중...');
      try {
        if (AdManager) {
          const shouldShowBanner = AdManager.shouldShowBanner();
          const bannerUnitId = AdManager.getBannerAdUnitId();
          addTestResult('광고 표시 조건', 'success', `배너 표시: ${shouldShowBanner}, Unit ID: ${bannerUnitId}`);
        } else {
          addTestResult('광고 표시 조건', 'error', 'AdManager를 사용할 수 없습니다');
        }
      } catch (error) {
        addTestResult('광고 표시 조건', 'error', error instanceof Error ? error.message : '테스트 실패');
      }

      // 6. 영수증 검증 시뮬레이션 테스트
      addTestResult('영수증 검증', 'pending', '테스트 중...');
      try {
        if (ReceiptValidator) {
          const mockReceipt = JSON.stringify({
            transactionId: 'test-transaction-123',
            productId: 'tarot_timer_monthly',
            purchaseDate: Date.now()
          });
          const validation = await ReceiptValidator.validateReceipt(mockReceipt, 'test-transaction-123');
          addTestResult('영수증 검증', 'success', `검증 결과: ${validation.isValid}, 활성: ${validation.isActive}`);
        } else {
          addTestResult('영수증 검증', 'error', 'ReceiptValidator를 사용할 수 없습니다');
        }
      } catch (error) {
        addTestResult('영수증 검증', 'error', error instanceof Error ? error.message : '검증 실패');
      }

      // 7. 보안 감사 로그 테스트
      addTestResult('보안 감사 로그', 'pending', '테스트 중...');
      try {
        if (ReceiptValidator) {
          const auditLog = ReceiptValidator.generateSecurityAuditLog();
          addTestResult('보안 감사 로그', 'success', `활성 재시도: ${auditLog.activeRetries}, 타임스탬프: ${auditLog.timestamp}`);
        } else {
          addTestResult('보안 감사 로그', 'error', 'ReceiptValidator를 사용할 수 없습니다');
        }
      } catch (error) {
        addTestResult('보안 감사 로그', 'error', error instanceof Error ? error.message : '로그 생성 실패');
      }

      // 8. Context 상태 업데이트 테스트
      addTestResult('Context 상태 업데이트', 'pending', '테스트 중...');
      try {
        await refreshStatus();
        addTestResult('Context 상태 업데이트', 'success', '상태 새로고침 완료');
      } catch (error) {
        addTestResult('Context 상태 업데이트', 'error', error instanceof Error ? error.message : '업데이트 실패');
      }

    } catch (error) {
      addTestResult('전체 테스트', 'error', error instanceof Error ? error.message : '테스트 실행 중 오류');
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * 프리미엄 시뮬레이션 토글
   */
  const togglePremiumSimulation = async () => {
    try {
      // IAPManager 로드 확인
      if (!IAPManager) {
        Alert.alert('오류', 'IAPManager를 사용할 수 없습니다. 모바일 환경에서만 사용 가능합니다.');
        return;
      }

      const newStatus = !isPremium;

      Alert.alert(
        '프리미엄 시뮬레이션',
        `프리미엄 상태를 ${newStatus ? '활성화' : '비활성화'} 하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '확인',
            onPress: async () => {
              try {
                // 시뮬레이션 모드에서 프리미엄 상태 변경
                await IAPManager.simulatePremiumStatusChange(newStatus);
                await refreshStatus();
                Alert.alert('완료', `프리미엄 상태가 ${newStatus ? '활성화' : '비활성화'}되었습니다.`);
              } catch (error) {
                Alert.alert('오류', error instanceof Error ? error.message : '상태 변경 실패');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '상태 변경 실패');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="sparkles" size={24} color={Colors.brand.secondary} />
        <Text style={styles.title}>프리미엄 기능 통합 테스트</Text>
      </View>

      {/* 현재 상태 표시 */}
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>현재 상태</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>프리미엄 상태:</Text>
          <Text style={[styles.statusValue, isPremium ? styles.activeStatus : styles.inactiveStatus]}>
            {isPremium ? '활성' : '비활성'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>구독 활성:</Text>
          <Text style={[styles.statusValue, isActive ? styles.activeStatus : styles.inactiveStatus]}>
            {isActive ? '활성' : '비활성'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>구독 타입:</Text>
          <Text style={styles.statusValue}>{subscriptionType || '없음'}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>남은 일수:</Text>
          <Text style={styles.statusValue}>{daysLeft !== null ? `${daysLeft}일` : '없음'}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>광고 없음:</Text>
          <Text style={[styles.statusValue, hasAdFree ? styles.activeStatus : styles.inactiveStatus]}>
            {hasAdFree ? '활성' : '비활성'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>무제한 저장:</Text>
          <Text style={[styles.statusValue, hasUnlimitedStorage ? styles.activeStatus : styles.inactiveStatus]}>
            {hasUnlimitedStorage ? '활성' : '비활성'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>프리미엄 스프레드:</Text>
          <Text style={[styles.statusValue, hasPremiumSpreads ? styles.activeStatus : styles.inactiveStatus]}>
            {hasPremiumSpreads ? '활성' : '비활성'}
          </Text>
        </View>

        {lastError && (
          <View style={styles.errorContainer}>
            <Icon name="x-circle" size={16} color={Colors.state.error} />
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        )}
      </View>

      {/* 테스트 버튼들 */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runComprehensiveTest}
          disabled={isRunning}
          activeOpacity={0.7}
        >
          <Icon name={isRunning ? "clock" : "play"} size={16} color={Colors.text.inverse} />
          <Text style={styles.buttonText}>
            {isRunning ? '테스트 실행 중...' : '종합 테스트 실행'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={togglePremiumSimulation}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Icon name="refresh-cw" size={16} color={Colors.brand.primary} />
          <Text style={styles.secondaryButtonText}>프리미엄 시뮬레이션 토글</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={refreshStatus}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Icon name="refresh-cw" size={16} color={Colors.brand.primary} />
          <Text style={styles.secondaryButtonText}>상태 새로고침</Text>
        </TouchableOpacity>
      </View>

      {/* 테스트 결과 */}
      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>테스트 결과</Text>
          {testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Icon
                name={
                  result.status === 'success' ? 'check-circle' :
                  result.status === 'error' ? 'x-circle' : 'clock'
                }
                size={16}
                color={
                  result.status === 'success' ? Colors.state.success :
                  result.status === 'error' ? Colors.state.error : Colors.text.secondary
                }
              />
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={styles.resultMessage}>{result.message}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },

  statusContainer: {
    backgroundColor: Colors.glass.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.brand.secondary,
    marginBottom: Spacing.md,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  statusLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
  },

  statusValue: {
    fontSize: Typography.sizes.md,
    fontWeight: '500',
    color: Colors.text.primary,
  },

  activeStatus: {
    color: Colors.state.success,
  },

  inactiveStatus: {
    color: Colors.text.secondary,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },

  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.state.error,
    marginLeft: Spacing.xs,
    flex: 1,
  },

  buttonsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },

  primaryButton: {
    backgroundColor: Colors.brand.primary,
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },

  buttonText: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.text.inverse,
  },

  secondaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: '600',
    color: Colors.brand.primary,
  },

  resultsContainer: {
    backgroundColor: Colors.glass.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  resultContent: {
    flex: 1,
  },

  resultName: {
    fontSize: Typography.sizes.md,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  resultMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
});

export default PremiumTest;