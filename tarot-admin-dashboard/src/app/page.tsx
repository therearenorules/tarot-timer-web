'use client'

import { useState, useEffect } from 'react'
import { AdminStats } from '@/components/AdminStats'
import { UserAnalytics } from '@/components/UserAnalytics'
import { SystemHealth } from '@/components/SystemHealth'

interface DashboardData {
  stats: {
    totalUsers: number
    activeUsers: number
    totalSessions: number
    avgSessionDuration: number
  }
  analytics: {
    dailyUsers: Array<{
      date: string
      users: number
    }>
  }
  system: {
    serverStatus: string
    databaseStatus: string
    apiResponseTime: number
    errorRate: number
  }
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 실제 백엔드 API 호출
        const backendUrl = 'http://localhost:3003'

        // 병렬로 모든 API 호출 실행
        const [healthResponse, dashboardResponse] = await Promise.all([
          fetch(`${backendUrl}/health`).then(res => res.json()),
          fetch(`${backendUrl}/api/admin/dashboard`).then(res => res.json())
        ])

        // 응답 시간 계산 (health 체크 기준)
        const startTime = Date.now()
        await fetch(`${backendUrl}/health`)
        const responseTime = Date.now() - startTime

        const dashboardData = {
          stats: dashboardResponse.stats,
          analytics: dashboardResponse.analytics,
          system: {
            serverStatus: healthResponse.status === 'healthy' ? 'healthy' :
                        healthResponse.status === 'degraded' ? 'degraded' : 'unhealthy',
            databaseStatus: healthResponse.database?.status || 'unknown',
            apiResponseTime: responseTime,
            errorRate: dashboardResponse.system.errorRate
          }
        }

        console.log('🔥 실제 백엔드 연결 성공!', {
          backendUrl,
          healthStatus: healthResponse.status,
          databaseStatus: healthResponse.database?.status,
          responseTime: `${responseTime}ms`,
          actualData: dashboardResponse
        })

        setDashboardData(dashboardData)
        setIsLoading(false)
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error)
        console.error('오류 세부사항:', {
          error: error.message,
          stack: error.stack,
          name: error.name
        })

        // 백엔드 연결 실패 시 fallback으로 mock 데이터 사용
        const fallbackData = {
          stats: {
            totalUsers: 150,
            activeUsers: 87,
            totalSessions: 1250,
            avgSessionDuration: 12.5
          },
          analytics: {
            dailyUsers: [
              { date: '2025-09-15', users: 45 },
              { date: '2025-09-16', users: 52 },
              { date: '2025-09-17', users: 38 },
              { date: '2025-09-18', users: 61 },
              { date: '2025-09-19', users: 49 },
              { date: '2025-09-20', users: 55 },
              { date: '2025-09-21', users: 67 },
            ]
          },
          system: {
            serverStatus: 'disconnected',
            databaseStatus: 'disconnected',
            apiResponseTime: 0,
            errorRate: 100.0
          }
        }

        console.warn('❌ 백엔드 연결 실패, fallback 데이터 사용')
        setDashboardData(fallbackData)
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-300">관리자 대시보드 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface shadow-lg border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-white">
                🔮 타로 타이머 관리자 대시보드
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                온라인
              </span>
              <span className="text-gray-300 text-sm">
                마지막 업데이트: {new Date().toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 주요 통계 */}
          <AdminStats stats={dashboardData?.stats} />

          {/* 사용자 분석 */}
          <UserAnalytics analytics={dashboardData?.analytics} />

          {/* 시스템 상태 */}
          <SystemHealth system={dashboardData?.system} />
        </div>
      </main>
    </div>
  )
}