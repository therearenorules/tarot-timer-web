// i18n/index.ts - Internationalization configuration
// Supports Korean, English, and Japanese

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation resources
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';

// Language configuration
export const LANGUAGES = {
  ko: {
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
    code: 'ko'
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    code: 'en'
  },
  ja: {
    name: 'Japanese',
    nativeName: '日語',
    flag: '🇯🇵',
    code: 'ja'
  }
};

// iOS/Android용 AsyncStorage 기반 언어 감지기
const asyncStorageLanguageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // iOS/Android: AsyncStorage에서 저장된 언어 확인
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const savedLanguage = await AsyncStorage.getItem('i18nextLng');
        console.log(`📱 AsyncStorage 언어 감지: ${savedLanguage}`);

        if (savedLanguage && ['ko', 'en', 'ja'].includes(savedLanguage)) {
          callback(savedLanguage);
          return;
        }
        // 저장된 언어가 없으면 한국어 기본값
        console.log('📱 저장된 언어 없음, 한국어 기본값 사용');
        callback('ko');
        return;
      }

      // 웹: localStorage 확인
      if (typeof localStorage !== 'undefined') {
        const savedLanguage = localStorage.getItem('i18nextLng');
        console.log(`🌐 localStorage 언어 감지: ${savedLanguage}`);

        if (savedLanguage && ['ko', 'en', 'ja'].includes(savedLanguage)) {
          callback(savedLanguage);
          return;
        }
      }

      // 기본값: 한국어
      callback('ko');
    } catch (error) {
      console.error('언어 감지 오류:', error);
      callback('ko');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await AsyncStorage.setItem('i18nextLng', lng);
        console.log(`📱 언어 캐시 저장 (AsyncStorage): ${lng}`);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem('i18nextLng', lng);
        console.log(`🌐 언어 캐시 저장 (localStorage): ${lng}`);
      }
    } catch (error) {
      console.error('언어 캐시 저장 오류:', error);
    }
  }
};

// Initialize i18next
// iOS/Android에서는 커스텀 감지기 사용, 웹에서는 브라우저 감지기 사용
const initI18n = async () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // 모바일: AsyncStorage 기반 커스텀 감지기
    await i18n
      .use(asyncStorageLanguageDetector)
      .use(initReactI18next)
      .init({
        fallbackLng: 'ko',
        debug: false,

        resources: {
          ko: { translation: ko },
          en: { translation: en },
          ja: { translation: ja }
        },

        interpolation: {
          escapeValue: false
        },

        react: {
          useSuspense: false
        }
      });

    console.log(`✅ i18n 초기화 완료 (모바일): ${i18n.language}`);
  } else {
    // 웹: 브라우저 감지기 사용
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: 'ko',
        fallbackLng: 'ko',
        debug: false,

        resources: {
          ko: { translation: ko },
          en: { translation: en },
          ja: { translation: ja }
        },

        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage']
        },

        interpolation: {
          escapeValue: false
        },

        react: {
          useSuspense: false
        }
      });

    console.log(`✅ i18n 초기화 완료 (웹): ${i18n.language}`);
  }
};

// 초기화 실행
initI18n().catch(error => {
  console.error('i18n 초기화 실패:', error);
});

// Language utilities
export const LanguageUtils = {
  getAvailableLanguages: () => LANGUAGES,

  getCurrentLanguageInfo: () => {
    const currentLang = i18n.language || 'ko';
    const langCode = currentLang.split('-')[0];
    return LANGUAGES[langCode as keyof typeof LANGUAGES] || LANGUAGES.ko;
  },

  changeLanguage: async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);

      // React Native 환경: AsyncStorage 사용
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await AsyncStorage.setItem('i18nextLng', languageCode);
        console.log(`✅ 언어 저장 (AsyncStorage): ${languageCode}`);
      }
      // 웹 환경: localStorage 사용
      else if (typeof localStorage !== 'undefined') {
        localStorage.setItem('i18nextLng', languageCode);
        console.log(`✅ 언어 저장 (localStorage): ${languageCode}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  },

  // Get current language locale for date formatting
  getCurrentLocale: () => {
    const currentLang = i18n.language || 'ko';
    const langCode = currentLang.split('-')[0];

    // Map language codes to locale strings
    const localeMap: Record<string, string> = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP'
    };

    return localeMap[langCode] || 'ko-KR';
  },

  // Format date according to current language
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = LanguageUtils.getCurrentLocale();
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };

    return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
  },

  // Format date and time according to current language
  formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = LanguageUtils.getCurrentLocale();
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
  }
};

export default i18n;