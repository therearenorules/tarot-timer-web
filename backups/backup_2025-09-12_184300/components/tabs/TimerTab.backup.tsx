import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet
} from 'react-native';
import { TarotCard, TarotUtils, DailyTarotSave, simpleStorage, STORAGE_KEYS } from '../../utils/tarotData';
import { 
  Colors, 
  Spacing,
  BorderRadius 
} from '../DesignSystem';
import { 
  useTouchFeedback,
  useFadeIn,
  useCardEntrance,
  usePulse 
} from '../AnimationUtils';

export default function TimerTab() {
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
    } catch (error) {
      console.error('타로 리딩 저장 실패:', error);
    }
  };

  // 계산된 속성들
  const hasCardsForToday = dailyCards.length > 0;
  const selectedCard = selectedCardIndex !== null ? dailyCards[selectedCardIndex] : null;
  const currentHourCard = dailyCards[currentTime.getHours()];

  // 현재 시간대 표시
  const getCurrentTimeDisplay = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // 시간대별 카드 그리드 렌더링
  const renderHourlyCardGrid = () => {
    if (!hasCardsForToday) return null;

    const rows = [];
    for (let i = 0; i < 4; i++) {
      const rowCards = [];
      for (let j = 0; j < 6; j++) {
        const hourIndex = i * 6 + j;
        const card = dailyCards[hourIndex];
        const isSelected = selectedCardIndex === hourIndex;
        const isCurrentHour = hourIndex === currentTime.getHours();

        rowCards.push(
          <TouchableOpacity
            key={hourIndex}
            style={[
              styles.hourlyCard,
              isSelected && styles.selectedCard,
              isCurrentHour && styles.currentHourCard
            ]}
            onPress={() => setSelectedCardIndex(hourIndex)}
            onLongPress={() => redrawSingleCard(hourIndex)}
          >
            <Text style={styles.hourText}>
              {TarotUtils.formatHour(hourIndex)}
            </Text>
            {card && (
              <Text style={styles.cardNameText} numberOfLines={2}>
                {card.nameKr}
              </Text>
            )}
            {isCurrentHour && (
              <View style={styles.currentTimeIndicator} />
            )}
          </TouchableOpacity>
        );
      }
      rows.push(
        <View key={i} style={styles.cardRow}>
          {rowCards}
        </View>
      );
    }
    return rows;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 섹션 */}
      <View style={[styles.headerSection, headerFadeStyle]}>
        <Text style={styles.titleText}>
          🔮 24시간 타로 타이머
        </Text>
        <Text style={styles.currentTimeText}>
          {getCurrentTimeDisplay()}
        </Text>
        
        {/* 현재 시간 카드 */}
        {currentHourCard && (
          <View style={[styles.currentCard, pulseStyle]}>
            <Text style={styles.currentCardTitle}>
              현재 {currentTime.getHours()}시의 카드
            </Text>
            <Text style={styles.currentCardName}>
              {currentHourCard.nameKr}
            </Text>
            <Text style={styles.currentCardMeaning} numberOfLines={2}>
              {currentHourCard.meaningKr}
            </Text>
          </View>
        )}
      </View>

      {/* 카드 뽑기 버튼 */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[styles.drawButton, isLoading && styles.disabledButton]}
          onPress={drawDailyCards}
          disabled={isLoading}
        >
          <Text style={styles.drawButtonText}>
            {isLoading ? '⏳ 카드 준비 중...' : 
             hasCardsForToday ? '🔄 새로운 24장 뽑기' : '🎴 오늘의 24장 뽑기'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 시간대별 카드 그리드 */}
      {hasCardsForToday && (
        <View style={styles.cardGridSection}>
          <Text style={styles.sectionTitle}>⏰ 시간별 카드</Text>
          <Text style={styles.instructionText}>
            카드를 탭하면 상세 정보를 볼 수 있고, 길게 누르면 다시 뽑을 수 있습니다
          </Text>
          {renderHourlyCardGrid()}
        </View>
      )}

      {/* 선택된 카드 상세 정보 */}
      {selectedCard && (
        <View style={[styles.cardDetailSection, cardDetailStyle]}>
          <Text style={styles.cardDetailTitle}>
            🎯 {TarotUtils.formatHour(selectedCardIndex!)} - {selectedCard.nameKr}
          </Text>
          <Text style={styles.cardDetailMeaning}>
            {selectedCard.meaningKr}
          </Text>
          {selectedCard.descriptionKr && (
            <Text style={styles.cardDetailDescription}>
              {selectedCard.descriptionKr}
            </Text>
          )}
          
          {/* 카드 메모 */}
          <View style={styles.memoSection}>
            <Text style={styles.memoTitle}>📝 개인 메모</Text>
            <Text style={styles.memoPlaceholder}>
              이 시간의 카드에 대한 개인적인 생각이나 경험을 기록해보세요.
            </Text>
          </View>
        </View>
      )}

      {/* 안내 메시지 */}
      {!hasCardsForToday && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            🌟 오늘의 운명을 확인해보세요!
          </Text>
          <Text style={styles.emptyStateSubtext}>
            24장의 카드로 하루 24시간의 운세를 알아보세요.
            각 시간마다 특별한 메시지가 기다리고 있습니다.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.glass.primary,
  },
  headerSection: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  currentTimeText: {
    fontSize: 24,
    color: Colors.brand.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
  },
  currentCard: {
    backgroundColor: Colors.glass.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.brand.accent,
    width: '100%',
  },
  currentCardTitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  currentCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  currentCardMeaning: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    padding: Spacing.lg,
  },
  drawButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  drawButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardGridSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  hourlyCard: {
    flex: 1,
    backgroundColor: Colors.glass.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginHorizontal: 2,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  selectedCard: {
    borderColor: Colors.brand.secondary,
    borderWidth: 2,
    backgroundColor: Colors.glass.secondary,
  },
  currentHourCard: {
    borderColor: Colors.brand.accent,
    borderWidth: 2,
  },
  hourText: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  cardNameText: {
    fontSize: 9,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 2,
  },
  currentTimeIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.accent,
  },
  cardDetailSection: {
    margin: Spacing.lg,
    backgroundColor: Colors.glass.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  cardDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.brand.secondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  cardDetailMeaning: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  cardDetailDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  memoSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
    paddingTop: Spacing.md,
  },
  memoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  memoPlaceholder: {
    fontSize: 16,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.brand.accent,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});