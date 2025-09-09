// components/Journal.tsx - 웹용 Journal 컴포넌트
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './ui/Icon';

type SectionType = 'daily' | 'spreads';

const Journal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType>('daily');

  return (
    <div className="flex flex-col min-h-screen bg-cosmic-gradient">
      {/* 떠다니는 미스틱 요소들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-cosmic-float absolute top-20 left-12 w-1 h-1 bg-brand-accent/60 rounded-full opacity-50" />
        <div className="animate-cosmic-float absolute top-48 right-8 w-2 h-2 bg-brand-accent/40 rounded-full opacity-40" style={{ animationDelay: '1.5s' }} />
        <div className="animate-cosmic-float absolute top-96 left-6 w-1.5 h-1.5 bg-brand-accent/50 rounded-full opacity-60" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-6 pt-8 pb-24 safe-area-pt">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-12 h-12 mb-4">
            <Icon name="book-open" size={48} color="#d4af37" className="animate-mystical-pulse" />
            <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-aurum-glow" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            신성한 저널
          </h1>
          <p className="text-white/70 text-base">
            운명의 기록들을 되돌아보세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-1 mb-6 mx-4"
        >
          <div className="flex">
            <button
              onClick={() => setActiveSection('daily')}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300
                ${activeSection === 'daily' 
                  ? 'bg-brand-accent text-dark-bg-primary font-medium' 
                  : 'text-white/70 hover:text-white/90'
                }
              `}
            >
              <Icon name="clock" size={16} color="currentColor" />
              <span className="text-sm font-medium">데일리 타로</span>
            </button>
            <button
              onClick={() => setActiveSection('spreads')}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-300
                ${activeSection === 'spreads' 
                  ? 'bg-brand-accent text-dark-bg-primary font-medium' 
                  : 'text-white/70 hover:text-white/90'
                }
              `}
            >
              <Icon name="layout" size={16} color="currentColor" />
              <span className="text-sm font-medium">스프레드 기록</span>
            </button>
          </div>
        </motion.div>

        {/* 컨텐츠 영역 */}
        <motion.div 
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-1"
        >
          {activeSection === 'daily' ? (
            <DailyTarotSection />
          ) : (
            <SpreadSection />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// 일일 타로 섹션
const DailyTarotSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-5">
        <Icon name="clock" size={20} color="#d4af37" />
        <h2 className="text-xl font-medium text-white">일일 리딩</h2>
        <div className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full">
          <span className="text-xs font-medium text-brand-accent">0 기록</span>
        </div>
      </div>
      
      <div className="card-mystical p-8 text-center">
        <Icon name="clock" size={48} color="#d4af37" className="mx-auto mb-4 opacity-50" />
        <p className="text-white/60 mb-4">아직 저장된 일일 리딩이 없습니다</p>
        <button className="btn-mystical-secondary">
          새로운 리딩 시작하기
        </button>
      </div>
    </div>
  );
};

// 스프레드 섹션  
const SpreadSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-5">
        <Icon name="layout" size={20} color="#d4af37" />
        <h2 className="text-xl font-medium text-white">스프레드 기록</h2>
        <div className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full">
          <span className="text-xs font-medium text-brand-accent">0 기록</span>
        </div>
      </div>
      
      <div className="card-mystical p-8 text-center">
        <Icon name="layout" size={48} color="#d4af37" className="mx-auto mb-4 opacity-50" />
        <p className="text-white/60 mb-4">아직 저장된 스프레드 기록이 없습니다</p>
        <button className="btn-mystical-secondary">
          새로운 스프레드 시작하기
        </button>
      </div>
    </div>
  );
};



export default Journal;