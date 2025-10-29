# 📱 App Store Connect 설정 - 초보자용 상세 가이드

**목표**: 3개의 URL을 App Store Connect에 입력하기
**소요 시간**: 15분
**난이도**: ⭐⭐ 보통

---

## 🔑 Step 0: App Store Connect 로그인

### 1. 브라우저에서 접속
```
https://appstoreconnect.apple.com
```

### 2. Apple ID로 로그인
- 앱을 등록할 때 사용한 Apple ID로 로그인하세요

### 3. 메인 화면 확인
- 로그인하면 "App Store Connect" 메인 화면이 보입니다
- 상단 메뉴에 **"My Apps"** 버튼이 있어야 합니다

---

## 📱 Step 1: 앱 선택

### 1-1. "My Apps" 클릭
- 상단 메뉴에서 **"My Apps"** 클릭
- 또는 홈 화면에서 **"Apps"** 카드 클릭

### 1-2. 타로 타이머 앱 찾기
- 앱 목록에서 **"Tarot Timer - Learn Card Meanings"** 클릭
- 또는 검색창에 "Tarot Timer" 입력 후 선택

### 1-3. 앱 정보 화면 확인
- 왼쪽에 메뉴가 보입니다:
  ```
  📱 App Store
  💰 Pricing and Availability
  ℹ️ App Information
  📊 Activity
  등...
  ```

**✅ 체크포인트**: 왼쪽 메뉴가 보이면 성공!

---

## 🔒 Step 2-1: Privacy Policy URL 입력

### 위치 찾기
1. 왼쪽 메뉴에서 **"App Information"** 클릭
   - 위치: "General" 섹션 아래에 있습니다
   - 아이콘: ℹ️ 모양

2. 페이지가 로드되면 아래로 스크롤

3. **"General Information"** 섹션 찾기
   - "Copyright" 필드 아래쯤에 있습니다

### Privacy Policy URL 입력
4. **"Privacy Policy URL"** 필드 찾기
   - 라벨: "Privacy Policy URL (Required)"
   - 현재 비어있거나 다른 URL이 있을 수 있습니다

5. 다음 URL을 **복사해서** 붙여넣기:
   ```
   https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
   ```

6. **중요**: 페이지 상단 오른쪽의 **"Save"** 버튼 클릭!

### 확인 방법
- 저장 후 페이지를 새로고침해도 URL이 그대로 있는지 확인
- URL을 클릭해서 페이지가 열리는지 테스트

**✅ 체크포인트**: Privacy Policy URL 필드에 URL이 저장되었고, 클릭하면 페이지가 열립니다.

---

## 📄 Step 2-2: Terms of Service (EULA) 링크 추가

### 방법 1: App Description에 추가 (더 쉬움 - 권장!)

#### 위치 찾기
1. 왼쪽 메뉴에서 **"App Store"** 클릭
   - 위치: 왼쪽 메뉴 상단 부근
   - 아이콘: 📱 모양

2. 현재 버전 선택
   - "iOS App" 아래에 **"1.0.9"** (또는 현재 버전) 보임
   - 버전 번호 클릭

3. **"App Information"** 섹션으로 스크롤
   - "Version Information" 아래에 있습니다

#### App Description 수정
4. **"Description"** 필드 찾기
   - 큰 텍스트 박스입니다
   - 현재 앱 설명이 들어있습니다

5. 텍스트 박스를 클릭하여 편집 모드로 전환

6. **맨 아래로** 스크롤해서 다음 내용 추가:
   ```

   📄 Legal Documents:
   • Terms of Service: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
   • Privacy Policy: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
   ```

7. **중요**: 페이지 상단 오른쪽의 **"Save"** 버튼 클릭!

**✅ 체크포인트**: App Description 맨 아래에 법률 문서 링크가 추가되었습니다.

---

### 방법 2: EULA 필드 사용 (선택사항)

**이 방법은 더 복잡합니다. 방법 1을 권장합니다!**

만약 방법 1을 사용했다면 이 부분은 건너뛰세요.

#### 위치 찾기
1. 왼쪽 메뉴에서 **"App Information"** 클릭
2. 아래로 스크롤해서 **"License Agreement"** 섹션 찾기

#### EULA 입력
3. **"End User License Agreement (EULA)"** 섹션
   - 기본값: "Standard Apple EULA"가 선택되어 있음

4. **"Custom EULA"** 라디오 버튼 선택

5. 텍스트 필드에 URL 입력:
   ```
   https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html
   ```

6. **Save** 버튼 클릭

---

## 🆘 Step 2-3: Support URL 수정

### 위치 찾기
1. 왼쪽 메뉴에서 **"App Information"** 클릭 (아직 열려있으면 그대로)

2. **"General Information"** 섹션에서 스크롤

3. **"Support URL"** 필드 찾기
   - 위치: Privacy Policy URL 근처
   - 라벨: "Support URL (Required)"

### Support URL 수정
4. 현재 URL 확인
   - 아마 `https://therearenorules.github.io/` 가 있을 것입니다

5. **선택하고 삭제**한 후, 다음 URL로 교체:
   ```
   https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/support.html
   ```

6. **중요**: 페이지 상단 오른쪽의 **"Save"** 버튼 클릭!

### 확인 방법
- URL을 클릭해서 고객 지원 페이지가 열리는지 확인
- changsekwon@gmail.com과 @deanosajutaro가 보이는지 확인

**✅ 체크포인트**: Support URL이 새로운 주소로 변경되고 저장되었습니다.

---

## 🎯 최종 확인 체크리스트

모든 작업이 끝났으면 다음을 확인하세요:

