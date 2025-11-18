# 🚨 프리미엄 가격 미표시 문제 - 해결 방안

## 📊 **문제 진단 완료**

### 로그 분석 결과:
```
오류 16:04:28.895845+0900 TarotTimerLearnCardMeanings ❌ 구독 상품 API를 사용할 수 없습니다.
오류 16:04:28.895912+0900 TarotTimerLearnCardMeanings '❌ 구독 상품 로드 오류:', [Error: SUBSCRIPTIONS_API_NOT_AVAILABLE]
```

### 🔍 **핵심 원인**

**`react-native-iap` 모듈이 TestFlight 빌드에 포함되지 않았습니다.**

에러 발생 지점: [utils/iapManager.ts:188-190](utils/iapManager.ts#L188-L190)
```typescript
if (!RNIap || typeof RNIap.getProducts !== 'function') {
  console.error('❌ 구독 상품 API를 사용할 수 없습니다.');
  throw new Error('SUBSCRIPTIONS_API_NOT_AVAILABLE');
}
```

### 📌 **왜 이런 일이 발생했나?**

1. **Expo Managed Workflow의 제약**
   - `react-native-iap`는 **네이티브 모듈**입니다
   - EAS 빌드 시 자동으로 포함되어야 하지만, 때때로 누락됨
   - 특히 Expo SDK 업데이트 후 발생 가능

2. **현재 빌드 구성 확인**
   - `package.json`: `react-native-iap: ^14.4.23` ✅ 설치됨
   - `app.json`: Config Plugin 없음 ⚠️
   - EAS 빌드: 네이티브 모듈 링크 누락 추정 ❌

---

## ✅ **해결 방법**

### 방법 1: Config Plugin 추가 (권장)

#### 1. `@config-plugins/react-native-iap` 설치
```bash
npm install --save-dev @config-plugins/react-native-iap
```

#### 2. `app.json`에 플러그인 추가
```json
{
  "expo": {
    "plugins": [
      "expo-notifications",
      "react-native-google-mobile-ads",
      "expo-build-properties",
      "expo-font",
      "@config-plugins/react-native-iap"  // ← 추가
    ]
  }
}
```

#### 3. 새 빌드 생성
```bash
eas build --platform ios --profile preview
```

---

### 방법 2: Prebuild 방식 (더 확실함)

#### 1. iOS 네이티브 폴더 생성
```bash
npx expo prebuild --platform ios --clean
```

#### 2. CocoaPods 설치
```bash
cd ios && pod install && cd ..
```

#### 3. 확인
```bash
# Podfile에 RNIap이 있는지 확인
cat ios/Podfile | grep -i iap
```

출력 예상:
```ruby
pod 'RNIap', :path => '../node_modules/react-native-iap'
```

#### 4. EAS 빌드
```bash
eas build --platform ios --profile preview
```

---

### 방법 3: package.json에 postinstall 스크립트 추가

#### 1. `package.json` 수정
```json
{
  "scripts": {
    "postinstall": "cd ios && pod install || true"
  }
}
```

#### 2. 재빌드
```bash
npm install
eas build --platform ios --profile preview
```

---

## 🎯 **즉시 할 수 있는 임시 해결책**

### TestFlight에서 테스트하려면:

1. **방법 1 또는 2로 새 빌드 생성 필요**
   - 현재 Build 123은 `react-native-iap` 모듈 누락
   - 새 빌드 없이는 해결 불가

2. **로컬에서 테스트 (Xcode 직접 빌드)**
   ```bash
   # 네이티브 폴더 생성
   npx expo prebuild --platform ios --clean
   
   # CocoaPods 설치
   cd ios && pod install && cd ..
   
   # Xcode에서 열기
   open ios/tarottimer.xcworkspace
   
   # Xcode에서 실기기에 Run (Cmd+R)
   ```

---

## 📋 **새 빌드 체크리스트**

### 빌드 전 확인:
```
[ ] @config-plugins/react-native-iap 설치
[ ] app.json에 플러그인 추가
[ ] package.json 의존성 최신화
[ ] npx expo-doctor 실행 (문제 없는지 확인)
```

### 빌드 명령어:
```bash
# Preview 빌드 (TestFlight용)
eas build --platform ios --profile preview

# 또는 Production 빌드
eas build --platform ios --profile production-ios
```

### 빌드 후 확인:
```bash
# 빌드 완료 후 TestFlight 업로드
eas submit --platform ios --latest

# TestFlight 앱 설치 후 프리미엄 화면에서 확인:
# 1. "✅ react-native-iap 모듈 로드 성공" 로그 있는지
# 2. "📦 응답 길이: 2" 로그 있는지
# 3. 가격 표시되는지
```

---

## 🔧 **진단용 로그 추가됨**

`utils/iapManager.ts`에 상세 로그 추가:
```typescript
console.log('✅ react-native-iap 모듈 로드 성공');
console.log('📦 RNIap 객체 타입:', typeof RNIap);
console.log('📦 RNIap.getProducts 타입:', typeof RNIap?.getProducts);
console.log('📦 사용 가능한 메서드:', Object.keys(RNIap || {}).filter(...));
```

### 정상 로그 예시:
```
✅ react-native-iap 모듈 로드 성공
📦 RNIap 객체 타입: object
📦 RNIap.getProducts 타입: function
📦 사용 가능한 메서드: ['initConnection', 'getProducts', 'requestSubscription', ...]
```

### 에러 로그 예시 (현재 상태):
```
❌ react-native-iap 로드 실패: Error: Unable to resolve module
또는
📦 RNIap 객체 타입: undefined
📦 RNIap.getProducts 타입: undefined
```

---

## 💡 **왜 Sandbox 계정이 아니어도 되는가?**

맞습니다! TestFlight 빌드에서는:
- ✅ **일반 Apple ID로 로그인 가능**
- ✅ **실제 결제 시도 시 자동으로 Sandbox 모드로 전환됨**
- ✅ **가격 정보는 Sandbox 계정 없이도 로드됨**

**단, 전제 조건:**
- 📱 `react-native-iap` 모듈이 빌드에 포함되어야 함 ← 현재 누락!
- 🏪 App Store Connect 상품이 "사용 가능" 상태 ← 확인됨 ✅

---

## 🚀 **최종 해결 절차**

### Step 1: Config Plugin 설치
```bash
npm install --save-dev @config-plugins/react-native-iap
```

### Step 2: app.json 수정
```json
{
  "expo": {
    "plugins": [
      "expo-notifications",
      "react-native-google-mobile-ads",
      "expo-build-properties",
      "expo-font",
      "@config-plugins/react-native-iap"
    ]
  }
}
```

### Step 3: 검증 (로컬)
```bash
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
open ios/tarottimer.xcworkspace

# Xcode에서 실기기에 Run
# 프리미엄 화면에서 가격 표시 확인
```

### Step 4: 새 빌드 생성 (사용자가 준비되면)
```bash
# buildNumber 자동 증가 (123 → 124)
eas build --platform ios --profile preview
eas submit --platform ios --latest
```

---

## 📊 **요약**

### 문제:
- `react-native-iap` 네이티브 모듈이 Build 123에 포함 안 됨
- TestFlight 앱에서 가격 정보를 로드할 수 없음

### 원인:
- EAS 빌드 시 네이티브 모듈 링크 누락
- Config Plugin 미설정

### 해결:
1. `@config-plugins/react-native-iap` 설치
2. `app.json`에 플러그인 추가
3. 새 빌드 생성 (Build 124)

### 예상 소요 시간:
- 설정 변경: 5분
- 빌드 생성: 15-20분
- TestFlight 배포: 5-10분
- **총 30-35분**

---

**준비되면 말씀해주세요. 새 빌드를 생성하겠습니다!**
