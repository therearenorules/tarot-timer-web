'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-purple-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">🔮 관리자 대시보드 테스트</h1>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* 기본 UI 테스트 */}
        <div className="bg-purple-800 rounded-lg p-6 border border-purple-600">
          <h2 className="text-2xl font-bold mb-4">UI 테스트</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">카드 1</h3>
              <p className="text-purple-200">이것은 테스트 카드입니다.</p>
            </div>
            <div className="bg-purple-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">카드 2</h3>
              <p className="text-purple-200">Tailwind CSS가 정상 작동합니다.</p>
            </div>
            <div className="bg-purple-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">카드 3</h3>
              <p className="text-purple-200">TypeScript 컴파일 성공!</p>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="bg-purple-800 rounded-lg p-6 border border-purple-600">
          <h2 className="text-2xl font-bold mb-4">📊 테스트 통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">150</div>
              <div className="text-sm text-purple-200">전체 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">87</div>
              <div className="text-sm text-purple-200">활성 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">1,250</div>
              <div className="text-sm text-purple-200">총 세션</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">12.5분</div>
              <div className="text-sm text-purple-200">평균 시간</div>
            </div>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="bg-purple-800 rounded-lg p-6 border border-purple-600">
          <h2 className="text-2xl font-bold mb-4">🔧 시스템 상태</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-purple-700 rounded-lg">
              <span>서버 상태</span>
              <span className="text-green-400 font-bold">✅ 정상</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-700 rounded-lg">
              <span>데이터베이스</span>
              <span className="text-green-400 font-bold">✅ 정상</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}