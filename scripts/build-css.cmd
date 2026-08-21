@echo off
setlocal EnableExtensions
cd /d "%~dp0\.."
npx --yes tailwindcss@3.4.17 -i ./css-src/input.css -o ./css-src/utilities.css --minify
powershell -NoProfile -Command "Get-Content -Raw css-src\site.css, css-src\utilities.css | Set-Content -NoNewline static\css\app.css"
