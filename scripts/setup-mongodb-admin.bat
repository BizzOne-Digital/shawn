@echo off
title Let's Go Buffalo - MongoDB Setup
echo.
echo ============================================
echo   MongoDB Replica Set Setup (REQUIRED)
echo ============================================
echo.
echo This must run as Administrator.
echo Right-click this file -^> Run as administrator
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0enable-mongodb-replica.ps1"

echo.
pause
