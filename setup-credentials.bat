@echo off
echo 🔧 EAS Credentials 수동 설정 시작...

echo 📋 API 키 정보 설정:
set EXPO_APPLE_API_KEY_PATH=./AuthKey_SFC77KCKJB.p8
set EXPO_APPLE_API_KEY_ID=SFC77KCKJB
set EXPO_APPLE_API_ISSUER_ID=1dbd6627-3f6a-4530-a2c7-08d47bae378d

echo ✅ 환경 변수 설정 완료

echo 🚀 자동 제출 시도 1: 최신 빌드
eas submit --platform ios --latest --profile production-ios

echo 🚀 자동 제출 시도 2: 특정 빌드 ID
eas submit --platform ios --id 5246b7e3-13d5-4910-9421-ed3c929843db --profile production-ios

pause