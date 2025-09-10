const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Web에서 SVG 지원을 위한 설정
config.resolver.alias = {
  'react-native-svg': 'react-native-svg-web',
};

config.resolver.platforms = ['web', 'native', 'ios', 'android'];

module.exports = config;