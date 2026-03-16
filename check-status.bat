@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Server Status Check
echo ========================================
echo.

echo Checking PM2 status...
ssh root@47.97.185.117 "pm2 status"
echo.

echo Checking PM2 logs...
ssh root@47.97.185.117 "pm2 logs english-learning-backend --lines 20 --nostream"
echo.

echo Checking Nginx status...
ssh root@47.97.185.117 "systemctl status nginx | head -5"
echo.

echo Checking ports...
ssh root@47.97.185.117 "netstat -tlnp | grep -E ':(3000|80) ' || echo Ports not found"
echo.

echo Checking Node process...
ssh root@47.97.185.117 "ps aux | grep node | grep -v grep || echo No Node process found"
echo.

echo ========================================
echo Check Complete
echo ========================================
pause
