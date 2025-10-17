# 🐛 Android 테스트 문제 분석 및 해결 방안

**작성일**: 2025-10-17
**테스트 환경**: Android 실제 디바이스 (비공개 테스트)
**빌드**: v1.0.2 (Build 33)

---

## 📋 **발견된 문제 목록**

### ✅ **문제 1: 다국어 지원 (한/영/일)**
**상태**: ✅ **정상 작동 중**

**현황 확인**:
- ✅ i18n 시스템 완벽 구현 ([i18n/index.ts](i18n/index.ts))
- ✅ 한국어, 영어, 일본어 번역 파일 모두 존재
- ✅ 자동 언어 감지 설정
- ✅ 설정 화면에서 언어 변경 가능

**구현된 기능**:
```typescript
// i18n/index.ts
export const LANGUAGES = {
  ko: { name: '한국어', nativeName: '한국어', flag: '🇰🇷', code: 'ko' },
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', code: 'en' },
  ja: { name: 'Japanese', nativeName: '日語', flag: '🇯🇵', code: 'ja' }
};
```

**확인 방법**:
1. 설정 탭 → 언어 선택
2. 한국어 / English / 日語 중 선택
3. 모든 UI 텍스트가 즉시 변경됨

**결론**: ✅ 정상 작동. 추가 수정 불필요.

---

### ⚠️ **문제 2: 상단/하단 네비게이션 바와 이미지 겹침 현상**
**상태**: ⚠️ **SafeAreaView 사용 중이나 조정 필요**

#### **원인 분석**

