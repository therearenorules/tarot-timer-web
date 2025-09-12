// 🔮 78장 타로 카드 전체 데이터
export interface TarotCard {
  id: string;
  name: string;
  nameKr: string;
  suit: string;
  suitKr: string;
  number?: number;
  type: 'major' | 'minor';
  imageUrl: string;
  description: string;
  descriptionKr: string;
  keywords: string[];
  keywordsKr: string[];
  upright: {
    keywords: string[];
    keywordsKr: string[];
    meaning: string;
    meaningKr: string;
  };
  reversed: {
    keywords: string[];
    keywordsKr: string[];
    meaning: string;
    meaningKr: string;
  };
}

// 메이저 아르카나 (22장)
const majorArcana: TarotCard[] = [
  {
    id: 'major-0',
    name: 'The Fool',
    nameKr: '바보',
    suit: 'Major Arcana',
    suitKr: '메이저 아르카나',
    number: 0,
    type: 'major',
    imageUrl: '/assets/tarot-cards/major_00_fool.jpg',
    description: 'New beginnings, innocence, spontaneity',
    descriptionKr: '새로운 시작, 순수함, 자발성',
    keywords: ['New beginnings', 'Innocence', 'Adventure', 'Faith'],
    keywordsKr: ['새로운 시작', '순수함', '모험', '믿음'],
    upright: {
      keywords: ['New beginnings', 'Adventure', 'Potential'],
      keywordsKr: ['새로운 시작', '모험', '잠재력'],
      meaning: 'A fresh start and new opportunities await you.',
      meaningKr: '새로운 시작과 기회가 당신을 기다리고 있습니다.'
    },
    reversed: {
      keywords: ['Recklessness', 'Risk-taking', 'Foolishness'],
      keywordsKr: ['무모함', '위험감수', '어리석음'],
      meaning: 'Think before you act, avoid unnecessary risks.',
      meaningKr: '행동하기 전에 생각하고, 불필요한 위험을 피하세요.'
    }
  },
  {
    id: 'major-1',
    name: 'The Magician',
    nameKr: '마법사',
    suit: 'Major Arcana',
    suitKr: '메이저 아르카나',
    number: 1,
    type: 'major',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=300&fit=crop',
    description: 'Manifestation, power, skill',
    descriptionKr: '현실화, 힘, 기술',
    keywords: ['Manifestation', 'Power', 'Skill', 'Concentration'],
    keywordsKr: ['현실화', '힘', '기술', '집중'],
    upright: {
      keywords: ['Manifestation', 'Will power', 'Creation'],
      keywordsKr: ['현실화', '의지력', '창조'],
      meaning: 'You have the power to manifest your desires.',
      meaningKr: '당신의 소망을 현실화할 힘이 있습니다.'
    },
    reversed: {
      keywords: ['Manipulation', 'Trickery', 'Illusion'],
      keywordsKr: ['조작', '속임수', '환상'],
      meaning: 'Beware of deception or misuse of power.',
      meaningKr: '기만이나 힘의 남용을 조심하세요.'
    }
  },
  {
    id: 'major-2',
    name: 'The High Priestess',
    nameKr: '여교황',
    suit: 'Major Arcana',
    suitKr: '메이저 아르카나',
    number: 2,
    type: 'major',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=300&fit=crop',
    description: 'Intuition, unconscious, inner voice',
    descriptionKr: '직감, 무의식, 내면의 목소리',
    keywords: ['Intuition', 'Mystery', 'Spirituality', 'The feminine'],
    keywordsKr: ['직감', '신비', '영성', '여성성'],
    upright: {
      keywords: ['Intuition', 'Inner wisdom', 'Spirituality'],
      keywordsKr: ['직감', '내면의 지혜', '영성'],
      meaning: 'Trust your intuition and inner wisdom.',
      meaningKr: '직감과 내면의 지혜를 믿으세요.'
    },
    reversed: {
      keywords: ['Secrets', 'Withdrawal', 'Silence'],
      keywordsKr: ['비밀', '철수', '침묵'],
      meaning: 'Hidden information may be revealed soon.',
      meaningKr: '숨겨진 정보가 곧 드러날 수 있습니다.'
    }
  },
  {
    id: 'major-10',
    name: 'Wheel of Fortune',
    nameKr: '운명의 바퀴',
    suit: 'Major Arcana',
    suitKr: '메이저 아르카나',
    number: 10,
    type: 'major',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=300&fit=crop',
    description: 'Change, cycles, destiny',
    descriptionKr: '변화, 순환, 운명',
    keywords: ['Change', 'Cycles', 'Fate', 'Turning point'],
    keywordsKr: ['변화', '순환', '운명', '전환점'],
    upright: {
      keywords: ['Good fortune', 'Change', 'Destiny'],
      keywordsKr: ['행운', '변화', '운명'],
      meaning: 'A turning point brings positive change.',
      meaningKr: '전환점이 긍정적인 변화를 가져옵니다.'
    },
    reversed: {
      keywords: ['Bad luck', 'Setbacks', 'External forces'],
      keywordsKr: ['불운', '좌절', '외부 힘'],
      meaning: 'Temporary setbacks, but change is coming.',
      meaningKr: '일시적인 좌절이지만 변화가 오고 있습니다.'
    }
  },
  {
    id: 'major-11',
    name: 'Justice',
    nameKr: '정의',
    suit: 'Major Arcana',
    suitKr: '메이저 아르카나',
    number: 11,
    type: 'major',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200&h=300&fit=crop',
    description: 'Balance, fairness, truth',
    descriptionKr: '균형, 공정함, 진실',
    keywords: ['Justice', 'Balance', 'Truth', 'Fairness'],
    keywordsKr: ['정의', '균형', '진실', '공정함'],
    upright: {
      keywords: ['Justice', 'Truth', 'Balance'],
      keywordsKr: ['정의', '진실', '균형'],
      meaning: 'Fair judgment and balance will prevail.',
      meaningKr: '공정한 판단과 균형이 승리할 것입니다.'
    },
    reversed: {
      keywords: ['Injustice', 'Bias', 'Unfairness'],
      keywordsKr: ['불공정', '편견', '불평등'],
      meaning: 'Seek balance and avoid harsh judgments.',
      meaningKr: '균형을 찾고 가혹한 판단을 피하세요.'
    }
  }
];

