@echo off
chcp 65001 >nul
cls
echo ========================================
echo Export Feature Deployment
echo ========================================
echo.

echo Please follow these steps to deploy:
echo.
echo 1. Download WinSCP from: https://winscp.net/eng/download.php
echo.
echo 2. Connect to server:
echo    Host: 47.97.185.117
echo    User: root
echo    Pass: MyEnglish2025!
echo.
echo 3. Upload these files:
echo.
echo    Frontend:
echo    e:\demo\my1\my1\frontend\dist\* 
echo      -^> /var/www/html/learning/
echo.
echo    Backend:
echo    e:\demo\my1\my1\backend\src\services\AdminService.js
echo      -^> /root/english-learning/backend/src/services/
echo.
echo    e:\demo\my1\my1\backend\src\routes\admin.js
echo      -^> /root/english-learning/backend/src/routes/
echo.
echo 4. In WinSCP terminal, run:
echo.
echo    cd /root/english-learning/backend
echo    pm2 restart english-learning-backend
echo    pm2 status
echo    rm -rf /var/cache/nginx/*
echo    systemctl reload nginx
echo.
echo 5. Verify at: http://47.97.185.117/admin
echo.
echo ========================================
echo Checking files...
echo ========================================
echo.

if exist "e:\demo\my1\my1\frontend\dist\index.html" (
    echo [OK] frontend\dist\index.html
) else (
    echo [MISSING] frontend\dist\index.html
)

if exist "e:\demo\my1\my1\backend\src\services\AdminService.js" (
    echo [OK] backend\src\services\AdminService.js
) else (
    echo [MISSING] backend\src\services\AdminService.js
)

if exist "e:\demo\my1\my1\backend\src\routes\admin.js" (
    echo [OK] backend\src\routes\admin.js
) else (
    echo [MISSING] backend\src\routes\admin.js
)

echo.
echo ========================================
echo Press any key to open detailed guide...
echo ========================================
pause >nul
start "" "e:\demo\my1\deploy-instructions.txt"
