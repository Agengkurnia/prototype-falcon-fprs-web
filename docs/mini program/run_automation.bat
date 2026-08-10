@echo off
title Jalankan Automation Project Management Kalbe
cd /d "%~dp0"
echo ========================================================
echo   MENJALANKAN SCRIPT OTOMATISASI PROJECT MANAGEMENT
echo ========================================================
echo.

py -3 automation_script.py
if %errorlevel% equ 0 goto :end

python automation_script.py
if %errorlevel% equ 0 goto :end

echo.
echo [ERROR] Terjadi masalah saat menjalankan script Python.
echo Pastikan package sudah terinstall dengan menjalankan di terminal:
echo   pip install -r requirements.txt
echo   playwright install
echo.

:end
pause