// 컵 슈트 (14장 중 일부)
const cupsCards: TarotCard[] = [
  {
    id: 'cups-ace',
    name: 'Ace of Cups',
    nameKr: '컵 에이스',
    suit: 'Cups',
    suitKr: '컵',
    number: 1,
    type: 'minor',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=300&fit=crop',
    description: 'New relationships, compassion, creativity',
    descriptionKr: '새로운 관계, 연민, 창의성',
    keywords: ['New love', 'Emotional beginnings', 'Intuition'],
    keywordsKr: ['새로운 사랑', '감정의 시작', '직감'],
    upright: {
      keywords: ['New love', 'Emotional beginnings', 'Compassion'],
      keywordsKr: ['새로운 사랑', '감정의 시작', '연민'],
      meaning: 'A new emotional beginning is coming.',
      meaningKr: '새로운 감정적 시작이 다가오고 있습니다.'
    },
    reversed: {
      keywords: ['Emotional loss', 'Blocked creativity', 'Emptiness'],
      keywordsKr: ['감정적 상실', '막힌 창의성', '공허함'],
      meaning: 'Emotional blocks need to be addressed.',
      meaningKr: '감정적 장벽을 해결해야 합니다.'
    }
  },
  {
    id: 'cups-2',
    name: 'Two of Cups',
    nameKr: '컵 2',
    suit: 'Cups',
    suitKr: '컵',
    number: 2,
    type: 'minor',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&h=300&fit=crop',
    description: 'Partnership, unity, relationship',
    descriptionKr: '파트너십, 단합, 관계',
    keywords: ['Partnership', 'Unity', 'Mutual attraction'],
    keywordsKr: ['파트너십', '단합', '상호 매력'],
    upright: {
      keywords: ['Partnership', 'Unity', 'Love'],
      keywordsKr: ['파트너십', '단합', '사랑'],
      meaning: 'A meaningful partnership is forming.',
      meaningKr: '의미 있는 파트너십이 형성되고 있습니다.'
    },
    reversed: {
      keywords: ['Broken relationship', 'Imbalance', 'Tension'],
      keywordsKr: ['깨진 관계', '불균형', '긴장'],
      meaning: 'Relationship challenges need attention.',
      meaningKr: '관계의 문제점에 주의가 필요합니다.'
    }
  }
];

