'use client'

interface SystemHealthProps {
  system: {
    serverStatus: string
    databaseStatus: string
    apiResponseTime: number
    errorRate: number
  } | null
}

export function SystemHealth({ system }: SystemHealthProps) {
  if (!system) {
    return (
      <div className="bg-surface rounded-lg p-6 border border-primary/20">
        <h2 className="text-xl font-bold text-white mb-4">시스템 상태</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '❓'
    }
  }

  return (
    <div className="bg-surface rounded-lg p-6 border border-primary/20">
      <h2 className="text-xl font-bold text-white mb-6">🔧 시스템 상태</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">서버 상태</p>
              <p className={`text-lg font-bold ${getStatusColor(system.serverStatus)}`}>
                {system.serverStatus}
              </p>
            </div>
            <span className="text-2xl">{getStatusIcon(system.serverStatus)}</span>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">데이터베이스</p>
              <p className={`text-lg font-bold ${getStatusColor(system.databaseStatus)}`}>
                {system.databaseStatus}
              </p>
            </div>
            <span className="text-2xl">{getStatusIcon(system.databaseStatus)}</span>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">API 응답시간</p>
              <p className="text-lg font-bold text-blue-400">
                {system.apiResponseTime}ms
              </p>
            </div>
            <span className="text-2xl">⚡</span>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">오류율</p>
              <p className={`text-lg font-bold ${system.errorRate < 1 ? 'text-green-400' : system.errorRate < 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {system.errorRate}%
              </p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-background rounded-lg border border-primary/10">
        <h3 className="text-lg font-semibold text-gray-200 mb-3">시스템 개요</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>마지막 점검:</span>
            <span>{new Date().toLocaleString('ko-KR')}</span>
          </div>
          <div className="flex justify-between">
            <span>업타임:</span>
            <span className="text-green-400">99.9%</span>
          </div>
          <div className="flex justify-between">
            <span>버전:</span>
            <span>v1.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>환경:</span>
            <span>Development</span>
          </div>
        </div>
      </div>
    </div>
  )
}