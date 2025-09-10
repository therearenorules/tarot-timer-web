// components/MysticalTexture.tsx - 미스틱 다크 텍스처 패턴
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { 
  Pattern, 
  Circle, 
  Line, 
  Path, 
  Rect, 
  G, 
  Defs, 
  RadialGradient, 
  Stop 
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface MysticalTextureProps {
  opacity?: number;
}

export const MysticalTexture: React.FC<MysticalTextureProps> = ({ 
  opacity = 0.15 
}) => {
  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        
        <Defs>
          {/* 다크 미스틱 패턴 - 40x40 단위 */}
          <Pattern 
            id="darkMysticalPattern" 
            x="0" 
            y="0" 
            width="40" 
            height="40" 
            patternUnits="userSpaceOnUse"
          >
            {/* 미묘한 발광 점들 */}
            <Circle cx="20" cy="20" r="1" fill="#f4d03f" opacity="0.2" />
            <Circle cx="0" cy="0" r="0.5" fill="#ffffff" opacity="0.1" />
            <Circle cx="40" cy="40" r="0.5" fill="#ffffff" opacity="0.1" />
            <Circle cx="40" cy="0" r="0.3" fill="#f4d03f" opacity="0.15" />
            <Circle cx="0" cy="40" r="0.3" fill="#f4d03f" opacity="0.15" />
            
            {/* 발광 라인들 */}
            <Line x1="0" y1="20" x2="40" y2="20" stroke="#d4af37" strokeWidth="0.3" opacity="0.08" />
            <Line x1="20" y1="0" x2="20" y2="40" stroke="#d4af37" strokeWidth="0.3" opacity="0.08" />
            
            {/* 미스틱 별들 */}
            <G transform="translate(10, 30)" opacity="0.15">
              <Path d="M0,-2.5 L0.7,-0.7 L2.5,0 L0.7,0.7 L0,2.5 L-0.7,0.7 L-2.5,0 L-0.7,-0.7 Z" fill="#f4d03f" />
              <Circle r="0.8" fill="#f4d03f" opacity="0.6" />
            </G>
            
            <G transform="translate(30, 10)" opacity="0.12">
              <Path d="M0,-2 L0.5,-0.5 L2,0 L0.5,0.5 L0,2 L-0.5,0.5 L-2,0 L-0.5,-0.5 Z" fill="#ffffff" />
              <Circle r="0.6" fill="#ffffff" opacity="0.4" />
            </G>
            
            {/* 작은 반짝임들 */}
            <Circle cx="5" cy="15" r="0.2" fill="#f4d03f" opacity="0.3" />
            <Circle cx="35" cy="25" r="0.2" fill="#ffffff" opacity="0.25" />
            <Circle cx="15" cy="5" r="0.15" fill="#d4af37" opacity="0.2" />
            <Circle cx="25" cy="35" r="0.15" fill="#f4d03f" opacity="0.25" />
          </Pattern>
          
          {/* 다크 오버레이 그라데이션 */}
          <RadialGradient id="darkOverlay" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor="#f4d03f" stopOpacity="0.03" />
            <Stop offset="50%" stopColor="#d4af37" stopOpacity="0.02" />
            <Stop offset="100%" stopColor="#1a1f3a" stopOpacity="0.04" />
          </RadialGradient>
        </Defs>
        
        {/* 패턴 적용 */}
        <Rect width={width} height={height} fill="url(#darkMysticalPattern)" />
        
        {/* 미스틱 글로우 오버레이 */}
        <Rect width={width} height={height} fill="url(#darkOverlay)" />
        
        {/* Sacred Geometry 오버레이 with 글로우 */}
        <G opacity="0.08" transform={`translate(${width/2}, ${height/2})`}>
          {/* 발광하는 Flower of Life */}
          <Circle r="30" fill="none" stroke="#f4d03f" strokeWidth="0.8" />
          <Circle cx="0" cy="-52" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <Circle cx="45" cy="-26" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <Circle cx="45" cy="26" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <Circle cx="0" cy="52" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <Circle cx="-45" cy="26" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <Circle cx="-45" cy="-26" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          
          {/* 중앙 글로우 */}
          <Circle r="15" fill="#f4d03f" opacity="0.05" />
        </G>
        
        {/* 부유하는 미스틱 요소들 */}
        <G opacity="0.1">
          {/* 궤도를 도는 파티클들 */}
          <Circle cx={width*0.125} cy={height*0.125} r="1" fill="#f4d03f" opacity="0.6" />
          <Circle cx={width*0.375} cy={height*0.15} r="0.8" fill="#ffffff" opacity="0.4" />
          <Circle cx={width*0.1} cy={height*0.3} r="1.2" fill="#d4af37" opacity="0.5" />
          <Circle cx={width*0.4} cy={height*0.35} r="0.6" fill="#f4d03f" opacity="0.7" />
          <Circle cx={width*0.2} cy={height*0.425} r="0.9" fill="#ffffff" opacity="0.3" />
          
          <Circle cx={width*0.625} cy={height*0.15} r="1" fill="#f4d03f" opacity="0.6" />
          <Circle cx={width*0.875} cy={height*0.175} r="0.8" fill="#ffffff" opacity="0.4" />
          <Circle cx={width*0.6} cy={height*0.3} r="1.2" fill="#d4af37" opacity="0.5" />
          <Circle cx={width*0.9} cy={height*0.35} r="0.6" fill="#f4d03f" opacity="0.7" />
          <Circle cx={width*0.7} cy={height*0.425} r="0.9" fill="#ffffff" opacity="0.3" />
          
          <Circle cx={width*0.125} cy={height*0.625} r="1" fill="#f4d03f" opacity="0.6" />
          <Circle cx={width*0.375} cy={height*0.65} r="0.8" fill="#ffffff" opacity="0.4" />
          <Circle cx={width*0.1} cy={height*0.8} r="1.2" fill="#d4af37" opacity="0.5" />
          <Circle cx={width*0.4} cy={height*0.85} r="0.6" fill="#f4d03f" opacity="0.7" />
          <Circle cx={width*0.2} cy={height*0.925} r="0.9" fill="#ffffff" opacity="0.3" />
          
          <Circle cx={width*0.625} cy={height*0.625} r="1" fill="#f4d03f" opacity="0.6" />
          <Circle cx={width*0.875} cy={height*0.675} r="0.8" fill="#ffffff" opacity="0.4" />
          <Circle cx={width*0.6} cy={height*0.8} r="1.2" fill="#d4af37" opacity="0.5" />
          <Circle cx={width*0.9} cy={height*0.85} r="0.6" fill="#f4d03f" opacity="0.7" />
          <Circle cx={width*0.7} cy={height*0.925} r="0.9" fill="#ffffff" opacity="0.3" />
          
          {/* 에너지 wisps */}
          <Path d={`M${width*0.05},${height*0.075} Q${width*0.075},${height*0.0625} ${width*0.1},${height*0.0875} Q${width*0.1125},${height*0.1} ${width*0.0875},${height*0.1125}`}
                stroke="#f4d03f" strokeWidth="0.5" fill="none" opacity="0.3" />
          <Path d={`M${width*0.4},${height*0.4} Q${width*0.425},${height*0.3875} ${width*0.45},${height*0.4125} Q${width*0.4375},${height*0.425} ${width*0.4125},${height*0.4375}`}
                stroke="#d4af37" strokeWidth="0.4" fill="none" opacity="0.25" />
          <Path d={`M${width*0.55},${height*0.6} Q${width*0.575},${height*0.5875} ${width*0.6},${height*0.6125} Q${width*0.5875},${height*0.625} ${width*0.5625},${height*0.6375}`}
                stroke="#f4d03f" strokeWidth="0.5" fill="none" opacity="0.3" />
          <Path d={`M${width*0.8},${height*0.8} Q${width*0.825},${height*0.7875} ${width*0.85},${height*0.8125} Q${width*0.8375},${height*0.825} ${width*0.8125},${height*0.8375}`}
                stroke="#d4af37" strokeWidth="0.4" fill="none" opacity="0.25" />
        </G>
        
        {/* 추가적인 미스틱 레이어들 */}
        <G opacity="0.06">
          {/* 더 큰 궤도 파티클들 */}
          <Circle cx={width*0.15} cy={height*0.25} r="2" fill="#f4d03f" opacity="0.4" />
          <Circle cx={width*0.85} cy={height*0.35} r="1.5" fill="#d4af37" opacity="0.3" />
          <Circle cx={width*0.25} cy={height*0.75} r="2.5" fill="#ffffff" opacity="0.2" />
          <Circle cx={width*0.75} cy={height*0.65} r="1.8" fill="#f4d03f" opacity="0.35" />
          
          {/* 연결하는 에너지 선들 */}
          <Line x1={width*0.15} y1={height*0.25} x2={width*0.25} y2={height*0.75} 
                stroke="#d4af37" strokeWidth="0.2" opacity="0.15" />
          <Line x1={width*0.85} y1={height*0.35} x2={width*0.75} y2={height*0.65} 
                stroke="#f4d03f" strokeWidth="0.2" opacity="0.15" />
        </G>
        
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
    zIndex: -1, // BackgroundPattern 위에, 다른 요소들 아래
  },
});

export default MysticalTexture;