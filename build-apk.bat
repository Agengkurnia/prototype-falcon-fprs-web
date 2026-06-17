@echo off
echo ===================================================
echo Building Falcon SFA Prototype Android APK...
echo ===================================================

echo [1/3] Syncing latest Views and wwwroot assets to Flutter project...
node "%~dp0scripts\create-flutter-wrapper.js"
if %ERRORLEVEL% neq 0 (
    echo Error during syncing assets.
    exit /b %ERRORLEVEL%
)

echo [2/3] Building Flutter Release APK...
cd /d "%~dp0Mobile\MobileApp"
call flutter build apk --release
if %ERRORLEVEL% neq 0 (
    echo Flutter build failed.
    exit /b %ERRORLEVEL%
)

echo [3/3] Copying APK to Prototype root directory...
copy /Y "build\app\outputs\apk\release\app-release.apk" "%~dp0app-release.apk"
if %ERRORLEVEL% neq 0 (
    echo Failed to copy APK to root directory.
    exit /b %ERRORLEVEL%
)

echo ===================================================
echo BUILD SUCCESSFUL!
echo APK location: %~dp0app-release.apk
echo ===================================================
pause
