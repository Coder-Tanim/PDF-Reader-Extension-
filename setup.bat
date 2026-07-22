@echo off
REM ═══════════════════════════════════════════════════════════
REM  setup.bat – Downloads PDF.js and pdf-lib for the extension
REM  Run this once before loading the extension in Chrome.
REM ═══════════════════════════════════════════════════════════

echo.
echo  PDFZero - Dependency Setup
echo  =================================
echo.

cd /d "%~dp0"

if not exist "lib" mkdir lib

echo [1/3] Downloading pdf.min.mjs (PDF.js core) ...
curl -L -o "lib\pdf.min.mjs" "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.min.mjs"
if %ERRORLEVEL% neq 0 (
    echo  ERROR: Failed to download pdf.min.mjs
    echo  Try: https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.min.mjs
)

echo [2/3] Downloading pdf.worker.min.mjs (PDF.js worker) ...
curl -L -o "lib\pdf.worker.min.mjs" "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs"
if %ERRORLEVEL% neq 0 (
    echo  ERROR: Failed to download pdf.worker.min.mjs
    echo  Try: https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs
)

echo [3/3] Downloading pdf-lib.min.js (for export operations) ...
curl -L -o "lib\pdf-lib.min.js" "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"
if %ERRORLEVEL% neq 0 (
    echo  ERROR: Failed to download pdf-lib.min.js
    echo  Try: https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js
)

echo.
echo ========================================
echo  Checking downloaded files...
echo ========================================
if exist "lib\pdf.min.mjs"            (echo  [OK] pdf.min.mjs)            else (echo  [MISSING] pdf.min.mjs)
if exist "lib\pdf.worker.min.mjs"     (echo  [OK] pdf.worker.min.mjs)     else (echo  [MISSING] pdf.worker.min.mjs)
if exist "lib\pdf-lib.min.js"         (echo  [OK] pdf-lib.min.js)         else (echo  [MISSING] pdf-lib.min.js)

echo.
echo ========================================
echo  Setup complete!
echo.
echo  To load the extension in Chrome/Edge:
echo  1. Open chrome://extensions (or edge://extensions)
echo  2. Enable "Developer mode" (top right)
echo  3. Click "Load unpacked"
echo  4. Select this folder:
echo     %~dp0
echo.
echo  For local file access, also enable:
echo  "Allow access to file URLs" in the extension details.
echo ========================================
echo.
pause
