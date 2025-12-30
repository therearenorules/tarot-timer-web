---
name: status
description: 타로 타이머 앱의 전체 상태를 확인합니다. Git 상태, 버전, 최근 커밋, TypeScript 오류, 개발 서버 상태를 보고합니다.
allowed-tools: Bash, Read, Grep
---

# 프로젝트 상태 확인

현재 타로 타이머 앱의 전체 상태를 확인합니다.

## 확인 항목

1. **Git 상태**: 커밋되지 않은 변경사항
2. **현재 버전**: app.json의 iOS/Android 버전
3. **최근 커밋**: 최근 3개 커밋 내역
4. **TypeScript 오류**: 타입 체크 오류 개수
5. **개발 서버**: 포트 8081/8083 실행 상태

## 실행 명령어

```bash
# Git 상태
git status --short

# 버전 확인
cat app.json | grep -E '"version"|"buildNumber"|"versionCode"'

# 최근 커밋
git log --oneline -3

# TypeScript 오류 개수
npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"

# 개발 서버 상태
lsof -i :8081 -i :8083 2>/dev/null | head -3
```

## 보고 형식

간결한 테이블 형식으로 요약해서 보고해주세요:

| 항목 | 상태 |
|------|------|
| Git | 변경사항 n개 / 클린 |
| 버전 | iOS vX.X.X Build XXX / Android vX.X.X Build XXX |
| 최근 커밋 | 커밋 해시 - 메시지 |
| TS 오류 | n개 |
| 서버 | 실행 중 / 중지됨 |
