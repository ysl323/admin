@echo off
echo ========================================
echo 重启后端服务
echo ========================================
echo.

cd backend

echo 停止现有进程...
taskkill /F /IM node.exe 2>nul

echo 等待2秒...
timeout /t 2 /nobreak >nul

echo 启动后端服务...
start "Backend Server" cmd /k "npm start"

echo.
echo ========================================
echo 后端服务已重启
echo ========================================
echo.
echo 请等待5-10秒让服务完全启动
echo 然后刷新浏览器页面 (Ctrl+Shift+R)
echo.
pause
