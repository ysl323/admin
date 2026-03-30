@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     验证码问题诊断                                      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1/4] 检查后端服务器状态...
echo.
curl -s http://localhost:3000/api/captcha >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 后端服务器未运行或验证码接口无法访问
    echo.
    echo 请先启动后端服务器:
    echo   cd my1\backend
    echo   npm start
    echo.
    echo 或运行:
    echo   cd my1
    echo   .\start-all.bat
    echo.
    pause
    exit /b 1
)
echo ✅ 后端服务器正在运行
echo.

echo [2/4] 测试验证码API...
echo.
curl -s http://localhost:3000/api/captcha
echo.
echo.

echo [3/4] 检查前端服务器状态...
echo.
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 前端服务器未运行
    echo.
    echo 请启动前端服务器:
    echo   cd my1\frontend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)
echo ✅ 前端服务器正在运行
echo.

echo [4/4] 检查浏览器控制台...
echo.
echo 请打开浏览器开发者工具 (F12)
echo 查看 Console 和 Network 标签页
echo 看是否有错误信息
echo.
echo 常见问题:
echo   1. CORS 错误 - 后端需要配置 CORS
echo   2. 网络错误 - 检查后端是否在 3000 端口运行
echo   3. 路径错误 - 确认 API 路径是 /api/captcha
echo.

pause
