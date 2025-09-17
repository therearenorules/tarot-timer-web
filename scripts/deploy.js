#!/usr/bin/env node

/**
 * 타로 타이머 빠른 배포 스크립트
 * 개발자가 수동으로 빌드 및 배포를 실행할 수 있는 도구
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 컬러 출력을 위한 유틸리티
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, description) {
  log(`🔄 ${description}...`, 'blue');
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    log(`✅ ${description} 완료`, 'green');
    return result;
  } catch (error) {
    log(`❌ ${description} 실패: ${error.message}`, 'red');
    throw error;
  }
}

function askQuestion(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    readline.question(question, answer => {
      readline.close();
      resolve(answer);
    });
  });
}

async function checkPrerequisites() {
  log('🔍 사전 요구사항 확인 중...', 'cyan');

  // EAS CLI 확인
  try {
    execSync('eas --version', { stdio: 'ignore' });
    log('✅ EAS CLI 설치됨', 'green');
  } catch (error) {
    log('❌ EAS CLI가 설치되지 않음', 'red');
    log('설치 명령: npm install -g eas-cli', 'yellow');
    process.exit(1);
  }

  // 로그인 상태 확인
  try {
    execSync('eas whoami', { stdio: 'ignore' });
    log('✅ Expo 로그인 상태 확인됨', 'green');
  } catch (error) {
    log('❌ Expo 로그인 필요', 'red');
    log('로그인 명령: eas login', 'yellow');
    process.exit(1);
  }

  // 환경 파일 확인
  if (!fs.existsSync('.env.production')) {
    log('❌ .env.production 파일이 없습니다', 'red');
    process.exit(1);
  }

  log('✅ 모든 사전 요구사항 확인 완료', 'green');
}

async function selectBuildType() {
  log('\n📱 빌드 유형을 선택하세요:', 'magenta');
  log('1. 개발 빌드 (development)');
  log('2. 프리뷰 빌드 (preview)');
  log('3. 프로덕션 빌드 (production)');
  log('4. 프로덕션 + 앱스토어 제출 (production + submit)');

  const choice = await askQuestion('선택 (1-4): ');

  switch (choice) {
    case '1':
      return { profile: 'development', submit: false };
    case '2':
      return { profile: 'preview', submit: false };
    case '3':
      return { profile: 'production', submit: false };
    case '4':
      return { profile: 'production', submit: true };
    default:
      log('❌ 잘못된 선택입니다', 'red');
      process.exit(1);
  }
}

async function selectPlatform() {
  log('\n🔧 플랫폼을 선택하세요:', 'magenta');
  log('1. iOS');
  log('2. Android');
  log('3. 모든 플랫폼 (iOS + Android)');

  const choice = await askQuestion('선택 (1-3): ');

  switch (choice) {
    case '1':
      return 'ios';
    case '2':
      return 'android';
    case '3':
      return 'all';
    default:
      log('❌ 잘못된 선택입니다', 'red');
      process.exit(1);
  }
}

async function runQualityChecks() {
  log('\n🏥 품질 검사 실행 중...', 'cyan');

  try {
    // Expo Doctor 실행
    exec('npx expo-doctor', 'Expo Doctor 검사');
  } catch (error) {
    const proceed = await askQuestion('⚠️  Doctor 검사에서 오류가 발견되었습니다. 계속 진행하시겠습니까? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      log('❌ 배포가 취소되었습니다', 'red');
      process.exit(1);
    }
  }

  // TypeScript 확인 (선택적)
  try {
    exec('npx tsc --noEmit', 'TypeScript 타입 검사');
  } catch (error) {
    log('⚠️  TypeScript 검사 실패 (계속 진행)', 'yellow');
  }
}

async function buildApp(platform, profile) {
  log(`\n🏗️  ${platform} 플랫폼에서 ${profile} 빌드 시작...`, 'cyan');

  // 환경 설정
  if (profile === 'production') {
    exec('npm run prod:env', '프로덕션 환경 설정');
  } else {
    exec('npm run dev:env', '개발 환경 설정');
  }

  // 빌드 명령 구성
  let buildCommand;
  if (profile === 'production') {
    if (platform === 'ios') {
      buildCommand = 'eas build --platform ios --profile production-ios';
    } else if (platform === 'android') {
      buildCommand = 'eas build --platform android --profile production-android';
    } else {
      buildCommand = 'eas build --platform all --profile production';
    }
  } else {
    buildCommand = `eas build --platform ${platform} --profile ${profile}`;
  }

  // 빌드 실행
  exec(buildCommand, '앱 빌드');
}

async function submitToStores(platform) {
  log('\n📱 앱스토어 제출 중...', 'cyan');

  if (platform === 'ios' || platform === 'all') {
    try {
      exec('eas submit --platform ios --latest', 'iOS App Store 제출');
    } catch (error) {
      log('⚠️  iOS 제출 실패 (계속 진행)', 'yellow');
    }
  }

  if (platform === 'android' || platform === 'all') {
    try {
      exec('eas submit --platform android --latest', 'Google Play Store 제출');
    } catch (error) {
      log('⚠️  Android 제출 실패 (계속 진행)', 'yellow');
    }
  }
}

async function generateBuildSummary() {
  log('\n📊 빌드 요약 생성 중...', 'cyan');

  try {
    const buildList = execSync('eas build:list --limit 5 --json', { encoding: 'utf8' });
    const builds = JSON.parse(buildList);

    log('\n📋 최근 빌드 현황:', 'magenta');
    builds.forEach((build, index) => {
      const status = build.status === 'finished' ? '✅' : build.status === 'in-progress' ? '🔄' : '❌';
      const platform = build.platform === 'ios' ? '🍎' : '🤖';
      log(`${index + 1}. ${platform} ${build.buildProfile} - ${status} ${build.status}`);
    });

    // 빌드 정보를 파일로 저장
    const summary = {
      timestamp: new Date().toISOString(),
      builds: builds.slice(0, 5),
      deployment_info: {
        script_version: '1.0.0',
        deployed_by: 'manual-script'
      }
    };

    fs.writeFileSync('build-summary.json', JSON.stringify(summary, null, 2));
    log('📁 빌드 요약이 build-summary.json에 저장되었습니다', 'green');

  } catch (error) {
    log('⚠️  빌드 요약 생성 실패', 'yellow');
  }
}

async function displayNextSteps(buildType, platform, submit) {
  log('\n🎉 배포 완료!', 'green');
  log('\n📋 다음 단계:', 'magenta');

  if (buildType.profile === 'development') {
    log('1. Expo Go 앱에서 개발 빌드 테스트');
    log('2. QR 코드 스캔으로 앱 실행');
  } else if (buildType.profile === 'preview') {
    log('1. TestFlight (iOS) 또는 Internal Testing (Android)으로 테스트');
    log('2. 베타 테스터들에게 배포');
  } else if (buildType.profile === 'production') {
    if (submit) {
      log('1. App Store Connect / Google Play Console에서 제출 상태 확인');
      log('2. 앱스토어 심사 대기');
      log('3. 승인 후 앱스토어에서 앱 확인');
    } else {
      log('1. 빌드 다운로드하여 수동 테스트');
      log('2. 앱스토어에 수동 업로드 (필요시)');
    }
  }

  log('\n🔗 유용한 링크:', 'cyan');
  log('- EAS Build Dashboard: https://expo.dev/');
  log('- App Store Connect: https://appstoreconnect.apple.com/');
  log('- Google Play Console: https://play.google.com/console/');
  log('- 배포 가이드: ./DEPLOYMENT_GUIDE.md');
}

async function main() {
  try {
    // 헤더 출력
    log('🚀 타로 타이머 빠른 배포 스크립트', 'bright');
    log('=' .repeat(50), 'cyan');

    // 사전 요구사항 확인
    await checkPrerequisites();

    // 빌드 유형 및 플랫폼 선택
    const buildType = await selectBuildType();
    const platform = await selectPlatform();

    // 확인
    log(`\n📋 배포 설정 확인:`, 'magenta');
    log(`   🔧 빌드 프로필: ${buildType.profile}`);
    log(`   📱 플랫폼: ${platform}`);
    log(`   📤 앱스토어 제출: ${buildType.submit ? '예' : '아니요'}`);

    const confirm = await askQuestion('\n계속 진행하시겠습니까? (Y/n): ');
    if (confirm.toLowerCase() === 'n') {
      log('❌ 배포가 취소되었습니다', 'yellow');
      process.exit(0);
    }

    // 품질 검사 실행
    await runQualityChecks();

    // 앱 빌드
    await buildApp(platform, buildType.profile);

    // 앱스토어 제출 (필요시)
    if (buildType.submit) {
      await submitToStores(platform);
    }

    // 빌드 요약 생성
    await generateBuildSummary();

    // 다음 단계 안내
    await displayNextSteps(buildType, platform, buildType.submit);

  } catch (error) {
    log(`\n❌ 배포 실패: ${error.message}`, 'red');
    log('\n🛠️  문제 해결:', 'yellow');
    log('1. 네트워크 연결 확인');
    log('2. Expo 로그인 상태 확인 (eas whoami)');
    log('3. 프로젝트 설정 확인 (app.json, eas.json)');
    log('4. DEPLOYMENT_GUIDE.md 참조');
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  buildApp,
  submitToStores
};