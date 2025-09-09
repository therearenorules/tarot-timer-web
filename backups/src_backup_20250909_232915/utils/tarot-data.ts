// utils/tarot-data.ts - 웹용 완전한 78장 타로 카드 데이터

export interface TarotCard {
  id: number;
  name: string;
  nameKr: string;
  meaning: string;
  meaningKr: string;
  keywords: string[];
  keywordsKr: string[];
  imageUrl: string;
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

export interface SpreadSave {
  id: string;
  date: string;
  spreadType: string;
  question: string;
  cards: TarotCard[];
  positions: string[];
  interpretation: string;
  insights: string;
  savedAt: string;
}

export interface SpreadType {
  id: string;
  name: string;
  nameKr: string;
  description: string;
  descriptionKr: string;
  isPremium: boolean;
  cardCount: number;
  positions: string[];
  positionsKr: string[];
}

// 스프레드 포지션 인터페이스
export interface SpreadPosition {
  id: string;
  name: string;
  nameKr: string;
  x: number;
  y: number;
  description?: string;
  descriptionKr?: string;
  group?: string;
  isSpecial?: boolean;
  isRotated?: boolean;
  section?: string;
}

// 스프레드 카드 인터페이스
export interface SpreadCard {
  card: TarotCard;
  position: SpreadPosition;
  isRevealed: boolean;
}

// 확장된 스프레드 타입 인터페이스
export interface SpreadTypeExtended extends SpreadType {
  layout: SpreadPosition[];
  instructions?: string;
  instructionsKr?: string;
}

// 저장된 스프레드 인터페이스
export interface SavedSpread {
  id: string;
  spreadType: SpreadTypeExtended;
  cards: SpreadCard[];
  question: string;
  date: string;
  title?: string;
  insights: string;
  spreadName: string;
  savedAt: string;
}

// 현재 시간 관련 유틸리티 함수들
export const getCurrentHour = (): number => {
  return new Date().getHours();
};

export const formatHour = (hour: number): string => {
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}시`;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 타로 카드 이름을 파일명으로 변환하는 함수
export const getCardImagePath = (cardName: string): string => {
  // Major Arcana 매핑 (0-21)
  const majorArcanaMapping: { [key: string]: string } = {
    'The Fool': 'major_00_fool.jpg',
    'The Magician': 'major_01_magician.jpg',
    'The High Priestess': 'major_02_high_priestess.jpg',
    'The Empress': 'major_03_empress.jpg',
    'The Emperor': 'major_04_emperor.jpg',
    'The Hierophant': 'major_05_hierophant.jpg',
    'The Lovers': 'major_06_lovers.jpg',
    'The Chariot': 'major_07_chariot.jpg',
    'Strength': 'major_08_strength.jpg',
    'The Hermit': 'major_09_hermit.jpg',
    'Wheel of Fortune': 'major_10_wheel_of_fortune.jpg',
    'Justice': 'major_11_justice.jpg',
    'The Hanged Man': 'major_12_hanged_man.jpg',
    'Death': 'major_13_death.jpg',
    'Temperance': 'major_14_temperance.jpg',
    'The Devil': 'major_15_devil.jpg',
    'The Tower': 'major_16_tower.jpg',
    'The Star': 'major_17_star.jpg',
    'The Moon': 'major_18_moon.jpg',
    'The Sun': 'major_19_sun.jpg',
    'Judgement': 'major_20_judgement.jpg',
    'The World': 'major_21_world.jpg'
  };

  // Major Arcana 카드인 경우
  if (majorArcanaMapping[cardName]) {
    return `/assets/tarot-cards/${majorArcanaMapping[cardName]}`;
  }

  // Minor Arcana 매핑 로직
  // 카드 이름에서 suit과 rank 추출
  if (cardName.includes(' of ')) {
    const [rank, , suit] = cardName.split(' ');
    const suitMap: { [key: string]: string } = {
      'Cups': 'cups',
      'Wands': 'wands',
      'Swords': 'swords',
      'Pentacles': 'pentacles'
    };

    const rankMap: { [key: string]: string } = {
      'Ace': 'ace',
      'Two': '02',
      'Three': '03',
      'Four': '04',
      'Five': '05',
      'Six': '06',
      'Seven': '07',
      'Eight': '08',
      'Nine': '09',
      'Ten': '10',
      'Page': 'page',
      'Knight': 'knight',
      'Queen': 'queen',
      'King': 'king'
    };

    if (suitMap[suit] && rankMap[rank]) {
      return `/assets/tarot-cards/minor_${suitMap[suit]}_${rankMap[rank]}.jpg`;
    }
  }

  // 매핑되지 않는 경우 fallback 이미지
  return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400';
};

// 완전한 78장 타로 카드 데이터
const ALL_TAROT_CARDS: Omit<TarotCard, 'id'>[] = [
  // 메이저 아르카나 (22장)
  {
    name: 'The Fool',
    nameKr: '바보',
    meaning: 'New beginnings, innocence, spontaneity, free spirit',
    meaningKr: '새로운 시작, 순수함, 자발성, 자유로운 영혼을 의미합니다.',
    keywords: ['beginning', 'innocence', 'adventure', 'faith'],
    keywordsKr: ['시작', '순수함', '모험', '믿음'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Magician',
    nameKr: '마법사',
    meaning: 'Manifestation, resourcefulness, power, inspired action',
    meaningKr: '현실화, 재능, 힘, 영감받은 행동을 의미합니다.',
    keywords: ['manifestation', 'power', 'skill', 'concentration'],
    keywordsKr: ['현실화', '힘', '기술', '집중'],
    imageUrl: 'https://images.unsplash.com/photo-1551431009-a802eeec77b1?w=400',
    element: 'Air',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The High Priestess',
    nameKr: '여교황',
    meaning: 'Intuition, sacred knowledge, divine feminine, subconscious mind',
    meaningKr: '직감, 신성한 지식, 신성한 여성성, 잠재의식을 의미합니다.',
    keywords: ['intuition', 'mystery', 'subconscious', 'wisdom'],
    keywordsKr: ['직감', '신비', '잠재의식', '지혜'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Empress',
    nameKr: '여황제',
    meaning: 'Femininity, beauty, nature, nurturing, abundance',
    meaningKr: '여성성, 아름다움, 자연, 양육, 풍요로움을 의미합니다.',
    keywords: ['abundance', 'nurturing', 'fertility', 'beauty'],
    keywordsKr: ['풍요', '양육', '다산', '아름다움'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Emperor',
    nameKr: '황제',
    meaning: 'Authority, establishment, structure, father figure',
    meaningKr: '권위, 질서, 구조, 아버지 같은 존재를 의미합니다.',
    keywords: ['authority', 'structure', 'control', 'stability'],
    keywordsKr: ['권위', '구조', '통제', '안정'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Hierophant',
    nameKr: '교황',
    meaning: 'Spiritual wisdom, religious beliefs, conformity, tradition',
    meaningKr: '영적 지혜, 종교적 믿음, 순응, 전통을 의미합니다.',
    keywords: ['tradition', 'conformity', 'morality', 'ethics'],
    keywordsKr: ['전통', '순응', '도덕', '윤리'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Lovers',
    nameKr: '연인',
    meaning: 'Love, harmony, relationships, values alignment',
    meaningKr: '사랑, 조화, 인간관계, 가치관의 일치를 의미합니다.',
    keywords: ['love', 'harmony', 'relationships', 'choices'],
    keywordsKr: ['사랑', '조화', '관계', '선택'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Chariot',
    nameKr: '전차',
    meaning: 'Control, willpower, success, determination',
    meaningKr: '통제력, 의지력, 성공, 결단력을 의미합니다.',
    keywords: ['control', 'willpower', 'success', 'determination'],
    keywordsKr: ['통제', '의지력', '성공', '결단력'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'Strength',
    nameKr: '힘',
    meaning: 'Strength, courage, patience, control, compassion',
    meaningKr: '힘, 용기, 인내, 통제력, 연민을 의미합니다.',
    keywords: ['strength', 'courage', 'patience', 'control'],
    keywordsKr: ['힘', '용기', '인내', '통제'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Hermit',
    nameKr: '은둔자',
    meaning: 'Soul searching, introspection, inner guidance',
    meaningKr: '영혼 탐구, 내성, 내적 안내를 의미합니다.',
    keywords: ['introspection', 'search', 'guidance', 'solitude'],
    keywordsKr: ['내성', '탐구', '안내', '고독'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'Wheel of Fortune',
    nameKr: '운명의 수레바퀴',
    meaning: 'Good luck, karma, life cycles, destiny, turning point',
    meaningKr: '행운, 업보, 인생의 순환, 운명, 전환점을 의미합니다.',
    keywords: ['luck', 'karma', 'cycles', 'destiny'],
    keywordsKr: ['행운', '업보', '순환', '운명'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'Justice',
    nameKr: '정의',
    meaning: 'Justice, fairness, truth, cause and effect, law',
    meaningKr: '정의, 공정함, 진실, 인과응보, 법을 의미합니다.',
    keywords: ['justice', 'fairness', 'truth', 'law'],
    keywordsKr: ['정의', '공정함', '진실', '법'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Hanged Man',
    nameKr: '매달린 남자',
    meaning: 'Suspension, restriction, letting go, sacrifice',
    meaningKr: '정지, 제한, 포기, 희생을 의미합니다.',
    keywords: ['suspension', 'restriction', 'letting go', 'sacrifice'],
    keywordsKr: ['정지', '제한', '포기', '희생'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'Death',
    nameKr: '죽음',
    meaning: 'Endings, beginnings, change, transformation, transition',
    meaningKr: '끝, 시작, 변화, 변형, 전환을 의미합니다.',
    keywords: ['endings', 'beginnings', 'change', 'transformation'],
    keywordsKr: ['끝', '시작', '변화', '변형'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'Temperance',
    nameKr: '절제',
    meaning: 'Balance, moderation, patience, purpose',
    meaningKr: '균형, 절제, 인내, 목적을 의미합니다.',
    keywords: ['balance', 'moderation', 'patience', 'purpose'],
    keywordsKr: ['균형', '절제', '인내', '목적'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Devil',
    nameKr: '악마',
    meaning: 'Bondage, addiction, sexuality, materialism',
    meaningKr: '속박, 중독, 성적 욕망, 물질주의를 의미합니다.',
    keywords: ['bondage', 'addiction', 'sexuality', 'materialism'],
    keywordsKr: ['속박', '중독', '욕망', '물질주의'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Tower',
    nameKr: '탑',
    meaning: 'Sudden change, upheaval, chaos, revelation, awakening',
    meaningKr: '갑작스러운 변화, 격변, 혼란, 계시, 각성을 의미합니다.',
    keywords: ['sudden change', 'upheaval', 'chaos', 'revelation'],
    keywordsKr: ['급변', '격변', '혼란', '계시'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Star',
    nameKr: '별',
    meaning: 'Hope, faith, purpose, renewal, spirituality',
    meaningKr: '희망, 믿음, 목적, 갱신, 영성을 의미합니다.',
    keywords: ['hope', 'faith', 'purpose', 'renewal'],
    keywordsKr: ['희망', '믿음', '목적', '갱신'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Moon',
    nameKr: '달',
    meaning: 'Illusion, fear, anxiety, subconscious, intuition',
    meaningKr: '환상, 두려움, 불안, 잠재의식, 직감을 의미합니다.',
    keywords: ['illusion', 'fear', 'anxiety', 'subconscious'],
    keywordsKr: ['환상', '두려움', '불안', '잠재의식'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The Sun',
    nameKr: '태양',
    meaning: 'Happiness, success, optimism, vitality',
    meaningKr: '행복, 성공, 낙관주의, 활력을 의미합니다.',
    keywords: ['happiness', 'success', 'optimism', 'vitality'],
    keywordsKr: ['행복', '성공', '낙관주의', '활력'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'Judgement',
    nameKr: '심판',
    meaning: 'Judgement, rebirth, inner calling, absolution',
    meaningKr: '심판, 재생, 내적 부름, 사면을 의미합니다.',
    keywords: ['judgement', 'rebirth', 'inner calling', 'absolution'],
    keywordsKr: ['심판', '재생', '내적부름', '사면'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Major',
    type: 'Major Arcana'
  },
  {
    name: 'The World',
    nameKr: '세계',
    meaning: 'Completion, accomplishment, travel, success',
    meaningKr: '완성, 성취, 여행, 성공을 의미합니다.',
    keywords: ['completion', 'accomplishment', 'travel', 'success'],
    keywordsKr: ['완성', '성취', '여행', '성공'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Major',
    type: 'Major Arcana'
  },
  
  // 완드 수트 (14장)
  {
    name: 'Ace of Wands',
    nameKr: '완드 에이스',
    meaning: 'Inspiration, new opportunities, growth, creative potential',
    meaningKr: '영감, 새로운 기회, 성장, 창의적 잠재력을 의미합니다.',
    keywords: ['inspiration', 'creativity', 'new beginnings', 'potential'],
    keywordsKr: ['영감', '창의성', '새로운 시작', '잠재력'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Two of Wands',
    nameKr: '완드 2',
    meaning: 'Future planning, making decisions, leaving comfort zone',
    meaningKr: '미래 계획, 결정 내리기, 안전지대 벗어나기를 의미합니다.',
    keywords: ['planning', 'decisions', 'discovery', 'personal power'],
    keywordsKr: ['계획', '결정', '발견', '개인적 힘'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Three of Wands',
    nameKr: '완드 3',
    meaning: 'Expansion, foresight, overseas opportunities, leadership',
    meaningKr: '확장, 선견지명, 해외 기회, 지도력을 의미합니다.',
    keywords: ['expansion', 'foresight', 'leadership', 'planning'],
    keywordsKr: ['확장', '선견지명', '지도력', '계획'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Four of Wands',
    nameKr: '완드 4',
    meaning: 'Celebration, harmony, homecoming, community',
    meaningKr: '축하, 화합, 귀향, 공동체를 의미합니다.',
    keywords: ['celebration', 'harmony', 'home', 'community'],
    keywordsKr: ['축하', '화합', '가정', '공동체'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Five of Wands',
    nameKr: '완드 5',
    meaning: 'Conflict, disagreements, competition, tension',
    meaningKr: '갈등, 의견 불일치, 경쟁, 긴장감을 의미합니다.',
    keywords: ['conflict', 'competition', 'disagreement', 'struggle'],
    keywordsKr: ['갈등', '경쟁', '불일치', '투쟁'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Six of Wands',
    nameKr: '완드 6',
    meaning: 'Success, public recognition, progress, self-confidence',
    meaningKr: '성공, 공개적 인정, 진보, 자신감을 의미합니다.',
    keywords: ['success', 'recognition', 'victory', 'leadership'],
    keywordsKr: ['성공', '인정', '승리', '지도력'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Seven of Wands',
    nameKr: '완드 7',
    meaning: 'Challenge, perseverance, test of faith, defensive',
    meaningKr: '도전, 인내, 믿음의 시험, 방어적 태도를 의미합니다.',
    keywords: ['challenge', 'perseverance', 'defensive', 'maintaining'],
    keywordsKr: ['도전', '인내', '방어', '유지'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Eight of Wands',
    nameKr: '완드 8',
    meaning: 'Swiftness, speed, progress, quick decisions',
    meaningKr: '신속함, 속도, 진전, 빠른 결정을 의미합니다.',
    keywords: ['speed', 'progress', 'movement', 'action'],
    keywordsKr: ['속도', '진전', '움직임', '행동'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Nine of Wands',
    nameKr: '완드 9',
    meaning: 'Resilience, courage, persistence, test of faith',
    meaningKr: '회복력, 용기, 끈기, 믿음의 시험을 의미합니다.',
    keywords: ['resilience', 'persistence', 'courage', 'boundaries'],
    keywordsKr: ['회복력', '끈기', '용기', '경계'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Ten of Wands',
    nameKr: '완드 10',
    meaning: 'Burden, extra responsibility, hard work, achievement',
    meaningKr: '부담, 추가 책임, 힘든 일, 성취를 의미합니다.',
    keywords: ['burden', 'responsibility', 'hard work', 'completion'],
    keywordsKr: ['부담', '책임', '힘든 일', '완성'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Page of Wands',
    nameKr: '완드 페이지',
    meaning: 'Exploration, excitement, freedom, adventure',
    meaningKr: '탐험, 흥분, 자유, 모험을 의미합니다.',
    keywords: ['exploration', 'excitement', 'adventure', 'free spirit'],
    keywordsKr: ['탐험', '흥분', '모험', '자유로운 영혼'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Knight of Wands',
    nameKr: '완드 기사',
    meaning: 'Energy, passion, adventure, impulsiveness',
    meaningKr: '에너지, 열정, 모험, 충동성을 의미합니다.',
    keywords: ['energy', 'passion', 'adventure', 'impulsive'],
    keywordsKr: ['에너지', '열정', '모험', '충동적'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'Queen of Wands',
    nameKr: '완드 여왕',
    meaning: 'Courage, confidence, independence, social butterfly',
    meaningKr: '용기, 자신감, 독립성, 사교적 성격을 의미합니다.',
    keywords: ['confidence', 'independence', 'warmth', 'vibrancy'],
    keywordsKr: ['자신감', '독립성', '온화함', '활기'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  {
    name: 'King of Wands',
    nameKr: '완드 왕',
    meaning: 'Natural leader, vision, entrepreneur, honour',
    meaningKr: '타고난 지도자, 비전, 기업가 정신, 명예를 의미합니다.',
    keywords: ['leadership', 'vision', 'entrepreneur', 'honour'],
    keywordsKr: ['지도력', '비전', '기업가정신', '명예'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Fire',
    suit: 'Wands',
    type: 'Minor Arcana'
  },
  
  // 컵 수트 (14장)
  {
    name: 'Ace of Cups',
    nameKr: '컵 에이스',
    meaning: 'New relationships, compassion, creativity, love',
    meaningKr: '새로운 관계, 연민, 창의성, 사랑을 의미합니다.',
    keywords: ['love', 'relationships', 'compassion', 'creativity'],
    keywordsKr: ['사랑', '관계', '연민', '창의성'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Two of Cups',
    nameKr: '컵 2',
    meaning: 'Unified love, partnership, mutual attraction, relationships',
    meaningKr: '하나된 사랑, 파트너십, 상호 매력, 관계를 의미합니다.',
    keywords: ['partnership', 'unity', 'love', 'mutual attraction'],
    keywordsKr: ['파트너십', '통합', '사랑', '상호매력'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Three of Cups',
    nameKr: '컵 3',
    meaning: 'Celebration, friendship, creativity, community',
    meaningKr: '축하, 우정, 창의성, 공동체를 의미합니다.',
    keywords: ['celebration', 'friendship', 'creativity', 'community'],
    keywordsKr: ['축하', '우정', '창의성', '공동체'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Four of Cups',
    nameKr: '컵 4',
    meaning: 'Meditation, contemplation, apathy, reevaluation',
    meaningKr: '명상, 숙고, 무관심, 재평가를 의미합니다.',
    keywords: ['meditation', 'contemplation', 'apathy', 'missed opportunities'],
    keywordsKr: ['명상', '숙고', '무관심', '놓친기회'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Five of Cups',
    nameKr: '컵 5',
    meaning: 'Regret, failure, disappointment, pessimism',
    meaningKr: '후회, 실패, 실망, 비관주의를 의미합니다.',
    keywords: ['regret', 'failure', 'disappointment', 'loss'],
    keywordsKr: ['후회', '실패', '실망', '손실'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Six of Cups',
    nameKr: '컵 6',
    meaning: 'Revisiting the past, childhood memories, innocence',
    meaningKr: '과거 재방문, 어린 시절 추억, 순수함을 의미합니다.',
    keywords: ['nostalgia', 'childhood', 'innocence', 'reunion'],
    keywordsKr: ['향수', '어린시절', '순수함', '재회'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Seven of Cups',
    nameKr: '컵 7',
    meaning: 'Opportunities, choices, wishful thinking, illusion',
    meaningKr: '기회들, 선택들, 희망사항, 환상을 의미합니다.',
    keywords: ['opportunities', 'choices', 'illusion', 'fantasy'],
    keywordsKr: ['기회들', '선택들', '환상', '판타지'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Eight of Cups',
    nameKr: '컵 8',
    meaning: 'Disappointment, abandonment, withdrawal, escapism',
    meaningKr: '실망, 포기, 철수, 도피주의를 의미합니다.',
    keywords: ['disappointment', 'abandonment', 'withdrawal', 'seeking deeper meaning'],
    keywordsKr: ['실망', '포기', '철수', '깊은의미추구'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Nine of Cups',
    nameKr: '컵 9',
    meaning: 'Contentment, satisfaction, gratitude, wish come true',
    meaningKr: '만족, 충족감, 감사, 소원 성취를 의미합니다.',
    keywords: ['contentment', 'satisfaction', 'gratitude', 'wishes fulfilled'],
    keywordsKr: ['만족', '충족감', '감사', '소원성취'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Ten of Cups',
    nameKr: '컵 10',
    meaning: 'Divine love, blissful relationships, harmony, alignment',
    meaningKr: '신성한 사랑, 축복받은 관계, 조화, 일치를 의미합니다.',
    keywords: ['happiness', 'harmony', 'alignment', 'bliss'],
    keywordsKr: ['행복', '조화', '일치', '축복'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Page of Cups',
    nameKr: '컵 페이지',
    meaning: 'Creative opportunities, intuitive messages, curiosity',
    meaningKr: '창의적 기회, 직관적 메시지, 호기심을 의미합니다.',
    keywords: ['creativity', 'intuition', 'curiosity', 'new ideas'],
    keywordsKr: ['창의성', '직관', '호기심', '새로운아이디어'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Knight of Cups',
    nameKr: '컵 기사',
    meaning: 'Romance, charm, "knight in shining armor", idealist',
    meaningKr: '로맨스, 매력, "빛나는 갑옷의 기사", 이상주의자를 의미합니다.',
    keywords: ['romance', 'charm', 'idealism', 'following heart'],
    keywordsKr: ['로맨스', '매력', '이상주의', '마음따라가기'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'Queen of Cups',
    nameKr: '컵 여왕',
    meaning: 'Compassion, warmth, kindness, intuition',
    meaningKr: '연민, 온화함, 친절함, 직관을 의미합니다.',
    keywords: ['compassion', 'warmth', 'kindness', 'intuition'],
    keywordsKr: ['연민', '온화함', '친절함', '직관'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  {
    name: 'King of Cups',
    nameKr: '컵 왕',
    meaning: 'Emotional balance, compassion, diplomacy, calmness',
    meaningKr: '감정적 균형, 연민, 외교술, 평온함을 의미합니다.',
    keywords: ['emotional balance', 'compassion', 'diplomacy', 'calmness'],
    keywordsKr: ['감정적균형', '연민', '외교술', '평온함'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Water',
    suit: 'Cups',
    type: 'Minor Arcana'
  },
  
  // 검 수트 (14장)
  {
    name: 'Ace of Swords',
    nameKr: '검 에이스',
    meaning: 'Breakthrough, clarity, sharp mind, new ideas',
    meaningKr: '돌파구, 명료함, 예리한 정신, 새로운 아이디어를 의미합니다.',
    keywords: ['breakthrough', 'clarity', 'mental clarity', 'new ideas'],
    keywordsKr: ['돌파구', '명료함', '정신적명료함', '새로운아이디어'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Two of Swords',
    nameKr: '검 2',
    meaning: 'Difficult decisions, weighing options, an impasse',
    meaningKr: '어려운 결정, 선택 저울질, 교착상태를 의미합니다.',
    keywords: ['difficult decisions', 'weighing options', 'impasse', 'blocked emotions'],
    keywordsKr: ['어려운결정', '선택저울질', '교착상태', '막힌감정'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Three of Swords',
    nameKr: '검 3',
    meaning: 'Heartbreak, emotional pain, sorrow, grief',
    meaningKr: '상심, 감정적 고통, 슬픔, 애도를 의미합니다.',
    keywords: ['heartbreak', 'emotional pain', 'sorrow', 'grief'],
    keywordsKr: ['상심', '감정적고통', '슬픔', '애도'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Four of Swords',
    nameKr: '검 4',
    meaning: 'Rest, relaxation, meditation, contemplation',
    meaningKr: '휴식, 이완, 명상, 사색을 의미합니다.',
    keywords: ['rest', 'relaxation', 'meditation', 'contemplation'],
    keywordsKr: ['휴식', '이완', '명상', '사색'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Five of Swords',
    nameKr: '검 5',
    meaning: 'Conflict, disagreements, competition, defeat',
    meaningKr: '갈등, 의견 불일치, 경쟁, 패배를 의미합니다.',
    keywords: ['conflict', 'disagreements', 'competition', 'win at all costs'],
    keywordsKr: ['갈등', '의견불일치', '경쟁', '무리한승리'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Six of Swords',
    nameKr: '검 6',
    meaning: 'Transition, change, rite of passage, moving on',
    meaningKr: '전환, 변화, 통과의례, 앞으로 나아가기를 의미합니다.',
    keywords: ['transition', 'change', 'rite of passage', 'moving on'],
    keywordsKr: ['전환', '변화', '통과의례', '앞으로나아가기'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Seven of Swords',
    nameKr: '검 7',
    meaning: 'Betrayal, deception, getting away with something',
    meaningKr: '배신, 속임수, 어떤 일을 넘기는 것을 의미합니다.',
    keywords: ['betrayal', 'deception', 'getting away with something', 'strategic withdrawal'],
    keywordsKr: ['배신', '속임수', '어떤일을넘기기', '전략적철수'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Eight of Swords',
    nameKr: '검 8',
    meaning: 'Imprisonment, entrapment, self-victimization',
    meaningKr: '감금, 함정, 자기 희생양 만들기를 의미합니다.',
    keywords: ['imprisonment', 'entrapment', 'self-victimization', 'negative thoughts'],
    keywordsKr: ['감금', '함정', '자기희생양만들기', '부정적생각'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Nine of Swords',
    nameKr: '검 9',
    meaning: 'Anxiety, worry, fear, depression, nightmares',
    meaningKr: '불안, 걱정, 두려움, 우울, 악몽을 의미합니다.',
    keywords: ['anxiety', 'worry', 'fear', 'depression'],
    keywordsKr: ['불안', '걱정', '두려움', '우울'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Ten of Swords',
    nameKr: '검 10',
    meaning: 'Painful endings, deep wounds, betrayal, loss',
    meaningKr: '고통스러운 끝, 깊은 상처, 배신, 손실을 의미합니다.',
    keywords: ['painful endings', 'deep wounds', 'betrayal', 'loss'],
    keywordsKr: ['고통스러운끝', '깊은상처', '배신', '손실'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Page of Swords',
    nameKr: '검 페이지',
    meaning: 'Curiosity, restlessness, mental energy, vigilance',
    meaningKr: '호기심, 불안함, 정신적 에너지, 경계심을 의미합니다.',
    keywords: ['curiosity', 'restlessness', 'mental energy', 'vigilance'],
    keywordsKr: ['호기심', '불안함', '정신적에너지', '경계심'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Knight of Swords',
    nameKr: '검 기사',
    meaning: 'Ambitious, action-oriented, driven to succeed',
    meaningKr: '야심찬, 행동 지향적, 성공 욕구가 강한 것을 의미합니다.',
    keywords: ['ambitious', 'action-oriented', 'driven to succeed', 'fast thinking'],
    keywordsKr: ['야심찬', '행동지향적', '성공욕구강한', '빠른사고'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'Queen of Swords',
    nameKr: '검 여왕',
    meaning: 'Independence, unbiased judgement, clear boundaries',
    meaningKr: '독립성, 편견 없는 판단, 명확한 경계를 의미합니다.',
    keywords: ['independence', 'unbiased judgement', 'clear boundaries', 'direct communication'],
    keywordsKr: ['독립성', '편견없는판단', '명확한경계', '직접적소통'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  {
    name: 'King of Swords',
    nameKr: '검 왕',
    meaning: 'Mental clarity, intellectual power, authority, truth',
    meaningKr: '정신적 명료함, 지적 힘, 권위, 진실을 의미합니다.',
    keywords: ['mental clarity', 'intellectual power', 'authority', 'truth'],
    keywordsKr: ['정신적명료함', '지적힘', '권위', '진실'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Air',
    suit: 'Swords',
    type: 'Minor Arcana'
  },
  
  // 펜타클 수트 (14장)
  {
    name: 'Ace of Pentacles',
    nameKr: '펜타클 에이스',
    meaning: 'Manifestation, new financial opportunity, prosperity',
    meaningKr: '실현, 새로운 재정 기회, 번영을 의미합니다.',
    keywords: ['manifestation', 'prosperity', 'new opportunity', 'abundance'],
    keywordsKr: ['실현', '번영', '새로운기회', '풍요'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Two of Pentacles',
    nameKr: '펜타클 2',
    meaning: 'Multiple priorities, time management, prioritisation',
    meaningKr: '다중 우선순위, 시간 관리, 우선순위 매기기를 의미합니다.',
    keywords: ['multiple priorities', 'time management', 'prioritisation', 'adaptability'],
    keywordsKr: ['다중우선순위', '시간관리', '우선순위매기기', '적응성'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Three of Pentacles',
    nameKr: '펜타클 3',
    meaning: 'Teamwork, collaboration, learning, implementation',
    meaningKr: '팀워크, 협력, 학습, 구현을 의미합니다.',
    keywords: ['teamwork', 'collaboration', 'learning', 'implementation'],
    keywordsKr: ['팀워크', '협력', '학습', '구현'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Four of Pentacles',
    nameKr: '펜타클 4',
    meaning: 'Saving money, security, conservatism, scarcity',
    meaningKr: '돈 저축, 보안, 보수주의, 부족함을 의미합니다.',
    keywords: ['saving money', 'security', 'conservatism', 'control'],
    keywordsKr: ['돈저축', '보안', '보수주의', '통제'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Five of Pentacles',
    nameKr: '펜타클 5',
    meaning: 'Financial loss, poverty, lack mindset, isolation',
    meaningKr: '재정 손실, 가난, 결핍 사고, 고립을 의미합니다.',
    keywords: ['financial loss', 'poverty', 'lack mindset', 'isolation'],
    keywordsKr: ['재정손실', '가난', '결핍사고', '고립'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Six of Pentacles',
    nameKr: '펜타클 6',
    meaning: 'Giving, receiving, sharing wealth, generosity',
    meaningKr: '주기, 받기, 부의 나눔, 관대함을 의미합니다.',
    keywords: ['giving', 'receiving', 'sharing wealth', 'generosity'],
    keywordsKr: ['주기', '받기', '부의나눔', '관대함'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Seven of Pentacles',
    nameKr: '펜타클 7',
    meaning: 'Long-term view, sustainable results, perseverance',
    meaningKr: '장기적 관점, 지속 가능한 결과, 인내를 의미합니다.',
    keywords: ['long-term view', 'sustainable results', 'perseverance', 'investment'],
    keywordsKr: ['장기적관점', '지속가능한결과', '인내', '투자'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Eight of Pentacles',
    nameKr: '펜타클 8',
    meaning: 'Apprenticeship, repetitive tasks, mastery, skill development',
    meaningKr: '견습, 반복 작업, 숙련, 기술 개발을 의미합니다.',
    keywords: ['apprenticeship', 'repetitive tasks', 'mastery', 'skill development'],
    keywordsKr: ['견습', '반복작업', '숙련', '기술개발'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Nine of Pentacles',
    nameKr: '펜타클 9',
    meaning: 'Abundance, luxury, self-sufficiency, financial independence',
    meaningKr: '풍요, 사치, 자급자족, 재정 독립을 의미합니다.',
    keywords: ['abundance', 'luxury', 'self-sufficiency', 'financial independence'],
    keywordsKr: ['풍요', '사치', '자급자족', '재정독립'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Ten of Pentacles',
    nameKr: '펜타클 10',
    meaning: 'Wealth, financial security, family, long-term success',
    meaningKr: '부, 재정 안정, 가족, 장기적 성공을 의미합니다.',
    keywords: ['wealth', 'financial security', 'family', 'long-term success'],
    keywordsKr: ['부', '재정안정', '가족', '장기적성공'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Page of Pentacles',
    nameKr: '펜타클 페이지',
    meaning: 'Manifestation, financial opportunity, skill development',
    meaningKr: '현실화, 재정 기회, 기술 개발을 의미합니다.',
    keywords: ['manifestation', 'financial opportunity', 'skill development', 'studiousness'],
    keywordsKr: ['현실화', '재정기회', '기술개발', '근면함'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Knight of Pentacles',
    nameKr: '펜타클 기사',
    meaning: 'Hard work, productivity, routine, conservatism',
    meaningKr: '근면한 일, 생산성, 일상, 보수주의를 의미합니다.',
    keywords: ['hard work', 'productivity', 'routine', 'conservatism'],
    keywordsKr: ['근면한일', '생산성', '일상', '보수주의'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'Queen of Pentacles',
    nameKr: '펜타클 여왕',
    meaning: 'Nurturing, practical, providing financially and emotionally',
    meaningKr: '양육, 실용적, 재정적·감정적 제공을 의미합니다.',
    keywords: ['nurturing', 'practical', 'providing financially', 'down to earth'],
    keywordsKr: ['양육', '실용적', '재정적제공', '현실적'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  },
  {
    name: 'King of Pentacles',
    nameKr: '펜타클 왕',
    meaning: 'Financial success, leadership, security, disciplined',
    meaningKr: '재정적 성공, 지도력, 안전, 규율을 의미합니다.',
    keywords: ['financial success', 'leadership', 'security', 'disciplined'],
    keywordsKr: ['재정적성공', '지도력', '안전', '규율'],
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    element: 'Earth',
    suit: 'Pentacles',
    type: 'Minor Arcana'
  }
];

// 24시간 카드 생성 함수
export const generateDailyCards = (seedDate: Date): TarotCard[] => {
  const seed = seedDate.getFullYear() * 10000 + 
               (seedDate.getMonth() + 1) * 100 + 
               seedDate.getDate();
  
  const cards: TarotCard[] = [];
  let randomSeed = seed;
  
  // 의사랜덤 함수
  const seededRandom = () => {
    randomSeed = (randomSeed * 9301 + 49297) % 233280;
    return randomSeed / 233280;
  };
  
  // 24장의 카드 생성 (중복 허용)
  for (let hour = 0; hour < 24; hour++) {
    const cardIndex = Math.floor(seededRandom() * ALL_TAROT_CARDS.length);
    const baseCard = ALL_TAROT_CARDS[cardIndex];
    
    const card: TarotCard = {
      ...baseCard,
      id: hour + 1, // 시간별 고유 ID
    };
    
    cards.push(card);
  }
  
  return cards;
};

// 스프레드용 카드 생성 함수
export const generateSpreadCards = (spreadType: SpreadTypeExtended): TarotCard[] => {
  const allCards = getAllCards();
  const usedCards = new Set<number>();
  const selectedCards: TarotCard[] = [];
  
  for (let i = 0; i < spreadType.cardCount; i++) {
    let cardIndex;
    do {
      cardIndex = Math.floor(Math.random() * allCards.length);
    } while (usedCards.has(cardIndex) && usedCards.size < allCards.length);
    
    if (usedCards.size < allCards.length) {
      usedCards.add(cardIndex);
    }
    
    selectedCards.push(allCards[cardIndex] || allCards[0]);
  }
  
  return selectedCards;
};

// localStorage 관리 함수들 (웹용)
const DAILY_TAROT_KEY = 'daily_tarot_saves';
const SPREAD_SAVES_KEY = 'spread_saves';

export const saveDailyTarot = async (save: DailyTarotSave): Promise<void> => {
  try {
    const existingSaves = await loadDailyTarotSaves();
    const updatedSaves = existingSaves.filter(s => s.date !== save.date);
    updatedSaves.push(save);
    
    // 최근 30일 기록만 유지
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredSaves = updatedSaves.filter(s => 
      new Date(s.date) >= thirtyDaysAgo
    );
    
    localStorage.setItem(DAILY_TAROT_KEY, JSON.stringify(filteredSaves));
  } catch (error) {
    console.error('Error saving daily tarot:', error);
    throw error;
  }
};

export const loadDailyTarotSaves = async (): Promise<DailyTarotSave[]> => {
  try {
    const saved = localStorage.getItem(DAILY_TAROT_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading daily tarot saves:', error);
    return [];
  }
};

export const getTodaysSave = async (): Promise<DailyTarotSave | null> => {
  try {
    const today = new Date().toDateString();
    const saves = await loadDailyTarotSaves();
    return saves.find(save => save.date === today) || null;
  } catch (error) {
    console.error('Error getting today\'s save:', error);
    return null;
  }
};

export const saveSpreadReading = async (save: SpreadSave): Promise<void> => {
  try {
    const existingSaves = await loadSpreadSaves();
    existingSaves.unshift(save); // 최신순으로 추가
    
    // 최대 100개 기록만 유지
    const limitedSaves = existingSaves.slice(0, 100);
    
    localStorage.setItem(SPREAD_SAVES_KEY, JSON.stringify(limitedSaves));
  } catch (error) {
    console.error('Error saving spread reading:', error);
    throw error;
  }
};

export const loadSpreadSaves = async (): Promise<SpreadSave[]> => {
  try {
    const saved = localStorage.getItem(SPREAD_SAVES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading spread saves:', error);
    return [];
  }
};

export const SPREAD_TYPES: SpreadTypeExtended[] = [
  {
    id: 'one-card',
    name: 'One Card Spread',
    nameKr: '1카드 스프레드',
    description: 'A simple yet powerful spread for daily guidance.',
    descriptionKr: '오늘 하루의 핵심 메시지를 전달하는 간단하고 강력한 스프레드입니다.',
    isPremium: false,
    cardCount: 1,
    positions: ['Present Situation'],
    positionsKr: ['현재 상황'],
    layout: [
      { id: 'center', name: 'Present Situation', nameKr: '현재 상황', x: 50, y: 50 }
    ],
    instructions: 'Focus on your question and draw a single card for guidance.',
    instructionsKr: '질문에 집중하며 하나의 카드를 뽑아 조언을 받으세요.'
  },
  {
    id: 'three-card',
    name: 'Three Card Spread',
    nameKr: '3카드 스프레드',
    description: 'Past, present, and future insights.',
    descriptionKr: '과거, 현재, 미래의 흐름을 보여주는 기본적인 스프레드입니다.',
    isPremium: false,
    cardCount: 3,
    positions: ['Past', 'Present', 'Future'],
    positionsKr: ['과거', '현재', '미래'],
    layout: [
      { id: 'past', name: 'Past', nameKr: '과거', x: 20, y: 50 },
      { id: 'present', name: 'Present', nameKr: '현재', x: 50, y: 50 },
      { id: 'future', name: 'Future', nameKr: '미래', x: 80, y: 50 }
    ],
    instructions: 'Draw three cards to understand the timeline of your situation.',
    instructionsKr: '상황의 시간적 흐름을 이해하기 위해 세 장의 카드를 뽑으세요.'
  },
  {
    id: 'four-elements',
    name: 'Four Elements Spread',
    nameKr: '4원소 스프레드',
    description: 'Explore the four elements within your situation.',
    descriptionKr: '상황 속 네 가지 원소의 균형을 탐색하는 스프레드입니다.',
    isPremium: false,
    cardCount: 4,
    positions: ['Fire (Passion)', 'Water (Emotion)', 'Air (Thought)', 'Earth (Material)'],
    positionsKr: ['불 (열정)', '물 (감정)', '공기 (생각)', '땅 (물질)'],
    layout: [
      { id: 'fire', name: 'Fire (Passion)', nameKr: '불 (열정)', x: 50, y: 20 },
      { id: 'water', name: 'Water (Emotion)', nameKr: '물 (감정)', x: 80, y: 50 },
      { id: 'air', name: 'Air (Thought)', nameKr: '공기 (생각)', x: 50, y: 80 },
      { id: 'earth', name: 'Earth (Material)', nameKr: '땅 (물질)', x: 20, y: 50 }
    ],
    instructions: 'Explore the elemental balance in your situation.',
    instructionsKr: '상황 속 원소들의 균형을 탐구해보세요.'
  },
  {
    id: 'five-card-v',
    name: 'Five Card V-Spread',
    nameKr: '5카드 V 스프레드',
    description: 'A V-shaped spread for comprehensive insight.',
    descriptionKr: 'V자 형태로 배치하여 포괄적인 통찰을 얻는 스프레드입니다.',
    isPremium: false,
    cardCount: 5,
    positions: ['Distant Past', 'Recent Past', 'Present', 'Near Future', 'Distant Future'],
    positionsKr: ['먼 과거', '최근 과거', '현재', '가까운 미래', '먼 미래'],
    layout: [
      { id: 'distant-past', name: 'Distant Past', nameKr: '먼 과거', x: 10, y: 20 },
      { id: 'recent-past', name: 'Recent Past', nameKr: '최근 과거', x: 30, y: 40 },
      { id: 'present', name: 'Present', nameKr: '현재', x: 50, y: 60 },
      { id: 'near-future', name: 'Near Future', nameKr: '가까운 미래', x: 70, y: 40 },
      { id: 'distant-future', name: 'Distant Future', nameKr: '먼 미래', x: 90, y: 20 }
    ],
    instructions: 'Draw cards in a V-shape to see the full timeline.',
    instructionsKr: 'V자 형태로 카드를 배치해 전체 시간의 흐름을 확인하세요.'
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    nameKr: '켈틱 크로스',
    description: 'The most comprehensive tarot spread for deep insights.',
    descriptionKr: '타로의 왕좌, 가장 완벽하고 깊이 있는 통찰을 제공하는 전문가 스프레드입니다.',
    isPremium: true,
    cardCount: 10,
    positions: [
      'Present Situation',
      'Cross/Challenge', 
      'Distant Past/Foundation',
      'Recent Past',
      'Possible Outcome',
      'Immediate Future',
      'Your Approach',
      'External Influences',
      'Hopes and Fears',
      'Final Outcome'
    ],
    positionsKr: [
      '현재 상황',
      '장애물/도전',
      '먼 과거/기반',
      '최근 과거',
      '가능한 결과',
      '가까운 미래',
      '당신의 접근법',
      '외부 영향',
      '희망과 두려움',
      '최종 결과'
    ],
    layout: [
      { id: 'present', name: 'Present Situation', nameKr: '현재 상황', x: 35, y: 50, section: 'cross' },
      { id: 'cross', name: 'Cross/Challenge', nameKr: '장애물/도전', x: 35, y: 50, isRotated: true, section: 'cross' },
      { id: 'foundation', name: 'Distant Past/Foundation', nameKr: '먼 과거/기반', x: 35, y: 80, section: 'cross' },
      { id: 'past', name: 'Recent Past', nameKr: '최근 과거', x: 15, y: 50, section: 'cross' },
      { id: 'crown', name: 'Possible Outcome', nameKr: '가능한 결과', x: 35, y: 20, section: 'cross' },
      { id: 'future', name: 'Immediate Future', nameKr: '가까운 미래', x: 55, y: 50, section: 'cross' },
      { id: 'approach', name: 'Your Approach', nameKr: '당신의 접근법', x: 75, y: 95, section: 'staff' },
      { id: 'external', name: 'External Influences', nameKr: '외부 영향', x: 75, y: 70, section: 'staff' },
      { id: 'hopes-fears', name: 'Hopes and Fears', nameKr: '희망과 두려움', x: 75, y: 30, section: 'staff' },
      { id: 'outcome', name: 'Final Outcome', nameKr: '최종 결과', x: 75, y: 5, section: 'staff' }
    ],
    instructions: 'The ultimate spread for complex situations requiring deep analysis.',
    instructionsKr: '복잡한 상황의 깊이 있는 분석을 위한 궁극의 스프레드입니다.'
  },
  {
    id: 'relationship-spread',
    name: 'Cup of Relationship',
    nameKr: '컵 오브 릴레이션십',
    description: 'Explore the dynamics of any relationship.',
    descriptionKr: '모든 관계의 역학을 깊이 있게 탐구하는 전문 스프레드입니다.',
    isPremium: true,
    cardCount: 11,
    positions: [
      'Foundation',
      'Growth Potential',
      'Future of Relationship',
      'Relationship Advice',
      'Heart of Relationship',
      'Relationship Challenge',
      'Your Feelings',
      'Their Feelings',
      'Past Relationship Pattern',
      'Hidden Influences',
      'Core Relationship Theme'
    ],
    positionsKr: [
      '관계의 기반',
      '관계의 성장',
      '관계의 미래',
      '관계 조언',
      '관계의 중심',
      '관계의 도전',
      '당신의 감정',
      '상대방의 감정',
      '과거 관계 패턴',
      '숨겨진 영향',
      '관계 핵심 테마'
    ],
    layout: [
      { id: 'foundation', name: 'Foundation', nameKr: '관계의 기반', x: 20, y: 99, section: 'bottom' },
      { id: 'growth', name: 'Growth Potential', nameKr: '관계의 성장', x: 80, y: 99, section: 'bottom' },
      { id: 'future', name: 'Future of Relationship', nameKr: '관계의 미래', x: 50, y: 99, section: 'bottom' },
      { id: 'advice', name: 'Relationship Advice', nameKr: '관계 조언', x: 50, y: 71, section: 'bottom' },
      { id: 'heart', name: 'Heart of Relationship', nameKr: '관계의 중심', x: 50, y: 41, section: 'center', isSpecial: true },
      { id: 'challenge', name: 'Relationship Challenge', nameKr: '관계의 도전', x: 65, y: 58, section: 'center' },
      { id: 'your-feelings', name: 'Your Feelings', nameKr: '당신의 감정', x: 35, y: 28, section: 'middle' },
      { id: 'their-feelings', name: 'Their Feelings', nameKr: '상대방의 감정', x: 65, y: 28, section: 'middle' },
      { id: 'past-pattern', name: 'Past Relationship Pattern', nameKr: '과거 관계 패턴', x: 20, y: 2, section: 'top' },
      { id: 'hidden', name: 'Hidden Influences', nameKr: '숨겨진 영향', x: 80, y: 2, section: 'top' },
      { id: 'core-theme', name: 'Core Relationship Theme', nameKr: '관계 핵심 테마', x: 50, y: 2, section: 'top', isSpecial: true }
    ],
    instructions: 'Explore the complete dynamics and potential of any relationship with 11 cards.',
    instructionsKr: '11장의 카드로 모든 관계의 완전한 역학과 잠재력을 탐구해보세요.'
  },
  {
    id: 'choice-spread',
    name: 'A or B Choice Spread',
    nameKr: 'A/B 선택 스프레드',
    description: 'When facing a difficult decision between two options.',
    descriptionKr: '두 가지 선택 사이에서 고민할 때 명확한 방향을 제시하는 스프레드입니다.',
    isPremium: true,
    cardCount: 7,
    positions: [
      'A: Advantages',
      'A: Challenges', 
      'A: Outcome',
      'Guidance',
      'B: Advantages',
      'B: Challenges',
      'B: Outcome'
    ],
    positionsKr: [
      'A: 장점',
      'A: 단점',
      'A: 결과',
      '조언',
      'B: 장점',
      'B: 단점',
      'B: 결과'
    ],
    layout: [
      { id: 'a-advantages', name: 'A: Advantages', nameKr: 'A: 장점', x: 25, y: 25, group: 'A' },
      { id: 'a-challenges', name: 'A: Challenges', nameKr: 'A: 단점', x: 25, y: 50, group: 'A' },
      { id: 'a-outcome', name: 'A: Outcome', nameKr: 'A: 결과', x: 25, y: 75, group: 'A' },
      { id: 'guidance', name: 'Guidance', nameKr: '조언', x: 50, y: 50, group: 'Advice', isSpecial: true },
      { id: 'b-advantages', name: 'B: Advantages', nameKr: 'B: 장점', x: 75, y: 25, group: 'B' },
      { id: 'b-challenges', name: 'B: Challenges', nameKr: 'B: 단점', x: 75, y: 50, group: 'B' },
      { id: 'b-outcome', name: 'B: Outcome', nameKr: 'B: 결과', x: 75, y: 75, group: 'B' }
    ],
    instructions: 'Compare two choices: their advantages, challenges, and likely outcomes, with central guidance.',
    instructionsKr: '두 선택의 장단점과 결과를 비교하고 중앙의 조언을 받으세요.'
  }
];
// 샘플 데이터 생성 함수들
export const generateSampleDailyData = (): DailyTarotSave[] => {
  const samples: DailyTarotSave[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const cards = generateDailyCards(date);
    const memos: { [hour: number]: string } = {};
    
    // 랜덤하게 몇 시간에 메모 추가
    for (let hour = 0; hour < 24; hour++) {
      if (Math.random() > 0.7) {
        memos[hour] = `${hour}시의 특별한 메시지입니다.`;
      }
    }
    
    samples.push({
      id: `daily-${date.toDateString()}`,
      date: date.toDateString(),
      hourlyCards: cards,
      memos,
      insights: `${formatDate(date)}의 전체적인 흐름과 메시지입니다.`,
      savedAt: date.toISOString()
    });
  }
  
  return samples;
};

export const generateSampleSpreadData = (): SpreadSave[] => {
  const samples: SpreadSave[] = [];
  const questions = [
    "오늘 하루 어떻게 보내야 할까요?",
    "새로운 프로젝트를 시작해도 될까요?",
    "지금 상황에서 가장 중요한 것은 무엇인가요?",
    "앞으로의 관계는 어떻게 될까요?",
    "내가 놓치고 있는 것은 무엇인가요?"
  ];
  
  SPREAD_TYPES.forEach((spreadType, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    
    const cards = generateSpreadCards(spreadType);
    
    samples.push({
      id: `spread-${spreadType.id}-${date.toDateString()}`,
      date: date.toDateString(),
      spreadType: spreadType.id,
      question: questions[index % questions.length],
      cards,
      positions: spreadType.positions,
      interpretation: `${spreadType.nameKr}으로 본 해석입니다.`,
      insights: `${formatDate(date)}에 받은 메시지와 통찰입니다.`,
      savedAt: date.toISOString()
    });
  });
  
  return samples;
};

// 유틸리티 함수들
export const getCardById = (id: number): TarotCard | undefined => {
  const card = ALL_TAROT_CARDS.map((card, index) => ({ ...card, id: index + 1 })).find(card => card.id === id);
  if (card) {
    return {
      ...card,
      imageUrl: getCardImagePath(card.name)
    };
  }
  return undefined;
};

export const getSpreadTypeById = (id: string): SpreadTypeExtended | undefined => {
  return SPREAD_TYPES.find(spread => spread.id === id);
};

export const shuffleCards = (cards: TarotCard[]): TarotCard[] => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomCards = (count: number): TarotCard[] => {
  const allCardsWithId = ALL_TAROT_CARDS.map((card, index) => ({ 
    ...card, 
    id: index + 1,
    imageUrl: getCardImagePath(card.name)
  }));
  const shuffled = shuffleCards(allCardsWithId);
  return shuffled.slice(0, count);
};

// 모든 카드 데이터 내보내기 (ID 포함, 로컬 이미지 경로 적용)
export const getAllCards = (): TarotCard[] => {
  return ALL_TAROT_CARDS.map((card, index) => ({ 
    ...card, 
    id: index + 1,
    imageUrl: getCardImagePath(card.name)
  }));
};

// 카드 검색 함수
export const searchCards = (query: string): TarotCard[] => {
  const allCards = getAllCards();
  const lowerQuery = query.toLowerCase();
  
  return allCards.filter(card => 
    card.name.toLowerCase().includes(lowerQuery) ||
    card.nameKr.includes(lowerQuery) ||
    card.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
    card.keywordsKr.some(keyword => keyword.includes(lowerQuery)) ||
    card.suit.toLowerCase().includes(lowerQuery) ||
    card.type.toLowerCase().includes(lowerQuery)
  );
};

// 수트별 카드 필터링
export const getCardsBySuit = (suit: string): TarotCard[] => {
  const allCards = getAllCards();
  return allCards.filter(card => card.suit === suit);
};

// 타입별 카드 필터링
export const getCardsByType = (type: 'Major Arcana' | 'Minor Arcana'): TarotCard[] => {
  const allCards = getAllCards();
  return allCards.filter(card => card.type === type);
};

// 스프레드 유틸리티 함수들
export const getFreeSpreads = (): SpreadTypeExtended[] => {
  return SPREAD_TYPES.filter(spread => !spread.isPremium);
};

export const getPremiumSpreads = (): SpreadTypeExtended[] => {
  return SPREAD_TYPES.filter(spread => spread.isPremium);
};

export const createSpreadReading = (
  spreadType: SpreadTypeExtended,
  cards: TarotCard[]
): SpreadCard[] => {
  return spreadType.layout.map((position, index) => ({
    card: cards[index],
    position: position,
    isRevealed: false
  }));
};

export const saveSpread = (
  spreadId: string,
  question: string,
  reading: SpreadCard[],
  insights: string
): SavedSpread => {
  const spread = getSpreadTypeById(spreadId);
  if (!spread) {
    throw new Error('Invalid spread ID');
  }

  const savedSpread: SavedSpread = {
    id: Date.now().toString(),
    spreadType: spread,
    spreadName: spread.nameKr,
    question,
    cards: reading,
    insights,
    date: new Date().toISOString(),
    savedAt: new Date().toISOString()
  };

  // localStorage에 저장
  const savedSpreads = loadSavedSpreads();
  savedSpreads.push(savedSpread);
  localStorage.setItem('saved_spreads', JSON.stringify(savedSpreads));

  return savedSpread;
};

export const loadSavedSpreads = (): SavedSpread[] => {
  try {
    const saved = localStorage.getItem('saved_spreads');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load saved spreads:', error);
    return [];
  }
};

// ===== Journal 관련 유틸리티 함수들 =====

// 날짜 포맷팅 함수들
export const formatKoreanDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays <= 7) return `${diffDays}일 전`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}주 전`;
  if (diffDays <= 365) return `${Math.ceil(diffDays / 30)}개월 전`;
  return `${Math.ceil(diffDays / 365)}년 전`;
};

