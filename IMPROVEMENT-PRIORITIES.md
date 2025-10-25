# 🚀 타로 타이머 개선사항 우선순위 리스트

**작성일**: 2025-01-25
**현재 완성도**: 90.8/100 ⭐⭐⭐⭐⭐
**분석 기반**: 전체 앱 UI/기능 시뮬레이션 분석

---

## 🔴 High Priority (즉시 처리 권장)

### 1. TarotContext 역할 재정의 또는 제거
**문제**: `TarotContext`와 `useTarotCards` Hook이 역할 중복
- TarotContext는 Provider만 제공하고 실제 로직 없음
- useTarotCards가 실제 카드 관리 수행
- 혼란스러운 아키텍처

**해결 방안**:
```typescript
// Option 1: TarotContext 제거, useTarotCards만 사용
// App.tsx에서 <TarotProvider> 제거

// Option 2: TarotContext에 전역 상태 관리 통합
// - 현재 시간 카드
// - 24시간 카드 배열
// - 메모 상태
// useTarotCards를 TarotContext 내부로 이동
```

**예상 작업 시간**: 2-3시간
**영향 범위**: App.tsx, TarotContext.tsx, useTarotCards.ts

---

## 🟡 Medium Priority (2주 이내 처리)

### 2. 다이어리 탭 무한 스크롤 구현
**문제**: 현재 5일 배치 로드만 가능, 스크롤 끝에 도달해도 자동 로드 안됨
**사용자 불편**: 오래된 데이터 보려면 여러 번 버튼 클릭 필요

**해결 방안**:
```typescript
// components/tabs/DailyTab.tsx
<FlatList
  data={displayedEntries}
  onEndReached={loadMoreEntries}  // 추가
  onEndReachedThreshold={0.5}     // 추가
  ListFooterComponent={
    loading ? <ActivityIndicator /> : null
  }
/>

const loadMoreEntries = useCallback(() => {
  if (hasMore && !loading) {
    loadNextBatch();
  }
}, [hasMore, loading]);
```

**예상 작업 시간**: 3-4시간
**영향 범위**: DailyTab.tsx

### 3. 이미지 캐싱 전략 개선 (expo-image 도입)
**문제**: 현재 수동 이미지 프리로드, 성능 개선 여지 있음
**권장**: `expo-image` 사용으로 자동 캐싱 + 메모리 관리

**해결 방안**:
```bash
npm install expo-image
```

```typescript
// Before
import { Image } from 'react-native';
<Image source={require('./path.png')} />

// After
import { Image } from 'expo-image';
<Image
  source={require('./path.png')}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"  // 자동 캐싱
/>
```

**개선 효과**:
- ✅ 자동 메모리 캐싱
- ✅ 디스크 캐싱 지원
- ✅ 이미지 트랜지션 효과
- ✅ 메모리 압력 자동 관리

**예상 작업 시간**: 4-6시간 (전체 이미지 마이그레이션)
**영향 범위**: TarotCard.tsx, TimerTab.tsx, DailyTab.tsx, SpreadTab.tsx

---

## 🟢 Low Priority (3개월 이내 처리)

### 4. 카드 뒤집기 애니메이션 추가
**현재**: 즉시 카드 표시
**개선**: 부드러운 flip 애니메이션으로 타로 경험 향상

**해결 방안**:
```typescript
// react-native-reanimated 사용
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate
} from 'react-native-reanimated';

const FlipCard = ({ front, back, isFlipped }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isFlipped ? 180 : 0);
  }, [isFlipped]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotation.value}deg` }
    ],
    opacity: interpolate(rotation.value, [0, 90, 180], [1, 0, 0])
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotation.value + 180}deg` }
    ],
    opacity: interpolate(rotation.value, [0, 90, 180], [0, 0, 1])
  }));

  return (
    <>
      <Animated.View style={frontStyle}>{front}</Animated.View>
      <Animated.View style={backStyle}>{back}</Animated.View>
    </>
  );
};
```

**예상 작업 시간**: 6-8시간
**영향 범위**: TarotCard.tsx, SpreadTab.tsx

### 5. 에러 메시지 다국어화 완성
**현재**: 일부 에러 메시지만 i18n 적용
**개선**: 모든 Alert, 에러 메시지 다국어화

**작업 항목**:
- ErrorBoundary 메시지
- TabErrorBoundary 메시지
- Alert 메시지 (AdManager, IAPManager 등)
- 네트워크 오류 메시지
- 검증 오류 메시지

**예상 작업 시간**: 4-5시간
**영향 범위**: i18n/ko.json, i18n/en.json, 모든 에러 처리 컴포넌트

### 6. AI 타로 해석 기능 (프리미엄 전용)
**목표**: GPT-4 API 연동으로 개인화된 타로 해석 제공

**기능 설계**:
```typescript
interface AIInterpretation {
  cardName: string;
  position: string;  // 스프레드 내 위치
  context: string;   // 사용자가 선택한 주제 (연애, 재물, 커리어 등)
  interpretation: string;  // AI 생성 해석
  advice: string;    // 조언
}

// Premium 사용자만 접근 가능
const useAIInterpretation = () => {
  const { isPremium } = usePremium();

  const getInterpretation = async (
    cards: TarotCard[],
    spreadType: string,
    context: string
  ): Promise<AIInterpretation[]> => {
    if (!isPremium) {
      throw new Error('Premium feature');
    }

    // GPT-4 API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 타로 리더입니다. 각 카드의 상징과 위치를 바탕으로 개인화된 해석을 제공합니다.'
          },
          {
            role: 'user',
            content: `스프레드: ${spreadType}\n카드: ${cards.map(c => c.name).join(', ')}\n주제: ${context}\n\n해석을 제공해주세요.`
          }
        ]
      })
    });

    return parseAIResponse(response);
  };

  return { getInterpretation };
};
```

