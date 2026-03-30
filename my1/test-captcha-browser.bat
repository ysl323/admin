@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     浏览器验证码测试                                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 这个脚本将:
echo   1. 打开测试页面
echo   2. 自动运行验证码测试
echo   3. 显示测试结果
echo.
echo ════════════════════════════════════════════════════════
echo.

echo [1/2] 检查服务器状态...
echo.

REM 检查后端
curl -s http://localhost:3000/api/captcha >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 后端服务器未运行 (端口 3000)
    echo.
    echo 请先运行: start-all.bat
    echo.
    pause
    exit /b 1
)
echo ✅ 后端服务器正常 (端口 3000)

REM 检查前端
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 前端服务器未运行 (端口 5173)
    echo.
    echo 请先运行: start-all.bat
    echo.
    pause
    exit /b 1
)
echo ✅ 前端服务器正常 (端口 5173)
echo.

echo [2/2] 打开测试页面...
echo.
start http://localhost:5173/test-captcha-frontend.html
echo ✅ 已打开测试页面
echo.

echo ════════════════════════════════════════════════════════
echo.
echo 📋 测试说明:
echo.
echo 测试页面将自动运行3个测试:
echo   1. 直接访问后端API (localhost:3000)
echo   2. 通过前端代理访问 (localhost:5173)
echo   3. 模拟注册页面请求
echo.
echo 如果所有测试都显示 ✅ 成功，说明验证码功能正常
echo 如果有测试失败，请查看错误信息
echo.
echo 然后访问注册页面测试: http://localhost:5173/register
echo.
pause
