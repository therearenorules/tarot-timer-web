/**
 * Supabase 클라이언트 설정
 * 타로 타이머 웹앱용 Supabase 연결 및 인증 관리
 *
 * ⚠️ 중요: lib/supabase.ts와 동일한 설정을 사용합니다.
 * 이 파일은 호환성을 위해 유지되며, 새 코드는 lib/supabase.ts를 사용하세요.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== Supabase 프로덕션 설정 (항상 사용) =====
const SUPABASE_URL = 'https://syzefbnrnnjkdnoqbwsk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5emVmYm5ybm5qa2Rub3Fid3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzMwMzcsImV4cCI6MjA3MzQwOTAzN30.EnWZW9v05w81eHuPitmWnbbKf9nAbdr-Aj58uk0fESE';

// 호환성을 위한 변수 (기존 코드에서 참조)
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;
const isSupabaseConfigured = true;

// Supabase 클라이언트 직접 생성 (항상 연결)
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

console.log('🔗 [utils/supabase] Supabase 클라이언트 초기화 완료:', {
  url: SUPABASE_URL,
  available: true
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

/**
 * 앱 시작 시 Supabase 연결 상태 및 환경 변수 검증
 * - 하드코딩된 credentials 사용 (항상 설정됨)
 * - 실제 Supabase 서버 연결 테스트
 * - AsyncStorage에 연결 상태 로그 저장
 */
export const validateSupabaseConnection = async () => {
  const timestamp = new Date().toISOString();
  const connectionStatus = {
    timestamp,
    envVarsExist: true, // 하드코딩된 credentials 사용
    envVarsValid: true, // 항상 유효
    supabaseUrl: SUPABASE_URL,
    connectionSuccessful: false,
    error: null as string | null,
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Supabase 연결 상태 검증 시작...');
  console.log(`   • 시간: ${timestamp}`);
  console.log(`   • 설정 상태: ✅ (하드코딩된 credentials 사용)`);
  console.log(`   • Supabase URL: ${connectionStatus.supabaseUrl}`);

  // 실제 연결 테스트
  try {
    console.log('🔌 Supabase 서버 연결 테스트 중...');
    const isConnected = await checkConnection();
    connectionStatus.connectionSuccessful = isConnected;

    if (isConnected) {
      console.log('✅ Supabase 연결 성공!');
    } else {
      connectionStatus.error = 'Connection test failed';
      console.error('❌ Supabase 연결 실패!');
      console.error('   → 네트워크 상태 확인 필요');
      console.error('   → Supabase 프로젝트 상태 확인 필요');
    }
  } catch (error: any) {
    connectionStatus.error = error?.message || 'Unknown connection error';
    console.error('❌ Supabase 연결 테스트 중 오류:', error);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // AsyncStorage에 연결 상태 저장 (디버깅용)
  try {
    const existingLogsJson = await AsyncStorage.getItem('SUPABASE_CONNECTION_LOGS');
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    const updatedLogs = [connectionStatus, ...existingLogs].slice(0, 10); // 최대 10개 보관
    await AsyncStorage.setItem('SUPABASE_CONNECTION_LOGS', JSON.stringify(updatedLogs));
    console.log('💾 Supabase 연결 상태 로그 저장 완료');
  } catch (storageError) {
    console.error('❌ 연결 상태 로그 저장 실패:', storageError);
  }

  return connectionStatus;
};

/**
 * Supabase Edge Function 헬스체크
 * - health-check Edge Function 호출
 * - 연결 상태 및 응답 시간 측정
 * - 앱 시작 시 호출하여 Edge Function 연결 확인
 */
export const checkEdgeFunctionHealth = async () => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();

  const healthStatus = {
    timestamp,
    edgeFunctionAvailable: false,
    responseTimeMs: 0,
    status: 'unknown' as 'ok' | 'error' | 'unknown',
    version: null as string | null,
    region: null as string | null,
    error: null as string | null,
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏥 Edge Function 헬스체크 시작...');

  try {
    console.log('📤 health-check Edge Function 호출 중...');

    const { data, error } = await supabase.functions.invoke('health-check', {
      body: {},
    });

    healthStatus.responseTimeMs = Date.now() - startTime;

    if (error) {
      healthStatus.error = error.message;
      console.error('❌ Edge Function 호출 실패:', error);
      console.log(`   • 응답 시간: ${healthStatus.responseTimeMs}ms`);
    } else if (data) {
      healthStatus.edgeFunctionAvailable = true;
      healthStatus.status = data.status || 'ok';
      healthStatus.version = data.version || null;
      healthStatus.region = data.region || null;

      console.log('✅ Edge Function 헬스체크 성공!');
      console.log(`   • 상태: ${healthStatus.status}`);
      console.log(`   • 응답 시간: ${healthStatus.responseTimeMs}ms`);
      console.log(`   • 버전: ${healthStatus.version}`);
      console.log(`   • 리전: ${healthStatus.region}`);
    }
  } catch (error: any) {
    healthStatus.error = error?.message || 'Unknown error';
    healthStatus.responseTimeMs = Date.now() - startTime;
    console.error('❌ Edge Function 헬스체크 오류:', error);
    console.log(`   • 응답 시간: ${healthStatus.responseTimeMs}ms`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // AsyncStorage에 헬스체크 결과 저장
  try {
    const existingLogsJson = await AsyncStorage.getItem('EDGE_FUNCTION_HEALTH_LOGS');
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    const updatedLogs = [healthStatus, ...existingLogs].slice(0, 10); // 최대 10개 보관
    await AsyncStorage.setItem('EDGE_FUNCTION_HEALTH_LOGS', JSON.stringify(updatedLogs));
    console.log('💾 Edge Function 헬스체크 로그 저장 완료');
  } catch (storageError) {
    console.error('❌ 헬스체크 로그 저장 실패:', storageError);
  }

  return healthStatus;
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