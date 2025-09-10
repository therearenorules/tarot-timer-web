import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput, Animated } from 'react-native';
import { TarotCard, TarotUtils, DailyTarotSave, simpleStorage, STORAGE_KEYS } from './utils/tarotData';
import { Icon } from './components/Icon';
import { SacredGeometryBackground } from './components/SacredGeometryBackground';
import { MysticalTexture } from './components/MysticalTexture';
// import { FloatingParticles } from './components/FloatingParticles';
import { GradientButton } from './components/GradientButton';
import { TarotCardComponent } from './components/TarotCard';
import { TarotSpread } from './components/TarotSpread';
import { TarotJournal } from './components/TarotJournal';
import { TarotSettings } from './components/TarotSettings';
import { 
  Colors, 
  GlassStyles, 
  ShadowStyles, 
  TextStyles, 
  CompositeStyles,
  Spacing,
  BorderRadius 
} from './components/DesignSystem';
import { 
  useTouchFeedback,
  useFadeIn,
  useCardEntrance,
  usePulse 
} from './components/AnimationUtils';

// 24시간 타로 타이머 컴포넌트
function TarotTimer() {
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyCards, setDailyCards] = useState<TarotCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [cardMemos, setCardMemos] = useState<Record<number, string>>({});

  // 애니메이션 훅들
  const { animatedStyle: headerFadeStyle } = useFadeIn({ delay: 100 });
  const { animatedStyle: cardDetailStyle } = useCardEntrance(200);
  const { animatedStyle: pulseStyle } = usePulse();

  // 1분마다 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // 컴포넌트가 마운트될 때 오늘의 카드 로드
    loadTodayCards();

    return () => clearInterval(timer);
  }, []);

  // 첫 카드가 로드되면 현재 시간 카드 선택
  useEffect(() => {
    if (dailyCards.length > 0 && selectedCardIndex === null) {
      setSelectedCardIndex(currentTime.getHours());
    }
  }, [dailyCards, selectedCardIndex, currentTime]);

  // 오늘의 카드 로드
  const loadTodayCards = async () => {
    try {
      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
      const savedData = await simpleStorage.getItem(storageKey);
      
      if (savedData) {
        const dailySave: DailyTarotSave = JSON.parse(savedData);
        setDailyCards(dailySave.hourlyCards);
        setCardMemos(dailySave.memos || {});
      }
    } catch (error) {
      console.error('카드 로드 실패:', error);
    }
  };

  // 24시간 카드 뽑기
  const drawDailyCards = async () => {
    // 이미 카드가 있는 경우 확인 다이얼로그 표시
    if (hasCardsForToday) {
      Alert.alert(
        '🔄 새로운 24장 카드 뽑기',
        '이미 오늘의 카드가 있습니다. 새로운 24장 카드로 교체하시겠습니까?\n\n⚠️ 기존 카드와 메모가 모두 새로운 카드로 교체됩니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '새로 뽑기',
            style: 'destructive',
            onPress: () => performDrawDailyCards()
          }
        ]
      );
    } else {
      performDrawDailyCards();
    }
  };

  // 실제 카드 뽑기 실행
  const performDrawDailyCards = async () => {
    setIsLoading(true);
    try {
      // 24장의 랜덤 카드 생성
      const newCards = TarotUtils.getRandomCards(24);
      setDailyCards(newCards);
      
      // 현재 시간 카드 선택
      const currentHour = currentTime.getHours();
      setSelectedCardIndex(currentHour);

      // 저장
      await saveDailyCards(newCards);
      
      Alert.alert(
        '🔮 운명의 24장 완성!',
        `오늘 하루의 타로 카드가 준비되었습니다.\n현재 ${currentHour}시의 카드: ${newCards[currentHour].nameKr}`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('카드 뽑기 실패:', error);
      Alert.alert('오류', '카드를 뽑는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 개별 카드 다시 뽑기
  const redrawSingleCard = async (hourIndex: number) => {
    const currentCardName = dailyCards[hourIndex]?.nameKr || '알 수 없는 카드';
    
    Alert.alert(
      '🔄 카드 다시 뽑기',
      `${TarotUtils.formatHour(hourIndex)}의 "${currentCardName}" 카드를 새로운 카드로 교체하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '다시 뽑기',
          onPress: async () => {
            try {
              const newCard = TarotUtils.getRandomCards(1)[0];
              const updatedCards = [...dailyCards];
              updatedCards[hourIndex] = newCard;
              
              setDailyCards(updatedCards);
              
              
              // 저장
              await saveDailyCards(updatedCards);
              
              Alert.alert(
                '✨ 새로운 카드!',
                `${TarotUtils.formatHour(hourIndex)}의 새로운 카드: ${newCard.nameKr}`,
                [{ text: '확인' }]
              );
            } catch (error) {
              console.error('개별 카드 뽑기 실패:', error);
              Alert.alert('오류', '카드를 다시 뽑는 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 일일 카드 저장
  const saveDailyCards = async (cards: TarotCard[]) => {
    try {
      const today = TarotUtils.getTodayDateString();
      
      // 기존 데이터가 있으면 memos와 insights 보존
      const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
      const existingData = await simpleStorage.getItem(storageKey);
      let existingMemos = {};
      let existingInsights = '';
      
      if (existingData) {
        const existing: DailyTarotSave = JSON.parse(existingData);
        existingMemos = existing.memos || {};
        existingInsights = existing.insights || '';
      }
      
      const dailySave: DailyTarotSave = {
        id: `daily_${today}`,
        date: today,
        hourlyCards: cards,
        memos: cardMemos,
        insights: existingInsights,
        savedAt: new Date().toISOString()
      };

      await simpleStorage.setItem(storageKey, JSON.stringify(dailySave));
    } catch (error) {
      console.error('카드 저장 실패:', error);
    }
  };

  // 카드 메모 업데이트
  const updateCardMemo = async (hourIndex: number, memo: string) => {
    const updatedMemos = { ...cardMemos, [hourIndex]: memo };
    setCardMemos(updatedMemos);
    
    // 자동 저장
    setTimeout(async () => {
      await saveDailyCards(dailyCards);
    }, 1000);
  };

  // 일일 타로 리딩 저장
  const saveDailyTarotReading = async () => {
    try {
      await TarotUtils.saveDailyTarot({
        id: `daily_${TarotUtils.getTodayDateString()}`,
        date: TarotUtils.getTodayDateString(),
        hourlyCards: dailyCards,
        memos: cardMemos,
        insights: '',
        savedAt: new Date().toISOString()
      });

      Alert.alert(
        '💾 저장 완료!',
        '일일 타로 리딩이 저널에 저장되었습니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('일일 타로 저장 실패:', error);
      Alert.alert('오류', '저장 중 문제가 발생했습니다.');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getCurrentHour = () => {
    return currentTime.getHours();
  };

  const hasCardsForToday = dailyCards.length > 0;
  const selectedCard = selectedCardIndex !== null ? dailyCards[selectedCardIndex] : null;

  return (
    <ScrollView style={styles.timerContainer} showsVerticalScrollIndicator={false}>
      {/* 상단 헤더 영역 - 명세서 기준 */}
      <Animated.View style={[styles.headerSection, headerFadeStyle]}>
        <Text style={styles.dateText}>
          {currentTime.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })}
        </Text>
        {selectedCardIndex !== null && (
          <Text style={styles.selectedTimeText}>
            ⚡ {selectedCardIndex}시의 카드
          </Text>
        )}
      </Animated.View>

      {/* 카드 뽑기 화면 또는 24시간 가로 스크롤 */}
      {!hasCardsForToday ? (
        <View style={styles.drawCardsSection}>
          <Animated.View style={[styles.mysticalBox, pulseStyle]}>
            <View style={styles.mysticalIconContainer}>
              <Icon 
                name="clock" 
                size={48} 
                color={Colors.brand.accent}
              />
            </View>
            <Text style={styles.mysticalMessage}>
              "우주의 메시지가{'\n'}당신을 기다립니다"
            </Text>
            <GradientButton
              onPress={drawDailyCards}
              title={isLoading ? '뽑는 중...' : '24시간 운명 공개하기'}
              icon={isLoading ? 'rotate-ccw' : 'sparkles'}
              disabled={isLoading}
              size="large"
            />
          </Animated.View>
          <Text style={styles.guidanceText}>
            하루 동안의 에너지 흐름을 확인하세요
          </Text>
        </View>
      ) : (
        <>
          {/* 카드 상세보기 영역 - 명세서 기준 */}
          {selectedCard && (
            <Animated.View style={[styles.cardDetailSection, cardDetailStyle]}>
              <View style={styles.cardDetailLayout}>
                <View style={styles.cardImageContainer}>
                  <TarotCardComponent
                    card={selectedCard}
                    size="large"
                    showText={false}
                    showBack={false}
                  />
                </View>
                
                <View style={styles.cardInfoContainer}>
                  <Text style={styles.cardName}>{selectedCard.nameKr}</Text>
                  <Text style={styles.cardNameEn}>{selectedCard.name}</Text>
                  
                  <View style={styles.keywordsContainer}>
                    {selectedCard.keywordsKr.slice(0, 3).map((keyword, idx) => (
                      <View key={idx} style={styles.keywordBadge}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* 메모 입력창 - 명세서 기준 */}
              <View style={styles.memoSection}>
                <Text style={styles.memoLabel}>💭 신성한 일지:</Text>
                <TextInput
                  style={styles.memoInput}
                  value={cardMemos[selectedCardIndex] || ''}
                  onChangeText={(text) => updateCardMemo(selectedCardIndex, text)}
                  placeholder="이 시간의 느낌이나 경험을..."
                  placeholderTextColor="#666"
                  multiline={true}
                  maxLength={500}
                />
                <Text style={styles.memoCounter}>
                  {(cardMemos[selectedCardIndex] || '').length}/500 글자
                </Text>
              </View>
            </Animated.View>
          )}

          {/* 메인 카드 가로 스크롤 영역 - 하단으로 이동 */}
          <View style={styles.cardsScrollSection}>
            <View style={styles.scrollHeader}>
              <Text style={styles.scrollTitle}>⚡ 에너지 흐름</Text>
              <TouchableOpacity
                style={styles.redrawAllButton}
                onPress={drawDailyCards}
              >
                <Text style={styles.redrawAllText}>다시뽑기</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {dailyCards.map((card, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cardSlot,
                    index === getCurrentHour() && styles.cardSlotCurrent,
                    index === selectedCardIndex && styles.cardSlotSelected
                  ]}
                  onPress={() => setSelectedCardIndex(index)}
                  activeOpacity={0.8}
                >
                  <TarotCardComponent
                    card={card}
                    size="small"
                    showText={false}
                    showBack={false}
                  />
                  <Text style={styles.cardSlotTime}>{index}시</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 저장 버튼 영역 - 명세서 기준 */}
          <View style={styles.saveSection}>
            <GradientButton
              onPress={saveDailyTarotReading}
              title="💾 일일 타로 리딩 저장하기"
              icon="save"
              size="large"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

// 네비게이션 탭
function TabBar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'timer', name: '타이머', icon: 'clock' as const },
    { id: 'spread', name: '스프레드', icon: 'tarot-cards' as const },
    { id: 'journal', name: '저널', icon: 'book-open' as const },
    { id: 'settings', name: '설정', icon: 'settings' as const }
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id)}
        >
          <Icon 
            name={tab.icon} 
            size={20} 
            color={activeTab === tab.id ? '#fff' : '#9b8db8'} 
          />
          <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('timer');

  const getTabTitle = () => {
    switch (activeTab) {
      case 'timer':
        return '타로 타이머';
      case 'spread':
        return '타로 스프레드';
      case 'journal':
        return '타로 저널';
      case 'settings':
        return '설정';
      default:
        return '타로 타이머';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'timer':
        return 'Tarot Timer';
      case 'spread':
        return 'Tarot Spread';
      case 'journal':
        return 'Tarot Journal';
      case 'settings':
        return 'Settings';
      default:
        return 'Tarot Timer';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'timer':
        return <TarotTimer />;
      case 'spread':
        return <TarotSpread />;
      case 'journal':
        return <TarotJournal />;
      case 'settings':
        return <TarotSettings />;
      default:
        return <TarotTimer />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 새로운 고급 배경 시스템 - 레이어 순서 중요 */}
      <SacredGeometryBackground opacity={0.15} />
      <MysticalTexture opacity={0.1} />
      {/* <FloatingParticles particleCount={8} opacity={0.08} speed="medium" /> */}
      
      <View style={styles.header}>
        <Text style={styles.title}>{getTabTitle()}</Text>
        <Text style={styles.subtitle}>{getTabSubtitle()}</Text>
      </View>
      
      <ScrollView style={styles.main}>
        {renderContent()}
      </ScrollView>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <StatusBar style="light" backgroundColor="#1a1625" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    ...GlassStyles.cardSecondary,
    ...ShadowStyles.brandGlow,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderColor: Colors.brand.accent,
    borderWidth: 1.5,
  },
  title: {
    ...TextStyles.goldTitle,
    marginBottom: 4,
  },
  subtitle: {
    ...TextStyles.goldSubtitle,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  timerContainer: {
    flex: 1,
    paddingVertical: Spacing.xl,
  },
  // 상단 헤더 영역 - 새로운 글래스모피즘 디자인
  headerSection: {
    ...CompositeStyles.glassCardSoft,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dateText: {
    ...TextStyles.subtitle,
    marginBottom: Spacing.sm,
  },
  selectedTimeText: {
    ...TextStyles.label,
  },
  // 카드 뽑기 화면 - 새로운 디자인
  drawCardsSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.section,
  },
  mysticalBox: {
    ...CompositeStyles.elevatedCardBrand,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.section,
    paddingVertical: Spacing.xxxl,
  },
  mysticalIconContainer: {
    marginBottom: Spacing.xl,
    ...ShadowStyles.brandGlow,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.glass.primary,
    borderWidth: 2,
    borderColor: Colors.border.focus,
  },
  mysticalMessage: {
    ...TextStyles.subtitle,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.xxxl,
    fontStyle: 'italic',
  },
  guidanceText: {
    ...TextStyles.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // 카드 가로 스크롤 영역 - 새로운 디자인
  cardsScrollSection: {
    marginBottom: Spacing.xl,
  },
  scrollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  scrollTitle: {
    ...TextStyles.subtitle,
  },
  redrawAllButton: {
    ...GlassStyles.cardCompact,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderColor: Colors.border.focus,
  },
  redrawAllText: {
    ...TextStyles.caption,
    color: Colors.text.hero,
    fontWeight: 'bold',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  horizontalScrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  // 개별 카드 슬롯 - 새로운 글래스모피즘 디자인
  cardSlot: {
    ...CompositeStyles.compactCard,
    width: 80,
    alignItems: 'center',
    padding: Spacing.sm,
  },
  cardSlotCurrent: {
    ...ShadowStyles.mysticGlow,
    borderColor: Colors.text.primary,
    borderWidth: 2,
    backgroundColor: Colors.glass.primary,
  },
  cardSlotSelected: {
    ...CompositeStyles.selectedCard,
    ...ShadowStyles.brandGlow,
  },
  cardSlotTime: {
    ...TextStyles.caption,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  // 카드 상세보기 영역 - 새로운 엘레베이션 디자인
  cardDetailSection: {
    ...CompositeStyles.elevatedCardBrand,
    marginBottom: Spacing.xl,
  },
  cardDetailLayout: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  cardImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    ...TextStyles.title,
    marginBottom: Spacing.xs,
  },
  cardNameEn: {
    ...TextStyles.body,
    fontStyle: 'italic',
    marginBottom: Spacing.lg,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  keywordBadge: {
    ...GlassStyles.cardCompact,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderColor: Colors.border.medium,
  },
  keywordText: {
    ...TextStyles.caption,
    fontWeight: '600',
  },
  // 메모 입력 영역 - 새로운 글래스 디자인
  memoSection: {
    marginTop: Spacing.lg,
  },
  memoLabel: {
    ...TextStyles.label,
    marginBottom: Spacing.md,
  },
  memoInput: {
    ...GlassStyles.cardSecondary,
    borderColor: Colors.border.soft,
    color: Colors.text.primary,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.sm,
  },
  memoCounter: {
    ...TextStyles.caption,
    textAlign: 'right',
  },
  // 저장 버튼 영역 - 새로운 디자인
  saveSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timeText: {
    ...TextStyles.hero,
    fontSize: 40,
    textAlign: 'center',
    letterSpacing: 2,
  },
  hourText: {
    fontSize: 16,
    color: '#d4b8ff',
    textAlign: 'center',
  },
  viewCardsButtonContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  currentCardContainer: {
    ...CompositeStyles.elevatedCardBrand,
    marginVertical: Spacing.lg,
    marginHorizontal: Spacing.md,
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    ...GlassStyles.cardCompact,
    backgroundColor: Colors.glass.tertiary,
    borderColor: Colors.border.medium,
  },
  cardTitle: {
    ...TextStyles.headline,
    color: Colors.text.hero,
    marginLeft: Spacing.md,
    textAlign: 'center',
  },
  cardMeaning: {
    ...TextStyles.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: Spacing.xl,
    ...GlassStyles.cardSecondary,
    backgroundColor: Colors.glass.tertiary,
    borderColor: Colors.border.subtle,
  },
  currentCardActions: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  statusText: {
    ...TextStyles.body,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  cardListContainer: {
    marginTop: Spacing.xl,
    maxHeight: 300,
    ...CompositeStyles.glassCardSoft,
    borderColor: Colors.border.medium,
  },
  cardListTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  cardListTitle: {
    ...TextStyles.headline,
    color: Colors.text.hero,
    marginLeft: Spacing.sm,
  },
  cardListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    ...GlassStyles.cardCompact,
    borderColor: Colors.border.subtle,
  },
  cardListItemCurrent: {
    backgroundColor: Colors.glass.primary,
    borderWidth: 2,
    borderColor: Colors.text.hero,
    ...ShadowStyles.brandGlow,
  },
  cardListTimeContainer: {
    alignItems: 'center',
    width: 60,
  },
  cardListHour: {
    ...TextStyles.body,
    color: Colors.text.hero,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardListInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardListName: {
    ...TextStyles.body,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  cardListNameEn: {
    ...TextStyles.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardListCurrentBadge: {
    ...GlassStyles.cardCompact,
    backgroundColor: Colors.glass.tertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderColor: Colors.text.hero,
  },
  cardListCurrent: {
    ...TextStyles.caption,
    color: Colors.text.hero,
    fontWeight: 'bold',
  },
  redrawButton: {
    ...GlassStyles.cardCompact,
    backgroundColor: Colors.glass.tertiary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.sm,
    borderColor: Colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
  },
  contentTitle: {
    ...TextStyles.title,
    color: Colors.text.hero,
    marginBottom: Spacing.lg,
  },
  contentText: {
    ...TextStyles.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.glass.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.medium,
    ...ShadowStyles.soft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.brand.secondary,
    borderRadius: BorderRadius.lg,
    ...ShadowStyles.mysticGlow,
  },
  tabText: {
    ...TextStyles.caption,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  activeTabText: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
});