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
        journal: '저널',
        settings: '설정',
      },

      // 타이머
      timer: {
        title: '🔮 타로 타이머',
        subtitle: '24시간 신비로운 여정',
        currentCard: '현재 카드',
        nextCard: '다음 카드',
        timeLeft: '남은 시간',
        hour: '시',
        minute: '분',
        second: '초',
      },

      // 스프레드
      spread: {
        title: '🌟 타로 스프레드',
        subtitle: '신비로운 카드 레이아웃',
        threeCard: '3카드 스프레드',
        fiveCard: '5카드 스프레드',
        past: '과거',
        present: '현재',
        future: '미래',
        situation: '상황',
        action: '행동',
        outcome: '결과',
      },

      // 저널
      journal: {
        title: '📖 타로 저널',
        subtitle: '신비로운 여정의 기록',
        addEntry: '새 엔트리',
        writeNote: '메모 작성',
        emotion: '감정',
        insights: '통찰',
        noEntries: '아직 저널 엔트리가 없습니다',
      },

      // 설정
      settings: {
        title: '⚙️ 설정',
        subtitle: '개인화된 타로 환경',
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
        journal: 'Journal',
        settings: 'Settings',
      },

      // Timer
      timer: {
        title: '🔮 Tarot Timer',
        subtitle: '24-Hour Mystical Journey',
        currentCard: 'Current Card',
        nextCard: 'Next Card',
        timeLeft: 'Time Left',
        hour: 'Hour',
        minute: 'Minute',
        second: 'Second',
      },

      // Spread
      spread: {
        title: '🌟 Tarot Spreads',
        subtitle: 'Mystical Card Layouts',
        threeCard: '3-Card Spread',
        fiveCard: '5-Card Spread',
        past: 'Past',
        present: 'Present',
        future: 'Future',
        situation: 'Situation',
        action: 'Action',
        outcome: 'Outcome',
      },

      // Journal
      journal: {
        title: '📖 Tarot Journal',
        subtitle: 'Record Your Mystical Journey',
        addEntry: 'Add Entry',
        writeNote: 'Write Note',
        emotion: 'Emotion',
        insights: 'Insights',
        noEntries: 'No journal entries yet',
      },

      // Settings
      settings: {
        title: '⚙️ Settings',
        subtitle: 'Personalized Tarot Environment',
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