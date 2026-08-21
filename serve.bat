@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Zola serve

set "ZOLA=binaries\zola.exe"
set "ZOLA_VERSION=0.23.4"
set "ZOLA_ZIP=https://github.com/getzola/zola/releases/download/v%ZOLA_VERSION%/zola-v%ZOLA_VERSION%-x86_64-pc-windows-msvc.zip"

if not exist "%ZOLA%" (
  echo Downloading Zola %ZOLA_VERSION%...
  mkdir binaries 2>nul
  curl -fL -o binaries\zola.zip "%ZOLA_ZIP%"
  if errorlevel 1 (
    echo Failed to download Zola.
    goto :keepopen
  )
  tar -xf binaries\zola.zip -C binaries
  del binaries\zola.zip
  if not exist "%ZOLA%" (
    echo Download succeeded but binaries\zola.exe was not found.
    goto :keepopen
  )
)

echo Starting Zola...
echo.
"%ZOLA%" serve %*

:keepopen
echo.
pause
