@echo off
setlocal
set FSD_DIR=%~dp0..\..\wwwroot\document\FSD\FalconWebPortal
cd /d "%FSD_DIR%"

echo ===================================================
echo FSD Web Portal Falcon FPRS - Full Pipeline
echo ===================================================
echo.

echo [1/2] Capturing screenshots...
py capture_web_portal_screenshots.py
if %ERRORLEVEL% neq 0 (
    echo ERROR: Screenshot capture failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Building DOCX...
py build_fsd_web_portal.py
if %ERRORLEVEL% neq 0 (
    echo ERROR: DOCX build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo SELESAI
echo Output: Prototype\Document\{timestamp}_FSD_AKS_MAN_POWER_GT_WEB.docx
echo ===================================================
pause
