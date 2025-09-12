import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  Dimensions,
  TextInput,
  Alert
} from 'react-native';
import { TarotCardComponent } from './TarotCard';
import { simpleStorage, STORAGE_KEYS, TarotUtils } from '../utils/tarotData';
import { 
  Colors, 
  GlassStyles, 
  ShadowStyles, 
  TextStyles,
  Spacing,
  BorderRadius 
} from './DesignSystem';

const { width: screenWidth } = Dimensions.get('window');

// 데일리 타로 뷰어 모달
const DailyTarotViewer = ({ visible, reading, onClose }) => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [memoText, setMemoText] = useState('');
  const [cardMemos, setCardMemos] = useState({});

  useEffect(() => {
    if (reading && reading.memos) {
      setCardMemos(reading.memos);
    }
  }, [reading]);

  useEffect(() => {
    if (selectedHour !== null && cardMemos[selectedHour]) {
      setMemoText(cardMemos[selectedHour]);
    } else {
      setMemoText('');
    }
  }, [selectedHour, cardMemos]);

  const handleCardPress = (hour) => {
    setSelectedHour(hour);
  };

  const saveMemo = () => {
    const updatedMemos = { ...cardMemos, [selectedHour]: memoText };
    setCardMemos(updatedMemos);
    // 실제 저장 로직은 여기에 구현
    Alert.alert('저장 완료', `${selectedHour}시 메모가 저장되었습니다.`);
  };

  if (!reading) return null;

  const selectedCard = reading.hourlyCards?.[selectedHour];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.dailyViewerContainer}>
        {/* 제목 */}
        <View style={styles.dailyViewerHeader}>
          <Text style={styles.dailyViewerTitle}>24시간 타로</Text>
          <Text style={styles.dailyViewerDate}>{reading.displayDate}</Text>
        </View>

        {/* 24시간 카드 가로 스크롤 */}
        <View style={styles.cardScrollSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardScrollContainer}
          >
            {Array.from({ length: 24 }, (_, hour) => {
              const card = reading.hourlyCards?.[hour];
              const hasMemo = cardMemos[hour] && cardMemos[hour].trim().length > 0;
              const isSelected = selectedHour === hour;
              
              if (!card) return null;
              
              return (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourlyCardItem,
                    isSelected && styles.hourlyCardSelected
                  ]}
                  onPress={() => handleCardPress(hour)}
                >
                  <Text style={styles.hourLabel}>
                    {hour === 0 ? '자정' : 
                     hour === 12 ? '정오' : 
                     hour < 12 ? `${hour}시` : `${hour - 12}시`}
                  </Text>
                  
                  <View style={styles.cardImageContainer}>
                    <TarotCardComponent 
                      card={card}
                      size="small"
                      showText={false}
                    />
                    {hasMemo && (
                      <View style={styles.memoIndicator}>
                        <Text style={styles.memoIndicatorText}>📝</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 선택된 카드 정보 */}
        {selectedCard && (
          <View style={styles.selectedCardInfo}>
            <Text style={styles.selectedTimeText}>
              {selectedHour === 0 ? '자정' : 
               selectedHour === 12 ? '정오' : 
               selectedHour < 12 ? `오전 ${selectedHour}시` : `오후 ${selectedHour - 12}시`}
            </Text>
            <Text style={styles.selectedCardName}>{selectedCard.nameKr}</Text>
          </View>
        )}

        {/* 메모 섹션 */}
        <View style={styles.memoSection}>
          <Text style={styles.memoSectionTitle}>메모</Text>
          <TextInput
            style={styles.memoInput}
            value={memoText}
            onChangeText={setMemoText}
            placeholder="이 시간의 타로 카드에 대한 메모를 입력하세요..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.memoSaveButton} onPress={saveMemo}>
            <Text style={styles.memoSaveButtonText}>메모 저장</Text>
          </TouchableOpacity>
        </View>

        {/* 우측 하단 닫기 버튼 */}
        <TouchableOpacity style={styles.floatingCloseButton} onPress={onClose}>
          <Text style={styles.floatingCloseButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// 스프레드 뷰어 모달
const SpreadViewer = ({ visible, spread, onClose }) => {
  if (!spread) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.spreadViewerContainer}>
        <View style={styles.spreadViewerHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ fontSize: 20, color: '#9b8db8' }}>×</Text>
          </TouchableOpacity>
          <Text style={styles.spreadViewerTitle}>{spread.title}</Text>
        </View>
        
        <ScrollView style={styles.spreadViewerContent}>
          <Text style={styles.spreadName}>{spread.spreadName}</Text>
          
          {/* 스프레드 배치도 */}
          <View style={styles.spreadLayout}>
            {spread.positions?.map((position, index) => (
              <View 
                key={position.id || index}
                style={[
                  styles.spreadCardPosition,
                  {
                    position: 'absolute',
                    left: `${position.x || 50}%`,
                    top: `${position.y || 50}%`,
                    transform: [
                      { translateX: -30 },
                      { translateY: -40 }
                    ]
                  }
                ]}
              >
                {position.card && (
                  <TarotCardComponent 
                    card={position.card}
                    size="small"
                    showText={false}
                  />
                )}
                {position.name && (
                  <Text style={styles.spreadPositionName}>{position.name}</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const TarotJournal = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dailyReadings, setDailyReadings] = useState([]);
  const [spreadReadings, setSpreadReadings] = useState([]);
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDailyReadings();
    loadSpreadReadings();
  }, []);

  const loadDailyReadings = async () => {
    try {
      setIsLoading(true);
      const readings = [];
      
      // 최근 30일간의 일일 타로 데이터 로드
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const storageKey = STORAGE_KEYS.DAILY_TAROT + dateString;
        
        try {
          const savedData = await simpleStorage.getItem(storageKey);
          if (savedData) {
            const dailySave = JSON.parse(savedData);
            readings.push({
              ...dailySave,
              type: 'daily',
              displayDate: date.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })
            });
          }
        } catch (error) {
          // 개별 날짜 로드 실패는 무시
        }
      }
      
      setDailyReadings(readings.sort((a, b) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      ));
    } catch (error) {
      console.error('일일 리딩 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpreadReadings = async () => {
    try {
      const spreads = await TarotUtils.loadSavedSpreads();
      setSpreadReadings(spreads);
    } catch (error) {
      console.error('스프레드 리딩 로드 실패:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.appTitle}>Sacred Journal</Text>
      <Text style={styles.appSubtitle}>우주 지혜를 통한 성찰로운 여정</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'daily' && styles.activeTab]}
          onPress={() => setActiveTab('daily')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'daily' && styles.activeTabText
          ]}>
            데일리 타로
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'spreads' && styles.activeTab]}
          onPress={() => setActiveTab('spreads')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'spreads' && styles.activeTabText
          ]}>
            스프레드 기록
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDailyReadings = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>데일리 타로를 불러오는 중...</Text>
        </View>
      );
    }

    if (dailyReadings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🕐</Text>
          <Text style={styles.emptyTitle}>데일리 리딩</Text>
          <Text style={styles.emptyText}>
            저장된 데일리 타로가 없습니다{'\n'}
            타이머 탭에서 24시간 타로를 저장해보세요
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.readingsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>데일리 리딩</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{dailyReadings.length}개 기록</Text>
          </View>
        </View>

        {dailyReadings.map((reading, index) => (
          <TouchableOpacity
            key={reading.id || index}
            style={styles.dailyCard}
            onPress={() => setSelectedReading(reading)}
          >
            <View style={styles.dailyCardHeader}>
              <View style={styles.dateInfo}>
                <Text style={styles.dateText}>{reading.displayDate}</Text>
                <Text style={styles.typeLabel}>24시간 타로 리딩</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>완료</Text>
              </View>
            </View>

            {/* 카드 미리보기 */}
            <View style={styles.cardPreview}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {reading.hourlyCards?.slice(0, 8).map((card, cardIndex) => (
                  <View key={cardIndex} style={styles.previewCard} />
                ))}
                {reading.hourlyCards?.length > 8 && (
                  <Text style={styles.moreText}>+{reading.hourlyCards.length - 8}</Text>
                )}
              </ScrollView>
            </View>

            {/* 인사이트 미리보기 */}
            {reading.insights && (
              <View style={styles.insightPreview}>
                <Text style={styles.insightIcon}>💭</Text>
                <Text style={styles.insightText} numberOfLines={2}>
                  "{reading.insights}"
                </Text>
              </View>
            )}

            {/* 메모 카운트 */}
            {reading.memos && Object.keys(reading.memos).length > 0 && (
              <View style={styles.memoInfo}>
                <Text style={styles.memoCount}>
                  🕐 {Object.keys(reading.memos).length}개 시간대 메모
                </Text>
                <Text style={{ fontSize: 16, color: '#f4d03f' }}>›</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderSpreadReadings = () => {
    if (spreadReadings.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔮</Text>
          <Text style={styles.emptyTitle}>스프레드 기록</Text>
          <Text style={styles.emptyText}>
            저장된 스프레드가 없습니다{'\n'}
            스프레드 탭에서 리딩을 저장해보세요
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.readingsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={{ fontSize: 16, color: '#f4d03f' }}>🃏</Text>
            <Text style={styles.sectionTitle}>스프레드 기록</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{spreadReadings.length}개 기록</Text>
          </View>
        </View>

        {spreadReadings.map((spread, index) => (
          <TouchableOpacity
            key={spread.id || index}
            style={styles.spreadCard}
            onPress={() => setSelectedSpread(spread)}
          >
            <View style={styles.spreadCardHeader}>
              <View style={styles.spreadInfo}>
                <Text style={styles.spreadTitle}>{spread.title}</Text>
                <Text style={styles.spreadDate}>
                  {new Date(spread.createdAt).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              <View style={styles.cardCountBadge}>
                <Text style={styles.cardCountText}>{spread.positions?.length || 0}카드 시전함</Text>
              </View>
            </View>

            {/* 스프레드 미니 프리뷰 */}
            <View style={styles.spreadPreview}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {spread.positions?.slice(0, 4).map((position, cardIndex) => (
                  <View key={cardIndex} style={styles.spreadPreviewCard} />
                ))}
                {spread.positions?.length > 4 && (
                  <Text style={styles.moreText}>+{spread.positions.length - 4}</Text>
                )}
              </ScrollView>
            </View>

            <View style={styles.spreadFooter}>
              <Text style={styles.spreadType}>{spread.spreadName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <View style={styles.content}>
        {activeTab === 'daily' ? renderDailyReadings() : renderSpreadReadings()}
      </View>

      {/* 데일리 타로 뷰어 모달 */}
      <DailyTarotViewer
        visible={!!selectedReading}
        reading={selectedReading}
        onClose={() => setSelectedReading(null)}
      />

      {/* 스프레드 뷰어 모달 */}
      <SpreadViewer
        visible={!!selectedSpread}
        spread={selectedSpread}
        onClose={() => setSelectedSpread(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.glass.primary,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    marginBottom: Spacing.xs,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  activeTab: {
    backgroundColor: Colors.brand.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  countBadge: {
    backgroundColor: Colors.brand.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  readingsContainer: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  
  // 데일리 카드 스타일
  dailyCard: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  dailyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  typeLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statusBadge: {
    backgroundColor: '#4ade80',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  cardPreview: {
    marginBottom: Spacing.md,
  },
  previewCard: {
    width: 20,
    height: 30,
    backgroundColor: Colors.glass.tertiary,
    borderRadius: 2,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  moreText: {
    fontSize: 12,
    color: Colors.text.secondary,
    alignSelf: 'center',
    marginLeft: Spacing.sm,
  },
  insightPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  memoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 208, 63, 0.2)',
  },
  memoCount: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.brand.accent,
  },
  
  // 스프레드 카드 스타일
  spreadCard: {
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  spreadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  spreadInfo: {
    flex: 1,
  },
  spreadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  spreadDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  cardCountBadge: {
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.brand.accent,
  },
  cardCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.brand.accent,
  },
  spreadPreview: {
    marginBottom: Spacing.md,
  },
  spreadPreviewCard: {
    width: 20,
    height: 30,
    backgroundColor: Colors.glass.tertiary,
    borderRadius: 2,
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  spreadFooter: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 208, 63, 0.2)',
  },
  spreadType: {
    fontSize: 12,
    color: Colors.brand.accent,
    fontWeight: '500',
  },
  
  // 빈 상태
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.accent,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // 데일리 타로 뷰어 모달
  dailyViewerContainer: {
    flex: 1,
    backgroundColor: '#1a1625', // 메인 앱과 동일한 배경색
  },
  dailyViewerHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  dailyViewerTitle: {
    fontSize: 22,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: 'bold',
    color: Colors.brand.accent,
    textAlign: 'center',
  },
  dailyViewerDate: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  
  // 24시간 카드 가로 스크롤
  cardScrollSection: {
    paddingVertical: Spacing.lg,
  },
  cardScrollContainer: {
    paddingHorizontal: Spacing.lg,
  },
  hourlyCardItem: {
    alignItems: 'center',
    marginRight: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(45, 27, 71, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    minWidth: 80,
  },
  hourlyCardSelected: {
    borderColor: Colors.brand.accent,
    borderWidth: 2,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  hourLabel: {
    fontSize: 10,
    fontFamily: 'NotoSansKR_400Regular',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  cardImageContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  memoIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.brand.accent,
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoIndicatorText: {
    fontSize: 8,
  },
  
  // 선택된 카드 정보
  selectedCardInfo: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
  },
  selectedTimeText: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: Colors.brand.primary,
  },
  selectedCardName: {
    fontSize: 14,
    fontFamily: 'NotoSansKR_500Medium',
    color: Colors.text.primary,
    marginTop: Spacing.xs,
  },
  
  // 메모 섹션
  memoSection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  memoSectionTitle: {
    fontSize: 16,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  memoInput: {
    flex: 1,
    backgroundColor: 'rgba(45, 27, 71, 0.4)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  memoSaveButton: {
    backgroundColor: Colors.brand.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  memoSaveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'NotoSansKR_700Bold',
    fontWeight: '600',
  },
  
  // 우측 하단 플로팅 닫기 버튼
  floatingCloseButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(45, 27, 71, 0.9)',
    borderWidth: 2,
    borderColor: Colors.brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...ShadowStyles.medium,
  },
  floatingCloseButtonText: {
    fontSize: 24,
    fontFamily: 'NotoSansKR_700Bold',
    color: Colors.brand.accent,
    fontWeight: 'bold',
  },
  
  // 메모 모달
  memoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  memoModal: {
    backgroundColor: 'rgba(15, 12, 27, 0.95)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: Colors.brand.accent,
  },
  memoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  memoModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  memoInput: {
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    marginBottom: Spacing.lg,
  },
  memoModalActions: {
    alignItems: 'center',
  },
  memoSaveButton: {
    backgroundColor: Colors.brand.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minWidth: 120,
  },
  memoSaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  
  // 스프레드 뷰어 모달
  spreadViewerContainer: {
    flex: 1,
    backgroundColor: Colors.glass.primary,
  },
  spreadViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244, 208, 63, 0.3)',
  },
  spreadViewerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  spreadViewerContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  spreadName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.brand.accent,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  spreadLayout: {
    height: 300,
    backgroundColor: 'rgba(15, 12, 27, 0.8)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    position: 'relative',
  },
  spreadCardPosition: {
    alignItems: 'center',
  },
  spreadPositionName: {
    fontSize: 8,
    color: Colors.brand.accent,
    textAlign: 'center',
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 2,
  },
});

export default TarotJournal;