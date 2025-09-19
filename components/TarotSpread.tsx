// components/TarotSpread.tsx - 타로 스프레드 컴포넌트
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TarotCard, TarotUtils, SavedSpread } from '../utils/tarotData';
import { LanguageUtils } from '../i18n/index';
import { useTarotI18n } from '../hooks/useTarotI18n';
import LocalStorageManager, { PremiumStatus } from '../utils/localStorage';
import AdManager from '../utils/adManager';
import { Icon } from './Icon';
import { GradientButton } from './GradientButton';
import { TarotCardComponent } from './TarotCard';
import AdBanner from './AdBanner';
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
  // 상대적 위치 시스템을 위한 새로운 속성들
  isCenter?: boolean;        // 중심 카드 여부
  relativeTo?: number;       // 기준이 되는 카드 ID
  offsetX?: number;          // X축 오프셋
  offsetY?: number;          // Y축 오프셋
}

export type SpreadType = 'three-card' | 'four-card' | 'five-card' | 'celtic-cross' | 'cup-of-relationship' | 'choice';

export interface SpreadLayout {
  id: SpreadType;
  name: string;
  nameEn: string;
  description: string;
  positions: SpreadPosition[];
}

// 스프레드 레이아웃을 동적으로 생성하는 함수
const getSpreadLayouts = (t: any): SpreadLayout[] => [
  // 원카드 스프레드 숨김 처리
  // {
  //   id: 'one-card',
  //   name: `🎯 ${t('spread.types.singleCard')}`,
  //   nameEn: 'One Card Tarot',
  //   description: t('spread.descriptions.singleCard'),
  //   positions: [
  //     { id: 1, name: t('spread.positions.message'), nameEn: 'Message', description: t('spread.descriptions.message'), card: null, x: 35, y: 20 }
  //   ]
  // },
  {
    id: 'three-card',
    name: `⚖️ ${t('spread.types.threeCard')}`,
    nameEn: 'Three Card Spread',
    description: t('spread.descriptions.threeCard'),
    positions: [
      { id: 1, name: t('spread.positions.past'), nameEn: 'Past', description: t('spread.descriptions.pastInfluence'), card: null, x: 15, y: 50 },
      { id: 2, name: t('spread.positions.present'), nameEn: 'Present', description: t('spread.descriptions.presentSituation'), card: null, x: 50, y: 50 },
      { id: 3, name: t('spread.positions.future'), nameEn: 'Future', description: t('spread.descriptions.futurePossibility'), card: null, x: 85, y: 50 }
    ]
  },
  {
    id: 'four-card',
    name: `🔮 ${t('spread.types.fourCard')}`,
    nameEn: 'Four Card Spread',
    description: t('spread.descriptions.fourCard'),
    positions: [
      { id: 1, name: t('spread.positions.currentSituation'), nameEn: 'Current Situation', description: t('spread.descriptions.presentSituation'), card: null, x: 10.5, y: 50 },
      { id: 2, name: t('spread.positions.obstacles'), nameEn: 'Obstacles', description: t('spread.descriptions.challenge'), card: null, x: 36.5, y: 50 },
      { id: 3, name: t('spread.positions.advice'), nameEn: 'Advice', description: t('spread.descriptions.advice'), card: null, x: 63.5, y: 50 },
      { id: 4, name: t('spread.positions.outcome'), nameEn: 'Outcome', description: t('spread.descriptions.outcome'), card: null, x: 89.5, y: 50 }
    ]
  },
  {
    id: 'five-card',
    name: `✨ ${t('spread.types.fiveCard')}`,
    nameEn: 'Five Card V Spread',
    description: t('spread.descriptions.fiveCard'),
    positions: [
      { id: 1, name: t('spread.positions.present'), nameEn: 'Present', description: t('spread.descriptions.presentSituation'), card: null, x: 50, y: 70 },
      { id: 2, name: t('spread.positions.past'), nameEn: 'Past Influence', description: t('spread.descriptions.pastInfluence'), card: null, x: 30, y: 45 },
      { id: 3, name: t('spread.positions.future'), nameEn: 'Future Possibility', description: t('spread.descriptions.futurePossibility'), card: null, x: 70, y: 45 },
      { id: 4, name: t('spread.positions.internal'), nameEn: 'Hidden Factor', description: t('spread.descriptions.pastInfluence'), card: null, x: 20, y: 20 },
      { id: 5, name: t('spread.positions.outcome'), nameEn: 'Final Outcome', description: t('spread.descriptions.futurePossibility'), card: null, x: 80, y: 20 }
    ]
  },
  {
    id: 'celtic-cross',
    name: `🌟 ${t('spread.types.celticCross')}`,
    nameEn: 'Celtic Cross',
    description: t('spread.descriptions.celticCross'),
    positions: [
      { id: 1, name: t('spread.positions.present'), nameEn: 'Present Situation', description: t('spread.descriptions.presentSituation'), card: null, x: 40, y: 50 },
      { id: 2, name: t('spread.positions.challenge'), nameEn: 'Obstacles', description: t('spread.descriptions.challenge'), card: null, x: 40, y: 50 },
      { id: 3, name: t('spread.positions.situation'), nameEn: 'Core Issue', description: t('spread.descriptions.presentSituation'), card: null, x: 40, y: 75 },
      { id: 4, name: t('spread.positions.past'), nameEn: 'Past', description: t('spread.descriptions.pastInfluence'), card: null, x: 20, y: 50 },
      { id: 5, name: t('spread.positions.present'), nameEn: 'Present', description: t('spread.descriptions.presentSituation'), card: null, x: 40, y: 25 },
      { id: 6, name: t('spread.positions.future'), nameEn: 'Future', description: t('spread.descriptions.futurePossibility'), card: null, x: 60, y: 50 },
      { id: 7, name: t('spread.positions.internal'), nameEn: 'Your Perspective', description: t('spread.descriptions.presentSituation'), card: null, x: 85, y: 75 },
      { id: 8, name: t('spread.positions.external'), nameEn: 'External Situation', description: t('spread.descriptions.pastInfluence'), card: null, x: 85, y: 55 },
      { id: 9, name: t('spread.positions.hopes'), nameEn: 'Hopes & Fears', description: t('spread.descriptions.futurePossibility'), card: null, x: 85, y: 35 },
      { id: 10, name: t('spread.positions.outcome'), nameEn: 'Final Prediction', description: t('spread.descriptions.futurePossibility'), card: null, x: 85, y: 15 }
    ]
  },
  {
    id: 'cup-of-relationship',
    name: `💖 ${t('spread.types.relationship')}`,
    nameEn: 'Cup of Relationship Spread',
    description: t('spread.descriptions.relationship'),
    positions: [
      { id: 1, name: t('spread.positions.internal'), nameEn: 'Your Feelings', description: t('spread.descriptions.presentSituation'), card: null, x: 25, y: 90 },
      { id: 2, name: t('spread.positions.external'), nameEn: 'Their Feelings', description: t('spread.descriptions.pastInfluence'), card: null, x: 85, y: 90 },
      { id: 3, name: t('spread.positions.situation'), nameEn: 'Foundation', description: t('spread.descriptions.presentSituation'), card: null, x: 55, y: 90 },
      { id: 4, name: t('spread.positions.past'), nameEn: 'Past Influence', description: t('spread.descriptions.pastInfluence'), card: null, x: 55, y: 70 },
      { id: 5, name: t('spread.positions.present'), nameEn: 'Present Situation', description: t('spread.descriptions.presentSituation'), card: null, x: 55, y: 45 },
      { id: 6, name: t('spread.positions.future'), nameEn: 'Future Potential', description: t('spread.descriptions.futurePossibility'), card: null, x: 70, y: 62 },
      { id: 7, name: t('spread.positions.obstacles'), nameEn: 'Obstacles', description: t('spread.descriptions.challenge'), card: null, x: 40, y: 30 },
      { id: 8, name: t('spread.positions.advice'), nameEn: 'Advice', description: t('spread.descriptions.advice'), card: null, x: 70, y: 30 },
      { id: 9, name: t('spread.positions.external'), nameEn: 'External Factors', description: t('spread.descriptions.pastInfluence'), card: null, x: 25, y: 15 },
      { id: 10, name: t('spread.positions.internal'), nameEn: 'Hidden Elements', description: t('spread.descriptions.presentSituation'), card: null, x: 85, y: 15 },
      { id: 11, name: t('spread.positions.outcome'), nameEn: 'Final Outcome', description: t('spread.descriptions.futurePossibility'), card: null, x: 55, y: 15 }
    ]
  },
  {
    id: 'choice',
    name: `🤔 ${t('spread.types.choice')}`,
    nameEn: 'AB Choice Spread',
    description: t('spread.descriptions.choice'),
    positions: [
      { id: 1, name: 'A', nameEn: 'A', description: t('spread.descriptions.choice'), card: null, x: 20, y: 20 },
      { id: 2, name: 'A', nameEn: 'A', description: t('spread.descriptions.choice'), card: null, x: 20, y: 50 },
      { id: 3, name: 'A', nameEn: 'A', description: t('spread.descriptions.choice'), card: null, x: 20, y: 80 },
      { id: 4, name: 'B', nameEn: 'B', description: t('spread.descriptions.choice'), card: null, x: 80, y: 20 },
      { id: 5, name: 'B', nameEn: 'B', description: t('spread.descriptions.choice'), card: null, x: 80, y: 50 },
      { id: 6, name: 'B', nameEn: 'B', description: t('spread.descriptions.choice'), card: null, x: 80, y: 80 },
      { id: 7, name: t('spread.positions.advice'), nameEn: 'Advice', description: t('spread.descriptions.advice'), card: null, x: 50, y: 50 }
    ]
  }
];