### App Information 페이지에서:
- [ ] **Privacy Policy URL** 필드에 URL 입력됨
- [ ] **Support URL** 필드에 새 URL로 변경됨
- [ ] 각 URL 클릭 시 페이지가 정상적으로 열림
- [ ] **Save** 버튼을 눌러서 저장함

### App Store 페이지에서 (방법 1 사용 시):
- [ ] **Description** 맨 아래에 법률 문서 링크 추가됨
- [ ] **Save** 버튼을 눌러서 저장함

### 또는 App Information 페이지에서 (방법 2 사용 시):
- [ ] **Custom EULA**에 Terms URL 입력됨
- [ ] **Save** 버튼을 눌러서 저장함

---

## 🖼️ 화면 위치 참고

### App Store Connect 메뉴 구조:
```
App Store Connect
└── My Apps
    └── Tarot Timer - Learn Card Meanings
        ├── 📱 App Store ← Description 편집 (방법 1)
        │   └── 1.0.9 (현재 버전)
        │       └── Description 필드
        │
        ├── ℹ️ App Information ← URL 3개 입력
        │   ├── General Information
        │   │   ├── Privacy Policy URL ← 여기!
        │   │   └── Support URL ← 여기!
        │   └── License Agreement
        │       └── Custom EULA ← 여기! (방법 2)
        │
        └── 기타 메뉴들...
```

---

## 🔍 각 필드 찾는 팁

### Privacy Policy URL 찾기:
1. App Information 클릭
2. 페이지 중간쯤 스크롤
3. "General Information" 섹션
4. "Privacy Policy URL (Required)" 라벨 찾기

### Support URL 찾기:
1. 같은 페이지 (App Information)
2. Privacy Policy URL 바로 위 또는 아래
3. "Support URL (Required)" 라벨 찾기

### App Description 찾기:
1. App Store 클릭 (왼쪽 메뉴)
2. 버전 번호(1.0.9) 클릭
3. 큰 텍스트 박스가 Description입니다
4. 스크롤해서 맨 아래로 이동

---

## ⚠️ 자주 하는 실수

### 실수 1: Save 버튼을 누르지 않음
- **증상**: URL을 입력했는데 다시 들어가면 사라짐
- **해결**: 반드시 페이지 상단 오른쪽 **"Save"** 버튼 클릭!

### 실수 2: 잘못된 페이지에서 찾고 있음
- **증상**: Privacy Policy URL 필드가 안 보임
- **해결**: **"App Information"** 페이지인지 확인 (왼쪽 메뉴)

### 실수 3: URL에 공백이나 줄바꿈 포함
- **증상**: "Invalid URL" 오류 메시지
- **해결**: URL을 다시 복사해서 붙여넣기 (앞뒤 공백 제거)

### 실수 4: 앱 설명(Description)을 못 찾음
- **증상**: Description 필드가 안 보임
- **해결**: **"App Store"** → **버전 번호(1.0.9)** 클릭했는지 확인

---

## 🆘 그래도 안 되면?

### 상황 1: Privacy Policy URL 필드가 안 보여요
**가능한 이유**:
- 다른 페이지에 있을 수 있습니다
- "General Information" 섹션을 찾아보세요

**해결**:
1. 왼쪽 메뉴에서 "App Information" 클릭 확인
2. 페이지를 천천히 스크롤하며 찾아보기
3. Cmd+F (Mac) 또는 Ctrl+F (Windows)로 "Privacy" 검색

### 상황 2: Save 버튼이 안 눌려요
**가능한 이유**:
- 아무것도 변경하지 않았거나
- 필수 필드가 비어있거나
- 권한이 없을 수 있습니다

**해결**:
1. 빨간색 오류 메시지가 있는지 확인
2. 모든 필수 필드가 채워져 있는지 확인
3. Apple Developer Program 멤버십 확인

### 상황 3: URL 형식이 잘못되었다고 나와요
**해결**:
1. URL 앞뒤에 공백이 없는지 확인
2. URL이 `https://`로 시작하는지 확인
3. URL을 브라우저 주소창에 붙여넣어서 작동하는지 먼저 테스트

---

## 📸 스크린샷 위치 요약

### 필요한 3곳:

**1️⃣ Privacy Policy URL**
```
경로: App Information → General Information → Privacy Policy URL
```

**2️⃣ Terms of Service**
```
방법 1: App Store → [버전] → Description (맨 아래에 추가)
방법 2: App Information → License Agreement → Custom EULA
```

**3️⃣ Support URL**
```
경로: App Information → General Information → Support URL
```

---

## ✅ 완료 후 다음 단계

Step 2가 끝나면 [TODO_NEXT_STEPS.md](TODO_NEXT_STEPS.md)로 돌아가서:
- **Step 3**: app.json 버전 업데이트
- **Step 4**: 새 iOS 빌드 생성

---

## 💬 추가 도움이 필요하면

다음과 같이 말씀하세요:
- "Privacy Policy URL 필드가 안 보여" → 더 자세히 안내
- "Save 버튼이 회색이야" → 원인 분석
- "Description을 못 찾겠어" → 화면 경로 다시 안내
- "스크린샷 보내줄까?" → 실제 화면 보고 도와드림

---

**🎯 이 가이드를 따라하면 15분 안에 완료할 수 있습니다!**
**💪 천천히 하나씩 체크하면서 진행하세요!**

---

**마지막 업데이트**: 2025년 10월 29일
**작성자**: Claude Code
**난이도**: ⭐⭐ 보통 (처음에는 헷갈릴 수 있지만 한 번 하면 쉬워집니다!)
