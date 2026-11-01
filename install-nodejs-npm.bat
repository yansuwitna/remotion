@echo off
title Installer Otomatis Node.js dan NPM untuk Windows
color 0B
cls
echo ===================================================================
echo     INSTALLER & KONFIGURASI OTOMATIS NODE.JS DAN NPM DI CMD
echo ===================================================================
echo.

:: 1. Cek apakah nodejs sudah ada di C:\Program Files\nodejs
if exist "C:\Program Files\nodejs\node.exe" (
    echo [INFO] Node.js sudah ditemukan di "C:\Program Files\nodejs".
    goto :daftarkan_path
)

echo [1/3] Mengunduh installer resmi Node.js LTS (64-bit)...
set "MSI_URL=https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi"
set "MSI_FILE=%TEMP%\node-setup.msi"

:: Download menggunakan curl bawaan Windows
curl.exe -L --progress-bar -o "%MSI_FILE%" "%MSI_URL%"

if not exist "%MSI_FILE%" (
    echo [INFO] Mencoba unduh alternatif dengan PowerShell...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%MSI_URL%' -OutFile '%MSI_FILE%'"
)

if not exist "%MSI_FILE%" (
    echo.
    echo [GAGAL] Gagal mengunduh file installer.
    echo Silakan unduh manual di: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo [2/3] Memasang Node.js & NPM ke sistem Windows...
echo       (Harap tunggu beberapa detik hingga proses selesai...)
msiexec.exe /i "%MSI_FILE%" /passive

:daftarkan_path
echo.
echo [3/3] Memperbarui PATH Environment Windows agar bisa dijalankan di CMD...
setx PATH "%PATH%;C:\Program Files\nodejs;%APPDATA%\npm" >nul 2>nul
set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"

echo.
echo ===================================================================
echo                     HASIL PEMERIKSAAN
echo ===================================================================

if exist "C:\Program Files\nodejs\node.exe" (
    echo Node.js Berhasil Terpasang! Versi:
    "C:\Program Files\nodejs\node.exe" -v
    echo.
    echo NPM Berhasil Terpasang! Versi:
    call "C:\Program Files\nodejs\npm.cmd" -v
    echo.
    echo ===================================================================
    echo   SUKSES! Anda sekarang bisa menjalankan 'node' dan 'npm' di CMD.
    echo ===================================================================
    echo.
    echo Tips: Tutup CMD yang lama dan buka CMD baru agar perubahan aktif.
    echo.
    set /p RUN_NOW="Apakah ingin langsung install dependensi dan jalankan aplikasi video? (Y/N): "
    if /i "%RUN_NOW%"=="Y" (
        cd /d "%~dp0"
        echo.
        echo [INFO] Mengunduh modul dependensi (npm install)...
        call "C:\Program Files\nodejs\npm.cmd" install
        echo.
        echo [INFO] Menjalankan server otomatisasi video...
        start http://localhost:3000
        call "C:\Program Files\nodejs\npm.cmd" start
    )
) else (
    echo [PERHATIAN] Instalasi selesai namun memerlukan konfirmasi restart CMD.
    echo Silakan tutup jendela ini dan buka kembali Command Prompt (CMD).
)

echo.
pause
