import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './ui/Icon';
import * as TarotUtils from '../utils/tarot';
type TarotCard = TarotUtils.TarotCard;

const Timer: React.FC = () => {
  const [currentTime] = useState(new Date());
  const [currentHour] = useState(TarotUtils.getCurrentHour());
  const [dailyCards, setDailyCards] = useState<TarotCard[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [currentMemo, setCurrentMemo] = useState('');
  const [memos, setMemos] = useState<{ [key: number]: string }>({});
  const [hasDrawnAll24Cards, setHasDrawnAll24Cards] = useState(false);
  const [isDrawingAll, setIsDrawingAll] = useState(false);
  const [isDailyTarotSaved, setIsDailyTarotSaved] = useState(false);

  // 초기 로드
  useEffect(() => {
    loadTodaysReading();
  }, []);

  // 메모 변경 처리
  const handleMemoChange = (memo: string) => {
    setCurrentMemo(memo);
    const targetIndex = selectedCardIndex !== null ? selectedCardIndex : currentHour;
    setMemos(prev => ({
      ...prev,
      [targetIndex]: memo
    }));
  };

  // 오늘의 리딩 로드
  const loadTodaysReading = async () => {
    const todaysSave = TarotUtils.getTodaysSave();
    if (todaysSave) {
      setDailyCards(todaysSave.hourlyCards);
      setMemos(todaysSave.memos);
      setHasDrawnAll24Cards(true);
      setIsDailyTarotSaved(true);
      setSelectedCardIndex(currentHour);
      setSelectedCard(todaysSave.hourlyCards[currentHour]);
      setCurrentMemo(todaysSave.memos[currentHour] || '');
    }
  };

  // 24장 카드 뽑기
  const drawAll24Cards = async () => {
    setIsDrawingAll(true);
    
    // 2초간 로딩 효과
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cards = TarotUtils.generateDailyCards(currentTime);
    setDailyCards(cards);
    setHasDrawnAll24Cards(true);
    setSelectedCardIndex(currentHour);
    setSelectedCard(cards[currentHour]);
    setIsDrawingAll(false);
  };

  // 카드 다시 뽑기
  const redrawCards = async () => {
    setHasDrawnAll24Cards(false);
    setSelectedCardIndex(null);
    setSelectedCard(null);
    setDailyCards([]);
    setMemos({});
    setCurrentMemo('');
    setIsDailyTarotSaved(false);
  };

  // 카드 클릭 핸들러
  const handleCardClick = (index: number) => {
    setSelectedCardIndex(index);
    setSelectedCard(dailyCards[index]);
    setCurrentMemo(memos[index] || '');
  };

  // 리딩 저장
  const saveDailyTarotReading = async () => {
    const dailyTarot = {
      id: `daily-${currentTime.toDateString()}`,
      date: currentTime.toDateString(),
      hourlyCards: dailyCards,
      memos: memos,
      savedAt: new Date().toISOString()
    };
    
    TarotUtils.saveDailyTarot(dailyTarot);
    setIsDailyTarotSaved(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cosmic-gradient">
      {/* 신비로운 배경 효과 - 애니메이션 파티클 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-16 left-8 w-2 h-2 bg-brand-accent rounded-full"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
            y: [-5, 5, -5]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="absolute top-32 right-12 w-1.5 h-1.5 bg-brand-accent/80 rounded-full"
          animate={{ 
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.3, 1],
            y: [5, -5, 5]
          }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-40 left-16 w-3 h-3 bg-brand-accent/60 rounded-full"
          animate={{ 
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.1, 1],
            x: [-3, 3, -3]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        <motion.div 
          className="absolute top-60 right-6 w-1 h-1 bg-brand-accent/80 rounded-full"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.4, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div 
          className="absolute bottom-32 right-20 w-2.5 h-2.5 bg-brand-accent/70 rounded-full"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
            x: [3, -3, 3]
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
        />
        <motion.div 
          className="absolute top-96 left-4 w-1.5 h-1.5 bg-brand-accent/80/80 rounded-full"
          animate={{ 
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.3, 1],
            y: [2, -2, 2]
          }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 3 }}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 safe-area-pt pb-24">
        {/* 🔝 상단 영역 - 헤더 섹션 */}
        <motion.div 
          className="pt-8 pb-8 px-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 아이콘 컨테이너 */}
          <motion.div 
            className="relative inline-flex items-center justify-center w-14 h-14 mb-4"
            animate={{ 
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-aurum-glow" />
            <Icon name="sparkles" className="w-8 h-8 text-brand-accent relative z-10" />
          </motion.div>
          
          {/* 메인 타이틀 */}
          <h1 className="text-3xl font-semibold text-gradient mb-2">
            24시간 타로 타이머
          </h1>
          
          {/* 날짜 표시 */}
          <p className="text-white/70 text-sm mb-4">
            {TarotUtils.formatDate(currentTime)}
          </p>
          
          {/* 현재 시간 표시 (카드 뽑은 후에만) */}
          {hasDrawnAll24Cards && (
            <motion.div 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-dark-bg-elevated/30 rounded-lg border border-brand-accent/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Icon name="clock" className="w-4 h-4 text-brand-accent" />
              <span className="text-sm text-white">현재 시간</span>
              <span className="text-sm font-semibold text-brand-accent">
                {TarotUtils.formatHour(currentHour)}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* 📲 중단 영역 */}
        <div className="px-6 space-y-6">
          {/* 현재 카드 표시 섹션 (카드를 뽑은 경우) */}
          {hasDrawnAll24Cards && selectedCard && (
            <motion.div 
              className="card-mystical p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* 카드 이미지 */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-40 h-60 mb-4">
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.nameKr}
                    className="w-full h-full object-cover rounded-xl shadow-lg shadow-brand-primary/50"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/tarot-cards/major_00_fool.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mystical-deepPurple/80 to-transparent rounded-xl" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white font-semibold text-center">
                      {selectedCard.nameKr}
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* 카드 상세정보 */}
              <div className="space-y-4">
                {/* 키워드 뱃지들 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedCard.keywordsKr.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-xs text-brand-accent"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                
                {/* 카드 의미 */}
                <p className="text-white/80 text-sm text-center leading-relaxed">
                  {selectedCard.upright.meaningKr}
                </p>
              </div>
            </motion.div>
          )}

          {/* 24시간 카드 뽑기 버튼 (카드를 뽑지 않은 경우) */}
          {!hasDrawnAll24Cards && (
            <motion.div 
              className="card-mystical p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-accent/20 rounded-full mb-4">
                  <Icon name="zap" className="w-6 h-6 text-brand-accent" />
                </div>
                <h3 className="text-xl font-semibold text-gradient">운명을 밝혀라</h3>
                <p className="text-white/70 text-sm">
                  우주의 메시지가 당신을 기다립니다
                </p>
                <motion.button
                  onClick={drawAll24Cards}
                  disabled={isDrawingAll}
                  className="btn-mystical min-w-48 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDrawingAll ? (
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon name="sparkles" className="w-4 h-4" />
                      </motion.div>
                      <span>카드를 뽑고 있습니다...</span>
                    </div>
                  ) : (
                    '운명의 24장 뽑기'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* 24시간 카드 가로 스크롤 섹션 */}
          {hasDrawnAll24Cards && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* 섹션 헤더 */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gradient">24시간 에너지 흐름</h3>
                <button 
                  onClick={redrawCards}
                  className="btn-mystical-secondary text-xs px-3 py-1 flex items-center space-x-1"
                >
                  <Icon name="rotate-ccw" className="w-3 h-3" />
                  <span>다시 뽑기</span>
                </button>
              </div>
              
              {/* 가로 스크롤 컨테이너 */}
              <div className="overflow-x-auto custom-scrollbar">
                <div className="flex space-x-3 pb-2" style={{ minWidth: 'max-content' }}>
                  {dailyCards.map((card, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleCardClick(index)}
                      className={`
                        relative flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200
                        ${selectedCardIndex === index 
                          ? 'border-brand-accent shadow-lg shadow-brand-accent/50' 
                          : 'border-brand-accent/20 hover:border-brand-accent/40'
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={card.imageUrl}
                        alt={card.nameKr}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/tarot-cards/major_00_fool.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mystical-deepPurple/90 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-1">
                        <span className="text-xs text-white font-medium block text-center">
                          {TarotUtils.formatHour(index)}
                        </span>
                      </div>
                      {index === currentHour && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-mystical-deepPurple font-bold">현재</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 메모 입력 섹션 */}
          {hasDrawnAll24Cards && (
            <motion.div 
              className="card-mystical p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* 메모 헤더 */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Icon name="star" className="w-5 h-5 text-brand-accent" />
                  <span>신성한 저널</span>
                </h3>
                {selectedCardIndex !== null && (
                  <span className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-xs text-brand-accent">
                    {TarotUtils.formatHour(selectedCardIndex)}
                  </span>
                )}
              </div>
              
              {/* 텍스트 입력 */}
              <div className="space-y-2">
                <textarea
                  className="w-full h-32 bg-dark-bg-primary/50 border border-brand-accent/20 rounded-lg p-4 text-white placeholder-white/50 focus:border-brand-accent/50 focus:outline-none resize-none"
                  placeholder="이 시간의 느낌과 생각을 기록해보세요..."
                  value={currentMemo}
                  onChange={(e) => handleMemoChange(e.target.value)}
                  maxLength={500}
                />
                
                {/* 글자수 카운터 */}
                <div className="text-right">
                  <span className="text-white/40 text-xs">
                    {currentMemo.length}/500 자
                  </span>
                </div>
              </div>
              
              {/* 저장 버튼 */}
              <motion.button
                onClick={saveDailyTarotReading}
                disabled={isDailyTarotSaved}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200
                  ${isDailyTarotSaved
                    ? 'bg-dark-bg-elevated/50 border border-brand-accent/30 text-brand-accent cursor-not-allowed'
                    : 'btn-mystical hover:scale-[1.02]'
                  }
                `}
                whileTap={{ scale: 0.98 }}
              >
                <Icon name="save" className="w-5 h-5" />
                <span>
                  {isDailyTarotSaved ? '✅ 저장됨' : '💾 리딩 저장하기'}
                </span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;