// 타로 타이머 웹앱 - 자동화 테스트 러너
// 브라우저 환경에서 실행할 수 있는 테스트 스크립트

class TarotTimerTestRunner {
  constructor() {
    this.testResults = [];
    this.currentTest = null;

    // 테스트 상태 추적
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  // 테스트 실행 시작
  async runAllTests() {
    console.log('🔮 타로 타이머 웹앱 자동 테스트 시작');
    console.log('======================================');

    try {
      await this.testEnvironmentSetup();
      await this.testUIComponents();
      await this.testCoreFeatures();
      await this.testDataPersistence();
      await this.testPerformance();

      this.generateReport();
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
    }
  }

  // 환경 설정 테스트
  async testEnvironmentSetup() {
    this.startTest('환경 설정 및 기본 접근성');

    try {
      // 기본 DOM 요소 확인
      this.assert(document.title, '타이틀이 설정되어 있는지 확인');
      this.assert(document.querySelector('#root'), 'React 루트 엘리먼트 존재 확인');

      // 스타일시트 로딩 확인
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      this.assert(stylesheets.length > 0, '스타일시트가 로드되었는지 확인');

      this.passTest('환경 설정 완료');
    } catch (error) {
      this.failTest('환경 설정 실패', error);
    }
  }

  // UI 컴포넌트 테스트
  async testUIComponents() {
    this.startTest('UI 컴포넌트 렌더링');

    try {
      // 기본 레이아웃 확인
      await this.waitForElement('[data-testid="app-container"]', 5000);

      // 네비게이션 탭 확인
      const tabElements = document.querySelectorAll('[data-testid*="tab"]');
      this.assert(tabElements.length >= 3, '최소 3개의 탭이 존재하는지 확인');

      // SVG 아이콘 시스템 확인
      const svgElements = document.querySelectorAll('svg');
      this.assert(svgElements.length > 0, 'SVG 아이콘이 렌더링되었는지 확인');

      // 그라데이션 버튼 확인
      const buttons = document.querySelectorAll('button');
      this.assert(buttons.length > 0, '버튼 요소들이 렌더링되었는지 확인');

      this.passTest('UI 컴포넌트 정상 렌더링');
    } catch (error) {
      this.failTest('UI 컴포넌트 렌더링 실패', error);
    }
  }

  // 핵심 기능 테스트
  async testCoreFeatures() {
    this.startTest('타로 카드 핵심 기능');

    try {
      // 카드 뽑기 버튼 확인
      const drawButton = await this.waitForElement('[data-testid="draw-card-button"]', 3000);
      this.assert(drawButton, '카드 뽑기 버튼이 존재하는지 확인');

      // 카드 뽑기 동작 시뮬레이션
      if (drawButton) {
        drawButton.click();
        await this.wait(1000);

        // 카드 표시 영역 확인
        const cardDisplay = document.querySelector('[data-testid="card-display"]');
        this.assert(cardDisplay, '카드 표시 영역이 나타나는지 확인');
      }

      // 저널 기능 확인
      const journalButton = document.querySelector('[data-testid="journal-button"]');
      if (journalButton) {
        this.assert(true, '저널 버튼 존재 확인');
      } else {
        this.warn('저널 버튼을 찾을 수 없음');
      }

      this.passTest('핵심 기능 테스트 완료');
    } catch (error) {
      this.failTest('핵심 기능 테스트 실패', error);
    }
  }

  // 데이터 지속성 테스트
  async testDataPersistence() {
    this.startTest('로컬 스토리지 데이터 지속성');

    try {
      // 로컬 스토리지 확인
      const storageAvailable = typeof(Storage) !== "undefined";
      this.assert(storageAvailable, '로컬 스토리지 사용 가능 확인');

      // 테스트 데이터 저장 및 확인
      const testKey = 'tarot-timer-test';
      const testData = { test: true, timestamp: Date.now() };

      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrievedData = JSON.parse(localStorage.getItem(testKey));

      this.assert(retrievedData.test === true, '데이터 저장/조회 기능 확인');

      // 테스트 데이터 정리
      localStorage.removeItem(testKey);

      this.passTest('데이터 지속성 테스트 완료');
    } catch (error) {
      this.failTest('데이터 지속성 테스트 실패', error);
    }
  }

  // 성능 테스트
  async testPerformance() {
    this.startTest('성능 및 반응성');

    try {
      // 페이지 로딩 시간 확인
      const loadTime = performance.now();
      this.assert(loadTime < 5000, '페이지 로딩 시간이 5초 미만인지 확인');

      // 메모리 사용량 확인 (가능한 경우)
      if (performance.memory) {
        const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
        this.assert(memoryMB < 150, `메모리 사용량이 150MB 미만인지 확인 (현재: ${memoryMB.toFixed(1)}MB)`);
      }

      // DOM 요소 수 확인
      const elementCount = document.querySelectorAll('*').length;
      this.assert(elementCount < 1000, `DOM 요소 수가 적절한지 확인 (현재: ${elementCount}개)`);

      this.passTest('성능 테스트 완료');
    } catch (error) {
      this.failTest('성능 테스트 실패', error);
    }
  }

  // 테스트 헬퍼 메서드들
  startTest(testName) {
    this.currentTest = {
      name: testName,
      startTime: Date.now(),
      status: 'running'
    };
    console.log(`🔄 ${testName} 시작...`);
  }

  passTest(message) {
    this.currentTest.status = 'passed';
    this.currentTest.endTime = Date.now();
    this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;

    this.testResults.push({...this.currentTest, message});
    this.stats.total++;
    this.stats.passed++;

    console.log(`✅ ${this.currentTest.name} 완료 (${this.currentTest.duration}ms)`);
  }

  failTest(message, error) {
    this.currentTest.status = 'failed';
    this.currentTest.endTime = Date.now();
    this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
    this.currentTest.error = error;

    this.testResults.push({...this.currentTest, message});
    this.stats.total++;
    this.stats.failed++;

    console.log(`❌ ${this.currentTest.name} 실패: ${message}`);
    if (error) console.error(error);
  }

  warn(message) {
    this.stats.warnings++;
    console.log(`⚠️ 경고: ${message}`);
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`   ✓ ${message}`);
  }

  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 테스트 보고서 생성
  generateReport() {
    console.log('\n🔮 타로 타이머 웹앱 테스트 결과 보고서');
    console.log('=====================================');
    console.log(`📊 총 테스트: ${this.stats.total}개`);
    console.log(`✅ 통과: ${this.stats.passed}개`);
    console.log(`❌ 실패: ${this.stats.failed}개`);
    console.log(`⚠️ 경고: ${this.stats.warnings}개`);

    const successRate = (this.stats.passed / this.stats.total * 100).toFixed(1);
    console.log(`📈 성공률: ${successRate}%`);

    console.log('\n📋 상세 결과:');
    this.testResults.forEach(result => {
      const status = result.status === 'passed' ? '✅' : '❌';
      console.log(`${status} ${result.name} (${result.duration}ms)`);
      if (result.message) {
        console.log(`   ${result.message}`);
      }
    });

    // 전역 객체에 결과 저장 (브라우저에서 접근 가능)
    window.tarotTimerTestResults = {
      stats: this.stats,
      results: this.testResults,
      timestamp: new Date().toISOString()
    };

    console.log('\n💡 브라우저 콘솔에서 window.tarotTimerTestResults로 결과를 확인할 수 있습니다.');
  }
}

// 브라우저에서 테스트 실행을 위한 전역 함수
window.runTarotTimerTests = async function() {
  const testRunner = new TarotTimerTestRunner();
  await testRunner.runAllTests();
};

// 페이지 로드 후 자동 실행 (선택적)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔮 타로 타이머 테스트 준비 완료');
    console.log('💡 window.runTarotTimerTests()를 실행하여 테스트를 시작하세요.');
  });
} else {
  console.log('🔮 타로 타이머 테스트 준비 완료');
  console.log('💡 window.runTarotTimerTests()를 실행하여 테스트를 시작하세요.');
}

// CommonJS 내보내기 (Node.js 환경용)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TarotTimerTestRunner;
}