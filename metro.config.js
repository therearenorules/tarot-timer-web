const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Web에서 SVG 지원을 위한 설정
config.resolver.alias = {
  'react-native-svg': 'react-native-svg-web',
};

config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Jimp 관련 문제 해결을 위한 설정
config.resolver.blacklistRE = /node_modules\/jimp-compact\/.*$/;

// React Native에서 문제가 되는 패키지들 제외
config.resolver.blockList = [
  /node_modules\/jimp-compact\/.*/,
  /node_modules\/jimp\/.*/,
];

module.exports = config;