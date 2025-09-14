// i18n/index.ts - Internationalization configuration
// Supports Korean, English, Japanese, Chinese, and Spanish

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { Platform } from 'react-native';

// Import translation resources
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';
import es from './locales/es.json';

// Fallback resources for React Native
const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  zh: { translation: zh },
  es: { translation: es }
};

// Language configuration
const LANGUAGES = {
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
    nativeName: '日本語',
    flag: '🇯🇵',
    code: 'ja'
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    code: 'zh'
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    code: 'es'
  }
};

// Initialize i18next
const initI18n = async () => {
  const i18nInstance = i18n.createInstance();

  // Different configuration for web vs native
  if (Platform.OS === 'web') {
    // Web configuration with HTTP backend
    await i18nInstance
      .use(Backend)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        lng: 'ko', // Default language
        fallbackLng: 'ko',

        debug: __DEV__,

        // Language detection options
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
          caches: ['localStorage'],
          excludeCacheFor: ['cimode']
        },

        // Backend configuration
        backend: {
          loadPath: '/i18n/locales/{{lng}}.json',
          requestOptions: {
            cache: 'default'
          }
        },

        // Interpolation options
        interpolation: {
          escapeValue: false // React already escapes values
        },

        // Translation options
        returnNull: false,
        returnEmptyString: false,
        returnObjects: true,

        // Namespace configuration
        ns: ['translation'],
        defaultNS: 'translation',

        // React options
        react: {
          useSuspense: true,
          bindI18n: 'languageChanged',
          bindI18nStore: '',
          transEmptyNodeValue: '',
          transSupportBasicHtmlNodes: true,
          transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em']
        },

        // Performance optimizations
        initImmediate: false,
        load: 'languageOnly',
        preload: ['ko', 'en', 'ja', 'zh', 'es'],

        // Error handling
        missingKeyHandler: (lng, ns, key, fallbackValue) => {
          if (__DEV__) {
            console.warn(`Missing translation key: ${key} for language: ${lng}`);
          }
        }
      });
  } else {
    // React Native configuration with bundled resources
    await i18nInstance
      .use(initReactI18next)
      .init({
        lng: 'ko',
        fallbackLng: 'ko',

        debug: __DEV__,

        resources,

        interpolation: {
          escapeValue: false
        },

        returnNull: false,
        returnEmptyString: false,
        returnObjects: true,

        ns: ['translation'],
        defaultNS: 'translation',

        react: {
          useSuspense: false // Disable suspense for React Native
        }
      });
  }

  return i18nInstance;
};

// Initialize i18n
initI18n().catch(error => {
  console.error('i18n initialization failed:', error);
});

// Language utilities
export const LanguageUtils = {
  // Get available languages
  getAvailableLanguages: () => LANGUAGES,

  // Get current language info
  getCurrentLanguageInfo: () => {
    const currentLang = i18n.language || 'ko';
    const langCode = currentLang.split('-')[0]; // Handle cases like 'en-US'
    return LANGUAGES[langCode as keyof typeof LANGUAGES] || LANGUAGES.ko;
  },

  // Change language
  changeLanguage: async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);

      // Store in local storage for web
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem('i18nextLng', languageCode);
      }

      console.log(`Language changed to: ${languageCode}`);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  },

  // Get language direction (for RTL languages if needed)
  getLanguageDirection: (langCode?: string): 'ltr' | 'rtl' => {
    const lang = langCode || i18n.language || 'ko';
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(lang.split('-')[0]) ? 'rtl' : 'ltr';
  },

  // Format currency based on language
  formatCurrency: (amount: number, currency: string = 'KRW') => {
    const lang = i18n.language || 'ko';

    try {
      return new Intl.NumberFormat(lang, {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  },

  // Format date based on language
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const lang = i18n.language || 'ko';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    try {
      return new Intl.DateTimeFormat(lang, { ...defaultOptions, ...options }).format(date);
    } catch (error) {
      return date.toLocaleDateString();
    }
  },

  // Format relative time
  formatRelativeTime: (date: Date) => {
    const lang = i18n.language || 'ko';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    try {
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
      } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
      } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
      } else {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
      }
    } catch (error) {
      // Fallback for unsupported browsers
      if (diffInSeconds < 60) return i18n.t('common.justNow');
      if (diffInSeconds < 3600) return i18n.t('common.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
      if (diffInSeconds < 86400) return i18n.t('common.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
      return i18n.t('common.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
    }
  },

  // Pluralization helper
  getPlural: (count: number, key: string, options?: any) => {
    return i18n.t(key, { count, ...options });
  },

  // Get browser language
  getBrowserLanguage: (): string => {
    if (typeof navigator === 'undefined') return 'ko';

    const language = navigator.language || (navigator as any).userLanguage;
    const langCode = language ? language.split('-')[0] : 'ko';

    // Return supported language or fallback to Korean
    return Object.keys(LANGUAGES).includes(langCode) ? langCode : 'ko';
  },

  // Check if language is supported
  isLanguageSupported: (langCode: string): boolean => {
    return Object.keys(LANGUAGES).includes(langCode);
  }
};

// Export configured i18n instance
export { LANGUAGES };
export default i18n;