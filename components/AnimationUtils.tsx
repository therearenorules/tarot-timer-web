import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { AnimationDuration } from './DesignSystem';

// 🎬 애니메이션 유틸리티 시스템
// React Native Animated API 기반 고품질 애니메이션

// 📏 애니메이션 값 타입들
export type AnimationConfig = {
  duration?: number;
  delay?: number;
  easing?: (value: number) => number;
  useNativeDriver?: boolean;
};

// 🎭 기본 애니메이션 설정들
export const DefaultAnimations = {
  // 부드러운 스프링
  spring: {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  },
  
  // 빠른 전환
  fastTransition: {
    duration: AnimationDuration.fast,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  },
  
  // 일반 전환
  normalTransition: {
    duration: AnimationDuration.normal,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  
  // 부드러운 전환
  smoothTransition: {
    duration: AnimationDuration.slow,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

// 🎯 터치 피드백 훅
export const useTouchFeedback = (config?: AnimationConfig) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  
  const animationConfig = {
    duration: AnimationDuration.fast,
    useNativeDriver: true,
    ...config,
  };
  
  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      ...DefaultAnimations.spring,
    }).start();
  };
  
  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      ...DefaultAnimations.spring,
    }).start();
  };
  
  const animatedStyle = {
    transform: [{ scale: scaleValue }],
  };
  
  return {
    onPressIn,
    onPressOut,
    animatedStyle,
  };
};

// ✨ 페이드 인 애니메이션 훅
export const useFadeIn = (config?: AnimationConfig & { delay?: number }) => {
  const opacityValue = useRef(new Animated.Value(0)).current;
  
  const animationConfig = {
    duration: AnimationDuration.normal,
    delay: 0,
    useNativeDriver: true,
    ...config,
  };
  
  useEffect(() => {
    const animation = Animated.timing(opacityValue, {
      toValue: 1,
      ...animationConfig,
    });
    
    if (animationConfig.delay > 0) {
      Animated.sequence([
        Animated.delay(animationConfig.delay),
        animation,
      ]).start();
    } else {
      animation.start();
    }
  }, []);
  
  const animatedStyle = {
    opacity: opacityValue,
  };
  
  return { animatedStyle };
};

// 🎢 슬라이드 인 애니메이션 훅
export const useSlideIn = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  config?: AnimationConfig & { distance?: number; delay?: number }
) => {
  const translateValue = useRef(new Animated.Value(config?.distance || 50)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  
  const animationConfig = {
    duration: AnimationDuration.slow,
    delay: 0,
    useNativeDriver: true,
    ...config,
  };
  
  useEffect(() => {
    const animations = Animated.parallel([
      Animated.timing(translateValue, {
        toValue: 0,
        ...animationConfig,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        ...animationConfig,
      }),
    ]);
    
    if (animationConfig.delay > 0) {
      Animated.sequence([
        Animated.delay(animationConfig.delay),
        animations,
      ]).start();
    } else {
      animations.start();
    }
  }, []);
  
  let transform;
  switch (direction) {
    case 'up':
      transform = [{ translateY: translateValue }];
      break;
    case 'down':
      transform = [{ translateY: translateValue.interpolate({
        inputRange: [0, 50],
        outputRange: [0, -50],
      }) }];
      break;
    case 'left':
      transform = [{ translateX: translateValue }];
      break;
    case 'right':
      transform = [{ translateX: translateValue.interpolate({
        inputRange: [0, 50],
        outputRange: [0, -50],
      }) }];
      break;
    default:
      transform = [{ translateY: translateValue }];
  }
  
  const animatedStyle = {
    opacity: opacityValue,
    transform,
  };
  
  return { animatedStyle };
};

// 💫 펄스 애니메이션 훅 (로딩용)
export const usePulse = (config?: AnimationConfig) => {
  const pulseValue = useRef(new Animated.Value(1)).current;
  
  const animationConfig = {
    duration: 1500,
    useNativeDriver: true,
    ...config,
  };
  
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 0.7,
          duration: animationConfig.duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: animationConfig.useNativeDriver,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: animationConfig.duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: animationConfig.useNativeDriver,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, []);
  
  const animatedStyle = {
    opacity: pulseValue,
  };
  
  return { animatedStyle };
};

// 🌟 반짝임 애니메이션 훅
export const useSparkle = (config?: AnimationConfig) => {
  const sparkleValue = useRef(new Animated.Value(0)).current;
  
  const animationConfig = {
    duration: 2000,
    useNativeDriver: true,
    ...config,
  };
  
  useEffect(() => {
    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleValue, {
          toValue: 1,
          duration: animationConfig.duration / 3,
          easing: Easing.out(Easing.quad),
          useNativeDriver: animationConfig.useNativeDriver,
        }),
        Animated.timing(sparkleValue, {
          toValue: 0.3,
          duration: animationConfig.duration / 3,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: animationConfig.useNativeDriver,
        }),
        Animated.timing(sparkleValue, {
          toValue: 0,
          duration: animationConfig.duration / 3,
          easing: Easing.in(Easing.quad),
          useNativeDriver: animationConfig.useNativeDriver,
        }),
      ])
    );
    
    sparkleAnimation.start();
    
    return () => sparkleAnimation.stop();
  }, []);
  
  const animatedStyle = {
    opacity: sparkleValue,
  };
  
  return { animatedStyle };
};

