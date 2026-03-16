@echo off
chcp 65001 >nul
echo ========================================
echo 服务器完整状态检查
echo ========================================
echo.

echo [1/6] PM2服务状态...
ssh root@47.97.185.117 "pm2 list"
echo.

echo [2/6] 后端最新日志...
ssh root@47.97.185.117 "pm2 logs my1-backend --lines 30 --nostream"
echo.

echo [3/6] Nginx状态...
ssh root@47.97.185.117 "systemctl status nginx | head -10"
echo.

echo [4/6] 端口监听情况...
ssh root@47.97.185.117 "netstat -tlnp | grep -E ':(3000|80) ' || echo 端口未监听"
echo.

echo [5/6] Node进程...
ssh root@47.97.185.117 "ps aux | grep node | grep -v grep || echo 无Node进程"
echo.

echo [6/6] 前端文件检查...
ssh root@47.97.185.117 "ls -lh /var/www/html/learning/ 2>/dev/null | head -15 || echo 前端目录不存在"
echo.

echo ========================================
echo 检查完成
echo ========================================
echo.
pause
