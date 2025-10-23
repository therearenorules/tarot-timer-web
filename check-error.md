# 오류 확인 방법

## 1. Xcode Console로 실시간 로그 확인 (가장 정확)

### 설정 방법:
1. Mac에서 **Xcode** 실행
2. 상단 메뉴 **Window → Devices and Simulators**
3. 왼쪽에서 **iPhone 선택**
4. 하단 **"Open Console"** 버튼 클릭
5. **TestFlight 앱 실행**

### 확인할 내용:
- [ERROR] 로그
- console.error 메시지
- 정확한 파일명과 라인 번호

---

## 2. 제가 추측하는 원인

ErrorBoundary가 작동했다는 것은 **앱 초기화 중 오류 발생**

가능성 높은 원인:
1. **Supabase 초기화 실패** (lib/supabase.ts)
2. **Context 초기화 순서 문제** (AuthContext → TarotContext → NotificationContext → PremiumContext)
3. **AsyncStorage 접근 오류**

---

## 3. 임시 디버깅 빌드

지금 개발 서버에서 테스트하면 정확한 에러 메시지를 볼 수 있습니다.

현재 실행 중: http://localhost:8090
