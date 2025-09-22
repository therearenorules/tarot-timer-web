'use client'

import { useState } from 'react'

export default function ApiTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testBackendConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🧪 API 테스트 시작...')

      // Health Check
      const healthResponse = await fetch('http://localhost:3003/health')
      const healthData = await healthResponse.json()
      console.log('✅ Health Check:', healthData)

      // Dashboard API
      const dashboardResponse = await fetch('http://localhost:3003/api/admin/dashboard')
      const dashboardData = await dashboardResponse.json()
      console.log('✅ Dashboard API:', dashboardData)

      setResult({
        health: healthData,
        dashboard: dashboardData,
        timestamp: new Date().toISOString()
      })

    } catch (err: any) {
      console.error('❌ API 테스트 실패:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 API 연결 테스트</h1>

        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium mb-6"
        >
          {loading ? '테스트 중...' : '백엔드 API 테스트'}
        </button>

        {error && (
          <div className="bg-red-900 border border-red-500 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 font-bold mb-2">❌ 오류 발생</h3>
            <pre className="text-red-200 text-sm">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-green-300 font-bold mb-4">✅ API 응답 결과</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-blue-300 font-semibold mb-2">Health Check:</h4>
                <pre className="bg-gray-700 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.health, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="text-green-300 font-semibold mb-2">Dashboard Data:</h4>
                <pre className="bg-gray-700 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.dashboard, null, 2)}
                </pre>
              </div>

              <div className="text-gray-400 text-sm">
                테스트 시간: {result.timestamp}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-gray-400">
          <h3 className="font-semibold mb-2">📋 체크리스트:</h3>
          <ul className="space-y-1 text-sm">
            <li>• 백엔드 서버 실행 중: http://localhost:3002</li>
            <li>• CORS 설정에 포트 3001 포함됨</li>
            <li>• Supabase 마이그레이션 완료: 5명 사용자, 15개 세션, 3개 리딩</li>
          </ul>
        </div>
      </div>
    </div>
  )
}