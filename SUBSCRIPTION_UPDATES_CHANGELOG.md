# 🔄 구독 시스템 업데이트 변경사항
## $4.99/월 가격 전략 적용 완료

**업데이트 일시**: 2025-10-15
**작업자**: Claude Code
**관련 문서**: [SUBSCRIPTION_EVALUATION_REPORT.md](SUBSCRIPTION_EVALUATION_REPORT.md)

---

## ✅ 완료된 수정 사항

### 1. 가격 업데이트 (utils/iapManager.ts)

#### 변경 전 (구버전)
```typescript
// 월간 구독
price: '3900',
localizedPrice: '₩3,900',

// 연간 구독
price: '19900',
localizedPrice: '₩19,900',
```

#### 변경 후 ($4.99 기준)
```typescript
// 월간 구독
price: '6600',
localizedPrice: '₩6,600',  // $4.99 환산 (₩1,340/USD)

// 연간 구독
price: '46000',
localizedPrice: '₩46,000',  // $34.99 환산 (42% 할인)
```

**파일**: [utils/iapManager.ts:124-136](utils/iapManager.ts#L124-L136)

**영향도**:
- ✅ 웹 환경 시뮬레이션 가격 업데이트
- ✅ 실제 앱스토어 가격은 App Store Connect/Google Play Console에서 별도 설정 필요
- ✅ 할인율 58% → 42%로 조정 (연간 구독 매력도 유지)

---

### 2. 법률 문서 링크 추가 (components/subscription/SubscriptionPlans.tsx)

#### 추가된 UI 컴포넌트

**위치**: [SubscriptionPlans.tsx:356-386](components/subscription/SubscriptionPlans.tsx#L356-L386)

```typescript
{/* 법률 문서 링크 */}
<View style={styles.legalLinksContainer}>
  <TouchableOpacity onPress={openPrivacyPolicy}>
    <Text style={styles.legalLinkText}>개인정보 처리방침</Text>
  </TouchableOpacity>

  <Text style={styles.legalDivider}>|</Text>

  <TouchableOpacity onPress={openTermsOfService}>
    <Text style={styles.legalLinkText}>이용약관</Text>
  </TouchableOpacity>
</View>

<Text style={styles.legalNotice}>
  구독을 진행하면 위 약관에 동의하는 것으로 간주됩니다.
</Text>
```

#### 추가된 스타일
```typescript
legalLinksContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: Spacing.md,
  marginBottom: Spacing.sm,
},

legalLinkText: {
  fontSize: Typography.sizes.xs,
  color: Colors.brand.primary,
  textDecorationLine: 'underline',
},
```

**위치**: [SubscriptionPlans.tsx:651-681](components/subscription/SubscriptionPlans.tsx#L651-L681)

**영향도**:
- ✅ 앱스토어 심사 필수 요구사항 충족
- ⚠️ 실제 URL 연결 필요 (현재 TODO 상태)
- ✅ Google Play 구독 정책 준수

---

## 📋 다음 단계 (필수 작업)

### Priority 1: 법률 문서 호스팅 (1~3일)

#### Step 1: 개인정보 처리방침 작성
```
필수 포함 내용:
- 수집하는 개인정보 항목 (이메일, 결제 정보 등)
- 개인정보 이용 목적 (구독 관리, 고객 지원)
- 제3자 제공 (Apple/Google 결제 처리)
- 개인정보 보유 기간
- 사용자 권리 (열람, 삭제 요청)
- 문의처
```

**권장 도구**:
- [TermsFeed](https://www.termsfeed.com/privacy-policy-generator/) - 무료 생성기
- 변호사 검토 권장 (한국: 20~50만원)

#### Step 2: 이용약관 작성
```
필수 포함 내용:
- 서비스 이용 조건
- 구독 및 결제 조건 (자동 갱신, 취소 정책)
- 환불 정책 (앱스토어 정책 준수)
- 서비스 제공 범위
- 면책 조항
- 분쟁 해결
```

#### Step 3: 문서 호스팅

**옵션 A: GitHub Pages (무료)**
```bash
# 프로젝트 루트에 docs 폴더 생성
mkdir docs
cd docs

# HTML 파일 생성
touch privacy.html
touch terms.html

# GitHub Pages 활성화
# Settings → Pages → Source: main branch /docs folder

# 최종 URL:
# https://yourusername.github.io/tarot-timer-web/privacy
# https://yourusername.github.io/tarot-timer-web/terms
```

**옵션 B: 자체 도메인 (권장)**
```
예시:
- https://tarottimer.com/privacy
- https://tarottimer.com/terms

장점:
✅ 전문성
✅ SEO 개선
✅ 브랜드 일관성

비용: 도메인 $10~15/년 + 호스팅 무료 (Netlify/Vercel)
```

#### Step 4: SubscriptionPlans.tsx URL 연결

[SubscriptionPlans.tsx:361-376](components/subscription/SubscriptionPlans.tsx#L361-L376) 수정:

```typescript
// TODO 제거 및 실제 URL 연결
import { Linking } from 'react-native';

// 개인정보 처리방침
onPress={() => {
  Linking.openURL('https://tarottimer.com/privacy');
}}

// 이용약관
onPress={() => {
  Linking.openURL('https://tarottimer.com/terms');
}}
```

---

### Priority 2: App Store Connect 구독 설정 (1시간)

#### 로그인 및 구독 생성
```
1. App Store Connect 접속
   → https://appstoreconnect.apple.com

2. My Apps → 타로 타이머 → 기능 탭

3. App 내 구입 → "+" 버튼

4. 유형: "자동 갱신 구독" 선택

5. 구독 그룹 생성:
   - 이름: Tarot Timer Premium
   - 설명: 프리미엄 구독 서비스
```

#### 월간 구독 설정
```
참조 이름: Tarot Timer Monthly Premium
제품 ID: tarot_timer_monthly  ← iapManager.ts와 동일 (중요!)

가격:
→ Tier 5 선택 ($4.99 USD)
→ 자동으로 전 세계 가격 설정됨:
  - 미국: $4.99
  - 한국: ₩6,600
  - 일본: ¥730
  - 유럽: €5.49

구독 기간: 1개월

현지화된 설명:
- 한국어: 타로 타이머 월간 프리미엄
- English: Tarot Timer Monthly Premium
- 설명: 무제한 세션 저장, 광고 제거, 프리미엄 테마
```

#### 연간 구독 설정
```
참조 이름: Tarot Timer Yearly Premium
제품 ID: tarot_timer_yearly  ← iapManager.ts와 동일 (중요!)

가격:
→ Tier 30 선택 ($34.99 USD)
→ 한국: ₩46,000

구독 기간: 1년 (12개월)

현지화된 설명:
- 한국어: 타로 타이머 연간 프리미엄 (42% 할인)
- English: Tarot Timer Yearly Premium (42% Off)
- 설명: 무제한 세션 저장, 광고 제거, 프리미엄 테마 - 1년 구독
```

#### 법률 정보 입력 (필수!)
```
개인정보 처리방침 URL:
→ https://tarottimer.com/privacy

Apple 개인정보 처리방침 URL:
→ 동일 URL 입력

선택적 URL (권장):
→ https://tarottimer.com/terms
```

#### 저장 및 검토
```
→ "저장" 클릭
→ "검토를 위해 제출" 클릭
→ 앱 버전과 함께 심사 제출 시 활성화됨
```

---

### Priority 3: Google Play Console 구독 설정 (1시간)

#### 로그인 및 구독 생성
```
1. Google Play Console 접속
   → https://play.google.com/console

2. 앱 선택: 타로 타이머

3. 왼쪽 메뉴 → 수익 창출 → 구독

4. "구독 만들기" 클릭
```

#### 월간 구독 설정
```
구독 ID: tarot_timer_monthly  ← iapManager.ts와 동일 (필수!)

이름: Tarot Timer Premium Monthly

설명:
무제한 세션 저장, 광고 제거, 프리미엄 테마로 타로 타이머를 더욱 강력하게 사용하세요.

청구 기간: 1개월

기본 가격:
→ 미국(USD): $4.99 선택
→ "나머지 국가 자동 변환" 활성화

혜택 (선택사항):
→ 무제한 세션 저장
→ 광고 제거
→ 프리미엄 테마 접근
→ 우선 고객 지원
```

#### 연간 구독 설정
```
구독 ID: tarot_timer_yearly

이름: Tarot Timer Premium Yearly

설명:
무제한 세션 저장, 광고 제거, 프리미엄 테마 - 1년 구독으로 42% 할인!

청구 기간: 12개월

기본 가격:
→ 미국(USD): $34.99
→ "나머지 국가 자동 변환" 활성화

혜택: (월간과 동일)
```

#### 구독 옵션 고급 설정
```
✅ 유예 기간: 7일 (기본값, 변경 불필요)
✅ 계정 보류: 30일 (기본값)
✅ 재구독 허용: 활성화 (기본값)

무료 체험 (선택사항):
→ 7일 무료 체험 제공 가능
→ 첫 구독자 확보에 효과적
→ 나중에 추가 가능
```

#### 세금 및 가격 확인
```
→ "국가별 가격 보기" 클릭
→ 주요 국가 확인:
  - 한국: ₩6,600 (월간), ₩46,000 (연간)
  - 일본: ¥730 (월간), ¥5,100 (연간)
  - 영국: £4.99 (월간), £34.99 (연간)

→ VAT는 Google이 자동 처리
```

#### 저장 및 활성화
```
→ "저장" 클릭
→ "활성화" 클릭
→ 앱 버전에서 구독 사용 준비 완료
```

---

## 🧪 테스트 체크리스트

### 웹 환경 테스트 (시뮬레이션 모드)

```bash
# Expo 서버 실행
npx expo start --tunnel

# 브라우저에서 확인
http://localhost:8081
```

#### 확인 사항:
- [ ] 구독 화면에서 월간 ₩6,600 표시 확인
- [ ] 연간 구독 ₩46,000 표시 확인
- [ ] 할인율 42% 계산 정확성 확인
- [ ] "개인정보 처리방침" 링크 클릭 시 콘솔 로그 출력 확인
- [ ] "이용약관" 링크 클릭 시 콘솔 로그 출력 확인
- [ ] 구독 동의 문구 하단 표시 확인

### iOS 실기기 테스트 (Sandbox 모드)

```bash
# TestFlight 빌드 생성
eas build --platform ios --profile preview

# 또는 로컬 빌드
npx expo run:ios
```

#### 확인 사항:
- [ ] App Store Connect에서 구독 상품 "준비 완료" 상태 확인
- [ ] 실기기에서 월간/연간 구독 가격 표시 확인
- [ ] Sandbox 계정으로 결제 테스트
- [ ] 구매 복원 기능 동작 확인
- [ ] 취소 후 재구독 테스트

### Android 실기기 테스트 (Internal Testing)

```bash
# Google Play Console 내부 테스트 트랙에 업로드
eas build --platform android --profile preview
```

#### 확인 사항:
- [ ] Google Play Console에서 구독 상품 "활성" 상태 확인
- [ ] 실기기에서 월간/연간 구독 가격 표시 확인
- [ ] 테스트 계정으로 결제 테스트
- [ ] 구매 복원 기능 동작 확인
- [ ] 취소 및 환불 테스트

---

## 📊 기대 효과

### 수익 증가 예측

#### 기존 가격 (₩3,900/월)
```
10,000 MAU × 5% 구독률 = 500명
500명 × ₩3,900 × 85% = ₩1,657,500/월
연간: ₩19,890,000
```

#### 신규 가격 (₩6,600/월)
```
10,000 MAU × 5% 구독률 = 500명
500명 × ₩6,600 × 85% = ₩2,805,000/월
연간: ₩33,660,000

증가율: +69.2% (+₩13,770,000/년)
```

### 시장 경쟁력 분석

| 앱 | 카테고리 | 월 가격 | 위치 |
|-----|---------|--------|------|
| Calm | 명상 | $14.99 | 프리미엄 |
| Headspace | 명상 | $12.99 | 프리미엄 |
| Labyrinthos | 타로 | $7.99 | 중상 |
| **타로 타이머** | **타로** | **$4.99** | **중간** ✅ |
| Golden Thread | 타로 | $3.99 | 중하 |
| Tarot Daily | 타로 | $2.99 | 저가 |

**결론**: 적정 가격대 유지하면서 수익성 개선 ✅

---

## 🔒 보안 및 컴플라이언스

### 이미 구현된 보안 기능
- ✅ 영수증 검증 시스템 ([utils/receiptValidator.ts](utils/receiptValidator.ts))
- ✅ 중복 결제 방지 ([iapManager.ts:625-642](utils/iapManager.ts#L625-L642))
- ✅ 네트워크 오류 복구 ([iapManager.ts:596-621](utils/iapManager.ts#L596-L621))
- ✅ 자동 환불 처리 ([iapManager.ts:671-695](utils/iapManager.ts#L671-L695))

### 추가 필요 사항
- [ ] GDPR 동의 메커니즘 (EU 사용자 대상)
- [ ] 데이터 삭제 요청 처리
- [ ] 결제 정보 로깅 최소화

---

## 💡 다음 업데이트 권장사항

### Phase 1: 프리미엄 기능 확장 (2주)
```
1. 프리미엄 전용 타로 스프레드 3종 추가
2. 클라우드 백업/복원 (Firebase 또는 Supabase)
3. 고급 통계 대시보드
4. 커스텀 테마 빌더
```

### Phase 2: 프로모션 전략 (1개월)
```
1. 런칭 프로모션: $3.99 (첫 3개월)
2. 연간 구독 추가 할인: 50% OFF
3. 친구 초대 리워드: 1주일 무료
4. 재구독 사용자 특별 쿠폰
```

### Phase 3: A/B 테스트 (지속적)
```
1. 가격 민감도 테스트 ($3.99 vs $4.99 vs $5.99)
2. 무료 체험 기간 테스트 (3일 vs 7일 vs 14일)
3. 연간 할인율 테스트 (30% vs 40% vs 50%)
```

---

## 📝 변경 파일 요약

### 수정된 파일
1. **utils/iapManager.ts** (Lines 124-136)
   - 월간 구독 가격: ₩3,900 → ₩6,600
   - 연간 구독 가격: ₩19,900 → ₩46,000
   - 할인율 표시: 58% → 42%

2. **components/subscription/SubscriptionPlans.tsx** (Lines 356-386, 651-681)
   - 개인정보 처리방침 링크 추가
   - 이용약관 링크 추가
   - 약관 동의 문구 추가
   - 법률 링크 스타일 추가

### 신규 파일
3. **SUBSCRIPTION_EVALUATION_REPORT.md** (전체)
   - $4.99 구독 모델 타당성 분석
   - 앱스토어/플레이스토어 설정 가이드
   - 예상 수익 시뮬레이션
   - 주의사항 및 권장사항

4. **SUBSCRIPTION_UPDATES_CHANGELOG.md** (현재 파일)
   - 변경사항 상세 기록
   - 다음 단계 가이드
   - 테스트 체크리스트

---

## ✅ 완료 상태

| 작업 | 상태 | 비고 |
|-----|------|-----|
| 가격 업데이트 | ✅ 완료 | iapManager.ts 수정 완료 |
| 법률 링크 UI 추가 | ✅ 완료 | SubscriptionPlans.tsx 수정 완료 |
| 평가 보고서 작성 | ✅ 완료 | SUBSCRIPTION_EVALUATION_REPORT.md |
| 변경사항 문서화 | ✅ 완료 | 현재 문서 |
| 법률 문서 작성 | ⏳ 대기 | 외부 작업 필요 |
| App Store 설정 | ⏳ 대기 | App Store Connect 접근 필요 |
| Google Play 설정 | ⏳ 대기 | Google Play Console 접근 필요 |
| 실기기 테스트 | ⏳ 대기 | 스토어 설정 후 진행 |

---

**작성자**: Claude Code
**최종 업데이트**: 2025-10-15
**다음 리뷰**: 스토어 설정 완료 후
