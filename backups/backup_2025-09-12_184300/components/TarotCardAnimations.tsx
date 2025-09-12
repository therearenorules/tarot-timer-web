import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { AnimationDuration } from './DesignSystem';

// 🎴 타로 카드 전용 애니메이션 시스템

// 카드 뒤집기 애니메이션 (3D 효과)
export const useCardFlip = (config?: { duration?: number; delay?: number }) => {
  const flipValue = useRef(new Animated.Value(0)).current;
  
  const animationConfig = {
    duration: AnimationDuration.slow,
    delay: 0,
    ...config,
  };
  
  const flipToFront = () => {
    Animated.timing(flipValue, {
      toValue: 1,
      duration: animationConfig.duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  };
  
  const flipToBack = () => {
    Animated.timing(flipValue, {
      toValue: 0,
      duration: animationConfig.duration,
      easing: Easing.in(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  };
  
  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['180deg', '0deg'],
        }),
      },
    ],
  };
  
  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };
  
  return {
    flipToFront,
    flipToBack,
    frontAnimatedStyle,
    backAnimatedStyle,
    flipValue,
  };
};

// 카드 셔플 애니메이션 (여러 카드 순차 애니메이션)
export const useCardShuffle = (cardCount: number, config?: { staggerDelay?: number }) => {
  const animationConfig = {
    staggerDelay: 50,
    ...config,
  };
  
  const shuffleValues = useRef(
    Array.from({ length: cardCount }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(1),
    }))
  ).current;
  
  const startShuffle = () => {
    const animations = shuffleValues.map((values, index) => {
      const randomX = (Math.random() - 0.5) * 100;
      const randomY = (Math.random() - 0.5) * 50;
      const randomRotate = (Math.random() - 0.5) * 30;
      
      return Animated.sequence([
        Animated.delay(index * animationConfig.staggerDelay),
        Animated.parallel([
          Animated.timing(values.translateX, {
            toValue: randomX,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(values.translateY, {
            toValue: randomY,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(values.rotate, {
            toValue: randomRotate,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(values.scale, {
            toValue: 0.9,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(values.translateX, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(values.translateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(values.rotate, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(values.scale, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
        ]),
      ]);
    });
    
    Animated.parallel(animations).start();
  };
  
  const getCardAnimatedStyle = (index: number) => {
    if (!shuffleValues[index]) return {};
    
    return {
      transform: [
        { translateX: shuffleValues[index].translateX },
        { translateY: shuffleValues[index].translateY },
        { 
          rotate: shuffleValues[index].rotate.interpolate({
            inputRange: [-30, 30],
            outputRange: ['-30deg', '30deg'],
          })
        },
        { scale: shuffleValues[index].scale },
      ],
    };
  };
  
  return {
    startShuffle,
    getCardAnimatedStyle,
  };
};

// 카드 드로우 애니메이션 (카드가 나타나는 효과)
export const useCardDraw = (config?: { delay?: number; distance?: number }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const rotate = useRef(new Animated.Value(-5)).current;
  
  const animationConfig = {
    delay: 0,
    distance: 50,
    ...config,
  };
  
  useEffect(() => {
    const drawAnimation = Animated.sequence([
      Animated.delay(animationConfig.delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);
    
    drawAnimation.start();
  }, []);
  
  const animatedStyle = {
    opacity,
    transform: [
      { translateY },
      { scale },
      { 
        rotate: rotate.interpolate({
          inputRange: [-5, 0],
          outputRange: ['-5deg', '0deg'],
        })
      },
    ],
  };
  
  return { animatedStyle };
};

// 카드 선택 애니메이션 (카드가 선택되었을 때)
export const useCardSelect = (isSelected: boolean) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isSelected) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1.05,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: -8,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, // glow 효과는 네이티브 드라이버 사용 불가
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isSelected]);
  
  const animatedStyle = {
    transform: [
      { scale: scaleValue },
      { translateY },
    ],
  };
  
  const glowStyle = {
    shadowOpacity: glowValue,
  };
  
  return { animatedStyle, glowStyle };
};

// 미스틱한 반짝임 효과 (카드 주변 파티클)
export const useMysticalSparkle = (config?: { particleCount?: number }) => {
  const animationConfig = {
    particleCount: 6,
    ...config,
  };
  
  const sparkles = useRef(
    Array.from({ length: animationConfig.particleCount }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;
  
  const startSparkle = () => {
    const animations = sparkles.map((sparkle, index) => {
      const delay = index * 200;
      const angle = (index / animationConfig.particleCount) * 2 * Math.PI;
      const radius = 30 + Math.random() * 20;
      const endX = Math.cos(angle) * radius;
      const endY = Math.sin(angle) * radius;
      
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sparkle.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.scale, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.translateX, {
            toValue: endX,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.translateY, {
            toValue: endY,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(sparkle.opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.scale, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });
    
    Animated.parallel(animations).start(() => {
      // 애니메이션이 끝나면 값들을 초기화
      sparkles.forEach(sparkle => {
        sparkle.opacity.setValue(0);
        sparkle.scale.setValue(0);
        sparkle.translateX.setValue(0);
        sparkle.translateY.setValue(0);
      });
    });
  };
  
  const getSparkleStyle = (index: number) => {
    if (!sparkles[index]) return { opacity: 0 };
    
    return {
      opacity: sparkles[index].opacity,
      transform: [
        { scale: sparkles[index].scale },
        { translateX: sparkles[index].translateX },
        { translateY: sparkles[index].translateY },
      ],
    };
  };
  
  return {
    startSparkle,
    getSparkleStyle,
  };
};

// 시간별 카드 그리드 웨이브 애니메이션
export const useTimeGridWave = (gridSize: number = 24) => {
  const waveValues = useRef(
    Array.from({ length: gridSize }, () => new Animated.Value(0))
  ).current;
  
  const startWave = () => {
    const animations = waveValues.map((value, index) => {
      const delay = Math.floor(index / 6) * 100 + (index % 6) * 50; // 6개씩 그룹으로 웨이브
      
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
    });
    
    Animated.parallel(animations).start();
  };
  
  const getGridItemStyle = (index: number) => {
    if (!waveValues[index]) return {};
    
    return {
      transform: [
        {
          scale: waveValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }),
        },
        {
          translateY: waveValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5],
          }),
        },
      ],
    };
  };
  
  return {
    startWave,
    getGridItemStyle,
  };
};

// 카드 교체 애니메이션 (기존 카드가 나가고 새 카드가 들어오는 효과)
export const useCardReplace = () => {
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitRotate = useRef(new Animated.Value(0)).current;
  
  const enterScale = useRef(new Animated.Value(0.8)).current;
  const enterOpacity = useRef(new Animated.Value(0)).current;
  const enterRotate = useRef(new Animated.Value(10)).current;
  
  const startReplace = () => {
    return new Promise((resolve) => {
      // 기존 카드 나가는 애니메이션
      Animated.parallel([
        Animated.timing(exitScale, {
          toValue: 0.8,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(exitRotate, {
          toValue: -10,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 새 카드 들어오는 애니메이션
        Animated.parallel([
          Animated.timing(enterScale, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(enterOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(enterRotate, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => {
          resolve(true);
        });
      });
    });
  };
  
  const exitStyle = {
    opacity: exitOpacity,
    transform: [
      { scale: exitScale },
      { 
        rotate: exitRotate.interpolate({
          inputRange: [-10, 0],
          outputRange: ['-10deg', '0deg'],
        })
      },
    ],
  };
  
  const enterStyle = {
    opacity: enterOpacity,
    transform: [
      { scale: enterScale },
      { 
        rotate: enterRotate.interpolate({
          inputRange: [0, 10],
          outputRange: ['0deg', '10deg'],
        })
      },
    ],
  };
  
  return {
    startReplace,
    exitStyle,
    enterStyle,
  };
};