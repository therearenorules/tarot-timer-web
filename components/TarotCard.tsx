// components/TarotCard.tsx - 타로 카드 이미지 컴포넌트
import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TarotCard as TarotCardType } from '../utils/tarotData';
import { Icon } from './Icon';
import { TarotCardBack } from './TarotCardBack';

interface TarotCardProps {
  card: TarotCardType | null;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  onPress?: () => void;
  showBack?: boolean;
}

export const TarotCardComponent: React.FC<TarotCardProps> = ({ 
  card, 
  size = 'medium', 
  showText = true,
  onPress,
  showBack = false
}) => {
  const [imageError, setImageError] = useState(false);

  const getImageSize = () => {
    // 실제 타로 카드 비율 0.596 (1144x1919)에 맞게 조정
    const aspectRatio = 0.596;
    switch (size) {
      case 'small':
        const smallHeight = 100;
        return { width: Math.round(smallHeight * aspectRatio), height: smallHeight };
      case 'medium':
        const mediumHeight = 200;
        return { width: Math.round(mediumHeight * aspectRatio), height: mediumHeight };
      case 'large':
        const largeHeight = 300;
        return { width: Math.round(largeHeight * aspectRatio), height: largeHeight };
      default:
        const defaultHeight = 200;
        return { width: Math.round(defaultHeight * aspectRatio), height: defaultHeight };
    }
  };

  const imageSize = getImageSize();

  const handleImageError = () => {
    console.warn(`Failed to load image for card: ${card?.nameKr || 'Unknown'}`);
    setImageError(true);
  };

  // 카드 뒷면 표시하거나 카드가 없는 경우
  if (showBack || !card) {
    const CardBackContent = (
      <View style={[styles.cardContainer, { width: Math.floor(imageSize.width + 20) }]}>
        <TarotCardBack width={imageSize.width} height={imageSize.height} />
        {showText && !card && (
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardName}>카드를 뽑아보세요</Text>
            <Text style={styles.cardNameEn}>(Draw a Card)</Text>
          </View>
        )}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} style={styles.touchable}>
          {CardBackContent}
        </TouchableOpacity>
      );
    }

    return CardBackContent;
  }

  const CardContent = (
    <View style={[styles.cardContainer, { width: Math.floor(imageSize.width + 20) }]}>
      <View style={[styles.cardImageContainer, imageSize]}>
        {imageError ? (
          // 이미지 로딩 실패 시 대체 컨텐츠
          <View style={[styles.cardImage, imageSize, styles.errorContainer]}>
            <Icon name="help-circle" size={32} color="#f4d03f" />
            <Text style={styles.errorText}>이미지 로드 실패</Text>
          </View>
        ) : (
          <Image
            source={card.imageUrl}
            style={[styles.cardImage, imageSize]}
            resizeMode="contain"
            onError={handleImageError}
            onLoadStart={() => setImageError(false)}
          />
        )}
        
        {!imageError && (
          <View style={styles.cardOverlay}>
            <Icon name="sparkles" size={16} color="#f4d03f" />
          </View>
        )}
      </View>
      
      {showText && (
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardName} numberOfLines={2}>
            {card.nameKr}
          </Text>
          <Text style={styles.cardNameEn} numberOfLines={1}>
            ({card.name})
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  touchable: {
    margin: 5,
  },
  cardContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(26, 22, 37, 0.7)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    elevation: 4,
    shadowColor: '#f4d03f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  cardImage: {
    borderRadius: 12,
  },
  cardOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
  },
  cardTextContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f4d03f',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardNameEn: {
    fontSize: 12,
    color: '#d4b8ff',
    textAlign: 'center',
  },
  
  // 오류 처리 스타일
  errorContainer: {
    backgroundColor: 'rgba(45, 27, 71, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.5)',
    borderStyle: 'dashed',
  },
  errorText: {
    fontSize: 10,
    color: '#f4d03f',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default TarotCardComponent;