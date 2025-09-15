const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Web에서 SVG 지원을 위한 설정
config.resolver.alias = {
  'react-native-svg': 'react-native-svg-web',
};

config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Jimp 관련 문제 해결을 위한 강화된 설정
config.resolver.blacklistRE = /node_modules\/(jimp|jimp-compact)\/.*$/;

// React Native에서 문제가 되는 패키지들 완전 제외
config.resolver.blockList = [
  /node_modules\/jimp-compact\/.*/,
  /node_modules\/jimp\/.*/,
  /node_modules\/@jimp\/.*/,
  /.*\/jimp\/.*/,
  /.*\/jimp-compact\/.*/,
];

// 웹에서 이미지 처리 라이브러리 대체
config.resolver.alias = {
  ...config.resolver.alias,
  'jimp': false,
  'jimp-compact': false,
  '@jimp/core': false,
  '@jimp/types': false,
  '@expo/image-utils': false, // expo-notifications의 이미지 유틸리티 비활성화
};

// 웹에서만 jimp 관련 모듈을 완전히 무시
if (config.resolver.platforms.includes('web')) {
  config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
  config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'web.js', 'web.ts', 'web.tsx'];
}

module.exports = config;