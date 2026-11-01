@echo off
title Remotion AutoStudio - AI Video Publisher
color 0A
cd /d "%~dp0"

echo ===================================================================
echo            REMOTION AUTO VIDEO PUBLISHER STUDIO
echo ===================================================================
echo.

:: Tambahkan nodejs ke sesi path saat ini jika belum terdeteksi
if exist "C:\Program Files\nodejs" (
    set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"
)

:: Cek apakah node modules sudah diinstall
if not exist "node_modules" (
    echo [INFO] Menyiapkan dependensi proyek untuk pertama kali (npm install)...
    echo       (Harap tunggu sebentar...)
    call npm install
)

echo [INFO] Membuka browser dashboard di http://localhost:3000 ...
start http://localhost:3000

echo [INFO] Menjalankan server aplikasi video...
call npm start

pause
