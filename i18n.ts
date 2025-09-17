import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 다국어 리소스
const resources = {
  ko: {
    translation: {
      // 공통
      common: {
        loading: '로딩 중...',
        error: '오류가 발생했습니다',
        retry: '다시 시도',
        save: '저장',
        cancel: '취소',
        confirm: '확인',
        delete: '삭제',
        edit: '편집',
        close: '닫기',
        yes: '예',
        no: '아니오',
      },

      // 앱 정보
      app: {
        name: '타로 타이머',
        title: '타로 타이머 - 24시간 신비로운 여정',
        subtitle: '매 시간마다 새로운 타로 카드가 당신을 안내합니다',
      },

      // 네비게이션
      navigation: {
        timer: '타이머',
        spread: '스프레드',
        journal: '다이어리',
        settings: '설정',
      },

      // 타이머
      timer: {
        title: '🔮 타로 타이머',
        subtitle: '24시간 타로 메시지',
        currentCard: '현재 카드',
        nextCard: '다음 카드',
        timeLeft: '남은 시간',
        hour: '시',
        minute: '분',
        second: '초',
        midnight: '자정',
        noon: '정오',
        am: '오전 {{hour}}시',
        pm: '오후 {{hour}}시',
      },

      // 스프레드
      spread: {
        title: '🌟 타로 스프레드',
        subtitle: '카드의 지혜를 탐험하세요',
        threeCard: '3카드 스프레드',
        fiveCard: '5카드 스프레드',
        past: '과거',
        present: '현재',
        future: '미래',
        situation: '상황',
        action: '행동',
        outcome: '결과',
      },

      // 다이어리
      journal: {
        title: '📖 타로 다이어리',
        subtitle: '타로 여정을 기록하세요',
        addEntry: '새 엔트리',
        writeNote: '메모 작성',
        emotion: '감정',
        insights: '통찰',
        noEntries: '아직 다이어리 엔트리가 없습니다',
        tabs: {
          daily: '일일 기록',
          spreads: '스프레드 기록'
        },
        loading: {
          dailyTarot: '일일 타로 로딩 중...'
        },
        empty: {
          dailyTitle: '일일 타로 기록이 없습니다',
          dailyMessage: '24시간 타로 타이머를 사용하여 첫 번째 기록을 만들어보세요',
          spreadTitle: '스프레드 기록이 없습니다',
          spreadMessage: '타로 스프레드를 진행하여 기록을 남겨보세요'
        },
        sections: {
          dailyReadings: '일일 타로 기록',
          spreadReadings: '타로 스프레드 기록'
        },
        labels: {
          dailyTarotReading: '24시간 타로 읽기'
        },
        status: {
          completed: '완료됨'
        },
        moreCards: '외 {{count}}장',
        memoCount: '메모 {{count}}개',
        recordCount: '{{count}}개 기록',
        cardsCast: '{{count}}장 뽑음',
        dailyTarotTitle: '일일 타로 여정',
        entry: {
          memo: '메모'
        },
        memoPlaceholder: '이 시간에 대한 메모를 작성하세요...',
        saveMemo: '메모 저장',
        memoSaved: '메모 저장됨',
        memoSavedMessage: '{{hour}}시 메모가 저장되었습니다',
        insightsTitle: '인사이트',
        createdDate: '생성일'
      },

      // 설정
      settings: {
        title: '⚙️ 설정',
        subtitle: '앱을 개인화하세요',
        general: '일반',
        notifications: {
          title: '알림',
          enable: '알림 활성화',
          quietHours: '무음 시간',
          saveComplete: '저장 완료',
          quietHoursSaved: '무음 시간이 저장되었습니다',
          saveError: '저장 중 오류가 발생했습니다',
        },
        premium: {
          title: '프리미엄',
          upgrade: '프리미엄으로 업그레이드',
          benefits: '프리미엄 혜택',
          unlimited: '무제한 저장',
          noAds: '광고 제거',
          themes: '프리미엄 테마',
          backup: '클라우드 백업',
        },
        language: '언어',
        theme: '테마',
        about: '정보',
      },

      // 오류
      errors: {
        retry: '다시 시도',
        loadingFailed: '로딩에 실패했습니다',
        networkError: '네트워크 오류',
        unknownError: '알 수 없는 오류',
      },

      // PWA
      pwa: {
        offline: '오프라인',
        install: '앱 설치',
        share: '공유',
      },
    },
  },
  en: {
    translation: {
      // Common
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        yes: 'Yes',
        no: 'No',
      },

      // App info
      app: {
        name: 'Tarot Timer',
        title: 'Tarot Timer - 24 Hour Mystical Journey',
        subtitle: 'A new tarot card guides you every hour',
      },

      // Navigation
      navigation: {
        timer: 'Timer',
        spread: 'Spread',
        journal: 'Daily',
        settings: 'Settings',
      },

      // Timer
      timer: {
        title: '🔮 Tarot Timer',
        subtitle: '24-hour tarot messages',
        currentCard: 'Current Card',
        nextCard: 'Next Card',
        timeLeft: 'Time Left',
        hour: 'Hour',
        minute: 'Minute',
        second: 'Second',
        midnight: 'Midnight',
        noon: 'Noon',
        am: '{{hour}} AM',
        pm: '{{hour}} PM',
      },

      // Spread
      spread: {
        title: '🌟 Tarot Spreads',
        subtitle: 'Explore the wisdom of the cards',
        threeCard: '3-Card Spread',
        fiveCard: '5-Card Spread',
        past: 'Past',
        present: 'Present',
        future: 'Future',
        situation: 'Situation',
        action: 'Action',
        outcome: 'Outcome',
      },

      // Daily
      journal: {
        title: '📖 Tarot Daily',
        subtitle: 'Record your tarot journey',
        addEntry: 'Add Entry',
        writeNote: 'Write Note',
        emotion: 'Emotion',
        insights: 'Insights',
        noEntries: 'No diary entries yet',
        tabs: {
          daily: 'Daily Records',
          spreads: 'Spread Records'
        },
        loading: {
          dailyTarot: 'Loading daily tarot...'
        },
        empty: {
          dailyTitle: 'No daily tarot records',
          dailyMessage: 'Use the 24-hour tarot timer to create your first record',
          spreadTitle: 'No spread records',
          spreadMessage: 'Perform tarot spreads to create records'
        },
        sections: {
          dailyReadings: 'Daily Tarot Records',
          spreadReadings: 'Tarot Spread Records'
        },
        labels: {
          dailyTarotReading: '24-Hour Tarot Reading'
        },
        status: {
          completed: 'Completed'
        },
        moreCards: 'and {{count}} more',
        memoCount: '{{count}} memos',
        recordCount: '{{count}} records',
        cardsCast: '{{count}} cards cast',
        dailyTarotTitle: 'Daily Tarot Journey',
        entry: {
          memo: 'Memo'
        },
        memoPlaceholder: 'Write a memo for this hour...',
        saveMemo: 'Save Memo',
        memoSaved: 'Memo Saved',
        memoSavedMessage: 'Memo for hour {{hour}} has been saved',
        insightsTitle: 'Insights',
        createdDate: 'Created Date'
      },

      // Settings
      settings: {
        title: '⚙️ Settings',
        subtitle: 'Personalize your app',
        general: 'General',
        notifications: {
          title: 'Notifications',
          enable: 'Enable Notifications',
          quietHours: 'Quiet Hours',
          saveComplete: 'Save Complete',
          quietHoursSaved: 'Quiet hours have been saved',
          saveError: 'An error occurred while saving',
        },
        premium: {
          title: 'Premium',
          upgrade: 'Upgrade to Premium',
          benefits: 'Premium Benefits',
          unlimited: 'Unlimited Storage',
          noAds: 'No Ads',
          themes: 'Premium Themes',
          backup: 'Cloud Backup',
        },
        language: 'Language',
        theme: 'Theme',
        about: 'About',
      },

      // Errors
      errors: {
        retry: 'Retry',
        loadingFailed: 'Loading failed',
        networkError: 'Network error',
        unknownError: 'Unknown error',
      },

      // PWA
      pwa: {
        offline: 'Offline',
        install: 'Install App',
        share: 'Share',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ko',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;