@echo off
chcp 65001 >nul
echo ========================================
echo 立即重启后端服务
echo ========================================
echo.

cd backend

echo 正在停止后端服务...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 正在启动后端服务...
start "后端服务" cmd /k "npm start"

echo.
echo ========================================
echo 后端服务已重启
echo ========================================
echo.
echo 请等待几秒钟让服务完全启动...
timeout /t 5 /nobreak >nul

echo.
echo 现在可以刷新浏览器测试了
echo.
pause
