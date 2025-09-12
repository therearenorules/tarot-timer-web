// components/TarotSpread.tsx - 타로 스프레드 컴포넌트
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Animated } from 'react-native';
import { TarotCard, TarotUtils, SavedSpread } from '../utils/tarotData';
import { Icon } from './Icon';
import { GradientButton } from './GradientButton';
import { TarotCardComponent } from './TarotCard';
import { 
  Colors, 
  GlassStyles, 
  ShadowStyles, 
  TextStyles, 
  CompositeStyles,
  Spacing,
  BorderRadius 
} from './DesignSystem';
import { useFadeIn, useCardEntrance, useTouchFeedback } from './AnimationUtils';

export interface SpreadPosition {
  id: number;
  name: string;
  nameEn: string;
  description: string;
  card: TarotCard | null;
  x?: number;
  y?: number;
}

export type SpreadType = 'one-card' | 'three-card' | 'four-card' | 'five-card' | 'celtic-cross' | 'cup-of-relationship' | 'choice';

export interface SpreadLayout {
  id: SpreadType;
  name: string;
  nameEn: string;
  description: string;
  positions: SpreadPosition[];
}

// 다양한 스프레드 레이아웃 정의 (명세서 기준 7가지 정확히 구현)
const SPREAD_LAYOUTS: SpreadLayout[] = [
  {
    id: 'one-card',
    name: '🎯 원 카드 타로',
    nameEn: 'One Card Tarot',
    description: '간단한 질문이나 오늘의 메시지',
    positions: [
      { id: 1, name: '메시지', nameEn: 'Message', description: '우주가 전하는 지혜', card: null, x: 50, y: 50 }
    ]
  },
  {
    id: 'three-card',
    name: '⚖️ 쓰리 카드 스프레드',
    nameEn: 'Three Card Spread',
    description: '과거-현재-미래의 흐름 파악',
    positions: [
      { id: 1, name: '과거', nameEn: 'Past', description: '과거의 영향과 배경', card: null, x: 25, y: 50 },
      { id: 2, name: '현재', nameEn: 'Present', description: '현재 상황과 에너지', card: null, x: 50, y: 50 },
      { id: 3, name: '미래', nameEn: 'Future', description: '미래의 가능성과 방향', card: null, x: 75, y: 50 }
    ]
  },
  {
    id: 'four-card',
    name: '🔮 포 카드 스프레드',
    nameEn: 'Four Card Spread',
    description: '상황의 네 가지 측면 분석',
    positions: [
      { id: 1, name: '현재 상황', nameEn: 'Current Situation', description: '지금의 전체적인 상황', card: null, x: 25, y: 30 },
      { id: 2, name: '장애물', nameEn: 'Obstacles', description: '극복해야 할 도전', card: null, x: 75, y: 30 },
      { id: 3, name: '조언', nameEn: 'Advice', description: '필요한 행동이나 자세', card: null, x: 25, y: 70 },
      { id: 4, name: '결과', nameEn: 'Outcome', description: '예상되는 결과', card: null, x: 75, y: 70 }
    ]
  },
  {
    id: 'five-card',
    name: '✨ 파이브 카드 V 스프레드',
    nameEn: 'Five Card V Spread',
    description: '현재 상황의 다면적 분석',
    positions: [
      { id: 1, name: '현재 상황', nameEn: 'Present', description: '중심이 되는 현재 상황', card: null, x: 50, y: 65 },
      { id: 2, name: '과거 영향', nameEn: 'Past Influence', description: '영향을 미친 과거', card: null, x: 30, y: 40 },
      { id: 3, name: '미래 가능성', nameEn: 'Future Possibility', description: '다가올 가능성', card: null, x: 70, y: 40 },
      { id: 4, name: '숨겨진 요소', nameEn: 'Hidden Factor', description: '보이지 않는 영향', card: null, x: 15, y: 15 },
      { id: 5, name: '최종 결과', nameEn: 'Final Outcome', description: '최종적인 결과', card: null, x: 85, y: 15 }
    ]
  },
  {
    id: 'celtic-cross',
    name: '🌟 켈틱 크로스',
    nameEn: 'Celtic Cross',
    description: '종합적이고 깊이 있는 분석',
    positions: [
      { id: 1, name: '현재 상황', nameEn: 'Present Situation', description: '지금의 상황과 에너지', card: null, x: 35, y: 45 },
      { id: 2, name: '도전과 장애', nameEn: 'Cross/Challenge', description: '극복해야 할 도전', card: null, x: 55, y: 45 },
      { id: 3, name: '원인', nameEn: 'Distant Past', description: '상황의 근본 원인', card: null, x: 15, y: 45 },
      { id: 4, name: '가능한 결과', nameEn: 'Possible Outcome', description: '가능한 미래', card: null, x: 35, y: 20 },
      { id: 5, name: '최근 과거', nameEn: 'Recent Past', description: '최근의 영향', card: null, x: 35, y: 70 },
      { id: 6, name: '가까운 미래', nameEn: 'Near Future', description: '다가올 변화', card: null, x: 75, y: 45 },
      { id: 7, name: '당신의 접근', nameEn: 'Your Approach', description: '당신의 태도와 방법', card: null, x: 80, y: 70 },
      { id: 8, name: '외부 영향', nameEn: 'External Influences', description: '주변 환경의 영향', card: null, x: 80, y: 50 },
      { id: 9, name: '희망과 두려움', nameEn: 'Hopes & Fears', description: '내면의 희망과 걱정', card: null, x: 80, y: 30 },
      { id: 10, name: '최종 결과', nameEn: 'Final Outcome', description: '최종적인 결과', card: null, x: 80, y: 10 }
    ]
  },
  {
    id: 'cup-of-relationship',
    name: '💖 컵오브릴레이션쉽 스프레드',
    nameEn: 'Cup of Relationship Spread',
    description: '인간관계, 연애 문제',
    positions: [
      { id: 1, name: '당신의 감정', nameEn: 'Your Feelings', description: '당신의 현재 감정', card: null, x: 15, y: 15 },
      { id: 2, name: '상대의 감정', nameEn: 'Their Feelings', description: '상대방의 감정', card: null, x: 85, y: 15 },
      { id: 3, name: '관계의 기초', nameEn: 'Foundation', description: '관계의 토대', card: null, x: 50, y: 25 },
      { id: 4, name: '과거의 영향', nameEn: 'Past Influence', description: '과거가 미치는 영향', card: null, x: 15, y: 40 },
      { id: 5, name: '현재의 상황', nameEn: 'Present Situation', description: '지금의 관계 상태', card: null, x: 50, y: 40 },
      { id: 6, name: '미래의 가능성', nameEn: 'Future Potential', description: '앞으로의 가능성', card: null, x: 85, y: 40 },
      { id: 7, name: '장애물', nameEn: 'Obstacles', description: '관계의 걸림돌', card: null, x: 15, y: 55 },
      { id: 8, name: '조언', nameEn: 'Advice', description: '관계 개선을 위한 조언', card: null, x: 50, y: 55 },
      { id: 9, name: '외부 영향', nameEn: 'External Factors', description: '주변의 영향', card: null, x: 85, y: 55 },
      { id: 10, name: '숨겨진 요소', nameEn: 'Hidden Elements', description: '보이지 않는 요소', card: null, x: 30, y: 75 },
      { id: 11, name: '최종 결과', nameEn: 'Final Outcome', description: '관계의 최종 결과', card: null, x: 70, y: 75 }
    ]
  },
  {
    id: 'choice',
    name: '🤔 AB 선택 스프레드',
    nameEn: 'AB Choice Spread',
    description: '두 가지 선택지 중 결정',
    positions: [
      { id: 1, name: '상황', nameEn: 'Situation', description: '현재 상황', card: null, x: 50, y: 15 },
      { id: 2, name: 'A 선택지', nameEn: 'Choice A', description: '첫 번째 선택', card: null, x: 25, y: 35 },
      { id: 3, name: 'A 결과', nameEn: 'A Outcome', description: 'A 선택의 결과', card: null, x: 25, y: 55 },
      { id: 4, name: 'A 조언', nameEn: 'A Advice', description: 'A 선택 시 조언', card: null, x: 25, y: 75 },
      { id: 5, name: 'B 선택지', nameEn: 'Choice B', description: '두 번째 선택', card: null, x: 75, y: 35 },
      { id: 6, name: 'B 결과', nameEn: 'B Outcome', description: 'B 선택의 결과', card: null, x: 75, y: 55 },
      { id: 7, name: 'B 조언', nameEn: 'B Advice', description: 'B 선택 시 조언', card: null, x: 75, y: 75 }
    ]
  }
];

