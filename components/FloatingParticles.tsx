// components/FloatingParticles.tsx - 부유하는 파티클 시스템
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Animated SVG 컴포넌트들
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface FloatingParticlesProps {
  particleCount?: number;
  opacity?: number;
  speed?: 'slow' | 'medium' | 'fast';
  colors?: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'circle' | 'star' | 'sparkle';
  color: string;
  delay: number;
  duration: number;
  range: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  particleCount = 12,
  opacity = 0.1,
  speed = 'medium',
  colors = ['#f4d03f', '#d4af37', '#ffffff', '#d4b8ff']
}) => {
  // 파티클 생성
  const generateParticles = (): Particle[] => {
    const particles: Particle[] = [];
    const types: Array<'circle' | 'star' | 'sparkle'> = ['circle', 'star', 'sparkle'];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1, // 1-4 크기
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 3000, // 0-3초 지연
        duration: Math.random() * 2000 + 2000, // 2-4초 지속
        range: Math.random() * 30 + 20, // 20-50 이동 범위
      });
    }
    
    return particles;
  };

  const [particles] = React.useState(generateParticles());

  // 애니메이션 값들
  const animatedValues = particles.map(() => ({
    translateY: useSharedValue(0),
    translateX: useSharedValue(0),
    opacity: useSharedValue(0.5),
    scale: useSharedValue(1),
    rotation: useSharedValue(0),
  }));

  // 속도에 따른 지속시간 설정
  const getSpeedMultiplier = () => {
    switch (speed) {
      case 'slow':
        return 1.5;
      case 'fast':
        return 0.6;
      default: // medium
        return 1;
    }
  };

  useEffect(() => {
    const speedMultiplier = getSpeedMultiplier();

    particles.forEach((particle, index) => {
      const values = animatedValues[index];
      const adjustedDuration = particle.duration * speedMultiplier;
      const adjustedDelay = particle.delay * speedMultiplier;

      // 수직 부유 애니메이션
      values.translateY.value = withDelay(
        adjustedDelay,
        withRepeat(
          withSequence(
            withTiming(-particle.range, { 
              duration: adjustedDuration,
              easing: Easing.inOut(Easing.sine)
            }),
            withTiming(0, { 
              duration: adjustedDuration,
              easing: Easing.inOut(Easing.sine)
            })
          ),
          -1
        )
      );

      // 수평 살짝 흔들림
      values.translateX.value = withDelay(
        adjustedDelay + 500,
        withRepeat(
          withSequence(
            withTiming(-particle.range * 0.3, { 
              duration: adjustedDuration * 1.2,
              easing: Easing.inOut(Easing.sine)
            }),
            withTiming(particle.range * 0.3, { 
              duration: adjustedDuration * 1.2,
              easing: Easing.inOut(Easing.sine)
            }),
            withTiming(0, { 
              duration: adjustedDuration * 1.2,
              easing: Easing.inOut(Easing.sine)
            })
          ),
          -1
        )
      );

      // 투명도 변화
      values.opacity.value = withDelay(
        adjustedDelay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: adjustedDuration }),
            withTiming(0.2, { duration: adjustedDuration })
          ),
          -1
        )
      );

      // 크기 변화 (펄스 효과)
      values.scale.value = withDelay(
        adjustedDelay + 300,
        withRepeat(
          withSequence(
            withTiming(1.2, { 
              duration: adjustedDuration * 0.8,
              easing: Easing.inOut(Easing.quad)
            }),
            withTiming(0.8, { 
              duration: adjustedDuration * 0.8,
              easing: Easing.inOut(Easing.quad)
            })
          ),
          -1
        )
      );

      // 회전 (별과 반짝임만)
      if (particle.type === 'star' || particle.type === 'sparkle') {
        values.rotation.value = withDelay(
          adjustedDelay,
          withRepeat(
            withTiming(360, { 
              duration: adjustedDuration * 2,
              easing: Easing.linear
            }),
            -1
          )
        );
      }
    });
  }, [speed, particles]);

  // 파티클 렌더링 함수
  const renderParticle = (particle: Particle, index: number) => {
    const values = animatedValues[index];

    const animatedProps = useAnimatedProps(() => ({
      transform: `translate(${values.translateX.value}, ${values.translateY.value}) scale(${values.scale.value}) rotate(${values.rotation.value})`,
      opacity: values.opacity.value,
    }));

    const key = `particle-${particle.id}`;
    const baseX = particle.x;
    const baseY = particle.y;

    switch (particle.type) {
      case 'circle':
        return (
          <AnimatedCircle
            key={key}
            cx={baseX}
            cy={baseY}
            r={particle.size}
            fill={particle.color}
            animatedProps={animatedProps}
          />
        );

      case 'star':
        return (
          <AnimatedG
            key={key}
            transform={`translate(${baseX}, ${baseY})`}
            animatedProps={animatedProps}
          >
            <Path
              d={`M0,${-particle.size * 2} L${particle.size * 0.6},${-particle.size * 0.6} L${particle.size * 2},0 L${particle.size * 0.6},${particle.size * 0.6} L0,${particle.size * 2} L${-particle.size * 0.6},${particle.size * 0.6} L${-particle.size * 2},0 L${-particle.size * 0.6},${-particle.size * 0.6} Z`}
              fill={particle.color}
            />
          </AnimatedG>
        );

      case 'sparkle':
        return (
          <AnimatedG
            key={key}
            transform={`translate(${baseX}, ${baseY})`}
            animatedProps={animatedProps}
          >
            <Path
              d={`M0,${-particle.size * 1.5} L${particle.size * 0.4},${-particle.size * 0.4} L${particle.size * 1.5},0 L${particle.size * 0.4},${particle.size * 0.4} L0,${particle.size * 1.5} L${-particle.size * 0.4},${particle.size * 0.4} L${-particle.size * 1.5},0 L${-particle.size * 0.4},${-particle.size * 0.4} Z`}
              fill={particle.color}
            />
            <Circle
              r={particle.size * 0.3}
              fill={particle.color}
              opacity="0.8"
            />
          </AnimatedG>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {particles.map((particle, index) => renderParticle(particle, index))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // 다른 요소들 뒤에 배치
    pointerEvents: 'none', // 터치 이벤트 차단하지 않음
  },
});

export default FloatingParticles;