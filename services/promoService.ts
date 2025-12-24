/**
 * 프로모션 코드 서비스 (Supabase 연동 버전)
 *
 * 특징:
 * - Supabase에서 실시간 코드 관리
 * - 코드별 무료 기간 설정 가능
 * - 사용 횟수 제한 지원
 * - 중복 사용 방지 (디바이스 ID 기반)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageManager, { PremiumStatus } from '../utils/localStorage';
import { Platform } from 'react-native';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import * as Device from 'expo-device';
import { VALID_PROMO_CODES } from '../constants/promoCodes';

const STORAGE_KEYS = {
    DEVICE_ID: '@tarot/device_id',
    USED_PROMO_CODES: '@tarot/used_promo_codes', // 로컬 백업용
};

/**
 * 디바이스 고유 ID 생성/조회
 */
const getDeviceId = async (): Promise<string> => {
    try {
        // 1. 로컬에 저장된 ID 확인
        let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);

        if (deviceId) {
            return deviceId;
        }

        // 2. 새 ID 생성 (UUID v4 형식)
        deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // 3. Expo Device 정보 추가 (가능한 경우)
        try {
            const deviceName = Device.deviceName || '';
            const osVersion = Device.osVersion || '';
            deviceId = `${Platform.OS}-${deviceName}-${osVersion}-${deviceId}`;
        } catch (e) {
            console.warn('Expo Device 정보 추가 실패:', e);
        }

        // 4. 로컬 저장
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);

        return deviceId;
    } catch (error) {
        console.error('디바이스 ID 생성 실패:', error);
        // Fallback: 임시 ID
        return `${Platform.OS}-temp-${Date.now()}`;
    }
};

/**
 * 사용자 ID 가져오기 (Supabase Auth)
 */
const getUserId = async (): Promise<string | null> => {
    try {
        if (!isSupabaseAvailable() || !supabase) {
            return null;
        }
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || null;
    } catch (error) {
        console.warn('사용자 ID 조회 실패 (익명 사용자):', error);
        return null;
    }
};

/**
 * 오프라인 모드에서 프로모션 코드 적용
 * Supabase 연결이 안 될 때 로컬 검증으로 처리
 */
const applyPromoCodeOffline = async (
    normalizedCode: string,
    deviceId: string
): Promise<{ success: boolean; message: string; expiresAt?: Date; benefits?: any }> => {
    console.log('🔌 오프라인 프로모션 코드 검증:', normalizedCode);

    // 1. 로컬 유효 코드 목록에서 확인 (대소문자 무관)
    const validCodesUpper = VALID_PROMO_CODES.map(c => c.toUpperCase());
    if (!validCodesUpper.includes(normalizedCode)) {
        return { success: false, message: '유효하지 않거나 만료된 코드입니다.' };
    }

    // 2. 이미 사용한 코드인지 확인
    try {
        const usedCodesJson = await AsyncStorage.getItem(STORAGE_KEYS.USED_PROMO_CODES);
        const usedCodes: string[] = usedCodesJson ? JSON.parse(usedCodesJson) : [];

        if (usedCodes.includes(normalizedCode)) {
            return { success: false, message: '이미 사용한 코드입니다.' };
        }

        // 3. 코드 사용 처리
        usedCodes.push(normalizedCode);
        await AsyncStorage.setItem(STORAGE_KEYS.USED_PROMO_CODES, JSON.stringify(usedCodes));
    } catch (error) {
        console.warn('로컬 코드 확인 실패:', error);
    }

    // 4. 프리미엄 상태 업데이트 (7일 무료)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const benefits = {
        unlimited_storage: true,
        ad_free: true,
        premium_spreads: true
    };

    const promoStatus: PremiumStatus = {
        is_premium: true,
        subscription_type: 'promo',
        purchase_date: new Date().toISOString(),
        expiry_date: expiresAt.toISOString(),
        unlimited_storage: true,
        ad_free: true,
        premium_spreads: true,
        is_simulation: false
    };

    await LocalStorageManager.updatePremiumStatus(promoStatus);

    // 5. 이벤트 발생
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('premiumStatusChanged', { detail: promoStatus }));
    } else {
        try {
            const { DeviceEventEmitter } = require('react-native');
            DeviceEventEmitter.emit('premiumStatusChanged', promoStatus);
        } catch (e) {
            console.warn('DeviceEventEmitter 이벤트 발송 실패:', e);
        }
    }

    console.log('✅ 오프라인 프로모션 코드 적용 완료:', { code: normalizedCode, expiresAt });

    return {
        success: true,
        message: '🎉 7일간 프리미엄 혜택이 적용되었습니다! (오프라인 모드)',
        expiresAt,
        benefits
    };
};

