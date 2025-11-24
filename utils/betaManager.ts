/**
 * Beta Tester Manager - Android 베타 테스터 14일 무료 프리미엄
 *
 * 기능:
 * - Android 베타 테스터 자동 감지
 * - 14일 무료 프리미엄 자동 활성화 (다운로드 날짜 기준)
 * - 만료 시 자동 비활성화
 */

import { Platform } from 'react-native';
import LocalStorageManager, { PremiumStatus } from './localStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// 설정 (사용자 맞춤 설정 가능)
// ============================================================================
const BETA_CONFIG = {
  ENABLED: true,              // ⚙️ false로 설정하면 베타 프리미엄 비활성화
  DURATION_DAYS: 14,          // ⚙️ 무료 프리미엄 기간 (일 단위) - 현재 14일 설정
  STORAGE_KEY: '@tarot_timer:beta_premium_activated',
} as const;

// ============================================================================
// ⚠️ 사용 방법
// ============================================================================
// 1. ENABLED: 베타 프리미엄 기능 활성화/비활성화
//    - true: Android 베타 테스터에게 무료 프리미엄 제공
//    - false: 베타 프리미엄 완전 비활성화
//
// 2. DURATION_DAYS: 무료 프리미엄 기간 설정 (다운로드 날짜 기준)
//    - 14: 2주일 무료 프리미엄 (현재 설정)
//    - 7: 1주일 무료 프리미엄
//    - 30: 1개월 무료 프리미엄
//    - 90: 3개월 무료 프리미엄
//    - 365: 1년 무료 프리미엄
//
// 예시:
// - 1주일 테스트: DURATION_DAYS: 7
// - 2개월 베타: DURATION_DAYS: 60
// - 무제한(실질적): DURATION_DAYS: 3650 (10년)
// ============================================================================

// ============================================================================
// BetaManager 클래스
// ============================================================================
export class BetaManager {
  /**
   * Android 베타 테스터 여부 확인
   */
  private static isAndroidBetaTester(): boolean {
    // Android만 베타 프리미엄 적용
    if (Platform.OS !== 'android') {
      return false;
    }

    // 베타 기능이 활성화되어 있는지 확인
    if (!BETA_CONFIG.ENABLED) {
      console.log('🔧 [Beta] 베타 프리미엄 기능이 비활성화되어 있습니다');
      return false;
    }

    return true;
  }

  /**
   * 베타 프리미엄 활성화 여부 확인
   */
  private static async isBetaPremiumActivated(): Promise<boolean> {
    try {
      const activated = await AsyncStorage.getItem(BETA_CONFIG.STORAGE_KEY);
      return activated === 'true';
    } catch (error) {
      console.error('❌ [Beta] 활성화 상태 확인 실패:', error);
      return false;
    }
  }

  /**
   * 베타 프리미엄 활성화 기록
   */
  private static async markBetaPremiumActivated(): Promise<void> {
    try {
      await AsyncStorage.setItem(BETA_CONFIG.STORAGE_KEY, 'true');
      console.log('✅ [Beta] 베타 프리미엄 활성화 기록 완료');
    } catch (error) {
      console.error('❌ [Beta] 활성화 기록 실패:', error);
    }
  }

  /**
   * 베타 프리미엄 자동 활성화
   *
   * 앱 시작 시 호출하여 Android 베타 테스터에게 자동으로 30일 프리미엄 제공
   */
  static async initializeBetaPremium(): Promise<boolean> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎁 [Beta] 베타 프리미엄 초기화 시작');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // 1. Android 베타 테스터인지 확인
      if (!this.isAndroidBetaTester()) {
        console.log('ℹ️ [Beta] Android 베타 테스터가 아니므로 건너뜀');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return false;
      }

      console.log('✅ [Beta] Android 베타 테스터 확인됨');

      // 2. 이미 활성화되었는지 확인
      const alreadyActivated = await this.isBetaPremiumActivated();
      if (alreadyActivated) {
        console.log('ℹ️ [Beta] 이미 베타 프리미엄이 활성화되어 있음');

        // 만료 여부 확인
        const currentStatus = await LocalStorageManager.getPremiumStatus();
        if (currentStatus.is_premium && currentStatus.expiry_date) {
          const now = new Date();
          const expiryDate = new Date(currentStatus.expiry_date);

          if (now < expiryDate) {
            const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`✅ [Beta] 베타 프리미엄 유효 (남은 기간: ${daysLeft}일)`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return true;
          } else {
            console.log('⏰ [Beta] 베타 프리미엄 만료됨');
            await this.deactivateBetaPremium();
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return false;
          }
        }
      }

