/**
 * 시간대별 타로 카드 알림 메시지 템플릿
 * 각 시간대의 특성과 에너지에 맞는 맞춤형 메시지
 */

export interface HourlyNotificationTemplate {
  titleTemplate: string;
  bodyTemplate: string;
  mood: string;
  energy: string;
}

export interface NotificationMessages {
  [lang: string]: {
    [hour: number]: HourlyNotificationTemplate;
  };
}

export const HOURLY_NOTIFICATION_MESSAGES: NotificationMessages = {
  // 한국어 메시지
  ko: {
    0: {
      titleTemplate: "🌙 자정의 신비로운 메시지",
      bodyTemplate: "{cardName} - 새로운 하루를 위한 우주의 속삭임: {meaning}",
      mood: "mystical",
      energy: "renewal"
    },
    1: {
      titleTemplate: "✨ 깊은 밤의 직감",
      bodyTemplate: "{cardName} - 고요한 시간에 들려오는 내면의 목소리: {meaning}",
      mood: "introspective",
      energy: "intuitive"
    },
    2: {
      titleTemplate: "🔮 꿈과 현실의 경계",
      bodyTemplate: "{cardName} - 무의식의 문이 열리는 순간: {meaning}",
      mood: "ethereal",
      energy: "subconscious"
    },
    3: {
      titleTemplate: "⭐ 새벽별의 인도",
      bodyTemplate: "{cardName} - 어둠 속에서 빛나는 희망의 메시지: {meaning}",
      mood: "hopeful",
      energy: "guidance"
    },
    4: {
      titleTemplate: "🌌 새벽의 깨달음",
      bodyTemplate: "{cardName} - 고요한 새벽에 찾아온 영감: {meaning}",
      mood: "contemplative",
      energy: "inspiration"
    },
    5: {
      titleTemplate: "🌅 일출의 시작",
      bodyTemplate: "{cardName} - 새로운 가능성의 문이 열리는 시간: {meaning}",
      mood: "optimistic",
      energy: "beginning"
    },
    6: {
      titleTemplate: "☀️ 아침의 활력",
      bodyTemplate: "{cardName} - 상쾌한 아침 에너지와 함께하는 메시지: {meaning}",
      mood: "energetic",
      energy: "vitality"
    },
    7: {
      titleTemplate: "🌄 새로운 출발",
      bodyTemplate: "{cardName} - 하루를 시작하는 마음으로 받아들이세요: {meaning}",
      mood: "fresh",
      energy: "motivation"
    },
    8: {
      titleTemplate: "🌞 아침의 결심",
      bodyTemplate: "{cardName} - 하루의 목표를 세우는 시간, 타로의 조언: {meaning}",
      mood: "determined",
      energy: "planning"
    },
    9: {
      titleTemplate: "📅 오전의 집중",
      bodyTemplate: "{cardName} - 집중력이 최고조에 달하는 시간: {meaning}",
      mood: "focused",
      energy: "productivity"
    },
    10: {
      titleTemplate: "☕ 오전의 여유",
      bodyTemplate: "{cardName} - 잠시 멈춰서 받아들일 메시지: {meaning}",
      mood: "relaxed",
      energy: "reflection"
    },
    11: {
      titleTemplate: "⚡ 오전의 완성",
      bodyTemplate: "{cardName} - 점심 전 마지막 영감의 순간: {meaning}",
      mood: "accomplished",
      energy: "completion"
    },
    12: {
      titleTemplate: "🌅 정오의 균형",
      bodyTemplate: "{cardName} - 하루의 중심에서 찾는 균형점: {meaning}",
      mood: "balanced",
      energy: "harmony"
    },
    13: {
      titleTemplate: "🍽️ 오후의 시작",
      bodyTemplate: "{cardName} - 새로운 에너지로 시작하는 오후: {meaning}",
      mood: "renewed",
      energy: "restart"
    },
    14: {
      titleTemplate: "🌤️ 오후의 안정",
      bodyTemplate: "{cardName} - 차분한 오후 시간의 메시지: {meaning}",
      mood: "stable",
      energy: "consistency"
    },
    15: {
      titleTemplate: "☕ 티타임의 지혜",
      bodyTemplate: "{cardName} - 잠시 쉬어가며 받는 타로의 조언: {meaning}",
      mood: "contemplative",
      energy: "wisdom"
    },
    16: {
      titleTemplate: "🎯 오후의 집중",
      bodyTemplate: "{cardName} - 마지막 집중의 시간, 목표를 향해: {meaning}",
      mood: "determined",
      energy: "focus"
    },
    17: {
      titleTemplate: "🌇 일과의 마무리",
      bodyTemplate: "{cardName} - 하루의 성과를 돌아보는 시간: {meaning}",
      mood: "reflective",
      energy: "completion"
    },
    18: {
      titleTemplate: "🌆 저녁의 시작",
      bodyTemplate: "{cardName} - 여유로운 저녁 시간의 첫 메시지: {meaning}",
      mood: "peaceful",
      energy: "transition"
    },
    19: {
      titleTemplate: "🍽️ 저녁 식사 시간",
      bodyTemplate: "{cardName} - 가족과 함께하는 시간의 의미: {meaning}",
      mood: "warm",
      energy: "connection"
    },
    20: {
      titleTemplate: "🌃 저녁의 여유",
      bodyTemplate: "{cardName} - 하루를 정리하며 받는 메시지: {meaning}",
      mood: "relaxed",
      energy: "closure"
    },
    21: {
      titleTemplate: "📚 밤의 성찰",
      bodyTemplate: "{cardName} - 오늘 하루를 돌아보는 시간: {meaning}",
      mood: "reflective",
      energy: "introspection"
    },
    22: {
      titleTemplate: "🌙 잠자리 준비",
      bodyTemplate: "{cardName} - 하루를 마무리하며 내일을 위한 메시지: {meaning}",
      mood: "peaceful",
      energy: "preparation"
    },
    23: {
      titleTemplate: "✨ 밤의 마지막",
      bodyTemplate: "{cardName} - 잠들기 전 마지막 타로의 선물: {meaning}",
      mood: "serene",
      energy: "rest"
    }
  },

  // 영어 메시지
  en: {
    0: {
      titleTemplate: "🌙 Midnight's Mystical Message",
      bodyTemplate: "{cardName} - The universe whispers for a new day: {meaning}",
      mood: "mystical",
      energy: "renewal"
    },
    1: {
      titleTemplate: "✨ Deep Night Intuition",
      bodyTemplate: "{cardName} - Your inner voice speaks in the quiet hour: {meaning}",
      mood: "introspective",
      energy: "intuitive"
    },
    2: {
      titleTemplate: "🔮 Between Dreams and Reality",
      bodyTemplate: "{cardName} - When the unconscious door opens: {meaning}",
      mood: "ethereal",
      energy: "subconscious"
    },
    3: {
      titleTemplate: "⭐ Dawn Star's Guidance",
      bodyTemplate: "{cardName} - A message of hope shining in the darkness: {meaning}",
      mood: "hopeful",
      energy: "guidance"
    },
    4: {
      titleTemplate: "🌌 Pre-Dawn Enlightenment",
      bodyTemplate: "{cardName} - Inspiration arrives in the quiet dawn: {meaning}",
      mood: "contemplative",
      energy: "inspiration"
    },
    5: {
      titleTemplate: "🌅 Sunrise Beginning",
      bodyTemplate: "{cardName} - The door of new possibilities opens: {meaning}",
      mood: "optimistic",
      energy: "beginning"
    },
    6: {
      titleTemplate: "☀️ Morning Vitality",
      bodyTemplate: "{cardName} - A message carried by fresh morning energy: {meaning}",
      mood: "energetic",
      energy: "vitality"
    },
    7: {
      titleTemplate: "🌄 New Departure",
      bodyTemplate: "{cardName} - Embrace this message as you start your day: {meaning}",
      mood: "fresh",
      energy: "motivation"
    },
    8: {
      titleTemplate: "🌞 Morning Resolution",
      bodyTemplate: "{cardName} - Time to set daily goals, tarot's advice: {meaning}",
      mood: "determined",
      energy: "planning"
    },
    9: {
      titleTemplate: "📅 Morning Focus",
      bodyTemplate: "{cardName} - When concentration peaks: {meaning}",
      mood: "focused",
      energy: "productivity"
    },
    10: {
      titleTemplate: "☕ Morning Leisure",
      bodyTemplate: "{cardName} - Pause for a moment to receive this message: {meaning}",
      mood: "relaxed",
      energy: "reflection"
    },
    11: {
      titleTemplate: "⚡ Morning Completion",
      bodyTemplate: "{cardName} - The last moment of inspiration before lunch: {meaning}",
      mood: "accomplished",
      energy: "completion"
    },
    12: {
      titleTemplate: "🌅 Noon Balance",
      bodyTemplate: "{cardName} - Finding balance at the center of the day: {meaning}",
      mood: "balanced",
      energy: "harmony"
    },
    13: {
      titleTemplate: "🍽️ Afternoon Beginning",
      bodyTemplate: "{cardName} - Starting the afternoon with new energy: {meaning}",
      mood: "renewed",
      energy: "restart"
    },
    14: {
      titleTemplate: "🌤️ Afternoon Stability",
      bodyTemplate: "{cardName} - A message for the calm afternoon hours: {meaning}",
      mood: "stable",
      energy: "consistency"
    },
    15: {
      titleTemplate: "☕ Tea Time Wisdom",
      bodyTemplate: "{cardName} - Tarot's advice during a brief rest: {meaning}",
      mood: "contemplative",
      energy: "wisdom"
    },
    16: {
      titleTemplate: "🎯 Afternoon Focus",
      bodyTemplate: "{cardName} - Final concentration time, toward your goal: {meaning}",
      mood: "determined",
      energy: "focus"
    },
    17: {
      titleTemplate: "🌇 End of Workday",
      bodyTemplate: "{cardName} - Time to reflect on the day's achievements: {meaning}",
      mood: "reflective",
      energy: "completion"
    },
    18: {
      titleTemplate: "🌆 Evening Begins",
      bodyTemplate: "{cardName} - The first message of leisurely evening time: {meaning}",
      mood: "peaceful",
      energy: "transition"
    },
    19: {
      titleTemplate: "🍽️ Dinner Time",
      bodyTemplate: "{cardName} - The meaning of time spent with family: {meaning}",
      mood: "warm",
      energy: "connection"
    },
    20: {
      titleTemplate: "🌃 Evening Leisure",
      bodyTemplate: "{cardName} - A message received while organizing the day: {meaning}",
      mood: "relaxed",
      energy: "closure"
    },
    21: {
      titleTemplate: "📚 Night Reflection",
      bodyTemplate: "{cardName} - Time to look back on today: {meaning}",
      mood: "reflective",
      energy: "introspection"
    },
    22: {
      titleTemplate: "🌙 Bedtime Preparation",
      bodyTemplate: "{cardName} - A message for tomorrow while ending today: {meaning}",
      mood: "peaceful",
      energy: "preparation"
    },
    23: {
      titleTemplate: "✨ Night's Final Gift",
      bodyTemplate: "{cardName} - Tarot's last gift before sleep: {meaning}",
      mood: "serene",
      energy: "rest"
    }
  },

  // 일본어 메시지
  ja: {
    0: {
      titleTemplate: "🌙 真夜中の神秘的なメッセージ",
      bodyTemplate: "{cardName} - 新しい一日のための宇宙のささやき：{meaning}",
      mood: "mystical",
      energy: "renewal"
    },
    1: {
      titleTemplate: "✨ 深夜の直感",
      bodyTemplate: "{cardName} - 静かな時間に聞こえる内なる声：{meaning}",
      mood: "introspective",
      energy: "intuitive"
    },
    2: {
      titleTemplate: "🔮 夢と現実の境界",
      bodyTemplate: "{cardName} - 無意識の扉が開かれる瞬間：{meaning}",
      mood: "ethereal",
      energy: "subconscious"
    },
    3: {
      titleTemplate: "⭐ 明けの明星の導き",
      bodyTemplate: "{cardName} - 闇の中で輝く希望のメッセージ：{meaning}",
      mood: "hopeful",
      energy: "guidance"
    },
    4: {
      titleTemplate: "🌌 夜明けの悟り",
      bodyTemplate: "{cardName} - 静かな夜明けに訪れたインスピレーション：{meaning}",
      mood: "contemplative",
      energy: "inspiration"
    },
    5: {
      titleTemplate: "🌅 日の出の始まり",
      bodyTemplate: "{cardName} - 新しい可能性の扉が開かれる時間：{meaning}",
      mood: "optimistic",
      energy: "beginning"
    },
    6: {
      titleTemplate: "☀️ 朝の活力",
      bodyTemplate: "{cardName} - 爽やかな朝のエネルギーと共にあるメッセージ：{meaning}",
      mood: "energetic",
      energy: "vitality"
    },
    7: {
      titleTemplate: "🌄 新たな出発",
      bodyTemplate: "{cardName} - 一日を始める気持ちで受け入れてください：{meaning}",
      mood: "fresh",
      energy: "motivation"
    },
    8: {
      titleTemplate: "🌞 朝の決意",
      bodyTemplate: "{cardName} - 一日の目標を立てる時間、タロットのアドバイス：{meaning}",
      mood: "determined",
      energy: "planning"
    },
    9: {
      titleTemplate: "📅 午前の集中",
      bodyTemplate: "{cardName} - 集中力が最高潮に達する時間：{meaning}",
      mood: "focused",
      energy: "productivity"
    },
    10: {
      titleTemplate: "☕ 午前の余裕",
      bodyTemplate: "{cardName} - しばし立ち止まって受け取るメッセージ：{meaning}",
      mood: "relaxed",
      energy: "reflection"
    },
    11: {
      titleTemplate: "⚡ 午前の完成",
      bodyTemplate: "{cardName} - 昼食前最後のインスピレーションの瞬間：{meaning}",
      mood: "accomplished",
      energy: "completion"
    },
    12: {
      titleTemplate: "🌅 正午のバランス",
      bodyTemplate: "{cardName} - 一日の中心で見つけるバランスポイント：{meaning}",
      mood: "balanced",
      energy: "harmony"
    },
    13: {
      titleTemplate: "🍽️ 午後の始まり",
      bodyTemplate: "{cardName} - 新しいエネルギーで始まる午後：{meaning}",
      mood: "renewed",
      energy: "restart"
    },
    14: {
      titleTemplate: "🌤️ 午後の安定",
      bodyTemplate: "{cardName} - 穏やかな午後時間のメッセージ：{meaning}",
      mood: "stable",
      energy: "consistency"
    },
    15: {
      titleTemplate: "☕ ティータイムの知恵",
      bodyTemplate: "{cardName} - しばし休憩しながら受けるタロットのアドバイス：{meaning}",
      mood: "contemplative",
      energy: "wisdom"
    },
    16: {
      titleTemplate: "🎯 午後の集中",
      bodyTemplate: "{cardName} - 最後の集中の時間、目標に向かって：{meaning}",
      mood: "determined",
      energy: "focus"
    },
    17: {
      titleTemplate: "🌇 仕事の終わり",
      bodyTemplate: "{cardName} - 一日の成果を振り返る時間：{meaning}",
      mood: "reflective",
      energy: "completion"
    },
    18: {
      titleTemplate: "🌆 夕方の始まり",
      bodyTemplate: "{cardName} - ゆったりとした夕方時間の最初のメッセージ：{meaning}",
      mood: "peaceful",
      energy: "transition"
    },
    19: {
      titleTemplate: "🍽️ 夕食時間",
      bodyTemplate: "{cardName} - 家族と過ごす時間の意味：{meaning}",
      mood: "warm",
      energy: "connection"
    },
    20: {
      titleTemplate: "🌃 夕方の余裕",
      bodyTemplate: "{cardName} - 一日を整理しながら受けるメッセージ：{meaning}",
      mood: "relaxed",
      energy: "closure"
    },
    21: {
      titleTemplate: "📚 夜の省察",
      bodyTemplate: "{cardName} - 今日一日を振り返る時間：{meaning}",
      mood: "reflective",
      energy: "introspection"
    },
    22: {
      titleTemplate: "🌙 就寝準備",
      bodyTemplate: "{cardName} - 一日を終えながら明日のためのメッセージ：{meaning}",
      mood: "peaceful",
      energy: "preparation"
    },
    23: {
      titleTemplate: "✨ 夜の最後",
      bodyTemplate: "{cardName} - 眠りにつく前の最後のタロットの贈り物：{meaning}",
      mood: "serene",
      energy: "rest"
    }
  }
};

