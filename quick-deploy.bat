@echo off
echo ========================================
echo Quick Deploy Export Feature
echo ========================================
echo.
echo Opening SSH connection to server...
echo Please paste the commands when connected.
echo.
echo 1. SSH will open in new window
echo 2. Login if prompted
echo 3. Copy and paste commands from: e:\demo\my1\copy-paste-deploy.txt
echo.
pause

start ssh root@47.97.185.117

timeout /t 2 /nobreak >nul

echo.
echo SSH window opened. Please paste the deployment commands.
echo Commands are in: e:\demo\my1\copy-paste-deploy.txt
echo.
pause
