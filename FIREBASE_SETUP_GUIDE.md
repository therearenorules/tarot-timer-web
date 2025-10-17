# 🔥 Firebase 프로젝트 생성 및 google-services.json 다운로드 가이드

**작성일**: 2025-10-16
**소요 시간**: 약 15분
**프로젝트**: 타로 타이머 (Tarot Timer)

---

## 📋 목차

1. [Firebase 프로젝트 생성](#1-firebase-프로젝트-생성-5분)
2. [Android 앱 추가](#2-android-앱-추가-5분)
3. [google-services.json 다운로드](#3-google-servicesjson-다운로드-3분)
4. [파일 배치 및 확인](#4-파일-배치-및-확인-2분)
5. [Firebase + AdMob 연동](#5-firebase--admob-연동)

---

## 1. Firebase 프로젝트 생성 (5분)

### Step 1: Firebase Console 접속
```
🌐 https://console.firebase.google.com
```

### Step 2: Google 계정으로 로그인
- AdMob과 동일한 Google 계정 사용 권장

### Step 3: 프로젝트 추가
```
홈 화면 → "프로젝트 추가" 버튼 클릭
```

### Step 4: 프로젝트 이름 입력
```yaml
프로젝트_이름: Tarot Timer
또는: tarot-timer-app

⚠️ 주의: 프로젝트 ID는 수정 불가하므로 신중하게 선택
```

### Step 5: Google Analytics 설정
```yaml
질문: "이 프로젝트에서 Google Analytics를 사용 설정하시겠습니까?"

선택: ✅ 예 (권장)
이유:
  - 사용자 행동 분석 가능
  - AdMob 수익과 통합 분석
  - 무료로 제공
```

### Step 6: Analytics 계정 선택
```yaml
옵션_1: 기존 Google Analytics 계정 선택
옵션_2: 새 계정 생성

권장: 새 계정 생성
계정_이름: Tarot Timer Analytics
```

### Step 7: 프로젝트 생성 완료
```
✅ Firebase 프로젝트 생성 완료!
⏳ 프로젝트 준비 중 (30초 소요)
```

---

## 2. Android 앱 추가 (5분)

### Step 1: 앱 추가 시작
```
Firebase Console → 프로젝트 홈 → "Android" 아이콘 클릭
또는
프로젝트 설정 → 일반 → "앱 추가" → Android 선택
```

### Step 2: Android 패키지 이름 입력
```yaml
Android_패키지_이름: com.tarottimer.app

⚠️ 중요:
  - app.json의 android.package와 정확히 일치해야 함
  - 한 번 등록하면 수정 불가
  - 소문자, 숫자, 점(.)만 사용 가능
```

### Step 3: 앱 닉네임 입력 (선택사항)
```yaml
앱_닉네임: Tarot Timer Android
또는: TarotTimer-Android

⚠️ 선택사항이지만 여러 앱 관리 시 유용
```

### Step 4: 디버그 서명 인증서 SHA-1 (선택사항)
```yaml
질문: "디버그 서명 인증서 SHA-1을 추가하시겠습니까?"

선택: ❌ 건너뛰기
이유: 나중에 추가 가능 (Google 로그인 등 필요 시에만)
```

### Step 5: 앱 등록 완료
```
✅ Android 앱이 Firebase에 등록되었습니다!
```

---

## 3. google-services.json 다운로드 (3분)

### Step 1: google-services.json 다운로드
```
Firebase Console → 앱 등록 화면 → "google-services.json 다운로드" 버튼 클릭
```

### 파일 내용 예시
```json
{
  "project_info": {
    "project_number": "123456789012",
    "project_id": "tarot-timer-xxxxx",
    "storage_bucket": "tarot-timer-xxxxx.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789012:android:xxxxxxxxxxxxx",
        "android_client_info": {
          "package_name": "com.tarottimer.app"
        }
      },
      "oauth_client": [],
      "api_key": [
        {
          "current_key": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

### ⚠️ 중요 사항
```
✅ 이 파일에는 민감한 정보가 포함됨
✅ GitHub에 커밋하지 말 것 (.gitignore에 추가)
✅ 프로젝트 루트에만 배치
```

---

## 4. 파일 배치 및 확인 (2분)

### Step 1: 파일 이동
```bash
# 다운로드한 google-services.json을 프로젝트 루트로 이동
# Windows PowerShell
Move-Item -Path "$env:USERPROFILE\Downloads\google-services.json" -Destination "C:\Users\cntus\Desktop\tarot-timer-web\google-services.json"

# Windows 명령 프롬프트
move "%USERPROFILE%\Downloads\google-services.json" "C:\Users\cntus\Desktop\tarot-timer-web\google-services.json"
```

### Step 2: 파일 위치 확인
```
프로젝트_루트/
├── app.json
├── package.json
├── google-services.json  ← 이 위치에 있어야 함!
├── App.tsx
└── ...
```

### Step 3: .gitignore 업데이트
```bash
# .gitignore에 추가 (이미 있을 수 있음)
echo "google-services.json" >> .gitignore
```

### Step 4: 파일 내용 확인
```bash
# 파일이 제대로 있는지 확인
cat google-services.json

# 또는
dir google-services.json  # Windows
ls google-services.json   # macOS/Linux
```

---

## 5. Firebase + AdMob 연동

### Step 1: Firebase Console에서 AdMob 연결
```
Firebase Console → 프로젝트 설정 → 통합 → AdMob → "연결" 클릭
```

### Step 2: AdMob 앱 선택
```yaml
질문: "연결할 AdMob 앱을 선택하세요"

선택: Tarot Timer (이전에 AdMob에서 생성한 앱)
```

### Step 3: Analytics 연동
```yaml
질문: "Google Analytics와 AdMob을 연결하시겠습니까?"

선택: ✅ 예
이유: 광고 성과와 사용자 행동 통합 분석 가능
```

### Step 4: 연동 완료
```
✅ Firebase + AdMob 연동 완료!
✅ 이제 Firebase에서 AdMob 수익과 분석 데이터 통합 확인 가능
```

---

## 📊 Firebase 추가 설정 (선택사항)

### 1. Firebase Authentication (선택)
```yaml
용도: 사용자 로그인, 회원가입
상태: 현재 미사용 (로컬 저장소만 사용)
필요_시: Firebase Console → Authentication → 시작하기
```

### 2. Firebase Firestore (선택)
```yaml
용도: 클라우드 데이터베이스 (다이어리 동기화 등)
상태: 현재 미사용 (로컬 저장소만 사용)
필요_시: Firebase Console → Firestore Database → 데이터베이스 만들기
```

### 3. Firebase Cloud Messaging (선택)
```yaml
용도: 푸시 알림
상태: 현재 Expo Notifications 사용 중
필요_시: Firebase Console → Cloud Messaging → 설정
```

### 4. Firebase Analytics (기본 포함)
```yaml
용도: 사용자 행동 분석, 이벤트 추적
상태: ✅ 자동 활성화됨
확인: Firebase Console → Analytics → 대시보드
```

---

## 🔐 보안 규칙 설정 (중요!)

### google-services.json 보안
```yaml
✅ .gitignore에 추가 (GitHub에 커밋 방지)
✅ 환경변수로 관리 고려 (CI/CD 시)
✅ 팀원에게 별도로 공유 (Slack, Email 등)
```

### Firebase 보안 규칙 (Firestore 사용 시)
```javascript
// Firestore 보안 규칙 예시
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 인증된 사용자만 자신의 데이터에 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ✅ 체크리스트

### Firebase 프로젝트 생성
- [ ] Firebase Console 접속
- [ ] 프로젝트 이름 입력: Tarot Timer
- [ ] Google Analytics 활성화
- [ ] 프로젝트 생성 완료

### Android 앱 추가
- [ ] Android 앱 추가 시작
- [ ] 패키지 이름 입력: com.tarottimer.app
- [ ] 앱 닉네임 입력 (선택)
- [ ] 앱 등록 완료

### google-services.json
- [ ] google-services.json 다운로드
- [ ] 파일을 프로젝트 루트로 이동
- [ ] .gitignore에 추가
- [ ] 파일 내용 확인

### Firebase + AdMob 연동
- [ ] Firebase Console에서 AdMob 연결
- [ ] AdMob 앱 선택
- [ ] Analytics 연동 활성화
- [ ] 연동 완료 확인

---

## 🚨 문제 해결

### Q1: google-services.json을 찾을 수 없습니다
```bash
# 파일 위치 확인
dir google-services.json  # Windows

# 파일이 없으면 Firebase Console에서 다시 다운로드
Firebase Console → 프로젝트 설정 → 일반 → Android 앱 → google-services.json 다운로드
```

### Q2: 패키지 이름이 일치하지 않습니다
```bash
# app.json 확인
cat app.json | findstr "package"

# Firebase Console에서 등록한 패키지 이름 확인
Firebase Console → 프로젝트 설정 → 일반 → Android 앱

# 불일치 시: 앱 삭제 후 다시 등록
Firebase Console → 프로젝트 설정 → 일반 → Android 앱 → 삭제
```

### Q3: Firebase 초기화 오류
```typescript
// App.tsx에서 Firebase 초기화 확인
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // google-services.json의 내용을 여기에 수동으로 입력
};

initializeApp(firebaseConfig);
```

---

## 🎯 다음 단계

### 1. app.json 업데이트
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
      }
    }
  }
}
```

### 2. AdMob 광고 단위 ID 설정
```
📁 utils/adConfig.ts 수정
→ PRODUCTION_AD_UNITS에 실제 광고 단위 ID 입력
```

### 3. 테스트 빌드
```bash
# EAS 빌드로 테스트
npx eas build --platform android --profile production-android
```

### 4. 광고 작동 확인
```bash
# 생성된 AAB 다운로드 후 실제 디바이스에 설치
# 배너, 전면, 보상형 광고가 모두 표시되는지 확인
```

---

## 📞 참고 자료

### 공식 문서
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Android 시작하기](https://firebase.google.com/docs/android/setup)
- [Expo Firebase 가이드](https://docs.expo.dev/guides/using-firebase/)

### 프로젝트 파일
- `google-services.json` - Firebase 설정 파일
- `app.json` - Expo 설정 파일
- `utils/adConfig.ts` - 광고 설정

---

**마지막 업데이트**: 2025-10-16
**예상 소요 시간**: 15분
**난이도**: ⭐⭐☆☆☆ (초보자도 가능)
**이전 단계**: AdMob 계정 생성 및 광고 단위 ID 발급
**다음 단계**: react-native-google-mobile-ads 마이그레이션
