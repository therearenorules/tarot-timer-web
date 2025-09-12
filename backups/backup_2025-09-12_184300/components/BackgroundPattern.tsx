// components/BackgroundPattern.tsx - 미스틱한 배경 패턴
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Circle, Path, Rect, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface BackgroundPatternProps {
  opacity?: number;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ 
  opacity = 0.05 
}) => {
  return (
    <View style={[styles.container, { opacity }]}>
      <Svg width={width} height={height} style={styles.svg}>
        <Defs>
          {/* Mystical Sacred Geometry Pattern */}
          <Pattern 
            id="mysticPattern" 
            x="0" 
            y="0" 
            width="80" 
            height="80" 
            patternUnits="userSpaceOnUse"
          >
            {/* Central circle */}
            <Circle cx="40" cy="40" r="12" fill="none" stroke="#f4d03f" strokeWidth="0.5" />
            <Circle cx="40" cy="40" r="8" fill="none" stroke="#d4af37" strokeWidth="0.3" />
            <Circle cx="40" cy="40" r="4" fill="none" stroke="#f4d03f" strokeWidth="0.2" />
            
            {/* Sacred geometry lines */}
            <Path d="M40,28 L52,40 L40,52 L28,40 Z" fill="none" stroke="#d4af37" strokeWidth="0.2" />
            <Path d="M40,32 L48,40 L40,48 L32,40 Z" fill="none" stroke="#f4d03f" strokeWidth="0.15" />
            
            {/* Corner elements */}
            <Circle cx="20" cy="20" r="1" fill="#d4af37" opacity="0.6" />
            <Circle cx="60" cy="20" r="1" fill="#f4d03f" opacity="0.4" />
            <Circle cx="20" cy="60" r="1" fill="#f4d03f" opacity="0.4" />
            <Circle cx="60" cy="60" r="1" fill="#d4af37" opacity="0.6" />
            
            {/* Small sparkles */}
            <G transform="translate(15, 15)">
              <Path d="M0,-2 L0.5,-0.5 L2,0 L0.5,0.5 L0,2 L-0.5,0.5 L-2,0 L-0.5,-0.5 Z" 
                    fill="#f4d03f" opacity="0.3" />
            </G>
            <G transform="translate(65, 65)">
              <Path d="M0,-2 L0.5,-0.5 L2,0 L0.5,0.5 L0,2 L-0.5,0.5 L-2,0 L-0.5,-0.5 Z" 
                    fill="#d4af37" opacity="0.3" />
            </G>
          </Pattern>
        </Defs>
        
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#mysticPattern)" />
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
    zIndex: -1,
  },
  svg: {
    position: 'absolute',
  },
});

export default BackgroundPattern;