// 🎪 회전 애니메이션 훅
export const useRotation = (config?: AnimationConfig & { continuous?: boolean }) => {
  const rotationValue = useRef(new Animated.Value(0)).current;
  
  const animationConfig = {
    duration: 3000,
    continuous: false,
    useNativeDriver: true,
    ...config,
  };
  
  useEffect(() => {
    const rotationAnimation = animationConfig.continuous
      ? Animated.loop(
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: animationConfig.duration,
            easing: Easing.linear,
            useNativeDriver: animationConfig.useNativeDriver,
          })
        )
      : Animated.timing(rotationValue, {
          toValue: 1,
          duration: animationConfig.duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: animationConfig.useNativeDriver,
        });
    
    rotationAnimation.start();
    
    return () => rotationAnimation.stop();
  }, []);
  
  const animatedStyle = {
    transform: [
      {
        rotate: rotationValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };
  
  return { animatedStyle };
};

// 🎈 호버 리프트 효과 훅 (웹에서 유용)
export const useHoverLift = (config?: AnimationConfig) => {
  const translateY = useRef(new Animated.Value(0)).current;
  
  const animationConfig = {
    duration: AnimationDuration.normal,
    useNativeDriver: true,
    ...config,
  };
  
  const onHoverIn = () => {
    Animated.spring(translateY, {
      toValue: -4,
      ...DefaultAnimations.spring,
    }).start();
  };
  
  const onHoverOut = () => {
    Animated.spring(translateY, {
      toValue: 0,
      ...DefaultAnimations.spring,
    }).start();
  };
  
  const animatedStyle = {
    transform: [{ translateY }],
  };
  
  return {
    onHoverIn,
    onHoverOut,
    animatedStyle,
  };
};

// 🌊 물결 효과 애니메이션 (순차적 페이드인용)
export const useStaggeredFadeIn = (
  itemCount: number,
  config?: AnimationConfig & { staggerDelay?: number }
) => {
  const opacityValues = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;
  
  const animationConfig = {
    duration: AnimationDuration.normal,
    staggerDelay: 100,
    useNativeDriver: true,
    ...config,
  };
  
  useEffect(() => {
    const animations = opacityValues.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: animationConfig.duration,
        delay: index * animationConfig.staggerDelay,
        useNativeDriver: animationConfig.useNativeDriver,
      })
    );
    
    Animated.parallel(animations).start();
  }, []);
  
  const getAnimatedStyle = (index: number) => ({
    opacity: opacityValues[index],
  });
  
  return { getAnimatedStyle };
};

// 🎨 색상 전환 애니메이션 (그림자 색상 변화 등)
export const useColorTransition = (
  fromColor: string,
  toColor: string,
  config?: AnimationConfig & { trigger?: boolean }
) => {
  const colorValue = useRef(new Animated.Value(0)).current;
  
  const animationConfig = {
    duration: AnimationDuration.normal,
    trigger: false,
    useNativeDriver: false, // 색상 애니메이션은 네이티브 드라이버 사용 불가
    ...config,
  };
  
  useEffect(() => {
    if (animationConfig.trigger) {
      Animated.timing(colorValue, {
        toValue: 1,
        ...animationConfig,
      }).start();
    } else {
      Animated.timing(colorValue, {
        toValue: 0,
        ...animationConfig,
      }).start();
    }
  }, [animationConfig.trigger]);
  
  const animatedColor = colorValue.interpolate({
    inputRange: [0, 1],
    outputRange: [fromColor, toColor],
  });
  
  return { animatedColor };
};

// 🎯 조합형 애니메이션 - 카드 진입 효과
export const useCardEntrance = (delay = 0) => {
  const { animatedStyle: fadeStyle } = useFadeIn({ delay });
  const { animatedStyle: slideStyle } = useSlideIn('up', { 
    delay, 
    distance: 30 
  });
  
  // 두 애니메이션을 합쳐서 반환
  const combinedStyle = {
    opacity: fadeStyle.opacity,
    transform: slideStyle.transform,
  };
  
  return { animatedStyle: combinedStyle };
};

// 📦 애니메이션 유틸리티 함수들
export const AnimationUtils = {
  // 시퀀스 애니메이션 생성
  createSequence: (animations: Animated.CompositeAnimation[]) => {
    return Animated.sequence(animations);
  },
  
  // 병렬 애니메이션 생성
  createParallel: (animations: Animated.CompositeAnimation[]) => {
    return Animated.parallel(animations);
  },
  
  // 지연 생성
  createDelay: (duration: number) => {
    return Animated.delay(duration);
  },
  
  // 스프링 애니메이션 생성
  createSpring: (value: Animated.Value, toValue: number, config?: any) => {
    return Animated.spring(value, {
      toValue,
      ...DefaultAnimations.spring,
      ...config,
    });
  },
  
  // 타이밍 애니메이션 생성
  createTiming: (value: Animated.Value, toValue: number, config?: any) => {
    return Animated.timing(value, {
      toValue,
      ...DefaultAnimations.normalTransition,
      ...config,
    });
  },
};