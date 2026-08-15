@echo off
echo ========================================================
echo Starting AI Crop Doctor Flutter App
echo ========================================================

:: Force the exact Flutter path first to avoid conflicts with standalone Dart SDKs
set FLUTTER_DIR=C:\Program Files\flutter_windows_3.47.0-stable\flutter\bin
set PATH=%FLUTTER_DIR%;%PATH%

cd "%~dp0ai_crop_doctor_flutter"

echo.
echo Running flutter pub get...
call "%FLUTTER_DIR%\flutter.bat" pub get

echo.
echo Running flutter doctor to check setup...
call "%FLUTTER_DIR%\flutter.bat" doctor

echo.
echo Launching application...
call "%FLUTTER_DIR%\flutter.bat" run

pause
