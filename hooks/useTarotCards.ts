import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { TarotCard, TarotUtils, DailyTarotSave, simpleStorage, STORAGE_KEYS } from '../utils/tarotData';
import { preloadTarotImages } from '../utils/imageCache';
import i18next from 'i18next';
import { useTarotI18n } from './useTarotI18n';
import { useNotifications } from '../contexts/NotificationContext';

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
  handleMidnightReset: () => void;
}

export function useTarotCards(currentHour: number): UseTarotCardsReturn {
  const [dailyCards, setDailyCards] = useState<TarotCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [cardMemos, setCardMemos] = useState<Record<number, string>>({});

  const { getCardName } = useTarotI18n();
  const hasCardsForToday = dailyCards.length > 0;
  const currentCard = selectedCardIndex !== null ? dailyCards[selectedCardIndex] : null;

  // 알림 컨텍스트 (모바일 환경에서만)
  const isMobileEnvironment = Platform.OS === 'ios' || Platform.OS === 'android';
  let notificationContext: any = null;

  try {
    if (isMobileEnvironment) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      notificationContext = useNotifications();
    }
  } catch (error) {
    // 알림 컨텍스트가 없어도 카드 기능은 정상 작동
    console.log('알림 컨텍스트 없음 (웹 환경 또는 비활성화)');
  }

  // 오늘의 카드 로드 (고성능 이미지 프리로딩 포함)
  const loadTodayCards = useCallback(async () => {
    try {
      console.log('🎴 카드 로드 시작...');
      const startTime = Date.now();

      const today = TarotUtils.getTodayDateString();
      const storageKey = STORAGE_KEYS.DAILY_TAROT + today;
      const savedData = await simpleStorage.getItem(storageKey);

      if (savedData) {
        const dailySave: DailyTarotSave = JSON.parse(savedData);

        // ✅ 날짜 검증 추가 (이중 보호 - UTC 버그 및 캐시 오류 방지)
        if (dailySave.date === today) {
          // ✅ 날짜가 일치하는 경우에만 카드 로드
          setDailyCards(dailySave.hourlyCards);
          setCardMemos(dailySave.memos || {});

          const loadTime = Date.now() - startTime;
          console.log(`✅ 카드 데이터 로드 완료 (${loadTime}ms) - 날짜: ${today}`);

          // ✅ 이미지 프리로딩은 백그라운드에서 비동기로 (UI 블로킹 안 함)
          if (dailySave.hourlyCards.length > 0) {
            preloadTarotImages(dailySave.hourlyCards, currentHour, 'smart').then(() => {
              const totalTime = Date.now() - startTime;
              console.log(`⚡ 이미지 프리로드 완료 (총 ${totalTime}ms)`);
            }).catch(error => {
              console.warn('⚠️ 이미지 프리로드 실패 (무시 가능):', error);
            });
          }
        } else {
          // ❌ 날짜 불일치 - 캐시된 오래된 데이터 무시
          console.warn(`⚠️ 날짜 불일치 감지: 저장된 날짜(${dailySave.date}) !== 오늘(${today})`);
          console.log('🧹 오래된 카드 데이터 무시 - 새로운 카드 뽑기 필요');
          setDailyCards([]);
          setCardMemos({});
          setSelectedCardIndex(null);
        }
      } else {
        // 오늘의 카드가 없으면 상태 초기화
        console.log('🌙 새로운 날 - 카드 데이터 없음 (카드 뽑기 대기)');
        setDailyCards([]);
        setCardMemos({});
        setSelectedCardIndex(null);
      }
    } catch (error) {
      console.error('❌ 카드 로드 실패:', error);
    }
  }, [currentHour]);

  // 자정 초기화 핸들러
  const handleMidnightReset = useCallback(async () => {
    console.log('🌙 자정 초기화 - 24시간 카드 리셋 시작');

    // 상태 초기화
    setDailyCards([]);
    setCardMemos({});
    setSelectedCardIndex(null);

    // 오늘의 카드 다시 로드 (새로운 날짜로)
    loadTodayCards();

    // ✅ 자정 리셋 시 알림도 취소하고 8AM 리마인더 재생성
    if (notificationContext?.hasPermission && notificationContext?.cancelHourlyNotifications) {
      try {
        console.log('🔕 자정 초기화 - 기존 알림 취소');
        notificationContext.cancelHourlyNotifications();
        console.log('✅ 알림 취소 완료');

        // ✅ 8AM 리마인더 자동 생성 (카드를 뽑지 않았으므로)
        if (notificationContext?.scheduleHourlyNotifications) {
          console.log('🔔 자정 리셋 후 8AM 리마인더 자동 생성 시작');
          await notificationContext.scheduleHourlyNotifications();
          console.log('✅ 8AM 리마인더 생성 완료 (카드 뽑으면 시간별 알림으로 자동 전환)');
        }
      } catch (notifError) {
        console.warn('⚠️ 알림 처리 실패 (무시 가능):', notifError);
      }
    }

    console.log('✅ 자정 초기화 완료 - 새로운 24시간 카드를 뽑아주세요!');
  }, [loadTodayCards, notificationContext]);

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

      // ✅ 새로운 카드로 알림 자동 재스케줄링 (모바일만)
      if (notificationContext?.hasPermission && notificationContext?.scheduleHourlyNotifications) {
        try {
          console.log('🔔 새 카드 뽑기 완료 - 알림 재스케줄링 시작');
          await notificationContext.scheduleHourlyNotifications();
          console.log('✅ 새 카드 정보로 알림 업데이트 완료');
        } catch (notifError) {
          console.warn('⚠️ 알림 재스케줄링 실패 (무시 가능):', notifError);
          // 알림 실패해도 카드 뽑기는 성공으로 처리
        }
      }

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
  }, [currentHour, saveDailyCards, getCardName, notificationContext]);

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

      // ✅ 새로운 카드로 알림 자동 재스케줄링 (모바일만)
      if (notificationContext?.hasPermission && notificationContext?.scheduleHourlyNotifications) {
        try {
          console.log('🔔 카드 다시 뽑기 완료 - 알림 재스케줄링 시작');
          await notificationContext.scheduleHourlyNotifications();
          console.log('✅ 새 카드 정보로 알림 업데이트 완료');
        } catch (notifError) {
          console.warn('⚠️ 알림 재스케줄링 실패 (무시 가능):', notifError);
        }
      }

      console.log('24시간 카드가 새로 뽑혔습니다!');
    } catch (error) {
      console.error('카드 다시 뽑기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentHour, saveDailyCards, notificationContext]);

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
  }, [hasCardsForToday, performDrawDailyCards]);

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

  // ✅ FIX: 시간이 변경될 때마다 현재 시간 카드로 자동 업데이트
  useEffect(() => {
    if (dailyCards.length > 0) {
      console.log(`⏰ 시간 변경 감지: ${currentHour}시 - 현재 시간 카드로 자동 업데이트`);
      setSelectedCardIndex(currentHour);
    }
  }, [currentHour, dailyCards.length]);

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
    handleMidnightReset,
  };
}