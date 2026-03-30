@echo off
echo ========================================
echo 测试音频缓存 API
echo ========================================
echo.
echo 确保后端服务正在运行（端口 3000）
echo.
pause

cd backend
node test-audio-cache-api.js

echo.
echo ========================================
echo 测试完成！
echo ========================================
pause
