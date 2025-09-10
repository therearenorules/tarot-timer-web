// components/TarotCard.tsx - 타로 카드 이미지 컴포넌트
import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  const getImageSize = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 90 };
      case 'medium':
        return { width: 120, height: 180 };
      case 'large':
        return { width: 180, height: 270 };
      default:
        return { width: 120, height: 180 };
    }
  };

  const imageSize = getImageSize();

  // 카드 뒷면 표시하거나 카드가 없는 경우
  if (showBack || !card) {
    const CardBackContent = (
      <View style={[styles.cardContainer, { width: imageSize.width + 20 }]}>
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
    <View style={[styles.cardContainer, { width: imageSize.width + 20 }]}>
      <View style={[styles.cardImageContainer, imageSize]}>
        <Image
          source={{ uri: card.imageUrl }}
          style={[styles.cardImage, imageSize]}
          resizeMode="cover"
        />
        <View style={styles.cardOverlay}>
          <Icon name="sparkles" size={16} color="#f4d03f" />
        </View>
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
    backgroundColor: 'rgba(26, 22, 37, 0.9)',
    borderRadius: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: '#d4af37',
    elevation: 8,
    shadowColor: '#f4d03f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f4d03f',
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
});

export default TarotCardComponent;