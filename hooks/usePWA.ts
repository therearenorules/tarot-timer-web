// usePWA.ts - React hook for PWA functionality
// Manages service worker registration, installation prompts, and offline detection

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isLoading: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  installApp: () => Promise<boolean>;
  updateServiceWorker: () => Promise<void>;
  shareApp: () => Promise<boolean>;
  checkForUpdates: () => Promise<boolean>;
  unregisterServiceWorker: () => Promise<boolean>;
}

interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  prompt(): Promise<void>;
}

interface NavigatorWithShare extends Navigator {
  share?: (data: ShareData) => Promise<void>;
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isLoading: true,
    swRegistration: null,
    installPrompt: null
  });

  // Check if we're running in web environment
  const isWeb = Platform.OS === 'web';

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!isWeb || !('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported');
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }

    try {
      console.log('[PWA] Registering service worker...');

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service Worker registered successfully');

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        console.log('[PWA] Service Worker update found');
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New service worker installed, update available');
              // You can show a notification to the user about the update
            }
          });
        }
      });

      setState(prev => ({
        ...prev,
        swRegistration: registration,
        isLoading: false
      }));

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [isWeb]);

  // Handle install prompt
  const handleInstallPrompt = useCallback((event: Event) => {
    console.log('[PWA] Install prompt triggered');
    event.preventDefault();

    setState(prev => ({
      ...prev,
      isInstallable: true,
      installPrompt: event as BeforeInstallPromptEvent
    }));
  }, []);

  // Handle app installed
  const handleAppInstalled = useCallback(() => {
    console.log('[PWA] App installed');
    setState(prev => ({
      ...prev,
      isInstalled: true,
      isInstallable: false,
      installPrompt: null
    }));
  }, []);

  // Handle online/offline status
  const handleOnline = useCallback(() => {
    console.log('[PWA] App came online');
    setState(prev => ({ ...prev, isOnline: true }));
  }, []);

  const handleOffline = useCallback(() => {
    console.log('[PWA] App went offline');
    setState(prev => ({ ...prev, isOnline: false }));
  }, []);

  // Install app
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!state.installPrompt) {
      console.warn('[PWA] No install prompt available');
      return false;
    }

    try {
      await state.installPrompt.prompt();
      const choice = await state.installPrompt.userChoice;

      console.log('[PWA] Install choice:', choice.outcome);

      if (choice.outcome === 'accepted') {
        setState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [state.installPrompt]);

  // Update service worker
  const updateServiceWorker = useCallback(async (): Promise<void> => {
    if (!state.swRegistration) {
      console.warn('[PWA] No service worker registration available');
      return;
    }

    try {
      console.log('[PWA] Checking for service worker updates...');
      await state.swRegistration.update();
      console.log('[PWA] Service worker update check completed');
    } catch (error) {
      console.error('[PWA] Service worker update failed:', error);
    }
  }, [state.swRegistration]);

  // Share app
  const shareApp = useCallback(async (): Promise<boolean> => {
    if (!isWeb) {
      console.warn('[PWA] Share not available on native platforms');
      return false;
    }

    const shareData = {
      title: '타로 타이머 - Tarot Timer',
      text: '24시간 타로 카드 타이머 및 일지 앱',
      url: window.location.href
    };

    try {
      if ('share' in navigator && (navigator as NavigatorWithShare).share) {
        await (navigator as NavigatorWithShare).share!(shareData);
        console.log('[PWA] App shared successfully');
        return true;
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        console.log('[PWA] URL copied to clipboard');
        return true;
      }
    } catch (error) {
      console.error('[PWA] Share failed:', error);
      return false;
    }
  }, [isWeb]);

  // Check for updates
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!state.swRegistration) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();

        // Check if there's a waiting service worker
        if (registration.waiting) {
          console.log('[PWA] Update available');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
      return false;
    }
  }, [state.swRegistration]);

  // Unregister service worker
  const unregisterServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!isWeb || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const result = await registration.unregister();
        console.log('[PWA] Service worker unregistered:', result);
        setState(prev => ({ ...prev, swRegistration: null }));
        return result;
      }
      return true;
    } catch (error) {
      console.error('[PWA] Service worker unregistration failed:', error);
      return false;
    }
  }, [isWeb]);

  // Check if app is running as PWA
  const checkIfPWA = useCallback(() => {
    if (!isWeb) return false;

    // Check various PWA indicators
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInWebAppChrome = window.matchMedia('(display-mode: minimal-ui)').matches;

    const isPWA = isStandalone || isInWebAppiOS || isInWebAppChrome;

    setState(prev => ({ ...prev, isInstalled: isPWA }));
    return isPWA;
  }, [isWeb]);

  // Initialize PWA functionality
  useEffect(() => {
    if (!isWeb) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Register service worker
    registerServiceWorker();

    // Check if already installed as PWA
    checkIfPWA();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isWeb, registerServiceWorker, handleInstallPrompt, handleAppInstalled, handleOnline, handleOffline, checkIfPWA]);

  // Auto-check for updates on app focus
  useEffect(() => {
    if (!isWeb || !state.swRegistration) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    const handleFocus = () => {
      checkForUpdates();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isWeb, state.swRegistration, checkForUpdates]);

  return {
    ...state,
    installApp,
    updateServiceWorker,
    shareApp,
    checkForUpdates,
    unregisterServiceWorker
  };
}

// PWA utilities
export const PWAUtils = {
  // Check if device supports PWA features
  isPWASupported: (): boolean => {
    return typeof window !== 'undefined' &&
           'serviceWorker' in navigator &&
           'PushManager' in window;
  },

  // Check if app is running in PWA mode
  isPWAMode: (): boolean => {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           window.matchMedia('(display-mode: minimal-ui)').matches;
  },

  // Get PWA installation readiness score
  getPWAScore: (): { score: number; issues: string[] } => {
    const issues: string[] = [];
    let score = 100;

    if (typeof window === 'undefined') {
      return { score: 0, issues: ['Not running in browser environment'] };
    }

    // Check service worker support
    if (!('serviceWorker' in navigator)) {
      issues.push('Service Worker not supported');
      score -= 30;
    }

    // Check manifest
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      issues.push('Web App Manifest not found');
      score -= 20;
    }

    // Check HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      issues.push('HTTPS required for PWA');
      score -= 25;
    }

    // Check icons
    const icons = document.querySelectorAll('link[rel*="icon"]');
    if (icons.length === 0) {
      issues.push('App icons not found');
      score -= 15;
    }

    // Check offline support
    if (!navigator.onLine) {
      // This is actually a good thing for PWA testing
      score += 10;
    }

    return { score: Math.max(0, score), issues };
  }
};

export default usePWA;