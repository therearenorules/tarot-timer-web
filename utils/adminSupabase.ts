/**
 * 관리자 전용 Supabase 클라이언트
 * 익명 분석 데이터 수집 및 관리자 대시보드 목적으로만 사용
 * 사용자 개인 데이터는 로컬에만 저장됨
 */

import { createClient } from '@supabase/supabase-js';
import AnalyticsManager, { AnalyticsEvent } from './analyticsManager';

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

// 로컬 분석 데이터를 Supabase로 동기화 (배치 처리)
export const syncAnalyticsToSupabase = async (): Promise<{ success: boolean; message: string }> => {
  if (!adminSupabase) {
    return { success: false, message: 'Supabase 설정이 없습니다.' };
  }

  try {
    // 로컬 분석 데이터 가져오기
    const localEvents = await AnalyticsManager.getStoredEvents();
    const usageStats = await AnalyticsManager.generateUsageStats();

    if (localEvents.length === 0) {
      return { success: true, message: '동기화할 데이터가 없습니다.' };
    }

    // 익명화된 이벤트 데이터 준비
    const anonymizedEvents = localEvents.map(event => ({
      session_hash: hashString(event.session_id),
      event_type: event.event_type,
      event_data: event.event_data,
      device_info: event.device_info,
      timestamp: event.timestamp,
      app_version: event.device_info.app_version,
      platform: event.device_info.platform
    }));

    // 앱 사용 통계 데이터 준비
    const appStats = {
      timestamp: new Date().toISOString(),
      app_version: '1.1.0',
      platform: 'web',
      user_count_estimate: 1,
      session_count_estimate: usageStats.total_sessions,
      locale: 'ko-KR',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen_size: getScreenSize()
    };

    // 배치 삽입
    const [eventsResult, statsResult] = await Promise.all([
      adminSupabase.from('anonymous_events').insert(anonymizedEvents),
      adminSupabase.from('app_usage_stats').insert([appStats])
    ]);

    if (eventsResult.error) throw eventsResult.error;
    if (statsResult.error) throw statsResult.error;

    console.log('📊 분석 데이터 Supabase 동기화 완료:', anonymizedEvents.length, '개 이벤트');
    return { success: true, message: `${anonymizedEvents.length}개 이벤트가 동기화되었습니다.` };
  } catch (error) {
    console.error('분석 데이터 동기화 오류:', error);
    return { success: false, message: '동기화에 실패했습니다.' };
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

// 관리자 대시보드용 데이터 조회 (Supabase에서)
export const getSupabaseAdminData = async () => {
  if (!adminSupabase || !(await isAdmin())) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  try {
    const [statsData, eventsData, errorData, feedbackData, dailyStats] = await Promise.all([
      adminSupabase.from('app_usage_stats').select('*').order('timestamp', { ascending: false }).limit(100),
      adminSupabase.from('anonymous_events').select('*').order('timestamp', { ascending: false }).limit(200),
      adminSupabase.from('error_logs').select('*').order('timestamp', { ascending: false }).limit(50),
      adminSupabase.from('user_feedback').select('*').order('timestamp', { ascending: false }).limit(30),
      adminSupabase.from('daily_stats_summary').select('*').limit(30)
    ]);

    return {
      usage_stats: statsData.data || [],
      anonymous_events: eventsData.data || [],
      error_logs: errorData.data || [],
      user_feedback: feedbackData.data || [],
      daily_summary: dailyStats.data || []
    };
  } catch (error) {
    console.error('Supabase 관리자 데이터 조회 오류:', error);
    throw error;
  }
};

// 통합 관리자 대시보드 데이터 (로컬 + Supabase)
export const getAdminDashboardData = async () => {
  try {
    // 로컬 분석 데이터 가져오기 (항상 사용 가능)
    const localData = await AnalyticsManager.prepareDataForAdmin();
    const localStats = await AnalyticsManager.generateUsageStats();

    let supabaseData = null;

    // Supabase 데이터는 선택적으로 가져오기
    if (adminSupabase && await isAdmin()) {
      try {
        supabaseData = await getSupabaseAdminData();
      } catch (error) {
        console.warn('Supabase 데이터 조회 실패, 로컬 데이터만 사용:', error);
      }
    }

    return {
      local_analytics: {
        stats: localStats,
        events: localData?.anonymized_events || [],
        collected_at: localData?.collected_at
      },
      supabase_data: supabaseData,
      has_supabase: !!supabaseData
    };
  } catch (error) {
    console.error('통합 관리자 데이터 조회 오류:', error);
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

// 커뮤니티 기능 인터페이스 (미래 구현)
export interface CommunityPost {
  id?: string;
  title: string;
  content: string;
  author_nickname?: string;
  category_id: string;
  tags: string[];
  status: 'draft' | 'published' | 'hidden' | 'deleted';
  created_at?: string;
  updated_at?: string;
}

export interface BoardCategory {
  id?: string;
  name: string;
  description?: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

// ===== 헬퍼 함수들 =====

// 문자열 해시 함수 (개인정보 보호용)
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return hash.toString(36);
};

// 화면 크기 감지
const getScreenSize = (): string => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return 'small';
    if (width < 1024) return 'medium';
    return 'large';
  }
  return 'unknown';
};

// ===== 커뮤니티 기능 (미래 구현) =====

// 게시판 카테고리 조회
export const getBoardCategories = async (): Promise<BoardCategory[]> => {
  if (!adminSupabase) return [];

  try {
    const { data, error } = await adminSupabase
      .from('board_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('게시판 카테고리 조회 오류:', error);
    return [];
  }
};

// 커뮤니티 게시글 생성
export const createCommunityPost = async (postData: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message: string }> => {
  if (!adminSupabase) {
    return { success: false, message: '커뮤니티 기능을 사용할 수 없습니다.' };
  }

  try {
    const { data, error } = await adminSupabase
      .from('community_posts')
      .insert([{
        ...postData,
        author_hash: postData.author_nickname ? hashString(postData.author_nickname + Date.now()) : null,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    return {
      success: true,
      message: '게시글이 성공적으로 작성되었습니다.'
    };
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    return {
      success: false,
      message: '게시글 작성에 실패했습니다.'
    };
  }
};

// 승인된 커뮤니티 게시글 조회
export const getApprovedPosts = async (categoryId?: string, limit: number = 20): Promise<CommunityPost[]> => {
  if (!adminSupabase) return [];

  try {
    let query = adminSupabase
      .from('community_posts')
      .select('*')
      .eq('status', 'published')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    return [];
  }
};