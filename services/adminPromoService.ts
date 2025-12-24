/**
 * 관리자용 프로모션 코드 관리 서비스
 *
 * 주의: 이 파일은 관리자 대시보드에서만 사용해야 합니다.
 * 보안을 위해 Supabase RLS 정책이 적용되어 있습니다.
 */

import { supabase, isSupabaseAvailable } from '../lib/supabase';

/**
 * Supabase 연결 확인 헬퍼 함수
 */
const ensureSupabase = () => {
    if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase가 연결되지 않았습니다. 관리자 기능을 사용하려면 Supabase 연결이 필요합니다.');
    }
    return supabase;
};

export interface PromoCode {
    id: string;
    code: string;
    description: string | null;
    free_days: number;
    benefits: {
        unlimited_storage?: boolean;
        ad_free?: boolean;
        premium_spreads?: boolean;
    };
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    valid_from: string;
    valid_until: string | null;
    created_at: string;
    updated_at: string;
}

export interface PromoCodeStats {
    id: string;
    code: string;
    description: string | null;
    free_days: number;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    valid_from: string;
    valid_until: string | null;
    total_redemptions: number;
    unique_users: number;
    unique_devices: number;
    last_used_at: string | null;
    created_at: string;
}

export interface PromoCodeUsage {
    id: string;
    code: string;
    applied_at: string;
    expires_at: string;
    platform: string;
    user_agent: string | null;
    ip_address: string | null;
}