export const TarotSpread: React.FC = () => {
  const { t } = useTranslation();
  const { getCardName, getCardMeaning, isEnglish } = useTarotI18n();
  
  // 동적으로 생성된 스프레드 레이아웃
  const SPREAD_LAYOUTS = getSpreadLayouts(t);
  
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
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);

  // 애니메이션 훅들
  const { animatedStyle: headerFadeIn } = useFadeIn({ delay: 100 });
  const { animatedStyle: cardEntranceAnimation } = useCardEntrance(200);
  
  // 스프레드 리스트를 위한 훅들을 미리 준비
  const touchFeedbackHooks = SPREAD_LAYOUTS.map(() => useTouchFeedback());
  const cardEntranceHooks = SPREAD_LAYOUTS.map((_, index) => useCardEntrance(index * 100 + 300));

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    loadSavedSpreadsData();
    loadPremiumStatus();
    initializeAdManager();
  }, []);

  // 광고 매니저 초기화
  const initializeAdManager = async () => {
    try {
      await AdManager.initialize();
      console.log('📺 AdManager 초기화 완료');
    } catch (error) {
      console.error('📺 AdManager 초기화 실패:', error);
    }
  };

  // 프리미엄 상태 불러오기
  const loadPremiumStatus = async () => {
    try {
      const status = await LocalStorageManager.getPremiumStatus();
      setPremiumStatus(status);
    } catch (error) {
      console.error('프리미엄 상태 확인 실패:', error);
    }
  };

  // 프리미엄이 필요한 스프레드인지 확인
  const isPremiumSpread = (spreadId: SpreadType): boolean => {
    const premiumSpreads: SpreadType[] = ['celtic-cross', 'cup-of-relationship', 'choice'];
    return premiumSpreads.includes(spreadId);
  };

  // 사용자가 프리미엄 권한을 가지고 있는지 확인
  const hasPremiumAccess = (): boolean => {
    return premiumStatus?.is_premium === true;
  };

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
      Alert.alert(t('common.error'), t('spread.errors.enterTitle'));
      return;
    }

    // 뽑은 카드가 있는지 확인
    const drawnCards = spreadCards.filter(position => position.card !== null);
    if (drawnCards.length === 0) {
      Alert.alert(t('common.error'), t('spread.errors.noCardsToSave'));
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
        '✨ ' + t('spread.messages.saveSuccess'),
        t('spread.messages.saveComplete', { title: saveTitle }),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('스프레드 저장 실패:', error);
      Alert.alert(t('common.error'), t('spread.errors.saveFailed'));
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
        Alert.alert(t('common.error'), t('spread.errors.unsupportedType'));
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
        '📖 ' + t('spread.messages.loadSuccess'),
        t('spread.messages.loadComplete', { title: savedSpread.title }),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('스프레드 불러오기 실패:', error);
      Alert.alert(t('common.error'), t('spread.errors.loadFailed'));
    }
  };

  // 저장된 스프레드 삭제
  const handleDeleteSpread = async (spreadId: string, title: string) => {
    Alert.alert(
      t('spread.deleteConfirm.title'),
      t('spread.deleteConfirm.message', { title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await TarotUtils.deleteSpread(spreadId);
              await loadSavedSpreadsData();
              Alert.alert(t('spread.messages.deleteComplete'), t('spread.messages.deleteSuccess'));
            } catch (error) {
              console.error('스프레드 삭제 실패:', error);
              Alert.alert(t('common.error'), t('spread.errors.deleteFailed'));
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
      const newCards = TarotUtils.getRandomCardsNoDuplicates(spreadCards.length);
      const updatedSpread = spreadCards.map((position, index) => ({
        ...position,
        card: newCards[index]
      }));

      setSpreadCards(updatedSpread);
      setSelectedPosition(null);

      // 액션 카운터 증가 (전면광고 표시 로직)
      await AdManager.incrementActionCounter();

      Alert.alert(
        `🔮 ${selectedSpread?.name} ${t('spread.messages.complete')}!`,
        `${selectedSpread?.description}`,
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('스프레드 뽑기 실패:', error);
      Alert.alert(t('common.error'), t('spread.errors.drawFailed'));
    } finally {
      setIsDrawing(false);
    }
  };

  // 개별 카드 뽑기
  const drawSingleCard = async (positionId: number) => {
    // 현재 스프레드에서 이미 뽑힌 카드들을 제외하고 뽑기
    const usedCards = spreadCards.filter(pos => pos.card !== null).map(pos => pos.card!);
    const availableCards = TarotUtils.getAllCards().filter(card =>
      !usedCards.some(usedCard => usedCard.id === card.id)
    );

    const randomCard = availableCards.length > 0
      ? availableCards[Math.floor(Math.random() * availableCards.length)]
      : TarotUtils.getRandomCard(); // fallback to any card if all used

    const updatedSpread = spreadCards.map(position =>
      position.id === positionId
        ? { ...position, card: randomCard }
        : position
    );
    setSpreadCards(updatedSpread);
    setSelectedPosition(null);

    // 액션 카운터 증가 (전면광고 표시 로직)
    await AdManager.incrementActionCounter();
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
  const handleCardPress = async (positionId: number, hasCard: boolean) => {
    if (hasCard) {
      // 이미 카드가 있는 경우 - 카드 정보 표시
      setSelectedPosition(selectedPosition === positionId ? null : positionId);
    } else {
      // 카드가 없는 경우 - 새 카드 뽑기
      await drawSingleCard(positionId);
    }
  };

  const hasAnyCards = spreadCards.some(position => position.card !== null);
  const selectedCard = selectedPosition ? spreadCards.find(p => p.id === selectedPosition) : null;

  // 카드 수에 따른 동적 사이즈 결정
  const getCardSizeBySpreadType = () => {
    // 켈틱크로스는 small보다 약간 큰 크기 사용
    if (currentSpreadType === 'celtic-cross') return 'small';

    const cardCount = spreadCards.length;
    if (cardCount === 1) return 'extra-large';     // 원 카드
    if (cardCount === 3) return 'small-medium';    // 쓰리 카드 - small에서 small-medium으로 한 단계 증가
    if (cardCount === 4) return 'small-medium';    // 포 카드 - small에서 small-medium으로 한 단계 증가
    if (cardCount === 5) return 'small-medium';    // 파이브 카드 - 한 단계 축소
    if (cardCount <= 7) return 'small-medium';     // AB 선택
    return 'small';                                // 컵오브릴레이션십 (11장)
  };

  // 스프레드별 배경 스타일 결정
  const getSpreadAreaStyle = () => {
    switch (currentSpreadType) {
      case 'one-card':
        return styles.cardSpreadAreaOneCard;
      case 'three-card':
        return styles.cardSpreadAreaThreeCard;
      case 'four-card':
        return styles.cardSpreadAreaFourCard;
      case 'five-card':
        return styles.cardSpreadAreaFiveCard;
      case 'choice':
        return styles.cardSpreadAreaChoice;
      case 'celtic-cross':
      case 'cup-of-relationship':
        return styles.cardSpreadAreaLarge;
      default:
        return styles.cardSpreadAreaLarge;
    }
  };

  // 스프레드 선택 화면
  if (!selectedSpread) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
      >

        {/* 스프레드 리스트 (세로 배치) */}
        <View style={styles.spreadList}>
          {SPREAD_LAYOUTS.map((layout, index) => {
            const isLayoutPremium = isPremiumSpread(layout.id);
            const hasAccess = hasPremiumAccess();
            const isLocked = isLayoutPremium && !hasAccess;
            const { onPressIn, onPressOut, animatedStyle: touchFeedback } = touchFeedbackHooks[index];
            const { animatedStyle: cardEntrance } = cardEntranceHooks[index];
            
            return (
              <Animated.View key={layout.id} style={[cardEntrance]}>
                <TouchableOpacity
                  style={[
                    styles.spreadCard,
                    isLocked && styles.spreadCardPremium
                  ]}
                  onPress={() => {
                  if (isLocked) {
                    Alert.alert(
                      '💎 ' + t('spread.premium.title'),
                      t('spread.premium.message'),
                      [
                        { text: t('common.ok'), style: 'default' },
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
                    isLocked && styles.spreadCardTitlePremium
                  ]}>
                    {layout.name.replace(/[🎯⚖️🔮✨🌟💖🤔]/g, '').trim()}
                  </Text>
                  {isLocked && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumText}>PREMIUM</Text>
                    </View>
                  )}
                  {!isLayoutPremium && (
                    <View style={styles.freeBadge}>
                      <Text style={styles.freeText}>FREE</Text>
                    </View>
                  )}
                  {isLayoutPremium && hasAccess && (
                    <View style={styles.premiumUnlockedBadge}>
                      <Text style={styles.premiumUnlockedText}>PREMIUM ✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.spreadCardSubtitle}>{layout.nameEn}</Text>
                <Text style={styles.spreadCardDesc}>{layout.description}</Text>
                
                <View style={styles.spreadCardFooter}>
                  <GradientButton
                    title={t('spread.actions.start')}
                    size="medium"
                    onPress={() => {
                      if (isLocked) {
                        Alert.alert(
                          '💎 ' + t('spread.premium.title'),
                          t('spread.premium.message'),
                          [{ text: t('common.ok'), style: 'default' }]
                        );
                      } else {
                        setSelectedSpread(layout);
                        setSpreadCards([...layout.positions]);
                        setCurrentSpreadType(layout.id);
                      }
                    }}
                    disabled={isLocked}
                  />
                  </View>
                </Animated.View>
              </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* 무료 사용자 배너 광고 */}
        {!hasPremiumAccess() && (
          <View style={styles.adBannerContainer}>
            <AdBanner size="banner" style={styles.adBanner} />
          </View>
        )}

        {/* 프리미엄 안내 카드 */}
        <Animated.View style={[styles.premiumInfoCard, cardEntranceAnimation]}>
          <Text style={styles.premiumInfoTitle}>💎 {t('spread.premium.title')}</Text>
          <Text style={styles.premiumInfoText}>
            {t('spread.premium.infoText')}
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
            <Icon name="chevron-left" size={20} color="#f4d03f" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.spreadTitle}>{selectedSpread.name.replace(/[🎯⚖️🔮✨🌟💖🤔]/g, '').trim()}</Text>
            <Text style={styles.spreadSubtitle}>{t('spread.cardCount', { drawn: spreadCards.filter(p => p.card).length, total: spreadCards.length })}</Text>
          </View>
        </View>

        {/* 카드 배치 영역 - 스프레드별 최적화 레이아웃 */}
        <View style={[
          styles.cardSpreadArea,
          getSpreadAreaStyle()
        ]}>
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
                    marginLeft: -50, 
                    marginTop: -75,
                    // 켈틱 크로스에서 2번 카드를 1번 카드 위에 겹치도록 z-index 설정
                    zIndex: currentSpreadType === 'celtic-cross' && position.id === 2 ? 10 : 1
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.cardSlot}
                  onPress={() => handleCardPress(position.id, position.card !== null)}
                  activeOpacity={0.8}
                >
                  <View style={currentSpreadType === 'celtic-cross' && position.id === 2 ? styles.rotatedCard : null}>
                    <TarotCardComponent
                      card={position.card}
                      size={getCardSizeBySpreadType()}
                      showText={false}
                      showBack={position.card === null}
                      noBorder={currentSpreadType === 'celtic-cross' || currentSpreadType === 'cup-of-relationship'}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 선택된 카드 상세 정보 */}
        {selectedCard && selectedCard.card && (
          <View style={styles.selectedCardInfo}>
            <Text style={styles.cardName}>{getCardName(selectedCard.card)}</Text>
            {!isEnglish && (
              <Text style={styles.cardNameEn}>({selectedCard.card.name})</Text>
            )}
            <Text style={styles.cardMeaning}>{getCardMeaning(selectedCard.card)}</Text>
          </View>
        )}

        {/* 무료 사용자 배너 광고 (스프레드 상세 화면) */}
        {!hasPremiumAccess() && (
          <View style={styles.adBannerContainer}>
            <AdBanner size="banner" style={styles.adBanner} />
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
                <Text style={styles.modalTitle}>{t('spread.saveModal.title')}</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setIsSaveModalVisible(false)}
                >
                  <Icon name="x" size={20} color="#9b8db8" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalContent}>
                <Text style={styles.inputLabel}>{t('spread.saveModal.titleLabel')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={saveTitle}
                  onChangeText={setSaveTitle}
                  placeholder={t('spread.saveModal.titlePlaceholder')}
                  placeholderTextColor="#666"
                  maxLength={50}
                />
                
                <Text style={styles.inputLabel}>{t('spread.saveModal.insightsLabel')}</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={saveInsights}
                  onChangeText={setSaveInsights}
                  placeholder={t('spread.saveModal.insightsPlaceholder')}
                  placeholderTextColor="#666"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                
                <View style={styles.modalActions}>
                  <GradientButton
                    onPress={() => setIsSaveModalVisible(false)}
                    title={t('common.cancel')}
                    variant="secondary"
                    size="medium"
                  />
                  <GradientButton
                    onPress={handleSaveSpread}
                    title={t('common.save')}
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
                <Text style={styles.modalTitle}>{t('spread.loadModal.title')}</Text>
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
                    <Text style={styles.emptyStateText}>{t('spread.loadModal.emptyTitle')}</Text>
                    <Text style={styles.emptyStateSubText}>
                      {t('spread.loadModal.emptySubtitle')}
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
                          {LanguageUtils.formatDateTime(new Date(savedSpread.createdAt))}
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
        <View style={styles.horizontalButtonContainer}>
          <GradientButton
            onPress={() => setIsSaveModalVisible(true)}
            title={t('spread.actions.saveSpread')}
            size="medium"
            style={[styles.halfButton, styles.saveButton]}
          />

          <GradientButton
            onPress={drawFullSpread}
            title={isDrawing ? t('spread.drawing') : t('spread.actions.drawCards')}
            disabled={isDrawing}
            size="medium"
            style={styles.halfButton}
          />
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
    paddingHorizontal: Spacing.xxs, // 4px → 2px로 더 축소하여 골드 윤곽선 영역 추가 확장
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  spreadContainer: {
    padding: Spacing.xxs, // 4px → 2px로 더 축소하여 골드 윤곽선 영역 추가 확장
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
  premiumUnlockedBadge: {
    backgroundColor: Colors.brand.accent + '4D',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
  },
  premiumUnlockedText: {
    color: Colors.brand.accent,
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

  // 광고 배너 스타일
  adBannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  adBanner: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.medium,
    overflow: 'hidden',
  },

  // 스프레드 상세 화면 스타일
  spreadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.3)',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: Spacing.sm,
    zIndex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 60, // 뒤로가기 버튼 공간만큼 양쪽에 패딩 추가
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

  // 카드 배치 영역 - 2024-2025 모든 스마트폰 최적화
  cardSpreadArea: {
    flex: 1,
    minHeight: 250,
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.large,
    borderWidth: 2,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    padding: Spacing.lg,
    // 모든 기기 대응 반응형 폭 설정 - 골드 윤곽선 전체 폭 사용
    minWidth: 320, // 최소 폭 증가 (280px → 320px, 약 14% 증가)
    maxWidth: '100%', // 전체 폭 사용
    alignSelf: 'stretch', // 전체 폭 사용 (center → stretch)
  },
  cardSpreadAreaLarge: {
    minHeight: 630, // 켈틱크로스와 컵오브릴레이션십에서 더 큰 높이 (700px → 630px, 10% 감소)
  },
  // 스프레드별 최적화된 배경 스타일 - 전체 폭 사용
  cardSpreadAreaOneCard: {
    minHeight: 400, // 원카드 골드 윤곽선 크기 확장 (200px → 400px, 100% 증가)
    maxWidth: '100%', // 90% → 100% (전체 폭 사용)
    alignSelf: 'stretch',
  },
  cardSpreadAreaThreeCard: {
    minHeight: 220, // 3카드 최적화
    maxWidth: '100%', // 전체 폭 사용
    alignSelf: 'stretch',
  },
  cardSpreadAreaFourCard: {
    minHeight: 240, // 4카드 최적화
    maxWidth: '100%', // 전체 폭 사용
    alignSelf: 'stretch',
  },
  cardSpreadAreaFiveCard: {
    minHeight: 473, // 5카드는 V자 형태로 더 높이 필요 (364px → 473px, 추가 30% 증가)
    maxWidth: '100%', // 전체 폭 사용
    alignSelf: 'stretch',
  },
  cardSpreadAreaChoice: {
    minHeight: 553, // A/B 선택 최적화 (527px → 553px, 추가 5% 증가)
    maxWidth: '100%', // 전체 폭 사용
    alignSelf: 'stretch',
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
  rotatedCardSlot: {
    // 회전된 카드를 위한 추가 공간
  },
  cardContainer: {
    // 카드를 감싸는 컨테이너
  },
  rotatedCard: {
    transform: [{ rotate: '90deg' }], // 켈틱 크로스 2번 카드 90도 회전
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
    maxWidth: 80,
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

  // 선택된 카드 정보
  selectedCardInfo: {
    ...GlassStyles.card,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
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
    bottom: '5%', // 위로 5% 올림
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // 투명 배경
    padding: Spacing.lg,
    borderTopWidth: 0, // 경계선 제거
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
  horizontalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  saveButton: {
    opacity: 0.7,
  },
  transparentButton: {
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(15, 12, 27, 0.95)',
    borderRadius: BorderRadius.large,
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