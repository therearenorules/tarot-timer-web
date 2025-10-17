/**
 * Expo Go 광고 Mock 이벤트 시스템
 * AdManager와 MockAdOverlay 간 통신
 */

import { EventEmitter } from 'events';

export interface MockAdEvent {
  type: 'interstitial' | 'rewarded';
  placement: string;
}

export interface MockAdResult {
  completed: boolean;
}

class AdMockEventEmitter extends EventEmitter {
  private pendingAd: {
    resolve: (result: MockAdResult) => void;
    reject: (error: Error) => void;
  } | null = null;

  /**
   * 광고 표시 요청
   */
  async showMockAd(event: MockAdEvent): Promise<MockAdResult> {
    return new Promise((resolve, reject) => {
      this.pendingAd = { resolve, reject };
      this.emit('showAd', event);

      // 10초 타임아웃
      setTimeout(() => {
        if (this.pendingAd) {
          this.pendingAd = null;
          reject(new Error('Ad timeout'));
        }
      }, 10000);
    });
  }

  /**
   * 광고 닫힘 처리
   */
  onAdClosed(completed: boolean) {
    if (this.pendingAd) {
      this.pendingAd.resolve({ completed });
      this.pendingAd = null;
    }
  }
}

export const adMockEmitter = new AdMockEventEmitter();
