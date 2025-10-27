# Android AAB Build Script
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "=== Java Version Check ===" -ForegroundColor Green
java -version

Write-Host "`n=== Starting AAB Build ===" -ForegroundColor Green
cd android
.\gradlew.bat bundleRelease

Write-Host "`n=== Build Complete ===" -ForegroundColor Green
Write-Host "AAB Location: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Yellow