// 저널 데이터 정렬 및 필터링
export const sortSavesByDate = (saves: (DailyTarotSave | SavedSpread)[], order: 'asc' | 'desc' = 'desc') => {
  return saves.sort((a, b) => {
    const dateA = new Date(a.date || a.savedAt);
    const dateB = new Date(b.date || b.savedAt);
    return order === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });
};

export const filterSavesByDateRange = (
  saves: (DailyTarotSave | SavedSpread)[], 
  startDate: Date, 
  endDate: Date
): (DailyTarotSave | SavedSpread)[] => {
  return saves.filter(save => {
    const saveDate = new Date(save.date || save.savedAt);
    return saveDate >= startDate && saveDate <= endDate;
  });
};

export const searchSaves = (
  saves: (DailyTarotSave | SavedSpread)[], 
  query: string
): (DailyTarotSave | SavedSpread)[] => {
  const lowerQuery = query.toLowerCase();
  return saves.filter(save => {
    if ('spreadName' in save) {
      // SavedSpread
      return (save.title?.toLowerCase().includes(lowerQuery) || false) ||
             save.insights.toLowerCase().includes(lowerQuery) ||
             save.spreadName.toLowerCase().includes(lowerQuery);
    } else {
      // DailyTarotSave
      return save.insights.toLowerCase().includes(lowerQuery) ||
             Object.values(save.memos || {}).some((memo) => 
               typeof memo === 'string' && memo.toLowerCase().includes(lowerQuery)
             );
    }
  });
};

