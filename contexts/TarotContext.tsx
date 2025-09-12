import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { TarotCard } from '../utils/tarotData';

// 타로 앱 전역 상태 타입 정의
export interface TarotState {
  // 타이머 관련
  currentTime: Date;
  
  // 카드 관련
  dailyCards: TarotCard[];
  selectedCardIndex: number | null;
  cardMemos: Record<number, string>;
  isLoading: boolean;
  
  // UI 상태
  activeTab: string;
  theme: 'dark' | 'light';
  
  // 설정
  notifications: boolean;
  soundEffects: boolean;
}

// 액션 타입 정의
export type TarotAction = 
  | { type: 'SET_CURRENT_TIME'; payload: Date }
  | { type: 'SET_DAILY_CARDS'; payload: TarotCard[] }
  | { type: 'SET_SELECTED_CARD_INDEX'; payload: number | null }
  | { type: 'UPDATE_CARD_MEMO'; payload: { index: number; memo: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'TOGGLE_SOUND_EFFECTS' }
  | { type: 'RESET_DAILY_DATA' };

// 초기 상태
const initialState: TarotState = {
  currentTime: new Date(),
  dailyCards: [],
  selectedCardIndex: null,
  cardMemos: {},
  isLoading: false,
  activeTab: 'timer',
  theme: 'dark',
  notifications: true,
  soundEffects: true,
};

// 리듀서 함수
function tarotReducer(state: TarotState, action: TarotAction): TarotState {
  switch (action.type) {
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
      
    case 'SET_DAILY_CARDS':
      return { ...state, dailyCards: action.payload };
      
    case 'SET_SELECTED_CARD_INDEX':
      return { ...state, selectedCardIndex: action.payload };
      
    case 'UPDATE_CARD_MEMO':
      return {
        ...state,
        cardMemos: {
          ...state.cardMemos,
          [action.payload.index]: action.payload.memo,
        },
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
      
    case 'SET_THEME':
      return { ...state, theme: action.payload };
      
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notifications: !state.notifications };
      
    case 'TOGGLE_SOUND_EFFECTS':
      return { ...state, soundEffects: !state.soundEffects };
      
    case 'RESET_DAILY_DATA':
      return {
        ...state,
        dailyCards: [],
        selectedCardIndex: null,
        cardMemos: {},
        isLoading: false,
      };
      
    default:
      return state;
  }
}

// 컨텍스트 타입 정의
interface TarotContextType {
  state: TarotState;
  dispatch: React.Dispatch<TarotAction>;
  
  // 편의 함수들
  setCurrentTime: (time: Date) => void;
  setDailyCards: (cards: TarotCard[]) => void;
  selectCard: (index: number | null) => void;
  updateMemo: (index: number, memo: string) => void;
  setLoading: (loading: boolean) => void;
  changeTab: (tab: string) => void;
  toggleTheme: () => void;
  toggleNotifications: () => void;
  toggleSoundEffects: () => void;
  resetDailyData: () => void;
}

// 컨텍스트 생성
const TarotContext = createContext<TarotContextType | undefined>(undefined);

// 프로바이더 컴포넌트
export function TarotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tarotReducer, initialState);
  
  // 편의 함수들 구현
  const setCurrentTime = useCallback((time: Date) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, []);
  
  const setDailyCards = useCallback((cards: TarotCard[]) => {
    dispatch({ type: 'SET_DAILY_CARDS', payload: cards });
  }, []);
  
  const selectCard = useCallback((index: number | null) => {
    dispatch({ type: 'SET_SELECTED_CARD_INDEX', payload: index });
  }, []);
  
  const updateMemo = useCallback((index: number, memo: string) => {
    dispatch({ type: 'UPDATE_CARD_MEMO', payload: { index, memo } });
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);
  
  const changeTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);
  
  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  }, [state.theme]);
  
  const toggleNotifications = useCallback(() => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  }, []);
  
  const toggleSoundEffects = useCallback(() => {
    dispatch({ type: 'TOGGLE_SOUND_EFFECTS' });
  }, []);
  
  const resetDailyData = useCallback(() => {
    dispatch({ type: 'RESET_DAILY_DATA' });
  }, []);
  
  const value: TarotContextType = {
    state,
    dispatch,
    setCurrentTime,
    setDailyCards,
    selectCard,
    updateMemo,
    setLoading,
    changeTab,
    toggleTheme,
    toggleNotifications,
    toggleSoundEffects,
    resetDailyData,
  };
  
  return (
    <TarotContext.Provider value={value}>
      {children}
    </TarotContext.Provider>
  );
}

// 커스텀 훅
export function useTarotContext() {
  const context = useContext(TarotContext);
  if (context === undefined) {
    throw new Error('useTarotContext must be used within a TarotProvider');
  }
  return context;
}

// 선택적 훅들 (특정 상태만 필요한 경우)
export function useTarotCards() {
  const { state } = useTarotContext();
  return {
    dailyCards: state.dailyCards,
    selectedCardIndex: state.selectedCardIndex,
    cardMemos: state.cardMemos,
    isLoading: state.isLoading,
  };
}

export function useTarotTimer() {
  const { state } = useTarotContext();
  return {
    currentTime: state.currentTime,
  };
}

export function useTarotSettings() {
  const { state } = useTarotContext();
  return {
    theme: state.theme,
    notifications: state.notifications,
    soundEffects: state.soundEffects,
  };
}