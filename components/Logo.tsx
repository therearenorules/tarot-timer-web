// components/Logo.tsx - 타로 타이머 로고 컴포넌트
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect, G, Path, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 120 }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        {/* Gradients */}
        <Defs>
          <RadialGradient id="mainGradient" cx="50%" cy="40%" r="60%">
            <Stop offset="0%" stopColor="#4a1a4f" stopOpacity="1" />
            <Stop offset="60%" stopColor="#1a1f3a" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0f0f1a" stopOpacity="1" />
          </RadialGradient>
          
          <LinearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#d4af37" stopOpacity="1" />
            <Stop offset="50%" stopColor="#f4d03f" stopOpacity="1" />
            <Stop offset="100%" stopColor="#d4af37" stopOpacity="1" />
          </LinearGradient>
          
          <RadialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#f4d03f" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#d4af37" stopOpacity="0.2" />
          </RadialGradient>
          
          <LinearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2a2f4a" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1a1f3a" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Outer Glow Circle */}
        <Circle cx="60" cy="60" r="58" fill="none" stroke="url(#glowGradient)" strokeWidth="2" opacity="0.6" />
        
        {/* Main Circle */}
        <Circle cx="60" cy="60" r="50" fill="url(#mainGradient)" stroke="url(#borderGradient)" strokeWidth="2" />
        
        {/* Three Tarot Cards Arrangement */}
        <G transform="translate(60, 60)">
          {/* Left Card (tilted -15 degrees) */}
          <G transform="rotate(-15) translate(-18, 0)">
            <Rect x="-8" y="-16" width="16" height="24" rx="2" fill="url(#cardGradient)" 
                  stroke="#d4af37" strokeWidth="1" />
            <Rect x="-6" y="-14" width="12" height="20" rx="1" fill="none" 
                  stroke="#f4d03f" strokeWidth="0.5" opacity="0.7" />
            {/* Card symbol */}
            <Circle cx="0" cy="-4" r="2" fill="#d4af37" />
            <Rect x="-4" y="2" width="8" height="1" fill="#d4af37" opacity="0.8" />
            <Rect x="-4" y="6" width="8" height="1" fill="#d4af37" opacity="0.8" />
          </G>
          
          {/* Center Card (straight) */}
          <G transform="translate(0, -3)">
            <Rect x="-8" y="-16" width="16" height="24" rx="2" fill="url(#cardGradient)" 
                  stroke="#f4d03f" strokeWidth="1.5" />
            <Rect x="-6" y="-14" width="12" height="20" rx="1" fill="none" 
                  stroke="#d4af37" strokeWidth="0.5" opacity="0.9" />
            {/* Central star */}
            <Path d="M0,-8 L1.5,-2 L6,-2 L2,1 L3.5,6 L0,3 L-3.5,6 L-2,1 L-6,-2 L-1.5,-2 Z" 
                  fill="#f4d03f" stroke="#d4af37" strokeWidth="0.5" />
            <Rect x="-4" y="8" width="8" height="1" fill="#d4af37" opacity="0.8" />
          </G>
          
          {/* Right Card (tilted +15 degrees) */}
          <G transform="rotate(15) translate(18, 0)">
            <Rect x="-8" y="-16" width="16" height="24" rx="2" fill="url(#cardGradient)" 
                  stroke="#d4af37" strokeWidth="1" />
            <Rect x="-6" y="-14" width="12" height="20" rx="1" fill="none" 
                  stroke="#f4d03f" strokeWidth="0.5" opacity="0.7" />
            {/* Card symbol */}
            <Circle cx="0" cy="-4" r="2" fill="#d4af37" />
            <Rect x="-4" y="2" width="8" height="1" fill="#d4af37" opacity="0.8" />
            <Rect x="-4" y="6" width="8" height="1" fill="#d4af37" opacity="0.8" />
          </G>
        </G>
        
        {/* Mystical Elements */}
        <G opacity="0.8">
          {/* Top sparkle */}
          <G transform="translate(60, 15)">
            <Path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="#f4d03f" />
          </G>
          
          {/* Bottom left sparkle */}
          <G transform="translate(20, 95)">
            <Path d="M0,-3 L0.8,-0.8 L3,0 L0.8,0.8 L0,3 L-0.8,0.8 L-3,0 L-0.8,-0.8 Z" fill="#d4af37" />
          </G>
          
          {/* Bottom right sparkle */}
          <G transform="translate(100, 95)">
            <Path d="M0,-3 L0.8,-0.8 L3,0 L0.8,0.8 L0,3 L-0.8,0.8 L-3,0 L-0.8,-0.8 Z" fill="#d4af37" />
          </G>
          
          {/* Small dots */}
          <Circle cx="25" cy="35" r="1.5" fill="#f4d03f" opacity="0.6" />
          <Circle cx="95" cy="35" r="1" fill="#d4af37" opacity="0.6" />
          <Circle cx="35" cy="85" r="1" fill="#f4d03f" opacity="0.6" />
          <Circle cx="85" cy="25" r="1.5" fill="#d4af37" opacity="0.6" />
        </G>
        
        {/* Inner Sacred Circle */}
        <Circle cx="60" cy="60" r="25" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.4" />
      </Svg>
    </View>
  );
};

export default Logo;