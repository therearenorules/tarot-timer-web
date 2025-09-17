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
import { useTranslation } from 'react-i18next';
import { useTarotI18n } from '../../hooks/useTarotI18n';
import { LanguageUtils } from '../../i18n/index';
import { Colors, Spacing, BorderRadius } from '../DesignSystem';
import { useTimer } from '../../hooks/useTimer';
import { useTarotCards } from '../../hooks/useTarotCards';
import { TarotUtils } from '../../utils/tarotData';
import { TarotCardComponent } from '../TarotCard';
import { Icon } from '../Icon';
import InterstitialAd from '../ads/InterstitialAd';

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
  const { t } = useTranslation();
  const { getCardName, getCardMeaning, isEnglish } = useTarotI18n();
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  // 화면 크기에 따른 모달 스타일 계산
  const getModalStyle = () => {
    const { width, height } = screenData;

    if (Platform.OS === 'web') {
      return {
        width: '100%',
        maxWidth: 400,
        height: 'auto',
      };
    }

    // 모바일에서 화면 크기별 조정
    let modalWidth = '95%';
    let modalHeight = '75%';
    let minHeight = 500;

    if (width < 350) {
      // 매우 작은 화면 (iPhone SE 등)
      modalWidth = '98%';
      modalHeight = '80%';
      minHeight = 450;
    } else if (width > 500) {
      // 태블릿이나 큰 화면
      modalWidth = '85%';
      modalHeight = '70%';
      minHeight = 550;
    }

    return {
      width: modalWidth,
      height: modalHeight,
      minHeight,
      maxWidth: width > 500 ? 500 : undefined, // 태블릿에서 최대 너비 제한
    };
  };

  if (!card) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      supportedOrientations={['portrait']}
      statusBarTranslucent={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={[styles.modalContainer, getModalStyle()]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.modalCardContainer}>
              <TarotCardComponent 
                card={card}
                size="large"
                showText={false}
              />
              <Text style={styles.modalCardName}>{getCardName(card)}</Text>
              {!isEnglish && (
                <Text style={styles.modalCardNameEn}>{card.name}</Text>
              )}
            </View>

            <View style={styles.modalMeaningSection}>
              <View style={styles.meaningTags}>
                <View style={styles.meaningTag}>
                  <Text style={styles.meaningTagText}>{t('cards.hope')}</Text>
                </View>
                <View style={styles.meaningTag}>
                  <Text style={styles.meaningTagText}>{t('cards.courage')}</Text>
                </View>
                <View style={styles.meaningTag}>
                  <Text style={styles.meaningTagText}>{t('cards.freedom')}</Text>
                </View>
              </View>
              <Text style={styles.modalCardMeaning}>{getCardMeaning(card)}</Text>
            </View>

            <View style={styles.modalMemoSection}>
              <Text style={styles.modalMemoTitle}>{t('journal.entry.memo')}</Text>
              <TextInput
                style={styles.modalMemoInput}
                value={memo}
                onChangeText={onMemoChange}
                placeholder={t('timer.memoPlaceholder')}
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  const { t } = useTranslation();
  const { getCardName } = useTarotI18n();
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
        <Text style={styles.energyFlowTitle}>{t('timer.energyFlow')}</Text>
        <TouchableOpacity style={styles.redrawButton} onPress={onRedraw}>
          <Text style={styles.redrawButtonText}>{t('timer.redraw')}</Text>
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
                {hour === 0 ? t('timer.midnight') : 
                 hour === 12 ? t('timer.noon') : 
                 hour < 12 ? t('timer.am', { hour }) : t('timer.pm', { hour: hour - 12 })}
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
              {getCardName(card)}
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
  const { t } = useTranslation();
  const { getCardName, getCardMeaning, isEnglish } = useTarotI18n();
  const { currentTime, currentHour, formattedTime, onSessionComplete, removeSessionCompleteCallback } = useTimer();

  // 세션 완료 시 전면 광고 콜백 등록
  useEffect(() => {
    const sessionCompleteHandler = () => {
      console.log('🕒 타로 세션 완료 감지 - 전면 광고 준비');
      // InterstitialAd 컴포넌트에서 자동으로 처리됨
    };

    onSessionComplete(sessionCompleteHandler);

    return () => {
      removeSessionCompleteCallback(sessionCompleteHandler);
    };
  }, [onSessionComplete, removeSessionCompleteCallback]);

  // 랜덤 헤드라인과 서브타이틀 선택
  const getRandomWelcomeText = () => {
    const titles = t('timer.welcomeTitles', { returnObjects: true }) as string[];
    const subtitles = t('timer.welcomeSubtitles', { returnObjects: true }) as string[];
    
    const randomTitleIndex = Math.floor(Math.random() * titles.length);
    const randomSubtitleIndex = Math.floor(Math.random() * subtitles.length);
    
    return {
      title: titles[randomTitleIndex],
      subtitle: subtitles[randomSubtitleIndex]
    };
  };
  
  const [welcomeText] = useState(() => getRandomWelcomeText());
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

  const currentDate = LanguageUtils.formatDate(new Date());

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 세션 완료 시 전면 광고 */}
      <InterstitialAd
        placement="session_complete"
        trigger="session_complete"
        onAdShown={() => console.log('✅ 타로 세션 완료 - 전면 광고 표시됨')}
        onAdDismissed={() => console.log('🔄 전면 광고 닫힘')}
        onAdFailed={(error) => console.log('❌ 전면 광고 실패:', error)}
        onRevenueEarned={(amount) => console.log('💰 전면 광고 수익:', amount)}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 날짜 섹션 */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* 현재 시간 카드 또는 빈 상태 */}
        {hasCardsForToday && currentCard ? (
          <View style={styles.currentCardSection}>
            <Text style={styles.currentTimeLabel}>{t('timer.currentTime')}</Text>
            <Text style={styles.currentTimeText}>
              {currentHour === 0 ? t('timer.midnight') : 
               currentHour === 12 ? t('timer.noon') : 
               currentHour < 12 ? t('timer.am', { hour: currentHour }) : t('timer.pm', { hour: currentHour - 12 })}
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
              <Text style={styles.currentCardName}>{getCardName(currentCard)}</Text>
              {!isEnglish && (
                <Text style={styles.currentCardNameEn}>{currentCard.name}</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.currentCardMeaning}>
              {getCardMeaning(currentCard)}
            </Text>
            
            {/* 메모 남기기 버튼 */}
            <TouchableOpacity 
              style={styles.memoActionButton}
              onPress={() => handleCardPress(currentHour)}
            >
              <Text style={styles.memoActionButtonText}>
                {cardMemos[currentHour] ? t('timer.editMemo') : t('timer.addMemo')}
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
            <Text style={styles.emptyStateTitle}>{welcomeText.title}</Text>
            <Text style={styles.emptyStateSubtitle}>
              {welcomeText.subtitle}
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
                  {isLoading ? t('timer.preparing') : t('timer.drawCards')}
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
              {t('timer.guideText')}
            </Text>
          </View>
        )}

        {/* 데일리 타로 저장하기 버튼 */}
        {hasCardsForToday && (
          <View style={styles.saveSection}>
            <TouchableOpacity style={styles.dailySaveButton}>
              <Text style={styles.dailySaveButtonText}>{t('timer.saveDailyTarot')}</Text>
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
    backgroundColor: 'rgba(26, 22, 37, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? Spacing.md : Spacing.xs, // 모바일에서 더 적은 가로 패딩
    paddingVertical: Platform.OS === 'ios' ? 60 : 40, // Safe area 고려하되 너무 크지 않게
  },
  modalContainer: {
    // 크기는 동적으로 설정되므로 기본 스타일만 유지
    backgroundColor: 'rgba(45, 27, 71, 0.98)',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.brand.accent,
    shadowColor: Colors.brand.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
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
    padding: Platform.OS === 'web' ? Spacing.lg : Spacing.md, // 모바일에서 패딩 줄이기
    paddingTop: 0,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'web' ? Spacing.lg : Spacing.xl, // 모바일에서 하단 여백 증가
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
    padding: Platform.OS === 'web' ? Spacing.lg : Spacing.md, // 모바일에서 패딩 조정
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: Platform.OS === 'web' ? 120 : 100, // 모바일에서 높이 조정
    height: Platform.OS === 'web' ? undefined : 140, // 모바일에서 고정 높이
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