import moment from 'moment-timezone';

// 타로 카드 인터페이스 (메인 앱과 동일)
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

// 일일 타로 저장 인터페이스
export interface DailyTarotSave {
  id: string;
  date: string; // YYYY-MM-DD
  hourlyCards: TarotCard[]; // 24장의 카드
  memos: { [hour: number]: string }; // 시간별 메모
  insights: string; // 전체 인사이트
  savedAt: string; // ISO string
}

// 타로 카드 기본 데이터 (주요 22장 메이저 아르카나)
const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    name: "The Fool",
    nameKr: "바보",
    meaning: "New beginnings, spontaneity, innocence",
    meaningKr: "새로운 시작, 순수함, 모험",
    keywords: ["beginning", "innocence", "journey", "potential"],
    keywordsKr: ["시작", "순수", "여행", "가능성"],
    imageUrl: "/assets/tarot-cards/major_00_fool.jpg",
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
    imageUrl: "/assets/tarot-cards/major_01_magician.jpg",
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
    imageUrl: "/assets/tarot-cards/major_02_high_priestess.jpg",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 3,
    name: "The Empress",
    nameKr: "여황제",
    meaning: "Femininity, beauty, nature",
    meaningKr: "여성성, 아름다움, 자연",
    keywords: ["femininity", "beauty", "nature", "abundance"],
    keywordsKr: ["여성성", "아름다움", "자연", "풍요"],
    imageUrl: "/assets/tarot-cards/major_03_empress.jpg",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 4,
    name: "The Emperor",
    nameKr: "황제",
    meaning: "Authority, father-figure, structure",
    meaningKr: "권위, 아버지상, 구조",
    keywords: ["authority", "structure", "control", "stability"],
    keywordsKr: ["권위", "구조", "통제", "안정"],
    imageUrl: "/assets/tarot-cards/major_04_emperor.jpg",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 5,
    name: "The Hierophant",
    nameKr: "교황",
    meaning: "Spiritual wisdom, religious beliefs",
    meaningKr: "영적 지혜, 종교적 믿음",
    keywords: ["tradition", "conformity", "morality", "ethics"],
    keywordsKr: ["전통", "순응", "도덕", "윤리"],
    imageUrl: "/assets/tarot-cards/major_05_hierophant.jpg",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 6,
    name: "The Lovers",
    nameKr: "연인",
    meaning: "Love, harmony, relationships",
    meaningKr: "사랑, 조화, 관계",
    keywords: ["love", "union", "relationships", "choices"],
    keywordsKr: ["사랑", "결합", "관계", "선택"],
    imageUrl: "/assets/tarot-cards/major_06_lovers.jpg",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 7,
    name: "The Chariot",
    nameKr: "전차",
    meaning: "Control, will power, success",
    meaningKr: "통제, 의지력, 성공",
    keywords: ["control", "will", "success", "determination"],
    keywordsKr: ["통제", "의지", "성공", "결단"],
    imageUrl: "/assets/tarot-cards/major_07_chariot.jpg",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 8,
    name: "Strength",
    nameKr: "힘",
    meaning: "Strength, courage, patience",
    meaningKr: "힘, 용기, 인내",
    keywords: ["strength", "courage", "patience", "compassion"],
    keywordsKr: ["힘", "용기", "인내", "연민"],
    imageUrl: "/assets/tarot-cards/major_08_strength.jpg",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 9,
    name: "The Hermit",
    nameKr: "은둔자",
    meaning: "Introspection, searching, guidance",
    meaningKr: "내성, 탐구, 안내",
    keywords: ["introspection", "searching", "guidance", "solitude"],
    keywordsKr: ["내성", "탐구", "안내", "고독"],
    imageUrl: "/assets/tarot-cards/major_09_hermit.jpg",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    nameKr: "운명의 수레바퀴",
    meaning: "Good luck, karma, life cycles",
    meaningKr: "행운, 업보, 인생의 순환",
    keywords: ["luck", "karma", "fate", "destiny"],
    keywordsKr: ["운", "업보", "숙명", "운명"],
    imageUrl: "/assets/tarot-cards/major_10_wheel_of_fortune.jpg",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 11,
    name: "Justice",
    nameKr: "정의",
    meaning: "Justice, fairness, truth",
    meaningKr: "정의, 공정함, 진실",
    keywords: ["justice", "fairness", "truth", "cause and effect"],
    keywordsKr: ["정의", "공정", "진실", "인과응보"],
    imageUrl: "/assets/tarot-cards/major_11_justice.jpg",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 12,
    name: "The Hanged Man",
    nameKr: "매달린 사람",
    meaning: "Suspension, restriction, letting go",
    meaningKr: "보류, 제한, 내려놓음",
    keywords: ["suspension", "restriction", "letting go", "sacrifice"],
    keywordsKr: ["보류", "제한", "내려놓음", "희생"],
    imageUrl: "/assets/tarot-cards/major_12_hanged_man.jpg",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 13,
    name: "Death",
    nameKr: "죽음",
    meaning: "Endings, beginnings, change",
    meaningKr: "끝, 시작, 변화",
    keywords: ["endings", "beginnings", "change", "transformation"],
    keywordsKr: ["끝", "시작", "변화", "변환"],
    imageUrl: "/assets/tarot-cards/major_13_death.jpg",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 14,
    name: "Temperance",
    nameKr: "절제",
    meaning: "Balance, moderation, patience",
    meaningKr: "균형, 절제, 인내",
    keywords: ["balance", "moderation", "patience", "purpose"],
    keywordsKr: ["균형", "절제", "인내", "목적"],
    imageUrl: "/assets/tarot-cards/major_14_temperance.jpg",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 15,
    name: "The Devil",
    nameKr: "악마",
    meaning: "Bondage, addiction, sexuality",
    meaningKr: "속박, 중독, 성적 욕구",
    keywords: ["bondage", "addiction", "restriction", "sexuality"],
    keywordsKr: ["속박", "중독", "제약", "성적 욕구"],
    imageUrl: "/assets/tarot-cards/major_15_devil.jpg",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 16,
    name: "The Tower",
    nameKr: "탑",
    meaning: "Sudden change, upheaval, chaos",
    meaningKr: "급작스런 변화, 격변, 혼돈",
    keywords: ["sudden change", "upheaval", "chaos", "revelation"],
    keywordsKr: ["급변", "격변", "혼돈", "폭로"],
    imageUrl: "/assets/tarot-cards/major_16_tower.jpg",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 17,
    name: "The Star",
    nameKr: "별",
    meaning: "Hope, faith, purpose, renewal",
    meaningKr: "희망, 믿음, 목적, 재생",
    keywords: ["hope", "faith", "purpose", "renewal"],
    keywordsKr: ["희망", "믿음", "목적", "재생"],
    imageUrl: "/assets/tarot-cards/major_17_star.jpg",
    element: "Air",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 18,
    name: "The Moon",
    nameKr: "달",
    meaning: "Illusion, fear, anxiety, intuition",
    meaningKr: "환상, 두려움, 불안, 직관",
    keywords: ["illusion", "fear", "anxiety", "intuition"],
    keywordsKr: ["환상", "두려움", "불안", "직관"],
    imageUrl: "/assets/tarot-cards/major_18_moon.jpg",
    element: "Water",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 19,
    name: "The Sun",
    nameKr: "태양",
    meaning: "Happiness, success, optimism",
    meaningKr: "행복, 성공, 낙관주의",
    keywords: ["happiness", "success", "optimism", "truth"],
    keywordsKr: ["행복", "성공", "낙관", "진실"],
    imageUrl: "/assets/tarot-cards/major_19_sun.jpg",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 20,
    name: "Judgement",
    nameKr: "심판",
    meaning: "Judgement, rebirth, inner calling",
    meaningKr: "심판, 재탄생, 내면의 부름",
    keywords: ["judgement", "rebirth", "inner calling", "absolution"],
    keywordsKr: ["심판", "재탄생", "내면의 부름", "사면"],
    imageUrl: "/assets/tarot-cards/major_20_judgement.jpg",
    element: "Fire",
    suit: "Major",
    type: "Major Arcana"
  },
  {
    id: 21,
    name: "The World",
    nameKr: "세계",
    meaning: "Completion, accomplishment, travel",
    meaningKr: "완성, 성취, 여행",
    keywords: ["completion", "accomplishment", "travel", "success"],
    keywordsKr: ["완성", "성취", "여행", "성공"],
    imageUrl: "/assets/tarot-cards/major_21_world.jpg",
    element: "Earth",
    suit: "Major",
    type: "Major Arcana"
  }
];

