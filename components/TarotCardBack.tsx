// components/TarotCardBack.tsx - Sacred Geometry 카드 뒷면 디자인
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { 
  Circle, 
  Line, 
  Path, 
  G, 
  Defs, 
  LinearGradient, 
  Stop,
  RadialGradient
} from 'react-native-svg';

interface TarotCardBackProps {
  width?: number;
  height?: number;
}

// ✅ Android 성능: TarotCardBack 메모이제이션 (불필요한 SVG 리렌더링 방지)
export const TarotCardBack: React.FC<TarotCardBackProps> = React.memo(({
  width = 120,
  height = 180
}) => {
  const centerX = width / 2;
  const centerY = height / 2;
  
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        
        <Defs>
          {/* 카드 배경 그라데이션 */}
          <LinearGradient id="cardBackground" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2d1b47" stopOpacity="0.95" />
            <Stop offset="50%" stopColor="#1a1625" stopOpacity="0.98" />
            <Stop offset="100%" stopColor="#7b2cbf" stopOpacity="0.9" />
          </LinearGradient>
          
          {/* 중앙 발광 그라데이션 */}
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="40%">
            <Stop offset="0%" stopColor="#f4d03f" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#d4af37" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
          
          {/* 테두리 발광 */}
          <LinearGradient id="borderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#f4d03f" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#d4af37" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#f4d03f" stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        
        {/* 카드 배경 */}
        <Path 
          d={`M10,0 L${width-10},0 Q${width},0 ${width},10 L${width},${height-10} Q${width},${height} ${width-10},${height} L10,${height} Q0,${height} 0,${height-10} L0,10 Q0,0 10,0 Z`}
          fill="url(#cardBackground)"
          stroke="url(#borderGlow)"
          strokeWidth="2"
        />
        
        {/* 중앙 발광 영역 */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={width * 0.35}
          fill="url(#centerGlow)"
        />
        
        {/* Sacred Geometry - 중앙 Flower of Life */}
        <G transform={`translate(${centerX}, ${centerY})`}>
          {/* 중앙 원 */}
          <Circle r="20" fill="none" stroke="#f4d03f" strokeWidth="1.5" opacity="0.8" />
          
          {/* 6개의 주변 원들 - Flower of Life 패턴 */}
          <Circle cx="0" cy="-35" r="20" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
          <Circle cx="30" cy="-17.5" r="20" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
          <Circle cx="30" cy="17.5" r="20" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
          <Circle cx="0" cy="35" r="20" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
          <Circle cx="-30" cy="17.5" r="20" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
          <Circle cx="-30" cy="-17.5" r="20" fill="none" stroke="#d4af37" strokeWidth="1" opacity="0.6" />
          
          {/* 내부 기하학 패턴 */}
          <G opacity="0.4">
            {/* 육각형 */}
            <Path 
              d={`M0,-15 L13,-7.5 L13,7.5 L0,15 L-13,7.5 L-13,-7.5 Z`} 
              fill="none" 
              stroke="#f4d03f" 
              strokeWidth="1"
            />
            
            {/* 중앙 육선형 (6선 별) */}
            <Path 
              d={`M0,-12 L3,-6 L9,-6 L4.5,0 L6,6 L0,3 L-6,6 L-4.5,0 L-9,-6 L-3,-6 Z`}
              fill="#f4d03f"
              opacity="0.3"
            />
          </G>
          
          {/* 외곽 연결선들 */}
          <G opacity="0.3">
            <Line x1="0" y1="-15" x2="0" y2="-25" stroke="#d4af37" strokeWidth="0.8" />
            <Line x1="13" y1="-7.5" x2="22" y2="-12.5" stroke="#d4af37" strokeWidth="0.8" />
            <Line x1="13" y1="7.5" x2="22" y2="12.5" stroke="#d4af37" strokeWidth="0.8" />
            <Line x1="0" y1="15" x2="0" y2="25" stroke="#d4af37" strokeWidth="0.8" />
            <Line x1="-13" y1="7.5" x2="-22" y2="12.5" stroke="#d4af37" strokeWidth="0.8" />
            <Line x1="-13" y1="-7.5" x2="-22" y2="-12.5" stroke="#d4af37" strokeWidth="0.8" />
          </G>
        </G>
        
        {/* 상단 데코레이션 */}
        <G transform={`translate(${centerX}, 25)`} opacity="0.5">
          <Path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill="#f4d03f" />
          <Circle r="3" fill="#d4af37" opacity="0.6" />
        </G>
        
        {/* 하단 데코레이션 */}
        <G transform={`translate(${centerX}, ${height-25})`} opacity="0.5">
          <Path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill="#f4d03f" />
          <Circle r="3" fill="#d4af37" opacity="0.6" />
        </G>
        
        {/* 좌측 장식 */}
        <G transform={`translate(15, ${centerY})`} opacity="0.4">
          <Path d="M0,-5 L1.5,-1.5 L5,0 L1.5,1.5 L0,5 L-1.5,1.5 L-5,0 L-1.5,-1.5 Z" fill="#d4af37" />
        </G>
        
        {/* 우측 장식 */}
        <G transform={`translate(${width-15}, ${centerY})`} opacity="0.4">
          <Path d="M0,-5 L1.5,-1.5 L5,0 L1.5,1.5 L0,5 L-1.5,1.5 L-5,0 L-1.5,-1.5 Z" fill="#d4af37" />
        </G>
        
        {/* 모서리 장식들 */}
        <Circle cx="20" cy="20" r="2" fill="#f4d03f" opacity="0.4" />
        <Circle cx={width-20} cy="20" r="2" fill="#f4d03f" opacity="0.4" />
        <Circle cx="20" cy={height-20} r="2" fill="#f4d03f" opacity="0.4" />
        <Circle cx={width-20} cy={height-20} r="2" fill="#f4d03f" opacity="0.4" />
        
      </Svg>
    </View>
  );
}, (prevProps, nextProps) => {
  // ✅ props 비교: width/height 변경시에만 리렌더링
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});

const styles = StyleSheet.create({
  container: {
    shadowColor: '#f4d03f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default TarotCardBack;