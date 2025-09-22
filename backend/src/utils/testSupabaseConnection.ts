import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

async function testSupabaseConnection() {
  console.log('🔌 Supabase 연결 테스트 시작...');

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
    console.log('SUPABASE_URL:', supabaseUrl);
    console.log('SUPABASE_SERVICE_KEY:', supabaseKey ? '설정됨' : '설정되지 않음');
    return;
  }

  try {
    console.log('📝 Supabase 클라이언트 생성 중...');
    console.log('URL:', supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 데이터베이스 연결 테스트...');

    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('⚠️ 테이블 없음 또는 권한 문제:', error.message);

      // health check 시도
      console.log('🏥 Supabase health check...');
      const healthResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (healthResponse.ok) {
        console.log('✅ Supabase 서버 연결 성공!');
        console.log('📊 응답 상태:', healthResponse.status);

        // 데이터베이스 스키마 확인
        console.log('🗂️ 데이터베이스 스키마 확인...');
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');

        if (tablesError) {
          console.log('⚠️ 스키마 조회 권한 없음:', tablesError.message);
        } else {
          console.log('📋 발견된 테이블들:', tables?.map(t => t.table_name) || []);
        }

      } else {
        console.error('❌ Supabase 서버 연결 실패');
        console.error('상태 코드:', healthResponse.status);
        console.error('응답:', await healthResponse.text());
      }
    } else {
      console.log('✅ Supabase 데이터베이스 연결 및 쿼리 성공!');
      console.log('📊 데이터:', data);
    }

    // 환경 정보 출력
    console.log('\n📋 연결 정보:');
    console.log('- Supabase URL:', supabaseUrl);
    console.log('- 서비스 키 길이:', supabaseKey.length, '문자');
    console.log('- 연결 시간:', new Date().toLocaleString('ko-KR'));

  } catch (error) {
    console.error('❌ Supabase 연결 테스트 실패:', error);
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  testSupabaseConnection();
}

export default testSupabaseConnection;