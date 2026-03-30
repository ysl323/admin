@echo off
echo ========================================
echo 重启后端服务
echo ========================================
echo.

echo 正在停止后端服务...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq 后端服务*" 2>nul

echo.
echo 等待3秒...
timeout /t 3 /nobreak >nul

echo.
echo 正在启动后端服务...
cd backend
start "后端服务" cmd /k "npm start"

echo.
echo ========================================
echo 后端服务已重启
echo ========================================
echo.
echo 请等待几秒钟让服务完全启动...
echo 然后刷新浏览器测试功能
echo.

pause