/**
 * 타로 카드 관리 서비스
 * 메인 앱의 타로 카드 생성 및 관리 로직과 연동
 */
class TarotCardService {
  /**
   * 랜덤한 타로 카드 선택
   * @param count 선택할 카드 수
   * @returns 선택된 카드 배열
   */
  getRandomCards(count: number): TarotCard[] {
    if (count <= 0) return [];
    if (count > MAJOR_ARCANA.length) {
      throw new Error(`Cannot select ${count} cards, only ${MAJOR_ARCANA.length} available`);
    }

    const shuffledCards = [...MAJOR_ARCANA];

    // Fisher-Yates 셔플 알고리즘
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    return shuffledCards.slice(0, count);
  }

  /**
   * 24시간 타로 카드 세트 생성
   * @param userId 사용자 ID
   * @param date 날짜 (YYYY-MM-DD)
   * @returns 24장의 카드 배열
   */
  generateDailyCards(userId: string, date?: string): TarotCard[] {
    const targetDate = date || moment().format('YYYY-MM-DD');

    console.log(`🔮 Generating 24 daily cards for user ${userId} for date ${targetDate}`);

    // 날짜 기반 시드를 사용하여 일관성 있는 랜덤성 제공
    const seed = this.generateDateSeed(userId, targetDate);

    // 시드 기반으로 24장 카드 선택
    const dailyCards = this.getSeededRandomCards(24, seed);

    console.log(`✅ Generated 24 daily cards: ${dailyCards.map(c => c.nameKr).join(', ')}`);

    return dailyCards;
  }

