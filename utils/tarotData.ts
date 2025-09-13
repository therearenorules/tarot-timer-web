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
  spreadNameEn: string;
  positions: {
    id: number;
    name: string;
    nameEn: string;
    description: string;
    card: TarotCard | null;
    x?: number;
    y?: number;
  }[];
  insights: string; // 전체 인사이트
  createdAt: string; // ISO 문자열
  tags: string[];
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_00_fool.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_01_magician.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_02_high_priestess.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_03_empress.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_04_emperor.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_05_hierophant.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_06_lovers.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_07_chariot.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_08_strength.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_09_hermit.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_10_wheel_of_fortune.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_11_justice.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_12_hanged_man.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_13_death.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_14_temperance.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_15_devil.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_16_tower.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_17_star.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_18_moon.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_19_sun.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_20_judgement.jpg'),
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
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_21_world.jpg'),
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },

  // MINOR ARCANA - WANDS (완드/지팡이) - 창조적 에너지, 열정, 영감
  {
    id: 22,
    name: "Ace of Wands",
    nameKr: "완드 에이스",
    meaning: "New beginnings, inspiration, creative energy",
    meaningKr: "새로운 시작, 영감, 창조적 에너지",
    keywords: ["new beginnings", "inspiration", "creativity", "potential"],
    keywordsKr: ["새로운 시작", "영감", "창조력", "잠재력"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_ace.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 23,
    name: "Two of Wands",
    nameKr: "완드 2",
    meaning: "Planning, making decisions, leaving comfort zone",
    meaningKr: "계획, 결정, 안전지대 벗어나기",
    keywords: ["planning", "decisions", "progress", "discovery"],
    keywordsKr: ["계획", "결정", "진보", "발견"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_02.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 24,
    name: "Three of Wands",
    nameKr: "완드 3",
    meaning: "Expansion, foresight, overseas opportunities",
    meaningKr: "확장, 통찰력, 해외 기회",
    keywords: ["expansion", "foresight", "leadership", "progress"],
    keywordsKr: ["확장", "선견지명", "리더십", "진전"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_03.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 25,
    name: "Four of Wands",
    nameKr: "완드 4",
    meaning: "Celebration, joy, harmony, relaxation",
    meaningKr: "축하, 기쁨, 조화, 휴식",
    keywords: ["celebration", "harmony", "home", "completion"],
    keywordsKr: ["축하", "조화", "가정", "완성"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_04.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 26,
    name: "Five of Wands",
    nameKr: "완드 5",
    meaning: "Conflict, competition, tension, diversity",
    meaningKr: "갈등, 경쟁, 긴장, 다양성",
    keywords: ["conflict", "competition", "struggle", "disagreement"],
    keywordsKr: ["갈등", "경쟁", "투쟁", "의견 차이"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_05.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 27,
    name: "Six of Wands",
    nameKr: "완드 6",
    meaning: "Victory, public recognition, progress",
    meaningKr: "승리, 대중의 인정, 진보",
    keywords: ["victory", "recognition", "success", "leadership"],
    keywordsKr: ["승리", "인정", "성공", "리더십"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_06.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 28,
    name: "Seven of Wands",
    nameKr: "완드 7",
    meaning: "Challenge, competition, perseverance",
    meaningKr: "도전, 경쟁, 인내",
    keywords: ["challenge", "perseverance", "defensive", "maintaining position"],
    keywordsKr: ["도전", "인내", "방어", "위치 유지"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_07.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 29,
    name: "Eight of Wands",
    nameKr: "완드 8",
    meaning: "Speed, action, air travel, movement",
    meaningKr: "속도, 행동, 항공 여행, 움직임",
    keywords: ["speed", "movement", "quick action", "air travel"],
    keywordsKr: ["속도", "움직임", "빠른 행동", "항공 여행"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_08.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 30,
    name: "Nine of Wands",
    nameKr: "완드 9",
    meaning: "Resilience, courage, persistence, test of faith",
    meaningKr: "회복력, 용기, 지속성, 믿음의 시험",
    keywords: ["resilience", "courage", "persistence", "boundaries"],
    keywordsKr: ["회복력", "용기", "지속성", "경계"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_09.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 31,
    name: "Ten of Wands",
    nameKr: "완드 10",
    meaning: "Burden, extra responsibility, hard work",
    meaningKr: "부담, 추가 책임, 힘든 일",
    keywords: ["burden", "responsibility", "hard work", "completion"],
    keywordsKr: ["부담", "책임", "힘든 일", "완성"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_10.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 32,
    name: "Page of Wands",
    nameKr: "완드 페이지",
    meaning: "Inspiration, ideas, discovery, limitless potential",
    meaningKr: "영감, 아이디어, 발견, 무한한 잠재력",
    keywords: ["inspiration", "ideas", "discovery", "free spirit"],
    keywordsKr: ["영감", "아이디어", "발견", "자유로운 영혼"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_page.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 33,
    name: "Knight of Wands",
    nameKr: "완드 기사",
    meaning: "Action, adventure, fearlessness, energy",
    meaningKr: "행동, 모험, 용맹함, 에너지",
    keywords: ["action", "adventure", "impulsiveness", "energy"],
    keywordsKr: ["행동", "모험", "충동적", "에너지"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_knight.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 34,
    name: "Queen of Wands",
    nameKr: "완드 퀸",
    meaning: "Energy, attraction, confidence, determination",
    meaningKr: "에너지, 매력, 자신감, 결단력",
    keywords: ["confidence", "independence", "social butterfly", "determination"],
    keywordsKr: ["자신감", "독립성", "사교성", "결단력"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_queen.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 35,
    name: "King of Wands",
    nameKr: "완드 킹",
    meaning: "Leadership, vision, honour, being honourable",
    meaningKr: "리더십, 비전, 명예, 존경받음",
    keywords: ["leadership", "vision", "honour", "big picture"],
    keywordsKr: ["리더십", "비전", "명예", "큰 그림"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_king.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },

  // MINOR ARCANA - CUPS (컵) - 감정, 관계, 직관, 영성
  {
    id: 36,
    name: "Ace of Cups",
    nameKr: "컵 에이스",
    meaning: "Love, new relationships, compassion, creativity",
    meaningKr: "사랑, 새로운 관계, 연민, 창조성",
    keywords: ["love", "new relationships", "compassion", "spirituality"],
    keywordsKr: ["사랑", "새로운 관계", "연민", "영성"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_ace.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 37,
    name: "Two of Cups",
    nameKr: "컵 2",
    meaning: "Unified love, partnership, mutual attraction",
    meaningKr: "통합된 사랑, 파트너십, 상호 매력",
    keywords: ["unified love", "partnership", "connection", "attraction"],
    keywordsKr: ["통합된 사랑", "파트너십", "연결", "매력"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_02.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 38,
    name: "Three of Cups",
    nameKr: "컵 3",
    meaning: "Friendship, teamwork, creativity, community",
    meaningKr: "우정, 팀워크, 창조성, 공동체",
    keywords: ["friendship", "teamwork", "creativity", "collaboration"],
    keywordsKr: ["우정", "팀워크", "창조성", "협력"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_03.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 39,
    name: "Four of Cups",
    nameKr: "컵 4",
    meaning: "Apathy, contemplation, disconnectedness",
    meaningKr: "무관심, 명상, 단절감",
    keywords: ["apathy", "contemplation", "reevaluation", "withdrawal"],
    keywordsKr: ["무관심", "명상", "재평가", "철수"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_04.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 40,
    name: "Five of Cups",
    nameKr: "컵 5",
    meaning: "Loss, regret, disappointment, recovery",
    meaningKr: "상실, 후회, 실망, 회복",
    keywords: ["loss", "regret", "disappointment", "moving forward"],
    keywordsKr: ["상실", "후회", "실망", "앞으로 나아가기"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_05.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 41,
    name: "Six of Cups",
    nameKr: "컵 6",
    meaning: "Revisiting the past, childhood memories, innocence",
    meaningKr: "과거 회상, 어린 시절 추억, 순수함",
    keywords: ["nostalgia", "childhood", "innocence", "reunion"],
    keywordsKr: ["향수", "어린 시절", "순수함", "재회"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_06.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 42,
    name: "Seven of Cups",
    nameKr: "컵 7",
    meaning: "Opportunities, choices, wishful thinking, illusion",
    meaningKr: "기회, 선택, 공상, 환상",
    keywords: ["opportunities", "choices", "illusion", "fantasy"],
    keywordsKr: ["기회", "선택", "환상", "공상"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_07.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 43,
    name: "Eight of Cups",
    nameKr: "컵 8",
    meaning: "Disappointment, abandonment, withdrawal, escapism",
    meaningKr: "실망, 포기, 철수, 도피주의",
    keywords: ["disappointment", "abandonment", "withdrawal", "moving on"],
    keywordsKr: ["실망", "포기", "철수", "다음으로 넘어가기"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_08.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 44,
    name: "Nine of Cups",
    nameKr: "컵 9",
    meaning: "Contentment, satisfaction, gratitude, wish come true",
    meaningKr: "만족, 충족, 감사, 소원 성취",
    keywords: ["contentment", "satisfaction", "gratitude", "luxury"],
    keywordsKr: ["만족", "충족", "감사", "사치"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_09.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 45,
    name: "Ten of Cups",
    nameKr: "컵 10",
    meaning: "Happiness, domestic bliss, emotional fulfillment",
    meaningKr: "행복, 가정의 평화, 감정적 만족",
    keywords: ["happiness", "family", "emotional fulfillment", "harmony"],
    keywordsKr: ["행복", "가족", "감정적 만족", "조화"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_10.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 46,
    name: "Page of Cups",
    nameKr: "컵 페이지",
    meaning: "Creative opportunities, intuitive messages, curiosity",
    meaningKr: "창조적 기회, 직감적 메시지, 호기심",
    keywords: ["creative opportunities", "intuition", "curiosity", "new ideas"],
    keywordsKr: ["창조적 기회", "직감", "호기심", "새로운 아이디어"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_page.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 47,
    name: "Knight of Cups",
    nameKr: "컵 기사",
    meaning: "Creativity, romance, charm, imagination",
    meaningKr: "창조성, 로맨스, 매력, 상상력",
    keywords: ["creativity", "romance", "charm", "follow your heart"],
    keywordsKr: ["창조성", "로맨스", "매력", "마음을 따르기"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_knight.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 48,
    name: "Queen of Cups",
    nameKr: "컵 퀸",
    meaning: "Compassionate, caring, emotionally stable",
    meaningKr: "자비로운, 돌보는, 감정적으로 안정된",
    keywords: ["compassion", "caring", "emotional stability", "intuition"],
    keywordsKr: ["자비", "돌봄", "감정적 안정", "직감"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_queen.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 49,
    name: "King of Cups",
    nameKr: "컵 킹",
    meaning: "Emotional balance, compassion, diplomacy",
    meaningKr: "감정적 균형, 연민, 외교술",
    keywords: ["emotional balance", "compassion", "diplomacy", "calmness"],
    keywordsKr: ["감정적 균형", "연민", "외교술", "차분함"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_king.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },

  // MINOR ARCANA - SWORDS (소드) - 지적 능력, 갈등, 의사소통
  {
    id: 50,
    name: "Ace of Swords",
    nameKr: "소드 에이스",
    meaning: "Breakthrough, clarity, sharp mind",
    meaningKr: "돌파구, 명확성, 날카로운 정신",
    keywords: ["breakthrough", "clarity", "sharp mind", "new ideas"],
    keywordsKr: ["돌파구", "명확성", "날카로운 정신", "새로운 아이디어"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_ace.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 51,
    name: "Two of Swords",
    nameKr: "소드 2",
    meaning: "Difficult decisions, weighing options, indecision",
    meaningKr: "어려운 결정, 선택지 고려, 우유부단",
    keywords: ["difficult decisions", "indecision", "blocked emotions", "avoidance"],
    keywordsKr: ["어려운 결정", "우유부단", "차단된 감정", "회피"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_02.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 52,
    name: "Three of Swords",
    nameKr: "소드 3",
    meaning: "Heartbreak, emotional pain, sorrow, grief",
    meaningKr: "마음의 상처, 감정적 고통, 슬픔, 비탄",
    keywords: ["heartbreak", "sorrow", "grief", "betrayal"],
    keywordsKr: ["마음의 상처", "슬픔", "비탄", "배신"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_03.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 53,
    name: "Four of Swords",
    nameKr: "소드 4",
    meaning: "Rest, relaxation, meditation, contemplation",
    meaningKr: "휴식, 이완, 명상, 숙고",
    keywords: ["rest", "relaxation", "meditation", "recuperation"],
    keywordsKr: ["휴식", "이완", "명상", "회복"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_04.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 54,
    name: "Five of Swords",
    nameKr: "소드 5",
    meaning: "Conflict, disagreements, competition, defeat",
    meaningKr: "갈등, 불일치, 경쟁, 패배",
    keywords: ["conflict", "disagreements", "win at all costs", "betrayal"],
    keywordsKr: ["갈등", "불일치", "무조건적 승리", "배신"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_05.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 55,
    name: "Six of Swords",
    nameKr: "소드 6",
    meaning: "Transition, change, rite of passage, release",
    meaningKr: "전환, 변화, 통과의례, 해방",
    keywords: ["transition", "change", "moving forward", "recovery"],
    keywordsKr: ["전환", "변화", "앞으로 나아가기", "회복"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_06.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 56,
    name: "Seven of Swords",
    nameKr: "소드 7",
    meaning: "Deception, getting away with something, stealth",
    meaningKr: "기만, 몰래 빠져나가기, 은밀함",
    keywords: ["deception", "getting away", "stealth", "strategy"],
    keywordsKr: ["기만", "빠져나가기", "은밀함", "전략"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_07.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 57,
    name: "Eight of Swords",
    nameKr: "소드 8",
    meaning: "Restriction, imprisonment, victim mentality",
    meaningKr: "제한, 감금, 피해자 의식",
    keywords: ["restriction", "trapped", "victim mentality", "self-limiting"],
    keywordsKr: ["제한", "갇힌", "피해자 의식", "자기 제한"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_08.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 58,
    name: "Nine of Swords",
    nameKr: "소드 9",
    meaning: "Anxiety, worry, fear, depression, nightmares",
    meaningKr: "불안, 걱정, 두려움, 우울, 악몽",
    keywords: ["anxiety", "worry", "fear", "mental anguish"],
    keywordsKr: ["불안", "걱정", "두려움", "정신적 고통"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_09.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 59,
    name: "Ten of Swords",
    nameKr: "소드 10",
    meaning: "Painful endings, deep wounds, betrayal, loss",
    meaningKr: "고통스러운 끝, 깊은 상처, 배신, 상실",
    keywords: ["painful endings", "betrayal", "crisis", "rock bottom"],
    keywordsKr: ["고통스러운 끝", "배신", "위기", "바닥"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_10.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 60,
    name: "Page of Swords",
    nameKr: "소드 페이지",
    meaning: "Curiosity, restlessness, mental energy",
    meaningKr: "호기심, 불안정, 정신적 에너지",
    keywords: ["curiosity", "restlessness", "mental energy", "new ideas"],
    keywordsKr: ["호기심", "불안정", "정신적 에너지", "새로운 아이디어"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_page.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 61,
    name: "Knight of Swords",
    nameKr: "소드 기사",
    meaning: "Ambition, drive, fast thinking, tunnel vision",
    meaningKr: "야망, 추진력, 빠른 사고, 터널 시야",
    keywords: ["ambition", "drive", "fast thinking", "impatience"],
    keywordsKr: ["야망", "추진력", "빠른 사고", "성급함"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_knight.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 62,
    name: "Queen of Swords",
    nameKr: "소드 퀸",
    meaning: "Independent, unbiased judgement, clear boundaries",
    meaningKr: "독립적, 편견 없는 판단, 명확한 경계",
    keywords: ["independent", "unbiased", "clear boundaries", "direct"],
    keywordsKr: ["독립적", "편견 없는", "명확한 경계", "직접적"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_queen.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 63,
    name: "King of Swords",
    nameKr: "소드 킹",
    meaning: "Mental clarity, intellectual power, authority",
    meaningKr: "정신적 명확성, 지적 능력, 권위",
    keywords: ["mental clarity", "intellectual power", "authority", "truth"],
    keywordsKr: ["정신적 명확성", "지적 능력", "권위", "진실"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_king.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },

  // MINOR ARCANA - PENTACLES (펜타클) - 물질적 영역, 돈, 건강, 커리어
  {
    id: 64,
    name: "Ace of Pentacles",
    nameKr: "펜타클 에이스",
    meaning: "Manifestation, new financial opportunity, abundance",
    meaningKr: "실현, 새로운 재정 기회, 풍요",
    keywords: ["manifestation", "new opportunity", "abundance", "prosperity"],
    keywordsKr: ["실현", "새로운 기회", "풍요", "번영"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_ace.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 65,
    name: "Two of Pentacles",
    nameKr: "펜타클 2",
    meaning: "Multiple priorities, time management, adaptability",
    meaningKr: "여러 우선순위, 시간 관리, 적응력",
    keywords: ["multiple priorities", "time management", "adaptability", "balance"],
    keywordsKr: ["여러 우선순위", "시간 관리", "적응력", "균형"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_02.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 66,
    name: "Three of Pentacles",
    nameKr: "펜타클 3",
    meaning: "Teamwork, collaboration, learning, implementation",
    meaningKr: "팀워크, 협력, 학습, 실행",
    keywords: ["teamwork", "collaboration", "learning", "building"],
    keywordsKr: ["팀워크", "협력", "학습", "구축"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_03.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 67,
    name: "Four of Pentacles",
    nameKr: "펜타클 4",
    meaning: "Saving money, security, conservatism, scarcity",
    meaningKr: "돈 저축, 보안, 보수주의, 부족",
    keywords: ["saving money", "security", "possessiveness", "control"],
    keywordsKr: ["돈 저축", "보안", "소유욕", "통제"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_04.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 68,
    name: "Five of Pentacles",
    nameKr: "펜타클 5",
    meaning: "Financial loss, poverty, lack mindset, isolation",
    meaningKr: "재정적 손실, 빈곤, 부족 사고방식, 고립",
    keywords: ["financial loss", "poverty", "isolation", "worry"],
    keywordsKr: ["재정적 손실", "빈곤", "고립", "걱정"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_05.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 69,
    name: "Six of Pentacles",
    nameKr: "펜타클 6",
    meaning: "Giving, receiving, sharing wealth, generosity",
    meaningKr: "주기, 받기, 부의 공유, 관대함",
    keywords: ["giving", "receiving", "generosity", "charity"],
    keywordsKr: ["주기", "받기", "관대함", "자선"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_06.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 70,
    name: "Seven of Pentacles",
    nameKr: "펜타클 7",
    meaning: "Long-term view, sustainable results, perseverance",
    meaningKr: "장기적 관점, 지속 가능한 결과, 인내",
    keywords: ["long-term view", "perseverance", "investment", "patience"],
    keywordsKr: ["장기적 관점", "인내", "투자", "참을성"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_07.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 71,
    name: "Eight of Pentacles",
    nameKr: "펜타클 8",
    meaning: "Apprenticeship, repetitive tasks, mastery, skill development",
    meaningKr: "견습, 반복적 작업, 숙달, 기술 개발",
    keywords: ["apprenticeship", "skill development", "mastery", "dedication"],
    keywordsKr: ["견습", "기술 개발", "숙달", "헌신"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_08.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 72,
    name: "Nine of Pentacles",
    nameKr: "펜타클 9",
    meaning: "Abundance, luxury, self-reliance, financial independence",
    meaningKr: "풍요, 사치, 자립, 재정적 독립",
    keywords: ["abundance", "luxury", "self-reliance", "financial independence"],
    keywordsKr: ["풍요", "사치", "자립", "재정적 독립"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_09.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 73,
    name: "Ten of Pentacles",
    nameKr: "펜타클 10",
    meaning: "Wealth, financial security, family, long-term success",
    meaningKr: "부, 재정적 안정, 가족, 장기적 성공",
    keywords: ["wealth", "financial security", "family", "legacy"],
    keywordsKr: ["부", "재정적 안정", "가족", "유산"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_10.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 74,
    name: "Page of Pentacles",
    nameKr: "펜타클 페이지",
    meaning: "Manifestation, financial opportunity, skill development",
    meaningKr: "실현, 재정 기회, 기술 개발",
    keywords: ["manifestation", "opportunity", "skill development", "studiousness"],
    keywordsKr: ["실현", "기회", "기술 개발", "근면함"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_page.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 75,
    name: "Knight of Pentacles",
    nameKr: "펜타클 기사",
    meaning: "Efficiency, hard work, responsibility, routine",
    meaningKr: "효율성, 노력, 책임감, 일상",
    keywords: ["efficiency", "hard work", "responsibility", "reliability"],
    keywordsKr: ["효율성", "노력", "책임감", "신뢰성"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_knight.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 76,
    name: "Queen of Pentacles",
    nameKr: "펜타클 퀸",
    meaning: "Nurturing, practical, providing financially",
    meaningKr: "양육하는, 실용적, 재정적 지원",
    keywords: ["nurturing", "practical", "financial security", "down-to-earth"],
    keywordsKr: ["양육하는", "실용적", "재정적 안정", "현실적"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_queen.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 77,
    name: "King of Pentacles",
    nameKr: "펜타클 킹",
    meaning: "Financial success, business acumen, security",
    meaningKr: "재정적 성공, 사업적 통찰력, 보안",
    keywords: ["financial success", "business acumen", "security", "generosity"],
    keywordsKr: ["재정적 성공", "사업적 통찰력", "보안", "관대함"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_king.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
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