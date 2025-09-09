// 🔮 타로 유틸리티 함수들
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

// 간단한 타로카드 데이터 (실제 이미지 경로 사용)
export const simpleTarotDeck: TarotCard[] = [
  // 메이저 아르카나 22장
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
    keywords: ['New beginnings', 'Innocence', 'Adventure'],
    keywordsKr: ['새로운 시작', '순수함', '모험'],
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
    imageUrl: '/assets/tarot-cards/major_01_magician.jpg',
    description: 'Manifestation, power, skill',
    descriptionKr: '현실화, 힘, 기술',
    keywords: ['Manifestation', 'Power', 'Skill'],
    keywordsKr: ['현실화', '힘', '기술'],
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
    imageUrl: '/assets/tarot-cards/major_02_high_priestess.jpg',
    description: 'Intuition, unconscious, inner voice',
    descriptionKr: '직감, 무의식, 내면의 목소리',
    keywords: ['Intuition', 'Mystery', 'Spirituality'],
    keywordsKr: ['직감', '신비', '영성'],
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
  // ... 더 많은 카드들 (간략화를 위해 일부만 표시)
];

// 실제 78장 카드 생성 함수
export function generateFullTarotDeck(): TarotCard[] {
  const cards: TarotCard[] = [];
  
  // 메이저 아르카나 22장
  const majorCards = [
    { id: 0, name: 'The Fool', nameKr: '바보' },
    { id: 1, name: 'The Magician', nameKr: '마법사' },
    { id: 2, name: 'The High Priestess', nameKr: '여교황' },
    { id: 3, name: 'The Empress', nameKr: '여황제' },
    { id: 4, name: 'The Emperor', nameKr: '황제' },
    { id: 5, name: 'The Hierophant', nameKr: '교황' },
    { id: 6, name: 'The Lovers', nameKr: '연인들' },
    { id: 7, name: 'The Chariot', nameKr: '전차' },
    { id: 8, name: 'Strength', nameKr: '힘' },
    { id: 9, name: 'The Hermit', nameKr: '은둔자' },
    { id: 10, name: 'Wheel of Fortune', nameKr: '운명의 바퀴' },
    { id: 11, name: 'Justice', nameKr: '정의' },
    { id: 12, name: 'The Hanged Man', nameKr: '매달린 사람' },
    { id: 13, name: 'Death', nameKr: '죽음' },
    { id: 14, name: 'Temperance', nameKr: '절제' },
    { id: 15, name: 'The Devil', nameKr: '악마' },
    { id: 16, name: 'The Tower', nameKr: '탑' },
    { id: 17, name: 'The Star', nameKr: '별' },
    { id: 18, name: 'The Moon', nameKr: '달' },
    { id: 19, name: 'The Sun', nameKr: '태양' },
    { id: 20, name: 'Judgement', nameKr: '심판' },
    { id: 21, name: 'The World', nameKr: '세계' }
  ];

  majorCards.forEach(card => {
    cards.push({
      id: `major-${card.id}`,
      name: card.name,
      nameKr: card.nameKr,
      suit: 'Major Arcana',
      suitKr: '메이저 아르카나',
      number: card.id,
      type: 'major',
      imageUrl: `/assets/tarot-cards/major_${card.id.toString().length === 1 ? '0' + card.id.toString() : card.id.toString()}_${card.name.toLowerCase().replace(/\s+/g, '_').replace('the_', '')}.jpg`,
      description: `${card.name} represents transformation and spiritual growth.`,
      descriptionKr: `${card.nameKr}는 변화와 영적 성장을 나타냅니다.`,
      keywords: ['Change', 'Growth', 'Spiritual'],
      keywordsKr: ['변화', '성장', '영적'],
      upright: {
        keywords: ['Positive change', 'Growth', 'New phase'],
        keywordsKr: ['긍정적 변화', '성장', '새로운 단계'],
        meaning: `${card.name} brings positive transformation to your life.`,
        meaningKr: `${card.nameKr}가 당신의 삶에 긍정적인 변화를 가져다줍니다.`
      },
      reversed: {
        keywords: ['Resistance', 'Blocked energy', 'Inner work'],
        keywordsKr: ['저항', '막힌 에너지', '내면의 작업'],
        meaning: 'Internal reflection is needed before moving forward.',
        meaningKr: '앞으로 나아가기 전에 내적 성찰이 필요합니다.'
      }
    });
  });

  // 마이너 아르카나 56장 (각 슈트별 14장 x 4슈트)
  const minorSuits = [
    { name: 'Cups', nameKr: '컵' },
    { name: 'Swords', nameKr: '검' },
    { name: 'Wands', nameKr: '지팡이' },
    { name: 'Pentacles', nameKr: '펜타클' }
  ];

  const minorRanks = [
    { name: 'Ace', nameKr: '에이스', number: 1 },
    { name: '2', nameKr: '2', number: 2 },
    { name: '3', nameKr: '3', number: 3 },
    { name: '4', nameKr: '4', number: 4 },
    { name: '5', nameKr: '5', number: 5 },
    { name: '6', nameKr: '6', number: 6 },
    { name: '7', nameKr: '7', number: 7 },
    { name: '8', nameKr: '8', number: 8 },
    { name: '9', nameKr: '9', number: 9 },
    { name: '10', nameKr: '10', number: 10 },
    { name: 'Page', nameKr: '페이지', number: 11 },
    { name: 'Knight', nameKr: '기사', number: 12 },
    { name: 'Queen', nameKr: '여왕', number: 13 },
    { name: 'King', nameKr: '왕', number: 14 }
  ];

  minorSuits.forEach(suit => {
    minorRanks.forEach(rank => {
      const imageNumber = rank.name === 'Ace' ? 'ace' : 
                         rank.number <= 10 ? (rank.number.toString().length === 1 ? '0' + rank.number.toString() : rank.number.toString()) : 
                         rank.name.toLowerCase();
      
      cards.push({
        id: `${suit.name.toLowerCase()}-${rank.name.toLowerCase()}`,
        name: `${rank.name} of ${suit.name}`,
        nameKr: `${suit.nameKr} ${rank.nameKr}`,
        suit: suit.name,
        suitKr: suit.nameKr,
        number: rank.number,
        type: 'minor',
        imageUrl: `/assets/tarot-cards/minor_${suit.name.toLowerCase()}_${imageNumber}.jpg`,
        description: `${rank.name} of ${suit.name} represents ${suit.name.toLowerCase()} energy.`,
        descriptionKr: `${suit.nameKr} ${rank.nameKr}는 ${suit.nameKr}의 에너지를 나타냅니다.`,
        keywords: [suit.name, 'Energy', 'Growth'],
        keywordsKr: [suit.nameKr, '에너지', '성장'],
        upright: {
          keywords: ['Positive energy', 'Growth', 'Success'],
          keywordsKr: ['긍정적 에너지', '성장', '성공'],
          meaning: `${rank.name} of ${suit.name} brings positive energy to your situation.`,
          meaningKr: `${suit.nameKr} ${rank.nameKr}가 상황에 긍정적인 에너지를 가져다줍니다.`
        },
        reversed: {
          keywords: ['Blocked energy', 'Delays', 'Inner work'],
          keywordsKr: ['막힌 에너지', '지연', '내면의 작업'],
          meaning: 'Patient reflection will help overcome current challenges.',
          meaningKr: '인내심 있는 성찰이 현재의 도전을 극복하는 데 도움이 될 것입니다.'
        }
      });
    });
  });

  return cards;
}

