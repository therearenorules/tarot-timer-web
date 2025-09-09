import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './ui/Icon';
import * as TarotData from '../utils/tarot-data';

type SpreadTypeExtended = TarotData.SpreadTypeExtended;
type SpreadCard = TarotData.SpreadCard;
type SavedSpread = TarotData.SavedSpread;
type TarotCard = TarotData.TarotCard;

const {
  SPREAD_TYPES,
  getFreeSpreads,
  getPremiumSpreads,
  generateSpreadCards,
  createSpreadReading,
  saveSpread,
  formatDate,
} = TarotData;

const Spread: React.FC = () => {
  const [selectedSpread, setSelectedSpread] = useState<SpreadTypeExtended | null>(null);
  const [currentReading, setCurrentReading] = useState<SpreadCard[]>([]);
  const [hasDrawnCards, setHasDrawnCards] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showCardDetail, setShowCardDetail] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [readingTitle, setReadingTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPremiumUser] = useState(true); // 프리미엄 상태 (임시로 true로 설정)

  // 무료/프리미엄 스프레드 분류
  const freeSpreads = getFreeSpreads();
  const premiumSpreads = getPremiumSpreads();

  // ===== 핵심 기능 함수들 =====

  // 스프레드 선택
  const handleSpreadSelect = (spread: SpreadTypeExtended) => {
    if (spread.isPremium && !isPremiumUser) {
      alert('프리미엄 멤버십이 필요한 스프레드입니다.');
      return;
    }
    
    setSelectedSpread(spread);
    setCurrentReading([]);
    setHasDrawnCards(false);
    setSelectedCardIndex(null);
    setShowCardDetail(false);
    setPersonalNotes('');
    setReadingTitle(`${spread.nameKr} 리딩 - ${formatDate(new Date())}`);
  };

  // 카드 뽑기
  const drawCards = () => {
    if (!selectedSpread) return;
    
    setIsDrawing(true);
    
    setTimeout(() => {
      const cards = generateSpreadCards(selectedSpread);
      const spreadReading = createSpreadReading(selectedSpread, cards);
      setCurrentReading(spreadReading);
      setHasDrawnCards(true);
      setIsDrawing(false);
    }, 1500);
  };

  // 카드 다시 뽑기
  const redrawCards = () => {
    if (!selectedSpread) return;
    
    setIsDrawing(true);
    setHasDrawnCards(false);
    setSelectedCardIndex(null);
    setShowCardDetail(false);
    
    setTimeout(() => {
      const cards = generateSpreadCards(selectedSpread);
      const spreadReading = createSpreadReading(selectedSpread, cards);
      setCurrentReading(spreadReading);
      setHasDrawnCards(true);
      setIsDrawing(false);
    }, 1500);
  };

  // 카드 클릭 - 확대 보기
  const handleCardClick = (index: number) => {
    if (!hasDrawnCards || !currentReading[index]) return;
    
    setSelectedCardIndex(index);
    setShowCardDetail(true);
  };

  // 카드 상세 모달 닫기
  const closeCardDetail = () => {
    setShowCardDetail(false);
    setSelectedCardIndex(null);
  };

  // 리딩 저장
  const saveCurrentReading = async () => {
    if (!selectedSpread || currentReading.length === 0 || !readingTitle.trim() || !hasDrawnCards) return;

    setIsSaving(true);
    
    try {
      const savedSpread = saveSpread(
        selectedSpread.id,
        readingTitle,
        currentReading,
        personalNotes || '스프레드 리딩 기록'
      );
      
      alert('리딩이 저널에 저장되었습니다!');
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving reading:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  // 처음부터 다시 시작
  const resetReading = () => {
    setSelectedSpread(null);
    setCurrentReading([]);
    setHasDrawnCards(false);
    setSelectedCardIndex(null);
    setShowCardDetail(false);
    setPersonalNotes('');
    setReadingTitle('');
  };

  // ===== 렌더링 헬퍼 =====

  const selectedCard = selectedCardIndex !== null ? currentReading[selectedCardIndex] : null;
  
  // 카드 배치 위치 생성 (중앙 정렬 개선된 레이아웃)
  const getCardPositions = (spread: SpreadTypeExtended) => {
    const { cardCount, id } = spread;
    
    // 스프레드별 최적화된 배치 (중앙 정렬)
    switch (id) {
      case 'one-card':
        // 1카드 - 완전 중앙 배치
        return [{
          id: 'center',
          name: '현재 상황',
          x: 50,
          y: 50
        }];
        
      case 'three-card':
        // 3카드 - 중앙 기준 균등 분배 (30% 간격으로 조정)
        return [
          { id: 'past', name: '과거', x: 20, y: 50 },
          { id: 'present', name: '현재', x: 50, y: 50 },
          { id: 'future', name: '미래', x: 80, y: 50 }
        ];
        
      case 'four-elements':
        // 4카드 - 중앙 기준 균등 분배 (더 넓은 간격으로 조정)
        return [
          { id: 'fire', name: '불 (열정)', x: 15, y: 50 },
          { id: 'water', name: '물 (감정)', x: 38, y: 50 },
          { id: 'air', name: '공기 (생각)', x: 62, y: 50 },
          { id: 'earth', name: '땅 (물질)', x: 85, y: 50 }
        ];
        
      case 'five-card-v':
        // 5카드 - V자 형태, 중앙 기준 대칭
        return [
          { id: 'distant-past', name: '먼 과거', x: 15, y: 25 },
          { id: 'recent-past', name: '최근 과거', x: 35, y: 40 },
          { id: 'present', name: '현재', x: 50, y: 55 },
          { id: 'near-future', name: '가까운 미래', x: 65, y: 40 },
          { id: 'distant-future', name: '먼 미래', x: 85, y: 25 }
        ];
        
      case 'celtic-cross':
        // 켈틱 크로스 - 컴팩트한 십자가 + 세로 기둥 형태
        return [
          { id: 'present', name: '현재 상황', x: 35, y: 50 },
          { id: 'cross', name: '장애물/도전', x: 55, y: 50 },
          { id: 'foundation', name: '먼 과거/기반', x: 35, y: 70 },
          { id: 'past', name: '최근 과거', x: 15, y: 50 },
          { id: 'crown', name: '가능한 결과', x: 35, y: 30 },
          { id: 'future', name: '가까운 미래', x: 75, y: 50 },
          { id: 'approach', name: '당신의 접근법', x: 85, y: 70 },
          { id: 'external', name: '외부 영향', x: 85, y: 58 },
          { id: 'hopes-fears', name: '희망과 두려움', x: 85, y: 42 },
          { id: 'outcome', name: '최종 결과', x: 85, y: 30 }
        ];
        
      case 'relationship-spread':
        // 관계 스프레드 - 중앙 기준 대칭 배치 (Y축 간격 조정)
        return [
          { id: 'you', name: '당신', x: 25, y: 25 },
          { id: 'other', name: '상대방', x: 75, y: 25 },
          { id: 'relationship', name: '관계 자체', x: 50, y: 10 },
          { id: 'you-bring', name: '당신이 가져오는 것', x: 25, y: 60 },
          { id: 'they-bring', name: '상대방이 가져오는 것', x: 75, y: 60 },
          { id: 'common', name: '공통점', x: 50, y: 42 },
          { id: 'future', name: '잠재적 미래', x: 50, y: 78 }
        ];
        
      case 'choice-spread':
        // 선택 스프레드 - 중앙 기준 대칭 A/B 구조
        return [
          { id: 'current', name: '현재 상황', x: 50, y: 15 },
          { id: 'option-a', name: '선택 A', x: 30, y: 35 },
          { id: 'option-b', name: '선택 B', x: 70, y: 35 },
          { id: 'know', name: '알아야 할 것', x: 50, y: 55 },
          { id: 'outcome-a', name: '결과 A', x: 30, y: 75 },
          { id: 'outcome-b', name: '결과 B', x: 70, y: 75 }
        ];
        
      default:
        // 기본값: 원본 레이아웃 사용하되 중앙 정렬 보정
        const originalPositions = spread.layout.map(position => ({
          id: position.id,
          name: position.nameKr,
          x: position.x,
          y: position.y
        }));
        
        // 카드 수에 따른 자동 중앙 정렬
        if (cardCount <= 3) {
          // 3장 이하는 가로 일렬
          return originalPositions.map((pos, index) => ({
            ...pos,
            x: 25 + (index * 25), // 25%, 50%, 75%
            y: 50
          }));
        } else if (cardCount <= 5) {
          // 5장 이하는 V자 형태로 자동 배치
          return originalPositions.map((pos, index) => {
            const positions = [
              { x: 20, y: 30 },
              { x: 35, y: 45 },
              { x: 50, y: 60 },
              { x: 65, y: 45 },
              { x: 80, y: 30 }
            ];
            return {
              ...pos,
              x: positions[index]?.x || 50,
              y: positions[index]?.y || 50
            };
          });
        }
        
        return originalPositions;
    }
  };

  // 스프레드별 카드 크기 설정 (2:3 비율로 개선)
  const getCardSize = (spread: SpreadTypeExtended) => {
    const { cardCount, id } = spread;
    
    switch (id) {
      case 'one-card':
        // 1카드는 더 크게 (2:3 비율)
        return { width: 'w-28', height: 'h-42' }; // 112px x 168px (2:3)
        
      case 'three-card':
        // 3카드는 표준 크기 (2:3 비율)
        return { width: 'w-20', height: 'h-30' }; // 80px x 120px (2:3)
        
      case 'four-elements':
        // 4카드는 작게 (2:3 비율)
        return { width: 'w-18', height: 'h-[108px]' }; // 72px x 108px (2:3)
        
      case 'five-card-v':
        // 5카드는 작게 (2:3 비율)
        return { width: 'w-16', height: 'h-24' }; // 64px x 96px (2:3)
        
      case 'celtic-cross':
        // 10카드는 매우 작게 (2:3 비율)
        return { width: 'w-12', height: 'h-[72px]' }; // 48px x 72px (2:3)
        
      case 'relationship-spread':
        // 7카드는 작게 (2:3 비율)
        return { width: 'w-16', height: 'h-24' }; // 64px x 96px (2:3)
        
      case 'choice-spread':
        // 6카드는 작게 (2:3 비율)
        return { width: 'w-16', height: 'h-24' }; // 64px x 96px (2:3)
        
      default:
        // 카드 수에 따른 동적 크기 결정 (2:3 비율 유지)
        if (cardCount === 1) return { width: 'w-28', height: 'h-42' };
        if (cardCount <= 3) return { width: 'w-20', height: 'h-30' };
        if (cardCount <= 5) return { width: 'w-18', height: 'h-[108px]' };
        if (cardCount <= 7) return { width: 'w-16', height: 'h-24' };
        return { width: 'w-12', height: 'h-[72px]' }; // 8장 이상
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-cosmic-gradient">
      {/* 신비로운 배경 효과 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{zIndex: 1}}>
        <motion.div 
          className="absolute top-20 left-10 w-2 h-2 bg-brand-accent rounded-full"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
            x: [-3, 3, -3]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="absolute top-40 right-16 w-1.5 h-1.5 bg-brand-accent/80 rounded-full"
          animate={{ 
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.3, 1],
            y: [5, -5, 5]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        />
        <motion.div 
          className="absolute bottom-32 left-20 w-3 h-3 bg-brand-accent/60 rounded-full"
          animate={{ 
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.1, 1],
            y: [-2, 2, -2]
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 2.5 }}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative safe-area-pt pb-24" style={{zIndex: 10}}>
        
        {/* 헤더 - 스프레드 선택 화면에서만 표시 */}
        {!selectedSpread && (
          <motion.div 
            className="pt-8 pb-6 px-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="relative inline-flex items-center justify-center w-14 h-14 mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-aurum-glow" />
              <Icon name="layout-template" className="w-8 h-8 text-brand-accent relative z-10" />
            </motion.div>
            
            <h1 className="text-3xl font-semibold text-gradient mb-2">
              신성한 스프레드
            </h1>
            
            <p className="text-white/70 text-sm">
              다차원적 통찰을 위한 타로 스프레드를 선택해보세요
            </p>
          </motion.div>
        )}

        <div className={selectedSpread ? "px-4 space-y-4 pt-4" : "px-6 space-y-6"}>
          
          {/* 스프레드 선택 화면 */}
          {!selectedSpread && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              
              {/* 무료 스프레드 섹션 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="unlock" className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">무료 스프레드</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freeSpreads.map((spread) => (
                    <motion.button
                      key={spread.id}
                      onClick={() => handleSpreadSelect(spread)}
                      className="card-mystical p-5 text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors">
                          {spread.nameKr}
                        </h3>
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full">
                          {spread.cardCount}장
                        </span>
                      </div>
                      
                      <p className="text-white/70 text-sm leading-relaxed">
                        {spread.descriptionKr}
                      </p>
                      
                      <div className="flex items-center mt-3 text-brand-accent/80 text-sm">
                        <Icon name="arrow-right" className="w-4 h-4 mr-1" />
                        <span>시작하기</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 프리미엄 스프레드 섹션 */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="crown" className="w-5 h-5 text-brand-accent" />
                  <h2 className="text-lg font-semibold text-white">프리미엄 스프레드</h2>
                  {!isPremiumUser && (
                    <span className="bg-brand-accent/20 text-brand-accent text-xs px-2 py-1 rounded-full">
                      업그레이드 필요
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {premiumSpreads.map((spread) => (
                    <motion.button
                      key={spread.id}
                      onClick={() => handleSpreadSelect(spread)}
                      disabled={!isPremiumUser}
                      className={`
                        card-mystical p-5 text-left group relative
                        ${!isPremiumUser ? 'opacity-60' : ''}
                      `}
                      whileHover={isPremiumUser ? { scale: 1.02 } : {}}
                      whileTap={isPremiumUser ? { scale: 0.98 } : {}}
                    >
                      {/* 프리미엄 오버레이 */}
                      {!isPremiumUser && (
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 rounded-large flex items-center justify-center">
                          <div className="bg-brand-accent/90 text-brand-primary px-3 py-1 rounded-lg text-xs font-medium">
                            프리미엄
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`
                          font-semibold transition-colors
                          ${isPremiumUser 
                            ? 'text-white group-hover:text-brand-accent' 
                            : 'text-white/70'
                          }
                        `}>
                          {spread.nameKr}
                        </h3>
                        <span className="bg-brand-accent/20 text-brand-accent text-xs px-2 py-1 rounded-full">
                          {spread.cardCount}장
                        </span>
                      </div>
                      
                      <p className="text-white/70 text-sm leading-relaxed">
                        {spread.descriptionKr}
                      </p>
                      
                      {isPremiumUser && (
                        <div className="flex items-center mt-3 text-brand-accent/80 text-sm">
                          <Icon name="arrow-right" className="w-4 h-4 mr-1" />
                          <span>시작하기</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 스프레드 리딩 화면 */}
          {selectedSpread && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* 헤더 네비게이션 */}
              <div className="card-mystical p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={resetReading}
                    className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                  >
                    <Icon name="chevron-left" className="w-5 h-5" />
                    <span className="text-sm">뒤로가기</span>
                  </button>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    <h2 className="text-lg font-semibold text-white">
                      {selectedSpread.nameKr}
                    </h2>
                  </div>
                  
                  <div className="flex items-start">
                    {selectedSpread.isPremium && (
                      <div className="flex items-center space-x-1 text-brand-accent text-xs bg-brand-accent/10 px-2 py-1 rounded-full">
                        <Icon name="crown" className="w-3 h-3" />
                        <span>프리미엄</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 리딩 제목 입력 - 상단으로 이동 */}
                {hasDrawnCards && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 border-t border-white/10 pt-4"
                  >
                    <label className="text-white/70 text-sm font-medium flex items-center space-x-2">
                      <Icon name="edit-3" className="w-4 h-4" />
                      <span>리딩 제목</span>
                    </label>
                    <input
                      type="text"
                      value={readingTitle}
                      onChange={(e) => setReadingTitle(e.target.value)}
                      className="w-full bg-dark-bg-primary/50 border border-brand-accent/20 rounded-lg p-3 text-white placeholder-white/50 focus:border-brand-accent/50 focus:outline-none transition-colors"
                      placeholder="이 리딩에 제목을 지어주세요"
                      maxLength={100}
                    />
                  </motion.div>
                )}
              </div>

              {/* 스프레드 레이아웃 영역 */}
              <div className="card-mystical p-4">
                {/* 카드 표시 영역 (중앙 정렬) */}
                <div className="relative w-full h-[450px] mb-6 flex items-center justify-center">
                  <div className="relative w-full max-w-2xl h-full">
                  {!hasDrawnCards ? (
                    // 카드 뽑기 전 - 윤곽선 표시
                    getCardPositions(selectedSpread).map((position, index) => {
                      const cardSize = getCardSize(selectedSpread);
                      return (
                        <motion.div
                          key={position.id}
                          className={`absolute rounded-lg border border-dashed border-brand-accent/40 bg-white/5 flex items-center justify-center ${cardSize.width} ${cardSize.height} aspect-[2/3]`}
                          style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                        </motion.div>
                      );
                    })
                  ) : (
                    // 카드 뽑기 후 - 실제 카드 표시 (개선된 레이아웃 위치 사용)
                    currentReading.map((spreadCard, index) => {
                      const positions = getCardPositions(selectedSpread);
                      const position = positions[index] || { x: 50, y: 50, name: spreadCard.position.nameKr };
                      const cardSize = getCardSize(selectedSpread);
                      
                      return (
                        <motion.button
                          key={`${spreadCard.position.id}-${index}`}
                          onClick={() => handleCardClick(index)}
                          className={`absolute rounded-lg overflow-hidden border border-brand-accent/60 hover:border-brand-accent hover:scale-105 transition-all duration-200 cursor-pointer ${cardSize.width} ${cardSize.height} aspect-[2/3]`}
                          style={{
                            left: `${position.x}%`,
                            top: `${position.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <img
                            src={spreadCard.card.imageUrl}
                            alt={spreadCard.card.nameKr}
                            className="w-full h-full object-contain bg-gradient-to-br from-brand-primary/10 to-brand-primary/20"
                            style={{
                              imageRendering: 'crisp-edges'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 to-transparent" />
                          
                        </motion.button>
                      );
                    })
                  )}
                  </div>
                </div>
                
                {/* 액션 버튼 영역 (카드 영역 외부) */}
                <div className="flex flex-col space-y-3">
                  {!hasDrawnCards ? (
                    // 카드 뽑기 버튼
                    <motion.button
                      onClick={drawCards}
                      disabled={isDrawing}
                      className="btn-mystical flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isDrawing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Icon name="sparkles" className="w-5 h-5" />
                          </motion.div>
                          <span>카드를 뽑고 있습니다...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Icon name="zap" className="w-5 h-5" />
                          <span>카드 뽑기</span>
                        </div>
                      )}
                    </motion.button>
                  ) : (
                    // 다시뽑기 & 저장하기 버튼
                    <div className="flex space-x-3">
                      <motion.button
                        onClick={redrawCards}
                        disabled={isDrawing}
                        className="bg-white/10 hover:bg-white/20 border border-brand-accent/30 hover:border-brand-accent/60 text-brand-accent flex-1 py-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Icon name="shuffle" className="w-5 h-5" />
                          <span>다시 뽑기</span>
                        </div>
                      </motion.button>
                      
                      <motion.button
                        onClick={saveCurrentReading}
                        disabled={isSaving || !readingTitle.trim()}
                        className="btn-mystical flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSaving ? (
                          <div className="flex items-center justify-center space-x-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Icon name="save" className="w-5 h-5" />
                            </motion.div>
                            <span>저장 중...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Icon name="save" className="w-5 h-5" />
                            <span>저장하기</span>
                          </div>
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 스프레드가 선택되었을 때만 표시되는 영역 */}
          {selectedSpread && (
            <>
              {/* 개인적인 해석 메모 */}
              {hasDrawnCards && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="card-mystical p-6 space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="edit-3" className="w-5 h-5 text-brand-accent" />
                    <h3 className="text-lg font-semibold text-white">개인적인 해석</h3>
                  </div>
                  
                  <textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    className="w-full h-32 bg-dark-bg-primary/50 border border-brand-accent/20 rounded-lg p-4 text-white placeholder-white/50 focus:border-brand-accent/50 focus:outline-none resize-none transition-colors"
                    placeholder="이 스프레드에서 느낀 점을 기록해보세요..."
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/40">
                      {personalNotes.length}/500자
                    </span>
                  </div>
                </motion.div>
              )}

              {/* 신비로운 인용구 */}
              <div className="card-mystical p-6 mt-8 bg-white/5 border border-white/10">
                <p className="text-white/80 text-sm italic text-center leading-relaxed">
                  "카드는 답을 주지 않는다. 질문을 더 명확하게 할 뿐이다."
                </p>
              </div>
            </>
          )}
        </div>

        {/* 카드 확대 모달 */}
        {showCardDetail && selectedCardIndex !== null && currentReading[selectedCardIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={closeCardDetail}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-dark-bg-primary/95 backdrop-blur-lg border border-brand-accent/30 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={closeCardDetail}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <Icon name="x" className="w-4 h-4 text-white" />
              </button>

              {/* 카드 이미지 */}
              <div className="mb-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative w-full h-80 rounded-lg overflow-hidden border border-brand-accent/30 bg-gradient-to-br from-brand-primary/10 to-brand-primary/20"
                >
                  <img
                    src={currentReading[selectedCardIndex].card.imageUrl}
                    alt={currentReading[selectedCardIndex].card.nameKr}
                    className="w-full h-full object-contain"
                    style={{
                      imageRendering: 'crisp-edges'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/60 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </div>

              {/* 카드 정보 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {/* 포지션 */}
                <div className="text-center">
                  <span className="inline-block bg-brand-accent/20 text-brand-accent px-3 py-1 rounded-full text-sm font-medium">
                    {currentReading[selectedCardIndex].position.nameKr}
                  </span>
                </div>

                {/* 카드 이름 */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {currentReading[selectedCardIndex].card.nameKr}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {currentReading[selectedCardIndex].card.name}
                  </p>
                </div>

                {/* 카드 설명 */}
                {currentReading[selectedCardIndex].card.description && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-white/80 text-sm leading-relaxed text-center">
                      {currentReading[selectedCardIndex].card.description}
                    </p>
                  </div>
                )}

                {/* 키워드 */}
                {currentReading[selectedCardIndex].card.keywords && currentReading[selectedCardIndex].card.keywords.length > 0 && (
                  <div className="text-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentReading[selectedCardIndex].card.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-brand-accent/10 text-brand-accent px-2 py-1 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Spread;