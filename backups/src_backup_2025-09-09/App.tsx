import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './components/Timer';
import Icon from './components/ui/Icon';

// 스프레드 데이터 정의
const SPREAD_TYPES = [
  {
    id: 'one-card',
    name: 'One Card Spread',
    nameKr: '1카드 스프레드',
    descriptionKr: '오늘 하루의 핵심 메시지를 전달하는 간단하고 강력한 스프레드입니다.',
    isPremium: false,
    cardCount: 1
  },
  {
    id: 'three-card',
    name: 'Three Card Spread',
    nameKr: '3카드 스프레드',
    descriptionKr: '과거, 현재, 미래의 흐름을 보여주는 기본적인 스프레드입니다.',
    isPremium: false,
    cardCount: 3
  },
  {
    id: 'four-card',
    name: 'Four Card Spread',
    nameKr: '4카드 스프레드',
    descriptionKr: '현재 상황을 다각도로 분석하는 균형잡힌 스프레드입니다.',
    isPremium: false,
    cardCount: 4
  },
  {
    id: 'five-card',
    name: 'Five Card V Spread',
    nameKr: '5카드 V 스프레드',
    descriptionKr: '복잡한 상황의 근본 원인과 해결책을 찾는 심화 스프레드입니다.',
    isPremium: false,
    cardCount: 5
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    nameKr: '켈틱 크로스',
    descriptionKr: '타로의 왕좌, 가장 완벽하고 깊이 있는 통찰을 제공하는 전문가 스프레드입니다.',
    isPremium: true,
    cardCount: 10
  },
  {
    id: 'cup-of-relationship',
    name: 'Cup of Relationship',
    nameKr: '컵 오브 릴레이션십',
    descriptionKr: '사랑과 관계의 모든 측면을 세밀하게 분석하는 특별한 연애 전용 스프레드입니다.',
    isPremium: true,
    cardCount: 11
  },
  {
    id: 'ab-choice',
    name: 'AB Choice Spread',
    nameKr: 'AB 선택 스프레드',
    descriptionKr: '두 개의 선택지 사이에서 올바른 결정을 내리도록 도와주는 결정 전용 스프레드입니다.',
    isPremium: true,
    cardCount: 7
  }
];

