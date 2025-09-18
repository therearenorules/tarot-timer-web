// EAS Credentials API 키 자동 설정 스크립트
const { execSync } = require('child_process');

console.log('🔧 EAS Credentials API 키 설정 시작...');

try {
  // API 키 정보 설정
  const keyPath = './AuthKey_SFC77KCKJB.p8';
  const keyId = 'SFC77KCKJB';
  const issuerId = '1dbd6627-3f6a-4530-a2c7-08d47bae378d';

  console.log('📋 API 키 정보:');
  console.log(`- Key Path: ${keyPath}`);
  console.log(`- Key ID: ${keyId}`);
  console.log(`- Issuer ID: ${issuerId}`);

  // 환경 변수로 설정
  process.env.EXPO_APPLE_API_KEY_PATH = keyPath;
  process.env.EXPO_APPLE_API_KEY_ID = keyId;
  process.env.EXPO_APPLE_API_ISSUER_ID = issuerId;

  console.log('✅ 환경 변수 설정 완료');

  // 제출 시도
  console.log('🚀 자동 제출 시작...');
  execSync('eas submit --platform ios --latest --non-interactive', {
    stdio: 'inherit',
    env: { ...process.env }
  });

} catch (error) {
  console.error('❌ 오류 발생:', error.message);
  console.log('🔄 대안 방법 시도 중...');
}