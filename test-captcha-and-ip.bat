@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 测试验证码和IP记录功能
echo ========================================
echo.

cd backend
node test-captcha-and-ip.js

echo.
echo 测试完成！
echo.
pause
