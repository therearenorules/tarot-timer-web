'use client'

interface UserAnalyticsProps {
  analytics: {
    dailyUsers: Array<{
      date: string
      users: number
    }>
  } | null
}

export function UserAnalytics({ analytics }: UserAnalyticsProps) {
  if (!analytics) {
    return (
      <div className="bg-surface rounded-lg p-6 border border-primary/20">
        <h2 className="text-xl font-bold text-white mb-4">사용자 분석</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-lg p-6 border border-primary/20">
      <h2 className="text-xl font-bold text-white mb-6">📊 사용자 분석</h2>

      <div className="space-y-6">
        {/* 일별 사용자 현황 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">일별 활성 사용자</h3>
          <div className="grid grid-cols-7 gap-2">
            {analytics.dailyUsers.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-gray-400 mb-1">
                  {new Date(day.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div
                  className="bg-primary/20 rounded-lg p-3 border border-primary/30"
                  style={{
                    height: `${Math.max(40, (day.users / Math.max(...analytics.dailyUsers.map(d => d.users))) * 80)}px`
                  }}
                >
                  <div className="text-white font-bold text-sm">{day.users}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4 border border-primary/10">
            <h4 className="text-sm font-medium text-gray-300 mb-2">평균 일별 사용자</h4>
            <p className="text-xl font-bold text-white">
              {Math.round(analytics.dailyUsers.reduce((sum, day) => sum + day.users, 0) / analytics.dailyUsers.length)}명
            </p>
          </div>

          <div className="bg-background rounded-lg p-4 border border-green-500/10">
            <h4 className="text-sm font-medium text-gray-300 mb-2">최고 일별 사용자</h4>
            <p className="text-xl font-bold text-green-400">
              {Math.max(...analytics.dailyUsers.map(d => d.users))}명
            </p>
          </div>

          <div className="bg-background rounded-lg p-4 border border-yellow-500/10">
            <h4 className="text-sm font-medium text-gray-300 mb-2">성장률</h4>
            <p className="text-xl font-bold text-yellow-400">
              +{(((analytics.dailyUsers[analytics.dailyUsers.length - 1].users - analytics.dailyUsers[0].users) / analytics.dailyUsers[0].users) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}