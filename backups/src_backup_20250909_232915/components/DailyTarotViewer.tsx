// components/DailyTarotViewer.tsx - 저장된 일일 타로 뷰어
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from './ui/Icon';
import {
  DailyTarotSave,
  SavedSpread,
  formatKoreanDate,
  formatHour,
} from '../utils/tarot-data';

interface DailyTarotViewerProps {
  dailyTarotSave: DailyTarotSave;
  onBack: () => void;
}

const DailyTarotViewer = ({ dailyTarotSave, onBack }: DailyTarotViewerProps) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const handleCardPress = (index: number) => {
    setSelectedCardIndex(selectedCardIndex === index ? null : index);
  };

  const selectedCard = selectedCardIndex !== null ? dailyTarotSave.hourlyCards[selectedCardIndex] : null;
  const selectedMemo = selectedCardIndex !== null ? dailyTarotSave.memos?.[selectedCardIndex] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f3a" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="chevron-left" size={24} color="#d4af37" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>일일 타로 리딩</Text>
          <Text style={styles.headerSubtitle}>
            {formatKoreanDate(dailyTarotSave.date)}
          </Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 전체 인사이트 */}
        <View style={styles.insightsContainer}>
          <View style={styles.insightsHeader}>
            <Icon name="sparkles" size={20} color="#d4af37" />
            <Text style={styles.insightsTitle}>전체 인사이트</Text>
          </View>
          <Text style={styles.insightsText}>{dailyTarotSave.insights}</Text>
        </View>

        {/* 24시간 카드 그리드 */}
        <View style={styles.cardsContainer}>
          <Text style={styles.cardsTitle}>24시간 에너지 흐름</Text>
          <View style={styles.cardsGrid}>
            {dailyTarotSave.hourlyCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.hourlyCardContainer,
                  selectedCardIndex === index && styles.selectedCardContainer,
                ]}
                onPress={() => handleCardPress(index)}
              >
                <View style={styles.hourlyCard}>
                  <Image
                    source={{ uri: card.imageUrl }}
                    style={styles.hourlyCardImage}
                    defaultSource={require('../assets/card-back.png')}
                  />
                  {dailyTarotSave.memos?.[index] && (
                    <View style={styles.memoIndicator}>
                      <Icon name="edit" size={8} color="#d4af37" />
                    </View>
                  )}
                </View>
                <Text style={styles.hourLabel}>{formatHour(index)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 선택된 카드 상세 */}
        {selectedCard && (
          <View style={styles.cardDetailContainer}>
            <View style={styles.cardDetailHeader}>
              <Text style={styles.cardDetailTitle}>
                {formatHour(selectedCardIndex!)} - {selectedCard.nameKr}
              </Text>
              <Text style={styles.cardDetailSubtitle}>{selectedCard.name}</Text>
            </View>

            <View style={styles.cardDetailContent}>
              <Image
                source={{ uri: selectedCard.imageUrl }}
                style={styles.cardDetailImage}
                defaultSource={require('../assets/card-back.png')}
              />
              
              <View style={styles.cardDetailInfo}>
                <View style={styles.keywordsContainer}>
                  {selectedCard.keywordsKr.map((keyword, idx) => (
                    <View key={idx} style={styles.keywordBadge}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.cardMeaning}>{selectedCard.meaningKr}</Text>
                
                {selectedMemo && (
                  <View style={styles.memoContainer}>
                    <View style={styles.memoHeader}>
                      <Icon name="edit" size={14} color="#d4af37" />
                      <Text style={styles.memoLabel}>메모</Text>
                    </View>
                    <Text style={styles.memoText}>{selectedMemo}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 시간별 메모 요약 */}
        {Object.keys(dailyTarotSave.memos || {}).length > 0 && (
          <View style={styles.memosContainer}>
            <Text style={styles.memosTitle}>시간별 기록</Text>
            {Object.entries(dailyTarotSave.memos || {}).map(([hour, memo]) => (
              <TouchableOpacity
                key={hour}
                style={styles.memoItem}
                onPress={() => handleCardPress(parseInt(hour))}
              >
                <Text style={styles.memoTime}>{formatHour(parseInt(hour))}</Text>
                <Text style={styles.memoPreview} numberOfLines={2}>{memo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// components/SavedSpreadViewer.tsx - 저장된 스프레드 뷰어
interface SavedSpreadViewerProps {
  savedSpread: SavedSpread;
  onBack: () => void;
}

const SavedSpreadViewer = ({ savedSpread, onBack }: SavedSpreadViewerProps) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const handleCardPress = (index: number) => {
    setSelectedCardIndex(selectedCardIndex === index ? null : index);
  };

  const selectedSpreadCard = selectedCardIndex !== null ? savedSpread.cards[selectedCardIndex] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f3a" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="chevron-left" size={24} color="#d4af37" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{savedSpread.title}</Text>
          <Text style={styles.headerSubtitle}>{savedSpread.spreadName}</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 스프레드 정보 */}
        <View style={styles.spreadInfoContainer}>
          <View style={styles.spreadInfoHeader}>
            <Icon name="layout" size={20} color="#d4af37" />
            <Text style={styles.spreadInfoTitle}>스프레드 정보</Text>
          </View>
          <Text style={styles.spreadDate}>
            {formatKoreanDate(savedSpread.date)}
          </Text>
          <View style={styles.spreadTypeBadge}>
            <Text style={styles.spreadTypeText}>{savedSpread.spreadName}</Text>
          </View>
        </View>

        {/* 스프레드 레이아웃 */}
        <View style={styles.spreadLayoutContainer}>
          <Text style={styles.spreadLayoutTitle}>카드 배치</Text>
          <View style={styles.spreadLayout}>
            {savedSpread.cards.map((spreadCard, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.spreadCardPosition,
                  {
                    left: `${spreadCard.position.x}%`,
                    top: `${spreadCard.position.y}%`,
                  },
                  selectedCardIndex === index && styles.selectedSpreadCard,
                ]}
                onPress={() => handleCardPress(index)}
              >
                <Image
                  source={{ uri: spreadCard.card.imageUrl }}
                  style={styles.spreadCardImage}
                  defaultSource={require('../assets/card-back.png')}
                />
                <Text style={styles.positionLabel}>
                  {spreadCard.position.nameKr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 선택된 카드 상세 */}
        {selectedSpreadCard && (
          <View style={styles.cardDetailContainer}>
            <View style={styles.cardDetailHeader}>
              <Text style={styles.cardDetailTitle}>
                {selectedSpreadCard.position.nameKr} - {selectedSpreadCard.card.nameKr}
              </Text>
              <Text style={styles.cardDetailSubtitle}>{selectedSpreadCard.card.name}</Text>
            </View>

            <View style={styles.cardDetailContent}>
              <Image
                source={{ uri: selectedSpreadCard.card.imageUrl }}
                style={styles.cardDetailImage}
                defaultSource={require('../assets/card-back.png')}
              />
              
              <View style={styles.cardDetailInfo}>
                <View style={styles.positionMeaning}>
                  <Text style={styles.positionMeaningTitle}>위치 의미</Text>
                  <Text style={styles.positionMeaningText}>
                    {selectedSpreadCard.position.descriptionKr}
                  </Text>
                </View>

                <View style={styles.keywordsContainer}>
                  {selectedSpreadCard.card.keywordsKr.map((keyword, idx) => (
                    <View key={idx} style={styles.keywordBadge}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
                
                <Text style={styles.cardMeaning}>{selectedSpreadCard.card.meaningKr}</Text>

                {selectedSpreadCard.interpretation && (
                  <View style={styles.interpretationContainer}>
                    <Text style={styles.interpretationTitle}>해석</Text>
                    <Text style={styles.interpretationText}>
                      {selectedSpreadCard.interpretation}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 전체 인사이트 */}
        <View style={styles.insightsContainer}>
          <View style={styles.insightsHeader}>
            <Icon name="sparkles" size={20} color="#d4af37" />
            <Text style={styles.insightsTitle}>전체 인사이트</Text>
          </View>
          <Text style={styles.insightsText}>{savedSpread.insights}</Text>
        </View>

        {/* 카드 목록 */}
        <View style={styles.cardListContainer}>
          <Text style={styles.cardListTitle}>모든 카드</Text>
          {savedSpread.cards.map((spreadCard, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cardListItem}
              onPress={() => handleCardPress(index)}
            >
              <Image
                source={{ uri: spreadCard.card.imageUrl }}
                style={styles.cardListImage}
                defaultSource={require('../assets/card-back.png')}
              />
              <View style={styles.cardListInfo}>
                <Text style={styles.cardListPosition}>
                  {spreadCard.position.nameKr}
                </Text>
                <Text style={styles.cardListName}>
                  {spreadCard.card.nameKr}
                </Text>
                <Text style={styles.cardListMeaning} numberOfLines={2}>
                  {spreadCard.card.meaningKr}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f3a',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(212, 175, 55, 0.8)',
    marginTop: 2,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },

  // 컨텐츠
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // 인사이트
  insightsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  insightsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },

  // 24시간 카드 (일일 타로용)
  cardsContainer: {
    marginBottom: 24,
  },
  cardsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  hourlyCardContainer: {
    width: '15%',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedCardContainer: {
    transform: [{ scale: 1.1 }],
  },
  hourlyCard: {
    position: 'relative',
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  hourlyCardImage: {
    width: '100%',
    height: '100%',
  },
  memoIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#d4af37',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'center',
  },

  // 카드 상세
  cardDetailContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cardDetailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardDetailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  cardDetailSubtitle: {
    fontSize: 14,
    color: '#d4af37',
    marginTop: 4,
    textAlign: 'center',
  },
  cardDetailContent: {
    flexDirection: 'row',
    gap: 16,
  },
  cardDetailImage: {
    width: 120,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d4af37',
  },
  cardDetailInfo: {
    flex: 1,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  keywordBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d4af37',
  },
  cardMeaning: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },

  // 메모 (일일 타로용)
  memoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  memoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d4af37',
    marginLeft: 4,
  },
  memoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  // 시간별 메모 목록
  memosContainer: {
    marginBottom: 24,
  },
  memosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  memoItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  memoTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: 8,
  },
  memoPreview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  // 스프레드 정보
  spreadInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  spreadInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spreadInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  spreadDate: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  spreadTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  spreadTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d4af37',
  },

  // 스프레드 레이아웃
  spreadLayoutContainer: {
    marginBottom: 24,
  },
  spreadLayoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  spreadLayout: {
    position: 'relative',
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  spreadCardPosition: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -25 }, { translateY: -37.5 }],
  },
  selectedSpreadCard: {
    transform: [{ translateX: -25 }, { translateY: -37.5 }, { scale: 1.1 }],
  },
  spreadCardImage: {
    width: 50,
    height: 75,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  positionLabel: {
    fontSize: 10,
    color: '#d4af37',
    marginTop: 4,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // 위치 의미
  positionMeaning: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  positionMeaningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: 6,
  },
  positionMeaningText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },

  // 해석
  interpretationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  // 카드 목록
  cardListContainer: {
    marginBottom: 24,
  },
  cardListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  cardListItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardListImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginRight: 16,
  },
  cardListInfo: {
    flex: 1,
  },
  cardListPosition: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: 4,
  },
  cardListName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardListMeaning: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
});

export { DailyTarotViewer, SavedSpreadViewer };