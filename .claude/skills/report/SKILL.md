---
name: report
description: analysis/ 폴더의 5개 분석 보고서를 현재 앱 상태에 맞게 업데이트합니다. 버전, 완성도, 기술 현황을 반영합니다.
allowed-tools: Read, Edit, Write, Bash, Grep
---

# 분석 보고서 업데이트

analysis/ 폴더의 5개 보고서를 현재 상태로 업데이트합니다.

## 대상 파일

1. `analysis/00-comprehensive-analysis-summary.md` - 종합 요약
2. `analysis/01-development-progress-report.md` - 개발 진행 현황
3. `analysis/02-gaps-analysis-report.md` - 부족한 부분 분석
4. `analysis/03-future-development-plan.md` - 향후 개발 계획
5. `analysis/04-technical-recommendations-report.md` - 기술적 권장사항

## 업데이트 기준

1. **날짜**: 현재 날짜로 업데이트
2. **버전**: app.json의 iOS/Android 버전
3. **최근 작업**: 최근 커밋 내용 반영
4. **TypeScript**: 현재 오류 현황
5. **완성도**: 기능별 완성도 재계산

## 정보 수집

```bash
# 버전 확인
cat app.json | grep -E '"version"|"buildNumber"|"versionCode"'

# 최근 커밋
git log --oneline -5

# TypeScript 오류 개수
npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"

# 컴포넌트 수
ls -1 components/*.tsx 2>/dev/null | wc -l
```

## 완료 후

- Git 커밋 여부 확인
- 변경 요약 제공
