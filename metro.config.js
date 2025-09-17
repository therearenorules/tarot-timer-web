const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 기본 설정
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// 더 강력한 Jimp 및 이미지 처리 라이브러리 차단
const jimpBlockList = [
  /node_modules\/jimp-compact\/.*/,
  /node_modules\/jimp\/.*/,
  /node_modules\/@jimp\/.*/,
  /.*\/jimp\/.*/,
  /.*\/jimp-compact\/.*/,
  // 추가 이미지 처리 라이브러리들
  /node_modules\/file-type\/.*/,
  /node_modules\/image-size\/.*/,
  /node_modules\/probe-image-size\/.*/,
  // Expo 이미지 유틸리티들 (알림 시스템에서 사용)
  /node_modules\/@expo\/image-utils\/.*/,
  /node_modules\/@expo\/image-loader\/.*/,
  /node_modules\/@expo\/spawn-async\/.*/,
  /.*\/expo\/.*image.*\/.*/,
  // 알림 아이콘 생성 관련 차단
  /.*expo-notifications.*image.*\/.*/,
];

// blockList와 blacklistRE 모두 설정
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : []),
  ...jimpBlockList
];
config.resolver.blacklistRE = /node_modules\/(jimp|jimp-compact|@jimp|file-type|image-size|probe-image-size|@expo\/image-utils|@expo\/image-loader)\/.*$/;

// 웹과 SVG 지원을 위한 알리아스 설정
config.resolver.alias = {
  'react-native-svg': 'react-native-svg-web',
  // Jimp 관련 모듈들을 완전히 false로 설정
  'jimp': false,
  'jimp-compact': false,
  '@jimp/core': false,
  '@jimp/types': false,
  '@jimp/plugin-resize': false,
  '@jimp/plugin-rotate': false,
  '@jimp/plugin-crop': false,
  '@expo/image-utils': false,
  '@expo/image-loader': false,
  '@expo/spawn-async': false,
  'file-type': false,
  'image-size': false,
  'probe-image-size': false,
};

// 웹 환경을 위한 추가 설정
if (config.resolver.platforms.includes('web')) {
  config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
  config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'web.js', 'web.ts', 'web.tsx'];
}

module.exports = config;