// 24시간 카드 생성 함수
export function generateDailyCards(date: Date): TarotCard[] {
  const fullDeck = generateFullTarotDeck();
  
  // 날짜를 시드로 사용하여 일관된 랜덤성 보장
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  
  const shuffledDeck = [...fullDeck];
  
  // 시드 기반 셔플
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor((seed * (i + 1)) % shuffledDeck.length);
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  
  // 24장 선택
  return shuffledDeck.slice(0, 24);
}

// 현재 시간 얻기
export function getCurrentHour(): number {
  return new Date().getHours();
}

// 시간 포맷팅
export function formatHour(hour: number): string {
  if (hour === 0) return '자정 12시';
  if (hour === 12) return '정오 12시';
  if (hour < 12) return `오전 ${hour}시`;
  return `오후 ${hour - 12}시`;
}

// 날짜 포맷팅
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// 랜덤 카드 선택
export function getRandomCard(): TarotCard {
  const deck = generateFullTarotDeck();
  return deck[Math.floor(Math.random() * deck.length)];
}

// 데일리 타로 저장 타입
export interface DailyTarotSave {
  id: string;
  date: string;
  hourlyCards: TarotCard[];
  memos: { [hour: number]: string };
  savedAt: string;
}

// 로컬 스토리지 키
const STORAGE_KEY = 'tarot-timer-daily-saves';

// 데일리 타로 저장
export function saveDailyTarot(dailyTarot: DailyTarotSave): void {
  const existingSaves = getAllDailyTarotSaves();
  const updatedSaves = existingSaves.filter(save => save.date !== dailyTarot.date);
  updatedSaves.push(dailyTarot);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSaves));
}

// 모든 데일리 타로 가져오기
export function getAllDailyTarotSaves(): DailyTarotSave[] {
  const savesJson = localStorage.getItem(STORAGE_KEY);
  return savesJson ? JSON.parse(savesJson) : [];
}

// 오늘의 저장된 타로 가져오기
export function getTodaysSave(): DailyTarotSave | null {
  const today = new Date().toDateString();
  const saves = getAllDailyTarotSaves();
  const foundSave = saves.filter(save => save.date === today);
  return foundSave.length > 0 ? foundSave[0] : null;
}