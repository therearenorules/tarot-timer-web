import React, { memo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../DesignSystem';
import { useTimer } from '../../hooks/useTimer';
import { useTarotCards } from '../../hooks/useTarotCards';
import { TarotUtils } from '../../utils/tarotData';
import { TarotCardComponent } from '../TarotCard';
import { Icon } from '../Icon';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.35; // 화면 너비의 35% (더 얇게)

// 카드 상세 모달 컴포넌트
const CardDetailModal = memo(({ 
  visible, 
  card, 
  hour, 
  memo, 
  onClose, 
  onMemoChange, 
  onSave 
}: {
  visible: boolean;
  card: any;
  hour: number;
  memo: string;
  onClose: () => void;
  onMemoChange: (memo: string) => void;
  onSave: () => void;
}) => {
  if (!card) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalCardContainer}>
              <TarotCardComponent 
                card={card}
                size="large"
                showText={false}
              />
              <Text style={styles.modalCardName}>{card.nameKr}</Text>
              <Text style={styles.modalCardNameEn}>{card.name}</Text>
            </View>

            <View style={styles.modalMeaningSection}>
              <View style={styles.meaningTags}>
                <View style={styles.meaningTag}>
                  <Text style={styles.meaningTagText}>희망</Text>
                </View>
                <View style={styles.meaningTag}>
                  <Text style={styles.meaningTagText}>용감</Text>
                </View>
                <View style={styles.meaningTag}>
                  <Text style={styles.meaningTagText}>자유</Text>
                </View>
              </View>
              <Text style={styles.modalCardMeaning}>{card.meaningKr}</Text>
            </View>

            <View style={styles.modalMemoSection}>
              <Text style={styles.modalMemoTitle}>메모</Text>
              <TextInput
                style={styles.modalMemoInput}
                value={memo}
                onChangeText={onMemoChange}
                placeholder="이 시간에 대한 생각이나 느낌을 적어보세요..."
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

// 24시간 에너지 흐름 컴포넌트
const EnergyFlowSection = memo(({ 
  dailyCards, 
  currentHour, 
  onCardPress,
  cardMemos,
  onRedraw 
}: {
  dailyCards: any[];
  currentHour: number;
  onCardPress: (hour: number) => void;
  cardMemos: Record<number, string>;
  onRedraw: () => void;
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // 현재 시간이 바뀔 때마다 스크롤 위치 조정
  useEffect(() => {
    if (scrollViewRef.current && dailyCards.length > 0) {
      const scrollX = currentHour * (cardWidth + Spacing.sm);
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [currentHour, dailyCards.length]);

  return (
    <View style={styles.energyFlowSection}>
      <View style={styles.energyFlowHeader}>
        <Text style={styles.energyFlowTitle}>24시간 에너지 흐름</Text>
        <TouchableOpacity style={styles.redrawButton} onPress={onRedraw}>
          <Text style={styles.redrawButtonText}>다시 뽑기</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardScrollContainer}
        snapToInterval={cardWidth + Spacing.sm}
        decelerationRate="fast"
      >
      {Array.from({ length: 24 }, (_, hour) => {
        const card = dailyCards[hour];
        const isCurrentHour = hour === currentHour;
        
        if (!card) return null;
        
        return (
          <TouchableOpacity
            key={hour}
            style={[
              styles.energyCard,
              isCurrentHour ? styles.currentEnergyCard : null
            ]}
            onPress={() => onCardPress(hour)}
          >
            <View style={styles.energyCardTime}>
              <Text style={[
                styles.energyCardTimeText,
                isCurrentHour ? styles.currentEnergyCardTimeText : null
              ]}>
                {hour === 0 ? '자정' : 
                 hour === 12 ? '정오' : 
                 hour < 12 ? `오전 ${hour}시` : `오후 ${hour - 12}시`}
              </Text>
            </View>
            
            <View style={styles.energyCardImage}>
              <TarotCardComponent 
                card={card}
                size="medium"
                showText={false}
              />
            </View>
            
            <Text style={[
              styles.energyCardName,
              isCurrentHour ? styles.currentEnergyCardName : null
            ]} numberOfLines={1}>
              {card.nameKr}
            </Text>
            
            {/* 메모 버튼 */}
            <TouchableOpacity 
              style={styles.memoButton}
              onPress={(e) => {
                e.stopPropagation();
                onCardPress(hour);
              }}
            >
              <Text style={styles.memoButtonText}>
                {cardMemos[hour] ? '📝' : '📄'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
      </ScrollView>
    </View>
  );
});

const TimerTab = memo(() => {
  const { currentTime, currentHour, formattedTime } = useTimer();
  const {
    dailyCards,
    isLoading,
    selectedCardIndex,
    cardMemos,
    hasCardsForToday,
    currentCard,
    setSelectedCardIndex,
    drawDailyCards,
    redrawAllCards,
    redrawSingleCard,
    updateMemo,
  } = useTarotCards(currentHour);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [modalHour, setModalHour] = useState(0);
  const [modalMemo, setModalMemo] = useState('');

  const handleCardPress = (hour: number) => {
    const card = dailyCards[hour];
    if (card) {
      setModalCard(card);
      setModalHour(hour);
      setModalMemo(cardMemos[hour] || '');
      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModalCard(null);
  };

  const handleMemoSave = () => {
    updateMemo(modalHour, modalMemo);
    setModalVisible(false);
  };

  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 날짜 섹션 */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* 현재 시간 카드 또는 빈 상태 */}
        {hasCardsForToday && currentCard ? (
          <View style={styles.currentCardSection}>
            <Text style={styles.currentTimeLabel}>현재 시간</Text>
            <Text style={styles.currentTimeText}>
              {currentHour === 0 ? '자정' : 
               currentHour === 12 ? '정오' : 
               currentHour < 12 ? `오전 ${currentHour}시` : `오후 ${currentHour - 12}시`}
            </Text>
            
            <TouchableOpacity 
              style={styles.currentCardContainer}
              onPress={() => handleCardPress(currentHour)}
            >
              <TarotCardComponent 
                card={currentCard}
                size="large"
                showText={false}
              />
              <Text style={styles.currentCardName}>{currentCard.nameKr}</Text>
              <Text style={styles.currentCardNameEn}>{currentCard.name}</Text>
            </TouchableOpacity>
            
            <Text style={styles.currentCardMeaning}>
              {currentCard.meaningKr}
            </Text>
            
            {/* 메모 남기기 버튼 */}
            <TouchableOpacity 
              style={styles.memoActionButton}
              onPress={() => handleCardPress(currentHour)}
            >
              <Text style={styles.memoActionButtonText}>
                {cardMemos[currentHour] ? '📝 메모 수정하기' : '📄 메모 남기기'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconContainer}>
              <View style={styles.mysticalFrame}>
                <View style={styles.innerFrame}>
                  <Icon 
                    name="tarot-card" 
                    size={56} 
                    color={Colors.brand.accent} 
                  />
                </View>
                <View style={styles.cornerAccents}>
                  <View style={[styles.cornerDot, styles.topLeft]} />
                  <View style={[styles.cornerDot, styles.topRight]} />
                  <View style={[styles.cornerDot, styles.bottomLeft]} />
                  <View style={[styles.cornerDot, styles.bottomRight]} />
                </View>
              </View>
            </View>
            <Text style={styles.emptyStateTitle}>운명을 받혀보세요</Text>
            <Text style={styles.emptyStateSubtitle}>
              오늘 하루 각 시간에 흐르는 우주의 에너지를 발견하세요
            </Text>
            
            <TouchableOpacity
              style={[styles.drawButton, isLoading ? styles.disabledButton : null]}
              onPress={drawDailyCards}
              disabled={isLoading}
            >
              <View style={styles.drawButtonContent}>
                {!isLoading && (
                  <Icon 
                    name="tarot-card" 
                    size={18} 
                    color="#1a1625" 
                  />
                )}
                <Text style={[styles.drawButtonText, !isLoading && { marginLeft: 8 }]}>
                  {isLoading ? '카드 준비 중...' : '24시간 타로 뽑기'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 에너지 흐름 섹션 */}
        {hasCardsForToday && (
          <EnergyFlowSection
            dailyCards={dailyCards}
            currentHour={currentHour}
            onCardPress={handleCardPress}
            cardMemos={cardMemos}
            onRedraw={redrawAllCards}
          />
        )}

        {/* 하단 안내 문구 */}
        {hasCardsForToday && (
          <View style={styles.bottomGuideSection}>
            <Text style={styles.bottomGuideText}>
              "매 순간마다 우주의 에너지가 흐릅니다. 마음을 열고 지혜를 받아들이세요."
            </Text>
          </View>
        )}

        {/* 데일리 타로 저장하기 버튼 */}
        {hasCardsForToday && (
          <View style={styles.saveSection}>
            <TouchableOpacity style={styles.dailySaveButton}>
              <Text style={styles.dailySaveButtonText}>데일리 타로 저장하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 카드 상세 모달 */}
      <CardDetailModal
        visible={modalVisible}
        card={modalCard}
        hour={modalHour}
        memo={modalMemo}
        onClose={handleModalClose}
        onMemoChange={setModalMemo}
        onSave={handleMemoSave}
      />
    </KeyboardAvoidingView>
  );
});

TimerTab.displayName = 'TimerTab';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.glass.primary,
  },
  scrollView: {
    flex: 1,
  },
  dateSection: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    textAlign: 'center',
  },
  currentCardSection: {
    padding: Spacing.xl, // 카드가 커진 만큼 패딩 증가
    alignItems: 'center',
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
    marginBottom: Spacing.lg,
  },
  currentTimeLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  currentTimeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    marginBottom: Spacing.xl, // 카드와의 간격 증가
  },
  currentCardContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg, // 카드 의미와의 간격 증가
    transform: [{ scale: 1.1 }], // 10% 크게 만들기
  },
  currentCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  currentCardNameEn: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  currentCardMeaning: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl, // 메모 버튼과의 간격 증가
  },
  memoActionButton: {
    backgroundColor: 'rgba(244, 208, 63, 0.15)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.4)',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  memoActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.accent,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    marginBottom: Spacing.lg,
  },
  emptyStateIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl * 1.5,
    paddingVertical: Spacing.xl,
  },
  mysticalFrame: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerFrame: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 208, 63, 0.08)',
    shadowColor: Colors.brand.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cornerAccents: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cornerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.accent,
    shadowColor: Colors.brand.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  drawButton: {
    backgroundColor: Colors.brand.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minWidth: 200,
  },
  disabledButton: {
    opacity: 0.6,
  },
  drawButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  energyFlowSection: {
    marginBottom: Spacing.xl,
  },
  energyFlowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  energyFlowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  redrawButton: {
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
  },
  redrawButtonText: {
    fontSize: 12,
    color: Colors.brand.accent,
    fontWeight: '500',
  },
  cardScrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing.lg,
  },
  energyCard: {
    width: cardWidth,
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  currentEnergyCard: {
    borderColor: Colors.brand.accent,
    borderWidth: 3,
    backgroundColor: 'rgba(244, 208, 63, 0.15)',
    shadowColor: Colors.brand.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  energyCardTime: {
    marginBottom: Spacing.md,
  },
  energyCardTimeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  currentEnergyCardTimeText: {
    color: Colors.brand.accent,
    fontWeight: 'bold',
  },
  energyCardImage: {
    marginBottom: Spacing.md,
  },
  energyCardName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  currentEnergyCardName: {
    color: Colors.brand.accent,
    fontWeight: 'bold',
  },
  memoButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.4)',
  },
  memoButtonText: {
    fontSize: 10,
  },
  bottomGuideSection: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(15, 12, 27, 0.6)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.2)',
    marginBottom: Spacing.lg,
  },
  bottomGuideText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  saveSection: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  dailySaveButton: {
    backgroundColor: Colors.brand.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  dailySaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 37, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: 'rgba(45, 27, 71, 0.95)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
    shadowColor: Colors.brand.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: Colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: 0,
  },
  modalCardContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalCardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  modalCardNameEn: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  modalMeaningSection: {
    marginBottom: Spacing.xl,
  },
  meaningTags: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  meaningTag: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  meaningTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  modalCardMeaning: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalMemoSection: {
    marginBottom: Spacing.xl,
  },
  modalMemoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  modalMemoInput: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.brand.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default TimerTab;