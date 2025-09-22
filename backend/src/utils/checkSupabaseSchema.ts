import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

async function checkSupabaseSchema() {
  console.log('🗂️ Supabase 데이터베이스 스키마 확인 시작...');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📋 기존 테이블 구조 확인...');

    // 테이블 목록 확인 시도
    const tables = [
      'users',
      'daily_tarot_sessions',
      'spread_readings',
      'card_themes',
      'user_theme_ownership',
      'subscriptions',
      'user_analytics',
      'ad_impressions',
      'system_config'
    ];

    for (const tableName of tables) {
      try {
        console.log(`\n🔍 ${tableName} 테이블 확인...`);

        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: ${count}개 레코드 존재`);

          // 샘플 데이터 조회 (최대 2개)
          const { data: sampleData } = await supabase
            .from(tableName)
            .select('*')
            .limit(2);

          if (sampleData && sampleData.length > 0) {
            console.log('📝 샘플 데이터 구조:', Object.keys(sampleData[0]));
          }
        }
      } catch (tableError) {
        console.log(`⚠️ ${tableName} 테이블 접근 오류:`, tableError);
      }
    }

    // 기존 users 테이블 데이터 확인
    console.log('\n👥 Users 테이블 상세 확인...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (usersError) {
      console.log('❌ Users 조회 오류:', usersError.message);
    } else {
      console.log('✅ Users 데이터:', users?.length, '개');
      if (users && users.length > 0) {
        console.log('📊 첫 번째 사용자 구조:', Object.keys(users[0]));
        console.log('🔍 첫 번째 사용자 데이터:', {
          id: users[0].id,
          email: users[0].email,
          created_at: users[0].created_at,
          // 민감한 정보는 제외
        });
      }
    }

  } catch (error) {
    console.error('❌ 스키마 확인 실패:', error);
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  checkSupabaseSchema();
}

export default checkSupabaseSchema;