# 🚨 긴급 수정 - EULA 링크 추가

**문제**: Apple이 아직 EULA 링크를 찾지 못함
**해결**: App Store Connect에 EULA 정보 추가 (2가지 방법)

---

## ⚡ 방법 1: App Description에 링크 추가 (5분 소요) ⭐ **가장 빠름!**

### 단계:

1. **App Store Connect 접속**: https://appstoreconnect.apple.com

2. **My Apps** → **Tarot Timer** 선택

3. 왼쪽 메뉴에서 **App Store** 클릭

4. 현재 버전 **1.1.1** 클릭

5. **Description** (앱 설명) 필드 찾기
   - 큰 텍스트 박스입니다
   - 현재 앱 설명이 들어있습니다

6. 텍스트 박스를 클릭하여 **편집 모드**로 전환

7. **스크롤해서 맨 아래**로 이동

8. 다음 내용을 **추가**:

```

📄 Legal Documents

Terms of Use (EULA): https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html

Privacy Policy: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
```

9. **Save** 버튼 클릭 (오른쪽 상단)

10. **Submit for Review** 다시 클릭

### ✅ 완료 확인:
- App Description 맨 아래에 "Terms of Use (EULA)" 링크가 보이는가?
- URL을 클릭하면 페이지가 열리는가?

---

## 📄 방법 2: Custom EULA 업로드 (10분 소요)

이 방법은 더 전문적이지만 시간이 더 걸립니다.

### 단계:

1. **App Store Connect 접속**: https://appstoreconnect.apple.com

2. **My Apps** → **Tarot Timer** 선택

3. 왼쪽 메뉴에서 **App Information** 클릭

4. 아래로 스크롤해서 **License Agreement** 섹션 찾기

5. 현재 **"Standard Apple EULA"**가 선택되어 있을 것입니다

6. **"Custom EULA"** 라디오 버튼 클릭

7. 텍스트 필드가 나타남

8. **APPLE_EULA_COMPLETE.txt** 파일 내용 복사:
   - 프로젝트 루트에 있는 `APPLE_EULA_COMPLETE.txt` 파일 열기
   - 전체 선택 (Cmd+A)
   - 복사 (Cmd+C)

9. App Store Connect의 Custom EULA 텍스트 필드에 **붙여넣기**

10. **Save** 버튼 클릭

11. 다시 **App Store** → **1.1.1** 버전으로 가서 **Submit for Review** 클릭

### ✅ 완료 확인:
- App Information → License Agreement에서 "Custom EULA"가 선택되어 있는가?
- Custom EULA 텍스트가 저장되어 있는가?

---

## 🎯 어떤 방법을 선택해야 하나?

### **방법 1 추천** ⭐
- **장점**: 빠르고 간단함 (5분)
- **장점**: 링크만 추가하면 됨
- **장점**: 실수할 가능성 낮음
- **단점**: App Description에 링크가 보임 (사용자가 봄)

### **방법 2**
- **장점**: 더 전문적 (별도 EULA 섹션)
- **장점**: App Description이 깔끔함
- **단점**: 814줄 텍스트 복사/붙여넣기 필요
- **단점**: 시간이 더 걸림 (10분)

---

## ⚠️ 중요: 둘 중 하나만 해도 됩니다!

**방법 1**을 먼저 시도하세요. 5분이면 끝납니다!

---

## 🔄 방법 1 상세 가이드

### 1. App Description 찾기

```
App Store Connect 홈
└── My Apps
    └── Tarot Timer
        └── 📱 App Store (왼쪽 메뉴)
            └── 1.1.1 (버전 클릭)
                └── Description 필드 (큰 텍스트 박스)
```

### 2. 현재 Description 끝에 추가할 내용

정확히 이렇게 복사해서 붙여넣으세요:

```


📄 Legal Documents

Terms of Use (EULA): https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html

Privacy Policy: https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/privacy-policy.html
```

**주의**: 위에 빈 줄 2개가 있습니다! (현재 설명과 구분하기 위해)

### 3. Save 후 확인

- Save 버튼 클릭
- 페이지 새로고침
- Description 맨 아래에 링크가 있는지 확인

### 4. 심사 재제출

- 같은 페이지에서 **Submit for Review** 버튼 클릭
- 또는 Version 페이지에서 Submit 버튼 찾기

---

## 📱 Apple에게 회신 메시지 (선택사항)

심사 재제출 시 다음 메시지를 추가할 수 있습니다:

```
Hi Apple Review Team,

Thank you for your feedback. I have now added the Terms of Use (EULA) link to the App Description as requested.

The EULA link is now visible at the bottom of the App Description:
https://htmlpreview.github.io/?https://github.com/therearenorules/tarot-timer-web/blob/main/public/terms.html

This link includes:
✅ Complete Terms of Use
✅ Auto-renewable subscription terms
✅ Cancellation policy
✅ Refund policy

Please let me know if you need any additional information.

Thank you!
```

---

## 🆘 문제 해결

### Q: Description 필드를 못 찾겠어요
**A**:
1. 왼쪽 메뉴에서 "App Store" 클릭했는지 확인
2. 버전 번호(1.1.1) 클릭했는지 확인
3. 페이지를 아래로 스크롤 - "Description" 라벨이 있는 큰 텍스트 박스

### Q: Save 버튼이 회색이에요
**A**:
- 아무것도 변경하지 않았을 가능성
- Description에 링크를 추가했는지 확인
- 다른 필수 필드가 비어있는지 확인

### Q: URL이 너무 길어요
**A**:
- 괜찮습니다! Apple은 URL 길이를 제한하지 않습니다
- htmlpreview.github.io URL은 정상적으로 작동합니다

---

## ✅ 성공 확인 방법

### App Description에서:
1. Description 맨 아래에 "Terms of Use (EULA)" 텍스트가 보임
2. URL이 파란색 링크로 표시됨
3. 링크 클릭 시 페이지가 열림

### 심사 재제출 후:
1. Status가 "Waiting for Review"로 변경됨
2. 이메일로 "Your submission was successful" 알림 받음

---

## 📊 예상 타임라인

| 작업 | 소요 시간 |
|------|----------|
| App Description 편집 | 2분 |
| 링크 추가 | 1분 |
| Save 및 확인 | 1분 |
| 심사 재제출 | 1분 |
| **총 시간** | **5분** |

---

## 🎯 지금 바로 할 것

1. **App Store Connect 열기**: https://appstoreconnect.apple.com
2. **Tarot Timer 앱** 선택
3. **App Store** → **1.1.1** → **Description** 찾기
4. **맨 아래에 링크 추가**
5. **Save** 클릭
6. **Submit for Review** 클릭

**5분이면 끝납니다! 지금 바로 시작하세요!** 🚀

---

**작성일**: 2025년 10월 30일
**우선순위**: 🚨 긴급
**예상 소요 시간**: 5분
**난이도**: ⭐ 매우 쉬움
