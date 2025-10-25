/**
 * 최적화된 이미지 컴포넌트
 * ✅ expo-image로 업그레이드: 자동 캐싱, 메모리 관리, 성능 향상
 * - 자동 메모리 캐싱
 * - 디스크 캐싱 지원
 * - 스무스한 트랜지션
 * - 메모리 압력 자동 관리
 */

import React, { useEffect, memo } from 'react';
import { useSafeState } from '../hooks/useSafeState';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  ImageResizeMode,
  ImageSourcePropType
} from 'react-native';
import { Image } from 'expo-image';

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
  const [loading, setLoading] = useSafeState(true);
  const [error, setError] = useSafeState(false);
  const [shouldLoad, setShouldLoad] = useSafeState(!lazy);

  // ✅ expo-image는 자동 캐싱, 프리로딩 불필요

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
    // expo-image는 자동으로 페이드 효과 제공
    onLoad?.();
  };

  const handleError = (error: any) => {
    // expo-image는 자동 재시도 기능 내장
    setLoading(false);
    setError(true);
    onError?.();
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

      <Image
        source={source}
        style={style}
        contentFit={resizeMode}
        transition={fadeDuration}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        // ✅ expo-image 자동 캐싱 설정
        cachePolicy="memory-disk"
        // 우선순위 기반 로딩
        priority={priority}
        // 블러 효과 (선택)
        blurRadius={blurRadius}
        // 틴트 컬러 (선택)
        tintColor={tintColor}
        // placeholder 블러 효과
        placeholderContentFit="cover"
      />
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
  // ✅ expo-image가 자동으로 페이드 효과 처리
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;