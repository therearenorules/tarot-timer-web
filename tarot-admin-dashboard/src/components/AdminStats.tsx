'use client'

interface AdminStatsProps {
  stats: {
    totalUsers: number
    activeUsers: number
    totalSessions: number
    avgSessionDuration: number
  } | null
}

export function AdminStats({ stats }: AdminStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-surface rounded-lg p-6 border border-primary/20">
        <div className="flex items-center">
          <div className="p-2 bg-primary/20 rounded-lg">
            <span className="text-primary text-2xl">👥</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-300">전체 사용자</p>
            <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-green-500/20">
        <div className="flex items-center">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <span className="text-green-400 text-2xl">🟢</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-300">활성 사용자</p>
            <p className="text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-blue-500/20">
        <div className="flex items-center">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <span className="text-blue-400 text-2xl">🎯</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-300">전체 세션</p>
            <p className="text-2xl font-bold text-white">{stats.totalSessions.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg p-6 border border-yellow-500/20">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <span className="text-yellow-400 text-2xl">⏱️</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-300">평균 세션 시간</p>
            <p className="text-2xl font-bold text-white">{stats.avgSessionDuration}분</p>
          </div>
        </div>
      </div>
    </div>
  )
}