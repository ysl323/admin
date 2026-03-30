@echo off
chcp 65001 >nul
echo ========================================
echo 简单导出功能测试
echo ========================================
echo.

cd backend
node simple-export-test.js
cd ..

echo.
pause
