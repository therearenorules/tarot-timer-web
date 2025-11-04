# 구독 오류 수정 요약

**수정일**: 2025-10-31
**영향 범위**: IAP 시스템 전체
**우선순위**: 🔴 긴급

---

## 📋 수정된 파일

### 1. `utils/iapManager.ts`
**수정 항목**: 3개

#### A. `restorePurchases()` 메서드
**변경 전**:
```typescript
// 웹 환경에서 항상 true 반환
if (!isMobile || !RNIap) {
  return true; // ❌ 문제: 복원 안 했는데 성공
}

const purchases = await RNIap.getAvailablePurchases();
for (const purchase of purchases) {
  // ... 복원 로직
}
return true; // ❌ 문제: purchases가 비어있어도 true
```

**변경 후**:
```typescript
// 웹 환경에서 명확히 false 반환
if (!isMobile || !RNIap) {
  console.log('🌐 시뮬레이션 모드: 구매 복원 불가');
  console.log('📌 실제 기기에서만 구매 복원이 가능합니다.');
  return false; // ✅ 수정: 명확히 false 반환
}

const purchases = await RNIap.getAvailablePurchases();
console.log(`📦 앱스토어 구매 내역: ${purchases.length}개`);

let restoredCount = 0;
for (const purchase of purchases) {
  // ... 복원 로직
  restoredCount++;
}

console.log(`✅ 구매 복원 완료: ${restoredCount}개 복원됨`);
return restoredCount > 0; // ✅ 수정: 실제 복원된 항목이 있을 때만 true
```

**효과**:
- ✅ 구매 내역이 없을 때 정확히 "복원 실패" 메시지 표시
- ✅ 로그로 복원된 항목 수 확인 가능
- ✅ 사용자에게 정확한 피드백 제공

#### B. `initialize()` 메서드
**변경 전**:
```typescript
if (!RNIap) {
  console.log('⚠️ react-native-iap 모듈 사용 불가');
  this.initialized = true;
  return true; // ❌ 문제: 실패를 성공으로 처리
}

if (typeof RNIap.initConnection !== 'function') {
  console.log('⚠️ react-native-iap API 사용 불가');
  this.initialized = true;
  return true; // ❌ 문제: 실패를 성공으로 처리
}
```

**변경 후**:
```typescript
if (!RNIap) {
  console.error('❌ react-native-iap 모듈을 사용할 수 없습니다.');
  console.error('📌 해결 방법:');
  console.error('   1. 앱을 재빌드해주세요: eas build --platform ios');
  console.error('   2. TestFlight에서 최신 버전을 다운로드해주세요.');
  throw new Error('IAP_MODULE_NOT_AVAILABLE'); // ✅ 수정: 오류로 처리
}

if (typeof RNIap.initConnection !== 'function') {
  console.error('❌ react-native-iap API를 사용할 수 없습니다.');
  console.error('📌 해결 방법:');
  console.error('   1. Expo 앱이 아닌 네이티브 빌드를 사용해주세요.');
  console.error('   2. npx expo prebuild --clean 실행 후 재빌드해주세요.');
  throw new Error('IAP_API_NOT_AVAILABLE'); // ✅ 수정: 오류로 처리
}
```

**효과**:
- ✅ 초기화 실패 시 명확한 오류 발생
- ✅ 구체적인 해결 방법 제시
- ✅ 사용자에게 정확한 안내 제공

#### C. `purchaseSubscription()` 오류 처리
**변경 전**:
```typescript
catch (error: any) {
  console.error('❌ 구매 오류:', error);

  if (error.code === 'E_USER_CANCELLED') {
    return { success: false, error: '사용자가 구매를 취소했습니다.' };
  }

  return {
    success: false,
    error: error.message || '구매 처리 중 오류가 발생했습니다.'
  };
}
```

