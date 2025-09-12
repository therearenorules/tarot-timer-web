import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './ui/Icon';
import * as TarotData from '../utils/tarot-data';

type TarotCard = TarotData.TarotCard;
type DailyTarotSave = TarotData.DailyTarotSave;

const {
  generateDailyCards,
  getCurrentHour,
  formatHour,
  formatDate,
  saveDailyTarot,
  getTodaysSave,
} = TarotData;

const Timer: React.FC = () => {
  // ===== 상태 관리 ===== 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyCards, setDailyCards] = useState<TarotCard[]>([]);
  const [hourlyMemos, setHourlyMemos] = useState<{ [hour: number]: string }>({});
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [hasDrawnAll24Cards, setHasDrawnAll24Cards] = useState(false);
  const [isDrawingAll, setIsDrawingAll] = useState(false);
  const [isDailyTarotSaved, setIsDailyTarotSaved] = useState(false);
  const [showRecordingSection, setShowRecordingSection] = useState(false);

  const currentHour = getCurrentHour();

  // ===== 초기화 및 오늘의 카드 로드 =====
  useEffect(() => {
    const loadTodaysData = async () => {
      try {
        console.log('📅 Loading today\'s data...');
        const todaysSave = await getTodaysSave();
        console.log('📅 Today\'s save:', todaysSave);
        if (todaysSave) {
          setDailyCards(todaysSave.hourlyCards);
          setHasDrawnAll24Cards(true);
          setIsDailyTarotSaved(true);
          setShowRecordingSection(true);
          setHourlyMemos(todaysSave.memos || {});
        } else {
          setDailyCards([]);
          setHasDrawnAll24Cards(false);
          setIsDailyTarotSaved(false);
          setShowRecordingSection(false);
          setHourlyMemos({});
        }
      } catch (error) {
        console.error('Error loading today\'s data:', error);
      }
    };

    loadTodaysData();
  }, []);

  // ===== 시간 업데이트 =====
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);


  // ===== 주요 기능 함수들 =====

  // 24시간 카드 뽑기
  const drawAll24Cards = () => {
    console.log('🎴 Drawing 24 cards...', { currentTime });
    setIsDrawingAll(true);

    setTimeout(() => {
      try {
        const newDailyCards = generateDailyCards(currentTime);
        console.log('🎴 Generated cards:', newDailyCards.length, newDailyCards);

        if (newDailyCards.length === 24) {
          setDailyCards(newDailyCards);
          setHasDrawnAll24Cards(true);
          setIsDailyTarotSaved(false);
          setShowRecordingSection(true);
          setSelectedCardIndex(currentHour);
          setHourlyMemos({});
        } else {
          console.error('Failed to generate 24 cards, got:', newDailyCards.length);
          alert('오류: 카드를 생성하는데 문제가 발생했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        console.error('Error generating daily cards:', error);
        alert('오류: 카드를 생성하는데 문제가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsDrawingAll(false);
      }
    }, 2000);
  };

  // 다시 뽑기
  const redrawAll24Cards = () => {
    console.log('🎴 Redrawing 24 cards...');
    setIsDrawingAll(true);

    setTimeout(() => {
      try {
        const newDailyCards = generateDailyCards(
          new Date(currentTime.getTime() + Math.random() * 1000)
        );
        console.log('🎴 Re-generated cards:', newDailyCards.length);

        if (newDailyCards.length === 24) {
          setDailyCards(newDailyCards);
          setHasDrawnAll24Cards(true);
          setIsDailyTarotSaved(false);
          setShowRecordingSection(true);
          setSelectedCardIndex(currentHour);
          setHourlyMemos({});
        }
      } catch (error) {
        console.error('Error regenerating daily cards:', error);
        alert('오류: 카드를 재생성하는데 문제가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsDrawingAll(false);
      }
    }, 2000);
  };

  // 카드 선택 핸들러
  const handleCardPress = (index: number) => {
    setSelectedCardIndex(index);
  };

  // 메모 변경 핸들러
  const handleMemoChange = (value: string) => {
    const targetHour = selectedCardIndex !== null ? selectedCardIndex : currentHour;
    setHourlyMemos(prev => ({
      ...prev,
      [targetHour]: value,
    }));
  };

  // 일일 타로 저장
  const saveDailyTarotReading = async () => {
    if (!hasDrawnAll24Cards || dailyCards.length === 0) return;

    try {
      const dailyTarotSave: DailyTarotSave = {
        id: Date.now().toString(),
        date: currentTime.toDateString(),
        hourlyCards: dailyCards,
        memos: hourlyMemos,
        insights: Object.values(hourlyMemos).join('\n') || 'Today\'s 24-hour tarot reading',
        savedAt: new Date().toISOString(),
      };

      await saveDailyTarot(dailyTarotSave);
      setIsDailyTarotSaved(true);

      alert('저장 완료: 일일 타로 리딩이 저널에 저장되었습니다!');
    } catch (error) {
      console.error('Error saving daily tarot:', error);
      alert('오류: 저장 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // ===== 렌더링 헬퍼 함수들 =====

  const currentCard = dailyCards[currentHour] || null;
  const selectedCard = selectedCardIndex !== null ? dailyCards[selectedCardIndex] : currentCard;
  const isCurrentHourSelected = selectedCardIndex === currentHour;
  const currentMemo = hourlyMemos[selectedCardIndex !== null ? selectedCardIndex : currentHour] || '';

  // 시간 표시 포매팅
  const formatTimeDisplay = (hour: number) => {
    const timeText = formatHour(hour);
    return (
      <div className="flex flex-col items-center">
        <span className="text-brand-accent/80 text-sm">현재 시간</span>
        <span className="text-white text-xl font-semibold">{timeText}</span>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cosmic-gradient">
      {/* 신비로운 배경 효과 - 애니메이션 파티클 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{zIndex: 1}}>
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
      <div className="relative safe-area-pt pb-24" style={{zIndex: 10}}>
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
            {formatDate(currentTime)}
          </p>
          
          {/* 현재 시간 표시 (카드 뽑은 후에만) */}
          {hasDrawnAll24Cards && currentCard && (
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {formatTimeDisplay(selectedCardIndex !== null ? selectedCardIndex : currentHour)}
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
                <div className="relative w-48 h-72 mb-4">
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.nameKr}
                    className="w-full h-full object-cover rounded-xl shadow-lg border-2 border-brand-accent/50"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/tarot-cards/major_00_fool.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mystical-deepPurple/80 to-transparent rounded-xl" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-center text-lg shadow-text">
                      {selectedCard.nameKr}
                    </h3>
                    <p className="text-white/90 text-sm text-center mt-1 shadow-text">
                      {selectedCard.name}
                    </p>
                  </div>

                  {isCurrentHourSelected && (
                    <div className="absolute top-4 right-4 bg-brand-accent/90 px-2 py-1 rounded-xl">
                      <span className="text-mystical-deepPurple text-xs font-medium">지금</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 카드 상세정보 */}
              <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                {/* 키워드 뱃지들 */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedCard.keywordsKr.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-xs text-brand-accent font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                
                {/* 카드 의미 */}
                <p className="text-white/90 text-sm text-center leading-relaxed">
                  {selectedCard.meaningKr}
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
                <div className="flex items-center space-x-2">
                  <Icon name="clock" className="w-5 h-5 text-brand-accent" />
                  <h3 className="text-lg font-semibold text-gradient">에너지의 흐름</h3>
                </div>
                
                <button 
                  onClick={redrawAll24Cards}
                  disabled={isDrawingAll}
                  className={`
                    flex items-center space-x-1 border border-brand-accent/30 bg-brand-accent/5 
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${isDrawingAll 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-brand-accent/50 hover:bg-brand-accent/10 text-brand-accent'
                    }
                  `}
                >
                  <Icon name={isDrawingAll ? "sparkles" : "rotate-ccw"} className="w-3 h-3" />
                  <span>{isDrawingAll ? '재셔플링...' : '다시 뽑기'}</span>
                </button>
              </div>
              
              {/* 가로 스크롤 컨테이너 */}
              <div className="overflow-x-auto custom-scrollbar">
                <div className="flex space-x-3 pb-2" style={{ minWidth: 'max-content' }}>
                  {dailyCards.map((card, index) => (
                    <motion.button
                      key={`${card.id}-${index}`}
                      onClick={() => handleCardPress(index)}
                      className={`
                        relative flex-shrink-0 w-12 h-18 rounded-lg overflow-hidden border-2 transition-all duration-200
                        ${selectedCardIndex === index 
                          ? 'border-brand-accent shadow-lg shadow-brand-accent/50 scale-110' 
                          : index === currentHour
                            ? 'border-white/60'
                            : 'border-brand-accent/20 hover:border-brand-accent/40'
                        }
                      `}
                      whileHover={{ scale: selectedCardIndex === index ? 1.1 : 1.05 }}
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
                        <span className={`
                          text-[10px] font-medium block text-center
                          ${index === currentHour ? 'text-brand-accent font-bold' : 'text-white/70'}
                        `}>
                          {formatHour(index)}
                        </span>
                      </div>
                      
                      {index === currentHour && (
                        <div className="absolute top-1 right-1 bg-brand-accent rounded-lg px-1 py-0.5">
                          <span className="text-[8px] text-mystical-deepPurple font-bold">지금</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 기록 섹션 */}
          {showRecordingSection && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* 저널 */}
              <div className="card-mystical p-6 space-y-4">
                {/* 저널 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="book-open" className="w-5 h-5 text-brand-accent" />
                    <h3 className="text-lg font-semibold text-white">신성한 저널</h3>
                  </div>
                  {selectedCardIndex !== null && (
                    <div className="bg-brand-accent/20 border border-brand-accent/30 px-3 py-1 rounded-xl">
                      <span className="text-xs text-brand-accent font-medium">
                        {formatHour(selectedCardIndex)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 텍스트 입력 */}
                <div className="space-y-3">
                  <textarea
                    className="w-full h-32 bg-dark-bg-primary/50 border border-brand-accent/20 rounded-lg p-4 text-white placeholder-white/50 focus:border-brand-accent/50 focus:outline-none resize-none transition-colors"
                    placeholder="이 시간의 카드가 전하는 메시지를 기록해보세요..."
                    value={currentMemo}
                    onChange={(e) => handleMemoChange(e.target.value)}
                    maxLength={500}
                  />
                  
                  {/* 메모 푸터 */}
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs">
                      {currentMemo.length}/500 글자
                    </span>
                    {selectedCardIndex !== null && (
                      <span className="text-brand-accent text-xs">
                        {formatHour(selectedCardIndex)} 카드 메모
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 저장 버튼 */}
              <motion.button
                onClick={saveDailyTarotReading}
                disabled={isDailyTarotSaved}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200
                  ${isDailyTarotSaved
                    ? 'bg-emerald-600 text-white cursor-not-allowed'
                    : 'btn-mystical hover:scale-[1.02]'
                  }
                `}
                whileHover={!isDailyTarotSaved ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
              >
                <Icon name="save" className="w-5 h-5" />
                <span>
                  {isDailyTarotSaved ? '저장 완료' : '리딩 저장하기'}
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* 신비로운 인용구 */}
          <div className="card-mystical p-6 mt-8 bg-white/5 border border-white/10">
            <p className="text-white/80 text-sm italic text-center leading-relaxed">
              "시간은 강물처럼 흐르지만, 각 순간은 영원한 진리를 담고 있다."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;