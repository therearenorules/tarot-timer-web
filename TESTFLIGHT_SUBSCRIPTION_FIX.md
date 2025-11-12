# TestFlight 구독 오류 해결 방안 - Build 121

## ✅ 확인 완료된 사항
- [x] "Cleared for Sale" 체크박스: **체크됨**
- [x] Paid Applications Agreement: **Active**
- [x] V2 Product IDs 생성: **저번주 (동기화 완료)**

## 🔴 핵심 문제: TestFlight Sandbox 환경 설정

App Store Connect 설정이 모두 정상이지만 TestFlight에서 오류가 발생하는 경우, **Sandbox 테스트 계정 및 환경 설정 문제**입니다.

---

## 🎯 즉시 해결 방법 (단계별)

### 1️⃣ Sandbox 계정 완전 재설정

#### A. iOS 기기에서 기존 Sandbox 로그아웃
```
1. iOS 설정 앱 열기
2. 맨 위 Apple ID (이름) 탭
3. "미디어 및 구입" 탭
4. "로그아웃" 선택
5. App Store 앱 → 로그아웃
```

#### B. 새로운 Sandbox 테스트 계정 생성
```
1. App Store Connect 웹 접속
2. Users and Access → Sandbox Testers
3. 기존 계정 삭제 (있다면)
4. "+ 추가" 버튼 클릭
5. 새 테스트 계정 정보 입력:
   - 이메일: tarot.tester.v2@icloud.com (예시)
   - 비밀번호: 강력한 비밀번호 (영문+숫자+특수문자)
   - 국가: 대한민국
6. 저장
```

#### C. iOS 기기에서 Sandbox 계정 로그인
```
1. iOS 설정 → App Store
2. 맨 아래로 스크롤
3. "SANDBOX ACCOUNT" 섹션 찾기
4. 새로 만든 테스트 계정으로 로그인
5. 비밀번호 입력
```

**중요**: 반드시 **"SANDBOX ACCOUNT"** 섹션에서 로그인해야 합니다!
일반 Apple ID 로그인과는 다릅니다.

---

### 2️⃣ TestFlight 앱 완전 재설치

#### A. 앱 삭제
```
1. TestFlight에서 Tarot Timer 앱 길게 누르기
2. "앱 삭제" 선택
3. 앱 데이터 및 캐시 완전 삭제 확인
```

#### B. 기기 재부팅
```
1. iPhone 전원 끄기
2. 10초 대기
3. 다시 켜기
```

#### C. TestFlight에서 앱 재설치
```
1. TestFlight 앱 열기
2. Tarot Timer (Build 121) 다운로드
3. 설치 완료 대기
```

---

### 3️⃣ 구독 상품 로드 테스트

#### A. 앱 실행 및 로그 확인
```
1. Tarot Timer 앱 실행
2. 설정 탭 → 프리미엄 구독
3. 로딩 화면 관찰
```

#### B. 예상 동작
**정상 작동 시**:
- ⏳ 로딩 인디케이터 표시 (최대 30초)
- ✅ "Monthly Premium $4.99" 표시
- ✅ "Yearly Premium $34.99" 표시

**오류 발생 시 메시지**:
- "구독 상품 준비 중" → `NO_SUBSCRIPTIONS_FOUND`
- "연결 시간 초과" → `TIMEOUT_ERROR`
- "네트워크 연결 오류" → `NETWORK_ERROR`

---

### 4️⃣ 추가 디버깅 옵션

#### A. Xcode Console 로그 확인 (가능하다면)
```
1. Mac에서 Xcode 열기
2. Window → Devices and Simulators
3. iPhone 연결
4. Tarot Timer 앱 선택
5. Console 탭에서 로그 확인

예상 로그:
✅ react-native-iap 모듈 로드 성공
📦 구독 상품 로드 시도: ['tarot_timer_monthly_v2', 'tarot_timer_yearly_v2']
🔄 RNIap.getSubscriptions() 호출 중...
```

#### B. 네트워크 연결 확인
```
1. WiFi 연결 확인
2. Safari에서 apple.com 접속 테스트
3. VPN 사용 중이라면 비활성화
4. 방화벽 설정 확인
```

---

## 🔧 대안: StoreKit Configuration File 테스트 (로컬 개발)

Xcode에서 로컬 테스트를 위한 StoreKit Configuration 파일이 이미 있습니다:
`TarotTimer.storekit`

### 로컬 테스트 방법:
```
1. Xcode에서 프로젝트 열기
2. Product → Scheme → Edit Scheme
3. Run → Options
4. StoreKit Configuration: TarotTimer.storekit 선택
5. 앱 실행 (시뮬레이터 또는 실제 기기)
```

이렇게 하면 **실제 App Store Connect 없이** 로컬에서 구독 테스트 가능합니다.

---

## 🚨 여전히 안 되는 경우

### 코드 레벨 긴급 수정

만약 위 모든 방법을 시도했는데도 안 된다면, **fallback 메커니즘 추가**가 필요합니다:

#### 수정 1: Product ID를 하드코딩으로 명시적 지정
```typescript
// utils/iapManager.ts에서 loadProducts() 수정
const skus = [
  'tarot_timer_monthly_v2',  // 명시적 지정
  'tarot_timer_yearly_v2'    // 명시적 지정
];
```

#### 수정 2: iOS 버전별 분기 처리
```typescript
// iOS 15 이상에서는 StoreKit 2 사용
if (Platform.OS === 'ios' && parseInt(Platform.Version as string) >= 15) {
  // StoreKit 2 로직
} else {
  // StoreKit 1 로직 (fallback)
}
```

#### 수정 3: 더 긴 타임아웃 설정
```typescript
// 타임아웃을 60초로 증가
timeoutMs: 60000  // 30초 → 60초
```

---

## 📊 체크리스트

### 즉시 시도할 순서:
- [ ] 1. Sandbox 계정 로그아웃 → 새 계정 생성 → 재로그인
- [ ] 2. TestFlight 앱 삭제 → 기기 재부팅 → 재설치
- [ ] 3. 앱 실행 → 구독 화면 → 에러 메시지 확인
- [ ] 4. Xcode Console 로그 확인 (가능하면)
- [ ] 5. StoreKit Configuration 로컬 테스트

### 각 단계 후 확인:
- [ ] 에러 메시지가 달라졌는지?
- [ ] 로딩 시간이 얼마나 걸리는지?
- [ ] 재시도 메커니즘이 작동하는지?

---

## 🎯 예상 결과

**가장 가능성 높은 원인**: 
1. **Sandbox 계정 문제** (70% 확률)
   - 기존 Sandbox 계정이 오래되어 만료됨
   - Sandbox 계정이 올바른 섹션에 로그인되지 않음

2. **TestFlight 캐시 문제** (20% 확률)
   - 이전 빌드의 캐시가 남아있음
   - 앱 재설치로 해결 가능

3. **일시적 Apple 서버 문제** (10% 확률)
   - Apple 서버 점검 또는 지연
   - 1-2시간 후 재시도

---

## 📞 결과 보고

위 단계를 시도한 후 다음 정보를 알려주세요:

1. **어느 단계까지 완료했는지**
2. **각 단계에서 나타난 에러 메시지** (정확한 텍스트)
3. **Sandbox 계정 새로 만들었는지** (Yes/No)
4. **앱 재설치 했는지** (Yes/No)
5. **여전히 같은 오류인지, 다른 오류인지**

이 정보를 바탕으로 추가 조치를 취하겠습니다!
