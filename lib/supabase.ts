import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== Supabase 프로덕션 설정 (항상 사용) =====
const SUPABASE_URL = 'https://syzefbnrnnjkdnoqbwsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5emVmYm5ybm5qa2Rub3Fid3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzMwMzcsImV4cCI6MjA3MzQwOTAzN30.EnWZW9v05w81eHuPitmWnbbKf9nAbdr-Aj58uk0fESE';

// Supabase 클라이언트 직접 생성 (항상 연결)
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
});

// Supabase 연결 상태 확인 함수 (항상 true)
export const isSupabaseAvailable = (): boolean => {
  return true;
};

// 디버그 로그
console.log('🔗 Supabase 클라이언트 초기화 완료:', {
  url: SUPABASE_URL,
  available: true
});

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
    const { data, error} = await supabase
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

// 🔐 인증 함수들
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 이메일/비밀번호 로그인
 */
export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase가 설정되지 않았습니다. 오프라인 모드에서는 로그인할 수 없습니다.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * 이메일/비밀번호 회원가입
 */
export async function signUpWithEmail(email: string, password: string, userData?: any) {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase가 설정되지 않았습니다. 오프라인 모드에서는 회원가입할 수 없습니다.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * 로그아웃
 */
export async function signOut() {
  if (!isSupabaseAvailable() || !supabase) {
    console.warn('Supabase가 설정되지 않았습니다. 로컬 세션만 삭제합니다.');
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 비밀번호 재설정 이메일 전송
 */
export async function resetPassword(email: string) {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase가 설정되지 않았습니다. 오프라인 모드에서는 비밀번호를 재설정할 수 없습니다.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  if (!isSupabaseAvailable() || !supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

