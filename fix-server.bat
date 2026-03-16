@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Server Fix Execution
echo ========================================
echo.

echo Step 1: Checking PM2 status...
ssh root@47.97.185.117 "pm2 list"
echo.

echo Step 2: Checking backend logs...
ssh root@47.97.185.117 "pm2 logs my1-backend --lines 20 --nostream"
echo.

echo Step 3: Checking Nginx...
ssh root@47.97.185.117 "systemctl status nginx | head -10"
echo.

echo Step 4: Checking ports...
ssh root@47.97.185.117 "netstat -tlnp | grep -E ':(3000|80) ' || echo Ports not found"
echo.

echo Step 5: Checking frontend...
ssh root@47.97.185.117 "ls -lh /var/www/html/learning/index.html 2>/dev/null || echo Frontend not found"
echo.

echo Step 6: Executing fixes...
ssh root@47.97.185.117 "cd /root/my1-english-learning/backend && pm2 restart my1-backend && pm2 save"
ssh root@47.97.185.117 "systemctl start nginx && systemctl reload nginx"
echo.

echo Waiting...
timeout /t 3 /nobreak >nul

echo Step 7: Final check...
ssh root@47.97.185.117 "pm2 list | grep my1-backend"
echo.

echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Test: http://47.97.185.117
echo Admin: http://47.97.185.117/admin
echo.
