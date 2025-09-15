// hooks/useTarotI18n.ts - 타로 카드 국제화 Hook

import { useTranslation } from 'react-i18next';
import { TarotCard, SpreadType } from '../utils/tarotData';
import { 
  getLocalizedCard, 
  getLocalizedCards, 
  getLocalizedCardById,
  getCardName,
  getCardMeaning,
  getCardKeywords,
  getLocalizedSuitName,
  getLocalizedElementName,
  getLocalizedCardType,
  getLocalizedSpread,
  getLocalizedSpreads,
  getLocalizedSpreadById,
  getSpreadName,
  getSpreadDescription
} from '../utils/tarotI18n';

export const useTarotI18n = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return {
    // 현재 언어
    currentLanguage,
    
    // 단일 카드 현지화
    localizeCard: (card: TarotCard) => getLocalizedCard(card, currentLanguage),
    
    // 여러 카드 현지화
    localizeCards: (cards: TarotCard[]) => 
      cards.map(card => getLocalizedCard(card, currentLanguage)),
    
    // 모든 카드 현지화
    getAllLocalizedCards: () => getLocalizedCards(currentLanguage),
    
    // ID로 카드 찾기 및 현지화
    getLocalizedCardById: (id: number) => getLocalizedCardById(id, currentLanguage),
    
    // 카드 정보 개별 접근
    getCardName: (card: TarotCard) => getCardName(card, currentLanguage),
    getCardMeaning: (card: TarotCard) => getCardMeaning(card, currentLanguage),
    getCardKeywords: (card: TarotCard) => getCardKeywords(card, currentLanguage),
    
    // 메타 정보 현지화
    getSuitName: (suit: string) => getLocalizedSuitName(suit, currentLanguage),
    getElementName: (element: string) => getLocalizedElementName(element, currentLanguage),
    getCardType: (type: string) => getLocalizedCardType(type, currentLanguage),
    
    // 스프레드 관련 함수들
    localizeSpread: (spread: SpreadType) => getLocalizedSpread(spread, currentLanguage),
    localizeSpreads: (spreads: SpreadType[]) => 
      spreads.map(spread => getLocalizedSpread(spread, currentLanguage)),
    getAllLocalizedSpreads: () => getLocalizedSpreads(currentLanguage),
    getLocalizedSpreadById: (id: string) => getLocalizedSpreadById(id, currentLanguage),
    getSpreadName: (spread: SpreadType) => getSpreadName(spread, currentLanguage),
    getSpreadDescription: (spread: SpreadType) => getSpreadDescription(spread, currentLanguage),
    
    // 언어 상태
    isEnglish: currentLanguage === 'en',
    isKorean: currentLanguage === 'ko'
  };
};