export const AdminPromoService = {
    /**
     * 모든 프로모션 코드 목록 조회
     */
    getAllPromoCodes: async (): Promise<PromoCode[]> => {
        const sb = ensureSupabase();
        const { data, error } = await sb
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('프로모션 코드 목록 조회 실패:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * 프로모션 코드 통계 조회
     */
    getPromoCodeStats: async (): Promise<PromoCodeStats[]> => {
        const sb = ensureSupabase();
        const { data, error } = await sb
            .from('promo_code_stats')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('프로모션 코드 통계 조회 실패:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * 특정 코드의 사용 내역 조회
     */
    getUsageByCode: async (code: string): Promise<PromoCodeUsage[]> => {
        const sb = ensureSupabase();
        const { data, error } = await sb
            .from('promo_code_usage')
            .select('*')
            .eq('code', code)
            .order('applied_at', { ascending: false });

        if (error) {
            console.error('사용 내역 조회 실패:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    /**
     * 새 프로모션 코드 생성
     */
    createPromoCode: async (params: {
        code: string;
        description?: string;
        freeDays: number;
        benefits?: {
            unlimited_storage?: boolean;
            ad_free?: boolean;
            premium_spreads?: boolean;
        };
        maxUses?: number | null;
        validFrom?: string;
        validUntil?: string | null;
    }): Promise<PromoCode> => {
        const sb = ensureSupabase();
        const { data: { user } } = await sb.auth.getUser();

        if (!user) {
            throw new Error('인증이 필요합니다.');
        }

        const { data, error } = await sb
            .from('promo_codes')
            .insert({
                code: params.code.toUpperCase(),
                description: params.description || null,
                free_days: params.freeDays,
                benefits: params.benefits || {
                    unlimited_storage: true,
                    ad_free: true,
                    premium_spreads: true
                },
                max_uses: params.maxUses || null,
                valid_from: params.validFrom || new Date().toISOString(),
                valid_until: params.validUntil || null,
                created_by: user.id
            })
            .select()
            .single();

        if (error) {
            console.error('프로모션 코드 생성 실패:', error);
            throw new Error(error.message);
        }

        return data;
    },

    /**
     * 프로모션 코드 수정
     */
    updatePromoCode: async (id: string, updates: {
        description?: string;
        freeDays?: number;
        benefits?: {
            unlimited_storage?: boolean;
            ad_free?: boolean;
            premium_spreads?: boolean;
        };
        maxUses?: number | null;
        isActive?: boolean;
        validFrom?: string;
        validUntil?: string | null;
    }): Promise<PromoCode> => {
        const updateData: any = {};

        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.freeDays !== undefined) updateData.free_days = updates.freeDays;
        if (updates.benefits !== undefined) updateData.benefits = updates.benefits;
        if (updates.maxUses !== undefined) updateData.max_uses = updates.maxUses;
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
        if (updates.validFrom !== undefined) updateData.valid_from = updates.validFrom;
        if (updates.validUntil !== undefined) updateData.valid_until = updates.validUntil;

        const sb = ensureSupabase();
        const { data, error } = await sb
            .from('promo_codes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('프로모션 코드 수정 실패:', error);
            throw new Error(error.message);
        }

        return data;
    },

    /**
     * 프로모션 코드 활성화/비활성화 토글
     */
    togglePromoCode: async (id: string): Promise<PromoCode> => {
        const sb = ensureSupabase();
        // 1. 현재 상태 조회
        const { data: currentCode, error: fetchError } = await sb
            .from('promo_codes')
            .select('is_active')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error('현재 상태 조회 실패:', fetchError);
            throw new Error(fetchError.message);
        }

        // 2. 상태 반전
        const { data, error } = await sb
            .from('promo_codes')
            .update({ is_active: !currentCode.is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('코드 토글 실패:', error);
            throw new Error(error.message);
        }

        return data;
    },

    /**
     * 프로모션 코드 삭제
     */
    deletePromoCode: async (id: string): Promise<void> => {
        const sb = ensureSupabase();
        const { error } = await sb
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('프로모션 코드 삭제 실패:', error);
            throw new Error(error.message);
        }
    },

    /**
     * 랜덤 프로모션 코드 생성 (헬퍼 함수)
     */
    generateRandomCode: (prefix: string = 'TAROT', length: number = 8): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = prefix;

        for (let i = 0; i < length - prefix.length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return code;
    },

    /**
     * 프로모션 코드 중복 확인
     */
    checkCodeExists: async (code: string): Promise<boolean> => {
        const sb = ensureSupabase();
        const { data, error } = await sb
            .from('promo_codes')
            .select('id')
            .eq('code', code.toUpperCase())
            .maybeSingle();

        if (error) {
            console.error('코드 중복 확인 실패:', error);
            throw new Error(error.message);
        }

        return data !== null;
    },

    /**
     * 대량 프로모션 코드 생성
     */
    createBulkPromoCodes: async (params: {
        prefix: string;
        count: number;
        freeDays: number;
        description?: string;
        maxUses?: number | null;
        validUntil?: string | null;
    }): Promise<PromoCode[]> => {
        const sb = ensureSupabase();
        const { data: { user } } = await sb.auth.getUser();

        if (!user) {
            throw new Error('인증이 필요합니다.');
        }

        const codes: any[] = [];

        for (let i = 0; i < params.count; i++) {
            let code = AdminPromoService.generateRandomCode(params.prefix);

            // 중복 확인 (최대 10회 시도)
            let retries = 10;
            while (retries > 0 && await AdminPromoService.checkCodeExists(code)) {
                code = AdminPromoService.generateRandomCode(params.prefix);
                retries--;
            }

            if (retries === 0) {
                console.warn('중복되지 않은 코드 생성 실패:', code);
                continue;
            }

            codes.push({
                code: code,
                description: params.description || `대량 생성 코드 #${i + 1}`,
                free_days: params.freeDays,
                benefits: {
                    unlimited_storage: true,
                    ad_free: true,
                    premium_spreads: true
                },
                max_uses: params.maxUses || null,
                valid_from: new Date().toISOString(),
                valid_until: params.validUntil || null,
                created_by: user.id
            });
        }

        const { data, error } = await sb
            .from('promo_codes')
            .insert(codes)
            .select();

        if (error) {
            console.error('대량 코드 생성 실패:', error);
            throw new Error(error.message);
        }

        return data || [];
    }
};

export default AdminPromoService;
