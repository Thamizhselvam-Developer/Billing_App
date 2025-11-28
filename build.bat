@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM -------------------------------
REM 1️⃣ Check for keytool
REM -------------------------------
keytool -help >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: keytool not found! Make sure JDK is installed and PATH includes JDK bin.
    pause
    exit /b 1
)

REM -------------------------------
REM 2️⃣ Set keystore info
REM -------------------------------
SET KEYSTORE_NAME=my-release-key.keystore
SET KEY_ALIAS=my-key-alias
SET KEY_PASSWORD=@@@Selva
SET STORE_PASSWORD=@@@Selva

REM -------------------------------
REM 3️⃣ Generate keystore if not exist
REM -------------------------------
IF NOT EXIST "android\app\%KEYSTORE_NAME%" (
    echo Generating release keystore...
    keytool -genkeypair -v ^
    -keystore android\app\%KEYSTORE_NAME% ^
    -alias %KEY_ALIAS% ^
    -keyalg RSA ^
    -keysize 2048 ^
    -validity 10000 ^
    -storepass %STORE_PASSWORD% ^
    -keypass %KEY_PASSWORD% ^
    -dname "CN=YourName, OU=Dev, O=Company, L=City, S=State, C=US"
) ELSE (
    echo Keystore already exists.
)

REM -------------------------------
REM 4️⃣ Bundle JS & Assets
REM -------------------------------
echo Bundling JS...
npx react-native bundle ^
  --platform android ^
  --dev false ^
  --entry-file index.js ^
  --bundle-output android\app\src\main\assets\index.android.bundle ^
  --assets-dest android\app\src\main\res

IF %ERRORLEVEL% NEQ 0 (
    echo Bundling failed!
    pause
    exit /b 1
)

REM -------------------------------
REM 5️⃣ Build release APK
REM -------------------------------
cd android
gradlew assembleRelease

IF %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b 1
)
cd ..

REM -------------------------------
REM 6️⃣ Done
REM -------------------------------
echo Release APK is ready at:
echo android\app\build\outputs\apk\release\app-release.apk
pause