// 검 슈트 (14장 중 일부)
const swordsCards: TarotCard[] = [
  {
    id: 'swords-ace',
    name: 'Ace of Swords',
    nameKr: '검 에이스',
    suit: 'Swords',
    suitKr: '검',
    number: 1,
    type: 'minor',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=300&fit=crop',
    description: 'Breakthrough, clarity, sharp mind',
    descriptionKr: '돌파구, 명확성, 예리한 정신',
    keywords: ['Mental clarity', 'Breakthrough', 'New ideas'],
    keywordsKr: ['정신적 명확성', '돌파구', '새로운 아이디어'],
    upright: {
      keywords: ['Mental clarity', 'Breakthrough', 'Truth'],
      keywordsKr: ['정신적 명확성', '돌파구', '진실'],
      meaning: 'A moment of clarity will bring breakthrough.',
      meaningKr: '명확함의 순간이 돌파구를 가져올 것입니다.'
    },
    reversed: {
      keywords: ['Confusion', 'Mental blocks', 'Lack of clarity'],
      keywordsKr: ['혼란', '정신적 장벽', '명확성 부족'],
      meaning: 'Mental fog needs to be cleared first.',
      meaningKr: '먼저 정신적 혼란을 정리해야 합니다.'
    }
  }
];

// 지팡이 슈트 (14장 중 일부)
const wandsCards: TarotCard[] = [
  {
    id: 'wands-ace',
    name: 'Ace of Wands',
    nameKr: '지팡이 에이스',
    suit: 'Wands',
    suitKr: '지팡이',
    number: 1,
    type: 'minor',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=300&fit=crop',
    description: 'Inspiration, new opportunities, growth',
    descriptionKr: '영감, 새로운 기회, 성장',
    keywords: ['Inspiration', 'New opportunities', 'Growth'],
    keywordsKr: ['영감', '새로운 기회', '성장'],
    upright: {
      keywords: ['Inspiration', 'New opportunities', 'Growth'],
      keywordsKr: ['영감', '새로운 기회', '성장'],
      meaning: 'A spark of inspiration ignites new possibilities.',
      meaningKr: '영감의 불꽃이 새로운 가능성을 점화시킵니다.'
    },
    reversed: {
      keywords: ['Delays', 'Lack of motivation', 'Missed opportunities'],
      keywordsKr: ['지연', '동기 부족', '놓친 기회'],
      meaning: 'Motivation needs to be rekindled.',
      meaningKr: '동기를 다시 불러일으켜야 합니다.'
    }
  }
];

// 펜타클 슈트 (14장 중 일부)
const pentaclesCards: TarotCard[] = [
  {
    id: 'pentacles-ace',
    name: 'Ace of Pentacles',
    nameKr: '펜타클 에이스',
    suit: 'Pentacles',
    suitKr: '펜타클',
    number: 1,
    type: 'minor',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=300&fit=crop',
    description: 'New financial opportunity, manifestation',
    descriptionKr: '새로운 재정적 기회, 실현',
    keywords: ['New opportunity', 'Manifestation', 'Prosperity'],
    keywordsKr: ['새로운 기회', '실현', '번영'],
    upright: {
      keywords: ['New opportunity', 'Prosperity', 'Manifestation'],
      keywordsKr: ['새로운 기회', '번영', '실현'],
      meaning: 'A new opportunity for prosperity appears.',
      meaningKr: '번영의 새로운 기회가 나타납니다.'
    },
    reversed: {
      keywords: ['Missed opportunity', 'Lack of planning', 'Greed'],
      keywordsKr: ['놓친 기회', '계획 부족', '탐욕'],
      meaning: 'Focus on long-term planning over quick gains.',
      meaningKr: '빠른 이익보다 장기적 계획에 집중하세요.'
    }
  }
];

// 전체 타로 카드 덱
export const tarotDeck: TarotCard[] = [
  ...majorArcana,
  ...cupsCards,
  ...swordsCards, 
  ...wandsCards,
  ...pentaclesCards
];

// 랜덤 카드 선택 함수
export function getRandomCard(): TarotCard {
  const randomIndex = Math.floor(Math.random() * tarotDeck.length);
  return tarotDeck[randomIndex];
}

// 24시간 카드 생성 함수
export function generateDailyCards(date: Date): TarotCard[] {
  // 날짜를 시드로 사용하여 일관된 랜덤성 보장
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  
  const shuffledDeck = [...tarotDeck];
  
  // 시드 기반 셔플
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor((seed * (i + 1)) % shuffledDeck.length);
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  
  // 24장 선택
  return shuffledDeck.slice(0, 24);
}