// components/TarotCard.tsx - 타로 카드 이미지 컴포넌트
import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TarotCard as TarotCardType } from '../utils/tarotData';
import { useTarotI18n } from '../hooks/useTarotI18n';
import { Icon } from './Icon';
import { TarotCardBack } from './TarotCardBack';

interface TarotCardProps {
  card: TarotCardType | null;
  size?: 'tiny' | 'tiny-small' | 'small' | 'small-medium' | 'medium' | 'medium-large' | 'large' | 'extra-large';
  showText?: boolean;
  onPress?: () => void;
  showBack?: boolean;
  noBorder?: boolean;
}

export const TarotCardComponent: React.FC<TarotCardProps> = ({ 
  card, 
  size = 'medium', 
  showText = true,
  onPress,
  showBack = false,
  noBorder = false
}) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  const { getCardName, isEnglish } = useTarotI18n();

  const getImageSize = () => {
    // 실제 타로 카드 비율 0.596 (1144x1919)에 맞게 조정
    const aspectRatio = 0.596;
    switch (size) {
      case 'tiny':
        const tinyHeight = Math.round(80 * 1.02); // 2% 증가
        return { width: Math.round(tinyHeight * aspectRatio), height: tinyHeight };
      case 'tiny-small':
        const tinySmallHeight = Math.round(90 * 1.02); // tiny와 small의 중간 크기
        return { width: Math.round(tinySmallHeight * aspectRatio), height: tinySmallHeight };
      case 'small':
        const smallHeight = Math.round(100 * 1.02); // 2% 증가
        return { width: Math.round(smallHeight * aspectRatio), height: smallHeight };
      case 'small-medium':
        const smallMediumHeight = Math.round(150 * 1.02); // 2% 증가
        return { width: Math.round(smallMediumHeight * aspectRatio), height: smallMediumHeight };
      case 'medium':
        const mediumHeight = Math.round(200 * 1.02); // 2% 증가
        return { width: Math.round(mediumHeight * aspectRatio), height: mediumHeight };
      case 'medium-large':
        const mediumLargeHeight = Math.round(250 * 1.02); // 2% 증가
        return { width: Math.round(mediumLargeHeight * aspectRatio), height: mediumLargeHeight };
      case 'large':
        const largeHeight = Math.round(300 * 1.02); // 2% 증가
        return { width: Math.round(largeHeight * aspectRatio), height: largeHeight };
      case 'extra-large':
        const extraLargeHeight = Math.round(350 * 1.02); // 2% 증가
        return { width: Math.round(extraLargeHeight * aspectRatio), height: extraLargeHeight };
      default:
        const defaultHeight = Math.round(200 * 1.02); // 2% 증가
        return { width: Math.round(defaultHeight * aspectRatio), height: defaultHeight };
    }
  };

  const imageSize = getImageSize();

  const handleImageError = () => {
    console.warn(`Failed to load image for card: ${card ? getCardName(card) : 'Unknown'}`);
    setImageError(true);
  };

  // 카드 뒷면 표시하거나 카드가 없는 경우
  if (showBack || !card) {
    const CardBackContent = (
      <View style={[styles.cardContainer, { width: Math.floor(imageSize.width + 6) }]}>
        <TarotCardBack width={imageSize.width} height={imageSize.height} />
        {showText && !card && (
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardName}>{t('cards.drawCard')}</Text>
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
    <View style={[
      styles.cardContainer, 
      { width: Math.floor(imageSize.width + (noBorder ? 0 : 6)) },
      noBorder && styles.noBorderContainer
    ]}>
      <View style={[styles.cardImageContainer, imageSize]}>
        {imageError ? (
          // 이미지 로딩 실패 시 대체 컨텐츠
          <View style={[styles.cardImage, imageSize, styles.errorContainer]}>
            <Icon name="help-circle" size={32} color="#f4d03f" />
            <Text style={styles.errorText}>{t('cards.imageLoadError')}</Text>
          </View>
        ) : (
          <Image
            source={card.imageUrl}
            style={[styles.cardImage, imageSize]}
            resizeMode="cover"
            onError={handleImageError}
            onLoadStart={() => setImageError(false)}
            // 고화질 렌더링을 위한 속성 추가
            fadeDuration={0}
            blurRadius={0}
            progressiveRenderingEnabled={true}
            loadingIndicatorSource={{ uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }}
          />
        )}
      </View>
      
      {showText && (
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardName} numberOfLines={2}>
            {getCardName(card)}
          </Text>
          {!isEnglish && (
            <Text style={styles.cardNameEn} numberOfLines={1}>
              ({card.name})
            </Text>
          )}
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
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    elevation: 4,
    shadowColor: '#f4d03f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  noBorderContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    padding: 0,
    borderRadius: 8,
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
    // 고화질 렌더링을 위한 컨테이너 최적화
    backgroundColor: 'transparent',
    shouldRasterizeIOS: true,
    renderToHardwareTextureAndroid: true,
    ...(Platform.OS === 'web' && {
      WebkitOptimizeLegibility: 'optimizeQuality',
      imageRendering: 'high-quality',
    }),
  },
  cardImage: {
    borderRadius: 12,
    // 고화질 렌더링을 위한 스타일 최적화
    backfaceVisibility: 'hidden',
    transform: [{ perspective: 1000 }],
    ...(Platform.OS === 'web' && {
      imageRendering: 'crisp-edges',
      WebkitBackfaceVisibility: 'hidden',
      WebkitTransform: 'translate3d(0, 0, 0)',
    }),
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