1. **SafeAreaView는 이미 적용됨**
   - [App.tsx:347](App.tsx#L347) - 최상위 컴포넌트에 SafeAreaView 적용
   - [App.tsx:379](App.tsx#L379) - SafeAreaProvider로 래핑

2. **문제의 실제 원인**
   - Android에서 `SafeAreaView`가 iOS처럼 자동으로 작동하지 않음
   - Android는 `react-native-safe-area-context`의 `useSafeAreaInsets` hook 사용 필요
   - 탭 바와 배너 광고의 위치가 Safe Area를 고려하지 않음

#### **해결 방안**

**옵션 1: SafeAreaView에서 View + useSafeAreaInsets로 변경** (권장)

```typescript
// App.tsx 수정
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      {/* 기존 내용 */}
    </View>
  );
}
```

**옵션 2: Android StatusBar 높이 수동 추가**

```typescript
import { Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1625',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
```

**옵션 3: TabBar에 Safe Area 적용**

```typescript
// TabBar 컴포넌트에 Safe Area 적용
const TabBar = memo(({ activeTab, onTabChange }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {/* 탭 버튼들 */}
    </View>
  );
});
```

#### **권장 수정 사항**

**1단계: App.tsx 수정**
```typescript
// 347줄 변경 전
<SafeAreaView style={styles.container}>

// 347줄 변경 후
<View style={[styles.container, {
  paddingTop: insets.top,
  paddingBottom: 0, // 하단은 TabBar에서 처리
}]}>
```

**2단계: TabBar 컴포넌트 수정**
```typescript
// TabBar 컴포넌트에 useSafeAreaInsets 추가
const TabBar = memo(({ activeTab, onTabChange }: TabBarProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // ... 기존 코드 ...

  return (
    <View style={[styles.tabBar, {
      paddingBottom: Math.max(insets.bottom, 8) // 최소 8px 패딩
    }]}>
      {tabs.map(tab => (...))}
    </View>
  );
});
```

**3단계: 배너 광고 위치 조정**
```typescript
// BannerAd 컴포넌트를 TabBar 위에 배치
<View style={{ position: 'relative' }}>
  {BannerAd && <BannerAd placement="main_screen" />}
  <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
</View>
```

---

### 🔴 **문제 3: 24시간 카드 뽑기 후 카드 클릭 시 이미지 안 나오는 현상**
**상태**: 🔴 **크리티컬 버그** (P0)

#### **원인 분석**

1. **hourlyCards 데이터 구조 문제**
   - [TarotDaily.tsx:91](components/TarotDaily.tsx#L91) - `reading.hourlyCards?.[selectedHour]` 접근
   - hourlyCards가 배열 대신 객체로 저장되었거나
   - 카드 ID만 저장되고 이미지 경로가 누락됨

2. **AsyncStorage 저장 형식 문제**
   - 24시간 카드 뽑기 시 hourlyCards 저장 로직 확인 필요
   - 카드 객체 전체가 아닌 ID만 저장되었을 가능성

3. **TarotCardComponent props 전달 문제**
   - [TarotDaily.tsx:152-156](components/TarotDaily.tsx#L152) - card prop 전달
   - card 객체가 완전하지 않으면 이미지 렌더링 실패

#### **해결 방안**

**1단계: 24시간 카드 뽑기 저장 로직 확인**

타이머 탭에서 24시간 카드를 뽑을 때 저장되는 데이터 형식 확인:

```typescript
// 올바른 저장 형식
const dailyReading = {
  dateKey: '2025-10-17',
  displayDate: '2025년 10월 17일',
  savedAt: Date.now(),
  hourlyCards: {
    0: { id: 'major_00', name: 'The Fool', image: require('...') },
    1: { id: 'major_01', name: 'The Magician', image: require('...') },
    // ... 24시간 전체
  },
  memos: {}
};
```

**2단계: hourlyCards 재구성 로직 추가**

```typescript
// TarotDaily.tsx - DailyTarotViewer 컴포넌트
useEffect(() => {
  if (reading && reading.hourlyCards) {
    // hourlyCards가 카드 ID만 있는 경우 전체 카드 객체로 재구성
    const reconstructedCards = {};
    Object.keys(reading.hourlyCards).forEach(hour => {
      const cardData = reading.hourlyCards[hour];

      // 카드 ID만 있는 경우
      if (typeof cardData === 'string') {
        const fullCard = TAROT_CARDS.find(c => c.id === cardData);
        if (fullCard) {
          reconstructedCards[hour] = fullCard;
        }
      }
      // 이미 완전한 객체인 경우
      else if (cardData && cardData.id) {
        reconstructedCards[hour] = cardData;
      }
    });

    setReconstructedCards(reconstructedCards);
  }
}, [reading]);
```

**3단계: TarotCardComponent 오류 방어 코드 추가**

```typescript
// TarotCard.tsx
export const TarotCardComponent: React.FC<TarotCardProps> = ({
  card,
  size = 'medium',
  showText = true
}) => {
  // 카드가 없거나 이미지가 없는 경우 플레이스홀더 표시
  if (!card || !card.image) {
    return (
      <View style={[styles.card, styles[`${size}Card`], styles.placeholderCard]}>
        <Text style={styles.placeholderText}>?</Text>
      </View>
    );
  }

  // 기존 렌더링 로직
  return (
    <View style={[styles.card, styles[`${size}Card`]]}>
      <Image
        source={card.image}
        style={styles.cardImage}
        defaultSource={require('../assets/images/card-back.png')}
      />
      {showText && <Text style={styles.cardName}>{card.name}</Text>}
    </View>
  );
};
```

**4단계: 디버그 로그 추가**

```typescript
// TarotDaily.tsx
const selectedCard = reading.hourlyCards?.[selectedHour];

console.log('🔍 Selected Hour:', selectedHour);
console.log('🔍 Selected Card:', selectedCard);
console.log('🔍 All Hourly Cards:', reading.hourlyCards);

if (!selectedCard) {
  console.error('❌ 선택된 시간의 카드가 없습니다:', {
    hour: selectedHour,
    availableHours: Object.keys(reading.hourlyCards || {})
  });
}
```

---

## 🛠️ **즉시 수정 필요 사항 (P0)**

### **우선순위 1: 카드 이미지 로딩 버그** (P0)
- **영향**: 사용자가 24시간 카드 확인 불가
- **예상 수정 시간**: 1-2시간
- **작업 내용**:
  1. 24시간 카드 저장 로직 확인 및 수정
  2. hourlyCards 재구성 로직 추가
  3. TarotCardComponent 오류 방어 코드 추가
  4. 디버그 로그 추가 및 테스트

### **우선순위 2: SafeArea 겹침 현상** (P1)
- **영향**: UI가 네비게이션 바에 가려져 사용성 저하
- **예상 수정 시간**: 30분
- **작업 내용**:
  1. App.tsx에 useSafeAreaInsets 적용
  2. TabBar에 paddingBottom 추가
  3. 배너 광고 위치 조정

### **우선순위 3: 다국어 지원** (완료)
- ✅ 정상 작동 확인
- 추가 작업 불필요

---

## 📝 **수정 후 테스트 체크리스트**

### **카드 이미지 로딩 테스트**
- [ ] 24시간 카드 뽑기 실행
- [ ] 저장된 카드 데이터 구조 로그 확인
- [ ] Daily 탭에서 저장된 카드 확인
- [ ] 각 시간대 카드 클릭 시 이미지 표시 확인
- [ ] 메모 저장 및 불러오기 테스트

### **SafeArea 테스트**
- [ ] 상단 헤더가 상태바와 겹치지 않는지 확인
- [ ] 하단 탭 바가 네비게이션 바와 겹치지 않는지 확인
- [ ] 배너 광고가 탭 바 위에 정상 표시되는지 확인
- [ ] 다양한 안드로이드 기기에서 테스트 (노치, 펀치홀 디자인)

### **다국어 지원 테스트**
- [ ] 설정 → 언어 변경 기능 확인
- [ ] 한국어 → 영어 → 일본어 전환 테스트
- [ ] 모든 화면에서 번역 적용 확인
- [ ] 날짜/시간 포맷 로케일 적용 확인

---

## 🚀 **Build 34 준비 사항**

### **필수 수정 사항** (P0)
1. ✅ 광고 시스템 수정 (완료)
2. ✅ 7일 무료 체험 임시 비활성화 (완료)
3. ⏳ 24시간 카드 이미지 로딩 버그 수정 (작업 필요)
4. ⏳ SafeArea 겹침 현상 수정 (작업 필요)

### **선택적 개선 사항** (P1)
5. ⏳ 이미지 로딩 최적화 (다음 빌드로 연기 가능)
6. ⏳ 전체 성능 최적화 (다음 빌드로 연기 가능)

---

**마지막 업데이트**: 2025-10-17 09:40 KST
**다음 작업**: 카드 이미지 로딩 버그 수정 → SafeArea 수정 → Build 34 테스트