**변경 후**:
```typescript
catch (error: any) {
  console.error('❌ 구매 오류:', error);

  if (error.code === 'E_USER_CANCELLED') {
    return { success: false, error: '사용자가 구매를 취소했습니다.' };
  }

  // ✅ FIX: 더 구체적인 오류 메시지
  let errorMessage = '구매 처리 중 오류가 발생했습니다.';

  if (error.message === 'IAP_API_NOT_AVAILABLE') {
    errorMessage = '앱 내 구매 기능을 사용할 수 없습니다.\n앱을 업데이트하거나 재설치해주세요.';
  } else if (error.code === 'E_NETWORK_ERROR') {
    errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
  } else if (error.code === 'E_SERVICE_ERROR') {
    errorMessage = '앱스토어 서비스에 일시적인 문제가 있습니다.\n잠시 후 다시 시도해주세요.';
  } else if (error.code === 'E_RECEIPT_FAILED') {
    errorMessage = '영수증 검증에 실패했습니다.\n고객센터로 문의해주세요.';
  } else if (error.message) {
    errorMessage = error.message;
  }

  return { success: false, error: errorMessage };
}
```

**효과**:
- ✅ 오류 유형별 맞춤 메시지 제공
- ✅ 사용자 행동 가이드 제공
- ✅ 고객 지원 효율성 향상

---

### 2. `components/PremiumSubscription.tsx`
**수정 항목**: 2개

#### A. `initializeIAP()` 함수
**변경 전**:
```typescript
if (!initialized) {
  Alert.alert('오류', 'IAP 시스템을 초기화할 수 없습니다.');
  return;
}

catch (error) {
  console.error('IAP 초기화 오류:', error);
  Alert.alert('오류', 'IAP 시스템 초기화 중 오류가 발생했습니다.');
}
```

**변경 후**:
```typescript
if (!initialized) {
  Alert.alert(
    '앱 내 구매 초기화 실패',
    '앱 내 구매 기능을 사용할 수 없습니다.\n\n가능한 원인:\n• 네트워크 연결 문제\n• 앱스토어 서비스 장애\n• 앱 버전 문제\n\n해결 방법:\n• 네트워크 연결 확인\n• 앱 재시작\n• 앱 최신 버전으로 업데이트',
    [{ text: '확인' }]
  );
  return;
}

catch (error: any) {
  let errorMessage = 'IAP 시스템 초기화 중 오류가 발생했습니다.';

  if (error.message === 'IAP_MODULE_NOT_AVAILABLE') {
    errorMessage = '앱 내 구매 모듈을 로드할 수 없습니다.\n앱을 재설치하거나 최신 버전으로 업데이트해주세요.';
  } else if (error.message === 'IAP_API_NOT_AVAILABLE') {
    errorMessage = '앱 내 구매 API를 사용할 수 없습니다.\nExpo Go가 아닌 네이티브 빌드를 사용해주세요.';
  } else if (error.message === 'IAP_CONNECTION_FAILED') {
    errorMessage = '앱스토어 연결에 실패했습니다.\n네트워크 연결을 확인하고 다시 시도해주세요.';
  }

  Alert.alert('초기화 오류', errorMessage);
}
```

**효과**:
- ✅ 오류 원인 명확히 표시
- ✅ 해결 방법 단계별 안내
- ✅ 사용자 자가 해결 가능성 향상

#### B. `handleRestorePurchases()` 함수
**변경 전**:
```typescript
if (restored) {
  Alert.alert('복원 완료', '구매가 복원되었습니다.');
  await initializeIAP();
} else {
  Alert.alert('복원 실패', '복원할 구매 내역이 없습니다.');
}

catch (error) {
  Alert.alert('오류', '구매 복원 중 오류가 발생했습니다.');
}
```

**변경 후**:
```typescript
if (restored) {
  Alert.alert(
    '복원 완료',
    '이전 구매가 성공적으로 복원되었습니다! 🎉',
    [
      {
        text: '확인',
        onPress: async () => {
          await initializeIAP(); // 상태 새로고침
        }
      }
    ]
  );
} else {
  Alert.alert(
    '복원할 구매 내역이 없습니다',
    '이미 구독 중이시라면 App Store 또는 Play Store에서 구독 상태를 확인해주세요.\n\n구독 관리:\n• iOS: 설정 → [사용자 이름] → 구독\n• Android: Play Store → 프로필 → 결제 및 정기 결제',
    [{ text: '확인' }]
  );
}

catch (error: any) {
  let errorMessage = '구매 복원 중 오류가 발생했습니다.';

  if (error.message === 'IAP_MODULE_NOT_AVAILABLE' || error.message === 'IAP_API_NOT_AVAILABLE') {
    errorMessage = '앱 내 구매 기능을 사용할 수 없습니다.\n\n해결 방법:\n• 앱을 최신 버전으로 업데이트해주세요\n• 앱을 재설치해주세요\n• 문제가 지속되면 고객센터로 문의해주세요';
  }

  Alert.alert('오류', errorMessage);
}
```

