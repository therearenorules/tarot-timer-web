// utils/tarotData.ts - React Native용 타로 카드 데이터

export interface TarotCard {
  id: number;
  name: string;
  nameKr: string;
  nameJa?: string;
  meaning: string;
  meaningKr: string;
  meaningJa?: string;
  keywords: string[];
  keywordsKr: string[];
  keywordsJa?: string[];
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
  updatedAt?: string; // 수정일 (ISO 문자열)
  tags: string[];
}

// 타로 카드 기본 데이터 (78장 중 주요 카드들)
export const TAROT_CARDS: TarotCard[] = [
  // Major Arcana (메이저 아르카나)
  {
    id: 0,
    name: "The Fool",
    nameKr: "바보",
    nameJa: "愚者",
    meaning: "New beginnings, spontaneity, innocence",
    meaningKr: "새로운 시작, 순수함, 모험",
    meaningJa: "新しい始まり、自発性、無邪気さ",
    keywords: ["beginning", "innocence", "journey", "potential"],
    keywordsKr: ["시작", "순수", "여행", "가능성"],
    keywordsJa: ["始まり", "純真", "旅", "可能性"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_00_fool.jpg'),
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 1,
    name: "The Magician",
    nameKr: "마법사",
    nameJa: "魔術師",
    meaning: "Manifestation, resourcefulness, power",
    meaningKr: "실현, 재능, 힘",
    meaningJa: "実現、機智、力",
    keywords: ["manifestation", "willpower", "creation", "skill"],
    keywordsKr: ["실현", "의지력", "창조", "기술"],
    keywordsJa: ["実現", "意志力", "創造", "技術"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_01_magician.jpg'),
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 2,
    name: "The High Priestess",
    nameKr: "여교황",
    nameJa: "女教皇",
    meaning: "Intuition, sacred knowledge, subconscious",
    meaningKr: "직감, 신성한 지식, 잠재의식",
    meaningJa: "直感、神聖な知識、潜在意識",
    keywords: ["intuition", "mystery", "inner knowledge", "subconscious"],
    keywordsKr: ["직감", "신비", "내면의 지식", "잠재의식"],
    keywordsJa: ["直感", "神秘", "内なる知識", "潜在意識"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_02_high_priestess.jpg'),
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 3,
    name: "The Empress",
    nameKr: "여황제",
    nameJa: "女帝",
    meaning: "Fertility, femininity, beauty, nature",
    meaningKr: "풍요, 여성성, 아름다움, 자연",
    meaningJa: "豊穣、女性性、美、自然",
    keywords: ["fertility", "abundance", "nurturing", "creativity"],
    keywordsKr: ["풍요", "풍부함", "양육", "창조성"],
    keywordsJa: ["豊穣", "豊富", "養育", "創造性"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_03_empress.jpg'),
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 4,
    name: "The Emperor",
    nameKr: "황제",
    nameJa: "皇帝",
    meaning: "Authority, establishment, structure, control",
    meaningKr: "권위, 체계, 구조, 통제",
    meaningJa: "権威、確立、構造、統制",
    keywords: ["authority", "structure", "control", "leadership"],
    keywordsKr: ["권위", "구조", "통제", "리더십"],
    keywordsJa: ["権威", "構造", "統制", "指導力"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_04_emperor.jpg'),
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 5,
    name: "The Hierophant",
    nameKr: "교황",
    nameJa: "法王",
    meaning: "Spiritual wisdom, religious beliefs, conformity",
    meaningKr: "영적 지혜, 종교적 믿음, 순응",
    meaningJa: "精神的知恵、宗教的信念、順応",
    keywords: ["tradition", "spiritual guidance", "conformity", "beliefs"],
    keywordsKr: ["전통", "영적 안내", "순응", "믿음"],
    keywordsJa: ["伝統", "精神的指導", "順応", "信念"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_05_hierophant.jpg'),
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 6,
    name: "The Lovers",
    nameKr: "연인들",
    nameJa: "恋人",
    meaning: "Love, harmony, relationships, values alignment",
    meaningKr: "사랑, 조화, 관계, 가치 일치",
    meaningJa: "愛、調和、関係、価値の一致",
    keywords: ["love", "relationships", "choices", "harmony"],
    keywordsKr: ["사랑", "관계", "선택", "조화"],
    keywordsJa: ["愛", "関係", "選択", "調和"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_06_lovers.jpg'),
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 7,
    name: "The Chariot",
    nameKr: "전차",
    nameJa: "戦車",
    meaning: "Control, willpower, success, determination",
    meaningKr: "통제, 의지력, 성공, 결단력",
    meaningJa: "統制、意志力、成功、決断力",
    keywords: ["control", "willpower", "victory", "determination"],
    keywordsKr: ["통제", "의지력", "승리", "결단력"],
    keywordsJa: ["統制", "意志力", "勝利", "決断力"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_07_chariot.jpg'),
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 8,
    name: "Strength",
    nameKr: "힘",
    nameJa: "力",
    meaning: "Strength, courage, patience, control",
    meaningKr: "힘, 용기, 인내, 통제",
    meaningJa: "力、勇気、忍耐、統制",
    keywords: ["inner strength", "courage", "patience", "compassion"],
    keywordsKr: ["내면의 힘", "용기", "인내", "자비"],
    keywordsJa: ["内なる力", "勇気", "忍耐", "慈悲"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_08_strength.jpg'),
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 9,
    name: "The Hermit",
    nameKr: "은둔자",
    nameJa: "隐者",
    meaning: "Soul searching, introspection, inner guidance",
    meaningKr: "영혼 탐구, 내성, 내적 안내",
    meaningJa: "魂の探求、内省、内的指導",
    keywords: ["introspection", "meditation", "guidance", "solitude"],
    keywordsKr: ["내성", "명상", "안내", "고독"],
    keywordsJa: ["内省", "瑽想", "指導", "孤独"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_09_hermit.jpg'),
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    nameKr: "운명의 바퀴",
    nameJa: "運命の車輪",
    meaning: "Life cycles, personal growth, natural patterns, turning points",
    meaningKr: "생애 주기, 개인 성장, 자연스러운 패턴, 전환점",
    meaningJa: "人生の周期、個人的成長、自然なパターン、転換点",
    keywords: ["life cycles", "personal growth", "patterns", "turning point"],
    keywordsKr: ["생애 주기", "개인 성장", "순환", "전환점"],
    keywordsJa: ["人生の周期", "個人的成長", "周期", "転換点"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_10_wheel_of_fortune.jpg'),
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 11,
    name: "Justice",
    nameKr: "정의",
    nameJa: "正義",
    meaning: "Justice, fairness, truth, cause and effect",
    meaningKr: "정의, 공정, 진실, 인과응보",
    meaningJa: "正義、公正、真実、因果応報",
    keywords: ["justice", "balance", "truth", "fairness"],
    keywordsKr: ["정의", "균형", "진실", "공정"],
    keywordsJa: ["正義", "バランス", "真実", "公正"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_11_justice.jpg'),
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 12,
    name: "The Hanged Man",
    nameKr: "매달린 사람",
    nameJa: "吊られた男",
    meaning: "Suspension, restriction, letting go",
    meaningKr: "중단, 제한, 놓아주기",
    meaningJa: "中断、制限、手放し",
    keywords: ["sacrifice", "waiting", "letting go", "perspective"],
    keywordsKr: ["희생", "기다림", "놓아주기", "관점"],
    keywordsJa: ["犠牲", "待機", "手放し", "視点"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_12_hanged_man.jpg'),
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 13,
    name: "Death",
    nameKr: "죽음",
    nameJa: "死神",
    meaning: "Endings, beginnings, change, transformation",
    meaningKr: "끝, 시작, 변화, 변환",
    meaningJa: "終わり、始まり、変化、変容",
    keywords: ["transformation", "endings", "change", "rebirth"],
    keywordsKr: ["변환", "끝", "변화", "재탄생"],
    keywordsJa: ["変容", "終わり", "変化", "再生"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_13_death.jpg'),
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 14,
    name: "Temperance",
    nameKr: "절제",
    nameJa: "節制",
    meaning: "Balance, moderation, patience, purpose",
    meaningKr: "균형, 절제, 인내, 목적",
    meaningJa: "バランス、節制、忍耐、目的",
    keywords: ["balance", "moderation", "harmony", "healing"],
    keywordsKr: ["균형", "절제", "조화", "치유"],
    keywordsJa: ["バランス", "節制", "調和", "治癒"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_14_temperance.jpg'),
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 15,
    name: "The Devil",
    nameKr: "악마",
    nameJa: "悪魔",
    meaning: "Bondage, addiction, sexuality, materialism",
    meaningKr: "속박, 중독, 물질주의",
    meaningJa: "束縛、中毒、物質主義",
    keywords: ["temptation", "bondage", "materialism", "playfulness"],
    keywordsKr: ["유혹", "속박", "물질주의", "장난기"],
    keywordsJa: ["誘惑", "束縛", "物質主義", "遊び心"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_15_devil.jpg'),
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 16,
    name: "The Tower",
    nameKr: "탑",
    nameJa: "塔",
    meaning: "Sudden change, upheaval, chaos, revelation",
    meaningKr: "급작스런 변화, 격변, 혼돈, 계시",
    meaningJa: "突然の変化、激変、混乱、啓示",
    keywords: ["sudden change", "upheaval", "awakening", "revelation"],
    keywordsKr: ["급작스런 변화", "격변", "각성", "계시"],
    keywordsJa: ["突然の変化", "激変", "覚醒", "啓示"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_16_tower.jpg'),
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 17,
    name: "The Star",
    nameKr: "별",
    nameJa: "星",
    meaning: "Hope, faith, purpose, renewal, spirituality",
    meaningKr: "희망, 믿음, 목적, 갱신, 영성",
    meaningJa: "希望、信仰、目的、更新、靈性",
    keywords: ["hope", "faith", "inspiration", "guidance"],
    keywordsKr: ["희망", "믿음", "영감", "안내"],
    keywordsJa: ["希望", "信仰", "インスピレーション", "指導"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_17_star.jpg'),
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 18,
    name: "The Moon",
    nameKr: "달",
    nameJa: "月",
    meaning: "Illusion, fear, anxiety, subconscious, intuition",
    meaningKr: "환상, 두려움, 불안, 잠재의식, 직감",
    meaningJa: "幻想、恐れ、不安、潜在意識、直感",
    keywords: ["illusion", "intuition", "dreams", "subconscious"],
    keywordsKr: ["환상", "직감", "꿈", "잠재의식"],
    keywordsJa: ["幻想", "直感", "夢", "潜在意識"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_18_moon.jpg'),
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 19,
    name: "The Sun",
    nameKr: "태양",
    nameJa: "太陽",
    meaning: "Happiness, success, optimism, vitality",
    meaningKr: "행복, 성공, 낙관주의, 활력",
    meaningJa: "幸福、成功、楽観主義、活力",
    keywords: ["happiness", "success", "optimism", "joy"],
    keywordsKr: ["행복", "성공", "낙관주의", "기쁨"],
    keywordsJa: ["幸福", "成功", "楽観主義", "喜び"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_19_sun.jpg'),
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 20,
    name: "Judgement",
    nameKr: "심판",
    nameJa: "審判",
    meaning: "Judgement, rebirth, inner calling, absolution",
    meaningKr: "심판, 재탄생, 내적 부름, 사면",
    meaningJa: "審判、再生、内なる呼び声、免罪",
    keywords: ["rebirth", "awakening", "judgement", "forgiveness"],
    keywordsKr: ["재탄생", "각성", "심판", "용서"],
    keywordsJa: ["再生", "覚醒", "審判", "許し"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/major_20_judgement.jpg'),
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 21,
    name: "The World",
    nameKr: "세계",
    nameJa: "世界",
    meaning: "Completion, integration, accomplishment, travel",
    meaningKr: "완성, 통합, 성취, 여행",
    meaningJa: "完成、統合、達成、旅行",
    keywords: ["completion", "accomplishment", "fulfillment", "success"],
    keywordsKr: ["완성", "성취", "성취감", "성공"],
    keywordsJa: ["完成", "達成", "充実感", "成功"],
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
    nameJa: "ワンドのエース",
    meaning: "New beginnings, inspiration, creative energy",
    meaningKr: "새로운 시작, 영감, 창조적 에너지",
    meaningJa: "新しい始まり、インスピレーション、創造的エネルギー",
    keywords: ["new beginnings", "inspiration", "creativity", "potential"],
    keywordsKr: ["새로운 시작", "영감", "창조력", "잠재력"],
    keywordsJa: ["新しい始まり", "インスピレーション", "創造性", "可能性"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_ace.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 23,
    name: "Two of Wands",
    nameKr: "완드 2",
    nameJa: "ワンドの2",
    meaning: "Planning, making decisions, leaving comfort zone",
    meaningKr: "계획, 결정, 안전지대 벗어나기",
    meaningJa: "計画、決断、コンフォートゾーンからの脱出",
    keywords: ["planning", "decisions", "progress", "discovery"],
    keywordsKr: ["계획", "결정", "진보", "발견"],
    keywordsJa: ["計画", "決断", "進歩", "発見"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_02.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 24,
    name: "Three of Wands",
    nameKr: "완드 3",
    nameJa: "ワンドの3",
    meaning: "Expansion, foresight, overseas opportunities",
    meaningKr: "확장, 통찰력, 해외 기회",
    meaningJa: "拡張、先見の明、海外の機会",
    keywords: ["expansion", "foresight", "leadership", "progress"],
    keywordsKr: ["확장", "선견지명", "리더십", "진전"],
    keywordsJa: ["拡張", "先見の明", "リーダーシップ", "進歩"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_03.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 25,
    name: "Four of Wands",
    nameKr: "완드 4",
    nameJa: "ワンドの4",
    meaning: "Celebration, joy, harmony, relaxation",
    meaningKr: "축하, 기쁨, 조화, 휴식",
    meaningJa: "祝神、喜び、調和、リラックス",
    keywords: ["celebration", "harmony", "home", "completion"],
    keywordsKr: ["축하", "조화", "가정", "완성"],
    keywordsJa: ["祝神", "調和", "家庭", "完成"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_04.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 26,
    name: "Five of Wands",
    nameKr: "완드 5",
    nameJa: "ワンドの5",
    meaning: "Conflict, competition, tension, diversity",
    meaningKr: "갈등, 경쟁, 긴장, 다양성",
    meaningJa: "紛争、競争、緊張、多様性",
    keywords: ["conflict", "competition", "struggle", "disagreement"],
    keywordsKr: ["갈등", "경쟁", "투쟁", "의견 차이"],
    keywordsJa: ["紛争", "競争", "闘争", "意見の相違"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_05.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 27,
    name: "Six of Wands",
    nameKr: "완드 6",
    nameJa: "ワンドの6",
    meaning: "Victory, public recognition, progress",
    meaningKr: "승리, 대중의 인정, 진보",
    meaningJa: "勝利、公的な認識、進歩",
    keywords: ["victory", "recognition", "success", "leadership"],
    keywordsKr: ["승리", "인정", "성공", "리더십"],
    keywordsJa: ["勝利", "認認", "成功", "リーダーシップ"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_06.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 28,
    name: "Seven of Wands",
    nameKr: "완드 7",
    nameJa: "ワンドの7",
    meaning: "Challenge, competition, perseverance",
    meaningKr: "도전, 경쟁, 인내",
    meaningJa: "挑戦、競争、忍耐",
    keywords: ["challenge", "perseverance", "defensive", "maintaining position"],
    keywordsKr: ["도전", "인내", "방어", "위치 유지"],
    keywordsJa: ["挑戦", "忍耐", "守勢", "ポジション維持"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_07.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 29,
    name: "Eight of Wands",
    nameKr: "완드 8",
    nameJa: "ワンドの8",
    meaning: "Speed, action, air travel, movement",
    meaningKr: "속도, 행동, 항공 여행, 움직임",
    meaningJa: "スピード、行動、航空旅行、動き",
    keywords: ["speed", "movement", "quick action", "air travel"],
    keywordsKr: ["속도", "움직임", "빠른 행동", "항공 여행"],
    keywordsJa: ["スピード", "動き", "素早い行動", "航空旅行"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_08.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 30,
    name: "Nine of Wands",
    nameKr: "완드 9",
    nameJa: "ワンドの9",
    meaning: "Resilience, courage, persistence, test of faith",
    meaningKr: "회복력, 용기, 지속성, 믿음의 시험",
    meaningJa: "回復力、勇気、継続性、信仰の試練",
    keywords: ["resilience", "courage", "persistence", "boundaries"],
    keywordsKr: ["회복력", "용기", "지속성", "경계"],
    keywordsJa: ["回復力", "勇気", "継続性", "境界"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_09.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 31,
    name: "Ten of Wands",
    nameKr: "완드 10",
    nameJa: "ワンドの10",
    meaning: "Burden, extra responsibility, hard work",
    meaningKr: "부담, 추가 책임, 힘든 일",
    meaningJa: "負担、追加責任、ハードワーク",
    keywords: ["burden", "responsibility", "hard work", "completion"],
    keywordsKr: ["부담", "책임", "힘든 일", "완성"],
    keywordsJa: ["負担", "責任", "ハードワーク", "完成"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_10.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 32,
    name: "Page of Wands",
    nameKr: "완드 페이지",
    nameJa: "ワンドのページ",
    meaning: "Inspiration, ideas, discovery, limitless potential",
    meaningKr: "영감, 아이디어, 발견, 무한한 잠재력",
    meaningJa: "インスピレーション、アイデア、発見、無限の可能性",
    keywords: ["inspiration", "ideas", "discovery", "free spirit"],
    keywordsKr: ["영감", "아이디어", "발견", "자유로운 영혼"],
    keywordsJa: ["インスピレーション", "アイデア", "発見", "自由な精神"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_page.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 33,
    name: "Knight of Wands",
    nameKr: "완드 기사",
    nameJa: "ワンドのナイト",
    meaning: "Action, adventure, fearlessness, energy",
    meaningKr: "행동, 모험, 용맹함, 에너지",
    meaningJa: "行動、凒険、勇敵、エネルギー",
    keywords: ["action", "adventure", "impulsiveness", "energy"],
    keywordsKr: ["행동", "모험", "충동적", "에너지"],
    keywordsJa: ["行動", "凒険", "衝動的", "エネルギー"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_knight.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 34,
    name: "Queen of Wands",
    nameKr: "완드 퀸",
    nameJa: "ワンドのクイーン",
    meaning: "Energy, attraction, confidence, determination",
    meaningKr: "에너지, 매력, 자신감, 결단력",
    meaningJa: "エネルギー、魅力、自信、決断力",
    keywords: ["confidence", "independence", "social butterfly", "determination"],
    keywordsKr: ["자신감", "독립성", "사교성", "결단력"],
    keywordsJa: ["自信", "独立性", "社交性", "決断力"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_wands_queen.jpg'),
    element: "Fire",
    suit: "Wands",
    type: "Minor Arcana"
  },
  {
    id: 35,
    name: "King of Wands",
    nameKr: "완드 킹",
    nameJa: "ワンドのキング",
    meaning: "Leadership, vision, honour, being honourable",
    meaningKr: "리더십, 비전, 명예, 존경받음",
    meaningJa: "リーダーシップ、ビジョン、名誉、尊敬",
    keywords: ["leadership", "vision", "honour", "big picture"],
    keywordsKr: ["리더십", "비전", "명예", "큰 그림"],
    keywordsJa: ["リーダーシップ", "ビジョン", "名誉", "大局観"],
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
    nameJa: "カップのエース",
    meaning: "Love, new relationships, compassion, creativity",
    meaningKr: "사랑, 새로운 관계, 연민, 창조성",
    meaningJa: "愛、新しい関係、慈悲、創造性",
    keywords: ["love", "new relationships", "compassion", "spirituality"],
    keywordsKr: ["사랑", "새로운 관계", "연민", "영성"],
    keywordsJa: ["愛", "新しい関係", "慈悲", "靈性"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_ace.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 37,
    name: "Two of Cups",
    nameKr: "컵 2",
    nameJa: "カップの2",
    meaning: "Unified love, partnership, mutual attraction",
    meaningKr: "통합된 사랑, 파트너십, 상호 매력",
    meaningJa: "統一された愛、パートナーシップ、相互の魅力",
    keywords: ["unified love", "partnership", "connection", "attraction"],
    keywordsKr: ["통합된 사랑", "파트너십", "연결", "매력"],
    keywordsJa: ["統一された愛", "パートナーシップ", "つながり", "魅力"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_02.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 38,
    name: "Three of Cups",
    nameKr: "컵 3",
    nameJa: "カップの3",
    meaning: "Friendship, teamwork, creativity, community",
    meaningKr: "우정, 팀워크, 창조성, 공동체",
    meaningJa: "友情、チームワーク、創造性、コミュニティ",
    keywords: ["friendship", "teamwork", "creativity", "collaboration"],
    keywordsKr: ["우정", "팀워크", "창조성", "협력"],
    keywordsJa: ["友情", "チームワーク", "創造性", "協力"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_03.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 39,
    name: "Four of Cups",
    nameKr: "컵 4",
    nameJa: "カップの4",
    meaning: "Apathy, contemplation, disconnectedness",
    meaningKr: "무관심, 명상, 단절감",
    meaningJa: "無関心、熟考、断絶感",
    keywords: ["apathy", "contemplation", "reevaluation", "withdrawal"],
    keywordsKr: ["무관심", "명상", "재평가", "철수"],
    keywordsJa: ["無関心", "熟考", "再評価", "引きこもり"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_04.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 40,
    name: "Five of Cups",
    nameKr: "컵 5",
    nameJa: "カップの5",
    meaning: "Loss, regret, disappointment, recovery",
    meaningKr: "상실, 후회, 실망, 회복",
    meaningJa: "喪失、後悔、失望、回復",
    keywords: ["loss", "regret", "disappointment", "moving forward"],
    keywordsKr: ["상실", "후회", "실망", "앞으로 나아가기"],
    keywordsJa: ["喪失", "後悔", "失望", "前進"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_05.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 41,
    name: "Six of Cups",
    nameKr: "컵 6",
    nameJa: "カップの6",
    meaning: "Revisiting the past, childhood memories, innocence",
    meaningKr: "과거 회상, 어린 시절 추억, 순수함",
    meaningJa: "過去への回帰、幼少期の記憶、純真",
    keywords: ["nostalgia", "childhood", "innocence", "reunion"],
    keywordsKr: ["향수", "어린 시절", "순수함", "재회"],
    keywordsJa: ["ノスタルジア", "幼少期", "純真", "再会"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_06.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 42,
    name: "Seven of Cups",
    nameKr: "컵 7",
    nameJa: "カップの7",
    meaning: "Opportunities, choices, wishful thinking, illusion",
    meaningKr: "기회, 선택, 공상, 환상",
    meaningJa: "機会、選択、希望的観測、幻想",
    keywords: ["opportunities", "choices", "illusion", "fantasy"],
    keywordsKr: ["기회", "선택", "환상", "공상"],
    keywordsJa: ["機会", "選択", "幻想", "ファンタジー"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_07.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 43,
    name: "Eight of Cups",
    nameKr: "컵 8",
    nameJa: "カップの8",
    meaning: "Disappointment, abandonment, withdrawal, escapism",
    meaningKr: "실망, 포기, 철수, 도피주의",
    meaningJa: "失望、放棄、引きこもり、現実逃避",
    keywords: ["disappointment", "abandonment", "withdrawal", "moving on"],
    keywordsKr: ["실망", "포기", "철수", "다음으로 넘어가기"],
    keywordsJa: ["失望", "放棄", "引きこもり", "前進"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_08.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 44,
    name: "Nine of Cups",
    nameKr: "컵 9",
    nameJa: "カップの9",
    meaning: "Contentment, satisfaction, gratitude, wish come true",
    meaningKr: "만족, 충족, 감사, 소원 성취",
    meaningJa: "満足、充足、感謝、願いの成就",
    keywords: ["contentment", "satisfaction", "gratitude", "luxury"],
    keywordsKr: ["만족", "충족", "감사", "사치"],
    keywordsJa: ["満足", "充足", "感謝", "贅沢"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_09.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 45,
    name: "Ten of Cups",
    nameKr: "컵 10",
    nameJa: "カップの10",
    meaning: "Happiness, domestic bliss, emotional fulfillment",
    meaningKr: "행복, 가정의 평화, 감정적 만족",
    meaningJa: "幸福、家庭の平和、情緒的満足",
    keywords: ["happiness", "family", "emotional fulfillment", "harmony"],
    keywordsKr: ["행복", "가족", "감정적 만족", "조화"],
    keywordsJa: ["幸福", "家族", "情緒的満足", "調和"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_10.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 46,
    name: "Page of Cups",
    nameKr: "컵 페이지",
    nameJa: "カップのページ",
    meaning: "Creative opportunities, intuitive messages, curiosity",
    meaningKr: "창조적 기회, 직감적 메시지, 호기심",
    meaningJa: "創造的機会、直感的メッセージ、好奇心",
    keywords: ["creative opportunities", "intuition", "curiosity", "new ideas"],
    keywordsKr: ["창조적 기회", "직감", "호기심", "새로운 아이디어"],
    keywordsJa: ["創造的機会", "直感", "好奇心", "新しいアイデア"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_page.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 47,
    name: "Knight of Cups",
    nameKr: "컵 기사",
    nameJa: "カップのナイト",
    meaning: "Creativity, romance, charm, imagination",
    meaningKr: "창조성, 로맨스, 매력, 상상력",
    meaningJa: "創造性、ロマンス、魅力、想像力",
    keywords: ["creativity", "romance", "charm", "follow your heart"],
    keywordsKr: ["창조성", "로맨스", "매력", "마음을 따르기"],
    keywordsJa: ["創造性", "ロマンス", "魅力", "心に従う"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_knight.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 48,
    name: "Queen of Cups",
    nameKr: "컵 퀸",
    nameJa: "カップのクイーン",
    meaning: "Compassionate, caring, emotionally stable",
    meaningKr: "자비로운, 돌보는, 감정적으로 안정된",
    meaningJa: "慈悲深い、思いやりのある、情緒的に安定",
    keywords: ["compassion", "caring", "emotional stability", "intuition"],
    keywordsKr: ["자비", "돌봄", "감정적 안정", "직감"],
    keywordsJa: ["慈悲", "思いやり", "情緒的安定", "直感"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_cups_queen.jpg'),
    element: "Water",
    suit: "Cups",
    type: "Minor Arcana"
  },
  {
    id: 49,
    name: "King of Cups",
    nameKr: "컵 킹",
    nameJa: "カップのキング",
    meaning: "Emotional balance, compassion, diplomacy",
    meaningKr: "감정적 균형, 연민, 외교술",
    meaningJa: "情緒的バランス、慈悲、外交術",
    keywords: ["emotional balance", "compassion", "diplomacy", "calmness"],
    keywordsKr: ["감정적 균형", "연민", "외교술", "차분함"],
    keywordsJa: ["情緒的バランス", "慈悲", "外交術", "冷静さ"],
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
    nameJa: "ソードのエース",
    meaning: "Breakthrough, clarity, sharp mind",
    meaningKr: "돌파구, 명확성, 날카로운 정신",
    meaningJa: "突破、明晰さ、鋭い精神",
    keywords: ["breakthrough", "clarity", "sharp mind", "new ideas"],
    keywordsKr: ["돌파구", "명확성", "날카로운 정신", "새로운 아이디어"],
    keywordsJa: ["突破", "明晰さ", "鋭い精神", "新しいアイデア"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_ace.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 51,
    name: "Two of Swords",
    nameKr: "소드 2",
    nameJa: "ソードの2",
    meaning: "Difficult decisions, weighing options, indecision",
    meaningKr: "어려운 결정, 선택지 고려, 우유부단",
    meaningJa: "困難な決断、選択肢の検討、優柄不断",
    keywords: ["difficult decisions", "indecision", "blocked emotions", "avoidance"],
    keywordsKr: ["어려운 결정", "우유부단", "차단된 감정", "회피"],
    keywordsJa: ["困難な決断", "優柄不断", "遮断された感情", "回避"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_02.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 52,
    name: "Three of Swords",
    nameKr: "소드 3",
    nameJa: "ソードの3",
    meaning: "Heartbreak, emotional pain, sorrow, grief",
    meaningKr: "마음의 상처, 감정적 고통, 슬픔, 비탄",
    meaningJa: "心の傷、情緒的苦痛、悲しみ、悲嘈",
    keywords: ["heartbreak", "sorrow", "grief", "betrayal"],
    keywordsKr: ["마음의 상처", "슬픔", "비탄", "배신"],
    keywordsJa: ["心の傷", "悲しみ", "悲合", "裏切り"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_03.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 53,
    name: "Four of Swords",
    nameKr: "소드 4",
    nameJa: "ソードの4",
    meaning: "Rest, relaxation, meditation, contemplation",
    meaningKr: "휴식, 이완, 명상, 숙고",
    meaningJa: "休息、リラックス、瑽想、睹思",
    keywords: ["rest", "relaxation", "meditation", "recuperation"],
    keywordsKr: ["휴식", "이완", "명상", "회복"],
    keywordsJa: ["休息", "リラックス", "瑽想", "回復"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_04.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 54,
    name: "Five of Swords",
    nameKr: "소드 5",
    nameJa: "ソードの5",
    meaning: "Conflict, disagreements, competition, defeat",
    meaningKr: "갈등, 불일치, 경쟁, 패배",
    meaningJa: "紛争、意見の相違、競争、敗北",
    keywords: ["conflict", "disagreements", "win at all costs", "betrayal"],
    keywordsKr: ["갈등", "불일치", "무조건적 승리", "배신"],
    keywordsJa: ["紛争", "意見の相違", "何としてでも勝つ", "裏切り"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_05.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 55,
    name: "Six of Swords",
    nameKr: "소드 6",
    nameJa: "ソードの6",
    meaning: "Transition, change, rite of passage, release",
    meaningKr: "전환, 변화, 통과의례, 해방",
    meaningJa: "移行、変化、通過儀礼、解放",
    keywords: ["transition", "change", "moving forward", "recovery"],
    keywordsKr: ["전환", "변화", "앞으로 나아가기", "회복"],
    keywordsJa: ["移行", "変化", "前進", "回復"],
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
    nameJa: "ソードの9",
    meaning: "Anxiety, worry, fear, depression, nightmares",
    meaningKr: "불안, 걱정, 두려움, 우울, 악몽",
    meaningJa: "不安、心配、恐れ、うつ病、悪夢",
    keywords: ["anxiety", "worry", "fear", "mental anguish"],
    keywordsKr: ["불안", "걱정", "두려움", "정신적 고통"],
    keywordsJa: ["不安", "心配", "恐れ", "精神的苦悩"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_09.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 59,
    name: "Ten of Swords",
    nameKr: "소드 10",
    nameJa: "ソードの10",
    meaning: "Painful endings, deep wounds, betrayal, loss",
    meaningKr: "고통스러운 끝, 깊은 상처, 배신, 상실",
    meaningJa: "痛みを伴う終わり、深い傷、裏切り、喪失",
    keywords: ["painful endings", "betrayal", "crisis", "rock bottom"],
    keywordsKr: ["고통스러운 끝", "배신", "위기", "바닥"],
    keywordsJa: ["痛みを伴う終わり", "裏切り", "危機", "どん底"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_10.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 60,
    name: "Page of Swords",
    nameKr: "소드 페이지",
    nameJa: "ソードのペーシ",
    meaning: "Curiosity, restlessness, mental energy",
    meaningKr: "호기심, 불안정, 정신적 에너지",
    meaningJa: "好奇心、落ち着きのなさ、精神的エネルギー",
    keywords: ["curiosity", "restlessness", "mental energy", "new ideas"],
    keywordsKr: ["호기심", "불안정", "정신적 에너지", "새로운 아이디어"],
    keywordsJa: ["好奇心", "落ち着きのなさ", "精神的エネルギー", "新しいアイデア"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_page.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 61,
    name: "Knight of Swords",
    nameKr: "소드 기사",
    nameJa: "ソードのナイト",
    meaning: "Ambition, drive, fast thinking, tunnel vision",
    meaningKr: "야망, 추진력, 빠른 사고, 터널 시야",
    meaningJa: "野心、推進力、素早い思考、狭い視野",
    keywords: ["ambition", "drive", "fast thinking", "impatience"],
    keywordsKr: ["야망", "추진력", "빠른 사고", "성급함"],
    keywordsJa: ["野心", "推進力", "素早い思考", "せっかち"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_knight.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 62,
    name: "Queen of Swords",
    nameKr: "소드 퀸",
    nameJa: "ソードのクイーン",
    meaning: "Independent, unbiased judgement, clear boundaries",
    meaningKr: "독립적, 편견 없는 판단, 명확한 경계",
    meaningJa: "独立、公正な判断、明確な境界",
    keywords: ["independent", "unbiased", "clear boundaries", "direct"],
    keywordsKr: ["독립적", "편견 없는", "명확한 경계", "직접적"],
    keywordsJa: ["独立", "公正", "明確な境界", "直接的"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_swords_queen.jpg'),
    element: "Air",
    suit: "Swords",
    type: "Minor Arcana"
  },
  {
    id: 63,
    name: "King of Swords",
    nameKr: "소드 킹",
    nameJa: "ソードのキング",
    meaning: "Mental clarity, intellectual power, authority",
    meaningKr: "정신적 명확성, 지적 능력, 권위",
    meaningJa: "精神的明晰さ、知的力、権威",
    keywords: ["mental clarity", "intellectual power", "authority", "truth"],
    keywordsKr: ["정신적 명확성", "지적 능력", "권위", "진실"],
    keywordsJa: ["精神的明晰さ", "知的力", "権威", "真実"],
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
    nameJa: "ペンタクルのエース",
    meaning: "Manifestation, new financial opportunity, abundance",
    meaningKr: "실현, 새로운 재정 기회, 풍요",
    meaningJa: "現実化、新しい経済的機会、豊かさ",
    keywords: ["manifestation", "new opportunity", "abundance", "prosperity"],
    keywordsKr: ["실현", "새로운 기회", "풍요", "번영"],
    keywordsJa: ["現実化", "新しい機会", "豊かさ", "繁栄"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_ace.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 65,
    name: "Two of Pentacles",
    nameKr: "펜타클 2",
    nameJa: "ペンタクルの2",
    meaning: "Multiple priorities, time management, adaptability",
    meaningKr: "여러 우선순위, 시간 관리, 적응력",
    meaningJa: "複数の優先事項、時間管理、適応力",
    keywords: ["multiple priorities", "time management", "adaptability", "balance"],
    keywordsKr: ["여러 우선순위", "시간 관리", "적응력", "균형"],
    keywordsJa: ["複数の優先事項", "時間管理", "適応力", "バランス"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_02.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 66,
    name: "Three of Pentacles",
    nameKr: "펜타클 3",
    nameJa: "ペンタクルの3",
    meaning: "Teamwork, collaboration, learning, implementation",
    meaningKr: "팀워크, 협력, 학습, 실행",
    meaningJa: "チームワーク、協力、学習、実行",
    keywords: ["teamwork", "collaboration", "learning", "building"],
    keywordsKr: ["팀워크", "협력", "학습", "구축"],
    keywordsJa: ["チームワーク", "協力", "学習", "構築"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_03.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 67,
    name: "Four of Pentacles",
    nameKr: "펜타클 4",
    nameJa: "ペンタクルの4",
    meaning: "Saving money, security, conservatism, scarcity",
    meaningKr: "돈 저축, 보안, 보수주의, 부족",
    meaningJa: "お金の節約、安全、保守主義、欠乏",
    keywords: ["saving money", "security", "possessiveness", "control"],
    keywordsKr: ["돈 저축", "보안", "소유욕", "통제"],
    keywordsJa: ["お金の節約", "安全", "所有欲", "支配"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_04.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 68,
    name: "Five of Pentacles",
    nameKr: "펜타클 5",
    nameJa: "ペンタクルの5",
    meaning: "Financial loss, poverty, lack mindset, isolation",
    meaningKr: "재정적 손실, 빈곤, 부족 사고방식, 고립",
    meaningJa: "経済的損失、貧困、欠乏思考、孤立",
    keywords: ["financial loss", "poverty", "isolation", "worry"],
    keywordsKr: ["재정적 손실", "빈곤", "고립", "걱정"],
    keywordsJa: ["経済的損失", "貧困", "孤立", "心配"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_05.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 69,
    name: "Six of Pentacles",
    nameKr: "펜타클 6",
    nameJa: "ペンタクルの6",
    meaning: "Giving, receiving, sharing wealth, generosity",
    meaningKr: "주기, 받기, 부의 공유, 관대함",
    meaningJa: "与える、受け取る、富の共有、寛大さ",
    keywords: ["giving", "receiving", "generosity", "charity"],
    keywordsKr: ["주기", "받기", "관대함", "자선"],
    keywordsJa: ["与える", "受け取る", "寛大さ", "慈善"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_06.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 70,
    name: "Seven of Pentacles",
    nameKr: "펜타클 7",
    nameJa: "ペンタクルの7",
    meaning: "Long-term view, sustainable results, perseverance",
    meaningKr: "장기적 관점, 지속 가능한 결과, 인내",
    meaningJa: "長期的視点、持続可能な結果、忍耐",
    keywords: ["long-term view", "perseverance", "investment", "patience"],
    keywordsKr: ["장기적 관점", "인내", "투자", "참을성"],
    keywordsJa: ["長期的視点", "忍耐", "投資", "忍耐力"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_07.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 71,
    name: "Eight of Pentacles",
    nameKr: "펜타클 8",
    nameJa: "ペンタクルの8",
    meaning: "Apprenticeship, repetitive tasks, mastery, skill development",
    meaningKr: "견습, 반복적 작업, 숙달, 기술 개발",
    meaningJa: "弟子入り、繰り返し作業、營達、スキル開発",
    keywords: ["apprenticeship", "skill development", "mastery", "dedication"],
    keywordsKr: ["견습", "기술 개발", "숙달", "헌신"],
    keywordsJa: ["弟子入り", "スキル開発", "營達", "献身"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_08.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 72,
    name: "Nine of Pentacles",
    nameKr: "펜타클 9",
    nameJa: "ペンタクルの9",
    meaning: "Abundance, luxury, self-reliance, financial independence",
    meaningKr: "풍요, 사치, 자립, 재정적 독립",
    meaningJa: "豊かさ、贅沢、自立、経済的独立",
    keywords: ["abundance", "luxury", "self-reliance", "financial independence"],
    keywordsKr: ["풍요", "사치", "자립", "재정적 독립"],
    keywordsJa: ["豊かさ", "贅沢", "自立", "経済的独立"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_09.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 73,
    name: "Ten of Pentacles",
    nameKr: "펜타클 10",
    nameJa: "ペンタクルの10",
    meaning: "Wealth, financial security, family, long-term success",
    meaningKr: "부, 재정적 안정, 가족, 장기적 성공",
    meaningJa: "富、経済的安定、家族、長期的成功",
    keywords: ["wealth", "financial security", "family", "legacy"],
    keywordsKr: ["부", "재정적 안정", "가족", "유산"],
    keywordsJa: ["富", "経済的安定", "家族", "遺産"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_10.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 74,
    name: "Page of Pentacles",
    nameKr: "펜타클 페이지",
    nameJa: "ペンタクルのページ",
    meaning: "Manifestation, financial opportunity, skill development",
    meaningKr: "실현, 재정 기회, 기술 개발",
    meaningJa: "現実化、金銭的機会、スキル開発",
    keywords: ["manifestation", "opportunity", "skill development", "studiousness"],
    keywordsKr: ["실현", "기회", "기술 개발", "근면함"],
    keywordsJa: ["現実化", "機会", "スキル開発", "勤勉さ"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_page.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 75,
    name: "Knight of Pentacles",
    nameKr: "펜타클 기사",
    nameJa: "ペンタクルのナイト",
    meaning: "Efficiency, hard work, responsibility, routine",
    meaningKr: "효율성, 노력, 책임감, 일상",
    meaningJa: "効率性、勤勉、責任感、ルーチン",
    keywords: ["efficiency", "hard work", "responsibility", "reliability"],
    keywordsKr: ["효율성", "노력", "책임감", "신뢰성"],
    keywordsJa: ["効率性", "勤勉", "責任感", "信頼性"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_knight.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 76,
    name: "Queen of Pentacles",
    nameKr: "펜타클 퀸",
    nameJa: "ペンタクルのクイーン",
    meaning: "Nurturing, practical, providing financially",
    meaningKr: "양육하는, 실용적, 재정적 지원",
    meaningJa: "養育、実用的、経済的支援",
    keywords: ["nurturing", "practical", "financial security", "down-to-earth"],
    keywordsKr: ["양육하는", "실용적", "재정적 안정", "현실적"],
    keywordsJa: ["養育", "実用的", "経済的安定", "現実的"],
    imageUrl: require('../assets/tarot-cards/classic-tarot/minor_pentacles_queen.jpg'),
    element: "Earth",
    suit: "Pentacles",
    type: "Minor Arcana"
  },
  {
    id: 77,
    name: "King of Pentacles",
    nameKr: "펜타클 킹",
    nameJa: "ペンタクルのキング",
    meaning: "Financial success, business acumen, security",
    meaningKr: "재정적 성공, 사업적 통찰력, 보안",
    meaningJa: "経済的成功、ビジネスの洞察力、安全",
    keywords: ["financial success", "business acumen", "security", "generosity"],
    keywordsKr: ["재정적 성공", "사업적 통찰력", "보안", "관대함"],
    keywordsJa: ["経済的成功", "ビジネスの洞察力", "安全", "寛大さ"],
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
    description: 'Basic card meaning study or daily learning focus',
    descriptionKr: '기본 카드 의미 학습 또는 일일 학습 주제',
    cardCount: 1,
    isPremium: false
  },
  {
    id: 'three-card',
    name: 'Three Card Spread',
    nameKr: '쓰리 카드 스프레드',
    description: 'Timeline analysis: past experiences, current situation, future goals',
    descriptionKr: '시간선 분석: 과거 경험, 현재 상황, 미래 목표',
    cardCount: 3,
    isPremium: false
  },
  {
    id: 'four-card',
    name: 'Four Card Spread',
    nameKr: '포 카드 스프레드',
    description: 'Multi-perspective analysis of personal development areas',
    descriptionKr: '개인 발달 영역에 대한 다각도 분석',
    cardCount: 4,
    isPremium: false
  },
  {
    id: 'five-card',
    name: 'Five Card V Spread',
    nameKr: '파이브 카드 V 스프레드',
    description: 'V-shaped comprehensive personal growth analysis',
    descriptionKr: 'V자 형태의 종합적 개인 성장 분석',
    cardCount: 5,
    isPremium: false
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    nameKr: '켈틱 크로스',
    description: 'In-depth personal development and life path analysis',
    descriptionKr: '심도 있는 개인 발달 및 인생 경로 분석',
    cardCount: 10,
    isPremium: true
  },
  {
    id: 'relationship',
    name: 'Cup of Relationship Spread',
    nameKr: '컵오브릴레이션십 스프레드',
    description: 'Relationship dynamics and interpersonal communication study',
    descriptionKr: '관계 역학 및 대인 커뮤니케이션 학습',
    cardCount: 11,
    isPremium: true
  },
  {
    id: 'choice',
    name: 'AB Choice Spread',
    nameKr: 'AB 선택 스프레드',
    description: 'Decision-making framework for comparing two options',
    descriptionKr: '두 옵션 비교를 위한 의사결정 프레임워크',
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

  // 24장 랜덤 카드 뽑기 (중복 가능 - 레거시)
  getRandomCards: (count: number = 24): TarotCard[] => {
    const cards: TarotCard[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(TarotUtils.getRandomCard());
    }
    return cards;
  },

  // 중복 없는 랜덤 카드 뽑기 (78장 덱에서 고유한 카드만)
  getRandomCardsNoDuplicates: (count: number = 24): TarotCard[] => {
    const availableCards = [...TAROT_CARDS]; // 전체 78장 덱 복사
    const selectedCards: TarotCard[] = [];

    // 요청된 카드 수가 전체 덱보다 많으면 전체 덱 크기로 제한
    const actualCount = Math.min(count, availableCards.length);

    for (let i = 0; i < actualCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      selectedCards.push(availableCards[randomIndex]);
      availableCards.splice(randomIndex, 1); // 뽑은 카드를 덱에서 제거
    }

    return selectedCards;
  },

  // 특정 카드를 제외하고 랜덤 카드 뽑기 (개별 카드 다시 뽑기용)
  getRandomCardExcluding: (excludeCard: TarotCard): TarotCard => {
    const availableCards = TAROT_CARDS.filter(card => card.id !== excludeCard.id);
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[randomIndex];
  },

  // 시간 포맷팅
  formatHour: (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  },

  // 현재 시간 가져오기
  getCurrentHour: (): number => {
    return new Date().getHours();
  },

  // 오늘 날짜 문자열 가져오기 (로컬 시간대 기준)
  getTodayDateString: (): string => {
    // ✅ 로컬 시간대 기준으로 날짜 생성 (UTC 버그 수정)
    // 이유: toISOString()은 UTC 기준이므로 한국에서 00:30에 전날로 인식되는 버그 발생
    // 예: 한국 2025-10-21 00:30 → UTC 2025-10-20 15:30 → "2025-10-20" (잘못됨)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // ID로 카드 찾기
  getCardById: (id: number): TarotCard | undefined => {
    return TAROT_CARDS.find(card => card.id === id);
  },

  // 전체 카드 덱 반환
  getAllCards: (): TarotCard[] => {
    return TAROT_CARDS;
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
      // 저장 제한 확인
      const limitCheck = await LocalStorageManager.checkUsageLimit('spread');

      if (limitCheck.isAtLimit) {
        const error = new Error('STORAGE_LIMIT_REACHED');
        (error as any).limitInfo = limitCheck;
        throw error;
      }

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

  // 스프레드 수정
  updateSpread: async (spreadId: string, updates: Partial<SavedSpread>): Promise<void> => {
    try {
      const existingSpreads = await TarotUtils.loadSavedSpreads();
      const updatedSpreads = existingSpreads.map(spread => {
        if (spread.id === spreadId) {
          return {
            ...spread,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return spread;
      });
      await simpleStorage.setItem(STORAGE_KEYS.SPREAD_SAVES, JSON.stringify(updatedSpreads));
    } catch (error) {
      console.error('스프레드 수정 실패:', error);
      throw error;
    }
  },

  // 일일 타로 저장
  saveDailyTarot: async (dailyTarot: DailyTarotSave): Promise<void> => {
    try {
      // 저장 제한 확인 (실시간 카운트)
      const limitCheck = await LocalStorageManager.checkUsageLimit('daily');

      if (limitCheck.isAtLimit) {
        console.warn(`⚠️ DailyTarot 저장 제한 도달: ${limitCheck.currentCount}/${limitCheck.maxCount}`);

        // ✅ FIX: 저장 제한 시 가장 오래된 데이터 삭제 (Rolling Window 방식)
        // 무료 사용자도 계속 앱을 사용할 수 있도록 함
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const dailyTarotKeys = allKeys.filter(key => key.startsWith('daily_tarot_'));

          if (dailyTarotKeys.length > 0) {
            // 날짜순으로 정렬하여 가장 오래된 키 찾기
            // 키 형식: daily_tarot_YYYY-MM-DD
            const sortedKeys = dailyTarotKeys.sort((a, b) => {
              const dateA = a.replace('daily_tarot_', '');
              const dateB = b.replace('daily_tarot_', '');
              return dateA.localeCompare(dateB);
            });

            const oldestKey = sortedKeys[0];
            await AsyncStorage.removeItem(oldestKey);
            console.log(`🗑️ 저장 공간 확보: 가장 오래된 데이터 삭제 (${oldestKey})`);
          }
        } catch (deleteError) {
          console.error('❌ 오래된 데이터 삭제 실패:', deleteError);
          // 삭제 실패해도 저장은 시도
        }
      }

      const storageKey = STORAGE_KEYS.DAILY_TAROT + dailyTarot.date;
      await simpleStorage.setItem(storageKey, JSON.stringify(dailyTarot));

      // ✅ checkUsageLimit가 실시간으로 파일 개수를 세므로 별도 카운트 업데이트 불필요
      console.log(`✅ DailyTarot 저장 성공: ${dailyTarot.date}`);
    } catch (error) {
      console.error('❌ 일일 타로 저장 실패:', error);
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

// AsyncStorage 기반 지속적 저장소
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalStorageManager } from './localStorage';

class SimpleStorage {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
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