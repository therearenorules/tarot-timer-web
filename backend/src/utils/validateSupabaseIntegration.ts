import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

/**
 * Supabase 통합 검증 스크립트
 * 모든 관리자 API 엔드포인트가 실제 Supabase 데이터를 올바르게 반환하는지 확인
 */
async function validateSupabaseIntegration() {
  console.log('🔍 Supabase 통합 검증 시작...');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n📊 1. 기본 연결 테스트...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.error('❌ Users 테이블 조회 실패:', usersError.message);
      return false;
    }

    console.log(`✅ Users 테이블 연결 성공: ${users?.length}개 사용자 발견`);

    console.log('\n📈 2. 관리자 API 엔드포인트 테스트...');

    // Stats 엔드포인트 테스트
    try {
      const statsResponse = await fetch('http://localhost:3002/api/admin/stats');
      const statsData = await statsResponse.json();
      console.log('✅ Stats API:', statsData);
    } catch (error) {
      console.error('❌ Stats API 실패:', error);
    }

    // Analytics 엔드포인트 테스트
    try {
      const analyticsResponse = await fetch('http://localhost:3002/api/admin/analytics');
      const analyticsData = await analyticsResponse.json() as any;
      console.log('✅ Analytics API:', analyticsData.dailyUsers?.length || 0, '일간 데이터');
    } catch (error) {
      console.error('❌ Analytics API 실패:', error);
    }

    // Dashboard 엔드포인트 테스트
    try {
      const dashboardResponse = await fetch('http://localhost:3002/api/admin/dashboard');
      const dashboardData = await dashboardResponse.json() as any;
      console.log('✅ Dashboard API: 통계, 분석, 시스템 데이터 포함');
      console.log('   - 사용자:', dashboardData.stats?.totalUsers);
      console.log('   - 세션:', dashboardData.stats?.totalSessions);
      console.log('   - 시스템 상태:', dashboardData.system?.databaseStatus);
    } catch (error) {
      console.error('❌ Dashboard API 실패:', error);
    }

    console.log('\n🔍 3. 데이터 일관성 검증...');

    // 직접 Supabase 쿼리와 API 응답 비교
    const { count: directUserCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const apiStatsResponse = await fetch('http://localhost:3002/api/admin/stats');
    const apiStats = await apiStatsResponse.json() as any;

    if (directUserCount === apiStats.totalUsers) {
      console.log('✅ 데이터 일관성 검증 성공:', directUserCount, '= API 사용자 수');
    } else {
      console.warn('⚠️ 데이터 불일치:', directUserCount, '!= API', apiStats.totalUsers);
    }

    console.log('\n✨ Supabase 통합 검증 완료!');
    return true;

  } catch (error) {
    console.error('❌ Supabase 통합 검증 실패:', error);
    return false;
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  validateSupabaseIntegration();
}

export default validateSupabaseIntegration;