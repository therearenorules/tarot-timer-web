// 🔊 사운드 이펙트 및 햅틱 피드백 시스템

// React Native에서 사운드와 햅틱을 처리하는 유틸리티
// 웹 환경과 네이티브 환경을 모두 지원

let Haptics: any = null;
let Audio: any = null;

// 플랫폼별 라이브러리 동적 로드 (웹 환경에서는 사용하지 않음)
if (typeof window === 'undefined') {
  try {
    // React Native 환경에서만 로드 시도
    Haptics = require('expo-haptics');
    Audio = require('expo-av');
  } catch (error) {
    console.log('Native modules not available, using web fallbacks');
  }
} else {
  // 웹 환경 - 웹 API 사용
  console.log('Web environment detected - using web fallbacks');
}

// 사운드 타입 정의
export type SoundType = 
  | 'cardFlip'
  | 'cardDraw' 
  | 'cardSelect'
  | 'cardShuffle'
  | 'mysticalChime'
  | 'softBell'
  | 'magicSparkle'
  | 'timerTick'
  | 'notification'
  | 'success'
  | 'error';

// 햅틱 타입 정의
export type HapticType = 
  | 'light'
  | 'medium' 
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

// 웹 오디오 컨텍스트를 활용한 사운드 생성
class WebAudioSynth {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.3;
  
  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  private async ensureAudioContext() {
    if (!this.audioContext) return false;
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.log('Could not resume audio context:', error);
        return false;
      }
    }
    return true;
  }
  
  // 기본 톤 생성
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise(async (resolve) => {
      if (!await this.ensureAudioContext() || !this.audioContext) {
        resolve();
        return;
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      // 볼륨 엔벨로프 (부드러운 페이드인/아웃)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
      oscillator.onended = () => resolve();
    });
  }
  
  // 코드 생성 (여러 주파수 동시 재생)
  private createChord(frequencies: number[], duration: number): Promise<void> {
    const promises = frequencies.map(freq => this.createTone(freq, duration));
    return Promise.all(promises).then(() => {});
  }
  
  // 카드 뒤집기 사운드 (스위시 + 클릭)
  async playCardFlip() {
    if (!await this.ensureAudioContext()) return;
    
    // 높은 주파수 스위프로 "스위시" 효과
    await this.createTone(800, 0.1, 'triangle');
    // 낮은 톤으로 "착" 소리
    await this.createTone(200, 0.15, 'square');
  }
  
  // 카드 뽑기 사운드 (미스틱한 벨소리)
  async playCardDraw() {
    if (!await this.ensureAudioContext()) return;
    
    // 미스틱한 코드 (C major + 5th)
    await this.createChord([523.25, 659.25, 783.99], 0.8);
  }
  
  // 카드 선택 사운드 (부드러운 클릭)
  async playCardSelect() {
    if (!await this.ensureAudioContext()) return;
    
    await this.createTone(440, 0.1, 'sine');
    await this.createTone(550, 0.1, 'sine');
  }
  
  // 카드 셔플 사운드 (연속적인 스위시)
  async playCardShuffle() {
    if (!await this.ensureAudioContext()) return;
    
    const shuffleSounds = [600, 650, 700, 750, 800];
    for (let i = 0; i < shuffleSounds.length; i++) {
      setTimeout(() => {
        this.createTone(shuffleSounds[i], 0.08, 'triangle');
      }, i * 50);
    }
  }
  
  // 미스틱한 차임 (신비로운 효과음)
  async playMysticalChime() {
    if (!await this.ensureAudioContext()) return;
    
    // 펜타토닉 스케일로 신비로운 멜로디
    const notes = [523.25, 587.33, 659.25, 739.99, 830.61]; // C, D, E, F#, G#
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        this.createTone(notes[i], 0.3, 'triangle');
      }, i * 100);
    }
  }
  
  // 부드러운 벨소리
  async playSoftBell() {
    if (!await this.ensureAudioContext()) return;
    
    await this.createTone(880, 0.5, 'triangle');
  }
  
  // 마법 반짝임 효과음
  async playMagicSparkle() {
    if (!await this.ensureAudioContext()) return;
    
    // 빠른 상승 글리산도
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 주파수를 빠르게 상승
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }
  
  // 타이머 틱 소리
  async playTimerTick() {
    if (!await this.ensureAudioContext()) return;
    
    await this.createTone(800, 0.05, 'square');
  }
  
  // 알림음
  async playNotification() {
    if (!await this.ensureAudioContext()) return;
    
    await this.createTone(659.25, 0.2, 'sine'); // E
    setTimeout(() => this.createTone(523.25, 0.3, 'sine'), 150); // C
  }
  
  // 성공음
  async playSuccess() {
    if (!await this.ensureAudioContext()) return;
    
    await this.createChord([523.25, 659.25, 783.99], 0.5); // C major chord
  }
  
  // 에러음
  async playError() {
    if (!await this.ensureAudioContext()) return;
    
    await this.createTone(220, 0.3, 'square');
    setTimeout(() => this.createTone(196, 0.4, 'square'), 200);
  }
  
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
}