**효과**:
- ✅ 복원 성공/실패 명확히 구분
- ✅ 구독 관리 방법 상세 안내
- ✅ 사용자 혼란 방지

---

## 📊 수정 전후 비교

| 상황 | 수정 전 | 수정 후 |
|------|---------|---------|
| **구매 내역 없을 때** | "복원 완료" (잘못된 메시지) | "복원할 구매 내역이 없습니다" + 구독 관리 방법 안내 |
| **IAP 초기화 실패** | "오류 발생" (애매한 메시지) | 오류 원인 + 해결 방법 상세 안내 |
| **구매 실패** | "구매 처리 중 오류 발생" | 오류 유형별 맞춤 메시지 + 행동 가이드 |
| **복원 성공** | "구매가 복원되었습니다" | "이전 구매가 성공적으로 복원되었습니다! 🎉" |

---

## 🔍 근본 원인 분석

### 스크린샷에서 발견된 오류:

1. **구독 구매 실패**
   - 원인: `react-native-iap` 모듈이 제대로 초기화되지 않음
   - 가능성: Expo Go 환경 또는 네이티브 모듈 미포함 빌드

2. **잘못된 복원 완료 메시지**
   - 원인: `restorePurchases()`가 구매 내역 없이도 `true` 반환
   - 수정: 실제 복원된 항목 수를 기반으로 반환값 결정

### 예상 해결 효과:

✅ **즉시 해결** (코드 수정만으로):
- 복원 완료 메시지 정확도 100%
- 오류 메시지 명확성 향상
- 사용자 자가 해결 가능성 증가

⚠️ **추가 조치 필요** (앱 재빌드):
- IAP 초기화 실패 근본 해결
- 실제 구매 기능 활성화
- 구독 상품 정상 판매 시작

---

## 🚀 다음 단계

### 1단계: 테스트 (로컬)
```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# - 복원 버튼 클릭 시 "복원할 구매 내역이 없습니다" 메시지 확인
# - 오류 메시지가 명확히 표시되는지 확인
```

### 2단계: 커밋
```bash
git add utils/iapManager.ts components/PremiumSubscription.tsx
git add SUBSCRIPTION_ERROR_DIAGNOSIS.md SUBSCRIPTION_FIX_SUMMARY.md
git commit -m "fix: IAP 복원 로직 및 오류 메시지 개선

- restorePurchases() 실제 복원 여부 반환
- 초기화 실패 시 명확한 오류 처리
- 사용자 친화적 오류 메시지 제공
- 구독 관리 방법 상세 안내 추가

Related: #구독오류수정"
```

### 3단계: 앱 재빌드 (IAP 기능 활성화)

**필수 작업**:
1. `app.json` 플러그인 추가
2. `npx expo prebuild --clean`
3. `eas build --platform ios --profile production-ios`
4. TestFlight 업로드
5. Sandbox 환경에서 테스트

**참고 문서**: `SUBSCRIPTION_ERROR_DIAGNOSIS.md`

---

## ✅ 체크리스트

- [x] `restorePurchases()` 로직 수정
- [x] `initialize()` 오류 처리 강화
- [x] `purchaseSubscription()` 오류 메시지 개선
- [x] `PremiumSubscription.tsx` UI 메시지 개선
- [x] 진단 보고서 작성
- [x] 수정 요약 문서 작성
- [ ] 로컬 테스트
- [ ] Git 커밋
- [ ] 앱 재빌드 (IAP 활성화)
- [ ] TestFlight 배포
- [ ] Sandbox 테스트

---

**작성자**: Claude Code
**검토 필요**: IAP 초기화 실패 근본 원인 (네이티브 모듈 누락 추정)
**우선순위**: 🔴 긴급 (사용자 구매 불가 상태)