const Spreads = () => {
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);

  const handleSpreadSelect = (spreadId: string) => {
    setSelectedSpread(spreadId);
    // TODO: 스프레드 선택 후 리딩 화면으로 이동
    console.log('Selected spread:', spreadId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cosmic-gradient">
      {/* 떠다니는 미스틱 요소들 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="animate-cosmic-float absolute top-16 left-8 w-2 h-2 bg-brand-accent rounded-full opacity-40" />
        <div className="animate-cosmic-float absolute top-32 right-12 w-1 h-1 bg-brand-accent/60 rounded-full opacity-60" style={{ animationDelay: '1s' }} />
        <div className="animate-cosmic-float absolute top-64 left-16 w-3 h-3 bg-brand-accent/80 rounded-full opacity-30" style={{ animationDelay: '2s' }} />
        <div className="animate-cosmic-float absolute top-80 right-8 w-1.5 h-1.5 bg-brand-accent rounded-full opacity-50" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-6 pt-8 pb-24 safe-area-pt">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-12 h-12 mb-4">
            <Icon name="layout" size={48} color="#d4af37" className="animate-mystical-pulse" />
            <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-aurum-glow" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            신비한 스프레드
          </h1>
          <p className="text-white/70 text-base">
            운명의 카드 배치법을 선택하세요
          </p>
        </div>

        {/* 스프레드 카드 목록 */}
        <div className="space-y-4 mb-6">
          {SPREAD_TYPES.map((spread) => (
            <motion.div
              key={spread.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: SPREAD_TYPES.indexOf(spread) * 0.1 }}
              className="group"
            >
              <div
                onClick={() => handleSpreadSelect(spread.id)}
                className={`
                  card-mystical p-5 cursor-pointer transition-all duration-300
                  ${selectedSpread === spread.id ? 'border-brand-accent/60 shadow-glow-gold' : 'hover:border-brand-accent/40'}
                  hover:scale-[1.02] active:scale-[0.98]
                `}
              >
                {/* 카드 헤더 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Icon name="layout" size={20} color="#d4af37" />
                      {spread.isPremium && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-accent rounded-full flex items-center justify-center">
                          <Icon name="star" size={8} color="#1a1f3a" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {spread.nameKr}
                      </h3>
                      <p className="text-sm text-brand-accent/80">
                        {spread.name}
                      </p>
                    </div>
                  </div>
                  
                  {spread.isPremium && (
                    <div className="px-3 py-1 bg-gradient-to-r from-brand-accent to-brand-accent/80 rounded-full">
                      <div className="flex items-center space-x-1">
                        <Icon name="star" size={12} color="#1a1f3a" />
                        <span className="text-xs font-medium text-dark-bg-primary">프리미엄</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 설명 */}
                <p className="text-white/80 text-sm mb-4 leading-relaxed">
                  {spread.descriptionKr}
                </p>

                {/* 액션 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-white/60">
                    <Icon name="tarot-cards" size={16} color="currentColor" />
                    <span>{spread.cardCount}장의 카드</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpreadSelect(spread.id);
                    }}
                    className="btn-mystical-secondary flex items-center space-x-2 px-4 py-2 hover:bg-brand-accent/20"
                  >
                    <Icon name="zap" size={16} color="currentColor" />
                    <span className="text-sm font-medium">리딩 시작하기</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 프리미엄 하이라이트 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="card-mystical p-6 text-center mb-6"
        >
          <div className="relative inline-flex items-center justify-center w-12 h-12 mb-4">
            <Icon name="star" size={48} color="#d4af37" className="animate-mystical-pulse" />
            <div className="absolute inset-0 bg-brand-accent/30 rounded-full animate-aurum-glow" />
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">
            프리미엄 스프레드
          </h2>
          <p className="text-white/70 text-sm mb-4">
            더 깊은 통찰을 위한 고급 스프레드들
          </p>
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-accent/20 border border-brand-accent/30 rounded-full">
            <Icon name="star" size={16} color="#d4af37" />
            <span className="text-sm font-medium text-brand-accent">활성화됨</span>
          </div>
        </motion.div>

        {/* 신비로운 인용구 */}
        <div className="text-center text-white/60 text-sm italic">
          "각각의 스프레드는 다른 차원의 문을 열어준다."
        </div>
      </div>
    </div>
  );
};

// 더미 데이터 - 실제로는 로컬 스토리지에서 가져옴
const SAMPLE_DAILY_SAVES = [
  {
    id: '1',
    date: '2025-09-09',
    hourlyCards: [
      { id: 'card1', name: 'The Fool', imageUrl: '/assets/tarot-cards/major_00_fool.jpg' },
      { id: 'card2', name: 'The Magician', imageUrl: '/assets/tarot-cards/major_01_magician.jpg' },
      { id: 'card3', name: 'The High Priestess', imageUrl: '/assets/tarot-cards/major_02_high_priestess.jpg' },
      { id: 'card4', name: 'The Empress', imageUrl: '/assets/tarot-cards/major_03_empress.jpg' },
      { id: 'card5', name: 'The Emperor', imageUrl: '/assets/tarot-cards/major_04_emperor.jpg' },
      { id: 'card6', name: 'The Hierophant', imageUrl: '/assets/tarot-cards/major_05_hierophant.jpg' },
      { id: 'card7', name: 'The Lovers', imageUrl: '/assets/tarot-cards/major_06_lovers.jpg' },
      { id: 'card8', name: 'The Chariot', imageUrl: '/assets/tarot-cards/major_07_chariot.jpg' },
      { id: 'card9', name: 'Strength', imageUrl: '/assets/tarot-cards/major_08_strength.jpg' },
    ],
    memos: { 9: '오늘은 새로운 시작의 에너지가...', 12: '점심 시간에 중요한 결정이...', 15: '오후의 균형 잡힌 접근이...' },
    insights: '오늘은 새로운 여정의 시작을 알리는 강력한 에너지가 흐르고 있습니다. 바보 카드가 보여주는 순수한 열정과 마법사의 실현 능력이 조화를 이루어...'
  },
  {
    id: '2',
    date: '2025-09-08',
    hourlyCards: [
      { id: 'card1', name: 'The Star', imageUrl: '/assets/tarot-cards/major_17_star.jpg' },
      { id: 'card2', name: 'The Moon', imageUrl: '/assets/tarot-cards/major_18_moon.jpg' },
    ],
    memos: { 8: '아침의 희망적인 메시지...', 14: '오후의 직관적 판단...' },
    insights: '희망과 직감이 하루를 이끄는 날입니다.'
  }
];

const SAMPLE_SPREAD_SAVES = [
  {
    id: '1',
    title: '새로운 직장에 대한 고민',
    date: '2025-09-09',
    spreadName: '3카드 스프레드',
    spreadType: 'three-card',
    cards: [
      { position: 'past', card: { name: 'Ten of Pentacles', imageUrl: '/assets/tarot-cards/minor_pentacles_10.jpg' }},
      { position: 'present', card: { name: 'The Fool', imageUrl: '/assets/tarot-cards/major_00_fool.jpg' }},
      { position: 'future', card: { name: 'Ace of Wands', imageUrl: '/assets/tarot-cards/minor_wands_ace.jpg' }}
    ],
    insights: '과거의 안정된 기반 위에서 새로운 도전을 시작할 준비가 되어 있습니다. 미래에는 창조적인 에너지와 새로운 기회가 기다리고 있어요.'
  },
  {
    id: '2',
    title: '연애 관계 발전 방향',
    date: '2025-09-07',
    spreadName: '켈틱 크로스',
    spreadType: 'celtic-cross',
    cards: [
      { position: '1', card: { name: 'Two of Cups', imageUrl: '/assets/tarot-cards/minor_cups_02.jpg' }},
      { position: '2', card: { name: 'The Lovers', imageUrl: '/assets/tarot-cards/major_06_lovers.jpg' }},
      { position: '3', card: { name: 'Queen of Cups', imageUrl: '/assets/tarot-cards/minor_cups_queen.jpg' }}
    ],
    insights: '깊은 감정적 연결과 상호 이해를 바탕으로 한 관계의 발전이 예상됩니다. 서로에 대한 진정한 사랑과 배려가...'
  }
];

const Journal = () => {
  const [activeSection, setActiveSection] = useState<'daily' | 'spreads'>('daily');

  const formatKoreanDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  const handleDailyTarotSelect = (save: any) => {
    console.log('Selected daily tarot:', save);
    // TODO: 상세 보기 화면으로 이동
  };

  const handleSpreadSelect = (spread: any) => {
    console.log('Selected spread:', spread);
    // TODO: 상세 보기 화면으로 이동
  };

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

        {/* 섹션 토글 탭 */}
        <div className="mb-6">
          <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 mx-4">
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
        </div>

        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-5 mx-1">
          <div className="flex items-center space-x-2">
            <Icon 
              name={activeSection === 'daily' ? 'clock' : 'layout'} 
              size={20} 
              color="#d4af37" 
            />
            <h2 className="text-xl font-medium text-white">
              {activeSection === 'daily' ? '일일 리딩' : '스프레드 기록'}
            </h2>
          </div>
          <div className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full">
            <span className="text-xs font-medium text-brand-accent">
              {activeSection === 'daily' ? SAMPLE_DAILY_SAVES.length : SAMPLE_SPREAD_SAVES.length} 기록
            </span>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="space-y-4">
          {activeSection === 'daily' ? (
            // 데일리 타로 섹션
            SAMPLE_DAILY_SAVES.length > 0 ? (
              SAMPLE_DAILY_SAVES.map((save) => (
                <motion.div
                  key={save.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <div
                    onClick={() => handleDailyTarotSelect(save)}
                    className="card-mystical p-5 cursor-pointer hover:border-brand-accent/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    {/* 카드 헤더: 날짜 + 상태 */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Icon name="calendar" size={16} color="#d4af37" />
                        <span className="text-white font-medium">
                          {formatKoreanDate(save.date)}
                        </span>
                      </div>
                      <div className="px-2 py-1 bg-brand-accent/20 border border-brand-accent/40 rounded-full">
                        <span className="text-xs text-brand-accent">저장됨</span>
                      </div>
                    </div>

                    {/* 24시간 카드 미리보기 */}
                    <div className="mb-4">
                      <p className="text-sm text-white/70 mb-3">24시간 타로 리딩</p>
                      <div className="flex space-x-1 overflow-x-auto custom-scrollbar pb-2">
                        {save.hourlyCards.slice(0, 8).map((card, index) => (
                          <div key={index} className="flex-shrink-0 w-6 h-9 bg-dark-bg-elevated rounded-sm overflow-hidden border border-white/10">
                            <img 
                              src={card.imageUrl} 
                              alt={card.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-b from-brand-accent/30 to-brand-accent/10 flex items-center justify-center"><span class="text-[6px] text-brand-accent">🎴</span></div>';
                              }}
                            />
                          </div>
                        ))}
                        {save.hourlyCards.length > 8 && (
                          <div className="flex-shrink-0 w-6 h-9 bg-brand-accent/20 rounded-sm flex items-center justify-center">
                            <span className="text-[8px] text-brand-accent font-bold">
                              +{save.hourlyCards.length - 8}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 인사이트 미리보기 */}
                    <div className="mb-4">
                      <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
                        {save.insights}
                      </p>
                    </div>

                    {/* 푸터: 메모 카운트 + 액션 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-white/60">
                        <Icon name="clock" size={12} color="currentColor" />
                        <span>{Object.keys(save.memos || {}).length}개 시간대 메모</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDailyTarotSelect(save);
                        }}
                        className="btn-mystical-secondary text-xs px-3 py-1 hover:bg-brand-accent/20"
                      >
                        보기
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="card-mystical p-8 text-center">
                <Icon name="clock" size={48} color="#d4af37" className="mx-auto mb-4 opacity-50" />
                <p className="text-white/60 mb-4">아직 저장된 일일 리딩이 없습니다</p>
                <button className="btn-mystical-secondary">
                  새로운 리딩 시작하기
                </button>
              </div>
            )
          ) : (
            // 스프레드 기록 섹션
            SAMPLE_SPREAD_SAVES.length > 0 ? (
              SAMPLE_SPREAD_SAVES.map((spread) => (
                <motion.div
                  key={spread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <div
                    onClick={() => handleSpreadSelect(spread)}
                    className="card-mystical p-5 cursor-pointer hover:border-brand-accent/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    {/* 카드 헤더: 제목 + 날짜 + 상태 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <Icon name="layout" size={16} color="#d4af37" className="mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-base mb-1 line-clamp-1">
                            {spread.title}
                          </h3>
                          <p className="text-sm text-white/60">
                            {formatKoreanDate(spread.date)}
                          </p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-brand-accent/20 border border-brand-accent/40 rounded-full">
                        <span className="text-xs text-brand-accent">저장됨</span>
                      </div>
                    </div>

                    {/* 스프레드 타입 뱃지 */}
                    <div className="flex justify-center mb-4">
                      <div className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full">
                        <span className="text-xs font-medium text-brand-accent">
                          {spread.spreadName}
                        </span>
                      </div>
                    </div>

                    {/* 스프레드 미리보기 (간단한 카드 배치) */}
                    <div className="mb-4 py-4">
                      <div className="flex justify-center space-x-2">
                        {spread.cards.slice(0, 3).map((cardData, index) => (
                          <div key={index} className="w-8 h-12 bg-dark-bg-elevated rounded-sm overflow-hidden border border-brand-accent/20">
                            <img 
                              src={cardData.card.imageUrl} 
                              alt={cardData.card.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-b from-brand-accent/30 to-brand-accent/10 flex items-center justify-center"><span class="text-[8px] text-brand-accent">🎴</span></div>';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 인사이트 미리보기 */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon name="sparkles" size={12} color="#d4af37" />
                        <span className="text-xs text-brand-accent font-medium">인사이트</span>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
                        {spread.insights}
                      </p>
                    </div>

                    {/* 푸터: 액션 버튼 */}
                    <div className="flex justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpreadSelect(spread);
                        }}
                        className="btn-mystical-secondary flex items-center space-x-2 text-xs px-3 py-1 hover:bg-brand-accent/20"
                      >
                        <Icon name="layout" size={12} color="currentColor" />
                        <span>보기</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="card-mystical p-8 text-center">
                <Icon name="layout" size={48} color="#d4af37" className="mx-auto mb-4 opacity-50" />
                <p className="text-white/60 mb-4">아직 저장된 스프레드 기록이 없습니다</p>
                <button className="btn-mystical-secondary">
                  새로운 스프레드 시작하기
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

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
  { id: 'spreads', name: '스프레드', icon: 'tarot-cards', component: Spreads },
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
