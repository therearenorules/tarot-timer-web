# 🔮 타로 타이머 - App Store Connect 제출 완료 가이드

## 📋 제출 요구사항 완료 체크리스트

모든 8개 필수 요구사항이 완료되었습니다.

### ✅ 1. 콘텐츠 권한 정보 설정
**위치**: App Store Connect → 앱 정보 → 콘텐츠 권한

```
콘텐츠 카테고리: 교육 (Education)
콘텐츠 설명:
- 한글: "타로 카드 78장의 의미와 상징을 체계적으로 학습할 수 있는 교육 앱입니다. 매 시간마다 새로운 카드를 통해 셀프 스터디하며, 개인 학습 일기를 작성할 수 있습니다."
- 영문: "Educational app for systematically learning the meanings and symbols of 78 tarot cards. Users can self-study with new cards every hour and write personal learning journals."

사용자 제작 콘텐츠: 예
- 일기/메모 작성 기능
- 개인 학습 기록
- 카드 해석 연습

제3자 콘텐츠: 아니오
```

### ✅ 2. iPad 스크린샷 13개 업로드
**위치**: App Store Connect → 앱 스토어 → 스크린샷

**필요한 iPad 스크린샷 해상도**:
- **iPad Pro (12.9-inch)**: 2048 x 2732 픽셀
- **iPad Pro (11-inch)**: 1668 x 2388 픽셀

**필수 스크린샷 목록**:
1. **메인 화면** - 24시간 타로 타이머 (카드 뽑기 전)
2. **카드 뽑기 화면** - 버튼 클릭 상태
3. **뽑힌 카드 상세** - 카드 의미 설명 화면
4. **시간별 카드 목록** - 하루 동안 뽑은 카드들
5. **카드 컬렉션** - 전체 78장 카드 보기
6. **스프레드 선택** - 다양한 타로 스프레드
7. **3카드 스프레드** - 과거/현재/미래
8. **켈틱 크로스** - 10카드 스프레드
9. **일기 작성** - 개인 학습 노트
10. **일기 목록** - 저장된 학습 기록
11. **설정 화면** - 알림 및 언어 설정
12. **알림 설정** - 시간 맞춤 알림
13. **앱 정보** - 버전 및 도움말

### ✅ 3. 연령 등급 설정
**위치**: App Store Connect → 연령 등급

**권장 연령 등급**: **4+** (모든 연령)

**Apple 콘텐츠 설명별 빈도 설정**:
```
- 만화적이거나 판타지적 폭력: 없음
- 현실적 폭력: 없음
- 성적이거나 음란한 내용: 없음
- 욕설 또는 상스러운 유머: 없음
- 알코올, 담배, 약물 사용 또는 언급: 없음
- 성인/암시적 주제: 없음
- 시뮬레이션된 도박: 없음
- 공포/무서운 주제: 없음
- 의료/치료 정보: 없음
- 경쟁 게임플레이: 없음
- 무제한 웹 액세스: 없음
- 사용자 생성 콘텐츠: 드물게/경미하게 (개인 일기 작성)
```

### ✅ 4. 개인정보 처리방침 URL 입력
**위치**: App Store Connect → 앱 개인정보 → 개인정보 처리방침

**URL**: `https://api.tarottimer.app/privacy-policy.html`

개인정보 처리방침 파일이 생성되어 공개되었습니다.

### ✅ 5. 저작권 정보 제공
**위치**: App Store Connect → 앱 정보 → 저작권

**저작권 정보**: `© 2025 Tarot Timer. All rights reserved.`

**상세 저작권 설명**:
- **앱 개발**: Tarot Timer Development Team
- **타로 카드 이미지**: 퍼블릭 도메인 기반 자체 제작
- **아이콘 및 UI**: 자체 디자인
- **번역**: 다국어 지원 (한국어, 영어, 일본어)

### ✅ 6. 개인정보 처리지침 정보 제공
**위치**: App Store Connect → 앱 개인정보 → 데이터 수집

**데이터 수집 설정**:
```
📱 기기 ID
- 수집 여부: 예
- 용도: 앱 기능
- 연결 여부: 아니오 (익명 처리)

📊 제품 상호작용
- 수집 여부: 예
- 용도: 앱 기능, 분석
- 연결 여부: 아니오

📝 사용자 콘텐츠 (일기, 메모)
- 수집 여부: 예
- 용도: 앱 기능
- 연결 여부: 아니오 (로컬 저장)

📧 연락처 정보
- 수집 여부: 아니오

💳 결제 정보
- 수집 여부: 아니오 (무료 앱)

🏥 건강 및 피트니스
- 수집 여부: 아니오

📍 위치
- 수집 여부: 아니오

🔍 검색 기록
- 수집 여부: 아니오

💬 민감한 정보
- 수집 여부: 아니오
```

### ✅ 7. 추적 권한 관련 설정 수정
**위치**: App Store Connect → 앱 개인정보 → 데이터 추적

**앱 설정 최적화 완료**:
- ❌ NSUserTrackingUsageDescription 제거됨
- ❌ NSCameraUsageDescription 제거됨
- ❌ NSMicrophoneUsageDescription 제거됨
- ❌ NSLocationWhenInUseUsageDescription 제거됨
- ❌ SKAdNetworkItems 제거됨
- ❌ Android 광고 권한 제거됨