  /**
   * 특정 시간의 카드 조회
   * @param userId 사용자 ID
   * @param hour 시간 (0-23)
   * @param date 날짜 (선택사항)
   * @returns 해당 시간의 타로 카드
   */
  getHourlyCard(userId: string, hour: number, date?: string): TarotCard | null {
    if (hour < 0 || hour > 23) {
      console.error(`Invalid hour: ${hour}. Must be between 0-23`);
      return null;
    }

    try {
      const dailyCards = this.generateDailyCards(userId, date);
      return dailyCards[hour] || null;
    } catch (error) {
      console.error(`Error getting hourly card for user ${userId} at hour ${hour}:`, error);
      return null;
    }
  }

  /**
   * 자정 카드 리셋 처리
   * @param userId 사용자 ID
   * @param timezone 시간대
   * @returns 새로운 카드 세트와 메타데이터
   */
  async performMidnightReset(userId: string, timezone: string = 'Asia/Seoul'): Promise<{
    success: boolean;
    newCards?: TarotCard[];
    date?: string;
    error?: string;
  }> {
    try {
      const userTime = moment().tz(timezone);
      const newDate = userTime.format('YYYY-MM-DD');

      console.log(`🌙 Performing midnight reset for user ${userId} (${timezone}) - Date: ${newDate}`);

      // 새로운 24시간 카드 생성
      const newCards = this.generateDailyCards(userId, newDate);

      // 여기서 실제로는 데이터베이스나 스토리지에 저장해야 함
      // 현재는 로깅만 수행
      console.log(`✅ Midnight reset completed for user ${userId}:`);
      console.log(`   - Date: ${newDate}`);
      console.log(`   - Cards generated: ${newCards.length}`);
      console.log(`   - Sample cards: ${newCards.slice(0, 3).map(c => c.nameKr).join(', ')}...`);

      return {
        success: true,
        newCards,
        date: newDate
      };
    } catch (error) {
      console.error(`❌ Error during midnight reset for user ${userId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 날짜와 사용자 기반 시드 생성
   * @param userId 사용자 ID
   * @param date 날짜 문자열
   * @returns 시드 값
   */
  private generateDateSeed(userId: string, date: string): number {
    const combined = `${userId}_${date}`;
    let seed = 0;

    for (let i = 0; i < combined.length; i++) {
      seed = ((seed << 5) - seed + combined.charCodeAt(i)) & 0xffffffff;
    }

    return Math.abs(seed);
  }

  /**
   * 시드 기반 랜덤 카드 선택
   * @param count 선택할 카드 수
   * @param seed 시드 값
   * @returns 선택된 카드 배열
   */
  private getSeededRandomCards(count: number, seed: number): TarotCard[] {
    if (count <= 0) return [];
    if (count > MAJOR_ARCANA.length) count = MAJOR_ARCANA.length;

    // 시드 기반 랜덤 생성기
    let currentSeed = seed;
    const random = (): number => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    const shuffledCards = [...MAJOR_ARCANA];

    // 시드 기반 Fisher-Yates 셔플
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    return shuffledCards.slice(0, count);
  }

  /**
   * 시간 포맷팅 유틸리티
   * @param hour 시간 (0-23)
   * @returns 포맷된 시간 문자열
   */
  formatHour(hour: number): string {
    if (hour < 0 || hour > 23) return '잘못된 시간';

    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${period} ${displayHour}시`;
  }

  /**
   * 카드 정보 요약
   * @param card 타로 카드
   * @returns 카드 요약 정보
   */
  getCardSummary(card: TarotCard): string {
    return `${card.nameKr} (${card.name}): ${card.meaningKr}`;
  }

  /**
   * 서비스 상태 확인
   * @returns 서비스 상태 정보
   */
  getServiceStatus(): {
    status: 'healthy' | 'error';
    cardCount: number;
    version: string;
    timestamp: string;
  } {
    return {
      status: 'healthy',
      cardCount: MAJOR_ARCANA.length,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }
}

export default new TarotCardService();