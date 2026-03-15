@echo off
chcp 65001 >nul
echo ========================================
echo 测试验证码注册功能
echo ========================================
echo.

echo 1. 获取验证码...
curl -s http://localhost:3000/api/captcha
echo.
echo.

echo 2. 测试注册（需要手动输入验证码ID和答案）
echo 请先运行上面的命令获取验证码，然后手动测试
echo.

pause