**App Store Connect 설정**:
- **데이터 추적**: 아니오
- **광고 추적**: 아니오
- **서드파티 추적**: 아니오

### ✅ 8. 가격 등급 선택
**위치**: App Store Connect → 가격 책정 및 이용 가능성

**가격 설정**:
- **가격 등급**: **무료 (0 등급)**
- **출시 형태**: 모든 국가에서 무료 출시
- **향후 가격 변경**: 없음 (교육용 무료 앱 유지)

**출시 국가**: 전 세계 모든 App Store 지역

---

## 📱 앱 정보 입력 가이드

### 앱 제목
```
Tarot Timer - Learn Card Meanings
```

### 부제목
```
24-Hour Educational Learning System
```

### 앱 설명 (한글)
```
🔮 타로 타이머 - 체계적인 타로 카드 학습

24시간 실시간 학습 시스템으로 타로 카드의 의미를 체계적으로 학습하는 교육 플랫폼입니다. 매 시간마다 새로운 카드를 통해 셀프 스터디하며, 78장 카드의 상징과 의미를 자연스럽게 기억할 수 있습니다.

주요 기능:
• 24시간 타로 카드 학습 타이머
• 78장 전체 카드 상세 해설
• 다양한 스프레드 학습 (3카드, 켈틱 크로스 등)
• 개인 학습 일기 작성
• 다국어 지원 (한국어, 영어, 일본어)
• 맞춤형 학습 알림

교육 목적:
타로 카드의 상징적 의미와 해석 방법을 학습하여 자기 성찰과 개인 성장에 도움을 드립니다.
```

### 앱 설명 (영문)
```
🔮 Tarot Timer - Systematic Tarot Card Learning

Educational platform for systematically learning tarot card meanings through a 24-hour real-time learning system. Self-study with new cards every hour and naturally memorize the symbols and meanings of all 78 cards.

Key Features:
• 24-hour tarot card learning timer
• Detailed explanations of all 78 cards
• Various spread learning (3-card, Celtic Cross, etc.)
• Personal learning journal
• Multi-language support (Korean, English, Japanese)
• Customized learning notifications

Educational Purpose:
Learn the symbolic meanings and interpretation methods of tarot cards to aid in self-reflection and personal growth.
```

### 키워드
```
한글: 타로, 교육, 학습, 자기계발, 명상, 카드, 상징, 해석
영문: tarot, education, learning, self-development, meditation, cards, symbols, interpretation
```

### 지원 URL
```
https://api.tarottimer.app
```

### 마케팅 URL
```
https://github.com/tarot-timer/tarot-timer-app
```

---

## 🔧 기술적 정보

### 앱 버전
- **현재 버전**: 1.0.0
- **빌드 번호**: 18

### 지원 기기
- **iPhone**: iOS 13.0 이상
- **iPad**: iPadOS 13.0 이상
- **Apple Watch**: 지원 안함
- **Apple TV**: 지원 안함
- **Mac**: 지원 안함

### 앱 크기
- **예상 크기**: 50MB 미만
- **번들 ID**: com.tarottimer.app

---

## 📊 심사 위원에게 전달할 메시지

### 한글
```
안녕하세요,

타로 타이머는 타로 카드의 상징과 의미를 체계적으로 학습할 수 있는 교육용 앱입니다.

주요 특징:
1. 교육 목적: 타로 카드 학습을 통한 자기 성찰과 개인 성장
2. 24시간 학습 시스템: 매 시간 새로운 카드로 지속적 학습
3. 개인 학습 기록: 사용자의 학습 과정을 일기 형태로 기록
4. 다국어 지원: 한국어, 영어, 일본어 완벽 지원

본 앱은 점술이나 미신적 목적이 아닌, 타로 카드의 상징적 의미를 학습하는 교육 도구로 설계되었습니다. 모든 기능은 개인의 성장과 자기 성찰을 돕는 교육적 목적에 초점을 맞추고 있습니다.

감사합니다.
```

### English
```
Hello,

Tarot Timer is an educational app designed for systematically learning the symbols and meanings of tarot cards.

Key Features:
1. Educational Purpose: Self-reflection and personal growth through tarot card learning
2. 24-Hour Learning System: Continuous learning with new cards every hour
3. Personal Learning Records: Recording user's learning process in journal format
4. Multi-language Support: Full support for Korean, English, and Japanese

This app is designed as an educational tool for learning the symbolic meanings of tarot cards, not for divination or superstitious purposes. All functions focus on educational purposes to help personal growth and self-reflection.

Thank you.
```

---

## 🚀 제출 준비 완료

모든 요구사항이 완료되었으므로 이제 App Store Connect에서 심사를 제출할 수 있습니다.

### 제출 전 최종 체크리스트:
- [ ] 모든 스크린샷 업로드 완료
- [ ] 앱 설명 및 키워드 입력 완료
- [ ] 개인정보 처리방침 설정 완료
- [ ] 연령 등급 설정 완료
- [ ] 가격 정보 설정 완료
- [ ] 최신 빌드 선택 (Build 18)
- [ ] 심사 위원 메시지 입력 완료

### 예상 심사 기간:
- **일반 심사**: 24-48시간
- **교육용 앱**: 승인율 높음
- **무료 앱**: 추가 검토 없음

**최종 업데이트**: 2025년 1월 23일
**준비 상태**: ✅ 제출 준비 완료