/**
 * IP 주소 가져오기 (선택사항)
 * 안드로이드 성능 최적화: 모바일에서는 IP 조회 건너뜀
 */
const getIpAddress = async (): Promise<string | null> => {
    try {
        // 안드로이드/iOS에서는 IP 조회 건너뜀 (성능 최적화)
        if (Platform.OS !== 'web') {
            return null;
        }

        // Web 환경에서만 IP 가져오기 시도 (1초 타임아웃)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

        const response = await fetch('https://api.ipify.org?format=json', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        return data.ip || null;
    } catch (error) {
        // 타임아웃이나 네트워크 오류 시 무시 (IP는 선택사항)
        return null;
    }
};

export const PromoService = {
    /**
     * 프로모션 코드 적용 (Supabase 버전)
     */
    applyPromoCode: async (code: string): Promise<{ success: boolean; message: string; expiresAt?: Date; benefits?: any }> => {
        try {
            const normalizedCode = code.trim().toUpperCase();

            console.log('🎁 프로모션 코드 적용 시작:', normalizedCode);

            // 1. 디바이스 ID 및 사용자 정보 수집
            const deviceId = await getDeviceId();
            const userId = await getUserId();
            const ipAddress = await getIpAddress();
            const userAgent = Platform.OS === 'web' ? navigator.userAgent : `${Platform.OS} ${Platform.Version}`;

            console.log('📱 디바이스 정보:', { deviceId, userId: userId ? 'authenticated' : 'anonymous', platform: Platform.OS });

            // 2. Supabase 사용 가능 여부 확인
            if (!isSupabaseAvailable() || !supabase) {
                console.log('⚠️ Supabase 미연결 - 오프라인 모드로 코드 검증');
                return await applyPromoCodeOffline(normalizedCode, deviceId);
            }

            // 3. Supabase 함수 호출 (유효성 검증 + 적용)
            const { data, error } = await supabase.rpc('apply_promo_code', {
                p_code: normalizedCode,
                p_device_id: deviceId,
                p_user_id: userId,
                p_platform: Platform.OS,
                p_user_agent: userAgent,
                p_ip_address: ipAddress,
            });

            if (error) {
                console.error('❌ Supabase 함수 호출 실패:', error);
                throw new Error(error.message || '코드 적용 중 오류가 발생했습니다.');
            }

            // 3. 응답 처리
            const result = Array.isArray(data) ? data[0] : data;

            if (!result.success) {
                console.log('⚠️ 코드 적용 실패:', result.message);
                return { success: false, message: result.message };
            }

            // 4. LocalStorage 프리미엄 상태 업데이트
            const expiresAt = new Date(result.expires_at);
            const benefits = result.benefits || {
                unlimited_storage: true,
                ad_free: true,
                premium_spreads: true
            };

            const promoStatus: PremiumStatus = {
                is_premium: true,
                subscription_type: 'promo',
                purchase_date: new Date().toISOString(),
                expiry_date: expiresAt.toISOString(),
                unlimited_storage: benefits.unlimited_storage !== false,
                ad_free: benefits.ad_free !== false,
                premium_spreads: benefits.premium_spreads !== false,
                is_simulation: false
            };

            await LocalStorageManager.updatePremiumStatus(promoStatus);

            // 5. 로컬 백업 (오프라인 대비)
            try {
                const usedCodesJson = await AsyncStorage.getItem(STORAGE_KEYS.USED_PROMO_CODES);
                const usedCodes: string[] = usedCodesJson ? JSON.parse(usedCodesJson) : [];
                if (!usedCodes.includes(normalizedCode)) {
                    usedCodes.push(normalizedCode);
                    await AsyncStorage.setItem(STORAGE_KEYS.USED_PROMO_CODES, JSON.stringify(usedCodes));
                }
            } catch (localError) {
                console.warn('로컬 백업 저장 실패 (무시):', localError);
            }

            // 6. 이벤트 발생 (PremiumContext 갱신용)
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('premiumStatusChanged', { detail: promoStatus }));
            } else {
                try {
                    const { DeviceEventEmitter } = require('react-native');
                    DeviceEventEmitter.emit('premiumStatusChanged', promoStatus);
                } catch (e) {
                    console.warn('DeviceEventEmitter 이벤트 발송 실패:', e);
                }
            }

            console.log('✅ 프로모션 코드 적용 완료:', { code: normalizedCode, expiresAt });

            return {
                success: true,
                message: result.message,
                expiresAt,
                benefits
            };

        } catch (error) {
            console.error('❌ 프로모션 코드 적용 오류 (Supabase 실패):', error);

            // 네트워크 오류 등으로 Supabase 호출 실패 시 오프라인 폴백 시도
            console.log('🔄 오프라인 폴백 시도...');
            const deviceId = await getDeviceId();
            return await applyPromoCodeOffline(code.trim().toUpperCase(), deviceId);
        }
    },

    /**
     * 현재 프로모션 상태 확인 (만료 여부 등)
     */
    checkPromoStatus: async (): Promise<void> => {
        try {
            const currentStatus = await LocalStorageManager.getPremiumStatus();

            // 프로모션 타입이 아니면 체크 불필요
            if (currentStatus.subscription_type !== 'promo') {
                return;
            }

            // 만료일 확인
            if (currentStatus.expiry_date) {
                const expiryDate = new Date(currentStatus.expiry_date);
                const now = new Date();

                if (now > expiryDate) {
                    console.log('⏰ 프로모션 기간 만료 - 프리미엄 해제');

                    // 다른 유효한 구독이 없으면 프리미엄 해제
                    await LocalStorageManager.updatePremiumStatus({
                        is_premium: false,
                        unlimited_storage: false,
                        ad_free: false,
                        premium_spreads: false
                    });

                    // 이벤트 발생
                    if (Platform.OS === 'web' && typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('premiumStatusChanged', {
                            detail: { is_premium: false }
                        }));
                    } else {
                        try {
                            const { DeviceEventEmitter } = require('react-native');
                            DeviceEventEmitter.emit('premiumStatusChanged', { is_premium: false });
                        } catch (e) {
                            console.warn('DeviceEventEmitter 이벤트 발송 실패:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('❌ 프로모션 상태 확인 오류:', error);
        }
    },

    /**
     * 프로모션 코드 유효성 미리 확인 (적용 전)
     */
    validatePromoCode: async (code: string): Promise<{ isValid: boolean; message: string; freeDays?: number }> => {
        try {
            const normalizedCode = code.trim().toUpperCase();

            // 오프라인 모드에서는 로컬 검증
            if (!isSupabaseAvailable() || !supabase) {
                const validCodesUpper = VALID_PROMO_CODES.map(c => c.toUpperCase());
                const isValid = validCodesUpper.includes(normalizedCode);
                return {
                    isValid,
                    message: isValid ? '유효한 코드입니다.' : '유효하지 않은 코드입니다.',
                    freeDays: isValid ? 7 : undefined
                };
            }

            const deviceId = await getDeviceId();
            const userId = await getUserId();

            const { data, error } = await supabase.rpc('validate_promo_code', {
                p_code: normalizedCode,
                p_device_id: deviceId,
                p_user_id: userId
            });

            if (error) {
                console.error('코드 검증 실패:', error);
                return { isValid: false, message: '코드 검증 중 오류가 발생했습니다.' };
            }

            const result = Array.isArray(data) ? data[0] : data;

            return {
                isValid: result.is_valid,
                message: result.error_message || '유효한 코드입니다.',
                freeDays: result.free_days
            };
        } catch (error) {
            console.error('코드 검증 오류:', error);
            // 오류 시 로컬 폴백
            const validCodesUpper = VALID_PROMO_CODES.map(c => c.toUpperCase());
            const normalizedCode = code.trim().toUpperCase();
            const isValid = validCodesUpper.includes(normalizedCode);
            return {
                isValid,
                message: isValid ? '유효한 코드입니다. (오프라인)' : '유효하지 않은 코드입니다.',
                freeDays: isValid ? 7 : undefined
            };
        }
    },

    /**
     * 디바이스 ID 초기화 (테스트용)
     * ⚠️ 개발 환경에서만 사용
     */
    resetDeviceId: async (): Promise<void> => {
        if (!__DEV__) {
            throw new Error('resetDeviceId는 개발 환경에서만 사용 가능합니다.');
        }
        await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
        await AsyncStorage.removeItem(STORAGE_KEYS.USED_PROMO_CODES);
        console.log('✅ 디바이스 ID 및 로컬 백업 초기화 완료');
    }
};

export default PromoService;