/**
 * 시간대별 알림 메시지 생성 함수
 */
export function generateHourlyNotificationMessage(
  hour: number,
  cardName: string,
  cardMeaning: string,
  language: string = 'ko'
): { title: string; body: string } {
  const messages = HOURLY_NOTIFICATION_MESSAGES[language] || HOURLY_NOTIFICATION_MESSAGES.ko;
  const template = messages[hour];

  if (!template) {
    // 기본 메시지 (만약 시간이 범위를 벗어나는 경우)
    return {
      title: language === 'en' ? `🔮 ${hour}:00 Tarot Card` :
             language === 'ja' ? `🔮 ${hour}時のタロットカード` :
             `🔮 ${hour}시 타로 카드`,
      body: `${cardName} - ${cardMeaning}`
    };
  }

  // 템플릿 변수 치환
  const title = template.titleTemplate;
  const body = template.bodyTemplate
    .replace('{cardName}', cardName)
    .replace('{meaning}', cardMeaning);

  return { title, body };
}

/**
 * 특별한 시간대 체크 (예: 자정, 정오 등)
 */
export function getSpecialTimeMessage(hour: number, language: string = 'ko'): string | null {
  const specialTimes: { [key: number]: { [lang: string]: string } } = {
    0: {
      ko: "새로운 하루의 시작을 축복합니다 🌙",
      en: "Blessing the start of a new day 🌙",
      ja: "新しい一日の始まりを祝福します 🌙"
    },
    6: {
      ko: "상쾌한 아침입니다 ☀️",
      en: "A refreshing morning ☀️",
      ja: "爽やかな朝です ☀️"
    },
    12: {
      ko: "하루의 중심점에 도달했습니다 🌅",
      en: "You've reached the center of the day 🌅",
      ja: "一日の中心点に到達しました 🌅"
    },
    18: {
      ko: "평화로운 저녁 시간입니다 🌆",
      en: "It's a peaceful evening 🌆",
      ja: "平和な夕方の時間です 🌆"
    },
    21: {
      ko: "하루를 돌아보는 시간입니다 📚",
      en: "Time to reflect on the day 📚",
      ja: "一日を振り返る時間です 📚"
    }
  };

  return specialTimes[hour]?.[language] || null;
}