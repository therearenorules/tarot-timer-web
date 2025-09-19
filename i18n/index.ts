// i18n/index.ts - Internationalization configuration
// Supports Korean, English, and Japanese

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Platform } from 'react-native';

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

// Initialize i18next
i18n
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('i18nextLng', languageCode);
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