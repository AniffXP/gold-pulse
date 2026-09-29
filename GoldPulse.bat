@echo off
title Gold Pulse Dashboard - XAUUSD (React)
color 0E

echo.
echo  ============================================
echo       GOLD PULSE DASHBOARD - XAUUSD
echo       Vite + React Edition
echo  ============================================
echo.
echo  [*] Menjalankan Vite dev server...
echo.

cd /d "d:\Data\Hanif\Coding\TRADING VIEW"

:: Buka browser setelah 3 detik (biar Vite siap)
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: Jalankan Vite dev server
npx vite --port 3000

:: Kalau server berhenti
echo.
echo  [!] Server berhenti.
pause