// 통계 함수들
export const getDailyTarotStats = async (): Promise<{
  totalSaves: number;
  currentStreak: number;
  longestStreak: number;
  totalMemos: number;
  averageMemosPerDay: number;
}> => {
  try {
    const saves = await loadDailyTarotSaves();
    const totalSaves = saves.length;
    const totalMemos = saves.reduce((sum, save) => sum + Object.keys(save.memos || {}).length, 0);
    const averageMemosPerDay = totalSaves > 0 ? Math.round((totalMemos / totalSaves) * 10) / 10 : 0;
    
    // 연속 일수 계산
    const sortedSaves = saves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedSaves.length; i++) {
      const saveDate = new Date(sortedSaves[i].date);
      saveDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - saveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && (daysDiff === 0 || daysDiff === 1)) {
        currentStreak = 1;
        tempStreak = 1;
      } else if (i > 0) {
        const prevDate = new Date(sortedSaves[i - 1].date);
        prevDate.setHours(0, 0, 0, 0);
        const daysBetween = Math.floor((prevDate.getTime() - saveDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysBetween === 1) {
          tempStreak++;
          if (i === 1 && currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          if (i === 1) currentStreak = 0;
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return {
      totalSaves,
      currentStreak,
      longestStreak,
      totalMemos,
      averageMemosPerDay
    };
  } catch (error) {
    console.error('Error calculating daily tarot stats:', error);
    return {
      totalSaves: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalMemos: 0,
      averageMemosPerDay: 0
    };
  }
};

export const getSpreadStats = (): {
  totalSpreads: number;
  mostUsedSpread: string;
  premiumSpreadsUsed: number;
  freeSpreadsUsed: number;
} => {
  try {
    const saves = loadSavedSpreads();
    const totalSpreads = saves.length;
    
    // 가장 많이 사용된 스프레드 찾기
    const spreadCounts: { [key: string]: number } = {};
    saves.forEach(save => {
      spreadCounts[save.spreadName] = (spreadCounts[save.spreadName] || 0) + 1;
    });
    
    const mostUsedSpread = Object.keys(spreadCounts).reduce((a, b) => 
      spreadCounts[a] > spreadCounts[b] ? a : b, 
      Object.keys(spreadCounts)[0] || ''
    );
    
    // 프리미엄/무료 스프레드 사용 횟수
    const premiumSpreads = getPremiumSpreads().map(s => s.nameKr);
    const premiumSpreadsUsed = saves.filter(save => 
      premiumSpreads.includes(save.spreadName)
    ).length;
    const freeSpreadsUsed = totalSpreads - premiumSpreadsUsed;
    
    return {
      totalSpreads,
      mostUsedSpread,
      premiumSpreadsUsed,
      freeSpreadsUsed
    };
  } catch (error) {
    console.error('Error calculating spread stats:', error);
    return {
      totalSpreads: 0,
      mostUsedSpread: '',
      premiumSpreadsUsed: 0,
      freeSpreadsUsed: 0
    };
  }
};

// 백업 및 복원 함수들
export const exportJournalData = async (): Promise<string> => {
  try {
    const dailyTarotSaves = await loadDailyTarotSaves();
    const savedSpreads = loadSavedSpreads();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      dailyTarotSaves,
      savedSpreads
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting journal data:', error);
    throw error;
  }
};

export const importJournalData = async (jsonData: string): Promise<boolean> => {
  try {
    const importData = JSON.parse(jsonData);
    
    if (!importData.version || !importData.dailyTarotSaves || !importData.savedSpreads) {
      throw new Error('잘못된 백업 파일 형식입니다.');
    }
    
    // 기존 데이터와 병합
    const existingDaily = await loadDailyTarotSaves();
    const existingSpreads = loadSavedSpreads();
    
    const mergedDaily = [...existingDaily];
    const mergedSpreads = [...existingSpreads];
    
    // 중복 제거하면서 병합
    importData.dailyTarotSaves.forEach((importSave: DailyTarotSave) => {
      const exists = mergedDaily.find(save => save.date === importSave.date);
      if (!exists) {
        mergedDaily.push(importSave);
      }
    });
    
    importData.savedSpreads.forEach((importSpread: SavedSpread) => {
      const exists = mergedSpreads.find(spread => spread.id === importSpread.id);
      if (!exists) {
        mergedSpreads.push(importSpread);
      }
    });
    
    // 저장 (웹용 localStorage 사용)
    localStorage.setItem(DAILY_TAROT_KEY, JSON.stringify(mergedDaily));
    localStorage.setItem('saved_spreads', JSON.stringify(mergedSpreads));
    
    return true;
  } catch (error) {
    console.error('Error importing journal data:', error);
    throw error;
  }
};

// 데이터 정리 함수
export const cleanOldData = async (daysToKeep: number = 90): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const dailySaves = await loadDailyTarotSaves();
    const spreadSaves = loadSavedSpreads();
    
    const filteredDaily = dailySaves.filter(save => new Date(save.date) >= cutoffDate);
    const filteredSpreads = spreadSaves.filter(save => new Date(save.savedAt) >= cutoffDate);
    
    const removedCount = (dailySaves.length - filteredDaily.length) + (spreadSaves.length - filteredSpreads.length);
    
    localStorage.setItem(DAILY_TAROT_KEY, JSON.stringify(filteredDaily));
    localStorage.setItem('saved_spreads', JSON.stringify(filteredSpreads));
    
    return removedCount;
  } catch (error) {
    console.error('Error cleaning old data:', error);
    throw error;
  }
};

// 샘플 데이터 생성 (개발/테스트용)
export const generateSampleJournalData = async (): Promise<void> => {
  try {
    const sampleDailyTarot: DailyTarotSave[] = [
      {
        id: 'sample-daily-1',
        date: new Date(Date.now() - 86400000).toDateString(), // 어제
        hourlyCards: generateDailyCards(new Date(Date.now() - 86400000)),
        memos: {
          9: '아침부터 좋은 에너지를 느꼈습니다.',
          12: '점심시간에 중요한 결정을 내렸어요.',
          18: '저녁에 가족과 좋은 시간을 보냈습니다.',
          22: '하루를 마무리하며 감사한 마음이 듭니다.'
        },
        insights: '오늘은 전반적으로 긍정적인 에너지가 흐르는 하루였습니다. 특히 오후에 좋은 기회가 있을 것 같습니다.',
        savedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'sample-daily-2',
        date: new Date(Date.now() - 2 * 86400000).toDateString(), // 이틀 전
        hourlyCards: generateDailyCards(new Date(Date.now() - 2 * 86400000)),
        memos: {
          8: '이른 아침부터 명상을 했습니다.',
          14: '오후에 친구와 의미 있는 대화를 나눴어요.',
          20: '저녁에 새로운 취미를 시작했습니다.'
        },
        insights: '변화와 성장의 하루였습니다. 내면의 목소리에 귀를 기울이는 것이 중요합니다.',
        savedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
    
    const sampleSpreads: SavedSpread[] = [
      {
        id: 'sample-spread-1',
        title: '새로운 직장에 대한 결정',
        spreadType: getSpreadTypeById('three-card')!,
        spreadName: '3카드 스프레드',
        question: '새로운 직장 제안을 수락해야 할까요?',
        cards: [],
        date: new Date(Date.now() - 86400000).toISOString(),
        insights: '과거의 경험을 바탕으로 현재를 충실히 살아가면 밝은 미래가 펼쳐질 것입니다.',
        savedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'sample-spread-2',
        title: '연애 관계의 미래',
        spreadType: getSpreadTypeById('relationship-spread')!,
        spreadName: '컵 오브 릴레이션십',
        question: '현재 연애 관계는 어떻게 발전할까요?',
        cards: [],
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        insights: '서로에 대한 깊은 이해와 소통이 필요한 시기입니다. 감정적 유대감을 강화하세요.',
        savedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ];
    
    // 기존 데이터와 병합해서 저장
    const existingDaily = await loadDailyTarotSaves();
    const existingSpreads = loadSavedSpreads();
    
    const mergedDaily = [...existingDaily, ...sampleDailyTarot];
    const mergedSpreads = [...existingSpreads, ...sampleSpreads];
    
    localStorage.setItem(DAILY_TAROT_KEY, JSON.stringify(mergedDaily));
    localStorage.setItem('saved_spreads', JSON.stringify(mergedSpreads));
    
  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
};