// 웹 햅틱 피드백 (진동 API 사용)
class WebHaptics {
  private isSupported: boolean = false;
  
  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'vibrate' in navigator;
  }
  
  light() {
    if (this.isSupported) {
      navigator.vibrate(10);
    }
  }
  
  medium() {
    if (this.isSupported) {
      navigator.vibrate(25);
    }
  }
  
  heavy() {
    if (this.isSupported) {
      navigator.vibrate([50, 10, 50]);
    }
  }
  
  selection() {
    if (this.isSupported) {
      navigator.vibrate(15);
    }
  }
  
  success() {
    if (this.isSupported) {
      navigator.vibrate([30, 10, 30]);
    }
  }
  
  warning() {
    if (this.isSupported) {
      navigator.vibrate([40, 20, 40, 20, 40]);
    }
  }
  
  error() {
    if (this.isSupported) {
      navigator.vibrate([100, 30, 100]);
    }
  }
}

// 사운드 매니저 클래스
class SoundManager {
  private webAudio: WebAudioSynth;
  private webHaptics: WebHaptics;
  private soundEnabled: boolean = true;
  private hapticEnabled: boolean = true;
  
  constructor() {
    this.webAudio = new WebAudioSynth();
    this.webHaptics = new WebHaptics();
  }
  
  async playSound(soundType: SoundType) {
    if (!this.soundEnabled) return;
    
    try {
      switch (soundType) {
        case 'cardFlip':
          await this.webAudio.playCardFlip();
          break;
        case 'cardDraw':
          await this.webAudio.playCardDraw();
          break;
        case 'cardSelect':
          await this.webAudio.playCardSelect();
          break;
        case 'cardShuffle':
          await this.webAudio.playCardShuffle();
          break;
        case 'mysticalChime':
          await this.webAudio.playMysticalChime();
          break;
        case 'softBell':
          await this.webAudio.playSoftBell();
          break;
        case 'magicSparkle':
          await this.webAudio.playMagicSparkle();
          break;
        case 'timerTick':
          await this.webAudio.playTimerTick();
          break;
        case 'notification':
          await this.webAudio.playNotification();
          break;
        case 'success':
          await this.webAudio.playSuccess();
          break;
        case 'error':
          await this.webAudio.playError();
          break;
      }
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }
  
  triggerHaptic(hapticType: HapticType) {
    if (!this.hapticEnabled) return;
    
    try {
      if (Haptics) {
        // React Native 환경에서 Expo Haptics 사용
        switch (hapticType) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'selection':
            Haptics.selectionAsync();
            break;
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } else {
        // 웹 환경에서 웹 햅틱 사용
        switch (hapticType) {
          case 'light':
            this.webHaptics.light();
            break;
          case 'medium':
            this.webHaptics.medium();
            break;
          case 'heavy':
            this.webHaptics.heavy();
            break;
          case 'selection':
            this.webHaptics.selection();
            break;
          case 'success':
            this.webHaptics.success();
            break;
          case 'warning':
            this.webHaptics.warning();
            break;
          case 'error':
            this.webHaptics.error();
            break;
        }
      }
    } catch (error) {
      console.log('Haptic feedback failed:', error);
    }
  }
  
  // 조합 효과: 사운드 + 햅틱
  async playFeedback(soundType: SoundType, hapticType: HapticType) {
    await Promise.all([
      this.playSound(soundType),
      this.triggerHaptic(hapticType),
    ]);
  }
  
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }
  
  setHapticEnabled(enabled: boolean) {
    this.hapticEnabled = enabled;
  }
  
  setVolume(volume: number) {
    this.webAudio.setVolume(volume);
  }
  
  // 사용자 상호작용 후 오디오 컨텍스트 활성화
  async initializeAudio() {
    try {
      await this.webAudio.playCardSelect(); // 무음으로 컨텍스트 활성화
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }
}

// 싱글톤 인스턴스
export const soundManager = new SoundManager();

// 편의 함수들
export const playSound = (soundType: SoundType) => soundManager.playSound(soundType);
export const triggerHaptic = (hapticType: HapticType) => soundManager.triggerHaptic(hapticType);
export const playFeedback = (soundType: SoundType, hapticType: HapticType) => 
  soundManager.playFeedback(soundType, hapticType);

// 타로 카드 전용 피드백 함수들
export const TarotFeedback = {
  cardFlip: () => playFeedback('cardFlip', 'light'),
  cardDraw: () => playFeedback('cardDraw', 'medium'),
  cardSelect: () => playFeedback('cardSelect', 'selection'),
  cardShuffle: () => playFeedback('cardShuffle', 'light'),
  mysticalMoment: () => playFeedback('mysticalChime', 'heavy'),
  magicSparkle: () => playFeedback('magicSparkle', 'light'),
  success: () => playFeedback('success', 'success'),
  error: () => playFeedback('error', 'error'),
  timerTick: () => playSound('timerTick'), // 햅틱 없이 사운드만
};

export default soundManager;