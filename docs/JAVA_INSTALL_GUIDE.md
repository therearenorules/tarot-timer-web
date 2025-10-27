# Java 17 설치 가이드 (Windows)

> **목적**: Android 로컬 빌드를 위한 Java 17 설치

## 🚀 빠른 설치 (5분)

### 방법 1: Temurin JDK 17 (권장)

1. **다운로드**
   ```
   https://adoptium.net/temurin/releases/?version=17
   ```

2. **설치 옵션 선택**
   - Windows x64 선택
   - `.msi` 설치 파일 다운로드
   - 파일명: `OpenJDK17U-jdk_x64_windows_hotspot_17.0.x.msi`

3. **설치 진행**
   - 다운로드한 `.msi` 파일 실행
   - **중요**: 설치 시 다음 옵션 체크
     - ✅ Set JAVA_HOME variable
     - ✅ Add to PATH
     - ✅ Associate .jar files
   - "Next" → "Install" → 완료

4. **설치 확인**
   ```bash
   # 새 터미널 열기 (중요!)
   java -version

   # 출력 예시:
   # openjdk version "17.0.x"
   # OpenJDK Runtime Environment Temurin-17.0.x
   ```

---

### 방법 2: Chocolatey 사용 (자동화)

```powershell
# PowerShell 관리자 권한으로 실행
choco install temurin17 -y

# 설치 확인
java -version
```

---

## ⚙️ 수동 환경변수 설정 (설치 시 자동 설정 안 된 경우)

### JAVA_HOME 설정

1. **시스템 속성 열기**
   - Windows 검색 → "환경 변수"
   - "시스템 환경 변수 편집" 클릭

2. **JAVA_HOME 추가**
   - "환경 변수" 버튼 클릭
   - "시스템 변수" 섹션에서 "새로 만들기"
   - 변수 이름: `JAVA_HOME`
   - 변수 값: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`
   - (실제 설치 경로로 변경)

3. **PATH에 추가**
   - "시스템 변수"에서 `Path` 선택 → "편집"
   - "새로 만들기" 클릭
   - 추가: `%JAVA_HOME%\bin`
   - "확인" → "확인" → "확인"

4. **확인**
   ```bash
   # 새 터미널 열기
   echo %JAVA_HOME%
   java -version
   ```

---

## 🔍 문제 해결

### "java is not recognized"
- 새 터미널 열기 (환경변수 갱신)
- PATH에 Java bin 경로 추가 확인
- 시스템 재시작

### "JAVA_HOME is not set"
- JAVA_HOME 환경변수 설정 확인
- 경로에 공백이나 특수문자 없는지 확인
- 경로가 실제 JDK 설치 경로인지 확인

---

## ✅ 설치 완료 확인

```bash
# Java 버전 확인
java -version

# 출력:
# openjdk version "17.0.x"
# OpenJDK Runtime Environment Temurin-17.0.x

# JAVA_HOME 확인
echo %JAVA_HOME%

# 출력:
# C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot

# javac 확인 (컴파일러)
javac -version

# 출력:
# javac 17.0.x
```

---

## 🎯 다음 단계

Java 설치 완료 후:
```bash
cd C:\Users\cntus\Desktop\tarot-timer-web\android
gradlew.bat bundleRelease
```

---

**예상 소요 시간**: 5-10분
**다운로드 크기**: ~180MB
**설치 용량**: ~300MB

---

**작성일**: 2025-10-27
**목적**: Android AAB 로컬 빌드
