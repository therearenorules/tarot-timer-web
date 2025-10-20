# TestFlight 광고 테스트 가이드

**날짜**: 2025-10-20
**이슈**: TestFlight에서 광고가 표시되지 않음
**빌드**: iOS Build 35 (v1.0.4, Build 37)

---

## 🔍 **문제 원인 분석**

### **1. 환경 감지 시스템 (프로덕션)**

**현재 설정**:
```typescript
// utils/adConfig.ts
const isDevelopment = (() => {
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV === 'production') {
    return false; // 프로덕션으로 인식
  }
  // ...
})();
```

**eas.json**:
```json
"production-ios": {
  "env": {
    "EXPO_PUBLIC_APP_ENV": "production"  // TestFlight = 프로덕션
  }
}
```

**결과**:
- TestFlight 빌드는 **프로덕션 광고 ID 사용**
- AdMob 앱 승인 전: 광고 안 나옴

---

### **2. AdMob 앱 승인 대기 중**

**iOS 앱 등록**: 2025-10-17
**현재**: 2025-10-20 (3일 경과)
**예상 승인**: 1-7일 소요

**상태 확인**:
```
https://apps.admob.com/
→ 앱 → Tarot Timer (iOS)
→ 상태: "승인 대기" or "사용 가능"
```

---

### **3. 7일 무료 체험 (프리미엄)**

**자동 활성화**:
- 앱 최초 실행 시 자동으로 7일 무료 체험
- 프리미엄 사용자 = 광고 완전 차단

**확인 방법**:
- 설정 탭 → 프리미엄 구독
- "7일 무료체험" 표시 → 광고 안 나오는 게 정상

---

## ✅ **즉시 확인 방법**

### **방법 1: 프리미엄 상태 확인** (1분)

**TestFlight 앱에서**:
1. 설정 탭 이동
2. 프리미엄 구독 섹션 확인
3. 상태 표시 확인:
   - ✅ "7일 무료체험" → **광고 안 나오는 게 정상**
   - ✅ "프리미엄 활성" → 광고 안 나옴
   - ❌ 표시 없음 → 다른 원인

---

### **방법 2: AdMob Console 확인** (3분)

**AdMob Console**:
```
https://apps.admob.com/
```

**확인 단계**:
1. **앱 → Tarot Timer (iOS)**
2. **앱 상태**:
   - "사용 가능" ✅ → 광고 활성화됨
   - "승인 대기" ⏳ → 1-7일 대기 필요
   - "거부됨" ❌ → 재등록 필요

3. **광고 단위 상태**:
   - 배너: `ca-app-pub-4284542208210945/1544899037`
   - 전면: `ca-app-pub-4284542208210945/5479246942`
   - 각 상태: "사용 설정됨" 확인

---

### **방법 3: Xcode Console 로그** (5분)

**Mac이 있는 경우**:
1. iPhone을 Mac에 USB 연결
2. Xcode → Window → Devices and Simulators
3. 연결된 iPhone 선택
4. Console 창 열기
5. TestFlight 앱 실행
6. 필터: "AdManager" 검색

**확인할 로그**:

**정상 케이스**:
```
✅ AdManager 초기화 완료
✅ Google Mobile Ads SDK 초기화 완료
✅ 전면광고 ID: PRODUCTION (ca-app-pub-4284542208210945/5479246942)
✅ 전면광고 로드 완료
✅ 배너광고 로드 완료
```

**오류 케이스**:
```
❌ 광고 로드 실패: No fill
❌ 광고 단위 ID 오류: Invalid ad unit
❌ AdMob 앱 미승인: App not approved
❌ 네트워크 오류: Network error
```

**프리미엄 케이스**:
```
💎 프리미엄 사용자: 전면광고 건너뛰기
💎 프리미엄 상태 변경: 활성화
```

---

### **방법 4: 강제로 광고 표시 트리거** (2분)

**TestFlight 앱에서**:

1. **배너 광고 확인**:
   - 타이머 탭 하단 확인
   - 배너가 보이면 → 광고 시스템 작동 중

2. **전면 광고 트리거**:
   - 타이머 탭에서 카드 3-4개 클릭
   - 액션 카운터가 3에 도달하면 전면광고 표시
   - 또는 10분 대기 후 액션 수행

3. **시간 경과 확인**:
   - 설정 탭 → 앱 정보
   - 앱 설치 시간 확인
   - 7일 이내 = 무료 체험 중 = 광고 없음

---

## 🔧 **해결 방법**

### **해결책 1: AdMob 승인 대기** (추천)

**상황**: AdMob 앱이 "승인 대기" 상태

**조치**:
- 기다리기 (1-7일)
- 승인 후 자동으로 광고 표시됨
- 별도 빌드 불필요

**확인 방법**:
- AdMob Console에서 매일 확인
- 이메일 알림 대기

---

### **해결책 2: 7일 체험 종료 대기**

**상황**: 프리미엄 무료 체험 중

**조치**:
- 7일 체험 종료 대기
- 또는 AsyncStorage 데이터 삭제 (개발자만)

**테스트용 데이터 삭제 방법** (개발자):
1. 앱 삭제
2. 재설치
3. 7일 체험 다시 시작됨
4. 하지만 여전히 프리미엄이므로 광고 없음

**실제 테스트**:
- 별도 Apple ID로 TestFlight 설치
- 해당 ID로 구독하지 않은 상태 확인

---

### **해결책 3: 테스트 광고 ID로 임시 빌드** (30분)

**상황**: 광고가 표시되는지만 빠르게 확인하고 싶을 때

