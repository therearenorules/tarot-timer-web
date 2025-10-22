import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// 환경변수에서 Supabase 설정 가져오기
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다. 백엔드 API를 통한 연동을 사용합니다.');
}

// Supabase 클라이언트 생성
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        // ✅ CRITICAL FIX: 프로덕션 빌드에서 세션 유지 활성화
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  : null;

// Supabase 연결 상태 확인 함수
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// 타입 정의
export interface User {
  id: string;
  email?: string;
  created_at: string;
  last_active?: string;
  total_sessions?: number;
  premium_until?: string;
  subscription_status?: string;
  trial_end_date?: string;
}

export interface DailyTarotSession {
  id: string;
  user_id: string;
  session_date: string;
  completed_hours: number[];
  created_at: string;
  updated_at: string;
}

export interface SpreadReading {
  id: string;
  user_id: string;
  spread_type: string;
  cards: any[];
  question?: string;
  interpretation?: string;
  created_at: string;
}

// Supabase 헬퍼 함수들
export const supabaseHelpers = {
  // 사용자 데이터 가져오기
  async getUser(userId: string): Promise<User | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase getUser error:', error);
      return null;
    }

    return data;
  },

  // 일일 세션 데이터 가져오기
  async getDailySession(userId: string, date: string): Promise<DailyTarotSession | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('daily_tarot_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase getDailySession error:', error);
      return null;
    }

    return data;
  },

  // 스프레드 리딩 저장
  async saveSpreadReading(reading: Omit<SpreadReading, 'id' | 'created_at'>): Promise<SpreadReading | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('spread_readings')
      .insert([reading])
      .select()
      .single();

    if (error) {
      console.error('Supabase saveSpreadReading error:', error);
      return null;
    }

    return data;
  },

  // 일일 세션 업데이트
  async updateDailySession(
    userId: string,
    date: string,
    completedHours: number[]
  ): Promise<DailyTarotSession | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('daily_tarot_sessions')
      .upsert({
        user_id: userId,
        session_date: date,
        completed_hours: completedHours,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase updateDailySession error:', error);
      return null;
    }

    return data;
  },

  // 실시간 구독 설정 (향후 사용)
  subscribeToUserChanges(userId: string, callback: (payload: any) => void) {
    if (!supabase) return null;

    return supabase
      .channel(`user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};

// 디버그 정보 출력
if (__DEV__) {
  console.log('🔗 Supabase Client Status:', {
    available: isSupabaseAvailable(),
    url: supabaseUrl ? '설정됨' : '미설정',
    key: supabaseKey ? '설정됨' : '미설정'
  });
}