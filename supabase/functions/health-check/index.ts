/**
 * Supabase Edge Function: Health Check
 *
 * 간단한 헬스체크 엔드포인트
 * - Supabase Edge Function 연결 테스트용
 * - 앱 시작 시 호출되어 연결 상태 확인
 * - 복잡한 로직 없이 빠른 응답 제공
 *
 * Usage:
 * POST https://[PROJECT_URL]/functions/v1/health-check
 *
 * Response:
 * {
 *   "status": "ok",
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "version": "1.0.0",
 *   "region": "us-east-1",
 *   "execution_time_ms": 5
 * }
 */

// Deno의 serve 함수 import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 메인 핸들러
serve(async (req) => {
  const startTime = Date.now();

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('🏥 Health check request received');

    // 간단한 헬스체크 응답
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      region: Deno.env.get('DENO_REGION') || 'unknown',
      execution_time_ms: Date.now() - startTime,
      message: 'Supabase Edge Function is healthy',
    };

    console.log('✅ Health check successful:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Health check error:', error);

    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error',
      execution_time_ms: Date.now() - startTime,
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