**조치**:

#### **Step 1: adConfig.ts 수정**
```typescript
// utils/adConfig.ts (lines 64-74)

// 🔴 임시 변경: 프로덕션에서도 테스트 광고 사용
const getCurrentAdUnits = () => {
  const platform = Platform.OS as 'ios' | 'android';

  // ⚠️ 테스트용: 항상 테스트 광고 사용
  return TEST_AD_UNITS[platform] || TEST_AD_UNITS.ios;

  // 원래 코드 (주석 처리)
  // if (isDevelopment || Platform.OS === 'web') {
  //   return TEST_AD_UNITS[platform] || TEST_AD_UNITS.ios;
  // }
  // return PRODUCTION_AD_UNITS[platform] || PRODUCTION_AD_UNITS.ios;
};
```

#### **Step 2: 버전 업그레이드 및 빌드**
```bash
# app.json 버전 증가 필요
# 1.0.4 → 1.0.5

eas build --platform ios --profile production-ios --non-interactive
```

#### **Step 3: TestFlight 업로드 및 테스트**
```bash
eas submit --platform ios --latest --non-interactive
```

#### **Step 4: 테스트 후 원복**
```bash
# 테스트 광고가 표시되면 AdMob 문제 아님
# 원래 코드로 복구하고 프로덕션 재빌드
```

**주의**:
- ⚠️ 이 방법은 **테스트 목적**만 사용
- 프로덕션 출시 전 **반드시 원복** 필요
- 테스트 광고 = Google 제공 샘플 광고 (수익 없음)

---

### **해결책 4: 프리미엄 테스트 계정 분리** (즉시)

**상황**: 프리미엄 없는 상태로 테스트

**조치**:

#### **방법 A: 다른 Apple ID 사용**
1. TestFlight에 다른 Apple ID 초대
2. 해당 ID로 앱 설치
3. 구독하지 않은 상태로 테스트

#### **방법 B: 앱 완전 삭제 후 재설치**
1. TestFlight 앱 완전 삭제
2. iPhone 설정 → 일반 → iPhone 저장공간
3. "Tarot Timer" 앱 삭제
4. 재설치 시 7일 체험 다시 시작
5. 하지만 여전히 무료 체험 = 광고 없음

#### **방법 C: 7일 후 재테스트**
1. 7일 체험 종료 대기
2. 구독하지 않으면 광고 자동 표시

---

## 📊 **진단 플로우차트**

```
TestFlight 광고 안 나옴
          ↓
[설정 탭 확인]
          ↓
"7일 무료체험" 표시?
   ↙        ↘
  Yes       No
   ↓         ↓
정상 동작   [AdMob Console 확인]
(광고 없음)        ↓
            앱 상태?
        ↙     ↓      ↘
   승인 대기   사용 가능   거부됨
      ↓         ↓        ↓
   1-7일 대기  Xcode 로그   재등록
              확인 필요    필요
```

---

## 🎯 **권장 조치 순서**

### **즉시 (지금)**
1. ✅ **설정 탭에서 프리미엄 상태 확인** (1분)
   - "7일 무료체험" 표시되면 → 정상 (광고 없는 게 맞음)

2. ✅ **AdMob Console 확인** (3분)
   - https://apps.admob.com/
   - 앱 상태: "승인 대기" vs "사용 가능"

### **단기 (오늘 내)**
3. ⏳ **Xcode Console 로그 확인** (5분, Mac 필요)
   - 광고 로드 성공/실패 로그 확인
   - 에러 메시지 수집

4. ⏳ **다른 Apple ID로 테스트** (10분)
   - 프리미엄 없는 상태로 확인

### **중기 (1-7일)**
5. ⏳ **AdMob 승인 대기**
   - 승인 후 자동으로 광고 표시됨

6. ⏳ **7일 체험 종료 후 재확인**
   - 무료 체험 종료 시 광고 표시 확인

---

## 📝 **체크리스트**

### **프리미엄 상태 확인**
- [ ] 설정 탭 열기
- [ ] 프리미엄 구독 섹션 확인
- [ ] "7일 무료체험" 표시 여부 확인
- [ ] 만료일 확인

### **AdMob Console 확인**
- [ ] AdMob Console 접속
- [ ] Tarot Timer iOS 앱 선택
- [ ] 앱 상태 확인 (승인 대기/사용 가능/거부됨)
- [ ] 광고 단위 상태 확인 (배너, 전면)

### **Xcode Console 로그 확인** (Mac 필요)
- [ ] iPhone을 Mac에 연결
- [ ] Xcode Console 열기
- [ ] TestFlight 앱 실행
- [ ] "AdManager" 로그 검색
- [ ] 광고 로드 성공/실패 로그 수집

### **다른 Apple ID 테스트**
- [ ] 다른 Apple ID로 TestFlight 초대
- [ ] 해당 ID로 앱 다운로드
- [ ] 프리미엄 없는 상태 확인
- [ ] 광고 표시 여부 확인

---

## 🔗 **관련 링크**

- **AdMob Console**: https://apps.admob.com/
- **iOS 앱 ID**: ca-app-pub-4284542208210945~6525956491
- **배너 광고 단위**: ca-app-pub-4284542208210945/1544899037
- **전면 광고 단위**: ca-app-pub-4284542208210945/5479246942
- **AdMob 지원**: https://support.google.com/admob/

---

**작성일**: 2025-10-20
**상태**: 진단 중 🔍
**우선순위**: 🟡 중간 (프리미엄 체험 중일 가능성 높음)
