/**
 * Supabase 클라이언트 설정
 * 타로 타이머 웹앱용 Supabase 연결 및 인증 관리
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 환경 변수에서 Supabase 설정 불러오기
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 설정이 없거나 플레이스홀더인 경우 오프라인 모드로 작동
const isSupabaseConfigured = supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.startsWith('https://');

if (!isSupabaseConfigured) {
  console.warn('Supabase 설정이 없거나 올바르지 않습니다. 오프라인 모드로 작동합니다.');
}

// Supabase 클라이언트 생성 (설정이 있는 경우에만)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!, {
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
}) : null;

// 인증 상태 확인 헬퍼 함수
export const getCurrentUser = async () => {
  if (!supabase) {
    console.warn('Supabase가 설정되지 않았습니다. 오프라인 모드입니다.');
    return null;
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.');
  }
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
  if (!supabase) {
    console.warn('Supabase가 설정되지 않았습니다. 실시간 구독을 사용할 수 없습니다.');
    return null;
  }
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
  if (!supabase) {
    console.warn('Supabase가 설정되지 않았습니다. 오프라인 모드입니다.');
    return false;
  }
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
 * - 환경 변수 존재 여부 확인
 * - 실제 Supabase 서버 연결 테스트
 * - AsyncStorage에 연결 상태 로그 저장
 */
export const validateSupabaseConnection = async () => {
  const timestamp = new Date().toISOString();
  const connectionStatus = {
    timestamp,
    envVarsExist: !!supabaseUrl && !!supabaseAnonKey,
    envVarsValid: isSupabaseConfigured,
    supabaseUrl: supabaseUrl || 'NOT_SET',
    connectionSuccessful: false,
    error: null as string | null,
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Supabase 연결 상태 검증 시작...');
  console.log(`   • 시간: ${timestamp}`);
  console.log(`   • 환경 변수 존재: ${connectionStatus.envVarsExist ? '✅' : '❌'}`);
  console.log(`   • 환경 변수 유효성: ${connectionStatus.envVarsValid ? '✅' : '❌'}`);
  console.log(`   • Supabase URL: ${connectionStatus.supabaseUrl}`);

  // 환경 변수가 설정되지 않은 경우
  if (!connectionStatus.envVarsExist) {
    connectionStatus.error = 'Environment variables not set';
    console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
    console.warn('   → EXPO_PUBLIC_SUPABASE_URL 확인 필요');
    console.warn('   → EXPO_PUBLIC_SUPABASE_ANON_KEY 확인 필요');
  }
  // 환경 변수가 유효하지 않은 경우 (플레이스홀더 등)
  else if (!connectionStatus.envVarsValid) {
    connectionStatus.error = 'Environment variables invalid (placeholder values)';
    console.warn('⚠️ Supabase 환경 변수가 유효하지 않습니다.');
    console.warn('   → 플레이스홀더 값이 설정되어 있거나 형식이 잘못되었습니다.');
  }
  // 실제 연결 테스트
  else {
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

  if (!supabase) {
    healthStatus.error = 'Supabase client not initialized';
    console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return healthStatus;
  }

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