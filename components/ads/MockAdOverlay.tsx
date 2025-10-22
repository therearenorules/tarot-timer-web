/**
 * Expo Go 전용 광고 Mock 오버레이
 * 실제 광고처럼 보이는 시뮬레이션 UI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeState } from '../../hooks/useSafeState';

const { width, height } = Dimensions.get('window');

interface MockAdOverlayProps {
  visible: boolean;
  adType: 'interstitial' | 'rewarded';
  onClose: (completed: boolean) => void;
  placement: string;
}

export const MockAdOverlay: React.FC<MockAdOverlayProps> = ({
  visible,
  adType,
  onClose,
  placement,
}) => {
  const [countdown, setCountdown] = useSafeState(adType === 'rewarded' ? 5 : 3);
  const [canClose, setCanClose] = useSafeState(adType === 'interstitial');
  const [fadeAnim] = useSafeState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // 페이드 인 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // 리워드 광고는 카운트다운
      if (adType === 'rewarded' && countdown > 0) {
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanClose(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    } else {
      setCountdown(adType === 'rewarded' ? 5 : 3);
      setCanClose(adType === 'interstitial');
    }
  }, [visible, countdown, adType, fadeAnim]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose(adType === 'rewarded' && countdown === 0);
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (canClose) handleClose();
      }}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* 광고 컨테이너 */}
        <View style={styles.adContainer}>
          {/* 광고 헤더 */}
          <View style={styles.adHeader}>
            <Text style={styles.adBadge}>
              {adType === 'rewarded' ? '🎁 리워드 광고' : '📺 전면 광고'}
            </Text>
            <Text style={styles.placementText}>{placement}</Text>
          </View>

          {/* Mock 광고 콘텐츠 */}
          <View style={styles.adContent}>
            <View style={styles.mockAdImage}>
              <Text style={styles.mockAdTitle}>
                {adType === 'rewarded'
                  ? '⭐ Awesome Game!'
                  : '🎮 Play Now!'}
              </Text>
              <Text style={styles.mockAdDescription}>
                {adType === 'rewarded'
                  ? '광고를 끝까지 시청하면 보상을 받을 수 있습니다'
                  : '이것은 테스트용 전면 광고 시뮬레이션입니다'}
              </Text>

              {adType === 'rewarded' && countdown > 0 && (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                  <Text style={styles.countdownLabel}>초 후 닫기 가능</Text>
                </View>
              )}

              {adType === 'rewarded' && countdown === 0 && (
                <Text style={styles.rewardEarned}>✅ 보상 획득 완료!</Text>
              )}
            </View>

            {/* Mock CTA 버튼 */}
            <TouchableOpacity
              style={styles.mockCtaButton}
              activeOpacity={0.8}
            >
              <Text style={styles.mockCtaText}>
                {adType === 'rewarded' ? '지금 플레이' : '자세히 알아보기'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 닫기 버튼 */}
          {canClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}

          {/* Expo Go 표시 */}
          <View style={styles.expoGoIndicator}>
            <Text style={styles.expoGoText}>
              📱 Expo Go 시뮬레이션 모드
            </Text>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  adHeader: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  adBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  placementText: {
    fontSize: 11,
    color: '#888',
  },
  adContent: {
    padding: 20,
  },
  mockAdImage: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  mockAdTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  mockAdDescription: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  countdownContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  countdownLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  rewardEarned: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
  },
  mockCtaButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  mockCtaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  expoGoIndicator: {
    backgroundColor: '#7b2cbf',
    padding: 8,
    alignItems: 'center',
  },
  expoGoText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
});

export default MockAdOverlay;
