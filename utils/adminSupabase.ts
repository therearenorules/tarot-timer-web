/**
 * 관리자 전용 Supabase 클라이언트
 * 사용자 데이터 분석 및 관리 목적으로만 사용
 */

import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 불러오기
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY; // 서비스 키 사용

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('ℹ️ 관리자 Supabase 설정이 없습니다. 분석 기능이 비활성화됩니다. (개발 환경에서는 정상)');
}

// 관리자용 Supabase 클라이언트 생성 (서비스 키 사용)
export const adminSupabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// 관리자 인증 확인
export const isAdmin = async (): Promise<boolean> => {
  if (!adminSupabase) return false;

  try {
    // 관리자 키 검증 로직 (실제 구현 시 보안 강화 필요)
    const adminKey = process.env.EXPO_PUBLIC_ADMIN_KEY;
    return adminKey === 'YOUR_ADMIN_SECRET_KEY';
  } catch (error) {
    console.error('관리자 인증 오류:', error);
    return false;
  }
};

// 앱 사용 통계 수집 (관리자 전용)
export const collectAppUsageStats = async () => {
  if (!adminSupabase || !(await isAdmin())) {
    console.log('🔒 관리자 권한이 없거나 Supabase가 설정되지 않음');
    return null;
  }

  try {
    // 사용자 통계 수집을 위한 익명화된 데이터 전송
    const stats = {
      timestamp: new Date().toISOString(),
      app_version: '1.0.0',
      platform: 'web',
      user_count_estimate: 1, // 추정치
      session_count_estimate: 1
    };

    const { data, error } = await adminSupabase
      .from('app_usage_stats')
      .insert([stats]);

    if (error) throw error;
    console.log('📊 앱 사용 통계 수집 완료');
    return data;
  } catch (error) {
    console.error('통계 수집 오류:', error);
    return null;
  }
};

// 오류 로그 수집 (관리자 전용)
export const logErrorToAdmin = async (errorData: {
  error_message: string;
  error_stack?: string;
  user_agent?: string;
  timestamp: string;
}) => {
  if (!adminSupabase || !(await isAdmin())) {
    return null;
  }

  try {
    const { data, error } = await adminSupabase
      .from('error_logs')
      .insert([{
        ...errorData,
        app_version: '1.0.0',
        platform: 'web'
      }]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('오류 로그 전송 실패:', error);
    return null;
  }
};

// 피드백 수집 (관리자 전용)
export const collectFeedback = async (feedbackData: {
  feedback_type: 'bug' | 'feature' | 'general';
  message: string;
  rating?: number;
}) => {
  if (!adminSupabase) {
    return { success: false, message: '피드백 시스템을 사용할 수 없습니다.' };
  }

  try {
    const { data, error } = await adminSupabase
      .from('user_feedback')
      .insert([{
        ...feedbackData,
        timestamp: new Date().toISOString(),
        app_version: '1.0.0',
        platform: 'web'
      }]);

    if (error) throw error;

    return {
      success: true,
      message: '피드백이 전송되었습니다. 감사합니다!'
    };
  } catch (error) {
    console.error('피드백 전송 오류:', error);
    return {
      success: false,
      message: '피드백 전송에 실패했습니다.'
    };
  }
};

// 관리자 대시보드용 데이터 조회
export const getAdminDashboardData = async () => {
  if (!adminSupabase || !(await isAdmin())) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  try {
    const [statsData, errorData, feedbackData] = await Promise.all([
      adminSupabase.from('app_usage_stats').select('*').order('timestamp', { ascending: false }).limit(100),
      adminSupabase.from('error_logs').select('*').order('timestamp', { ascending: false }).limit(50),
      adminSupabase.from('user_feedback').select('*').order('timestamp', { ascending: false }).limit(30)
    ]);

    return {
      usage_stats: statsData.data || [],
      error_logs: errorData.data || [],
      user_feedback: feedbackData.data || []
    };
  } catch (error) {
    console.error('관리자 데이터 조회 오류:', error);
    throw error;
  }
};

// 타입 정의
export interface AppUsageStats {
  id?: string;
  timestamp: string;
  app_version: string;
  platform: string;
  user_count_estimate: number;
  session_count_estimate: number;
}

export interface ErrorLog {
  id?: string;
  timestamp: string;
  error_message: string;
  error_stack?: string;
  user_agent?: string;
  app_version: string;
  platform: string;
}

export interface UserFeedback {
  id?: string;
  timestamp: string;
  feedback_type: 'bug' | 'feature' | 'general';
  message: string;
  rating?: number;
  app_version: string;
  platform: string;
}