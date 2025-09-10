// components/SacredGeometryBackground.tsx - Sacred Geometry 배경 패턴
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Line, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface SacredGeometryBackgroundProps {
  opacity?: number;
}

export const SacredGeometryBackground: React.FC<SacredGeometryBackgroundProps> = ({ 
  opacity = 0.15 
}) => {
  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        
        {/* Flower of Life Pattern - 중심부 */}
        <G transform={`translate(${width/2}, ${height/2})`}>
          
          {/* 중앙 원 */}
          <Circle r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          
          {/* 6개의 둘러싼 원들 - Flower of Life 핵심 패턴 */}
          <Circle cx="0" cy="-52" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          <Circle cx="45" cy="-26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          <Circle cx="45" cy="26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          <Circle cx="0" cy="52" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          <Circle cx="-45" cy="26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          <Circle cx="-45" cy="-26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          
          {/* 외곽 레이어 - 더 희미하게 */}
          <G opacity="0.5">
            <Circle cx="0" cy="-104" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            <Circle cx="90" cy="-52" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            <Circle cx="90" cy="52" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            <Circle cx="0" cy="104" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            <Circle cx="-90" cy="52" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
            <Circle cx="-90" cy="-52" r="30" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          </G>
        </G>
        
        {/* Metatron's Cube Elements */}
        <G opacity="0.1" transform={`translate(${width/2}, ${height/2})`}>
          {/* 외부 육각형 */}
          <Path d="M0,-100 L86.6,-50 L86.6,50 L0,100 L-86.6,50 L-86.6,-50 Z" 
                fill="none" stroke="#f4d03f" strokeWidth="1" />
          
          {/* 내부 별 패턴 */}
          <Path d="M0,-80 L69.3,-40 L69.3,40 L0,80 L-69.3,40 L-69.3,-40 Z" 
                fill="none" stroke="#d4af37" strokeWidth="0.8" />
          
          {/* 중앙 육각형 */}
          <Path d="M0,-40 L34.6,-20 L34.6,20 L0,40 L-34.6,20 L-34.6,-20 Z" 
                fill="none" stroke="#f4d03f" strokeWidth="1.2" />
        </G>
        
        {/* 산재된 미스틱 요소들 */}
        <G opacity="0.08">
          {/* 별들 - 여러 위치에 배치 */}
          <G transform={`translate(${width*0.2}, ${height*0.2})`}>
            <Path d="M0,-8 L2.4,-2.4 L8,0 L2.4,2.4 L0,8 L-2.4,2.4 L-8,0 L-2.4,-2.4 Z" 
                  fill="#d4af37" />
          </G>
          
          <G transform={`translate(${width*0.8}, ${height*0.3})`}>
            <Path d="M0,-6 L1.8,-1.8 L6,0 L1.8,1.8 L0,6 L-1.8,1.8 L-6,0 L-1.8,-1.8 Z" 
                  fill="#f4d03f" />
          </G>
          
          <G transform={`translate(${width*0.3}, ${height*0.8})`}>
            <Path d="M0,-10 L3,-3 L10,0 L3,3 L0,10 L-3,3 L-10,0 L-3,-3 Z" 
                  fill="#d4af37" />
          </G>
          
          <G transform={`translate(${width*0.75}, ${height*0.75})`}>
            <Path d="M0,-5 L1.5,-1.5 L5,0 L1.5,1.5 L0,5 L-1.5,1.5 L-5,0 L-1.5,-1.5 Z" 
                  fill="#f4d03f" />
          </G>
          
          {/* 작은 원들 */}
          <Circle cx={width*0.15} cy={height*0.37} r="2" fill="#d4af37" />
          <Circle cx={width*0.87} cy={height*0.62} r="1.5" fill="#f4d03f" />
          <Circle cx={width*0.37} cy={height*0.92} r="2.5" fill="#d4af37" />
          <Circle cx={width*0.7} cy={height*0.15} r="1" fill="#f4d03f" />
        </G>
        
        {/* 미묘한 연결선들 */}
        <G opacity="0.05">
          <Line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#d4af37" strokeWidth="0.5" />
          <Line x1={width/2} y1="0" x2={width/2} y2={height} stroke="#d4af37" strokeWidth="0.5" />
          
          {/* 대각선들 */}
          <Line x1="0" y1="0" x2={width} y2={height} stroke="#f4d03f" strokeWidth="0.3" />
          <Line x1={width} y1="0" x2="0" y2={height} stroke="#f4d03f" strokeWidth="0.3" />
        </G>
        
        {/* 추가적인 Flower of Life 패턴 - 코너들에 작게 */}
        <G opacity="0.06">
          {/* 좌상단 */}
          <G transform={`translate(${width*0.15}, ${height*0.15}) scale(0.3)`}>
            <Circle r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
            <Circle cx="0" cy="-52" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
            <Circle cx="45" cy="-26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
            <Circle cx="45" cy="26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
            <Circle cx="0" cy="52" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
            <Circle cx="-45" cy="26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
            <Circle cx="-45" cy="-26" r="30" fill="none" stroke="#d4af37" strokeWidth="1" />
          </G>
          
          {/* 우하단 */}
          <G transform={`translate(${width*0.85}, ${height*0.85}) scale(0.3)`}>
            <Circle r="30" fill="none" stroke="#f4d03f" strokeWidth="1" />
            <Circle cx="0" cy="-52" r="30" fill="none" stroke="#f4d03f" strokeWidth="1" />
            <Circle cx="45" cy="-26" r="30" fill="none" stroke="#f4d03f" strokeWidth="1" />
            <Circle cx="45" cy="26" r="30" fill="none" stroke="#f4d03f" strokeWidth="1" />
            <Circle cx="0" cy="52" r="30" fill="none" stroke="#f4d03f" strokeWidth="1" />
            <Circle cx="-45" cy="26" r="30" fill="none" stroke="#f4d03f" strokeWidth="1" />
            <Circle cx="-45" cy="-26" r="30" fill="none" stroke="#f4d03f" strokeWidth="1" />
          </G>
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
    zIndex: -2, // 다른 배경 요소들보다 더 뒤에 배치
  },
});

export default SacredGeometryBackground;