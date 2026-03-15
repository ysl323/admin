@echo off
setlocal enabledelayedexpansion

set SERVER=root@47.97.185.117
set APP_PATH=/root/my1-english-learning

echo ========================================
echo Deploying Export Feature to Server
echo ========================================

echo.
echo [Step 1/4] Uploading update script...
scp.exe update-script.b64 %SERVER%:/tmp/update-script.b64
if errorlevel 1 (
    echo ERROR: Failed to upload script
    pause
    exit /b 1
)
echo OK: Script uploaded

echo.
echo [Step 2/4] Decoding and executing on server...
ssh.exe %SERVER% "cd %APP_PATH% && echo 'Backup existing files...' && mkdir -p backup-$(date +%%Y%%m%%d) && cp backend/src/services/AdminService.js backup-$(date +%%Y%%m%%d)/ 2>/dev/null && cp backend/src/routes/admin.js backup-$(date +%%Y%%m%%d)/ 2>/dev/null"

echo.
echo [Step 3/4] Applying updates...
ssh.exe %SERVER% "cat /tmp/update-script.b64 | base64 -d | bash"

if errorlevel 1 (
    echo ERROR: Failed to execute update
    pause
    exit /b 1
)
echo OK: Updates applied

echo.
echo [Step 4/4] Restarting service...
ssh.exe %SERVER% "cd %APP_PATH%/backend && pm2 restart my1-backend"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Frontend: http://47.97.185.117
echo Admin: http://47.97.185.117/admin
echo.
echo Test the export feature:
echo 1. Visit http://47.97.185.117/admin
echo 2. Login with admin / admin123
echo 3. Go to Content Management
echo 4. Click 'Export All Courses'
echo.
pause
