@echo off
REM Build script for CRM Webinar & Training Application (Windows)
REM This script builds executable packages for macOS and Windows

echo ==================================
echo CRM Application Build Script
echo ==================================
echo.

REM Check if node and npm are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not installed
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo [OK] npm is installed
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Failed to install dependencies
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Clean previous builds
echo Cleaning previous builds...
if exist dist rmdir /s /q dist
echo [OK] Clean complete
echo.

REM Build for Windows
echo ==================================
echo Building for Windows...
echo ==================================
call npm run build:win

if %errorlevel% equ 0 (
    echo [OK] Windows build completed successfully
    echo.
    echo Output files in dist folder:
    dir /s /b dist\*.exe
) else (
    echo [FAILED] Windows build failed
)

echo.

REM Build for macOS (if running on macOS or Linux with Wine)
echo ==================================
echo Building for macOS...
echo ==================================
call npm run build:mac

if %errorlevel% equ 0 (
    echo [OK] macOS build completed successfully
    echo.
    echo Output files in dist folder:
    dir /s /b dist\*.dmg dist\*.zip
) else (
    echo [WARNING] macOS build failed (normal on Windows without additional tools)
)

echo.
echo ==================================
echo Build Summary
echo ==================================
echo.

if exist dist (
    echo All build artifacts are in the 'dist' folder:
    dir dist
    echo.
    echo [OK] Build process completed!
    echo.
    echo Installation packages:
    echo   macOS: dist\*.dmg (drag to Applications folder)
    echo   Windows: dist\*.exe (run installer)
) else (
    echo No build artifacts found
)

echo.
pause
