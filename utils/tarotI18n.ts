// utils/tarotI18n.ts - 타로 카드 국제화 유틸리티

import { TarotCard, TAROT_CARDS, SpreadType, SPREAD_TYPES } from './tarotData';

// 현재 언어에 따라 카드 이름 반환
export const getCardName = (card: TarotCard, language: string = 'ko'): string => {
  return language === 'en' ? card.name : card.nameKr;
};

// 현재 언어에 따라 카드 의미 반환
export const getCardMeaning = (card: TarotCard, language: string = 'ko'): string => {
  return language === 'en' ? card.meaning : card.meaningKr;
};

// 현재 언어에 따라 카드 키워드 반환
export const getCardKeywords = (card: TarotCard, language: string = 'ko'): string[] => {
  return language === 'en' ? card.keywords : card.keywordsKr;
};

// 현재 언어로 현지화된 카드 객체 반환
export const getLocalizedCard = (card: TarotCard, language: string = 'ko'): TarotCard => {
  const isEnglish = language === 'en';
  
  return {
    ...card,
    name: isEnglish ? card.name : card.nameKr,
    meaning: isEnglish ? card.meaning : card.meaningKr,
    keywords: isEnglish ? card.keywords : card.keywordsKr
  };
};

// 모든 카드를 현재 언어로 현지화
export const getLocalizedCards = (language: string = 'ko'): TarotCard[] => {
  return TAROT_CARDS.map(card => getLocalizedCard(card, language));
};

// ID로 카드를 찾고 현지화해서 반환
export const getLocalizedCardById = (id: number, language: string = 'ko'): TarotCard | undefined => {
  const card = TAROT_CARDS.find(c => c.id === id);
  return card ? getLocalizedCard(card, language) : undefined;
};

// 슈트별 현지화된 이름 반환
export const getLocalizedSuitName = (suit: string, language: string = 'ko'): string => {
  const suitTranslations: { [key: string]: { ko: string; en: string } } = {
    'Major': { ko: '메이저 아르카나', en: 'Major Arcana' },
    'Wands': { ko: '완드', en: 'Wands' },
    'Cups': { ko: '컵', en: 'Cups' },
    'Swords': { ko: '소드', en: 'Swords' },
    'Pentacles': { ko: '펜타클', en: 'Pentacles' }
  };

  const translation = suitTranslations[suit];
  if (!translation) return suit;
  
  return language === 'en' ? translation.en : translation.ko;
};

// 원소별 현지화된 이름 반환
export const getLocalizedElementName = (element: string, language: string = 'ko'): string => {
  const elementTranslations: { [key: string]: { ko: string; en: string } } = {
    'Fire': { ko: '불', en: 'Fire' },
    'Water': { ko: '물', en: 'Water' },
    'Air': { ko: '공기', en: 'Air' },
    'Earth': { ko: '흙', en: 'Earth' }
  };

  const translation = elementTranslations[element];
  if (!translation) return element;
  
  return language === 'en' ? translation.en : translation.ko;
};

// 카드 타입별 현지화된 이름 반환  
export const getLocalizedCardType = (type: string, language: string = 'ko'): string => {
  const typeTranslations: { [key: string]: { ko: string; en: string } } = {
    'Major Arcana': { ko: '메이저 아르카나', en: 'Major Arcana' },
    'Minor Arcana': { ko: '마이너 아르카나', en: 'Minor Arcana' }
  };

  const translation = typeTranslations[type];
  if (!translation) return type;
  
  return language === 'en' ? translation.en : translation.ko;
};

// === 스프레드 타입 국제화 함수들 ===

// 현재 언어에 따라 스프레드 이름 반환
export const getSpreadName = (spread: SpreadType, language: string = 'ko'): string => {
  return language === 'en' ? spread.name : spread.nameKr;
};

// 현재 언어에 따라 스프레드 설명 반환
export const getSpreadDescription = (spread: SpreadType, language: string = 'ko'): string => {
  return language === 'en' ? spread.description : spread.descriptionKr;
};

// 현재 언어로 현지화된 스프레드 객체 반환
export const getLocalizedSpread = (spread: SpreadType, language: string = 'ko'): SpreadType => {
  const isEnglish = language === 'en';
  
  return {
    ...spread,
    name: isEnglish ? spread.name : spread.nameKr,
    description: isEnglish ? spread.description : spread.descriptionKr
  };
};

// 모든 스프레드를 현재 언어로 현지화
export const getLocalizedSpreads = (language: string = 'ko'): SpreadType[] => {
  return SPREAD_TYPES.map(spread => getLocalizedSpread(spread, language));
};

// ID로 스프레드를 찾고 현지화해서 반환
export const getLocalizedSpreadById = (id: string, language: string = 'ko'): SpreadType | undefined => {
  const spread = SPREAD_TYPES.find(s => s.id === id);
  return spread ? getLocalizedSpread(spread, language) : undefined;
};