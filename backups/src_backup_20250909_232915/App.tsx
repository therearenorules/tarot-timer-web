import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './components/Timer';
import Spread from './components/Spread';
import Journal from './components/Journal';
import Icon from './components/ui/Icon';


const Settings = () => {
  // 설정 상태들
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [cardDepth, setCardDepth] = useState(true);
  const [mysticalEffects, setMysticalEffects] = useState(true);
  const [cardFlipAnimation, setCardFlipAnimation] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [hourlyNotifications, setHourlyNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-cosmic-gradient">
      {/* 떠다니는 미스틱 요소들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-cosmic-float absolute top-24 left-16 w-1 h-1 bg-brand-accent/50 rounded-full opacity-60" />
        <div className="animate-cosmic-float absolute top-56 right-12 w-2 h-2 bg-brand-accent/40 rounded-full opacity-40" style={{ animationDelay: '1.2s' }} />
        <div className="animate-cosmic-float absolute top-80 left-8 w-1.5 h-1.5 bg-brand-accent/60 rounded-full opacity-50" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-6 pt-8 pb-24 safe-area-pt">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-12 h-12 mb-4">
            <Icon name="settings" size={48} color="#d4af37" className="animate-mystical-pulse" />
            <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-aurum-glow" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            신비한 설정
          </h1>
          <p className="text-white/70 text-base">
            앱을 당신만의 방식으로 맞춤 설정하세요
          </p>
        </div>

        {/* 스크롤 컨테이너 */}
        <div className="space-y-6 pb-6 overflow-y-auto custom-scrollbar">
          {/* 프리미엄 멤버십 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 border-2 border-brand-accent/30 rounded-xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Icon name="star" size={24} color="#d4af37" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">프리미엄 멤버십</h3>
                  <p className="text-sm text-white/70">모든 기능 활성화됨</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                <span className="text-xs font-medium text-green-400">활성화</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <div className="w-1 h-1 bg-brand-accent rounded-full" />
                <span>프리미엄 스프레드 무제한</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <div className="w-1 h-1 bg-brand-accent rounded-full" />
                <span>광고 제거</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <div className="w-1 h-1 bg-brand-accent rounded-full" />
                <span>무제한 저장 공간</span>
              </div>
            </div>
            
            <button className="w-full py-2 px-4 border border-brand-accent/50 rounded-lg text-sm font-medium text-brand-accent hover:bg-brand-accent/10 transition-colors">
              프리미엄 관리
            </button>
          </motion.div>

          {/* 디스플레이 & 테마 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card-mystical p-5"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="sun" size={20} color="#d4af37" />
              <h2 className="text-lg font-medium text-white">디스플레이 & 테마</h2>
            </div>
            
            <div className="space-y-4">
              {/* 다크 모드 (항상 켜짐) */}
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">다크 모드</div>
                  <div className="text-white/60 text-xs">신비로운 경험을 위해 항상 활성화</div>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-brand-accent/50 opacity-70">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </div>
              </div>
              
              {/* 언어 설정 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">언어</div>
                  <div className="text-white/60 text-xs">
                    {language === 'ko' ? '한국어' : 'English'}
                  </div>
                </div>
                <button
                  onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                  className="flex items-center space-x-1 px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-lg hover:bg-brand-accent/30 transition-colors"
                >
                  <Icon name="globe" size={12} color="#d4af37" />
                  <span className="text-xs font-medium text-brand-accent">
                    {language === 'ko' ? 'EN' : '한'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* 타로 설정 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="card-mystical p-5"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="tarot-cards" size={20} color="#d4af37" />
              <h2 className="text-lg font-medium text-white">타로 설정</h2>
            </div>
            
            <div className="space-y-4">
              {/* 카드 해석 깊이 */}
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">카드 해석 깊이</div>
                  <div className="text-white/60 text-xs">상세한 해석과 키워드 표시</div>
                </div>
                <button
                  onClick={() => setCardDepth(!cardDepth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cardDepth ? 'bg-brand-accent' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    cardDepth ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {/* 신비로운 효과 */}
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">신비로운 효과</div>
                  <div className="text-white/60 text-xs">글로우 효과와 애니메이션 강도</div>
                </div>
                <button
                  onClick={() => setMysticalEffects(!mysticalEffects)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mysticalEffects ? 'bg-brand-accent' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    mysticalEffects ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {/* 카드 뒤집기 애니메이션 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">카드 뒤집기 애니메이션</div>
                  <div className="text-white/60 text-xs">카드를 뒤집을 때 3D 효과</div>
                </div>
                <button
                  onClick={() => setCardFlipAnimation(!cardFlipAnimation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    cardFlipAnimation ? 'bg-brand-accent' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    cardFlipAnimation ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 타이머 & 일일 설정 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="card-mystical p-5"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="clock" size={20} color="#d4af37" />
              <h2 className="text-lg font-medium text-white">타이머 & 일일 설정</h2>
            </div>
            
            <div className="space-y-4">
              {/* 일일 타로 알림 */}
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">일일 타로 알림</div>
                  <div className="text-white/60 text-xs">매일 오전 9시 타로 뽑기 알림</div>
                </div>
                <button
                  onClick={() => setDailyReminders(!dailyReminders)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    dailyReminders ? 'bg-brand-accent' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    dailyReminders ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {/* 시간대 변경 알림 */}
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">시간대 변경 알림</div>
                  <div className="text-white/60 text-xs">새로운 시간의 카드로 변경 시 알림</div>
                </div>
                <button
                  onClick={() => setHourlyNotifications(!hourlyNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hourlyNotifications ? 'bg-brand-accent' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    hourlyNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {/* 자동 저장 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium mb-1">자동 저장</div>
                  <div className="text-white/60 text-xs">일일 타로 리딩 자동 저장</div>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoSave ? 'bg-brand-accent' : 'bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 저널 & 데이터 관리 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="card-mystical p-5"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Icon name="book-open" size={20} color="#d4af37" />
              <h2 className="text-lg font-medium text-white">저널 & 데이터 관리</h2>
            </div>
            
            <div className="space-y-3">
              {/* 액션 버튼들 */}
              <button className="w-full flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-brand-accent/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <Icon name="save" size={16} color="#ffffff" />
                  <span className="text-sm text-white">데이터 내보내기 (.JSON)</span>
                </div>
                <Icon name="chevron-right" size={16} color="#ffffff" />
              </button>
              
              <button className="w-full flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-brand-accent/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <Icon name="rotate-ccw" size={16} color="#ffffff" />
                  <span className="text-sm text-white">백업 복원하기</span>
                </div>
                <Icon name="chevron-right" size={16} color="#ffffff" />
              </button>
              
              <button className="w-full flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-brand-accent/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <Icon name="book-open" size={16} color="#ffffff" />
                  <span className="text-sm text-white">저널 템플릿 설정</span>
                </div>
                <Icon name="chevron-right" size={16} color="#ffffff" />
              </button>
              
              {/* 보관 기간 설정 */}
              <div className="flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 rounded-lg mt-4">
                <div>
                  <div className="text-white text-sm font-medium">리딩 기록 보관 기간</div>
                  <div className="text-white/60 text-xs">6개월 후 자동 정리</div>
                </div>
                <button className="text-xs font-medium text-brand-accent hover:text-brand-accent/80 transition-colors">
                  변경
                </button>
              </div>
            </div>
          </motion.div>

          {/* 푸터 정보 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-center py-6"
          >
            <div className="mb-4">
              <p className="text-white/60 text-xs">버전 1.0.0</p>
              <p className="text-white/40 text-xs mt-1">
                © 2024 타로 타이머. 모든 권리 보유.
              </p>
            </div>
            
            <div className="px-4 py-3 bg-white/5 border border-brand-accent/20 rounded-lg">
              <p className="text-white/60 text-xs italic">
                "설정은 당신만의 신비로운 여정을 만드는 첫 번째 단계입니다."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const tabs = [
  { id: 'timer', name: '타이머', icon: 'clock', component: Timer },
  { id: 'spreads', name: '스프레드', icon: 'tarot-cards', component: Spread },
  { id: 'journal', name: '저널', icon: 'book-open', component: Journal },
  { id: 'settings', name: '설정', icon: 'settings', component: Settings },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState('timer');
  
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Timer;

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* 떠다니는 미스틱 요소들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-cosmic-float absolute top-10 left-10 w-2 h-2 bg-brand-accent rounded-full opacity-60" />
        <div className="animate-cosmic-float absolute top-32 right-16 w-1 h-1 bg-brand-accent/80 rounded-full opacity-40" style={{ animationDelay: '1s' }} />
        <div className="animate-cosmic-float absolute bottom-40 left-20 w-3 h-3 bg-brand-accent/60 rounded-full" style={{ animationDelay: '2s' }} />
        <div className="animate-cosmic-float absolute top-60 right-8 w-1.5 h-1.5 bg-brand-accent rounded-full opacity-80" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <main className="pb-20 safe-area-pt">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 하단 탭바 */}
      <nav className="tab-bar">
        <div className="flex items-center justify-around py-2 safe-area-pb max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'text-brand-accent transform scale-110' 
                    : 'text-white/60 hover:text-white/80 hover:scale-105'
                  }
                  touch-feedback
                `}
              >
                <div className={`
                  relative flex items-center justify-center
                  ${isActive ? 'animate-aurum-glow' : ''}
                `}>
                  <Icon name={tab.icon} className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-accent/20 rounded-lg -z-10"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
