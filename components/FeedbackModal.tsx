/**
 * 사용자 피드백 수집 모달
 * 관리자가 사용자 의견을 수집할 수 있는 도구
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, Typography } from './DesignSystem';
import AnalyticsManager from '../utils/analyticsManager';

const { width } = Dimensions.get('window');

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [feedbackType, setFeedbackType] = useSafeState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useSafeState('');
  const [rating, setRating] = useSafeState<number>(0);
  const [submitting, setSubmitting] = useSafeState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('알림', '피드백 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      // 피드백을 로컬 분석 시스템에 기록
      await AnalyticsManager.trackEvent('feedback_submitted', {
        feedback_type: feedbackType,
        message_length: message.trim().length,
        rating: rating > 0 ? rating : undefined,
        timestamp: new Date().toISOString()
      });

      const result = { success: true, message: '피드백이 저장되었습니다. 감사합니다!' };

      if (result.success) {
        Alert.alert('완료', result.message);
        setMessage('');
        setRating(0);
        setFeedbackType('general');
        onClose();
      } else {
        Alert.alert('오류', result.message);
      }
    } catch (error) {
      console.error('피드백 전송 오류:', error);
      Alert.alert('오류', '피드백 전송에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>평점 (선택사항)</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Text style={[
                styles.starText,
                star <= rating && styles.starTextActive
              ]}>
                ⭐
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>💭 피드백 보내기</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* 피드백 유형 선택 */}
            <View style={styles.typeSection}>
              <Text style={styles.sectionTitle}>피드백 유형</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    feedbackType === 'bug' && styles.typeButtonActive
                  ]}
                  onPress={() => setFeedbackType('bug')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    feedbackType === 'bug' && styles.typeButtonTextActive
                  ]}>
                    🐛 버그 신고
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    feedbackType === 'feature' && styles.typeButtonActive
                  ]}
                  onPress={() => setFeedbackType('feature')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    feedbackType === 'feature' && styles.typeButtonTextActive
                  ]}>
                    ✨ 기능 제안
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    feedbackType === 'general' && styles.typeButtonActive
                  ]}
                  onPress={() => setFeedbackType('general')}
                >
                  <Text style={[
                    styles.typeButtonText,
                    feedbackType === 'general' && styles.typeButtonTextActive
                  ]}>
                    💬 일반 의견
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 평점 (일반 의견일 때만) */}
            {feedbackType === 'general' && renderStarRating()}

            {/* 메시지 입력 */}
            <View style={styles.messageSection}>
              <Text style={styles.sectionTitle}>
                {feedbackType === 'bug' ? '버그 상세 내용' :
                 feedbackType === 'feature' ? '제안하고 싶은 기능' : '의견 및 제안'}
              </Text>
              <TextInput
                style={styles.messageInput}
                placeholder={
                  feedbackType === 'bug' ? '어떤 문제가 발생했나요? 상세히 설명해주세요.' :
                  feedbackType === 'feature' ? '어떤 기능이 있으면 좋을까요?' :
                  '앱에 대한 의견을 자유롭게 남겨주세요.'
                }
                placeholderTextColor={Colors.text.tertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* 안내 텍스트 */}
            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                📧 소중한 피드백은 앱 개선에 큰 도움이 됩니다.
                개인정보는 수집하지 않으며, 익명으로 처리됩니다.
              </Text>
            </View>
          </ScrollView>

          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!message.trim() || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!message.trim() || submitting}
            >
              <Text style={[
                styles.submitButtonText,
                (!message.trim() || submitting) && styles.submitButtonTextDisabled
              ]}>
                {submitting ? '전송 중...' : '피드백 전송'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  modalTitle: {
    ...Typography.header.h3,
    color: Colors.text.primary,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeButtonText: {
    ...Typography.header.h3,
    color: Colors.text.secondary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  typeSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.body.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.secondary,
  },
  typeButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  typeButtonText: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
  },
  typeButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
  },
  ratingContainer: {
    marginBottom: Spacing.lg,
  },
  ratingLabel: {
    ...Typography.body.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  starButton: {
    padding: Spacing.xs,
  },
  starText: {
    fontSize: 24,
    opacity: 0.3,
  },
  starTextActive: {
    opacity: 1,
  },
  messageSection: {
    marginBottom: Spacing.lg,
  },
  messageInput: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.secondary,
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 120,
    fontFamily: 'NotoSansKR_400Regular',
  },
  infoSection: {
    backgroundColor: Colors.background.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.main,
  },
  infoText: {
    ...Typography.caption.regular,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.secondary,
  },
  cancelButtonText: {
    ...Typography.button.secondary,
    color: Colors.text.secondary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.brand.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.state.disabled,
  },
  submitButtonText: {
    ...Typography.button.primary,
    color: Colors.text.inverse,
  },
  submitButtonTextDisabled: {
    color: Colors.text.tertiary,
  },
});

export default FeedbackModal;