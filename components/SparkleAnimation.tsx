// components/SparkleAnimation.tsx - 애니메이션 반짝임 효과
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

// Animated SVG 컴포넌트들
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SparkleAnimationProps {
  size?: number;
  intensity?: 'low' | 'medium' | 'high';
  color1?: string;
  color2?: string;
  color3?: string;
}

export const SparkleAnimation: React.FC<SparkleAnimationProps> = ({ 
  size = 100, 
  intensity = 'medium',
  color1 = '#f4d03f',
  color2 = '#d4af37', 
  color3 = '#ffffff'
}) => {
  // 애니메이션 값들
  const centerRotation = useSharedValue(0);
  const centerOpacity = useSharedValue(0.9);
  const centerScale = useSharedValue(1);
  
  const sparkle1Rotation = useSharedValue(0);
  const sparkle1Opacity = useSharedValue(0.7);
  
  const sparkle2Rotation = useSharedValue(360);
  const sparkle2Opacity = useSharedValue(0.8);
  
  const sparkle3Rotation = useSharedValue(0);
  const sparkle3Opacity = useSharedValue(0.6);
  
  const sparkle4Rotation = useSharedValue(360);
  const sparkle4Opacity = useSharedValue(0.9);
  
  const particle1Y = useSharedValue(0);
  const particle1Opacity = useSharedValue(0.5);
  
  const particle2Y = useSharedValue(0);
  const particle2Opacity = useSharedValue(0.5);
  
  const particle3Y = useSharedValue(0);
  const particle3Opacity = useSharedValue(0.5);
  
  const particle4Y = useSharedValue(0);
  const particle4Opacity = useSharedValue(0.5);
  
  const glowRadius1 = useSharedValue(30);
  const glowRadius2 = useSharedValue(40);
  const glowOpacity1 = useSharedValue(0.3);
  const glowOpacity2 = useSharedValue(0.3);

  // 애니메이션 강도에 따른 지속시간 설정
  const getDurations = () => {
    switch (intensity) {
      case 'low':
        return { rotation: 6000, opacity: 3000, movement: 4000, glow: 6000 };
      case 'high':
        return { rotation: 2000, opacity: 1000, movement: 2000, glow: 3000 };
      default: // medium
        return { rotation: 4000, opacity: 2000, movement: 3000, glow: 5000 };
    }
  };

  useEffect(() => {
    const durations = getDurations();
    
    // 중앙 큰 반짝임 - 4초 회전, 2초 투명도 변화
    centerRotation.value = withRepeat(
      withTiming(360, { 
        duration: durations.rotation, 
        easing: Easing.linear 
      }), 
      -1
    );
    
    centerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: durations.opacity / 2 }),
        withTiming(0.9, { duration: durations.opacity / 2 })
      ),
      -1
    );
    
    centerScale.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: durations.opacity / 2 }),
        withTiming(1.2, { duration: durations.opacity / 2 })
      ),
      -1
    );

    // 작은 반짝임들 - 각각 다른 속도
    sparkle1Rotation.value = withRepeat(
      withTiming(360, { 
        duration: durations.rotation * 0.75, 
        easing: Easing.linear 
      }), 
      -1
    );
    sparkle1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: durations.opacity * 0.75 }),
        withTiming(0.7, { duration: durations.opacity * 0.75 })
      ),
      -1
    );

    sparkle2Rotation.value = withRepeat(
      withTiming(0, { 
        duration: durations.rotation * 0.625, 
        easing: Easing.linear 
      }), 
      -1
    );
    sparkle2Opacity.value = withDelay(
      500, // 0.5초 지연
      withRepeat(
        withSequence(
          withTiming(0.2, { duration: durations.opacity * 0.9 }),
          withTiming(0.8, { duration: durations.opacity * 0.9 })
        ),
        -1,
        false
      )
    );

    sparkle3Rotation.value = withRepeat(
      withTiming(360, { 
        duration: durations.rotation * 0.875, 
        easing: Easing.linear 
      }), 
      -1
    );
    sparkle3Opacity.value = withDelay(
      1000, // 1초 지연
      withRepeat(
        withSequence(
          withTiming(0.1, { duration: durations.opacity * 1.1 }),
          withTiming(0.6, { duration: durations.opacity * 1.1 })
        ),
        -1,
        false
      )
    );

    sparkle4Rotation.value = withRepeat(
      withTiming(0, { 
        duration: durations.rotation * 0.7, 
        easing: Easing.linear 
      }), 
      -1
    );
    sparkle4Opacity.value = withDelay(
      1500, // 1.5초 지연
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: durations.opacity * 0.85 }),
          withTiming(0.9, { duration: durations.opacity * 0.85 })
        ),
        -1,
        false
      )
    );

    // 부유 파티클들 - 수직 이동
    particle1Y.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: durations.movement }),
        withTiming(0, { duration: durations.movement })
      ),
      -1
    );
    particle1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: durations.movement }),
        withTiming(0.5, { duration: durations.movement })
      ),
      -1
    );

    particle2Y.value = withDelay(
      800, // 0.8초 지연
      withRepeat(
        withSequence(
          withTiming(-20, { duration: durations.movement * 0.83 }),
          withTiming(0, { duration: durations.movement * 0.83 })
        ),
        -1,
        false
      )
    );
    particle2Opacity.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: durations.movement * 0.83 }),
          withTiming(0.5, { duration: durations.movement * 0.83 })
        ),
        -1,
        false
      )
    );

    particle3Y.value = withDelay(
      1200, // 1.2초 지연
      withRepeat(
        withSequence(
          withTiming(-20, { duration: durations.movement * 0.93 }),
          withTiming(0, { duration: durations.movement * 0.93 })
        ),
        -1,
        false
      )
    );
    particle3Opacity.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: durations.movement * 0.93 }),
          withTiming(0.5, { duration: durations.movement * 0.93 })
        ),
        -1,
        false
      )
    );

    particle4Y.value = withDelay(
      300, // 0.3초 지연
      withRepeat(
        withSequence(
          withTiming(-15, { duration: durations.movement * 1.07 }),
          withTiming(0, { duration: durations.movement * 1.07 })
        ),
        -1,
        false
      )
    );
    particle4Opacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: durations.movement * 1.07 }),
          withTiming(0.5, { duration: durations.movement * 1.07 })
        ),
        -1,
        false
      )
    );

    // 글로우 링들
    glowRadius1.value = withRepeat(
      withSequence(
        withTiming(35, { duration: durations.glow }),
        withTiming(30, { duration: durations.glow })
      ),
      -1
    );
    glowOpacity1.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: durations.glow }),
        withTiming(0.3, { duration: durations.glow })
      ),
      -1
    );

    glowRadius2.value = withDelay(
      1000, // 1초 지연
      withRepeat(
        withSequence(
          withTiming(45, { duration: durations.glow * 1.25 }),
          withTiming(40, { duration: durations.glow * 1.25 })
        ),
        -1,
        false
      )
    );
    glowOpacity2.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.05, { duration: durations.glow * 1.25 }),
          withTiming(0.3, { duration: durations.glow * 1.25 })
        ),
        -1,
        false
      )
    );
  }, [intensity]);

  // 애니메이션 스타일들
  const centerAnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${centerRotation.value}) scale(${centerScale.value})`,
    opacity: centerOpacity.value,
  }));

  const sparkle1AnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${sparkle1Rotation.value})`,
    opacity: sparkle1Opacity.value,
  }));

  const sparkle2AnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${sparkle2Rotation.value})`,
    opacity: sparkle2Opacity.value,
  }));

  const sparkle3AnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${sparkle3Rotation.value})`,
    opacity: sparkle3Opacity.value,
  }));

  const sparkle4AnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${sparkle4Rotation.value})`,
    opacity: sparkle4Opacity.value,
  }));

  const particle1AnimatedProps = useAnimatedProps(() => ({
    transform: `translateY(${particle1Y.value})`,
    opacity: particle1Opacity.value,
  }));

  const particle2AnimatedProps = useAnimatedProps(() => ({
    transform: `translateY(${particle2Y.value})`,
    opacity: particle2Opacity.value,
  }));

  const particle3AnimatedProps = useAnimatedProps(() => ({
    transform: `translateY(${particle3Y.value})`,
    opacity: particle3Opacity.value,
  }));

  const particle4AnimatedProps = useAnimatedProps(() => ({
    transform: `translateY(${particle4Y.value})`,
    opacity: particle4Opacity.value,
  }));

  const glow1AnimatedProps = useAnimatedProps(() => ({
    r: glowRadius1.value,
    opacity: glowOpacity1.value,
  }));

  const glow2AnimatedProps = useAnimatedProps(() => ({
    r: glowRadius2.value,
    opacity: glowOpacity2.value,
  }));

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        
        {/* 글로우 링들 */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          fill="none"
          stroke={color1}
          strokeWidth="0.5"
          animatedProps={glow1AnimatedProps}
        />
        
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          fill="none"
          stroke={color2}
          strokeWidth="0.3"
          animatedProps={glow2AnimatedProps}
        />

        {/* 중앙 큰 반짝임 */}
        <AnimatedG transform={`translate(${centerX}, ${centerY})`} animatedProps={centerAnimatedProps}>
          <Path 
            d="M0,-20 L5,-5 L20,0 L5,5 L0,20 L-5,5 L-20,0 L-5,-5 Z" 
            fill={color1} 
          />
          <Circle r="8" fill={color1} opacity="0.6" />
        </AnimatedG>

        {/* 작은 궤도 반짝임들 */}
        <AnimatedG 
          transform={`translate(${centerX * 0.5}, ${centerY * 0.5})`} 
          animatedProps={sparkle1AnimatedProps}
        >
          <Path 
            d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" 
            fill={color2} 
          />
        </AnimatedG>

        <AnimatedG 
          transform={`translate(${centerX * 1.5}, ${centerY * 0.5})`} 
          animatedProps={sparkle2AnimatedProps}
        >
          <Path 
            d="M0,-6 L1.5,-1.5 L6,0 L1.5,1.5 L0,6 L-1.5,1.5 L-6,0 L-1.5,-1.5 Z" 
            fill={color1} 
          />
        </AnimatedG>

        <AnimatedG 
          transform={`translate(${centerX * 0.5}, ${centerY * 1.5})`} 
          animatedProps={sparkle3AnimatedProps}
        >
          <Path 
            d="M0,-5 L1.2,-1.2 L5,0 L1.2,1.2 L0,5 L-1.2,1.2 L-5,0 L-1.2,-1.2 Z" 
            fill={color3} 
          />
        </AnimatedG>

        <AnimatedG 
          transform={`translate(${centerX * 1.5}, ${centerY * 1.5})`} 
          animatedProps={sparkle4AnimatedProps}
        >
          <Path 
            d="M0,-7 L1.8,-1.8 L7,0 L1.8,1.8 L0,7 L-1.8,1.8 L-7,0 L-1.8,-1.8 Z" 
            fill={color2} 
          />
        </AnimatedG>

        {/* 부유 파티클들 */}
        <AnimatedCircle
          cx={centerX * 0.4}
          cy={centerY * 0.8}
          r="1.5"
          fill={color1}
          animatedProps={particle1AnimatedProps}
        />

        <AnimatedCircle
          cx={centerX * 1.6}
          cy={centerY * 1.2}
          r="1"
          fill={color2}
          animatedProps={particle2AnimatedProps}
        />

        <AnimatedCircle
          cx={centerX * 0.8}
          cy={centerY * 1.6}
          r="0.8"
          fill={color3}
          animatedProps={particle3AnimatedProps}
        />

        <AnimatedCircle
          cx={centerX * 1.2}
          cy={centerY * 0.4}
          r="1.2"
          fill={color1}
          animatedProps={particle4AnimatedProps}
        />

      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SparkleAnimation;