/**
 * 최적화된 이미지 컴포넌트
 * 캐싱, 프리로딩, 레이지 로딩, 플레이스홀더 지원
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
  ImageStyle,
  ViewStyle,
  ImageResizeMode,
  ImageSourcePropType
} from 'react-native';
import { isImageCached, imageCacheUtils } from '../utils/imageCache';

interface OptimizedImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: ImageResizeMode;
  placeholder?: React.ReactNode;
  showLoader?: boolean;
  fadeDuration?: number;
  onLoad?: () => void;
  onError?: () => void;
  onLoadStart?: () => void;
  priority?: 'low' | 'normal' | 'high';
  lazy?: boolean;
  threshold?: number; // 레이지 로딩 임계값
  cacheKey?: string;
  blurRadius?: number;
  tintColor?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  source,
  style,
  containerStyle,
  resizeMode = 'cover',
  placeholder,
  showLoader = true,
  fadeDuration = 100, // 페이드 시간 최소화 (150ms → 100ms)
  onLoad,
  onError,
  onLoadStart,
  priority = 'normal',
  lazy = false,
  threshold = 100,
  cacheKey,
  blurRadius,
  tintColor,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [retryCount, setRetryCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageRef = useRef<Image>(null);
  const maxRetries = 2; // 최대 재시도 횟수

  // 캐시 확인
  const isCached = isImageCached(source);

  useEffect(() => {
    if (isCached) {
      setLoading(false);
      fadeAnim.setValue(1); // 캐시된 이미지는 즉시 표시
    }
  }, [isCached, fadeAnim]);

  // 즉시 프리로딩 시작 (우선순위 반영)
  useEffect(() => {
    if (!isCached) {
      // 모든 이미지 즉시 프리로딩 (우선순위 전달)
      imageCacheUtils.preloadImage(source, priority);
    }
  }, [source, priority, isCached]);


  // 레이지 로딩 (필요한 경우)
  // ✅ 컴포넌트 언마운트 시 애니메이션 정리 (메모리 누수 방지)
  useEffect(() => {
    return () => {
      // 애니메이션 정리
      fadeAnim.stopAnimation();
      fadeAnim.setValue(0);
    };
  }, [fadeAnim]);

  // 레이지 로딩 (필요한 경우)
  useEffect(() => {
    if (lazy && !shouldLoad) {
      // 여기서는 간단히 타이머로 구현, 실제로는 Intersection Observer 사용
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, threshold);

      return () => clearTimeout(timer);
    }
  }, [lazy, shouldLoad, threshold]);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);

    // ✅ 캐시된 이미지는 애니메이션 스킵 (메모리 절약)
    if (isCached) {
      fadeAnim.setValue(1);
      onLoad?.();
      return;
    }

    // 새 이미지만 페이드 인 애니메이션
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: fadeDuration,
      useNativeDriver: true,
    });

    animation.start(() => {
      onLoad?.();
    });
  };

  const handleError = () => {
    // 재시도 로직
    if (retryCount < maxRetries) {
      console.log(`Image load failed, retrying... (${retryCount + 1}/${maxRetries})`);
      setRetryCount(prev => prev + 1);
      setLoading(true);
      setError(false);

      // 잠시 대기 후 재시도
      setTimeout(() => {
        if (imageRef.current) {
          setLoading(true);
        }
      }, 500 * (retryCount + 1)); // 점진적 백오프
    } else {
      setLoading(false);
      setError(true);
      onError?.();
    }
  };

  // 로딩 중 플레이스홀더
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <View style={[styles.placeholder, style]}>
        {showLoader && (
          <ActivityIndicator
            size="small"
            color="#f4d03f"
            style={styles.loader}
          />
        )}
      </View>
    );
  };

  // 에러 상태 플레이스홀더
  const renderError = () => (
    <View style={[styles.errorContainer, style]}>
      <View style={styles.errorIndicator} />
    </View>
  );

  if (!shouldLoad) {
    return <View style={[containerStyle, style]}>{renderPlaceholder()}</View>;
  }

  if (error) {
    return <View style={containerStyle}>{renderError()}</View>;
  }

  return (
    <View style={containerStyle}>
      {loading && renderPlaceholder()}

      <Animated.View
        style={[
          loading ? styles.hiddenImage : styles.visibleImage,
          { opacity: fadeAnim }
        ]}
      >
        <Image
          ref={imageRef}
          source={source}
          style={style}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          blurRadius={blurRadius}
          fadeDuration={0} // 커스텀 페이드 애니메이션 사용
          progressiveRenderingEnabled={Platform.OS === 'android'}
          tintColor={tintColor}
          // 성능 최적화 속성
          {...(Platform.OS === 'android' && {
            renderToHardwareTextureAndroid: true
          })}
          {...(Platform.OS === 'ios' && {
            shouldRasterizeIOS: true
          })}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(26, 22, 37, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.2)',
    borderStyle: 'dashed',
  },
  loader: {
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(45, 27, 71, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 208, 63, 0.3)',
    borderStyle: 'dashed',
  },
  errorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderWidth: 2,
    borderColor: '#f44336',
  },
  hiddenImage: {
    position: 'absolute',
    opacity: 0,
  },
  visibleImage: {
    opacity: 1,
  },
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;