import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { TarotCard, TarotUtils, DailyTarotSave, simpleStorage, STORAGE_KEYS } from '../utils/tarotData';
import { preloadTarotImages } from '../utils/imageCache';
import i18next from 'i18next';
import { useTarotI18n } from './useTarotI18n';

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

  const { getCardName } = useTarotI18n();
  const hasCardsForToday = dailyCards.length > 0;
  const currentCard = selectedCardIndex !== null ? dailyCards[selectedCardIndex] : null;

  // 오늘의 카드 로드 (고성능 이미지 프리로딩 포함)
  const loadTodayCards = useCallback(async () => {
    try {
      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
      const savedData = await simpleStorage.getItem(storageKey);

      if (savedData) {
        const dailySave: DailyTarotSave = JSON.parse(savedData);
        setDailyCards(dailySave.hourlyCards);
        setCardMemos(dailySave.memos || {});

        // 고성능 이미지 프리로딩 (스마트 우선순위)
        if (dailySave.hourlyCards.length > 0) {
          preloadTarotImages(dailySave.hourlyCards, currentHour, 'smart');
        }
      }
    } catch (error) {
      console.error('카드 로드 실패:', error);
    }
  }, [currentHour]);

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
        i18next.t('cards.redrawAllTitle'),
        i18next.t('cards.redrawAllMessage'),
        [
          { text: i18next.t('common.cancel'), style: 'cancel' },
          {
            text: i18next.t('cards.redrawCards'),
            style: 'destructive',
            onPress: performDrawDailyCards
          }
        ]
      );
    } else {
      performDrawDailyCards();
    }
  }, [hasCardsForToday]);

  // 실제 카드 뽑기 실행 (즉시 이미지 프리로딩)
  const performDrawDailyCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const newCards = TarotUtils.getRandomCardsNoDuplicates(24);
      setDailyCards(newCards);
      setSelectedCardIndex(currentHour);
      setCardMemos({}); // 메모 초기화

      await saveDailyCards(newCards, {});

      // 새로 뽑은 카드들 즉시 프리로딩
      preloadTarotImages(newCards, currentHour, 'immediate');

      Alert.alert(
        i18next.t('cards.completeTitle'),
        i18next.t('cards.completeMessage', {
          hour: currentHour,
          cardName: getCardName(newCards[currentHour])
        }),
        [{ text: i18next.t('common.ok') }]
      );
    } catch (error) {
      console.error('카드 뽑기 실패:', error);
      Alert.alert(i18next.t('common.error'), i18next.t('cards.drawError'));
    } finally {
      setIsLoading(false);
    }
  }, [currentHour, saveDailyCards, getCardName]);

  // 모든 카드 다시 뽑기 (확인 없이 바로 실행 - 다시 뽑기 버튼용)
  const redrawAllCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const newCards = TarotUtils.getRandomCardsNoDuplicates(24);
      setDailyCards(newCards);
      setSelectedCardIndex(currentHour);
      setCardMemos({}); // 메모 초기화

      await saveDailyCards(newCards, {});

      // 새로 뽑은 카드들 즉시 프리로딩
      preloadTarotImages(newCards, currentHour, 'immediate');

      console.log('24시간 카드가 새로 뽑혔습니다!');
    } catch (error) {
      console.error('카드 다시 뽑기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentHour, saveDailyCards]);

  // 개별 카드 다시 뽑기
  const redrawSingleCard = useCallback(async (hourIndex: number) => {
    const currentCard = dailyCards[hourIndex];
    const currentCardName = currentCard ? getCardName(currentCard) : '알 수 없는 카드';
    
    Alert.alert(
      i18next.t('cards.redrawSingleTitle'),
      i18next.t('cards.redrawSingleMessage', {
        hour: TarotUtils.formatHour(hourIndex),
        cardName: currentCardName
      }),
      [
        { text: i18next.t('common.cancel'), style: 'cancel' },
        {
          text: i18next.t('cards.redrawCard'),
          onPress: async () => {
            try {
              const newCard = TarotUtils.getRandomCardExcluding(currentCard);
              const updatedCards = [...dailyCards];
              updatedCards[hourIndex] = newCard;
              setDailyCards(updatedCards);
              
              await saveDailyCards(updatedCards);
              
              Alert.alert(
                i18next.t('cards.newCardTitle'),
                i18next.t('cards.newCardMessage', {
                  hour: TarotUtils.formatHour(hourIndex),
                  cardName: getCardName(newCard)
                }),
                [{ text: i18next.t('common.ok') }]
              );
            } catch (error) {
              console.error('카드 다시 뽑기 실패:', error);
              Alert.alert(i18next.t('common.error'), i18next.t('cards.redrawError'));
            }
          }
        }
      ]
    );
  }, [dailyCards, saveDailyCards, getCardName]);

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

  // 선택된 카드가 변경되면 인접 카드 이미지 추가 프리로딩
  useEffect(() => {
    if (dailyCards.length > 0 && selectedCardIndex !== null) {
      preloadTarotImages(dailyCards, selectedCardIndex, 'smart');
    }
  }, [selectedCardIndex, dailyCards]);

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