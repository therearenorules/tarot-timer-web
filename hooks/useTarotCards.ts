import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { TarotCard, TarotUtils, DailyTarotSave, simpleStorage, STORAGE_KEYS } from '../utils/tarotData';

export interface UseTarotCardsReturn {
  dailyCards: TarotCard[];
  isLoading: boolean;
  selectedCardIndex: number | null;
  cardMemos: Record<number, string>;
  hasCardsForToday: boolean;
  currentCard: TarotCard | null;
  setSelectedCardIndex: (index: number | null) => void;
  drawDailyCards: () => void;
  redrawAllCards: () => void;
  redrawSingleCard: (hourIndex: number) => void;
  updateMemo: (hourIndex: number, memo: string) => void;
  loadTodayCards: () => Promise<void>;
}

export function useTarotCards(currentHour: number): UseTarotCardsReturn {
  const [dailyCards, setDailyCards] = useState<TarotCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [cardMemos, setCardMemos] = useState<Record<number, string>>({});

  const hasCardsForToday = dailyCards.length > 0;
  const currentCard = selectedCardIndex !== null ? dailyCards[selectedCardIndex] : null;

  // 오늘의 카드 로드
  const loadTodayCards = useCallback(async () => {
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
  }, []);

  // 카드 저장
  const saveDailyCards = useCallback(async (cards: TarotCard[], memos?: Record<number, string>) => {
    try {
      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
      const saveData: DailyTarotSave = {
        date: today,
        hourlyCards: cards,
        memos: memos || cardMemos,
      };
      await simpleStorage.setItem(storageKey, JSON.stringify(saveData));
    } catch (error) {
      console.error('카드 저장 실패:', error);
    }
  }, [cardMemos]);

  // 24시간 카드 뽑기
  const drawDailyCards = useCallback(() => {
    if (hasCardsForToday) {
      Alert.alert(
        '🔄 새로운 24장 카드 뽑기',
        '이미 오늘의 카드가 있습니다. 새로운 24장 카드로 교체하시겠습니까?\n\n⚠️ 기존 카드와 메모가 모두 새로운 카드로 교체됩니다.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '새로 뽑기',
            style: 'destructive',
            onPress: performDrawDailyCards
          }
        ]
      );
    } else {
      performDrawDailyCards();
    }
  }, [hasCardsForToday]);

  // 실제 카드 뽑기 실행
  const performDrawDailyCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const newCards = TarotUtils.getRandomCards(24);
      setDailyCards(newCards);
      setSelectedCardIndex(currentHour);
      setCardMemos({}); // 메모 초기화
      
      await saveDailyCards(newCards, {});
      
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
  }, [currentHour, saveDailyCards]);

  // 모든 카드 다시 뽑기 (확인 없이 바로 실행 - 다시 뽑기 버튼용)
  const redrawAllCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const newCards = TarotUtils.getRandomCards(24);
      setDailyCards(newCards);
      setSelectedCardIndex(currentHour);
      setCardMemos({}); // 메모 초기화
      
      await saveDailyCards(newCards, {});
      
      console.log('24시간 카드가 새로 뽑혔습니다!');
    } catch (error) {
      console.error('카드 다시 뽑기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentHour, saveDailyCards]);

  // 개별 카드 다시 뽑기
  const redrawSingleCard = useCallback(async (hourIndex: number) => {
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
              
              await saveDailyCards(updatedCards);
              
              Alert.alert(
                '🎴 새로운 카드!',
                `${TarotUtils.formatHour(hourIndex)}의 새로운 카드: ${newCard.nameKr}`,
                [{ text: '확인' }]
              );
            } catch (error) {
              console.error('카드 다시 뽑기 실패:', error);
              Alert.alert('오류', '카드를 다시 뽑는 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  }, [dailyCards, saveDailyCards]);

  // 메모 업데이트
  const updateMemo = useCallback(async (hourIndex: number, memo: string) => {
    const updatedMemos = { ...cardMemos, [hourIndex]: memo };
    setCardMemos(updatedMemos);
    await saveDailyCards(dailyCards, updatedMemos);
  }, [cardMemos, dailyCards, saveDailyCards]);

  // 컴포넌트 마운트 시 카드 로드
  useEffect(() => {
    loadTodayCards();
  }, [loadTodayCards]);

  // 첫 카드가 로드되면 현재 시간 카드 선택
  useEffect(() => {
    if (dailyCards.length > 0 && selectedCardIndex === null) {
      setSelectedCardIndex(currentHour);
    }
  }, [dailyCards, selectedCardIndex, currentHour]);

  return {
    dailyCards,
    isLoading,
    selectedCardIndex,
    cardMemos,
    hasCardsForToday,
    currentCard,
    setSelectedCardIndex,
    drawDailyCards,
    redrawAllCards,
    redrawSingleCard,
    updateMemo,
    loadTodayCards,
  };
}