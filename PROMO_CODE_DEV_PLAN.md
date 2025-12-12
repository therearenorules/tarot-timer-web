# 타로타이머 - 프로모션 코드 시스템 개발 계획서

## 개요

프로모션 코드 입력 시 **7일간 프리미엄 혜택** 제공

### 핵심 규칙
- 같은 코드는 기기당 1번만 사용 가능
- 다른 코드는 사용 가능
- 코드 형식: 한글, 영어, 숫자 모두 허용
- **무료 사용자에게만** 코드 입력 UI 노출

---

## 데이터 구조

### AsyncStorage 키

```typescript
const STORAGE_KEYS = {
  PROMO_EXPIRES_AT: '@tarot/promo_expires_at',  // 프리미엄 만료일 (ISO string)
  USED_PROMO_CODES: '@tarot/used_promo_codes',  // 사용한 코드 목록 (string[])
};
```

### 유효한 코드 목록 (하드코딩)

```typescript
// constants/promoCodes.ts
export const VALID_PROMO_CODES = [
  'TAROT2025',
  '타로사랑',
  '웰컴7일',
  // 필요시 추가
];
```

---

## 핵심 로직

### 프리미엄 상태 확인

```typescript
const isPremium = async (): Promise<boolean> => {
  // 1. 기존 구독/IAP 체크 (있다면)
  // if (hasSubscription) return true;
  
  // 2. 프로모션 만료일 체크
  const expiresAt = await AsyncStorage.getItem(STORAGE_KEYS.PROMO_EXPIRES_AT);
  if (expiresAt && new Date(expiresAt) > new Date()) {
    return true;
  }
  
  return false;
};
```

### 코드 적용

```typescript
const applyPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
  const normalizedCode = code.trim();
  
  // 1. 유효한 코드인지 확인
  if (!VALID_PROMO_CODES.includes(normalizedCode)) {
    return { success: false, message: '유효하지 않은 코드입니다.' };
  }
  
  // 2. 이미 사용한 코드인지 확인
  const usedCodesJson = await AsyncStorage.getItem(STORAGE_KEYS.USED_PROMO_CODES);
  const usedCodes: string[] = usedCodesJson ? JSON.parse(usedCodesJson) : [];
  
  if (usedCodes.includes(normalizedCode)) {
    return { success: false, message: '이미 사용한 코드입니다.' };
  }
  
  // 3. 프리미엄 만료일 설정 (7일 후)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await AsyncStorage.setItem(STORAGE_KEYS.PROMO_EXPIRES_AT, expiresAt.toISOString());
  
  // 4. 사용한 코드 목록에 추가
  usedCodes.push(normalizedCode);
  await AsyncStorage.setItem(STORAGE_KEYS.USED_PROMO_CODES, JSON.stringify(usedCodes));
  
  return { success: true, message: '🎉 7일간 프리미엄 혜택이 적용되었습니다!' };
};
```

---

## UI 구현

### Settings 탭 수정

```tsx
// SettingsScreen.tsx

const SettingsScreen = () => {
  const [isPremiumUser, setIsPremiumUser] = useState(true); // 기본 true로 숨김
  
  useEffect(() => {
    checkPremiumStatus();
  }, []);
  
  const checkPremiumStatus = async () => {
    const premium = await isPremium();
    setIsPremiumUser(premium);
  };
  
  return (
    <ScrollView>
      {/* 기존 설정 항목들 */}
      
      {/* 무료 사용자에게만 노출 */}
      {!isPremiumUser && (
        <PromoCodeSection onApplySuccess={checkPremiumStatus} />
      )}
      
      {/* 나머지 설정 항목들 */}
    </ScrollView>
  );
};
```

### PromoCodeSection 컴포넌트

```tsx
// components/PromoCodeSection.tsx

interface Props {
  onApplySuccess: () => void;
}

const PromoCodeSection: React.FC<Props> = ({ onApplySuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleApply = async () => {
    if (!code.trim()) {
      Alert.alert('알림', '코드를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    const result = await applyPromoCode(code);
    setLoading(false);
    
    Alert.alert(result.success ? '성공' : '알림', result.message);
    
    if (result.success) {
      setCode('');
      onApplySuccess(); // 프리미엄 상태 갱신 → UI 숨김
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎁 프로모션 코드</Text>
      </View>
      
      <Text style={styles.description}>
        코드를 입력하면 7일간 프리미엄 혜택을 이용할 수 있습니다.
      </Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="코드 입력"
          value={code}
          onChangeText={setCode}
          autoCorrect={false}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleApply}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '...' : '등록'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

---

## 파일 구조

```
src/
├── constants/
│   └── promoCodes.ts          # 유효한 코드 목록 (새로 생성)
│
├── services/
│   └── promoService.ts        # applyPromoCode, isPremium 함수 (새로 생성)
│
├── components/
│   └── PromoCodeSection.tsx   # 코드 입력 UI (새로 생성)
│
└── screens/
    └── SettingsScreen.tsx     # 수정: PromoCodeSection 추가
```

---

## 기존 시스템 연동

### 광고 표시 조건 수정

```typescript
// 기존 광고 표시 로직에서
const shouldShowAd = async () => {
  const premium = await isPremium();  // 이 함수 사용
  return !premium;
};
```

### 프리미엄 기능 접근 조건

```typescript
// 프리미엄 전용 기능 접근 시
const canAccessPremiumFeature = async () => {
  return await isPremium();
};
```

---

## 개발 체크리스트

- [ ] `constants/promoCodes.ts` 생성
- [ ] `services/promoService.ts` 생성 (isPremium, applyPromoCode)
- [ ] `components/PromoCodeSection.tsx` 생성
- [ ] SettingsScreen에 PromoCodeSection 추가 (조건부 렌더링)
- [ ] 기존 프리미엄 체크 로직에 promoService.isPremium() 통합
- [ ] 테스트: 유효한 코드 → 성공
- [ ] 테스트: 잘못된 코드 → 실패
- [ ] 테스트: 같은 코드 재사용 → 실패
- [ ] 테스트: 다른 코드 사용 → 성공
- [ ] 테스트: 프리미엄 상태에서 코드 입력 UI 숨김

---

## 예상 소요 시간

| 작업 | 시간 |
|-----|-----|
| promoService.ts 작성 | 30분 |
| PromoCodeSection.tsx 작성 | 1시간 |
| Settings 화면 수정 | 30분 |
| 기존 시스템 연동 | 30분 |
| 테스트 | 30분 |
| **총계** | **약 3시간** |
