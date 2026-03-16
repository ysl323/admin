@echo off
chcp 65001 >nul
title Deploy Export Feature
cls

echo ========================================
echo Deploy Export Feature
echo ========================================
echo.
echo Connecting to server...
echo Please do not close this window...
echo.

cd /d e:\demo\my1

echo [1/5] Backup existing code...
ssh root@47.97.185.117 "cd /root/my1-english-learning && mkdir -p backup-$(date +%Y%m%d) && cp backend/src/services/AdminService.js backup-$(date +%Y%m%d)/ && cp backend/src/routes/admin.js backup-$(date +%Y%m%d)/"
echo.

echo [2/5] Upload and update AdminService.js...
scp e:\demo\my1\server-side-update.sh root@47.97.185.117:/tmp/update.sh
ssh root@47.97.185.117 "chmod +x /tmp/update.sh && /tmp/update.sh"
echo.

echo [3/5] Restart service...
ssh root@47.97.185.117 "cd /root/my1-english-learning/backend && pm2 restart my1-backend && pm2 save"
timeout /t 3 /nobreak >nul
echo.

echo [4/5] Verify deployment...
ssh root@47.97.185.117 "pm2 list | grep my1-backend"
echo.

echo [5/5] Test export API...
curl -s http://47.97.185.117/api/admin/export/all | head -c 200
echo.
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Test URLs:
echo   - Home: http://47.97.185.117
echo   - Admin: http://47.97.185.117/admin
echo.
echo Login to admin:
echo   Username: admin
echo   Password: admin123
echo.
echo Then go to Content Management and test Export button.
echo.
echo Press any key to exit...
pause >nul