**비용 산정**:
- GPT-4 API: ~$0.03 per request
- 월간 1000명 사용 시: ~$30/month
- 프리미엄 구독료로 커버 가능

**예상 작업 시간**: 20-30시간
**영향 범위**:
- 새로운 컴포넌트: AIInterpretationModal.tsx
- SpreadTab.tsx 수정 (AI 버튼 추가)
- Backend API 연동 (OpenAI)
- 비용 모니터링 대시보드

### 7. Supabase 클라우드 백업 (프리미엄 전용)
**목표**: 디바이스 간 타로 데이터 동기화

**기능 설계**:
```typescript
// Supabase 스키마
CREATE TABLE tarot_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_date TIMESTAMP NOT NULL,
  cards JSONB NOT NULL,  -- 24시간 카드 배열
  memos JSONB,           -- 각 시간별 메모
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tarot_spreads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  spread_type VARCHAR(50) NOT NULL,
  cards JSONB NOT NULL,
  interpretation TEXT,
  ai_interpretation JSONB,  -- AI 해석 결과
  created_at TIMESTAMP DEFAULT NOW()
);

// 자동 동기화 로직
const useSyncToCloud = () => {
  const { isPremium } = usePremium();
  const { supabase } = useSupabase();

  useEffect(() => {
    if (!isPremium) return;

    // 앱 종료 시 자동 백업
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'background') {
        await syncLocalDataToCloud();
      }
    };

    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, [isPremium]);
};
```

**예상 작업 시간**: 30-40시간
**영향 범위**:
- Supabase 스키마 설계
- SupabaseContext.tsx 구현
- 자동 동기화 로직
- 충돌 해결 전략
- 설정 탭에 백업/복원 UI 추가

### 8. 커뮤니티 기능 (프리미엄 전용)
**목표**: 타로 애호가들의 소통 공간

**기능 설계**:
- 타로 스프레드 공유 (익명 또는 실명)
- 타로 일기 공유 (선택적)
- 좋아요 / 댓글 기능
- 주간 인기 스프레드 랭킹
- 타로 전문가 인증 시스템

**예상 작업 시간**: 60-80시간 (대규모)
**영향 범위**:
- 새로운 탭: CommunityTab.tsx
- Supabase 스키마 확장 (posts, comments, likes)
- 신고/차단 시스템
- 콘텐츠 모더레이션 대시보드

---

## 📊 우선순위 요약

| 순위 | 항목 | 긴급도 | 중요도 | 작업 시간 | 배포 영향 |
|------|------|--------|--------|-----------|-----------|
| 1 | TarotContext 재정의 | 🔴 High | ⭐⭐⭐⭐ | 2-3h | 중간 |
| 2 | 다이어리 무한 스크롤 | 🟡 Medium | ⭐⭐⭐⭐ | 3-4h | 낮음 |
| 3 | expo-image 도입 | 🟡 Medium | ⭐⭐⭐ | 4-6h | 낮음 |
| 4 | 카드 뒤집기 애니메이션 | 🟢 Low | ⭐⭐⭐ | 6-8h | 낮음 |
| 5 | 에러 메시지 다국어화 | 🟢 Low | ⭐⭐ | 4-5h | 낮음 |
| 6 | AI 타로 해석 | 🟢 Low | ⭐⭐⭐⭐⭐ | 20-30h | 높음 |
| 7 | Supabase 클라우드 백업 | 🟢 Low | ⭐⭐⭐⭐ | 30-40h | 높음 |
| 8 | 커뮤니티 기능 | 🟢 Low | ⭐⭐⭐⭐⭐ | 60-80h | 높음 |

---

## 🎯 권장 로드맵

### Phase 1: 안정화 (1주일)
- [x] 알림 설정 AsyncStorage 저장 ✅ (완료: 2025-01-25)
- [ ] TarotContext 재정의
- [ ] 다이어리 무한 스크롤

### Phase 2: 성능 최적화 (2주일)
- [ ] expo-image 도입
- [ ] 카드 뒤집기 애니메이션
- [ ] 에러 메시지 다국어화

### Phase 3: 프리미엄 기능 강화 (3개월)
- [ ] AI 타로 해석
- [ ] Supabase 클라우드 백업
- [ ] 커뮤니티 기능

---

## 📝 추가 개선 아이디어 (백로그)

### UX 개선
- 다크 모드 / 라이트 모드 토글
- 커스텀 타로 덱 업로드 (프리미엄)
- 카드 셔플 애니메이션
- 음향 효과 (카드 뒤집기, 알림 등)

### 비즈니스 기능
- 월간/연간 타로 통계 대시보드
- 자주 나온 카드 분석
- 운세 캘린더 (일/주/월)
- 친구 초대 리워드 프로그램

### 기술 개선
- Sentry 오류 추적
- Firebase Analytics 심화
- A/B 테스팅 플랫폼 (Optimizely)
- 성능 모니터링 (Firebase Performance)

---

**작성자**: Claude Code AI Assistant
**기반 분석**: 전체 앱 UI/기능 시뮬레이션 분석 (2025-01-25)
**다음 리뷰**: 2025-02-25 (1개월 후)
