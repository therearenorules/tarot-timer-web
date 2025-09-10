// utils/tarotData.ts - React Native용 타로 카드 데이터

export interface TarotCard {
  id: number;
  name: string;
  nameKr: string;
  meaning: string;
  meaningKr: string;
  keywords: string[];
  keywordsKr: string[];
  imageUrl: string | any;
  element: string;
  suit: string;
  type: 'Major Arcana' | 'Minor Arcana';
}

export interface DailyTarotSave {
  id: string;
  date: string; // Date string format
  hourlyCards: TarotCard[]; // 24장의 카드
  memos: { [hour: number]: string }; // 시간별 메모
  insights: string; // 전체 인사이트
  savedAt: string; // ISO string
}

// 명세서에 따른 SpreadType 인터페이스
export interface SpreadType {
  id: string;
  name: string;
  nameKr: string;
  description: string;
  descriptionKr: string;
  cardCount: number;
  isPremium: boolean;
}

// 명세서에 따른 SavedSpread 인터페이스
export interface SavedSpread {
  id: string;
  title: string;
  spreadType: string;
  spreadName: string;
  date: string; // ISO 문자열
  question?: string; // 사용자 질문
  cards: TarotCard[];
  insights: string; // 전체 인사이트
  savedAt: string; // ISO 문자열
}

