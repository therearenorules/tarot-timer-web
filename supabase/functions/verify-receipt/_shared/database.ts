/**
 * Supabase 데이터베이스 헬퍼
 * user_subscriptions 테이블 CRUD 작업
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import {
  SubscriptionRecord,
  SubscriptionHistoryRecord,
  DatabaseError,
} from './types.ts';

export class DatabaseHelper {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    if (!supabaseUrl || !serviceRoleKey) {
      throw new DatabaseError('Supabase URL and Service Role Key are required');
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[DB] Supabase 클라이언트 초기화 완료');
  }

  /**
   * 구독 정보 저장/업데이트 (Upsert)
   */
  async upsertSubscription(record: SubscriptionRecord): Promise<{ subscription_id: string }> {
    console.log('[DB] 구독 Upsert 시작:', {
      user_id: record.user_id.substring(0, 8) + '...',
      product_id: record.product_id,
      original_transaction_id: record.original_transaction_id.substring(0, 10) + '...',
    });

    try {
      // 1. 기존 구독 확인 (original_transaction_id 기준 - 고유 식별자)
      const { data: existing, error: selectError } = await this.supabase
        .from('user_subscriptions')
        .select('id, is_active, expiry_date')
        .eq('original_transaction_id', record.original_transaction_id)
        .maybeSingle();

      if (selectError) {
        console.error('[DB] 구독 조회 오류:', selectError);
        throw new DatabaseError(`구독 조회 실패: ${selectError.message}`, selectError);
      }

      if (existing) {
        // 2-A. 기존 구독 업데이트
        console.log('[DB] 기존 구독 업데이트:', existing.id);

        const { error: updateError } = await this.supabase
          .from('user_subscriptions')
          .update({
            is_active: record.is_active,
            expiry_date: record.expiry_date,
            transaction_id: record.transaction_id, // 최신 트랜잭션 ID 업데이트
            receipt_data: record.receipt_data,
            last_validated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('[DB] 구독 업데이트 오류:', updateError);
          throw new DatabaseError(`구독 업데이트 실패: ${updateError.message}`, updateError);
        }

        // 히스토리 기록 (갱신)
        await this.recordHistory({
          subscription_id: existing.id,
          user_id: record.user_id,
          event_type: 'renewed',
          event_data: {
            timestamp: new Date().toISOString(),
            previous_expiry: existing.expiry_date,
            new_expiry: record.expiry_date,
            was_active: existing.is_active,
            is_active: record.is_active,
          },
        });

        console.log('[DB] 구독 업데이트 완료:', existing.id);
        return { subscription_id: existing.id };
      } else {
        // 2-B. 신규 구독 생성
        console.log('[DB] 신규 구독 생성');

        const { data, error: insertError } = await this.supabase
          .from('user_subscriptions')
          .insert([record])
          .select('id')
          .single();

        if (insertError) {
          console.error('[DB] 구독 생성 오류:', insertError);
          throw new DatabaseError(`구독 생성 실패: ${insertError.message}`, insertError);
        }

        if (!data) {
          throw new DatabaseError('구독 생성 성공했으나 ID를 받지 못함');
        }

        // 히스토리 기록 (생성)
        await this.recordHistory({
          subscription_id: data.id,
          user_id: record.user_id,
          event_type: 'created',
          event_data: {
            timestamp: new Date().toISOString(),
            product_id: record.product_id,
            expiry_date: record.expiry_date,
            environment: record.environment,
          },
        });

        console.log('[DB] 신규 구독 생성 완료:', data.id);
        return { subscription_id: data.id };
      }
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      console.error('[DB] 예상치 못한 오류:', error);
      throw new DatabaseError(`데이터베이스 작업 실패: ${error.message}`, error);
    }
  }

  /**
   * 구독 히스토리 기록
   */
  private async recordHistory(record: SubscriptionHistoryRecord): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('subscription_history')
        .insert([record]);

      if (error) {
        // 히스토리 실패는 치명적이지 않음 (로그만)
        console.warn('[DB] 히스토리 기록 실패 (non-critical):', error);
      } else {
        console.log('[DB] 히스토리 기록 완료:', record.event_type);
      }
    } catch (error: any) {
      console.warn('[DB] 히스토리 기록 예외 (non-critical):', error.message);
    }
  }

  /**
   * 사용자의 활성 구독 조회
   */
  async getActiveSubscription(userId: string) {
    console.log('[DB] 활성 구독 조회:', userId.substring(0, 8) + '...');

    try {
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expiry_date', new Date().toISOString())
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[DB] 활성 구독 조회 오류:', error);
        throw new DatabaseError(`활성 구독 조회 실패: ${error.message}`, error);
      }

      if (data) {
        console.log('[DB] 활성 구독 발견:', {
          id: data.id,
          product_id: data.product_id,
          expiry_date: data.expiry_date,
        });
      } else {
        console.log('[DB] 활성 구독 없음');
      }

      return data;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`활성 구독 조회 실패: ${error.message}`, error);
    }
  }

  /**
   * 구독 만료 처리 (수동 호출용)
   */
  async expireSubscription(originalTransactionId: string): Promise<boolean> {
    console.log('[DB] 구독 만료 처리:', originalTransactionId.substring(0, 10) + '...');

    try {
      const { data, error: updateError } = await this.supabase
        .from('user_subscriptions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('original_transaction_id', originalTransactionId)
        .eq('is_active', true)
        .select('id, user_id')
        .maybeSingle();

      if (updateError) {
        console.error('[DB] 구독 만료 처리 오류:', updateError);
        throw new DatabaseError(`구독 만료 처리 실패: ${updateError.message}`, updateError);
      }

      if (data) {
        // 히스토리 기록
        await this.recordHistory({
          subscription_id: data.id,
          user_id: data.user_id,
          event_type: 'expired',
          event_data: {
            timestamp: new Date().toISOString(),
          },
        });

        console.log('[DB] 구독 만료 완료:', data.id);
        return true;
      }

      console.log('[DB] 만료할 구독 없음 (이미 만료됨 또는 존재하지 않음)');
      return false;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`구독 만료 처리 실패: ${error.message}`, error);
    }
  }

  /**
   * 사용자 프리미엄 상태 빠른 확인
   */
  async checkPremiumStatus(userId: string): Promise<boolean> {
    console.log('[DB] 프리미엄 상태 확인:', userId.substring(0, 8) + '...');

    try {
      const { data, error } = await this.supabase
        .rpc('check_premium_status', { p_user_id: userId });

      if (error) {
        console.error('[DB] 프리미엄 상태 확인 오류:', error);
        throw new DatabaseError(`프리미엄 상태 확인 실패: ${error.message}`, error);
      }

      console.log('[DB] 프리미엄 상태:', data ? '활성' : '비활성');
      return data === true;
    } catch (error: any) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`프리미엄 상태 확인 실패: ${error.message}`, error);
    }
  }
}
