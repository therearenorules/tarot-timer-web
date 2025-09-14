// useAnalytics.ts - Analytics hook for user behavior tracking
// Integrates with performance monitoring and provides detailed user insights

import { useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

// Analytics event types
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: number;
  properties?: Record<string, any>;
}

// User session data
interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  interactions: number;
  timeSpent: number;
  deviceInfo: {
    platform: string;
    userAgent?: string;
    screenSize?: { width: number; height: number };
    deviceType: 'mobile' | 'tablet' | 'desktop';
  };
  appInfo: {
    version: string;
    buildNumber?: string;
    installType: 'web' | 'pwa' | 'native';
  };
}

// A/B Test configuration
interface ABTest {
  id: string;
  name: string;
  variants: string[];
  userVariant?: string;
  isActive: boolean;
  conversionGoal?: string;
}

// Analytics configuration
interface AnalyticsConfig {
  enableTracking: boolean;
  enableABTesting: boolean;
  enableHeatmap: boolean;
  enableErrorTracking: boolean;
  apiEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  trackingId?: string;
}

export function useAnalytics(config: Partial<AnalyticsConfig> = {}) {
  const sessionRef = useRef<UserSession | null>(null);
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef(false);

  const defaultConfig: AnalyticsConfig = {
    enableTracking: true,
    enableABTesting: true,
    enableHeatmap: false,
    enableErrorTracking: true,
    apiEndpoint: '/api/analytics',
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    ...config
  };

  // Initialize session
  const initializeSession = useCallback(() => {
    if (!defaultConfig.enableTracking) return;

    const sessionId = generateSessionId();
    const now = Date.now();

    const session: UserSession = {
      sessionId,
      userId: getStoredUserId(),
      startTime: now,
      lastActivity: now,
      pageViews: 0,
      interactions: 0,
      timeSpent: 0,
      deviceInfo: {
        platform: Platform.OS,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        screenSize: getScreenSize(),
        deviceType: getDeviceType()
      },
      appInfo: {
        version: '1.0.0', // This should come from your app config
        installType: getInstallType()
      }
    };

    sessionRef.current = session;
    isTrackingRef.current = true;

    console.log('[Analytics] Session initialized:', sessionId);

    // Track session start
    track('session_start', 'system', 'session', 'started', undefined, {
      isNewUser: !session.userId,
      deviceType: session.deviceInfo.deviceType,
      platform: session.deviceInfo.platform
    });
  }, [defaultConfig.enableTracking]);

  // Generate unique session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get stored user ID or generate new one
  const getStoredUserId = (): string | undefined => {
    if (typeof localStorage === 'undefined') return undefined;

    let userId = localStorage.getItem('tarot_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tarot_user_id', userId);
    }
    return userId;
  };

  // Get screen size
  const getScreenSize = () => {
    if (typeof window === 'undefined') return undefined;
    return {
      width: window.screen.width,
      height: window.screen.height
    };
  };

  // Determine device type
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Get installation type
  const getInstallType = (): 'web' | 'pwa' | 'native' => {
    if (Platform.OS !== 'web') return 'native';

    if (typeof window === 'undefined') return 'web';

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebAppiOS) return 'pwa';
    return 'web';
  };

  // Main tracking function
  const track = useCallback((
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    if (!isTrackingRef.current || !sessionRef.current) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      userId: sessionRef.current.userId,
      sessionId: sessionRef.current.sessionId,
      timestamp: Date.now(),
      properties: {
        platform: Platform.OS,
        deviceType: sessionRef.current.deviceInfo.deviceType,
        ...properties
      }
    };

    eventQueueRef.current.push(analyticsEvent);
    updateSessionActivity();

    console.log('[Analytics] Event tracked:', event, category, action);

    // Flush if batch size reached
    if (eventQueueRef.current.length >= defaultConfig.batchSize) {
      flushEvents();
    }
  }, [defaultConfig.batchSize]);

  // Update session activity
  const updateSessionActivity = useCallback(() => {
    if (!sessionRef.current) return;

    const now = Date.now();
    sessionRef.current.lastActivity = now;
    sessionRef.current.timeSpent = now - sessionRef.current.startTime;
    sessionRef.current.interactions++;
  }, []);

  // Flush events to server
  const flushEvents = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      if (defaultConfig.apiEndpoint && typeof fetch !== 'undefined') {
        await fetch(defaultConfig.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            events,
            session: sessionRef.current
          })
        });

        console.log(`[Analytics] Flushed ${events.length} events to server`);
      } else {
        // Store locally if no endpoint available
        console.log('[Analytics] Storing events locally:', events);
      }
    } catch (error) {
      console.error('[Analytics] Failed to flush events:', error);
      // Put events back in queue for retry
      eventQueueRef.current.unshift(...events);
    }
  }, [defaultConfig.apiEndpoint]);

  // Specific tracking methods
  const trackPageView = useCallback((pageName: string, properties?: Record<string, any>) => {
    if (!sessionRef.current) return;

    sessionRef.current.pageViews++;
    track('page_view', 'navigation', 'view', pageName, undefined, {
      pageCount: sessionRef.current.pageViews,
      ...properties
    });
  }, [track]);

  const trackUserAction = useCallback((
    action: string,
    target: string,
    properties?: Record<string, any>
  ) => {
    track('user_action', 'interaction', action, target, undefined, properties);
  }, [track]);

  const trackTimerEvent = useCallback((
    action: 'start' | 'pause' | 'resume' | 'complete' | 'cancel',
    duration?: number,
    properties?: Record<string, any>
  ) => {
    track('timer_event', 'timer', action, undefined, duration, {
      timerType: 'tarot_session',
      ...properties
    });
  }, [track]);

  const trackCardDraw = useCallback((
    spreadType: string,
    cardPosition?: string,
    properties?: Record<string, any>
  ) => {
    track('card_draw', 'tarot', 'draw', spreadType, undefined, {
      cardPosition,
      ...properties
    });
  }, [track]);

  const trackJournalEntry = useCallback((
    action: 'create' | 'edit' | 'delete' | 'view',
    wordCount?: number,
    properties?: Record<string, any>
  ) => {
    track('journal_entry', 'journal', action, undefined, wordCount, properties);
  }, [track]);

  const trackError = useCallback((
    error: string,
    context?: string,
    properties?: Record<string, any>
  ) => {
    if (!defaultConfig.enableErrorTracking) return;

    track('error', 'system', 'error', context, undefined, {
      errorMessage: error,
      stackTrace: properties?.stack,
      ...properties
    });
  }, [track, defaultConfig.enableErrorTracking]);

  const trackPerformance = useCallback((
    metric: string,
    value: number,
    properties?: Record<string, any>
  ) => {
    track('performance', 'system', 'metric', metric, value, properties);
  }, [track]);

  // A/B Testing functionality
  const getABTestVariant = useCallback((testId: string, variants: string[]): string => {
    if (!defaultConfig.enableABTesting || !sessionRef.current?.userId) {
      return variants[0]; // Default to first variant
    }

    // Simple hash-based variant assignment
    const userId = sessionRef.current.userId;
    const hash = simpleHash(userId + testId);
    const variantIndex = hash % variants.length;
    const selectedVariant = variants[variantIndex];

    // Track A/B test assignment
    track('ab_test_assignment', 'experiment', 'assigned', testId, undefined, {
      variant: selectedVariant,
      availableVariants: variants
    });

    return selectedVariant;
  }, [track, defaultConfig.enableABTesting]);

  const trackABTestConversion = useCallback((testId: string, goal: string) => {
    track('ab_test_conversion', 'experiment', 'converted', testId, undefined, {
      conversionGoal: goal
    });
  }, [track]);

  // User identification
  const identifyUser = useCallback((userId: string, properties?: Record<string, any>) => {
    if (!sessionRef.current) return;

    sessionRef.current.userId = userId;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tarot_user_id', userId);
    }

    track('user_identified', 'user', 'identify', userId, undefined, properties);
  }, [track]);

  // Session management
  const endSession = useCallback(() => {
    if (!sessionRef.current) return;

    const session = sessionRef.current;
    const sessionDuration = Date.now() - session.startTime;

    track('session_end', 'system', 'session', 'ended', sessionDuration, {
      pageViews: session.pageViews,
      interactions: session.interactions,
      timeSpent: session.timeSpent,
      endReason: 'manual'
    });

    // Flush any remaining events
    flushEvents();

    sessionRef.current = null;
    isTrackingRef.current = false;
  }, [track, flushEvents]);

  // Setup periodic flushing
  useEffect(() => {
    if (!defaultConfig.enableTracking) return;

    flushTimerRef.current = setInterval(() => {
      flushEvents();
    }, defaultConfig.flushInterval);

    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
    };
  }, [flushEvents, defaultConfig.enableTracking, defaultConfig.flushInterval]);

  // Initialize on mount
  useEffect(() => {
    initializeSession();

    // Handle app visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endSession();
      } else {
        initializeSession();
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }

      endSession();
    };
  }, [initializeSession, endSession]);

  return {
    // Session info
    session: sessionRef.current,
    isTracking: isTrackingRef.current,

    // Core tracking methods
    track,
    trackPageView,
    trackUserAction,

    // Specific event tracking
    trackTimerEvent,
    trackCardDraw,
    trackJournalEntry,
    trackError,
    trackPerformance,

    // A/B Testing
    getABTestVariant,
    trackABTestConversion,

    // User management
    identifyUser,

    // Session management
    endSession,
    flushEvents,

    // Utilities
    config: defaultConfig
  };
}

// Utility functions
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default useAnalytics;