export const TarotSpread: React.FC = () => {
  const [selectedSpread, setSelectedSpread] = useState<SpreadLayout | null>(null);
  const [question, setQuestion] = useState('');
  const [spreadCards, setSpreadCards] = useState<SpreadPosition[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [readingTitle, setReadingTitle] = useState('');
  const [insights, setInsights] = useState('');
  const [currentSpreadType, setCurrentSpreadType] = useState<SpreadType>('one-card');
  
  // 저장 관련 상태
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveInsights, setSaveInsights] = useState('');
  const [savedSpreads, setSavedSpreads] = useState<SavedSpread[]>([]);
  const [isLoadModalVisible, setIsLoadModalVisible] = useState(false);

  // 애니메이션 훅들
  const { animatedStyle: headerFadeIn } = useFadeIn({ delay: 100 });
  const { animatedStyle: cardEntranceAnimation } = useCardEntrance(200);
  
  // 스프레드 리스트를 위한 훅들을 미리 준비
  const touchFeedbackHooks = SPREAD_LAYOUTS.map(() => useTouchFeedback());
  const cardEntranceHooks = SPREAD_LAYOUTS.map((_, index) => useCardEntrance(index * 100 + 300));

  // 컴포넌트 마운트 시 저장된 스프레드 불러오기
  useEffect(() => {
    loadSavedSpreadsData();
  }, []);

  // 저장된 스프레드 목록 불러오기
  const loadSavedSpreadsData = async () => {
    try {
      const spreads = await TarotUtils.loadSavedSpreads();
      setSavedSpreads(spreads);
    } catch (error) {
      console.error('저장된 스프레드 불러오기 실패:', error);
    }
  };

  // 스프레드 저장하기
  const handleSaveSpread = async () => {
    if (!saveTitle.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    // 뽑은 카드가 있는지 확인
    const drawnCards = spreadCards.filter(position => position.card !== null);
    if (drawnCards.length === 0) {
      Alert.alert('오류', '저장할 카드가 없습니다. 먼저 카드를 뽑아주세요.');
      return;
    }

    try {
      const currentLayout = SPREAD_LAYOUTS.find(layout => layout.id === currentSpreadType);
      if (!currentLayout) return;

      const spreadToSave: SavedSpread = {
        id: TarotUtils.generateId(),
        title: saveTitle.trim(),
        spreadType: currentLayout.id,
        spreadName: currentLayout.name,
        spreadNameEn: currentLayout.nameEn,
        positions: spreadCards.map(position => ({
          id: position.id,
          name: position.name,
          nameEn: position.nameEn,
          description: position.description,
          card: position.card,
          x: position.x,
          y: position.y
        })),
        insights: saveInsights.trim(),
        createdAt: new Date().toISOString(),
        tags: ['스프레드', currentLayout.name]
      };

      await TarotUtils.saveSpread(spreadToSave);
      
      // 저장 완료 후 상태 초기화
      setSaveTitle('');
      setSaveInsights('');
      setIsSaveModalVisible(false);
      
      // 저장된 스프레드 목록 다시 불러오기
      await loadSavedSpreadsData();
      
      Alert.alert(
        '✨ 저장 완료!',
        `"${saveTitle}" 스프레드가 저널에 저장되었습니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('스프레드 저장 실패:', error);
      Alert.alert('오류', '스프레드 저장 중 문제가 발생했습니다.');
    }
  };

  // 저장된 스프레드 불러오기
  const handleLoadSpread = (savedSpread: SavedSpread) => {
    try {
      // 스프레드 타입 변경
      setCurrentSpreadType(savedSpread.spreadType as SpreadType);
      
      // 해당 레이아웃 찾기
      const layout = SPREAD_LAYOUTS.find(l => l.id === savedSpread.spreadType);
      if (!layout) {
        Alert.alert('오류', '지원하지 않는 스프레드 타입입니다.');
        return;
      }

      // 저장된 카드 정보로 스프레드 복원
      const restoredSpread = layout.positions.map(position => {
        const savedPosition = savedSpread.positions.find(p => p.id === position.id);
        return {
          ...position,
          card: savedPosition?.card || null
        };
      });

      setSpreadCards(restoredSpread);
      setIsLoadModalVisible(false);
      setSelectedPosition(null);

      Alert.alert(
        '📖 불러오기 완료!',
        `"${savedSpread.title}" 스프레드를 불러왔습니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('스프레드 불러오기 실패:', error);
      Alert.alert('오류', '스프레드 불러오기 중 문제가 발생했습니다.');
    }
  };

  // 저장된 스프레드 삭제
  const handleDeleteSpread = async (spreadId: string, title: string) => {
    Alert.alert(
      '삭제 확인',
      `"${title}" 스프레드를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await TarotUtils.deleteSpread(spreadId);
              await loadSavedSpreadsData();
              Alert.alert('삭제 완료', '스프레드가 삭제되었습니다.');
            } catch (error) {
              console.error('스프레드 삭제 실패:', error);
              Alert.alert('오류', '스프레드 삭제 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 전체 스프레드 뽑기
  const drawFullSpread = async () => {
    setIsDrawing(true);
    try {
      const newCards = TarotUtils.getRandomCards(spreadCards.length);
      const updatedSpread = spreadCards.map((position, index) => ({
        ...position,
        card: newCards[index]
      }));
      
      setSpreadCards(updatedSpread);
      setSelectedPosition(null);
      
      Alert.alert(
        `🔮 ${selectedSpread?.name} 완성!`,
        `${selectedSpread?.description}`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('스프레드 뽑기 실패:', error);
      Alert.alert('오류', '카드를 뽑는 중 문제가 발생했습니다.');
    } finally {
      setIsDrawing(false);
    }
  };

  // 개별 카드 뽑기
  const drawSingleCard = (positionId: number) => {
    const randomCard = TarotUtils.getRandomCards(1)[0];
    const updatedSpread = spreadCards.map(position => 
      position.id === positionId 
        ? { ...position, card: randomCard }
        : position
    );
    setSpreadCards(updatedSpread);
    setSelectedPosition(null);
  };

  // 스프레드 초기화
  const resetSpread = () => {
    const resetSpread = spreadCards.map(position => ({
      ...position,
      card: null
    }));
    setSpreadCards(resetSpread);
    setSelectedPosition(null);
  };

  // 카드 선택 처리
  const handleCardPress = (positionId: number, hasCard: boolean) => {
    if (hasCard) {
      // 이미 카드가 있는 경우 - 카드 정보 표시
      setSelectedPosition(selectedPosition === positionId ? null : positionId);
    } else {
      // 카드가 없는 경우 - 새 카드 뽑기
      drawSingleCard(positionId);
    }
  };

  const hasAnyCards = spreadCards.some(position => position.card !== null);
  const selectedCard = selectedPosition ? spreadCards.find(p => p.id === selectedPosition) : null;

  // 스프레드 선택 화면
  if (!selectedSpread) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Animated.View style={[styles.headerContainer, headerFadeIn]}>
          <Text style={styles.subtitle}>"우주의 메시지를 받을 준비하세요"</Text>
        </Animated.View>

        {/* 스프레드 리스트 (세로 배치) */}
        <View style={styles.spreadList}>
          {SPREAD_LAYOUTS.map((layout, index) => {
            const isPremium = layout.id === 'love';
            const { onPressIn, onPressOut, animatedStyle: touchFeedback } = touchFeedbackHooks[index];
            const { animatedStyle: cardEntrance } = cardEntranceHooks[index];
            
            return (
              <Animated.View key={layout.id} style={[cardEntrance]}>
                <TouchableOpacity
                  style={[
                    styles.spreadCard,
                    isPremium && styles.spreadCardPremium
                  ]}
                  onPress={() => {
                  if (isPremium) {
                    Alert.alert(
                      '💎 프리미엄 기능',
                      '이 스프레드는 프리미엄 기능입니다.\n무료 스프레드를 이용해보세요!',
                      [
                        { text: '확인', style: 'default' },
                      ]
                    );
                  } else {
                    setSelectedSpread(layout);
                    setSpreadCards([...layout.positions]);
                    setCurrentSpreadType(layout.id);
                  }
                }}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={0.8}
              >
                <Animated.View style={[touchFeedback]}>
                  <View style={styles.spreadCardHeader}>
                  <Text style={[
                    styles.spreadCardTitle,
                    isPremium && styles.spreadCardTitlePremium
                  ]}>
                    {layout.name}
                  </Text>
                  {isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>[👑PRO]</Text>
                    </View>
                  )}
                  {!isPremium && (
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeText}>[FREE]</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.spreadCardSubtitle}>{layout.nameEn}</Text>
                <Text style={styles.spreadCardDesc}>{layout.description}</Text>
                
                <View style={styles.spreadCardFooter}>
                  <GradientButton
                    title="🔮 리딩 시작하기"
                    icon="play"
                    size="medium"
                    onPress={() => {
                      if (isPremium) {
                        Alert.alert(
                          '💎 프리미엄 기능',
                          '이 스프레드는 프리미엄 기능입니다.\n무료 스프레드를 이용해보세요!',
                          [{ text: '확인', style: 'default' }]
                        );
                      } else {
                        setSelectedSpread(layout);
                        setSpreadCards([...layout.positions]);
                        setCurrentSpreadType(layout.id);
                      }
                    }}
                    disabled={isPremium}
                  />
                  </View>
                </Animated.View>
              </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* 프리미엄 안내 카드 */}
        <Animated.View style={[styles.premiumInfoCard, cardEntranceAnimation]}>
          <Text style={styles.premiumInfoTitle}>💎 프리미엄 기능</Text>
          <Text style={styles.premiumInfoText}>
            더 다양한 스프레드와 고급 기능을{"\n"}프리미엄으로 만나보세요
          </Text>
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.spreadContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.spreadHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setSelectedSpread(null);
              setSpreadCards([]);
              setQuestion('');
              setReadingTitle('');
              setInsights('');
              setSelectedPosition(null);
            }}
          >
            <Icon name="arrow-left" size={20} color="#f4d03f" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.spreadTitle}>{selectedSpread.name.replace(/[🎯⚖️🔮✨🌟💖🤔]/g, '').trim()}</Text>
            <Text style={styles.spreadSubtitle}>카드 {spreadCards.filter(p => p.card).length} / {spreadCards.length}</Text>
          </View>
        </View>

        {/* 카드 배치 영역 - 중앙 집중형 레이아웃 */}
        <View style={styles.cardSpreadArea}>
          <View style={styles.cardGrid}>
            {spreadCards.map((position) => (
              <View 
                key={position.id} 
                style={[
                  styles.cardPosition,
                  { 
                    position: 'absolute',
                    left: `${position.x || 50}%`, 
                    top: `${position.y || 50}%`,
                    transform: [
                      { translateX: -50 }, 
                      { translateY: -75 }
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.cardSlot}
                  onPress={() => handleCardPress(position.id, position.card !== null)}
                  activeOpacity={0.8}
                >
                  <TarotCardComponent
                    card={position.card}
                    size="small"
                    showText={false}
                    showBack={position.card === null}
                  />
                  <View style={styles.positionIndicator}>
                    <Text style={styles.positionNumber}>{position.id}</Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.positionLabel}>{position.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 선택된 카드 상세 정보 */}
        {selectedCard && selectedCard.card && (
          <View style={styles.selectedCardInfo}>
            <View style={styles.cardInfoHeader}>
              <Icon name="star" size={16} color="#f4d03f" />
              <Text style={styles.cardInfoTitle}>{selectedCard.name}</Text>
            </View>
            <Text style={styles.cardName}>{selectedCard.card.nameKr}</Text>
            <Text style={styles.cardNameEn}>({selectedCard.card.name})</Text>
            <Text style={styles.cardMeaning}>{selectedCard.card.meaningKr}</Text>
          </View>
        )}

        {/* 저장 모달들 */}
        <Modal
          visible={isSaveModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsSaveModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Icon name="bookmark" size={24} color="#f4d03f" />
                <Text style={styles.modalTitle}>스프레드 저장</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setIsSaveModalVisible(false)}
                >
                  <Icon name="x" size={20} color="#9b8db8" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>제목 *</Text>
                <TextInput
                  style={styles.textInput}
                  value={saveTitle}
                  onChangeText={setSaveTitle}
                  placeholder="스프레드 제목을 입력하세요"
                  placeholderTextColor="#666"
                  maxLength={50}
                />
                
                <Text style={styles.inputLabel}>인사이트</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={saveInsights}
                  onChangeText={setSaveInsights}
                  placeholder="이 스프레드에서 얻은 인사이트나 해석을 기록하세요 (선택사항)"
                  placeholderTextColor="#666"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                
                <View style={styles.modalActions}>
                  <GradientButton
                    onPress={() => setIsSaveModalVisible(false)}
                    title="취소"
                    variant="secondary"
                    size="medium"
                  />
                  <GradientButton
                    onPress={handleSaveSpread}
                    title="저장"
                    icon="save"
                    size="medium"
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isLoadModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsLoadModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Icon name="book-open" size={24} color="#f4d03f" />
                <Text style={styles.modalTitle}>저장된 스프레드</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setIsLoadModalVisible(false)}
                >
                  <Icon name="x" size={20} color="#9b8db8" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {savedSpreads.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="bookmark" size={48} color="#666" />
                    <Text style={styles.emptyStateText}>저장된 스프레드가 없습니다</Text>
                    <Text style={styles.emptyStateSubText}>
                      카드를 뽑고 "스프레드 저장" 버튼을 눌러 스프레드를 저장해보세요
                    </Text>
                  </View>
                ) : (
                  savedSpreads.map((savedSpread) => (
                    <View key={savedSpread.id} style={styles.savedSpreadItem}>
                      <TouchableOpacity
                        style={styles.savedSpreadContent}
                        onPress={() => handleLoadSpread(savedSpread)}
                      >
                        <View style={styles.savedSpreadHeader}>
                          <Text style={styles.savedSpreadTitle}>{savedSpread.title}</Text>
                          <Text style={styles.savedSpreadType}>{savedSpread.spreadName}</Text>
                        </View>
                        <Text style={styles.savedSpreadDate}>
                          {new Date(savedSpread.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        {savedSpread.insights && (
                          <Text style={styles.savedSpreadInsights} numberOfLines={2}>
                            {savedSpread.insights}
                          </Text>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteSpread(savedSpread.id, savedSpread.title)}
                      >
                        <Icon name="trash-2" size={16} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* 하단 액션 버튼들 */}
      <View style={styles.bottomActions}>
        <GradientButton
          onPress={drawFullSpread}
          title={isDrawing ? '뽑는 중...' : '⚡ 전체 카드 뽑기'}
          disabled={isDrawing}
          size="large"
          style={styles.primaryButton}
        />
        
        <View style={styles.secondaryActions}>
          {hasAnyCards && (
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setIsSaveModalVisible(true)}
            >
              <Icon name="folder-open" size={16} color="#9b8db8" />
              <Text style={styles.secondaryButtonText}>스프레드 저장</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setIsLoadModalVisible(true)}
          >
            <Icon name="book-open" size={16} color="#9b8db8" />
            <Text style={styles.secondaryButtonText}>저널</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  spreadContainer: {
    padding: Spacing.lg,
    paddingBottom: 120, // 하단 버튼 공간 확보
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  
  // 스프레드 선택 화면 스타일
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  mainTitle: {
    ...TextStyles.goldTitle,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...TextStyles.subtitle,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  spreadList: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  spreadCard: {
    ...GlassStyles.card,
    ...ShadowStyles.medium,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.brand.accent,
  },
  spreadCardPremium: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(26, 22, 37, 0.7)',
    opacity: 0.8,
  },
  spreadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  spreadCardTitle: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    flex: 1,
  },
  spreadCardTitlePremium: {
    color: Colors.text.disabled,
  },
  spreadCardSubtitle: {
    ...TextStyles.caption,
    color: Colors.text.accent,
    marginBottom: Spacing.xs,
  },
  spreadCardDesc: {
    ...TextStyles.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.md,
  },
  spreadCardFooter: {
    alignItems: 'center',
  },
  freeBadge: {
    backgroundColor: Colors.brand.accent + '33',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
  },
  freeText: {
    color: Colors.brand.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumBadge: {
    backgroundColor: Colors.brand.secondary + '4D',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.brand.secondary,
  },
  premiumText: {
    color: Colors.brand.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  premiumInfoCard: {
    ...CompositeStyles.infoCard,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  premiumInfoTitle: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    marginBottom: Spacing.sm,
  },
  premiumInfoText: {
    ...TextStyles.body,
    color: Colors.text.accent,
    textAlign: 'center',
  },

  // 스프레드 상세 화면 스타일
  spreadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.3)',
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  spreadTitle: {
    ...TextStyles.title,
    color: Colors.brand.accent,
    textAlign: 'center',
  },
  spreadSubtitle: {
    ...TextStyles.caption,
    color: Colors.text.accent,
    marginTop: Spacing.xxs,
  },

  // 카드 배치 영역
  cardSpreadArea: {
    flex: 1,
    minHeight: 600,
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    padding: Spacing.lg,
  },
  cardGrid: {
    flex: 1,
    position: 'relative',
  },
  cardPosition: {
    alignItems: 'center',
  },
  cardSlot: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  positionIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    backgroundColor: Colors.brand.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  positionNumber: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  positionLabel: {
    ...TextStyles.overline,
    color: Colors.brand.accent,
    textAlign: 'center',
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.small,
    maxWidth: 90,
    fontSize: 10,
    lineHeight: 12,
  },

  // 선택된 카드 정보
  selectedCardInfo: {
    ...GlassStyles.card,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
  },
  cardInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardInfoTitle: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    marginLeft: Spacing.xs,
  },
  cardName: {
    ...TextStyles.headline,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  cardNameEn: {
    ...TextStyles.body,
    color: Colors.text.accent,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cardMeaning: {
    ...TextStyles.body,
    color: Colors.text.accent,
    textAlign: 'center',
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.medium,
  },

  // 하단 액션 버튼들
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 12, 27, 0.95)',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 208, 63, 0.3)',
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(155, 141, 184, 0.2)',
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(155, 141, 184, 0.3)',
  },
  secondaryButtonText: {
    color: '#9b8db8',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },

  // 모달 스타일들 (기존과 동일)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    ...GlassStyles.card,
    ...ShadowStyles.extreme,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: Colors.brand.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.soft,
  },
  modalTitle: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    flex: 1,
    textAlign: 'center',
    marginLeft: Spacing.lg,
  },
  modalCloseButton: {
    padding: Spacing.xxs,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  inputLabel: {
    ...TextStyles.headline,
    color: Colors.brand.accent,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  textInput: {
    ...CompositeStyles.textInput,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  // 저장된 스프레드 목록 스타일들
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    ...TextStyles.headline,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyStateSubText: {
    ...TextStyles.body,
    color: Colors.text.disabled,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  savedSpreadItem: {
    flexDirection: 'row',
    ...GlassStyles.card,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  savedSpreadContent: {
    flex: 1,
    padding: Spacing.md,
  },
  savedSpreadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  savedSpreadTitle: {
    ...TextStyles.headline,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  savedSpreadType: {
    ...TextStyles.caption,
    color: Colors.brand.accent,
    backgroundColor: Colors.brand.accent + '1A',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.brand.accent + '4D',
  },
  savedSpreadDate: {
    ...TextStyles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.xs,
  },
  savedSpreadInsights: {
    ...TextStyles.body,
    color: Colors.text.accent,
    fontStyle: 'italic',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6b6b1A',
    paddingHorizontal: Spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: '#ff6b6b33',
  },
  
  // AB 선택 스프레드 헤더 스타일
  choiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  choiceSection: {
    flex: 1,
    alignItems: 'center',
  },
  choiceLabel: {
    ...TextStyles.title,
    color: Colors.brand.accent,
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(244, 208, 63, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default TarotSpread;