// 타로 카드 기본 데이터 (78장 중 주요 카드들)
export const TAROT_CARDS: TarotCard[] = [
  // Major Arcana (메이저 아르카나)
  {
    id: 0,
    name: "The Fool",
    nameKr: "바보",
    meaning: "New beginnings, spontaneity, innocence",
    meaningKr: "새로운 시작, 순수함, 모험",
    keywords: ["beginning", "innocence", "journey", "potential"],
    keywordsKr: ["시작", "순수", "여행", "가능성"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Fool",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 1,
    name: "The Magician",
    nameKr: "마법사",
    meaning: "Manifestation, resourcefulness, power",
    meaningKr: "실현, 재능, 힘",
    keywords: ["manifestation", "willpower", "creation", "skill"],
    keywordsKr: ["실현", "의지력", "창조", "기술"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Magician",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 2,
    name: "The High Priestess",
    nameKr: "여교황",
    meaning: "Intuition, sacred knowledge, subconscious",
    meaningKr: "직감, 신성한 지식, 잠재의식",
    keywords: ["intuition", "mystery", "inner knowledge", "subconscious"],
    keywordsKr: ["직감", "신비", "내면의 지식", "잠재의식"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=High+Priestess",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 3,
    name: "The Empress",
    nameKr: "여황제",
    meaning: "Fertility, femininity, beauty, nature",
    meaningKr: "풍요, 여성성, 아름다움, 자연",
    keywords: ["fertility", "abundance", "nurturing", "creativity"],
    keywordsKr: ["풍요", "풍부함", "양육", "창조성"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Empress",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 4,
    name: "The Emperor",
    nameKr: "황제",
    meaning: "Authority, establishment, structure, control",
    meaningKr: "권위, 체계, 구조, 통제",
    keywords: ["authority", "structure", "control", "leadership"],
    keywordsKr: ["권위", "구조", "통제", "리더십"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Emperor",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 5,
    name: "The Hierophant",
    nameKr: "교황",
    meaning: "Spiritual wisdom, religious beliefs, conformity",
    meaningKr: "영적 지혜, 종교적 믿음, 순응",
    keywords: ["tradition", "spiritual guidance", "conformity", "beliefs"],
    keywordsKr: ["전통", "영적 안내", "순응", "믿음"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Hierophant",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 6,
    name: "The Lovers",
    nameKr: "연인들",
    meaning: "Love, harmony, relationships, values alignment",
    meaningKr: "사랑, 조화, 관계, 가치 일치",
    keywords: ["love", "relationships", "choices", "harmony"],
    keywordsKr: ["사랑", "관계", "선택", "조화"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Lovers",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 7,
    name: "The Chariot",
    nameKr: "전차",
    meaning: "Control, willpower, success, determination",
    meaningKr: "통제, 의지력, 성공, 결단력",
    keywords: ["control", "willpower", "victory", "determination"],
    keywordsKr: ["통제", "의지력", "승리", "결단력"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Chariot",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 8,
    name: "Strength",
    nameKr: "힘",
    meaning: "Strength, courage, patience, control",
    meaningKr: "힘, 용기, 인내, 통제",
    keywords: ["inner strength", "courage", "patience", "compassion"],
    keywordsKr: ["내면의 힘", "용기", "인내", "자비"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=Strength",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 9,
    name: "The Hermit",
    nameKr: "은둔자",
    meaning: "Soul searching, introspection, inner guidance",
    meaningKr: "영혼 탐구, 내성, 내적 안내",
    keywords: ["introspection", "meditation", "guidance", "solitude"],
    keywordsKr: ["내성", "명상", "안내", "고독"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Hermit",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    nameKr: "운명의 바퀴",
    meaning: "Good luck, karma, life cycles, destiny",
    meaningKr: "행운, 업보, 생애 주기, 운명",
    keywords: ["fate", "destiny", "cycles", "turning point"],
    keywordsKr: ["운명", "숙명", "순환", "전환점"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=Wheel+of+Fortune",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 11,
    name: "Justice",
    nameKr: "정의",
    meaning: "Justice, fairness, truth, cause and effect",
    meaningKr: "정의, 공정, 진실, 인과응보",
    keywords: ["justice", "balance", "truth", "fairness"],
    keywordsKr: ["정의", "균형", "진실", "공정"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=Justice",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 12,
    name: "The Hanged Man",
    nameKr: "매달린 사람",
    meaning: "Suspension, restriction, letting go",
    meaningKr: "중단, 제한, 놓아주기",
    keywords: ["sacrifice", "waiting", "letting go", "perspective"],
    keywordsKr: ["희생", "기다림", "놓아주기", "관점"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=Hanged+Man",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 13,
    name: "Death",
    nameKr: "죽음",
    meaning: "Endings, beginnings, change, transformation",
    meaningKr: "끝, 시작, 변화, 변환",
    keywords: ["transformation", "endings", "change", "rebirth"],
    keywordsKr: ["변환", "끝", "변화", "재탄생"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=Death",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 14,
    name: "Temperance",
    nameKr: "절제",
    meaning: "Balance, moderation, patience, purpose",
    meaningKr: "균형, 절제, 인내, 목적",
    keywords: ["balance", "moderation", "harmony", "healing"],
    keywordsKr: ["균형", "절제", "조화", "치유"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=Temperance",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 15,
    name: "The Devil",
    nameKr: "악마",
    meaning: "Bondage, addiction, sexuality, materialism",
    meaningKr: "속박, 중독, 물질주의",
    keywords: ["temptation", "bondage", "materialism", "playfulness"],
    keywordsKr: ["유혹", "속박", "물질주의", "장난기"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Devil",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 16,
    name: "The Tower",
    nameKr: "탑",
    meaning: "Sudden change, upheaval, chaos, revelation",
    meaningKr: "급작스런 변화, 격변, 혼돈, 계시",
    keywords: ["sudden change", "upheaval", "awakening", "revelation"],
    keywordsKr: ["급작스런 변화", "격변", "각성", "계시"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Tower",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 17,
    name: "The Star",
    nameKr: "별",
    meaning: "Hope, faith, purpose, renewal, spirituality",
    meaningKr: "희망, 믿음, 목적, 갱신, 영성",
    keywords: ["hope", "faith", "inspiration", "guidance"],
    keywordsKr: ["희망", "믿음", "영감", "안내"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Star",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 18,
    name: "The Moon",
    nameKr: "달",
    meaning: "Illusion, fear, anxiety, subconscious, intuition",
    meaningKr: "환상, 두려움, 불안, 잠재의식, 직감",
    keywords: ["illusion", "intuition", "dreams", "subconscious"],
    keywordsKr: ["환상", "직감", "꿈", "잠재의식"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Moon",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 19,
    name: "The Sun",
    nameKr: "태양",
    meaning: "Happiness, success, optimism, vitality",
    meaningKr: "행복, 성공, 낙관주의, 활력",
    keywords: ["happiness", "success", "optimism", "joy"],
    keywordsKr: ["행복", "성공", "낙관주의", "기쁨"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+Sun",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 20,
    name: "Judgement",
    nameKr: "심판",
    meaning: "Judgement, rebirth, inner calling, absolution",
    meaningKr: "심판, 재탄생, 내적 부름, 사면",
    keywords: ["rebirth", "awakening", "judgement", "forgiveness"],
    keywordsKr: ["재탄생", "각성", "심판", "용서"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=Judgement",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 21,
    name: "The World",
    nameKr: "세계",
    meaning: "Completion, integration, accomplishment, travel",
    meaningKr: "완성, 통합, 성취, 여행",
    keywords: ["completion", "accomplishment", "fulfillment", "success"],
    keywordsKr: ["완성", "성취", "성취감", "성공"],
    imageUrl: "https://via.placeholder.com/300x500/7b2cbf/f4d03f?text=The+World",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  }
];

// 명세서에 따른 스프레드 타입 정의
export const SPREAD_TYPES: SpreadType[] = [
  {
    id: 'one-card',
    name: 'One Card Tarot',
    nameKr: '원 카드 타로',
    description: 'Simple questions or today\'s message',
    descriptionKr: '간단한 질문이나 오늘의 메시지',
    cardCount: 1,
    isPremium: false
  },
  {
    id: 'three-card',
    name: 'Three Card Spread',
    nameKr: '쓰리 카드 스프레드',
    description: 'Past - Present - Future flow',
    descriptionKr: '과거-현재-미래의 흐름 파악',
    cardCount: 3,
    isPremium: false
  },
  {
    id: 'four-card',
    name: 'Four Card Spread',
    nameKr: '포 카드 스프레드',
    description: 'Four aspects analysis',
    descriptionKr: '네 가지 측면 분석',
    cardCount: 4,
    isPremium: false
  },
  {
    id: 'five-card',
    name: 'Five Card V Spread',
    nameKr: '파이브 카드 V 스프레드',
    description: 'V-shaped comprehensive analysis',
    descriptionKr: 'V자 형태의 종합 분석',
    cardCount: 5,
    isPremium: false
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    nameKr: '켈틱 크로스',
    description: 'Comprehensive and deep analysis',
    descriptionKr: '종합적이고 깊이 있는 분석',
    cardCount: 10,
    isPremium: true
  },
  {
    id: 'relationship',
    name: 'Cup of Relationship Spread',
    nameKr: '컵오브릴레이션십 스프레드',
    description: 'Human relationships and love analysis',
    descriptionKr: '인간관계, 연애 문제 분석',
    cardCount: 11,
    isPremium: true
  },
  {
    id: 'choice',
    name: 'AB Choice Spread',
    nameKr: 'AB 선택 스프레드',
    description: 'Decision between two choices',
    descriptionKr: '두 가지 선택지 중 결정',
    cardCount: 7,
    isPremium: true
  }
];

// 유틸리티 함수들
export const TarotUtils = {
  // 랜덤 카드 뽑기
  getRandomCard: (): TarotCard => {
    const randomIndex = Math.floor(Math.random() * TAROT_CARDS.length);
    return TAROT_CARDS[randomIndex];
  },

  // 24장 랜덤 카드 뽑기 (중복 가능)
  getRandomCards: (count: number = 24): TarotCard[] => {
    const cards: TarotCard[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(TarotUtils.getRandomCard());
    }
    return cards;
  },

  // 시간 포맷팅
  formatHour: (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  },

  // 현재 시간 가져오기
  getCurrentHour: (): number => {
    return new Date().getHours();
  },

  // 오늘 날짜 문자열 가져오기
  getTodayDateString: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  // ID로 카드 찾기
  getCardById: (id: number): TarotCard | undefined => {
    return TAROT_CARDS.find(card => card.id === id);
  },

  // 스프레드 타입 찾기
  getSpreadTypeById: (id: string): SpreadType | undefined => {
    return SPREAD_TYPES.find(spread => spread.id === id);
  },

  // 무료 스프레드 타입 가져오기
  getFreeSpreadTypes: (): SpreadType[] => {
    return SPREAD_TYPES.filter(spread => !spread.isPremium);
  },

  // 프리미엄 스프레드 타입 가져오기
  getPremiumSpreadTypes: (): SpreadType[] => {
    return SPREAD_TYPES.filter(spread => spread.isPremium);
  },

  // 스프레드 저장
  saveSpread: async (spread: SavedSpread): Promise<void> => {
    try {
      const existingSpreads = await TarotUtils.loadSavedSpreads();
      const updatedSpreads = [spread, ...existingSpreads];
      await simpleStorage.setItem(STORAGE_KEYS.SPREAD_SAVES, JSON.stringify(updatedSpreads));
    } catch (error) {
      console.error('스프레드 저장 실패:', error);
      throw error;
    }
  },

  // 저장된 스프레드 불러오기
  loadSavedSpreads: async (): Promise<SavedSpread[]> => {
    try {
      const savedData = await simpleStorage.getItem(STORAGE_KEYS.SPREAD_SAVES);
      if (savedData) {
        return JSON.parse(savedData);
      }
      return [];
    } catch (error) {
      console.error('스프레드 로드 실패:', error);
      return [];
    }
  },

  // 특정 스프레드 삭제
  deleteSpread: async (spreadId: string): Promise<void> => {
    try {
      const existingSpreads = await TarotUtils.loadSavedSpreads();
      const updatedSpreads = existingSpreads.filter(spread => spread.id !== spreadId);
      await simpleStorage.setItem(STORAGE_KEYS.SPREAD_SAVES, JSON.stringify(updatedSpreads));
    } catch (error) {
      console.error('스프레드 삭제 실패:', error);
      throw error;
    }
  },

  // 일일 타로 저장
  saveDailyTarot: async (dailyTarot: DailyTarotSave): Promise<void> => {
    try {
      const storageKey = STORAGE_KEYS.DAILY_TAROT + dailyTarot.date;
      await simpleStorage.setItem(storageKey, JSON.stringify(dailyTarot));
    } catch (error) {
      console.error('일일 타로 저장 실패:', error);
      throw error;
    }
  },

  // 특정 날짜 일일 타로 불러오기
  loadDailyTarot: async (date: string): Promise<DailyTarotSave | null> => {
    try {
      const storageKey = STORAGE_KEYS.DAILY_TAROT + date;
      const savedData = await simpleStorage.getItem(storageKey);
      if (savedData) {
        return JSON.parse(savedData);
      }
      return null;
    } catch (error) {
      console.error('일일 타로 로드 실패:', error);
      return null;
    }
  },

  // 오늘의 일일 타로 불러오기
  getTodayDailyTarot: async (): Promise<DailyTarotSave | null> => {
    const today = TarotUtils.getTodayDateString();
    return await TarotUtils.loadDailyTarot(today);
  },

  // 고유 ID 생성
  generateId: (): string => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// 간단한 메모리 저장소 (추후 AsyncStorage로 교체 예정)
class SimpleStorage {
  private storage: { [key: string]: string } = {};

  async setItem(key: string, value: string): Promise<void> {
    this.storage[key] = value;
  }

  async getItem(key: string): Promise<string | null> {
    return this.storage[key] || null;
  }

  async removeItem(key: string): Promise<void> {
    delete this.storage[key];
  }
}

export const simpleStorage = new SimpleStorage();

// 저장소 키 상수
export const STORAGE_KEYS = {
  DAILY_TAROT: 'daily_tarot_',
  TAROT_JOURNAL: 'tarot_journal_',
  SPREAD_SAVES: 'spread_saves',
  USER_SETTINGS: 'user_settings'
};