      // 3. 기존 구독이 있는지 확인
      const currentStatus = await LocalStorageManager.getPremiumStatus();
      if (currentStatus.is_premium && currentStatus.store_transaction_id) {
        console.log('ℹ️ [Beta] 이미 유료 구독이 활성화되어 있음 - 베타 프리미엄 건너뜀');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return false;
      }

      // 4. 베타 프리미엄 활성화
      console.log('🎁 [Beta] 30일 무료 프리미엄 활성화 시작...');

      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + BETA_CONFIG.DURATION_DAYS);

      const betaPremiumStatus: PremiumStatus = {
        is_premium: true,
        subscription_type: 'beta',
        purchase_date: now.toISOString(),
        expiry_date: expiryDate.toISOString(),
        store_transaction_id: `beta-android-${Date.now()}`,
        unlimited_storage: true,
        ad_free: true,
        premium_spreads: true,
        last_validated: now.toISOString(),
        validation_environment: 'Beta',
      };

      await LocalStorageManager.updatePremiumStatus(betaPremiumStatus);
      await this.markBetaPremiumActivated();

      console.log('✅ [Beta] 30일 무료 프리미엄 활성화 완료!');
      console.log(`📅 [Beta] 만료일: ${expiryDate.toISOString()}`);
      console.log(`📅 [Beta] 유효 기간: ${BETA_CONFIG.DURATION_DAYS}일`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return true;

    } catch (error) {
      console.error('❌ [Beta] 베타 프리미엄 초기화 오류:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return false;
    }
  }

  /**
   * 베타 프리미엄 비활성화
   */
  static async deactivateBetaPremium(): Promise<void> {
    try {
      console.log('🔄 [Beta] 베타 프리미엄 비활성화 시작...');

      const deactivatedStatus: PremiumStatus = {
        is_premium: false,
        unlimited_storage: false,
        ad_free: false,
        premium_spreads: false,
        last_validated: new Date().toISOString(),
        validation_environment: 'Beta',
      };

      await LocalStorageManager.updatePremiumStatus(deactivatedStatus);
      console.log('✅ [Beta] 베타 프리미엄 비활성화 완료');

    } catch (error) {
      console.error('❌ [Beta] 비활성화 오류:', error);
    }
  }

  /**
   * 베타 프리미엄 상태 확인
   */
  static async checkBetaPremiumStatus(): Promise<{
    isActive: boolean;
    daysLeft: number;
    expiryDate: string | null;
  }> {
    try {
      if (!this.isAndroidBetaTester()) {
        return { isActive: false, daysLeft: 0, expiryDate: null };
      }

      const activated = await this.isBetaPremiumActivated();
      if (!activated) {
        return { isActive: false, daysLeft: 0, expiryDate: null };
      }

      const currentStatus = await LocalStorageManager.getPremiumStatus();
      if (!currentStatus.is_premium || !currentStatus.expiry_date) {
        return { isActive: false, daysLeft: 0, expiryDate: null };
      }

      const now = new Date();
      const expiryDate = new Date(currentStatus.expiry_date);
      const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        await this.deactivateBetaPremium();
        return { isActive: false, daysLeft: 0, expiryDate: null };
      }

      return {
        isActive: true,
        daysLeft,
        expiryDate: currentStatus.expiry_date,
      };

    } catch (error) {
      console.error('❌ [Beta] 상태 확인 오류:', error);
      return { isActive: false, daysLeft: 0, expiryDate: null };
    }
  }

  /**
   * 베타 프리미엄 리셋 (개발/테스트용)
   */
  static async resetBetaPremium(): Promise<void> {
    try {
      console.log('🔄 [Beta] 베타 프리미엄 리셋 시작...');

      await AsyncStorage.removeItem(BETA_CONFIG.STORAGE_KEY);
      await this.deactivateBetaPremium();

      console.log('✅ [Beta] 베타 프리미엄 리셋 완료');
    } catch (error) {
      console.error('❌ [Beta] 리셋 오류:', error);
    }
  }
}

export default BetaManager;
