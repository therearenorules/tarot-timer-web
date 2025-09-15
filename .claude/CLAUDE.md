# 타로 타이머 웹앱 - Claude Code 프로젝트 룰

## 🎯 프로젝트 개요
React Native + Expo 기반의 24시간 타로 타이머 웹앱 프로젝트입니다.

**핵심 기능**: 
- 24시간 타로 카드 타이머
- SVG 아이콘 시스템 (25개+ 아이콘)
- 미스틱한 UI/UX 디자인
- 크로스 플랫폼 지원 (웹/iOS/Android)

## 🔧 개발 환경 룰

### 1. 오류 해결 우선순위
❌ **하지 말 것**: 기능을 되돌리거나 제거하는 방식으로 문제 해결
✅ **할 것**: 오류가 있어도 기존 기능을 유지하면서 호환성 개선

**적용 사례**:
- SVG 호환성 문제 → react-native-svg-web 추가 + Metro 설정으로 해결
- 버전 충돌 → 호환 버전으로 조정하되 기능은 유지
- 번들링 오류 → 설정 개선으로 해결, 컴포넌트는 보존

### 2. 기술 스택 보존 정책
- **SVG 아이콘**: 항상 유지 (벡터 그래픽 품질 보장)
- **미스틱 UI 디자인**: 보라/골드 테마, 그라데이션, 그림자 효과 유지
- **컴포넌트 구조**: Logo, BackgroundPattern, GradientButton 등 보존

## 📋 프로젝트 진행 룰

### Claude Code 접속 시 필수 체크리스트

1. **📊 분석 보고서 시스템 확인 (최우선)**
   ```bash
   # 필수 확인 파일 5개 (analysis/ 폴더)
   ls -la analysis/00-comprehensive-analysis-summary.md
   ls -la analysis/01-development-progress-report.md
   ls -la analysis/02-gaps-analysis-report.md
   ls -la analysis/03-future-development-plan.md
   ls -la analysis/04-technical-recommendations-report.md
   ```

   **체크 포인트**:
   - ✅ 5개 파일 모두 존재하는지 확인
   - ✅ 파일 수정일 확인 (최신 상태인지)
   - ✅ 프로젝트 완성도 현황 파악 (현재: 87%)
   - ✅ 우선순위 작업 항목 확인

2. **프로젝트 상태 확인**
   ```bash
   # 개발 서버 상태 체크
   netstat -an | findstr 808

   # 현재 실행 중인 Expo 프로세스 확인
   tasklist | findstr expo
   ```

3. **진행 상황 리뷰**
   - 최근 커밋 확인: `git log --oneline -5`
   - 변경된 파일 확인: `git status`
   - 패키지 의존성 확인: `npm list --depth=0`

4. **현재 구현 상태**
   - ✅ SVG 아이콘 시스템 (25개+ 아이콘)
   - ✅ 브랜드 로고 컴포넌트
   - ✅ 미스틱 배경 패턴
   - ✅ 그라데이션 버튼 시스템
   - ✅ 타로카드 컴포넌트
   - ✅ 웹 호환성 (react-native-svg-web)

5. **개발 서버 실행 확인**
   ```bash
   # 서버가 없으면 시작
   npx expo start --port 8083

   # 브라우저 테스트
   start http://localhost:8083
   ```

## 📊 **분석 보고서 관리 룰**

### 백업 요청 시 자동 업데이트 규칙

사용자가 "백업 요청" 또는 "보고서 업데이트" 요청 시 다음 작업을 수행:

```bash
# 1. 현재 프로젝트 상태 재분석
# 2. 5개 핵심 보고서 자동 업데이트
analysis/00-comprehensive-analysis-summary.md    # 종합 요약
analysis/01-development-progress-report.md       # 개발 진행 현황
analysis/02-gaps-analysis-report.md             # 부족한 부분 분석
analysis/03-future-development-plan.md          # 향후 개발 계획
analysis/04-technical-recommendations-report.md # 기술적 권장사항

# 3. 백업 폴더에 자동 복사
mkdir backup-analysis-$(date +%Y-%m-%d)
cp analysis/*.md backup-analysis-$(date +%Y-%m-%d)/
```

### 보고서 시스템 유지 규칙

1. **완성도 추적**: 매번 정확한 완성도 % 계산
2. **우선순위 업데이트**: 비즈니스 임팩트 기반 재정렬
3. **기술 동향 반영**: 새로운 기술 스택 변화 반영
4. **일관성 유지**: 5개 보고서 간 데이터 정합성 보장

### 개발 워크플로우

1. **새로운 작업 시작 전**
   - 현재 앱 상태 확인 (브라우저에서 테스트)
   - 콘솔 오류 검토
   - 기존 기능 동작 확인

2. **오류 발생 시 대응**
   - 기능 제거보다는 호환성 개선 우선
   - 대안 라이브러리나 설정 변경으로 해결
   - 최후의 수단으로만 기능 단순화 고려

3. **코드 변경 시**
   - 기존 컴포넌트 구조 보존
   - UI/UX 일관성 유지
   - 크로스 플랫폼 호환성 고려

## 🎨 디자인 가이드라인

### 색상 팔레트
- **Primary**: `#7b2cbf` (보라)
- **Secondary**: `#f4d03f` (골드)
- **Accent**: `#d4b8ff` (라이트 퍼플)
- **Background**: `#1a1625` (다크 퍼플)
- **Surface**: `#2d1b47` (미드 퍼플)

### 컴포넌트 스타일링 원칙
- 그라데이션과 그림자 효과 적극 활용
- 반투명 배경으로 레이어 구성
- 골드 테두리로 프리미엄 느낌 연출
- 미스틱한 기하학 패턴 배경

## 📱 테스트 환경

### 지원 플랫폼
- **웹**: Chrome, Safari, Edge (localhost:8083)
- **모바일**: Expo Go 앱을 통한 개발 테스트
- **반응형**: 모바일 우선 디자인

### 성능 최적화
- SVG 아이콘으로 벡터 품질 보장
- 그라데이션 버튼으로 일관된 인터랙션
- 로컬 스토리지를 통한 데이터 지속성

## 🔄 지속적 개선

### 정기 체크포인트
- 매 세션 시작 시 프로젝트 상태 리뷰
- 새로운 기능 추가 시 기존 기능 영향 평가
- 크로스 플랫폼 호환성 테스트

### 코드 품질 관리
- TypeScript 엄격 모드 준수
- 컴포넌트 재사용성 최대화
- 성능과 사용자 경험 균형 유지

---

---

## 📋 **프로젝트 현황 요약**

**현재 완성도**: 87% (2025-09-15 기준)
**프론트엔드**: 95% 완성 ✅
**백엔드**: 75% 완성 🔄
**우선순위 작업**: Supabase 연동, 인증 UI, 데이터 동기화

---

**마지막 업데이트**: 2025-09-15 (종합 분석 보고서 시스템 구축 완료)
**현재 상태**: 🟢 정상 동작 + 📊 분석 시스템 완비
**분석 보고서**: 5개 핵심 보고서 완성 (analysis/ 폴더)