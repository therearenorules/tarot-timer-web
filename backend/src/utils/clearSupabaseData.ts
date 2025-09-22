import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Supabase 데이터베이스 초기화 스크립트
 * 마이그레이션 전에 기존 데이터를 모두 삭제합니다.
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearSupabaseData() {
  console.log('🧹 Supabase 데이터베이스 초기화 시작...');

  try {
    // 순서가 중요: 의존성이 있는 테이블부터 삭제
    const tables = [
      'user_theme_ownership',
      'subscriptions',
      'spread_readings',
      'daily_tarot_sessions',
      'user_analytics',
      'card_themes',
      'users'
    ];

    for (const table of tables) {
      console.log(`🗑️ ${table} 테이블 데이터 삭제 중...`);

      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제

      if (error) {
        console.warn(`⚠️ ${table} 삭제 중 오류:`, error.message);
      } else {
        console.log(`✅ ${table} 테이블 정리 완료`);
      }
    }

    console.log('✨ Supabase 데이터베이스 초기화 완료!');

    // 검증
    console.log('\n🔍 삭제 검증 중...');
    for (const table of tables.reverse()) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`📊 ${table}: ${count}개 데이터`);
      }
    }

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  clearSupabaseData();
}

export default clearSupabaseData;