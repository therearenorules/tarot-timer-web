/**
 * Supabase 클라이언트 설정
 * 타로 타이머 웹앱용 Supabase 연결 및 인증 관리
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 환경 변수에서 Supabase 설정 불러오기
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL과 Anonymous Key가 설정되지 않았습니다.\n' +
    '.env 파일에 EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.'
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 인증 상태 확인 헬퍼 함수
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
};

// 로그인 함수
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// 회원가입 함수
export const signUpWithEmail = async (email: string, password: string, userData?: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
};

// 로그아웃 함수
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 비밀번호 재설정 함수
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://your-app-domain.com/reset-password',
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    throw error;
  }
};

// 프로필 업데이트 함수
export const updateProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    throw error;
  }
};

// 타로 세션 관련 함수들
export const saveTarotSession = async (sessionData: any) => {
  try {
    const { data, error } = await supabase
      .from('tarot_sessions')
      .insert([sessionData])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('타로 세션 저장 오류:', error);
    throw error;
  }
};

export const getTarotSessions = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('tarot_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('타로 세션 조회 오류:', error);
    throw error;
  }
};

export const updateTarotSession = async (sessionId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('tarot_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('타로 세션 업데이트 오류:', error);
    throw error;
  }
};

// 저널 관련 함수들
export const saveJournalEntry = async (entryData: any) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entryData])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('저널 저장 오류:', error);
    throw error;
  }
};

export const getJournalEntries = async (userId: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('저널 조회 오류:', error);
    throw error;
  }
};

// 실시간 구독 헬퍼
export const subscribeToTarotSessions = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('tarot_sessions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tarot_sessions',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// 연결 상태 확인
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase 연결 확인 오류:', error);
    return false;
  }
};

// 타입 정의
export interface TarotSession {
  id?: string;
  user_id: string;
  session_type: 'daily' | 'spread' | 'custom';
  cards_drawn: any[];
  spread_type?: string;
  notes?: string;
  duration?: number;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  related_session_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: any;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}