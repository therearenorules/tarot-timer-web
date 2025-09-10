#!/usr/bin/env node
/**
 * 타로 타이머 프로젝트 상태 체크 스크립트
 * Claude Code 세션 시작 시 자동으로 프로젝트 상태를 확인합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔮 타로 타이머 프로젝트 상태 체크\n');

// 1. 프로젝트 정보 확인
console.log('📋 프로젝트 정보:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`   이름: ${packageJson.name || 'tarot-timer-web'}`);
  console.log(`   버전: ${packageJson.version || '1.0.0'}`);
} catch (error) {
  console.log('   ❌ package.json을 읽을 수 없습니다');
}

// 2. Git 상태 확인
console.log('\n📁 Git 상태:');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const gitLog = execSync('git log --oneline -3', { encoding: 'utf8' });
  
  if (gitStatus.trim()) {
    console.log('   🟡 변경된 파일들이 있습니다:');
    console.log(gitStatus.split('\n').map(line => `      ${line}`).join('\n'));
  } else {
    console.log('   ✅ 모든 변경사항이 커밋되었습니다');
  }
  
  console.log('   최근 커밋:');
  console.log(gitLog.split('\n').slice(0, 3).map(line => `      ${line}`).join('\n'));
} catch (error) {
  console.log('   ❌ Git 정보를 읽을 수 없습니다');
}

// 3. 개발 서버 상태 확인
console.log('\n🌐 개발 서버 상태:');
try {
  const ports = [8082, 8083, 8084];
  let runningPorts = [];
  
  for (const port of ports) {
    try {
      const result = execSync(`netstat -an | findstr :${port}`, { encoding: 'utf8' });
      if (result.includes('LISTENING')) {
        runningPorts.push(port);
      }
    } catch (e) {
      // Port not in use
    }
  }
  
  if (runningPorts.length > 0) {
    console.log(`   ✅ 실행 중인 서버: localhost:${runningPorts.join(', localhost:')}`);
    console.log(`   🌍 테스트 URL: http://localhost:${runningPorts[0]}`);
  } else {
    console.log('   🟡 실행 중인 서버가 없습니다');
    console.log('   💡 서버 시작: npx expo start --port 8083');
  }
} catch (error) {
  console.log('   ❌ 서버 상태를 확인할 수 없습니다');
}

// 4. 의존성 상태 확인
console.log('\n📦 핵심 의존성:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = packageJson.dependencies || {};
  
  const criticalDeps = {
    'expo': deps.expo,
    'react-native': deps['react-native'],
    'react-native-svg': deps['react-native-svg'],
    'react-native-svg-web': deps['react-native-svg-web']
  };
  
  Object.entries(criticalDeps).forEach(([name, version]) => {
    if (version) {
      console.log(`   ✅ ${name}: ${version}`);
    } else {
      console.log(`   ❌ ${name}: 설치되지 않음`);
    }
  });
} catch (error) {
  console.log('   ❌ 의존성 정보를 읽을 수 없습니다');
}

// 5. 프로젝트 진행률 표시
console.log('\n📊 프로젝트 진행률:');
console.log('   ✅ UI/UX 디자인 시스템: 100%');
console.log('   ✅ 기술적 구현: 90%');
console.log('   ✅ 핵심 타로 기능: 80%');
console.log('   ✅ 사용자 인터페이스: 85%');
console.log('   🚧 전체 진행률: 85%');

// 6. 다음 할 일
console.log('\n🎯 다음 우선순위:');
console.log('   1. 스프레드 탭 구현 (3카드 레이아웃)');
console.log('   2. 저널 탭 기본 기능');
console.log('   3. 설정 탭 완성');

// 7. 알려진 이슈
console.log('\n🐛 알려진 이슈:');
console.log('   🟡 Jimp 라이브러리 경고 (기능에 영향 없음)');

console.log('\n' + '='.repeat(50));
console.log('🎭 프로젝트 상태 체크 완료!');
console.log('💫 행운을 빕니다!');
console.log('='.repeat(50));