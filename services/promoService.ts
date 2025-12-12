import AsyncStorage from '@react-native-async-storage/async-storage';
import { VALID_PROMO_CODES } from '../constants/promoCodes';
import LocalStorageManager, { PremiumStatus } from '../utils/localStorage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
    PROMO_EXPIRES_AT: '@tarot/promo_expires_at',
    USED_PROMO_CODES: '@tarot/used_promo_codes',
};

export const PromoService = {
    /**
     * 프로모션 코드 적용
     */
    applyPromoCode: async (code: string): Promise<{ success: boolean; message: string }> => {
        try {
            const normalizedCode = code.trim();

            // 1. 유효한 코드인지 확인
            if (!VALID_PROMO_CODES.includes(normalizedCode)) {
                return { success: false, message: '유효하지 않은 코드입니다.' };
            }

            // 2. 이미 사용한 코드인지 확인
            const usedCodesJson = await AsyncStorage.getItem(STORAGE_KEYS.USED_PROMO_CODES);
            const usedCodes: string[] = usedCodesJson ? JSON.parse(usedCodesJson) : [];

            if (usedCodes.includes(normalizedCode)) {
                return { success: false, message: '이미 사용한 코드입니다.' };
            }

            // 3. 프리미엄 만료일 설정 (7일 후)
            const now = new Date();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await AsyncStorage.setItem(STORAGE_KEYS.PROMO_EXPIRES_AT, expiresAt.toISOString());

            // 4. 사용한 코드 목록에 추가
            usedCodes.push(normalizedCode);
            await AsyncStorage.setItem(STORAGE_KEYS.USED_PROMO_CODES, JSON.stringify(usedCodes));

            // 5. LocalStorage 프리미엄 상태 업데이트
            const promoStatus: PremiumStatus = {
                is_premium: true,
                subscription_type: 'promo',
                purchase_date: now.toISOString(),
                expiry_date: expiresAt.toISOString(),
                unlimited_storage: true,
                ad_free: true,
                premium_spreads: true,
                is_simulation: false
            };

            await LocalStorageManager.updatePremiumStatus(promoStatus);

            // 6. 이벤트 발생 (PremiumContext 갱신용)
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('premiumStatusChanged', { detail: promoStatus }));
            } else {
                // React Native 환경
                try {
                    const { DeviceEventEmitter } = require('react-native');
                    DeviceEventEmitter.emit('premiumStatusChanged', promoStatus);
                } catch (e) {
                    console.warn('DeviceEventEmitter not available');
                }
            }

            return { success: true, message: '🎉 7일간 프리미엄 혜택이 적용되었습니다!' };

        } catch (error) {
            console.error('Promo code error:', error);
            return { success: false, message: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
        }
    },

    /**
     * 현재 프로모션 상태 확인 (만료 여부 등)
     * 필요시 앱 시작 시 호출하여 만료 처리 가능
     */
    checkPromoStatus: async (): Promise<void> => {
        const expiresAtStr = await AsyncStorage.getItem(STORAGE_KEYS.PROMO_EXPIRES_AT);
        if (!expiresAtStr) return;

        const expiresAt = new Date(expiresAtStr);
        const now = new Date();

        if (now > expiresAt) {
            // 만료됨 -> 프리미엄 상태 해제 (단, 다른 유효한 구독이 없을 때만)
            const currentStatus = await LocalStorageManager.getPremiumStatus();
            if (currentStatus.subscription_type === 'promo') {
                await LocalStorageManager.updatePremiumStatus({
                    is_premium: false,
                    unlimited_storage: false,
                    ad_free: false,
                    premium_spreads: false
                });
                console.log('프로모션 기간 만료');
            }
        }
    }
};
